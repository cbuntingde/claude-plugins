#!/bin/bash
# Audit Trail Logger - Event Capture Script
# Triggered by PostToolUse hook to capture file changes and commands

set -euo pipefail

# Maximum file size before rotation
MAX_LOG_SIZE=2097152
MAX_INPUT_SIZE=65536
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

# Read session ID or generate new one
if [ -f "$SESSION_ID_FILE" ]; then
    SESSION_ID=$(cat "$SESSION_ID_FILE" 2>/dev/null || echo "unknown")
else
    SESSION_ID="unknown"
fi

# Read JSON input with size limit
if ! input=$(head -c $MAX_INPUT_SIZE); then
    echo "Error: Failed to read input" >&2
    exit 1
fi

# Exit gracefully if no input
if [ -z "$input" ]; then
    exit 0
fi

# Check if input was truncated
input_len=$(printf '%s' "$input" | wc -c)
if [ "$input_len" -ge "$MAX_INPUT_SIZE" ]; then
    echo "Error: Input too large (max $MAX_INPUT_SIZE bytes)" >&2
    exit 1
fi

# Extract JSON values safely
extract_json_value() {
    local key="$1"
    local json="$2"
    local value

    value=$(printf '%s' "$json" | awk -v key="$key" '{
        gsub(/[\[\](){}|^$.*+?\\]/, "\\\\&", key);
        pattern = "\"" key "\"[[:space:]]*:[[:space:]]*\"[^\"]*\"";
        if (match($0, pattern)) {
            val = substr($0, RSTART, RLENGTH);
            gsub(/^[^"]*"[[:space:]]*:[[:space:]]*"/, "", val);
            gsub(/".*$/, "", val);
            print val;
            exit;
        }
    }')

    printf '%s' "$value"
}

tool_name=$(extract_json_value "name" "$input")

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

# Truncate excessively long values
tool_name=$(printf '%s' "$tool_name" | head -c 100)

# Determine event type
case "$tool_name" in
    Write|Edit)
        event_type="file_change"
        # Extract file path
        file_path=$(extract_json_value "path" "$input" 2>/dev/null || echo "")
        file_path=$(sanitize_json "$file_path" | head -c 500)
        ;;
    Bash)
        event_type="command_execution"
        # Extract command from input (may be in different format)
        file_path="n/a"
        ;;
    *)
        event_type="tool_use"
        file_path=$(extract_json_value "path" "$input" 2>/dev/null || echo "")
        file_path=$(sanitize_json "$file_path" | head -c 500)
        ;;
esac

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Create audit entry
log_entry=$(cat <<EOF
{"timestamp":"$timestamp","session_id":"$SESSION_ID","event_type":"$event_type","tool":"$tool_name","target":"$file_path"}
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
