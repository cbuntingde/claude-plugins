#!/bin/bash
# Audit Trail Logger - View Audit Log
# Command to display audit log in formatted table

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

# Parse command line arguments
FILTER_TYPE=""
FILTER_TOOL=""
LIMIT=50

while [ $# -gt 0 ]; do
    case "$1" in
        --type)
            FILTER_TYPE="$2"
            shift 2
            ;;
        --tool)
            FILTER_TOOL="$2"
            shift 2
            ;;
        --limit)
            LIMIT="$2"
            shift 2
            ;;
        *)
            echo "Usage: $0 [--type TYPE] [--tool TOOL] [--limit N]" >&2
            exit 1
            ;;
    esac
done

# Validate limit is numeric
case "$LIMIT" in
    ''|*[!0-9]*)
        echo "Error: limit must be a number" >&2
        exit 1
        ;;
esac

# Sanitize filter inputs
sanitize_input() {
    printf '%s' "$1" | tr -d '[:cntrl:]' | head -c 100
}

if [ -n "$FILTER_TYPE" ]; then
    FILTER_TYPE=$(sanitize_input "$FILTER_TYPE")
fi

if [ -n "$FILTER_TOOL" ]; then
    FILTER_TOOL=$(sanitize_input "$FILTER_TOOL")
fi

# Display header
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                         AUDIT TRAIL LOG                                  ║"
echo "╠══════════════════════════════════════════════════════════════════════════╣"
echo "║  Timestamp           │ Type               │ Tool    │ Details            ║"
echo "╠═══════════════════════╪════════════════════╪═════════╪════════════════════╣"

# Process and display log entries
count=0
while IFS= read -r line; do
    # Skip empty lines
    [ -z "$line" ] && continue

    # Extract values using JSON parsing
    timestamp=$(printf '%s' "$line" | sed -n 's/.*"timestamp":"\([^"]*\)".*/\1/p' | head -c 19)
    event_type=$(printf '%s' "$line" | sed -n 's/.*"event_type":"\([^"]*\)".*/\1/p')
    tool=$(printf '%s' "$line" | sed -n 's/.*"tool":"\([^"]*\)".*/\1/p')
    target=$(printf '%s' "$line" | sed -n 's/.*"target":"\([^"]*\)".*/\1/p')
    session_id=$(printf '%s' "$line" | sed -n 's/.*"session_id":"\([^"]*\)".*/\1/p')

    # Apply filters
    if [ -n "$FILTER_TYPE" ] && [ "$event_type" != "$FILTER_TYPE" ]; then
        continue
    fi

    if [ -n "$FILTER_TOOL" ] && [ "$tool" != "$FILTER_TOOL" ]; then
        continue
    fi

    # Format event type for display
    case "$event_type" in
        session_start)
            details="Session started"
            tool="system"
            ;;
        session_end)
            details="Session ended"
            tool="system"
            ;;
        file_change)
            details="Modified: $target"
            ;;
        command_execution)
            details="Command executed"
            ;;
        decision_log)
            details="Decision: $target"
            ;;
        *)
            details="${target:0:40}"
            ;;
    esac

    # Truncate details for display
    details=$(printf '%s' "$details" | head -c 40)

    # Format timestamp for display
    timestamp_display=$(printf '%s' "$timestamp" | sed 's/T/ /' | sed 's/Z$//' | head -c 19)

    # Display row
    printf "║ %-19s │ %-18s │ %-7s │ %-18s ║\n" "$timestamp_display" "$event_type" "$tool" "$details"

    count=$((count + 1))
    if [ "$count" -ge "$LIMIT" ]; then
        break
    fi
done < "$AUDIT_LOG_FILE"

echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Display summary
if [ "$count" -ge "$LIMIT" ]; then
    echo "Showing $LIMIT most recent entries (use --limit N for more)"
else
    echo "Total entries: $count"
fi
echo ""

exit 0
