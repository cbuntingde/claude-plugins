#!/usr/bin/env node
/**
 * Help Commands Script
 * Displays available testing commands and their usage information.
 *
 * This script is invoked by the help-commands command to provide
 * users with guidance on available quality gate commands.
 */

const path = require('path');
const fs = require('fs');

/**
 * Retrieves the directory containing this script.
 * @returns {string} The absolute path to the scripts directory.
 */
function getScriptsDir() {
  return path.dirname(fs.realpathSync(__filename));
}

/**
 * Retrieves the plugin root directory.
 * @returns {string} The absolute path to the plugin root.
 */
function getPluginRoot() {
  const scriptsDir = getScriptsDir();
  return path.resolve(scriptsDir, '..');
}

/**
 * Displays the welcome message with testing command hints.
 * @returns {void}
 */
function displayWelcomeMessage() {
  console.log('Welcome to Auto Quality Gates!');
  console.log('Type /help-commands to see available testing commands.');
}

/**
 * Displays help information for all available commands.
 * @returns {void}
 */
function displayHelpCommands() {
  const pluginRoot = getPluginRoot();
  const commandsDir = path.join(pluginRoot, 'commands');

  console.log('\n=== Auto Quality Gates - Available Commands ===\n');

  // List all command markdown files
  const commandFiles = fs.readdirSync(commandsDir)
    .filter(file => file.endsWith('.md'))
    .sort();

  commandFiles.forEach(file => {
    const commandName = file.replace('.md', '').replace(/-/g, ' ');
    console.log(`  /${commandName}`);
  });

  console.log('\n=== Command Details ===\n');

  // Display detailed help for each command
  const commandDetails = [
    {
      name: 'setup-testing',
      description: 'Set up testing infrastructure for the project',
      usage: '/setup-testing',
      options: []
    },
    {
      name: 'configure-quality-gates',
      description: 'Configure quality gate thresholds and rules',
      usage: '/configure-quality-gates',
      options: []
    },
    {
      name: 'generate-test-config',
      description: 'Generate test configuration files',
      usage: '/generate-test-config',
      options: []
    },
    {
      name: 'run-quality-check',
      description: 'Run quality gate checks on the codebase',
      usage: '/run-quality-check',
      options: []
    }
  ];

  commandDetails.forEach(cmd => {
    console.log(`## /${cmd.name}`);
    console.log(`   Description: ${cmd.description}`);
    console.log(`   Usage: ${cmd.usage}`);
    if (cmd.options.length > 0) {
      console.log(`   Options:`);
      cmd.options.forEach(opt => {
        console.log(`     - ${opt}`);
      });
    }
    console.log('');
  });

  console.log('=== Additional Resources ===\n');
  console.log('  - See README.md for detailed documentation');
  console.log('  - Check the skills/ directory for automated testing capabilities');
  console.log('');
}

/**
 * Main entry point for the help-commands script.
 * @returns {void}
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--welcome')) {
    displayWelcomeMessage();
  } else {
    displayHelpCommands();
  }
}

// Execute main function
main();
