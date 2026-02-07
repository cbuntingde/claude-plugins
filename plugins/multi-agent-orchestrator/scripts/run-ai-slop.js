#!/usr/bin/env node
/**
 * AI Slop Agent Runner
 *
 * Launches the AI slop detector agent for incomplete code detection.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = join(__dirname, '..');

const agentDefinition = readFileSync(join(PLUGIN_ROOT, 'agents', 'ai-slop.md'), 'utf-8');

// Extract prompt from definition
const promptMatch = agentDefinition.match(/## Default Prompt\s+([\s\S]+)/);
if (!promptMatch) {
  console.error('Failed to extract AI slop agent prompt');
  process.exit(1);
}

const prompt = promptMatch[1].trim();

console.log('\n🧹 AI Slop Agent - Incomplete Code Detector\n');
console.log('─'.repeat(60));
console.log('\nAgent Prompt:\n');
console.log(prompt);
console.log('\n' + '─'.repeat(60));
console.log('\n⚠️  To run this agent, use the Task tool with the above prompt.');
console.log('    Or use the command: /agent-swarm ai-slop\n');
