# Auto Memory Plugin

Automatic memory system inspired by MemRL (arxiv.org/abs/2601.03192) that hooks into Claude Code lifecycle events for seamless context retention. Unlike the original plugin, this version operates automatically without requiring explicit commands.

## Installation

First, add the marketplace:

```bash
/plugin marketplace add cbuntingde/claude-plugins
```

Then install the plugin:

```bash
/plugin install auto-memory-plugin@dev-plugins
```

## Description

The Auto Memory Plugin uses Claude Code's hook system to:

- **SessionStart**: Automatically retrieve relevant memories when a session begins
- **UserPromptSubmit**: Opportunistic context collection during prompt submission
- **PreToolUse**: Detect valuable code and package patterns during file operations
- **PostToolUse**: Extract and store learned patterns after code changes
- **SessionEnd**: Optionally generate session summaries and prune memories

## Agents

### Warmstart Agent
Retrieves top 5 most valuable memories with high utility scores (0.7+) relevant to current project context on session start.

### Monitoring Agent
Observes prompt submissions for highly relevant technical patterns that could be worth remembering.

### Code Pattern Extractor
Analyzes file writes and edits for patterns worth remembering:
- Novel bug fixes and solutions
- Reusable design patterns
- Anti-patterns discovered and avoided
- Configuration patterns
- Performance optimizations

### Package Pattern Extractor
Analyzes dependency-related commands for package and configuration patterns:
- Package version constraints that resolved issues
- Build configuration patterns
- Testing framework setups
- Dev tool integrations
- Version pinning strategies

### Derive Agent
Reflects on completed work to identify learnings worth remembering with utility estimates (0-1).

### Summary Agent
Optional: Generates concise summaries of key memories organized by theme or priority.

## Configuration

Edit `hooks/hooks.json` to customize behavior:

- Adjust which lifecycle events trigger pattern detection
- Modify threshold parameters for memory retrieval
- Customize lambda values for exploration vs. exploitation trade-off

## Security

- Never commit `auto-data/` directory to version control
- Use environment variables for sensitive configuration
- Validate all inputs before storing in memory corpus

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Memories not retrieving | Run `python health-check.py` to verify setup |
| High memory usage | Run `python prune-memories.py --dry-run` to identify old memories |
| Hook not firing | Check Claude Code debug logs, verify plugin is enabled |

## Requirements

- Python 3.x
- Claude Code with hookify plugin support
- No external dependencies (uses only standard library)