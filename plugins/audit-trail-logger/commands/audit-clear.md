# Audit Clear

Clear the audit trail log. For compliance, the current log is automatically archived before clearing.

## Usage

```
/audit-clear --confirm
```

### Safety

The `--confirm` flag is required to prevent accidental data loss. This ensures you intentionally want to clear the audit log.

### Examples

Clear the audit log (with confirmation):
```
/audit-clear --confirm
```

## Behavior

When clearing the audit log:

1. A warning is displayed reminding you to export if needed
2. The current log is automatically archived with timestamp
3. The active log file is cleared
4. Archive location is displayed for your records

### Archive Location

Archives are saved to `${CLAUDE_PLUGIN_ROOT}/data/` with the naming pattern:
`audit_before_clear_YYYYMMDD_HHMMSS.jsonl`

## Compliance

Before clearing the audit log, ensure you have:
- Exported the log for compliance records (use `/audit-export`)
- Verified retention policy requirements are met
- Documented the reason for clearing the log

The automatic archive provides a backup, but you should maintain proper export procedures for compliance.
