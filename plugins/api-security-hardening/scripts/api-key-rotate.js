#!/usr/bin/env node
/**
 * API Key Rotation Script
 * Generates, rotates, and manages API keys securely
 */

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * Generate cryptographically secure API key
 */
function generateApiKey(params = {}) {
  const keyLength = params.keyLength || 32;
  const prefix = params.prefix || '';

  // Generate random bytes
  const randomBytes = crypto.randomBytes(keyLength);

  // Convert to base64-like format (URL-safe)
  const key = randomBytes
    .toString('base64')
    .replace(/\+/g, '')
    .replace(/\//g, '')
    .replace(/=/g, '')
    .substring(0, keyLength * 1.5);

  return prefix ? `${prefix}_${key}` : key;
}

/**
 * Generate multiple API keys
 */
function generateApiKeys(params = {}) {
  const count = params.count || 1;
  const keys = [];

  for (let i = 0; i < count; i++) {
    keys.push({
      keyId: `${params.prefix || 'key'}_${Date.now()}_${i}`,
      key: generateApiKey(params),
      createdAt: new Date().toISOString(),
      version: 1
    });
  }

  return keys;
}

/**
 * API key validation middleware
 */
function generateApiKeyValidation(params = {}) {
  const framework = params.framework || 'express';

  const generators = {
    express: generateExpressApiKey,
    fastify: generateFastifyApiKey,
    nestjs: generateNestJsApiKey,
    koa: generateKoaApiKey
  };

  const generator = generators[framework] || generators.express;
  return generator();
}

/**
 * Express API key validation
 */
function generateExpressApiKey() {
  return `// API Key Validation Middleware for Express
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

/**
 * API key storage (in production, use database or secret manager)
 */
const apiKeys = new Map();

/**
 * Hash API key for storage (never store plaintext keys)
 */
function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Verify API key
 */
function verifyApiKey(key) {
  const hashedKey = hashApiKey(key);
  const keyData = apiKeys.get(hashedKey);

  if (!keyData) {
    return null;
  }

  // Check if key is active
  if (!keyData.active) {
    return null;
  }

  // Check if key is expired
  if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
    return null;
  }

  return keyData;
}

/**
 * API key validation middleware
 */
function apiKeyValidation(options = {}) {
  const headerName = options.headerName || 'x-api-key';
  const scopes = options.scopes || [];

  return (req, res, next) => {
    const apiKey = req.headers[headerName.toLowerCase()];

    if (!apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required'
      });
    }

    const keyData = verifyApiKey(apiKey);

    if (!keyData) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or inactive API key'
      });
    }

    // Check scopes if required
    if (scopes.length > 0) {
      const hasRequiredScope = scopes.some(scope => keyData.scopes?.includes(scope));

      if (!hasRequiredScope) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'API key does not have required scope'
        });
      }
    }

    // Track API key usage
    keyData.lastUsedAt = new Date().toISOString();
    keyData.usageCount = (keyData.usageCount || 0) + 1;

    // Attach key data to request
    req.apiKey = {
      keyId: keyData.keyId,
      scopes: keyData.scopes,
      metadata: keyData.metadata
    };

    next();
  };
}

/**
 * Rate limiting per API key
 */
function createApiKeyRateLimit(options = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute
  const maxRequests = options.maxRequests || 100;

  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => {
      // Use API key ID for rate limiting
      return req.apiKey?.keyId || req.ip;
    },
    message: {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded for this API key'
    }
  });
}

/**
 * Generate new API key
 */
function createApiKey(options = {}) {
  const prefix = options.prefix || 'sk';
  const keyLength = options.keyLength || 32;
  const scopes = options.scopes || ['read'];
  const metadata = options.metadata || {};
  const expiresIn = options.expiresIn;

  // Generate key
  const key = generateApiKey({ prefix, keyLength });
  const hashedKey = hashApiKey(key);
  const keyId = `${prefix}_${Date.now()}`;

  const keyData = {
    keyId,
    hashedKey,
    scopes,
    metadata,
    active: true,
    createdAt: new Date().toISOString(),
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn).toISOString() : null,
    lastUsedAt: null,
    usageCount: 0,
    version: 1
  };

  // Store hashed key
  apiKeys.set(hashedKey, keyData);

  return {
    keyId,
    key, // Only return full key on creation
    scopes,
    createdAt: keyData.createdAt,
    expiresAt: keyData.expiresAt
  };
}

/**
 * Rotate API key
 */
function rotateApiKey(keyId, options = {}) {
  // Find existing key
  let existingKeyData = null;
  let existingHash = null;

  for (const [hash, data] of apiKeys.entries()) {
    if (data.keyId === keyId) {
      existingKeyData = data;
      existingHash = hash;
      break;
    }
  }

  if (!existingKeyData) {
    throw new Error('API key not found');
  }

  // Generate new key
  const newKeyData = createApiKey({
    prefix: options.prefix || existingKeyData.keyId.split('_')[0],
    keyLength: options.keyLength || 32,
    scopes: existingKeyData.scopes,
    metadata: existingKeyData.metadata
  });

  // Deactivate old key
  existingKeyData.active = false;
  existingKeyData.rotatedAt = new Date().toISOString();
  existingKeyData.replacedByKeyId = newKeyData.keyId;
  newKeyData.previousKeyId = keyId;

  return {
    oldKeyId: keyId,
    ...newKeyData
  };
}

/**
 * Revoke API key
 */
function revokeApiKey(keyId) {
  for (const [hash, data] of apiKeys.entries()) {
    if (data.keyId === keyId) {
      data.active = false;
      data.revokedAt = new Date().toISOString();
      return true;
    }
  }
  return false;
}

// Apply API key validation
app.use('/api', apiKeyValidation({ scopes: ['read', 'write'] }));
app.use('/api', createApiKeyRateLimit());

// API key management endpoints (admin only)
app.post('/admin/api-keys', (req, res) => {
  const apiKey = createApiKey({
    prefix: req.body.prefix || 'sk',
    scopes: req.body.scopes || ['read'],
    metadata: req.body.metadata,
    expiresIn: req.body.expiresIn
  });

  res.status(201).json({
    success: true,
    ...apiKey
  });
});

app.post('/admin/api-keys/:keyId/rotate', (req, res) => {
  try {
    const rotated = rotateApiKey(req.params.keyId, req.body);
    res.json({
      success: true,
      ...rotated
    });
  } catch (error) {
    res.status(404).json({
      error: 'Not Found',
      message: error.message
    });
  }
});

app.delete('/admin/api-keys/:keyId', (req, res) => {
  const revoked = revokeApiKey(req.params.keyId);

  if (!revoked) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'API key not found'
    });
  }

  res.json({
    success: true,
    message: 'API key revoked successfully'
  });
});
`;
}

/**
 * Fastify API key validation
 */
function generateFastifyApiKey() {
  return `// API Key Validation for Fastify
const crypto = require('crypto');

// API key storage
const apiKeys = new Map();

function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

async function apiKeyValidation(fastify, options) {
  fastify.addHook('onRequest', async (request, reply) => {
    // Skip validation for public routes
    if (request.routerPath.startsWith('/public')) {
      return;
    }

    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'API key is required'
      });
    }

    const hashedKey = hashApiKey(apiKey);
    const keyData = apiKeys.get(hashedKey);

    if (!keyData || !keyData.active) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid API key'
      });
    }

    request.apiKey = keyData;
  });
}

// Register plugin
await fastify.register(apiKeyValidation);
`;
}

/**
 * NestJS API key validation
 */
function generateNestJsApiKey() {
  return `// API Key Validation for NestJS
import { Injectable, UnauthorizedException, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  private readonly apiKeys = new Map<string, any>();

  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  createApiKey(options: { prefix?: string; scopes?: string[]; metadata?: any }) {
    const prefix = options.prefix || 'sk';
    const keyId = \`\${prefix}_\${Date.now()}\`;
    const key = crypto.randomBytes(32).toString('base64').slice(0, 48);
    const hashedKey = this.hashApiKey(key);

    const keyData = {
      keyId,
      hashedKey,
      scopes: options.scopes || ['read'],
      metadata: options.metadata || {},
      active: true,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    this.apiKeys.set(hashedKey, keyData);

    return { keyId, key, ...keyData };
  }

  verifyApiKey(key: string) {
    const hashedKey = this.hashApiKey(key);
    return this.apiKeys.get(hashedKey);
  }

  rotateApiKey(keyId: string) {
    for (const [hash, data] of this.apiKeys.entries()) {
      if (data.keyId === keyId) {
        data.active = false;
        return this.createApiKey({
          prefix: data.keyId.split('_')[0],
          scopes: data.scopes,
          metadata: data.metadata
        });
      }
    }
    throw new UnauthorizedException('API key not found');
  }
}

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private apiKeyService: ApiKeyService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const keyData = this.apiKeyService.verifyApiKey(apiKey);

    if (!keyData || !keyData.active) {
      throw new UnauthorizedException('Invalid API key');
    }

    req['apiKey'] = keyData;
    next();
  }
}
`;
}

/**
 * Koa API key validation
 */
function generateKoaApiKey() {
  return `// API Key Validation for Koa
const crypto = require('crypto');

const apiKeys = new Map();

function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

async function apiKeyMiddleware(ctx, next) {
  // Skip public routes
  if (ctx.path.startsWith('/public')) {
    return next();
  }

  const apiKey = ctx.get('x-api-key');

  if (!apiKey) {
    ctx.status = 401;
    ctx.body = {
      error: 'Unauthorized',
      message: 'API key is required'
    };
    return;
  }

  const hashedKey = hashApiKey(apiKey);
  const keyData = apiKeys.get(hashedKey);

  if (!keyData || !keyData.active) {
    ctx.status = 401;
    ctx.body = {
      error: 'Unauthorized',
      message: 'Invalid API key'
    };
    return;
  }

  ctx.state.apiKey = keyData;
  return next();
}

app.use(apiKeyMiddleware);
`;
}

/**
 * Validate API key implementation
 */
function validateApiKeyImplementation(scanPath = '.') {
  const findings = [];
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.env'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build']);

  // API key vulnerability patterns
  const apiKeyPatterns = [
    {
      type: 'Hardcoded API Key',
      pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/gi,
      severity: 'critical',
      fix: 'Move API key to environment variable or secret manager.'
    },
    {
      type: 'Hardcoded API Secret',
      pattern: /api[_-]?secret\s*[:=]\s*['"][^'"]{20,}['"]/gi,
      severity: 'critical',
      fix: 'Move API secret to environment variable or secret manager.'
    },
    {
      type: 'Hardcoded Bearer Token',
      pattern: /bearer[_-]?token\s*[:=]\s*['"][^'"]{30,}['"]/gi,
      severity: 'critical',
      fix: 'Move bearer token to secure storage.'
    },
    {
      type: 'Weak API Key Length',
      pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{1,15}['"]/gi,
      severity: 'medium',
      fix: 'Use minimum 32-byte (256-bit) API keys for sufficient entropy.'
    },
    {
      type: 'API Key in URL',
      pattern: /(query|params|url)\.(.*api.*key|.*token)/gi,
      severity: 'high',
      fix: 'Pass API keys in headers, not in URLs.'
    },
    {
      type: 'Logging API Key',
      pattern: /console\.(log|debug|info|warn|error)\s*\([^)]*api.*key|[^)]*token[^)]*\)/gi,
      severity: 'high',
      fix: 'Never log API keys or tokens.'
    }
  ];

  function scanDirectory(dir, baseFindings = []) {
    if (!fs.existsSync(dir)) {
      return baseFindings;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!skipDirs.has(item)) {
          scanDirectory(fullPath, baseFindings);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (scanExtensions.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
              for (const vuln of apiKeyPatterns) {
                const matches = lines[i].match(vuln.pattern);

                if (matches) {
                  for (const match of matches) {
                    baseFindings.push({
                      file: fullPath,
                      line: i + 1,
                      type: vuln.type,
                      severity: vuln.severity,
                      code: lines[i].trim().substring(0, 100),
                      fix: vuln.fix
                    });
                  }
                }
              }
            }
          } catch (error) {
            // Skip unreadable files
          }
        }
      }
    }

    return baseFindings;
  }

  const rawFindings = scanDirectory(scanPath);

  const summary = {
    critical: rawFindings.filter(f => f.severity === 'critical').length,
    high: rawFindings.filter(f => f.severity === 'high').length,
    medium: rawFindings.filter(f => f.severity === 'medium').length,
    low: rawFindings.filter(f => f.severity === 'low').length
  };

  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    API KEY SECURITY VALIDATION\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Path: ${scanPath}\n`;
  outputText += `Total findings: ${rawFindings.length}\n`;
  outputText += `  Critical: ${summary.critical}\n`;
  outputText += `  High: ${summary.high}\n`;
  outputText += `  Medium: ${summary.medium}\n`;
  outputText += `  Low: ${summary.low}\n\n`;

  for (const finding of rawFindings) {
    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };

    outputText += `${severityEmoji[finding.severity]} ${finding.severity.toUpperCase()}: ${finding.type}\n`;
    outputText += `   File: ${finding.file}:${finding.line}\n`;
    outputText += `   Code: ${finding.code}\n`;
    outputText += `   Fix: ${finding.fix}\n\n`;
  }

  outputText += '═════════════════════════════════════════════\n';

  return {
    success: true,
    text: outputText,
    summary,
    findings: rawFindings
  };
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--generate') {
      params.action = 'generate';
    } else if (args[i] === '--rotate-all') {
      params.action = 'rotate-all';
    } else if (args[i] === '--key-id' && args[i + 1]) {
      params.keyId = args[++i];
    } else if (args[i] === '--key-length' && args[i + 1]) {
      params.keyLength = parseInt(args[++i]);
    } else if (args[i] === '--prefix' && args[i + 1]) {
      params.prefix = args[++i];
    } else if (args[i] === '--framework' && args[i + 1]) {
      params.framework = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      params.output = args[++i];
    } else if (args[i] === '--validate') {
      params.action = 'validate';
    } else if (args[i] === '--path' && args[i + 1]) {
      params.path = args[++i];
    }
  }

  // Default action
  if (!params.action) {
    params.action = 'generate';
  }

  if (params.action === 'generate') {
    const keys = generateApiKeys(params);
    console.log(JSON.stringify(keys, null, 2));
  } else if (params.action === 'validate') {
    const result = validateApiKeyImplementation(params.path || '.');
    if (params.output) {
      fs.writeFileSync(params.output, result.text, 'utf8');
      console.log(`API key validation written to ${params.output}`);
    } else {
      console.log(result.text);
    }
  } else if (params.action === 'generate-middleware') {
    const middleware = generateApiKeyValidation(params);
    if (params.output) {
      fs.writeFileSync(params.output, middleware, 'utf8');
      console.log(`API key middleware written to ${params.output}`);
    } else {
      console.log(middleware);
    }
  }
}

module.exports = {
  generateApiKey,
  generateApiKeys,
  generateApiKeyValidation,
  validateApiKeyImplementation
};
