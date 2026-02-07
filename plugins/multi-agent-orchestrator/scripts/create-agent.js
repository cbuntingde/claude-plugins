#!/usr/bin/env node
/**
 * Create Agent Script
 *
 * Creates a new custom agent definition for the multi-agent orchestrator.
 */

import { writeFileSync, readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = join(__dirname, '..');
const AGENTS_DIR = join(PLUGIN_ROOT, 'agents');

/**
 * Lists existing agents
 */
function listExistingAgents() {
  if (!existsSync(AGENTS_DIR)) {
    return [];
  }
  return readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

/**
 * Creates a new agent definition file
 */
function createAgent(name, purpose, agentType, model, tools, prompt) {
  const fileName = `${name}.md`;
  const filePath = join(AGENTS_DIR, fileName);

  // Check if agent already exists
  if (existsSync(filePath)) {
    console.error(`\n❌ Error: Agent "${name}" already exists.`);
    console.log(`   To modify it, edit: ${filePath}\n`);
    return 1;
  }

  // Format tools as comma-separated list
  const toolsList = Array.isArray(tools) ? tools.join(', ') : tools;

  // Build agent definition
  const content = `# ${name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase())} Agent

## Purpose
${purpose}

## Agent Configuration
- **Subagent Type**: ${agentType}
- **Model**: ${model}
- **Tools**: ${toolsList}

## Default Prompt
${prompt}
`;

  writeFileSync(filePath, content, 'utf-8');

  console.log(`\n✅ Agent "${name}" created successfully!`);
  console.log(`   Location: ${filePath}\n`);
  console.log(`Usage: /agent-swarm ${name}\n`);

  return 0;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\n📝 Create Agent - Multi-Agent Orchestrator\n');
    console.log('Usage: node create-agent.js <agent-name>\n');
    console.log('Creates a new custom agent definition.\n');
    console.log('Example: node create-agent.js performance-analyzer\n');
    return 1;
  }

  const name = args[0];

  // Validate agent name (kebab-case)
  const nameRegex = /^[a-z][a-z0-9-]*[a-z0-9]$/;
  if (!nameRegex.test(name)) {
    console.error(`\n❌ Error: Invalid agent name "${name}"`);
    console.log('   Agent names must be kebab-case (lowercase, hyphens, no spaces)');
    console.log('   Example: performance-analyzer, api-reviewer, docs-generator\n');
    return 1;
  }

  // Check for existing agents
  const existingAgents = listExistingAgents();
  if (existingAgents.includes(name)) {
    console.error(`\n❌ Error: Agent "${name}" already exists.`);
    console.log(`   Existing agents: ${existingAgents.join(', ')}\n`);
    return 1;
  }

  console.log('\n📝 Creating new agent: ' + name);
  console.log('─'.repeat(60));

  // For now, use default values for a general-purpose agent
  // In a full implementation, this would be interactive
  const purpose = 'Custom analysis and review agent';
  const agentType = 'general-purpose';
  const model = 'sonnet';
  const tools = ['Read', 'Grep', 'Glob', 'Bash'];
  const prompt = `You are a ${name} agent.

Your task is to analyze the codebase and provide findings.

Focus on:
1. Your specific area of expertise
2. File paths and line numbers for issues
3. Severity levels (critical, high, medium, low)
4. Clear descriptions and remediation steps

Search the codebase using Grep and Glob patterns. Read relevant files.

Provide a structured report as markdown with clear sections.`;

  return createAgent(name, purpose, agentType, model, tools, prompt);
}

const exitCode = main();
process.exit(exitCode);
