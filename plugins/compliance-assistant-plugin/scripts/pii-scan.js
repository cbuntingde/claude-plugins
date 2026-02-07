#!/usr/bin/env node
/**
 * PII Scan Command Script
 * Detects Personally Identifiable Information in codebase
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
let scanPath = '.';
let categories = null;
let severity = 'medium';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--path' && i + 1 < args.length) {
    scanPath = args[i + 1];
    i++;
  } else if (arg === '--categories' && i + 1 < args.length) {
    categories = args[i + 1].split(',');
    i++;
  } else if (arg === '--severity' && i + 1 < args.length) {
    severity = args[i + 1];
    i++;
  } else if (!arg.startsWith('--')) {
    scanPath = arg;
  }
}

console.log('Scanning for PII...');
console.log('Path:', scanPath);
console.log('');

if (categories) {
  console.log('Categories:', categories.join(', '));
}
console.log('Severity threshold:', severity);
console.log('');
console.log('Note: This scan uses pattern matching and may produce false positives.');
console.log('      Always verify findings before taking action.');
console.log('');

// Run the PII scan
const result = plugin.piiScan({
  path: scanPath,
  categories: categories,
  severity: severity
});

console.log(result.text);

if (result.findings && result.findings.length > 0) {
  console.log('');
  console.log('Action items for confirmed PII:');
  console.log('  1. Remove the data from the file or move to environment variables');
  console.log('  2. Rotate any exposed credentials or API keys');
  console.log('  3. Update .gitignore to prevent future commits of sensitive data');
  console.log('  4. Consider using git filter-branch or BFG Repo-Cleaner for history cleanup');
}

process.exit(result.success ? 0 : 1);