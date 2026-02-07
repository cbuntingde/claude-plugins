# Audit View

View the audit trail log in a formatted table.

## Usage

```
/audit-view [--type TYPE] [--tool TOOL] [--limit N]
```

### Options

- `--type TYPE` - Filter by event type (session_start, session_end, file_change, command_execution, decision_log)
- `--tool TOOL` - Filter by tool name (Write, Edit, Bash, etc.)
- `--limit N` - Limit number of entries displayed (default: 50)

### Examples

View all recent audit entries:
```
/audit-view
```

View only file changes:
```
/audit-view --type file_change
```

View only Bash commands:
```
/audit-view --tool Bash
```

View last 100 entries:
```
/audit-view --limit 100
```

## Output

The command displays a formatted table with the following columns:
- **Timestamp** - When the event occurred
- **Type** - Event type (session_start, file_change, command_execution, etc.)
- **Tool** - Tool that was used (Write, Edit, Bash, etc.)
- **Details** - Additional information about the event
