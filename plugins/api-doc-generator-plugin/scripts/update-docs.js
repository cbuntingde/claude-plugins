#!/usr/bin/env node
/**
 * Update API Documentation
 * Updates existing documentation with changes detected in the codebase
 */

const fs = require('fs');
const path = require('path');

/**
 * Documentation Updater
 */
class DocUpdater {
  constructor() {
    this.changePatterns = {
      added: /^\+\s*(@(GET|POST|PUT|PATCH|DELETE)\s*\([^)]+\)|def\s+\w+.*Route|Route\s*\([^)]+\))/gm,
      removed: /^\-\s*(@(GET|POST|PUT|PATCH|DELETE)\s*\([^)]+\)|def\s+\w+.*Route|Route\s*\([^)]+\))/gm,
    };
  }

  /**
   * Compare versions and detect changes
   */
  async detectChanges(oldContent, newContent) {
    const changes = {
      added: [],
      removed: [],
      modified: [],
    };

    // Simple line-by-line comparison
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');

    const oldEndpoints = this.extractEndpoints(oldContent);
    const newEndpoints = this.extractEndpoints(newContent);

    // Find added endpoints
    for (const ep of newEndpoints) {
      const exists = oldEndpoints.some(old =>
        old.method === ep.method && old.path === ep.path
      );
      if (!exists) {
        changes.added.push(ep);
      }
    }

    // Find removed endpoints
    for (const ep of oldEndpoints) {
      const exists = newEndpoints.some(newEp =>
        newEp.method === ep.method && newEp.path === ep.path
      );
      if (!exists) {
        changes.removed.push(ep);
      }
    }

    return changes;
  }

  /**
   * Extract endpoints from source code
   */
  extractEndpoints(content) {
    const endpoints = [];
    const patterns = [
      /@(GET|POST|PUT|PATCH|DELETE)\s*\(\s*['"]([^'"]+)['"]/g,
      /def\s+\w+.*['"]([^'"]+)['"].*:\s*#?\s*(GET|POST|PUT|PATCH|DELETE)/gim,
      /Route\(['"]([^'"]+)['"]\s*,\s*(GET|POST|PUT|PATCH|DELETE)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2] || match[3];
        if (path && !endpoints.some(ep => ep.method === method && ep.path === path)) {
          endpoints.push({ method, path });
        }
      }
    }

    return endpoints;
  }

  /**
   * Update markdown documentation
   */
  updateMarkdown(docPath, changes) {
    return new Promise(async (resolve, reject) => {
      try {
        let content = await fs.promises.readFile(docPath, 'utf-8');

        // Add new endpoints
        for (const ep of changes.added) {
          const section = `\n### ${ep.method} ${ep.path}\n\n- **Status**: New endpoint\n- **Added**: ${new Date().toISOString().split('T')[0]}\n`;
          content += section;
        }

        // Note removed endpoints
        if (changes.removed.length > 0) {
          content += '\n## Deprecated Endpoints\n\n';
          for (const ep of changes.removed) {
            content += `- ~~${ep.method} ${ep.path}~~\n`;
          }
        }

        await fs.promises.writeFile(docPath, content);
        resolve({ added: changes.added.length, removed: changes.removed.length });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Update OpenAPI specification
   */
  updateOpenApi(specPath, changes) {
    return new Promise(async (resolve, reject) => {
      try {
        const content = await fs.promises.readFile(specPath, 'utf-8');
        const spec = JSON.parse(content);

        // Add new endpoints
        for (const ep of changes.added) {
          if (!spec.paths[ep.path]) {
            spec.paths[ep.path] = {};
          }
          spec.paths[ep.path][ep.method.toLowerCase()] = {
            summary: `New ${ep.method} endpoint`,
            description: 'Auto-generated from code changes',
            responses: {
              '200': { description: 'Successful response' },
            },
          };
        }

        // Mark removed endpoints as deprecated
        for (const ep of changes.removed) {
          if (spec.paths[ep.path] && spec.paths[ep.path][ep.method.toLowerCase()]) {
            spec.paths[ep.path][ep.method.toLowerCase()].deprecated = true;
          }
        }

        await fs.promises.writeFile(specPath, JSON.stringify(spec, null, 2));
        resolve({ added: changes.added.length, deprecated: changes.removed.length });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Full update process
   */
  async update(sourcePath, docPath, options = {}) {
    const newContent = await fs.promises.readFile(sourcePath, 'utf-8');

    let oldContent = '';
    try {
      oldContent = await fs.promises.readFile(docPath, 'utf-8');
    } catch {
      // File doesn't exist, will create new
    }

    const changes = await this.detectChanges(oldContent, newContent);

    if (changes.added.length === 0 && changes.removed.length === 0) {
      return { updated: false, message: 'No changes detected' };
    }

    let result;
    if (docPath.endsWith('.json')) {
      result = await this.updateOpenApi(docPath, changes);
    } else {
      result = await this.updateMarkdown(docPath, changes);
    }

    return {
      updated: true,
      ...result,
      changes: {
        added: changes.added.length,
        removed: changes.removed.length,
      },
    };
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const updater = new DocUpdater();

  let sourcePath = null;
  let docPath = 'API.md';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--doc' || arg === '-d') {
      docPath = args[++i] || 'API.md';
    } else if (!arg.startsWith('--')) {
      sourcePath = arg;
    }
  }

  if (!sourcePath) {
    console.log('Usage: node update-docs.js <source> [--doc <documentation>]');
    console.log('');
    console.log('Options:');
    console.log('  --doc, -d  Path to documentation file (default: API.md)');
    console.log('');
    console.log('Examples:');
    console.log('  node update-docs.js src/api.js');
    console.log('  node update-docs.js src/api.js -d docs/API.md');
    process.exit(1);
  }

  try {
    const result = await updater.update(sourcePath, docPath);
    if (result.updated) {
      console.log(`Documentation updated: ${result.changes.added} added, ${result.changes.removed || result.deprecated} deprecated`);
    } else {
      console.log('No changes detected in documentation');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DocUpdater;