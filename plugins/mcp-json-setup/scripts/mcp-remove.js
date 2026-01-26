#!/usr/bin/env node
/**
 * MCP Remove Command
 * Removes specified MCP servers from configuration
 */

'use strict';

const setupScript = require('./setup-mcp');

async function main() {
  const args = setupScript.parseArgs();
  await setupScript.handleRemove(args.servers, args.global);
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
