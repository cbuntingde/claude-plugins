/**
 * Claude Code Circular Dependency Detector Plugin
 *
 * This plugin provides tools for detecting, analyzing, and visualizing
 * circular dependencies in TypeScript/JavaScript projects.
 */

import { DependencyAnalyzer } from './src/dependency-analyzer.js';

export { DependencyAnalyzer };

export const name = 'claude-code-circular-deps-plugin';
export const version = '1.0.0';

export const commands = {
  'detect-circular': {
    description: 'Detect circular dependencies in a project',
    parameters: {
      directory: {
        type: 'string',
        description: 'The root directory to scan',
      },
      filePattern: {
        type: 'string',
        description: 'File pattern to match',
        default: '**/*.{ts,tsx,js,jsx}',
      },
      excludePatterns: {
        type: 'array',
        description: 'Patterns to exclude',
        default: ['node_modules', 'dist', 'build'],
      },
    },
  },
  'fix-circular': {
    description: 'Analyze and suggest fixes for circular dependencies',
    parameters: {
      directory: {
        type: 'string',
        description: 'The root directory to analyze',
      },
    },
  },
  'visualize-deps': {
    description: 'Export dependency graph for visualization',
    parameters: {
      directory: {
        type: 'string',
        description: 'The root directory to analyze',
      },
      format: {
        type: 'string',
        description: 'Output format (json, dot, mermaid)',
        default: 'json',
      },
    },
  },
  'monitor-deps': {
    description: 'Monitor for new circular dependencies',
    parameters: {
      directory: {
        type: 'string',
        description: 'The root directory to monitor',
      },
      watch: {
        type: 'boolean',
        description: 'Watch for changes',
        default: true,
      },
    },
  },
};

export default {
  name,
  version,
  commands,
};