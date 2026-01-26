#!/usr/bin/env node
/**
 * MCP Validate Command
 * Validates MCP configuration without applying changes
 */

'use strict';

const setupScript = require('./setup-mcp');

async function main() {
  const args = process.argv.slice(2);
  let filePath = null;

  // Parse --file or -f flag
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' || args[i] === '-f') {
      filePath = args[i + 1];
      break;
    } else if (!args[i].startsWith('-')) {
      filePath = args[i];
      break;
    }
  }

  await setupScript.handleValidate(filePath);
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});