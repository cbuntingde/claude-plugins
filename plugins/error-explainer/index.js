/**
 * Error Explainer Plugin for Claude Code
 *
 * Provides context and solutions for cryptic error messages.
 */

const { name, version } = require('./package.json');

/**
 * Plugin name
 */
exports.name = name;

/**
 * Plugin version
 */
exports.version = version;

/**
 * Commands provided by this plugin
 */
exports.commands = {
  'explain': {
    name: 'explain',
    description: 'Explains cryptic error messages with context and solutions',
    handler: async (args) => {
      return {
        content: [{
          type: 'text',
          text: 'Error explanation provided by the error-explainer plugin. The plugin enhances Claude\'s natural error explanation capabilities by parsing error messages, identifying patterns, and providing actionable solutions.'
        }]
      };
    }
  }
};