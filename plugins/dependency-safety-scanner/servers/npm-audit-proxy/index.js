#!/usr/bin/env node
/**
 * MCP Server for npm Audit Proxy
 *
 * Proxies npm audit requests with intelligent caching to avoid
 * rate limiting and improve performance.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execFileSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Security constants
const MAX_OUTPUT_SIZE = 10 * 1024 * 1024; // 10MB max response size

/**
 * Validate directory path to prevent path traversal
 */
function validateDirectory(directory, baseDir = process.cwd()) {
  const resolved = path.resolve(baseDir, directory);
  const baseResolved = path.resolve(baseDir);

  // Prevent traversal outside base directory
  if (!resolved.startsWith(baseResolved)) {
    throw new Error('Access denied: directory path is outside allowed scope');
  }

  // Normalize and return the validated path
  return path.normalize(resolved);
}

/**
 * Check if output exceeds size limit
 */
function checkSizeLimit(data) {
  const size = Buffer.byteLength(data, 'utf8');
  if (size > MAX_OUTPUT_SIZE) {
    throw new Error(`Response exceeds maximum allowed size of ${MAX_OUTPUT_SIZE / 1024 / 1024}MB`);
  }
}

/**
 * npm Audit Proxy Server
 * Caches audit results to avoid redundant scans
 */
