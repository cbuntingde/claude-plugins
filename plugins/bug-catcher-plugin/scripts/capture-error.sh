#!/bin/bash
# Bug Catcher - Error Capture Script
# Triggered by PostToolUseFailure hook to capture tool errors

set -euo pipefail

# Maximum file size before rotation (1MB)
MAX_LOG_SIZE=1048576
MAX_LOG_ENTRIES=1000
MIN_DISK_SPACE_KB=100

# Validate required dependencies are available
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

# Validate CLAUDE_PLUGIN_ROOT is set and safe
if [ -z "${CLAUDE_PLUGIN_ROOT:-}" ]; then
    echo "Error: CLAUDE_PLUGIN_ROOT not set" >&2
    exit 1
fi

# Ensure path is absolute and within expected location
case "$CLAUDE_PLUGIN_ROOT" in
    /*) ;;  # Absolute path, OK
    *)  echo "Error: CLAUDE_PLUGIN_ROOT must be absolute path" >&2
        exit 1
        ;;
esac

BUG_LOG_DIR="${CLAUDE_PLUGIN_ROOT}/data"
BUG_LOG_FILE="${BUG_LOG_DIR}/bugs.json"
BUG_LOG_COUNT_FILE="${BUG_LOG_DIR}/.entry_count"

# Validate directory is within plugin root (no path traversal)
case "$BUG_LOG_DIR" in
    "${CLAUDE_PLUGIN_ROOT}/data"|"${CLAUDE_PLUGIN_ROOT}/data/"*) ;;
    *)  echo "Error: Invalid bug log directory" >&2
        exit 1
        ;;
esac

# Ensure directory exists with restricted permissions
if ! mkdir -p "$BUG_LOG_DIR"; then
    echo "Error: Failed to create directory $BUG_LOG_DIR" >&2
    exit 1
fi

# Check available disk space before proceeding
check_disk_space() {
    local available_kb
    if ! available_kb=$(df -k "$BUG_LOG_DIR" 2>/dev/null | awk 'NR==2 {print $4}'); then
        echo "Warning: Could not check available disk space" >&2
        return 0
    fi

    if [ -n "$available_kb" ] && [ "$available_kb" -lt "$MIN_DISK_SPACE_KB" ]; then
        echo "Error: Insufficient disk space (less than ${MIN_DISK_SPACE_KB}KB available)" >&2
        return 1
    fi
    return 0
}

# Rotate log if it exceeds size or entry limit
rotate_log_if_needed() {
    local file_size entry_count

    # Check file size if file exists
    if [ -f "$BUG_LOG_FILE" ]; then
        file_size=$(wc -c < "$BUG_LOG_FILE" 2>/dev/null || echo "0")
        if [ "$file_size" -ge "$MAX_LOG_SIZE" ]; then
            rotate_log
            return
        fi

        # Check entry count
        entry_count=$(get_entry_count)
        if [ "$entry_count" -ge "$MAX_LOG_ENTRIES" ]; then
            rotate_log
            return
        fi
    fi
}

# Get current entry count efficiently
get_entry_count() {
    if [ ! -f "$BUG_LOG_FILE" ]; then
        echo "0"
        return
    fi
    awk '/"tool"/{c++} END{print c+0}' "$BUG_LOG_FILE" 2>/dev/null || echo "0"
}

# Rotate log file with timestamp
rotate_log() {
    local timestamp
    timestamp=$(date -u +"%Y%m%d_%H%M%S")
    local archive_file="${BUG_LOG_DIR}/bugs_${timestamp}.json"

    if [ -f "$BUG_LOG_FILE" ]; then
        if ! mv "$BUG_LOG_FILE" "$archive_file"; then
            echo "Warning: Could not archive old log file" >&2
            # Continue with clearing the file
            > "$BUG_LOG_FILE"
        fi
    fi
}

# Perform dependency check
check_dependencies

# Check disk space
check_disk_space || exit 1

# Check if rotation is needed
rotate_log_if_needed

# Read JSON input with size limit (max 64KB)
MAX_INPUT_SIZE=65536
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

# Extract values using awk - properly matching JSON key-value pairs
# JSON format: {"name": "...", "error": "...", ...}
extract_json_value() {
    local key="$1"
    local json="$2"
    local value

    # Match "key": "value" pattern in JSON
    value=$(printf '%s' "$json" | awk -v key="$key" '{
        # Escape special regex chars in key
        gsub(/[\[\](){}|^$.*+?\\]/, "\\\\&", key);
        pattern = "\"" key "\"[[:space:]]*:[[:space:]]*\"[^\"]*\"";
        if (match($0, pattern)) {
            val = substr($0, RSTART, RLENGTH);
            # Extract the value between the quotes after the colon
            gsub(/^[^"]*"[[:space:]]*:[[:space:]]*"/, "", val);
            gsub(/".*$/, "", val);
            print val;
            exit;
        }
    }')

    printf '%s' "$value"
}

tool_name=$(extract_json_value "name" "$input")
error_message=$(extract_json_value "error" "$input")

# Validate raw input contains only printable characters (strip control chars except newline/tab)
validate_input() {
    local input="$1"
    # Remove control characters but keep newline, tab
    printf '%s' "$input" | tr -d '[:cntrl:]' | head -c 1000
}

if [ -n "$tool_name" ]; then
    tool_name=$(validate_input "$tool_name")
fi

if [ -n "$error_message" ]; then
    error_message=$(validate_input "$error_message")
fi

# Fallback if extraction failed
[ -z "$tool_name" ] && tool_name="Unknown"
[ -z "$error_message" ] && error_message="Unknown error"

# Sanitize for JSON - escape in correct order:
# 1. Backslashes FIRST (before other escapes that use backslash)
# 2. Control characters (backspace, formfeed)
# 3. Newlines, tabs, returns
# 4. Quotes
# 5. Normalize whitespace
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

tool_name=$(sanitize_json "$tool_name")
error_message=$(sanitize_json "$error_message")

# Truncate excessively long values to prevent log bloat
tool_name=$(printf '%s' "$tool_name" | cut -c1-100)
error_message=$(printf '%s' "$error_message" | cut -c1-500)

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Create bug entry with proper JSON escaping
bug_entry=$(cat <<EOF
{
    "timestamp": "$timestamp",
    "tool": "$tool_name",
    "message": "$error_message"
}
EOF
)

# Append to JSON array (handle empty file case) with atomic write
if [ ! -f "$BUG_LOG_FILE" ] || [ ! -s "$BUG_LOG_FILE" ]; then
    if ! echo "[$bug_entry]" > "$BUG_LOG_FILE"; then
        echo "Error: Failed to write to $BUG_LOG_FILE" >&2
        exit 1
    fi
else
    # Atomic write using temp file
    if ! temp_file=$(mktemp "${BUG_LOG_DIR}/bug_catcher.XXXXXX.json"); then
        echo "Error: Failed to create temp file" >&2
        exit 1
    fi

    # Validate temp file is within expected directory
    case "$temp_file" in
        "${BUG_LOG_DIR}/bug_catcher."*) ;;
        *)  rm -f "$temp_file"
            echo "Error: Temp file created outside expected directory" >&2
            exit 1
            ;;
    esac

    # Remove trailing ] and add new entry
    if ! sed '$ s/\]//' "$BUG_LOG_FILE" > "$temp_file"; then
        rm -f "$temp_file"
        echo "Error: Failed to process existing bug log" >&2
        exit 1
    fi
    if ! echo ",$bug_entry]" >> "$temp_file"; then
        rm -f "$temp_file"
        echo "Error: Failed to append bug entry" >&2
        exit 1
    fi

    # Atomic replace
    if ! mv "$temp_file" "$BUG_LOG_FILE"; then
        rm -f "$temp_file"
        echo "Error: Failed to update bug log" >&2
        exit 1
    fi
fi

# Set file permissions - log warning if fails (may not work on all filesystems)
if ! chmod 600 "$BUG_LOG_FILE" 2>/dev/null; then
    echo "Warning: Could not set restrictive permissions on bug log file" >&2
fi

exit 0
