#!/bin/bash
# Audit Trail Logger - Log Decision
# Command to manually log decisions for compliance tracking

set -euo pipefail

# Maximum file size before rotation
MAX_LOG_SIZE=2097152

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
SESSION_ID_FILE="${AUDIT_DIR}/.session_id"

# Validate directory (path traversal prevention)
case "$AUDIT_DIR" in
    "${CLAUDE_PLUGIN_ROOT}/data"|"${CLAUDE_PLUGIN_ROOT}/data/"*) ;;
    *)  echo "Error: Invalid audit directory" >&2
        exit 1
        ;;
esac

# Ensure directory exists
if [ ! -d "$AUDIT_DIR" ]; then
    if ! mkdir -p "$AUDIT_DIR"; then
        echo "Error: Failed to create audit directory" >&2
        exit 1
    fi
fi

# Get decision text from arguments or stdin
if [ $# -gt 0 ]; then
    DECISION_TEXT="$*"
else
    # Read from stdin
    if ! DECISION_TEXT=$(cat); then
        echo "Error: Failed to read decision text" >&2
        exit 1
    fi
fi

# Validate decision text is not empty
if [ -z "$DECISION_TEXT" ]; then
    echo "Error: Decision text cannot be empty" >&2
    exit 1
fi

# Limit decision text length
MAX_DECISION_LENGTH=5000
decision_len=$(printf '%s' "$DECISION_TEXT" | wc -c)
if [ "$decision_len" -gt "$MAX_DECISION_LENGTH" ]; then
    echo "Error: Decision text too long (max $MAX_DECISION_LENGTH characters)" >&2
    exit 1
fi

# Read session ID or generate new one
if [ -f "$SESSION_ID_FILE" ]; then
    SESSION_ID=$(cat "$SESSION_ID_FILE" 2>/dev/null || echo "unknown")
else
    SESSION_ID=$(date -u +"%Y%m%d%H%M%S")-$$
fi

# Sanitize for JSON
sanitize_json() {
    printf '%s' "$1" | sed '
        s/\\/\\\\/g
        s/\x08/\\b/g
        s/\x0c/\\f/g
        s/\n/\\n/g
        s/\r/\\r/g
        s/\t/\\t/g
        s/"/\\"/g
        s/[[:space:]]\+/ /g
        s/^[[:space:]]//g
        s/[[:space:]]$//g
    '
}

decision=$(sanitize_json "$DECISION_TEXT")
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Create decision log entry
log_entry=$(cat <<EOF
{"timestamp":"$timestamp","session_id":"$SESSION_ID","event_type":"decision_log","tool":"decision","target":"$decision"}
EOF
)

# Rotate log if needed
rotate_log_if_needed() {
    if [ -f "$AUDIT_LOG_FILE" ]; then
        local file_size
        file_size=$(wc -c < "$AUDIT_LOG_FILE" 2>/dev/null || echo "0")
        if [ "$file_size" -ge "$MAX_LOG_SIZE" ]; then
            local ts
            ts=$(date -u +"%Y%m%d_%H%M%S")
            local archive_file="${AUDIT_DIR}/audit_${ts}.jsonl"
            if ! mv "$AUDIT_LOG_FILE" "$archive_file"; then
                echo "Warning: Could not archive audit log" >&2
            fi
        fi
    fi
}

rotate_log_if_needed

# Atomic write using temp file
temp_file="${AUDIT_DIR}/audit.XXXXXX"
if ! temp_file=$(mktemp "$temp_file"); then
    echo "Error: Failed to create temp file" >&2
    exit 1
fi

# Validate temp file location
case "$temp_file" in
    "${AUDIT_DIR}/audit."*) ;;
    *)  rm -f "$temp_file"
        echo "Error: Temp file created outside expected directory" >&2
        exit 1
        ;;
esac

# Append to log
if [ -f "$AUDIT_LOG_FILE" ]; then
    cat "$AUDIT_LOG_FILE" > "$temp_file"
fi
echo "$log_entry" >> "$temp_file"

if ! mv "$temp_file" "$AUDIT_LOG_FILE"; then
    rm -f "$temp_file"
    echo "Error: Failed to write audit log" >&2
    exit 1
fi

# Set restrictive permissions
chmod 600 "$AUDIT_LOG_FILE" 2>/dev/null || true

echo "Decision logged successfully at $timestamp"
exit 0
