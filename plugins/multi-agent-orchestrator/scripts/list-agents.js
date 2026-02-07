#!/usr/bin/env node
/**
 * List Agents Script
 *
 * Lists all available agent definitions.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = join(__dirname, '..');
const AGENTS_DIR = join(PLUGIN_ROOT, 'agents');

/**
 * Extracts purpose from agent definition
 */
function extractPurpose(content) {
  const match = content.match(/## Purpose\s+([\s\S]+?)\s+##/);
  return match ? match[1].trim() : 'No description';
}

/**
 * Lists all available agents
 */
function listAgents() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║              Available Agents - Multi-Agent Orchestrator      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  if (!existsSync(AGENTS_DIR)) {
    console.log('No agents found.\n');
    return 0;
  }

  const files = readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('No agents found.\n');
    return 0;
  }

  const agents = [];
  const maxNameLength = 20;

  for (const file of files) {
    const content = readFileSync(join(AGENTS_DIR, file), 'utf-8');
    const name = file.replace('.md', '');
    const purpose = extractPurpose(content);
    agents.push({ name, purpose });
  }

  // Sort by name
  agents.sort((a, b) => a.name.localeCompare(b.name));

  // Print table header
  console.log('┌' + '─'.repeat(maxNameLength + 2) + '┬' + '─'.repeat(50) + '┐');
  console.log('│ ' + 'Agent'.padEnd(maxNameLength) + ' │ ' + 'Purpose'.padEnd(48) + ' │');
  console.log('├' + '─'.repeat(maxNameLength + 2) + '┼' + '─'.repeat(50) + '┤');

  // Print agents
  for (const agent of agents) {
    const name = agent.name.length > maxNameLength
      ? agent.name.substring(0, maxNameLength - 3) + '...'
      : agent.name;
    const purpose = agent.purpose.length > 48
      ? agent.purpose.substring(0, 45) + '...'
      : agent.purpose;
    console.log('│ ' + name.padEnd(maxNameLength) + ' │ ' + purpose.padEnd(48) + ' │');
  }

  console.log('└' + '─'.repeat(maxNameLength + 2) + '┴' + '─'.repeat(50) + '┘');
  console.log(`\nTotal: ${agents.length} agent(s)\n`);
  console.log('Usage: /agent-swarm <agent-name>\n');

  return 0;
}

const exitCode = listAgents();
process.exit(exitCode);
