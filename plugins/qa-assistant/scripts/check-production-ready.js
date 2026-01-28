#!/usr/bin/env node
/**
 * Production Ready Check - Command Wrapper
 * Invokes the QA Assistant production readiness validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the plugin root from environment
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

if (!pluginRoot) {
  console.error('Error: CLAUDE_PLUGIN_ROOT not set');
  process.exit(1);
}

// Get the project directory - walk up from system root to find directory with package.json
let projectRoot = process.cwd();
const maxDepth = 50;
let depth = 0;

while (depth < maxDepth && !fs.existsSync(path.join(projectRoot, 'package.json'))) {
  projectRoot = path.dirname(projectRoot);
  depth++;
}

const pluginPath = path.dirname(pluginRoot);
const qaIndex = path.join(pluginPath, 'index.js');

if (!fs.existsSync(qaIndex)) {
  console.error(`Error: QA assistant not found at ${qaIndex}`);
  process.exit(1);
}

try {
  // Require and run QA Assistant
  const QAAssistant = require(qaIndex);
  const assistant = new QAAssistant();

  // Change to plugin directory for proper execution
  process.chdir(qaIndex);
  process.env.CLAUDE_PLUGIN_ROOT = qaIndex;

  const args = process.argv.slice(2);
  const result = assistant.runChecks({
    skip: ['breaking-changes', 'code-quality', 'security']
  });

  process.exit(result.passed ? 0 : 1);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}