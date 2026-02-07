#!/usr/bin/env node
/**
 * Auto QA Hook
 * Automatically runs QA checks after certain operations
 */

const fs = require('fs');
const path = require('path');

// Get the plugin root from environment
const rootDir = process.env.CLAUDE_PLUGIN_ROOT;

if (!rootDir) {
  console.error('Error: CLAUDE_PLUGIN_ROOT not set');
  process.exit(1);
}

const qaIndex = path.join(rootDir, 'index.js');

if (!fs.existsSync(qaIndex)) {
  console.error(`Error: QA assistant not found at ${qaIndex}`);
  process.exit(1);
}

console.log('🔍 Running post-operation QA checks...\n');

try {
  // Require and run QA Assistant
  const QAAssistant = require(qaIndex);

  // Find the actual project root (where package.json exists)
  let projectRoot = rootDir;
  const maxDepth = 50;
  let depth = 0;
  let foundPackageJson = false;
  while (depth < maxDepth && !foundPackageJson) {
    if (fs.existsSync(path.join(projectRoot, 'package.json'))) {
      foundPackageJson = true;
    } else {
      projectRoot = path.dirname(projectRoot);
    }
    depth++;
  }

  // If no package.json found, use plugin directory as root
  if (!foundPackageJson) {
    projectRoot = rootDir;
  }

  process.chdir(projectRoot);
  process.env.CLAUDE_PLUGIN_ROOT = rootDir;

  const assistant = new QAAssistant(projectRoot);

  const result = assistant.runChecks({
    projectRoot: projectRoot,
    thorough: true
  });

  if (!result.passed) {
    console.log('\n⚠️  QA Checks Completed with Issues');
    console.log('   Review the output above for details.');
  }

  process.exit(result.passed ? 0 : 1);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}