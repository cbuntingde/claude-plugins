# Multi-Agent Orchestrator

Orchestrates multiple parallel AI agents for comprehensive code analysis, review, and automated fixes. Run multiple specialized agents simultaneously to identify bugs, security vulnerabilities, code quality issues, and incomplete code - then automatically implement fixes.

## Description

This plugin enables Claude Code to spawn and coordinate multiple AI agent subtasks in parallel. Each agent specializes in a specific area of code analysis:

- **Observer** - Logic errors, performance issues, code smells, architectural concerns
- **Security** - OWASP Top 10 vulnerability scanning
- **Code Standards** - Naming conventions, DRY violations, complexity, type safety
- **AI Slop** - TODO/FIXME comments, placeholders, console.logs, incomplete code
- **Coder** - Implements fixes based on findings from other agents

## Installation

```bash
cd plugins/multi-agent-orchestrator
npm install
```

The plugin uses hooks for automatic suggestions and requires no additional configuration.

## Usage

### Run All Analysis Agents

Launch the full swarm (observer, security, code-standards, ai-slop) in parallel:

```
/agent-swarm
```

### Run Specific Agents

```
/agent-swarm observer security
```

### Analyze Specific Directory

```
/agent-swarm security ./src/api
```

### Implement Fixes

After running analysis, launch the coder agent to implement fixes:

```
/agent-swarm coder
```

### List Available Agents

```
/list-agents
```

### Create Custom Agent

```
/create-agent performance-analyzer
```

## Configuration

### Agent Definitions

Agents are defined in markdown files in the `agents/` directory. Each agent file contains:

- **Purpose** - What the agent does
- **Agent Configuration** - Subagent type, model, tools
- **Default Prompt** - Instructions for the agent

### Custom Agents

Create custom agents for specific needs:

```
/create-agent <agent-name>
```

Custom agents can then be used with `/agent-swarm <agent-name>`.

### Modifying Agent Prompts

Edit agent definition files in `agents/*.md` to customize behavior:

- `agents/observer.md` - Code review agent
- `agents/security.md` - Security scanning agent
- `agents/code-standards.md` - Code quality agent
- `agents/ai-slop.md` - Incomplete code detector
- `agents/coder.md` - Fix implementation agent

## Architecture

```
User Command
    │
    ▼
┌─────────────────────────────────────┐
│     Agent Orchestrator              │
│  ┌───────────────────────────────┐  │
│  │  Spawn Parallel Agents        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         │                │         │
         ▼                ▼         ▼
    ┌────────┐      ┌────────┐  ┌────────┐
    │Observer│      │Security│  │Standards│ ...
    └────────┘      └────────┘  └────────┘
         │                │         │
         └────────────────┴─────────┘
                    │
                    ▼
            ┌──────────────┐
            │ Consolidate  │
            │   Results    │
            └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │   Coder      │
            │   Agent      │
            └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │    Fixes     │
            │ Implemented │
            └──────────────┘
```

## Security

- Agent definitions are stored as markdown files (no executable code)
- All file operations respect path traversal protections
- No secrets or credentials are stored in agent definitions
- Agent prompts are validated before execution

## Troubleshooting

### Agent Not Found

```
Error: Agent definition not found: <name>
```

Solution: Use `/list-agents` to see available agents, or create with `/create-agent`

### Hook Not Triggering

Hooks only trigger on specific events (SessionEnd, PostToolUse). Manual commands are available for direct execution.

### Parallel Execution Issues

Agents run independently. If one fails, others continue. Check individual agent output for errors.

## Example Workflow

```bash
# 1. Make code changes
(edit files)

# 2. Run analysis swarm
/agent-swarm

# 3. Review consolidated findings
(reports displayed)

# 4. Implement fixes
/agent-swarm coder

# 5. Verify fixes
(run tests, build)
```
