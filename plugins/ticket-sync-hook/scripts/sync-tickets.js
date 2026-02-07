#!/usr/bin/env node

/**
 * Sync Tickets Command
 * Wrapper for the sync-ticket.js script
 */

const syncTicket = require('./sync-ticket');

// Execute the sync
async function main() {
  try {
    // Get the config loader and logger
    const { ConfigLoader, Logger } = syncTicket;

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
    logger.verbose = config.verbose;

    // Run the sync
    const { TicketSyncManager } = syncTicket;
    const manager = new TicketSyncManager(config, logger);
    const results = await manager.execute();

    if (!results.success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
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
