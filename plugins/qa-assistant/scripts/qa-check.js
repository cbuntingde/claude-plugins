#!/usr/bin/env node
/**
* Main QA Check Command - runs all checks
* Windows-compatible version
*/

const { execSync } = require('child_process');
const path = require('path');

// Get the plugin root from environment
const rootDir = process.env.CLAUDE_PLUGIN_ROOT;

if (!rootDir) {
  console.error('Error: CLAUDE_PLUGIN_ROOT not set');
  process.exit(1);
}

const qaIndex = path.join(rootDir);

try {
  // Require and run QA Assistant
  const QAAssistant = require(qaIndex);
  const assistant = new QAAssistant();

  process.chdir(qaIndex);
  process.env.CLAUDE_PLUGIN_ROOT = qaIndex;

  const result = assistant.runChecks();

  process.exit(result.passed ? 0 : 1);
} catch {
  console.error('Error: QA Assistant execution failed');
  process.exit(1);
}