#!/bin/bash
# Bug Catcher - Clear Bugs Script
# Clears the captured bugs log

set -euo pipefail

# Validate required dependencies are available
check_dependencies() {
    local missing_deps=()
    for cmd in awk sed grep wc rm date; do
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

# Ensure path is absolute
case "$CLAUDE_PLUGIN_ROOT" in
    /*) ;;
    *)  echo "Error: CLAUDE_PLUGIN_ROOT must be absolute path" >&2
        exit 1
        ;;
esac

BUG_LOG_DIR="${CLAUDE_PLUGIN_ROOT}/data"
BUG_LOG_FILE="${BUG_LOG_DIR}/bugs.json"

# Validate file is within expected location (no path traversal)
case "$BUG_LOG_FILE" in
    "${CLAUDE_PLUGIN_ROOT}/data/bugs.json") ;;
    *)  echo "Error: Invalid bug log file path" >&2
        exit 1
        ;;
esac

# Perform dependency check
check_dependencies

# Verify file exists before attempting to delete
if [ ! -f "$BUG_LOG_FILE" ]; then
    echo "No bug log to clear."
    exit 0
fi

# Double-check it is a regular file (not symlink to elsewhere)
if [ -L "$BUG_LOG_FILE" ]; then
    echo "Error: Bug log is a symbolic link, refusing to delete" >&2
    exit 1
fi

# Verify it is within the expected directory (no symlink tricks)
# Use portable approach that works on macOS, Linux, BSD
# Get the physical path of the data directory
if ! data_dir_physical=$(cd "$BUG_LOG_DIR" 2>/dev/null && pwd -P); then
    echo "Error: Could not resolve data directory path" >&2
    exit 1
fi

if [ -z "$data_dir_physical" ]; then
    echo "Error: Could not resolve data directory path" >&2
    exit 1
fi

# Build expected physical path
expected_physical="$data_dir_physical/bugs.json"

# Get the physical path of the bug log file using its parent directory
if ! file_dir_physical=$(cd "$(dirname "$BUG_LOG_FILE")" 2>/dev/null && pwd -P); then
    echo "Error: Could not resolve file directory path" >&2
    exit 1
fi

file_basename=$(basename "$BUG_LOG_FILE")
actual_physical="$file_dir_physical/$file_basename"

if [ "$actual_physical" != "$expected_physical" ]; then
    echo "Error: File path resolved outside expected location" >&2
    exit 1
fi

# Get file info before deletion for logging
if ! file_size=$(wc -c < "$BUG_LOG_FILE" 2>/dev/null); then
    file_size="0"
fi

if ! entry_count_raw=$(awk '/"tool"/{c++} END{print c+0}' "$BUG_LOG_FILE"); then
    entry_count="0"
else
    # Validate entry count is numeric using case statement for portability
    case "$entry_count_raw" in
        ''|*[!0-9]*)
            entry_count="0"
            ;;
        *)
            entry_count="$entry_count_raw"
            ;;
    esac
fi

# Delete the file
# Note: Using rm instead of shred as shred is unreliable on modern filesystems
# (SSDs, journaling filesystems, copy-on-write filesystems)
if ! rm -f "$BUG_LOG_FILE"; then
    echo "Error: Failed to delete bug log file" >&2
    exit 1
fi

# Log the clear action for audit trail
if ! mkdir -p "$BUG_LOG_DIR"; then
    echo "Warning: Could not ensure log directory exists" >&2
fi

{
    echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "Entries cleared: $entry_count"
    echo "File size: $file_size bytes"
    echo "---"
} >> "${BUG_LOG_DIR}/.clear_log" 2>/dev/null || true

echo "Bug log cleared."
exit 0
