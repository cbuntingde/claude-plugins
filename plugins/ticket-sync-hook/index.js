/**
 * Ticket Sync Hook Plugin
 *
 * Automatically updates Jira/Linear tickets based on git commit activity.
 * This plugin provides commands and git hooks for syncing ticket updates.
 */

const path = require('path');
const { execSync } = require('child_process');

module.exports = {
  name: 'ticket-sync-hook',
  version: '1.0.0',
  description: 'Automatically update Jira/Linear tickets based on git commit activity',

  /**
   * Plugin initialization
   */
  initialize: async function() {
    // Plugin initialization
  },

  /**
   * Plugin cleanup
   */
  cleanup: async function() {
    // No resources to clean up
  },

  /**
   * Plugin commands
   */
  commands: {
    /**
     * Sync tickets command
     * Manually triggers ticket sync for the latest commit
     */
    'ticket-sync sync': async function() {
      const syncScriptPath = path.join(__dirname, 'scripts', 'sync-tickets.js');

      try {
        const output = execSync(`node "${syncScriptPath}"`, {
          encoding: 'utf-8',
          stdio: 'inherit'
        });

        return {
          success: true,
          output: output || 'Ticket sync completed'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Ticket sync failed'
        };
      }
    }
  }
};
