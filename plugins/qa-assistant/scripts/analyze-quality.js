#!/usr/bin/env node
/**
 * Analyze Quality - Command Wrapper
 * Invokes the QA Assistant code quality analysis
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the plugin root from environment
const rootDir = process.env.CLAUDE_PLUGIN_ROOT;

if (!rootDir) {
  console.error('Error: CLAUDE_PLUGIN_ROOT not set');
  process.exit(1);
}

// Determine the project directory - start from system root and find node_modules
// This ensures we scan the user's project, not the plugin directory
let projectDir = process.env.PWD || process.cwd();
while (!fs.existsSync(path.join(projectDir, 'package.json')) && projectDir !== path.parse(projectDir).root) {
  projectDir = path.dirname(projectDir);
}

const pluginPath = path.dirname(rootDir);
const qaIndex = path.join(pluginPath, 'index.js');

// Change to plugin directory for proper execution
process.chdir(qaIndex);
process.env.CLAUDE_PLUGIN_ROOT = qaIndex;

if (!fs.existsSync(qaIndex)) {
  console.error(`Error: QA assistant not found at ${qaIndex}`);
  process.exit(1);
}

try {
  // Require and run QA Assistant
  const QAAssistant = require(qaIndex);
  const assistant = new QAAssistant();
  process.chdir(qaIndex);
  process.env.CLAUDE_PLUGIN_ROOT = qaIndex;

  const args = process.argv.slice(2);
  const result = assistant.runChecks({
    skip: ['breaking-changes', 'production-readiness', 'security', 'configuration']
  });

  process.exit(result.passed ? 0 : 1);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}