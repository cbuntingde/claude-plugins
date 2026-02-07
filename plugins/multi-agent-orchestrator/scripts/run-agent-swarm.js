#!/usr/bin/env node
/**
 * Agent Swarm Orchestrator
 *
 * Spawns multiple parallel agents for comprehensive code analysis.
 * Collects results and presents them for the coder agent to fix.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = join(__dirname, '..');
const AGENTS_DIR = join(PLUGIN_ROOT, 'agents');

/**
 * Reads an agent definition file
 */
function readAgentDefinition(agentName) {
  const agentPath = join(AGENTS_DIR, `${agentName}.md`);

  if (!existsSync(agentPath)) {
    throw new Error(`Agent definition not found: ${agentName}`);
  }

  return readFileSync(agentPath, 'utf-8');
}

/**
 * Extracts the prompt from an agent definition
 */
function extractAgentPrompt(agentDefinition) {
  const sections = agentDefinition.split('## Default Prompt');
  if (sections.length < 2) {
    throw new Error('Agent definition missing default prompt');
  }
  return sections[1].trim();
}

/**
 * Prints agent swarm header
 */
function printHeader(agentNames) {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          Multi-Agent Orchestrator - Agent Swarm               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n🚀 Launching ${agentNames.length} parallel agents:`);
  agentNames.forEach(name => {
    console.log(`   - ${name}`);
  });
  console.log('\n📊 Agents will analyze the codebase in parallel.\n');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const agents = [];
  let targetPath = '.';

  for (const arg of args) {
    if (arg.startsWith('--')) {
      // Flags
      continue;
    } else if (arg === 'observer' || arg === 'security' || arg === 'code-standards' || arg === 'ai-slop' || arg === 'qa') {
      agents.push(arg);
    } else if (arg === 'coder') {
      agents.push('coder');
    } else {
      // Assume it's a path
      targetPath = arg;
    }
  }

  // Default: run all analysis agents
  if (agents.length === 0) {
    agents.push('observer', 'security', 'code-standards', 'ai-slop', 'qa');
  }

  printHeader(agents);

  // Build agent invocation instructions
  console.log('## Agent Swarm Instructions\n');
  console.log('Spawn the following agents in parallel using the Task tool:\n');

  agents.forEach(agentName => {
    const definition = readAgentDefinition(agentName);
    const prompt = extractAgentPrompt(definition);

    console.log(`### ${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent`);
    console.log();
    console.log('Use the Task tool with these parameters:');
    console.log('```');
    console.log(`subagent_type: "general-purpose"`);
    console.log(`description: "Run ${agentName} analysis"`);
    console.log(`prompt: """`);
    console.log(`${prompt}`);
    console.log(`"""`);
    console.log('```');
    console.log();
  });

  console.log('---');
  console.log('\n## Expected Output Format\n');
  console.log('Each agent should produce a markdown report with:');
  console.log('- File paths and line numbers');
  console.log('- Severity levels (critical, high, medium, low)');
  console.log('- Clear descriptions');
  console.log('- Suggested fixes or remediation steps');
  console.log('\nAfter all agents complete, consolidate their findings into a single');
  console.log('report that will be passed to the coder agent for implementation.\n');

  return 0;
}

const exitCode = main();
process.exit(exitCode);