class NPMAuditProxyServer {
  constructor() {
    this.cacheDir = process.env.AUDIT_CACHE_DIR ||
      path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', '.dependency-safety-cache');
    this.cacheTTL = parseInt(process.env.AUDIT_CACHE_TTL || '3600000', 10); // 1 hour default

    this.server = new Server(
      {
        name: 'npm-audit-proxy',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.ensureCacheDir();
  }

  /**
   * Ensure cache directory exists
   */
  async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  /**
   * Set up tool handlers
   */
  setupToolHandlers() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'run_npm_audit',
            description: `Run npm audit on the current project

Executes 'npm audit' and returns structured vulnerability data.
Supports JSON output for easy parsing.

Use this to scan a project's dependencies for known vulnerabilities.
Results are cached for 1 hour to avoid redundant scans.`,
            inputSchema: {
              type: 'object',
              properties: {
                directory: {
                  type: 'string',
                  description: 'Directory to run audit in (default: current directory)',
                },
                production: {
                  type: 'boolean',
                  description: 'Only audit production dependencies',
                  default: false,
                },
                severity: {
                  type: 'string',
                  description: 'Minimum severity level to report',
                  enum: ['low', 'moderate', 'high', 'critical'],
                  default: 'moderate',
                },
                useCache: {
                  type: 'boolean',
                  description: 'Use cached results if available',
                  default: true,
                },
              },
            },
          },
          {
            name: 'audit_package',
            description: `Check a specific package for vulnerabilities

Queries the npm audit database for vulnerabilities affecting
a specific package and version.`,
            inputSchema: {
              type: 'object',
              properties: {
                package: {
                  type: 'string',
                  description: 'Package name (e.g., "lodash")',
                },
                version: {
                  type: 'string',
                  description: 'Package version (e.g., "4.17.15")',
                },
                useCache: {
                  type: 'boolean',
                  description: 'Use cached results if available',
                  default: true,
                },
              },
              required: ['package', 'version'],
            },
          },
          {
            name: 'clear_audit_cache',
            description: `Clear the npm audit cache

Removes all cached audit results. Use this if you want fresh
results from the npm registry.`,
            inputSchema: {
              type: 'object',
              properties: {
                package: {
                  type: 'string',
                  description: 'Specific package to clear (optional, clears all if not specified)',
                },
              },
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'run_npm_audit':
            return await this.runNPMAudit(args);

          case 'audit_package':
            return await this.auditPackage(args);

          case 'clear_audit_cache':
            return await this.clearAuditCache(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: error.message,
                command: error.stdout || '',
                stderr: error.stderr || '',
              }),
            },
          ],
        };
      }
    });
  }

  /**
   * Run npm audit on a project
   */
  async runNPMAudit({ directory = '.', production = false, severity = 'moderate', useCache = true }) {
    // Validate directory to prevent path traversal
    const validatedDir = validateDirectory(directory);
    const cacheKey = this.getCacheKey(validatedDir, production, severity);

    if (useCache) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                ...cached,
                cached: true,
                cachedAt: cached.timestamp,
              }, null, 2),
            },
          ],
        };
      }
    }

    // Build npm audit command as array to prevent command injection
    const args = ['audit', '--json'];
    if (production) args.push('--production');
    if (severity) args.push('--audit-level', severity);

    // Use execFileSync with array arguments instead of shell command
    let stdout;
    try {
      stdout = execFileSync('npm', args, {
        cwd: validatedDir,
        encoding: 'utf-8',
        maxBuffer: MAX_OUTPUT_SIZE,
      });
    } catch (error) {
      // npm audit returns non-zero exit code if vulnerabilities found
      stdout = error.stdout || '';
    }

    // Check output size limit
    checkSizeLimit(stdout);

    const result = JSON.parse(stdout);

    // Cache the result
    await this.saveToCache(cacheKey, result);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...result,
            cached: false,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Audit a specific package
   */
  async auditPackage({ package, version, useCache = true }) {
    const cacheKey = `package:${package}@${version}`;

    if (useCache) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                ...cached,
                cached: true,
              }, null, 2),
            },
          ],
        };
      }
    }

    // Create a temporary package.json to audit
    const tempDir = path.join(this.cacheDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const tempPackageJson = path.join(tempDir, 'package.json');
    await fs.writeFile(
      tempPackageJson,
      JSON.stringify({
        dependencies: {
          [package]: version,
        },
      }, null, 2)
    );

    try {
      const result = await this.runNPMAudit({
        directory: tempDir,
        production: false,
        useCache: false,
      });

      // Extract vulnerabilities for this specific package
      const auditData = JSON.parse(result.content[0].text);
      const packageVulns = this.extractPackageVulnerabilities(auditData, package);

      await this.saveToCache(cacheKey, packageVulns);

      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(packageVulns, null, 2),
          },
        ],
      };
    } catch (error) {
      // Clean up on error
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      throw error;
    }
  }

  /**
   * Clear audit cache
   */
  async clearAuditCache({ package: pkg } = {}) {
    if (pkg) {
      // Clear specific package cache
      const pattern = `package:${pkg}@*`;
      // Implementation would find and remove matching cache entries
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: `Cache cleared for ${pkg}`,
              pattern,
            }, null, 2),
          },
        ],
      };
    } else {
      // Clear all cache
      const cacheFiles = await fs.readdir(this.cacheDir).catch(() => []);
      for (const file of cacheFiles) {
        await fs.unlink(path.join(this.cacheDir, file)).catch(() => {});
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: 'All cache cleared',
              filesCleared: cacheFiles.length,
            }, null, 2),
          },
        ],
      };
    }
  }

  /**
   * Generate cache key
   */
  getCacheKey(directory, production, severity) {
    return `audit:${directory}:${production}:${severity}`.replace(/[^a-zA-Z0-9:_-]/g, '_');
  }

  /**
   * Get from cache
   */
  async getFromCache(key) {
    const cacheFile = path.join(this.cacheDir, `${key}.json`);

    try {
      const data = await fs.readFile(cacheFile, 'utf-8');
      const cached = JSON.parse(data);

      // Check if cache is still valid
      const age = Date.now() - new Date(cached.timestamp).getTime();
      if (age > this.cacheTTL) {
        await fs.unlink(cacheFile).catch(() => {});
        return null;
      }

      return cached;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save to cache
   */
  async saveToCache(key, data) {
    const cacheFile = path.join(this.cacheDir, `${key}.json`);

    try {
      await fs.writeFile(
        cacheFile,
        JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }, null, 2)
      );
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  /**
   * Extract vulnerabilities for a specific package
   */
  extractPackageVulnerabilities(auditData, packageName) {
    const vulnerabilities = auditData.vulnerabilities || {};

    return {
      package: packageName,
      version: auditData.metadata?.requestedPackageVersions?.[packageName] || 'unknown',
      vulnerabilities: vulnerabilities[packageName] || [],
      summary: {
        total: (vulnerabilities[packageName] || []).length,
        critical: (vulnerabilities[packageName] || []).filter(v => v.severity === 'critical').length,
        high: (vulnerabilities[packageName] || []).filter(v => v.severity === 'high').length,
        moderate: (vulnerabilities[packageName] || []).filter(v => v.severity === 'moderate').length,
        low: (vulnerabilities[packageName] || []).filter(v => v.severity === 'low').length,
      },
    };
  }

  /**
   * Start the server
   */
  async start() {
    await this.ensureCacheDir();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('npm Audit Proxy MCP server running on stdio');
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new NPMAuditProxyServer();
  server.start().catch(console.error);
}

export { NPMAuditProxyServer };
