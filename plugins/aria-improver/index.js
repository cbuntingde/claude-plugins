#!/usr/bin/env node
/**
 * ARIA Improver Plugin
 * Suggests ARIA labels and semantic HTML improvements for better accessibility
 */

const path = require('path');
const { fileURLToPath } = require('url');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

module.exports = {
  name: 'aria-improver',
  version: '1.0.0',
  description: 'Suggests ARIA labels and semantic HTML improvements for better accessibility and SEO',
  skills: {
    'aria-accessibility': {
      path: path.join(__dirname, 'skills', 'aria-accessibility', 'SKILL.md'),
      description: 'Analyzes HTML and suggests ARIA labels and semantic improvements'
    }
  }
};