#!/usr/bin/env node
/**
 * Decision Tracker Command Script
 * Find and track technical decisions across repositories
 */

const path = require('path');

// Get the plugin root directory
const PLUGIN_ROOT = path.resolve(__dirname, '..');

// Load the plugin
let plugin;
try {
  plugin = require(path.join(PLUGIN_ROOT, 'index.js'));
} catch (error) {
  console.error('Failed to load plugin:', error.message);
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const params = {
  query: null,
  format: 'summary',
  status: 'all'
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--format' && i + 1 < args.length) {
    params.format = args[i + 1];
    i++;
  } else if (arg === '--status' && i + 1 < args.length) {
    params.status = args[i + 1];
    i++;
  } else if (!arg.startsWith('--')) {
    params.query = arg;
  }
}

// Run the decision tracker
const result = plugin.decisionTracker(params);

console.log(result.text);

process.exit(result.success ? 0 : 1);