# Bug Catcher Plugin for Claude Code

> **Important Notice**: This is a proof-of-concept that should work on Unix-like systems. For Windows compatibility, the shell scripts would need to be converted to PowerShell scripts (using `${CLAUDE_PLUGIN_ROOT}` equivalent).

Automatically captures tool execution failures and provides commands to view them in a formatted table.

## Features

- **Automatic Error Capture**: Uses the `PostToolUseFailure` hook to capture all tool failures
- **Persistent Log**: Stores captured bugs in a JSON file for review
- **Formatted Display**: Shows errors in a clean, readable table format
- **Session Tracking**: Timestamps each error for debugging

## Installation

```bash
claude plugin install ./bug-catcher-plugin --scope local
```

## Usage

### View Captured Bugs

```bash
/bug-list
```

This displays all captured tool failures in a formatted table:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                           CAPTURED BUGS                                  ║
╠══════════════════════════════════════════════════════════════════════════╣
║  #   │ Timestamp           │ Tool      │ Error Message                  ║
╠══════╪═════════════════════╪═══════════╪════════════════════════════════╣
║  1   │ 10:30:15 │ Read      │ File not found: missing.txt             ║
║  2   │ 10:32:42 │ Bash      │ Command failed: npm run build           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Clear Bug Log

```bash
/bug-clear
```

Removes all captured bugs from the log.

## How It Works

1. The plugin registers a `PostToolUseFailure` hook that triggers on any tool failure
2. When a tool fails, the hook runs `capture-error.sh` which logs the error
3. Use `/bug-list` to view all captured errors in a table format

## Configuration

No configuration required. The plugin works out of the box with sensible defaults:

- **Bug log location**: `${CLAUDE_PLUGIN_ROOT}/data/bugs.json`
- **Error capture**: Automatic via `PostToolUseFailure` hook
- **Auto-cleared**: No, bugs persist until manually cleared with `/bug-clear`

### Data Directory

The plugin creates a `data/` directory in the plugin root to store:
- `bugs.json` - Captured tool failures (JSON format)
- `.clear_log` - Audit log of clear operations

## Files

- `hooks/hooks.json` - Hook configuration for capturing tool failures
- `scripts/capture-error.sh` - Script that saves error data to JSON
- `scripts/bug-list.sh` - Script that displays bugs in table format
- `scripts/bug-clear.sh` - Script that clears the bug log
- `commands/bug-list.md` - Command documentation for `/bug-list`
- `commands/bug-clear.md` - Command documentation for `/bug-clear`