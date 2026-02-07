#!/usr/bin/env node
/**
 * Auto Documentation Updater Plugin
 * Automatically detects code changes and suggests documentation updates
 */

const path = require('path');
const { fileURLToPath } = require('url');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

module.exports = {
  name: 'auto-doc-updater',
  version: '1.0.0',
  description: 'Automatically detect code changes and suggest documentation updates',
  commands: {
    'auto-update-docs': {
      handler: path.join(__dirname, 'scripts', 'auto-update-docs.js'),
      description: 'Analyze recent changes and suggest documentation updates'
    },
    'sync-docs': {
      handler: path.join(__dirname, 'scripts', 'sync-docs.js'),
      description: 'Sync documentation with code changes'
    },
    'watch-docs': {
      handler: path.join(__dirname, 'scripts', 'watch-docs.js'),
      description: 'Watch for file changes and notify of documentation updates'
    }
  }
};