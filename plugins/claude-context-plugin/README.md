# Context Memory Plugin

Native Claude Code plugin with automatic hooks that capture context throughout your sessions.

## What It Does

The plugin automatically hooks into Claude Code's lifecycle:

| Hook | What It Does |
|------|-------------|
| `on_start_session` | Tracks new sessions with project context |
| `on_end_session` | Saves session summaries with decisions, files, tools |
| `on_user_message` | Captures user messages |
| `on_assistant_message` | Captures responses + auto-learns important content |
| `on_tool_use` | Tracks all tool usage |
| `on_file_change` | Monitors file modifications |
| `on_error` | Learns from errors with frequency tracking |
| `on_decision` | Captures important decisions |
| `on_complete` | Runs when tasks complete |

## Installation

```bash
# Copy plugin to Claude Code plugins directory
cp -r plugin ~/.claude/plugins/context-memory

# Or link for development
ln -s /home/gsxrchris/claude-context-plugin/plugin ~/.claude/plugins/context-memory
```

That's it! The plugin loads automatically with Claude Code.

## Storage

All data stored in SQLite:

```
~/.claude/context-memory/memory.db
```

Database tables:
- `memories` - Auto-learned content
- `sessions` - Session tracking
- `error_learnings` - Learned errors

## View Data

```bash
sqlite3 ~/.claude/context-memory/memory.db "SELECT * FROM memories LIMIT 10;"
```

## Uninstall

```bash
rm -rf ~/.claude/plugins/context-memory
```

## Files

```
plugin/
├── plugin.json          # Plugin manifest
├── README.md           # This file
├── requirements.txt    # Dependencies
└── src/
    └── __init__.py     # Hook implementations
```

## Requirements

- `claude-code-sdk>=1.0.0`

## License

MIT