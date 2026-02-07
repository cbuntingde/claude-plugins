#!/usr/bin/env node
/**
 * API Documentation Generator Plugin
 * Generates comprehensive API documentation from source code and OpenAPI specifications
 */

const path = require('path');
const { fileURLToPath } = require('url');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

module.exports = {
  name: 'api-doc-generator',
  version: '1.0.0',
  description: 'Generate API documentation from source code and OpenAPI specifications',
  commands: {
    'generate-api-docs': {
      handler: path.join(__dirname, 'scripts', 'generate-api-docs.js'),
      description: 'Generate API documentation from source code'
    },
    'annotate-code': {
      handler: path.join(__dirname, 'scripts', 'annotate-code.js'),
      description: 'Add documentation annotations to source code'
    },
    'update-docs': {
      handler: path.join(__dirname, 'scripts', 'update-docs.js'),
      description: 'Update existing API documentation'
    }
  }
};