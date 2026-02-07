#!/usr/bin/env node

/**
 * Background script to check for API updates
 * Runs on session start to check if API specs have changed
 */

const fs = require('fs').promises;
const path = require('path');

const API_REGISTRY_FILE = path.join(process.env.CLAUDE_PLUGIN_ROOT, '.api-registry.json');
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

async function loadApiRegistry() {
  try {
    const content = await fs.readFile(API_REGISTRY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return { apis: [] };
  }
}

async function saveApiRegistry(registry) {
  await fs.writeFile(API_REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

async function checkApiUpdate(api) {
  const https = require('https');
  const http = require('http');
  const client = api.specUrl.startsWith('https') ? https : http;

  // SECURITY: Validate URL protocol
  if (!api.specUrl.startsWith('http://') && !api.specUrl.startsWith('https://')) {
    return {
      name: api.name,
      hasChanges: false,
      error: 'Invalid URL protocol',
    };
  }

  // SECURITY: Add response size limit (10MB max)
  const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB

  return new Promise((resolve) => {
    const req = client.get(api.specUrl, { timeout: 30000 }, async (res) => {
      const chunks = [];
      let dataLength = 0;

      res.on('data', (chunk) => {
        // SECURITY: Check size limit to prevent DoS
        dataLength += chunk.length;
        if (dataLength > MAX_RESPONSE_SIZE) {
          res.destroy();
          resolve({
            name: api.name,
            hasChanges: false,
            error: 'Response too large (max 10MB)',
          });
          return;
        }
        chunks.push(chunk);
      });

      res.on('end', async () => {
        try {
          const data = Buffer.concat(chunks).toString('utf-8');
          const currentSpec = JSON.parse(data);
          const etag = res.headers['etag'] || '';
          const lastModified = res.headers['last-modified'] || '';

          // Check if spec has changed
          let hasChanges = false;

          if (etag && api.lastEtag && etag !== api.lastEtag) {
            hasChanges = true;
          }

          if (lastModified && api.lastModified && lastModified !== api.lastModified) {
            hasChanges = true;
          }

          if (api.specHash) {
            const crypto = require('crypto');
            const currentHash = crypto.createHash('md5').update(data).digest('hex');
            if (currentHash !== api.specHash) {
              hasChanges = true;
            }
          }

          resolve({
            name: api.name,
            hasChanges,
            currentEtag: etag,
            currentLastModified: lastModified,
            currentSpec,
          });
        } catch (error) {
          resolve({
            name: api.name,
            hasChanges: false,
            error: error.message,
          });
        }
      });
    }).on('error', (error) => {
      resolve({
        name: api.name,
        hasChanges: false,
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: api.name,
        hasChanges: false,
        error: 'Request timeout',
      });
    });
  });
}

async function main() {
  console.error('Checking for API updates...');

  const registry = await loadApiRegistry();
  const updates = [];

  for (const api of registry.apis) {
    if (!api.specUrl) continue;

    // Skip if checked recently
    if (api.lastChecked) {
      const timeSinceLastCheck = Date.now() - new Date(api.lastChecked).getTime();
      if (timeSinceLastCheck < CHECK_INTERVAL) {
        continue;
      }
    }

    const result = await checkApiUpdate(api);
    updates.push(result);

    // Update registry
    api.lastChecked = new Date().toISOString();
    if (result.currentEtag) api.lastEtag = result.currentEtag;
    if (result.currentLastModified) api.lastModified = result.currentLastModified;
  }

  await saveApiRegistry(registry);

  // Report changes
  const changedApis = updates.filter((u) => u.hasChanges);

  if (changedApis.length > 0) {
    console.error(
      `\n🔄 API Updates Detected:\n${changedApis.map((a) => `  - ${a.name}`).join('\n')}`
    );
    console.error('\nRun /api-update <path> to update your clients.\n');
  } else {
    console.error('No API changes detected.');
  }
}

main().catch(console.error);
