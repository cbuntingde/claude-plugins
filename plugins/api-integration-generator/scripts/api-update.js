#!/usr/bin/env node
/**
 * API Client Updater
 * Updates existing API clients when specifications change
 */

const fs = require('fs');
const path = require('path');

/**
 * API Client Updater
 */
class ApiClientUpdater {
  constructor() {
    this.strategies = ['merge', 'recreate', 'diff'];
    this.defaultStrategy = 'merge';
  }

  /**
   * Update an existing client
   */
  async update(clientPath, options = {}) {
    const strategy = options.strategy || this.defaultStrategy;
    const newSpec = options.source ? await this.fetchSpec(options.source) : null;

    if (!fs.existsSync(clientPath)) {
      throw new Error(`Client directory not found: ${clientPath}`);
    }

    // Read existing spec if available
    let existingSpec = null;
    const specPath = path.join(clientPath, 'openapi.json');
    if (fs.existsSync(specPath)) {
      existingSpec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
    }

    if (!existingSpec && !newSpec) {
      throw new Error('No specification found. Use --source to provide a new spec.');
    }

    const spec = newSpec || existingSpec;

    // Get changes
    const changes = existingSpec ? await this.detectChanges(existingSpec, spec) : { added: [], removed: [], modified: [] };

    switch (strategy) {
      case 'diff':
        return this.showDiff(changes);
      case 'recreate':
        return await this.recreateClient(clientPath, spec, changes);
      case 'merge':
      default:
        return await this.mergeClient(clientPath, spec, changes);
    }
  }

  /**
   * Detect changes between two specifications
   */
  async detectChanges(oldSpec, newSpec) {
    const oldEndpoints = this.extractEndpoints(oldSpec);
    const newEndpoints = this.extractEndpoints(newSpec);

    const changes = { added: [], removed: [], modified: [] };

    // Find added
    for (const ep of newEndpoints) {
      if (!oldEndpoints.some(old => old.method === ep.method && old.path === ep.path)) {
        changes.added.push(ep);
      }
    }

    // Find removed
    for (const ep of oldEndpoints) {
      if (!newEndpoints.some(newEp => newEp.method === ep.method && newEp.path === ep.path)) {
        changes.removed.push(ep);
      }
    }

    return changes;
  }

  /**
   * Extract endpoints from spec
   */
  extractEndpoints(spec) {
    const endpoints = [];
    for (const [apiPath, pathObj] of Object.entries(spec.paths || {})) {
      for (const [method, operation] of Object.entries(pathObj)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          endpoints.push({
            method: method.toUpperCase(),
            path: apiPath,
            operationId: operation.operationId,
            summary: operation.summary
          });
        }
      }
    }
    return endpoints;
  }

  /**
   * Show diff of changes
   */
  showDiff(changes) {
    console.log('\nAPI Changes Detected:\n');
    console.log('='.repeat(50));

    if (changes.added.length > 0) {
      console.log('\nAdded Endpoints:');
      for (const ep of changes.added) {
        console.log(`  + ${ep.method} ${ep.path}`);
      }
    }

    if (changes.removed.length > 0) {
      console.log('\nRemoved Endpoints:');
      for (const ep of changes.removed) {
        console.log(`  - ${ep.method} ${ep.path}`);
      }
    }

    if (changes.modified.length > 0) {
      console.log('\nModified Endpoints:');
      for (const ep of changes.modified) {
        console.log(`  ~ ${ep.method} ${ep.path}`);
      }
    }

    if (changes.added.length === 0 && changes.removed.length === 0 && changes.modified.length === 0) {
      console.log('\nNo changes detected.');
    }

    console.log('='.repeat(50));
    return changes;
  }

  /**
   * Merge changes into existing client
   */
  async mergeClient(clientPath, spec, changes) {
    // Update spec file
    const specPath = path.join(clientPath, 'openapi.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    // Generate migration guide if requested
    if (changes.added.length > 0 || changes.removed.length > 0) {
      await this.generateMigrationGuide(clientPath, spec, changes);
    }

    return {
      strategy: 'merge',
      changes,
      specUpdated: true,
      message: `Updated client with ${changes.added.length} additions, ${changes.removed.length} removals`
    };
  }

  /**
   * Recreate client from scratch
   */
  async recreateClient(clientPath, spec, changes) {
    const backupPath = `${clientPath}.backup.${Date.now()}`;
    fs.renameSync(clientPath, backupPath);

    // Generate new client using generator
    const generator = require('./api-gen');
    const clientName = path.basename(clientPath);
    const result = await generator.ApiClientGenerator.prototype.generate(spec, clientPath, clientName);

    return {
      strategy: 'recreate',
      changes,
      backupPath,
      message: `Recreated client from ${result.dir}, backup at ${backupPath}`
    };
  }

  /**
   * Generate migration guide
   */
  async generateMigrationGuide(clientPath, spec, changes) {
    const guidePath = path.join(clientPath, 'MIGRATION.md');

    let content = `# API Migration Guide\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;

    if (changes.added.length > 0) {
      content += `## Added Endpoints\n\n`;
      for (const ep of changes.added) {
        content += `### ${ep.method} ${ep.path}\n`;
        content += `${ep.summary || 'New endpoint added'}\n\n`;
      }
    }

    if (changes.removed.length > 0) {
      content += `## Removed Endpoints\n\n`;
      for (const ep of changes.removed) {
        content += `- ${ep.method} ${ep.path}\n`;
      }
      content += `\nThese endpoints are no longer available. Update your code accordingly.\n\n`;
    }

    content += `## Breaking Changes\n\n`;
    content += `Review the new OpenAPI specification for detailed changes.\n`;

    fs.writeFileSync(guidePath, content);
  }

  /**
   * Fetch specification
   */
  async fetchSpec(urlOrPath) {
    try {
      if (urlOrPath.startsWith('http')) {
        const https = require('https');
        return new Promise((resolve, reject) => {
          https.get(urlOrPath, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
          }).on('error', reject);
        });
      }
      const content = await fs.promises.readFile(urlOrPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to fetch spec: ${error.message}`);
    }
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const updater = new ApiClientUpdater();

  let clientPath = null;
  let options = { source: null, strategy: 'merge', migrationGuide: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--source' || arg === '-s') {
      options.source = args[++i];
    } else if (arg === '--strategy' || arg === '-t') {
      options.strategy = args[++i];
    } else if (arg === '--migration-guide') {
      options.migrationGuide = true;
    } else if (!arg.startsWith('--')) {
      clientPath = arg;
    }
  }

  if (!clientPath) {
    console.log('Usage: node api-update.js <client-path> [--source <spec>] [--strategy <merge|recreate|diff>]');
    console.log('');
    console.log('Options:');
    console.log('  --source, -s      New specification URL or path');
    console.log('  --strategy, -t    Update strategy (merge, recreate, diff)');
    console.log('  --migration-guide Generate migration guide');
    console.log('');
    console.log('Examples:');
    console.log('  node api-update.js ./api-clients/petstore');
    console.log('  node api-update.js ./api-clients/petstore -s https://api.example.com/v2/openapi.json -t diff');
    process.exit(1);
  }

  try {
    const result = await updater.update(clientPath, options);
    console.log(`\n${result.message}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ApiClientUpdater;