#!/bin/bash
# CLAUDE.md Hook - Prepends project rules to every user prompt
# Triggered by UserPromptSubmit hook

set -euo pipefail

# Find CLAUDE.md in the project root (where this plugin is installed)
# Walk up directories to find it
find_claude_md() {
    local current_dir="$1"
    local max_depth=10
    local depth=0

    while [ $depth -lt $max_depth ]; do
        if [ -f "$current_dir/CLAUDE.md" ]; then
            echo "$current_dir/CLAUDE.md"
            return 0
        fi
        if [ "$current_dir" = "/" ]; then
            break
        fi
        current_dir=$(dirname "$current_dir")
        ((depth++))
    done
    return 1
}

# Find CLAUDE.md starting from plugin root
CLAUDE_MD=$(find_claude_md "${CLAUDE_PLUGIN_ROOT:-$(pwd)}") || true

if [ -z "$CLAUDE_MD" ] || [ ! -f "$CLAUDE_MD" ]; then
    exit 0
fi

# Read the full input (user prompt) - support large inputs up to 1MB
MAX_INPUT_SIZE=1048576
input=$(dd bs=1 count=$MAX_INPUT_SIZE 2>/dev/null || true)

if [ -z "$input" ]; then
    exit 0
fi

# Validate input size wasn't truncated
input_len=$(printf '%s' "$input" | wc -c)
if [ "$input_len" -ge $MAX_INPUT_SIZE ]; then
    exit 0
fi

# Sanitize CLAUDE.md path to prevent injection
case "$CLAUDE_MD" in
    /*) ;;
    *)  exit 0
        ;;
esac

# Verify file exists and is readable after path validation
if [ ! -f "$CLAUDE_MD" ] || [ ! -r "$CLAUDE_MD" ]; then
    exit 0
fi

# Ensure CLAUDE_MD is within expected location (no path traversal)
case "$CLAUDE_MD" in
    /home/*|/mnt/*|/Users/*|/root/*) ;;
    *)  exit 0
        ;;
esac

# Read CLAUDE.md content (limit to 64KB to prevent bloat)
claude_md_content=$(head -c 65536 "$CLAUDE_MD")

if [ -z "$claude_md_content" ]; then
    exit 0
fi

# Check if CLAUDE.md is already in the input (avoid duplication)
if printf '%s' "$input" | grep -qF "<!-- CLAUDE_MD_START -->"; then
    exit 0
fi

# Create the combined input with CLAUDE.md prepended
# Add marker to prevent duplicate inclusion
combined=$(cat <<EOF
<!-- CLAUDE_MD_START -->
${claude_md_content}
<!-- CLAUDE_MD_END -->

${input}
EOF
)

# Output the combined content
printf '%s' "$combined"

exit 0