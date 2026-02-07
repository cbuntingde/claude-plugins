#!/usr/bin/env node
/**
 * MCP List Command
 * Lists all configured MCP servers
 */

'use strict';

const setupScript = require('./setup-mcp');

async function main() {
  const args = setupScript.parseArgs();
  await setupScript.handleList(args.global);
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
