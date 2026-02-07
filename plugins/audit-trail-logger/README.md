# Audit Trail Logger for Claude Code

Comprehensive audit trail logging for compliance reporting. Captures all file changes, commands, and decisions with timestamps and session tracking.

## Features

- **Automatic Event Capture**: Uses hooks to automatically capture file changes and commands
- **Session Tracking**: Tracks all activity within Claude Code sessions
- **Decision Logging**: Manual command to log decisions for compliance documentation
- **Multiple Export Formats**: Export logs as JSON, CSV, or text reports
- **Secure Storage**: Logs stored with restrictive permissions and automatic rotation
- **Compliance Ready**: Export functionality for compliance reporting and archival

## Installation

```bash
claude plugin install ./audit-trail-logger --scope local
```

## Usage

### View Audit Log

```bash
/audit-view
```

Display all recent audit entries in a formatted table.

```bash
/audit-view --type file_change --limit 100
```

Filter by event type and limit results.

### Log a Decision

```bash
/audit-log-decision "Chose PostgreSQL over MySQL for better JSON support"
```

Manually log important decisions for compliance tracking.

### Export Audit Log

```bash
/audit-export --format json --compress
```

Export the audit log in various formats for compliance reporting.

```bash
/audit-export --format csv
```

Export as CSV for spreadsheet analysis.

### Clear Audit Log

```bash
/audit-clear --confirm
```

Clear the audit log (current log is automatically archived before clearing).

## Configuration

No configuration required. The plugin works with sensible defaults:

- **Audit log location**: `${CLAUDE_PLUGIN_ROOT}/data/audit.jsonl`
- **Export directory**: `${CLAUDE_PLUGIN_ROOT}/data/exports/`
- **Maximum log size**: 2MB before automatic rotation
- **Session tracking**: Automatic via SessionStart/SessionEnd hooks

## Data Directory

The plugin creates a `data/` directory in the plugin root:

```
data/
├── audit.jsonl              # Main audit log (JSON Lines format)
├── .session_id              # Current session ID
├── audit_YYYYMMDD_HHMMSS.jsonl  # Rotated/archived logs
└── exports/
    └── audit_export_YYYYMMDD_HHMMSS.{json|csv|txt}
```

## Logged Events

The plugin automatically captures:

- **session_start**: When a Claude Code session begins
- **file_change**: When files are written or edited (Write, Edit tools)
- **command_execution**: When shell commands are executed (Bash tool)
- **decision_log**: When decisions are manually logged
- **session_end**: When a Claude Code session ends

## Security

- All log files created with restrictive permissions (600)
- Path traversal prevention on all file operations
- Input sanitization for all logged data
- Automatic log rotation to prevent disk space issues
- Disk space checks before logging operations

## Compliance

For compliance purposes:

1. Export logs regularly using `/audit-export`
2. Use `/audit-log-decision` to document important decisions
3. Maintain export archives according to your retention policy
4. Review audit logs periodically for compliance verification

## Files

- `hooks/hooks.json` - Hook configuration for automatic event capture
- `scripts/log-session-start.sh` - Session initialization
- `scripts/log-event.sh` - Event capture from tool usage
- `scripts/log-session-end.sh` - Session finalization
- `scripts/audit-view.sh` - View audit log command
- `scripts/audit-log-decision.sh` - Log decision command
- `scripts/audit-export.sh` - Export audit log command
- `scripts/audit-clear.sh` - Clear audit log command
