#!/bin/bash
# Audit Trail Logger - Session End Script
# Triggered by SessionEnd hook to finalize audit log

set -euo pipefail

# Maximum file size before rotation
MAX_LOG_SIZE=2097152
MIN_DISK_SPACE_KB=100

# Validate dependencies
check_dependencies() {
    local missing_deps=()
    for cmd in awk sed date mktemp grep wc head; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing_deps+=("$cmd")
        fi
    done

    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo "Error: Required commands not found: ${missing_deps[*]}" >&2
        exit 1
    fi
}

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

check_dependencies

# Read session ID
if [ -f "$SESSION_ID_FILE" ]; then
    SESSION_ID=$(cat "$SESSION_ID_FILE" 2>/dev/null || echo "unknown")
    # Remove session ID file after reading
    rm -f "$SESSION_ID_FILE" 2>/dev/null || true
else
    SESSION_ID="unknown"
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
    ' | head -c 1000
}

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Create session end entry
log_entry=$(cat <<EOF
{"timestamp":"$timestamp","session_id":"$SESSION_ID","event_type":"session_end"}
EOF
)

# Rotate log if needed
rotate_log_if_needed() {
    if [ -f "$AUDIT_LOG_FILE" ]; then
        local file_size
        file_size=$(wc -c < "$AUDIT_LOG_FILE" 2>/dev/null || echo "0")
        if [ "$file_size" -ge "$MAX_LOG_SIZE" ]; then
            local timestamp
            timestamp=$(date -u +"%Y%m%d_%H%M%S")
            local archive_file="${AUDIT_DIR}/audit_${timestamp}.jsonl"
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

exit 0
