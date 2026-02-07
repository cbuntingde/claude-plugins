#!/bin/bash
# Audit Trail Logger - Session Start Script
# Triggered by SessionStart hook to initialize audit log

set -euo pipefail

# Maximum file size before rotation (2MB for main log)
MAX_LOG_SIZE=2097152
MIN_DISK_SPACE_KB=100

# Validate required dependencies
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

# Validate directory is within plugin root (path traversal prevention)
case "$AUDIT_DIR" in
    "${CLAUDE_PLUGIN_ROOT}/data"|"${CLAUDE_PLUGIN_ROOT}/data/"*) ;;
    *)  echo "Error: Invalid audit directory" >&2
        exit 1
        ;;
esac

# Create directory with restricted permissions
if ! mkdir -p "$AUDIT_DIR"; then
    echo "Error: Failed to create audit directory" >&2
    exit 1
fi

# Check available disk space
check_disk_space() {
    local available_kb
    if ! available_kb=$(df -k "$AUDIT_DIR" 2>/dev/null | awk 'NR==2 {print $4}'); then
        echo "Warning: Could not check available disk space" >&2
        return 0
    fi

    if [ -n "$available_kb" ] && [ "$available_kb" -lt "$MIN_DISK_SPACE_KB" ]; then
        echo "Error: Insufficient disk space" >&2
        return 1
    fi
    return 0
}

check_dependencies
check_disk_space || exit 1

# Generate unique session ID
SESSION_ID=$(date -u +"%Y%m%d%H%M%S")-$$

# Store session ID for subsequent events
echo "$SESSION_ID" > "$SESSION_ID_FILE"
chmod 600 "$SESSION_ID_FILE" 2>/dev/null || true

# Rotate log if it exceeds size limit
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

# Sanitize input for JSON
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

# Get username safely
get_username() {
    if [ -n "${USER:-}" ]; then
        sanitize_json "$USER"
    elif [ -n "${USERNAME:-}" ]; then
        sanitize_json "$USERNAME"
    else
        echo "unknown"
    fi
}

# Get hostname safely (truncate to prevent DOS)
get_hostname() {
    if command -v hostname >/dev/null 2>&1; then
        hostname 2>/dev/null | head -c 253 | sanitize_json || echo "unknown"
    else
        echo "unknown"
    fi
}

# Get current directory safely
get_cwd() {
    pwd 2>/dev/null | sanitize_json || echo "unknown"
}

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
username=$(get_username)
hostname=$(get_hostname)
cwd=$(get_cwd)

# Create session start entry
log_entry=$(cat <<EOF
{"timestamp":"$timestamp","session_id":"$SESSION_ID","event_type":"session_start","user":"$username","host":"$hostname","cwd":"$cwd"}
EOF
)

# Append to audit log with atomic write
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
