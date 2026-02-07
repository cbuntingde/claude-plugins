#!/usr/bin/env node
/**
 * Knowledge Search Command Script
 * Search across repositories, Slack, Jira, and Confluence
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
  sources: 'all',
  team: null,
  days: null
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--sources' && i + 1 < args.length) {
    params.sources = args[i + 1];
    i++;
  } else if (arg === '--team' && i + 1 < args.length) {
    params.team = args[i + 1];
    i++;
  } else if (arg === '--days' && i + 1 < args.length) {
    params.days = parseInt(args[i + 1], 10);
    i++;
  } else if (!arg.startsWith('--')) {
    params.query = arg;
  }
}

// Run the knowledge search
const result = plugin.knowledgeSearch(params);

console.log(result.text);

if (result.summary && result.summary.sources) {
  console.log('\nNote: To enable additional sources, configure:');
  console.log('  - Slack: Set SLACK_TOKEN in .env');
  console.log('  - Jira: Set JIRA_BASE_URL and JIRA_TOKEN in .env');
  console.log('  - Confluence: Set CONFLUENCE_BASE_URL and CONFLUENCE_TOKEN in .env');
  console.log('  - Repositories: Set REPO_PATH values in .env or .cross-repo-knowledge.json');
}

process.exit(result.success ? 0 : 1);