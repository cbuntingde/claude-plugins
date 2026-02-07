#!/usr/bin/env node

/**
 * Ticket Sync Hook
 * Syncs Jira/Linear tickets based on git commit activity
 */

const path = require('path');
const { execSync } = require('child_process');

const CommitParser = require('./utils/commit-parser');
const JiraClient = require('./utils/jira-client');
const LinearClient = require('./utils/linear-client');

/**
 * Logger utility
 */
class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
  }

  info(message, data = null) {
    console.log(`[INFO] ${message}`);
    if (data && this.verbose) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  warn(message, data = null) {
    console.warn(`[WARN] ${message}`);
    if (data && this.verbose) {
      console.warn(JSON.stringify(data, null, 2));
    }
  }

  error(message, error = null) {
    console.error(`[ERROR] ${message}`);
    if (error && this.verbose) {
      console.error(error.stack || error.message || error);
    }
  }

  success(message, data = null) {
    console.log(`[SUCCESS] ${message}`);
    if (data && this.verbose) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

/**
 * Configuration loader
 */
class ConfigLoader {
  constructor() {
    this.config = {
      jira: {
        enabled: process.env.JIRA_ENABLED === 'true',
        baseUrl: process.env.JIRA_BASE_URL,
        email: process.env.JIRA_EMAIL,
        apiToken: process.env.JIRA_API_TOKEN,
        updateStatus: process.env.JIRA_UPDATE_STATUS === 'true',
        defaultStatus: process.env.JIRA_DEFAULT_STATUS || 'Done'
      },
      linear: {
        enabled: process.env.LINEAR_ENABLED === 'true',
        apiKey: process.env.LINEAR_API_KEY,
        updateStatus: process.env.LINEAR_UPDATE_STATUS === 'true',
        defaultStatus: process.env.LINEAR_DEFAULT_STATUS || 'Done'
      },
      sync: {
        addComment: process.env.SYNC_ADD_COMMENT !== 'false', // default true
        includeBranchName: process.env.SYNC_INCLUDE_BRANCH_NAME === 'true',
        includeCommitHash: process.env.SYNC_INCLUDE_COMMIT_HASH !== 'false' // default true
      },
      verbose: process.env.TICKET_SYNC_VERBOSE === 'true'
    };
  }

  validate() {
    const errors = [];

    if (this.config.jira.enabled) {
      if (!this.config.jira.baseUrl) {
        errors.push('JIRA_BASE_URL is required when Jira is enabled');
      }
      if (!this.config.jira.email) {
        errors.push('JIRA_EMAIL is required when Jira is enabled');
      }
      if (!this.config.jira.apiToken) {
        errors.push('JIRA_API_TOKEN is required when Jira is enabled');
      }
    }

    if (this.config.linear.enabled) {
      if (!this.config.linear.apiKey) {
        errors.push('LINEAR_API_KEY is required when Linear is enabled');
      }
    }

    if (!this.config.jira.enabled && !this.config.linear.enabled) {
      errors.push('At least one of JIRA_ENABLED or LINEAR_ENABLED must be true');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getConfig() {
    return this.config;
  }
}

/**
 * Ticket Sync Manager
 */
class TicketSyncManager {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.parser = new CommitParser();
    this.jiraClient = null;
    this.linearClient = null;

    // Initialize clients based on config
    if (config.jira.enabled) {
      try {
        this.jiraClient = new JiraClient({
          baseUrl: config.jira.baseUrl,
          email: config.jira.email,
          apiToken: config.jira.apiToken
        });
        this.logger.info('Jira client initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Jira client', error);
        throw error;
      }
    }

    if (config.linear.enabled) {
      try {
        this.linearClient = new LinearClient({
          apiKey: config.linear.apiKey
        });
        this.logger.info('Linear client initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Linear client', error);
        throw error;
      }
    }
  }

  /**
   * Get commit information from git
   * @returns {Object} Commit data
   */
  getCommitInfo() {
    try {
      // Get the latest commit message
      const commitMessage = execSync('git log -1 --pretty=%B', {
        encoding: 'utf-8'
      }).trim();

      // Get commit hash
      const commitHash = execSync('git log -1 --pretty=%H', {
        encoding: 'utf-8'
      }).trim();

      // Get short commit hash
      const shortHash = execSync('git log -1 --pretty=%h', {
        encoding: 'utf-8'
      }).trim();

      // Get branch name
      const branchName = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf-8'
      }).trim();

      // Get author
      const author = execSync('git log -1 --pretty=%an', {
        encoding: 'utf-8'
      }).trim();

      // Get commit date
      const commitDate = execSync('git log -1 --pretty=%ci', {
        encoding: 'utf-8'
      }).trim();

      return {
        message: commitMessage,
        hash: commitHash,
        shortHash,
        branch: branchName,
        author,
        date: commitDate
      };
    } catch (error) {
      this.logger.error('Failed to get commit info from git', error);
      throw new Error('Git command failed. Ensure you are in a git repository.');
    }
  }

  /**
   * Generate comment text from commit data
   * @param {Object} commitData - Commit information
   * @param {Object} parsedCommit - Parsed commit data
   * @returns {string} Formatted comment
   */
  generateComment(commitData, parsedCommit) {
    const lines = [];

    lines.push(`**Git Commit Update**`);
    lines.push('');

    if (this.config.sync.includeCommitHash) {
      lines.push(`**Commit:** \`${commitData.shortHash}\``);
    }

    lines.push(`**Message:** ${parsedCommit.rawMessage.split('\n')[0]}`);

    if (this.config.sync.includeBranchName && commitData.branch) {
      lines.push(`**Branch:** \`${commitData.branch}\``);
    }

    lines.push(`**Author:** ${commitData.author}`);
    lines.push(`**Date:** ${commitData.date}`);

    return lines.join('\n');
  }

  /**
   * Sync tickets to Jira
   * @param {Array} ticketIds - List of Jira ticket IDs
   * @param {Object} updateData - Data to update (comment, status)
   * @returns {Object} Sync results
   */
  async syncToJira(ticketIds, updateData) {
    if (!this.jiraClient) {
      return { skipped: true, reason: 'Jira client not initialized' };
    }

    const results = {
      total: ticketIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      details: []
    };

    for (const ticketId of ticketIds) {
      try {
        // Verify ticket exists
        const exists = await this.jiraClient.verifyTicket(ticketId);
        if (!exists) {
          this.logger.warn(`Jira ticket not found: ${ticketId}`);
          results.failed++;
          results.errors.push(`${ticketId}: Ticket not found`);
          continue;
        }

        // Update ticket
        const updateResult = await this.jiraClient.updateTicket(ticketId, updateData);

        if (updateResult.success) {
          results.successful++;
          results.details.push({
            ticketId,
            success: true,
            commentAdded: !!updateResult.commentResult,
            statusUpdated: !!updateResult.statusResult
          });
          this.logger.success(`Updated Jira ticket: ${ticketId}`);
        } else {
          results.failed++;
          results.errors.push(`${ticketId}: ${updateResult.errors.join(', ')}`);
          this.logger.warn(`Partial failure for ${ticketId}`, updateResult.errors);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${ticketId}: ${error.message}`);
        this.logger.error(`Failed to sync ${ticketId}`, error);
      }
    }

    return results;
  }

  /**
   * Sync tickets to Linear
   * @param {Array} ticketIds - List of Linear ticket IDs
   * @param {Object} updateData - Data to update (comment, status)
   * @returns {Object} Sync results
   */
  async syncToLinear(ticketIds, updateData) {
    if (!this.linearClient) {
      return { skipped: true, reason: 'Linear client not initialized' };
    }

    const results = {
      total: ticketIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      details: []
    };

    for (const ticketId of ticketIds) {
      try {
        // Verify ticket exists
        const exists = await this.linearClient.verifyTicket(ticketId);
        if (!exists) {
          this.logger.warn(`Linear ticket not found: ${ticketId}`);
          results.failed++;
          results.errors.push(`${ticketId}: Ticket not found`);
          continue;
        }

        // Update ticket
        const updateResult = await this.linearClient.updateTicket(ticketId, updateData);

        if (updateResult.success) {
          results.successful++;
          results.details.push({
            ticketId,
            success: true,
            commentAdded: !!updateResult.commentResult,
            statusUpdated: !!updateResult.statusResult
          });
          this.logger.success(`Updated Linear ticket: ${ticketId}`);
        } else {
          results.failed++;
          results.errors.push(`${ticketId}: ${updateResult.errors.join(', ')}`);
          this.logger.warn(`Partial failure for ${ticketId}`, updateResult.errors);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${ticketId}: ${error.message}`);
        this.logger.error(`Failed to sync ${ticketId}`, error);
      }
    }

    return results;
  }

  /**
   * Execute the full sync process
   * @returns {Object} Overall sync results
   */
  async execute() {
    try {
      // Get commit info
      const commitData = this.getCommitInfo();
      this.logger.info('Processing commit', {
        hash: commitData.shortHash,
        message: commitData.message.split('\n')[0]
      });

      // Parse commit for tickets
      const parsedCommit = this.parser.parseCommit(commitData.message);
      this.logger.info('Parsed commit data', {
        jiraTickets: parsedCommit.jiraTickets,
        linearTickets: parsedCommit.linearTickets,
        commitType: parsedCommit.commitType
      });

      if (parsedCommit.jiraTickets.length === 0 && parsedCommit.linearTickets.length === 0) {
        this.logger.info('No ticket IDs found in commit message');
        return {
          success: true,
          message: 'No tickets to sync'
        };
      }

      // Prepare update data
      const updateData = {};
      if (this.config.sync.addComment) {
        updateData.comment = this.generateComment(commitData, parsedCommit);
      }

      const status = this.parser.mapCommitTypeToStatus(parsedCommit.commitType);

      // Sync to Jira
      const jiraResults = parsedCommit.jiraTickets.length > 0
        ? await this.syncToJira(parsedCommit.jiraTickets, {
            ...updateData,
            status: this.config.jira.updateStatus ? status : null
          })
        : { total: 0, successful: 0, failed: 0, errors: [], details: [] };

      // Sync to Linear
      const linearResults = parsedCommit.linearTickets.length > 0
        ? await this.syncToLinear(parsedCommit.linearTickets, {
            ...updateData,
            status: this.config.linear.updateStatus ? status : null
          })
        : { total: 0, successful: 0, failed: 0, errors: [], details: [] };

      // Compile results
      const totalTickets = parsedCommit.jiraTickets.length + parsedCommit.linearTickets.length;
      const totalSuccessful = jiraResults.successful + linearResults.successful;
      const totalFailed = jiraResults.failed + linearResults.failed;
      const allErrors = [...jiraResults.errors, ...linearResults.errors];

      const summary = {
        success: totalFailed === 0,
        totalTickets,
        successful: totalSuccessful,
        failed: totalFailed,
        jira: jiraResults,
        linear: linearResults
      };

      if (totalFailed > 0) {
        summary.errors = allErrors;
        this.logger.error(`Sync completed with ${totalFailed} failure(s)`, summary);
      } else {
        this.logger.success(`Sync completed successfully: ${totalSuccessful}/${totalTickets} tickets updated`);
      }

      return summary;
    } catch (error) {
      this.logger.error('Sync failed', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const logger = new Logger();
  const configLoader = new ConfigLoader();

  // Validate configuration
  const validation = configLoader.validate();
  if (!validation.valid) {
    logger.error('Configuration errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  const config = configLoader.getConfig();

  // Update logger verbosity
  logger.verbose = config.verbose;

  try {
    const manager = new TicketSyncManager(config, logger);
    const results = await manager.execute();

    if (!results.success) {
      process.exit(1);
    }
  } catch (error) {
    logger.error('Fatal error', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { TicketSyncManager, ConfigLoader, Logger };
