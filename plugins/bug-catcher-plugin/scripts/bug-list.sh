#!/bin/bash
# Bug Catcher - List Bugs Script
# Displays captured bugs in a formatted table

set -euo pipefail

# Validate required dependencies are available
check_dependencies() {
    local missing_deps=()
    for cmd in awk sed grep wc head; do
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

# Check if data directory exists
if [ ! -d "$BUG_LOG_DIR" ]; then
    echo "No bugs captured yet."
    echo ""
    echo "The bug catcher will store captured bugs in: $BUG_LOG_DIR"
    echo "Bug capture is active and will log tool failures automatically."
    exit 0
fi

if [ ! -f "$BUG_LOG_FILE" ] || [ ! -s "$BUG_LOG_FILE" ]; then
    echo "No bugs captured yet."
    echo ""
    echo "The bug catcher is running in the background and will capture"
    echo "tool failures automatically. Run this command again after some"
    echo "tool calls fail to see the captured errors."
    exit 0
fi

# Perform dependency check
check_dependencies

# Get bug count efficiently using awk (single pass)
if ! line_count=$(awk '/"tool"/{c++} END{print c+0}' "$BUG_LOG_FILE"); then
    echo "Error: Failed to parse bug log file" >&2
    exit 1
fi

# Check if command succeeded
if [ -z "$line_count" ]; then
    echo "No bugs captured yet."
    exit 0
fi

# Validate line_count is a number using case statement for portability
case "$line_count" in
    ''|*[!0-9]*)
        echo "Error: Failed to parse bug log (invalid format)" >&2
        exit 1
        ;;
esac

if [ "$line_count" -eq 0 ]; then
    echo "No bugs captured yet."
    exit 0
fi

# Print table header
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                           CAPTURED BUGS                                  ║"
echo "╠══════════════════════════════════════════════════════════════════════════╣"
echo "║  #   │ Timestamp           │ Tool       │ Error Message                  ║"
echo "╠══════╪═════════════════════╪════════════╪════════════════════════════════╣"

# Use awk to parse and format all entries in a single pass
# Sanitize output to prevent terminal escape sequence injection
awk -F'"' -v max_len=28 -v tool_len=10 '
BEGIN { line_num = 1 }
{
    # Find timestamp, tool, and message fields
    timestamp = ""; tool = ""; message = ""
    for(i=1;i<=NF;i++) {
        if($i=="timestamp:") { gsub(/^[ ]+|[ ]+$/,"",$(i+2)); timestamp=$(i+2) }
        if($i=="tool:")      { gsub(/^[ ]+|[ ]+$/,"",$(i+2)); tool=$(i+2) }
        if($i=="message:")   { gsub(/^[ ]+|[ ]+$/,"",$(i+2)); message=$(i+2) }
    }
    if(timestamp=="" || tool=="" || message=="") next

    # Comprehensive sanitization to remove terminal control sequences
    # Remove ANSI escape sequences (ESC[...), OSC sequences, and other control chars
    gsub(/\033\[[0-9;]*[mGKHf]/, "", timestamp)
    gsub(/\033\][0-9];[^\007]+\007/, "", timestamp)
    gsub(/\033\][0-9];[^\033]*\033\\/, "", timestamp)
    gsub(/\033/, "", timestamp)
    gsub(/\r/, "", timestamp)

    gsub(/\033\[[0-9;]*[mGKHf]/, "", tool)
    gsub(/\033\][0-9;][^\007]+\007/, "", tool)
    gsub(/\033\][0-9;][^\033]*\033\\/, "", tool)
    gsub(/\033/, "", tool)
    gsub(/\r/, "", tool)

    gsub(/\033\[[0-9;]*[mGKHf]/, "", message)
    gsub(/\033\][0-9;][^\007]+\007/, "", message)
    gsub(/\033\][0-9;][^\033]*\033\\/, "", message)
    gsub(/\033/, "", message)
    gsub(/\r/, "", message)

    # Extract time portion (HH:MM:SS) from ISO timestamp
    sub(/.*T/,"",timestamp)
    sub(/Z$/,"",timestamp)

    # Truncate message if too long
    if(length(message) > max_len) message = substr(message, 1, max_len - 3) "..."

    # Truncate tool name if too long
    if(length(tool) > tool_len) tool = substr(tool, 1, tool_len - 2) ".."

    # Print table row
    printf "║  %-4d│ %s │ %-" tool_len "s │ %-" max_len "s ║\n", line_num, timestamp, tool, message
    line_num++
}
END {
    print "╚══════════════════════════════════════════════════════════════════════════╝"
    print ""
    print "Total bugs captured: " (line_num - 1)
    print ""
    print "Use /bug-clear to clear the captured bugs log."
}
' "$BUG_LOG_FILE"
