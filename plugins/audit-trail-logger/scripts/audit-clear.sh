#!/bin/bash
# Audit Trail Logger - Clear Audit Log
# Command to clear the audit log with confirmation

set -euo pipefail

# Validate CLAUDE_PLUGIN_ROOT
if [ -z "${CLAUDE_PLUGIN_ROOT:-}" ]; then
    echo "Error: CLAUDE_PLUGIN_ROOT not set" >&2
    exit 1
fi

# Ensure path is absolute
case "$CLAUDE_PLUGIN_ROOT" in
    /*) ;;
    *)  echo "Error: CLAUDE_PLUGIN_ROOT must be absolute path" >&2
        exit 1
        ;;
esac

AUDIT_DIR="${CLAUDE_PLUGIN_ROOT}/data"
AUDIT_LOG_FILE="${AUDIT_DIR}/audit.jsonl"

# Validate directory (path traversal prevention)
case "$AUDIT_DIR" in
    "${CLAUDE_PLUGIN_ROOT}/data"|"${CLAUDE_PLUGIN_ROOT}/data/"*) ;;
    *)  echo "Error: Invalid audit directory" >&2
        exit 1
        ;;
esac

# Check if log file exists
if [ ! -f "$AUDIT_LOG_FILE" ]; then
    echo "No audit log found."
    exit 0
fi

# Display warning
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                     AUDIT LOG CLEAR WARNING                              ║"
echo "╠══════════════════════════════════════════════════════════════════════════╣"
echo "║  WARNING: This will permanently delete all audit log entries.           ║"
echo "║  This action cannot be undone.                                           ║"
echo "║                                                                          ║"
echo "║  For compliance purposes, ensure you have exported the log before        ║"
echo "║  clearing it. Use /audit-export to create a backup.                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if --confirm flag is provided
if [ "${1:-}" != "--confirm" ]; then
    echo "To clear the audit log, use: /audit-clear --confirm"
    exit 1
fi

# Archive current log before clearing (for compliance)
timestamp=$(date -u +"%Y%m%d_%H%M%S")
archive_file="${AUDIT_DIR}/audit_before_clear_${timestamp}.jsonl"

if ! cp "$AUDIT_LOG_FILE" "$archive_file"; then
    echo "Warning: Failed to create archive before clearing" >&2
fi

# Clear the log
if ! > "$AUDIT_LOG_FILE"; then
    echo "Error: Failed to clear audit log" >&2
    exit 1
fi

echo "Audit log cleared successfully."
echo "Archive saved to: $archive_file"
exit 0
