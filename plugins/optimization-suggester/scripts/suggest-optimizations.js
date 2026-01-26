#!/usr/bin/env node

/**
 * Suggest Optimizations Script
 *
 * This script analyzes code for optimization opportunities.
 */

const path = require('path');
const fs = require('fs');

// Get plugin root directory
const pluginRoot = path.dirname(path.dirname(__dirname));

// Load the plugin module
const plugin = require(path.join(pluginRoot, 'index.js'));

// Get command line arguments (skip first two which are node and script path)
const args = process.argv.slice(2);

// If called directly, execute the command
if (require.main === module) {
  plugin.commands['suggest-optimizations']({ args }).catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = plugin.commands['suggest-optimizations'];