#!/usr/bin/env node
/**
 * Team Practices Command Script
 * Discover and compare engineering practices across teams
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
  practiceArea: null,
  compare: null,
  format: 'table'
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--compare' && i + 1 < args.length) {
    params.compare = args[i + 1].split(',');
    i++;
  } else if (arg === '--format' && i + 1 < args.length) {
    params.format = args[i + 1];
    i++;
  } else if (!arg.startsWith('--')) {
    params.practiceArea = arg;
  }
}

// Run the team practices analysis
const result = plugin.teamPractices(params);

console.log(result.text);

if (result.success && result.summary && result.summary.teamCount === 0) {
  console.log('\nAvailable practice areas to explore:');
  console.log('  - testing          - Testing strategies and frameworks');
  console.log('  - deployment       - CI/CD and deployment patterns');
  console.log('  - code-review      - Review processes and tools');
  console.log('  - monitoring       - Observability and alerting');
  console.log('  - api-design       - API patterns and conventions');
  console.log('  - security         - Security practices and tooling');
}

process.exit(result.success ? 0 : 1);