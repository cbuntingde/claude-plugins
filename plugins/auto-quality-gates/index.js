#!/usr/bin/env node
/**
 * Auto Quality Gates Plugin
 * Automated testing and quality gates configuration framework
 */

const path = require('path');
const { fileURLToPath } = require('url');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

module.exports = {
  name: 'auto-quality-gates',
  version: '1.0.0',
  description: 'Automated testing and quality gates configuration framework for CI/CD pipelines',
  commands: {
    'configure-quality-gates': {
      handler: path.join(__dirname, 'scripts', 'configure-quality-gates.js'),
      description: 'Configure quality gate thresholds and rules'
    },
    'generate-test-config': {
      handler: path.join(__dirname, 'scripts', 'generate-test-config.js'),
      description: 'Generate test configuration for CI/CD'
    },
    'help-commands': {
      handler: path.join(__dirname, 'scripts', 'help-commands.js'),
      description: 'Display available testing commands and their usage'
    },
    'run-quality-check': {
      handler: path.join(__dirname, 'scripts', 'run-quality-check.js'),
      description: 'Execute all quality gate checks'
    },
    'setup-testing': {
      handler: path.join(__dirname, 'scripts', 'setup-testing.js'),
      description: 'Set up testing framework for project'
    }
  }
};