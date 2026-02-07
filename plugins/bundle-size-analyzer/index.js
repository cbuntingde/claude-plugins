/**
 * Bundle Size Analyzer Plugin
 * 
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * Bundle size analysis and tree-shaking detection plugin
 * MIT License
 */

'use strict';

/**
 * Plugin entry point that registers commands, agents, and hooks with Claude Code.
 * @param {Object} claude - The Claude Code API interface
 */
function plugin(claude) {
  // Register commands
  claude.registerCommand({
    name: 'analyze-bundle',
    description: 'Analyze bundle sizes and composition',
    handler: async (args) => {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        const result = await execAsync(`node ${__dirname}/scripts/analyze-bundle.js ${args.join(' ')}`);
        return result.stdout;
      } catch (error) {
        return `Error analyzing bundle: ${error.message}`;
      }
    }
  });

  claude.registerCommand({
    name: 'tree-shake',
    description: 'Find and remove unused code',
    handler: async (args) => {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        const result = await execAsync(`node ${__dirname}/scripts/tree-shake.js ${args.join(' ')}`);
        return result.stdout;
      } catch (error) {
        return `Error performing tree-shake analysis: ${error.message}`;
      }
    }
  });

  claude.registerCommand({
    name: 'compare-bundles',
    description: 'Compare bundle sizes across builds',
    handler: async (args) => {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        const result = await execAsync(`node ${__dirname}/scripts/compare-bundles.js ${args.join(' ')}`);
        return result.stdout;
      } catch (error) {
        return `Error comparing bundles: ${error.message}`;
      }
    }
  });

  claude.registerCommand({
    name: 'export-report',
    description: 'Generate detailed analysis reports',
    handler: async (args) => {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        const result = await execAsync(`node ${__dirname}/scripts/export-report.js ${args.join(' ')}`);
        return result.stdout;
      } catch (error) {
        return `Error exporting report: ${error.message}`;
      }
    }
  });

  return {
    name: 'bundle-size-analyzer',
    version: '1.0.0'
  };
}

module.exports = plugin;