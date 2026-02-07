#!/usr/bin/env node
/**
 * API Integration Generator Plugin
 * Generates fully-typed API client code from OpenAPI specifications
 */

const path = require('path');
const { fileURLToPath } = require('url');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

module.exports = {
  name: 'api-integration-generator',
  version: '1.0.0',
  description: 'Generate fully-typed API client code from OpenAPI specifications',
  commands: {
    'api-gen': {
      handler: path.join(__dirname, 'scripts', 'api-gen.js'),
      description: 'Generate API client from OpenAPI specification'
    },
    'api-update': {
      handler: path.join(__dirname, 'scripts', 'api-update.js'),
      description: 'Update existing API client with new specification'
    }
  }
};