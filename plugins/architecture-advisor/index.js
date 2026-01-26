#!/usr/bin/env node
/**
 * Architecture Advisor Plugin
 * Reviews design patterns and suggests improvements
 */

const path = require('path');

// Use __dirname directly for CommonJS module
module.exports = {
  name: 'architecture-advisor',
  version: '1.0.0',
  description: 'Architecture advisor that reviews design patterns and suggests improvements',
  commands: {
    'architecture-review': {
      handler: path.join(__dirname, 'scripts', 'architecture-review.js'),
      description: 'Comprehensive architecture analysis'
    },
    'pattern-suggest': {
      handler: path.join(__dirname, 'scripts', 'pattern-suggest.js'),
      description: 'Get design pattern recommendations'
    }
  }
};