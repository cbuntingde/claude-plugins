#!/bin/bash
# Hook test script - logs when any hook triggers

set -euo pipefail

HOOK_LOG="${HOME}/.claude-hook-test.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Get hook type from environment if available
HOOK_TYPE="${CLAUDE_HOOK_TYPE:-unknown}"

# Read the tool name being used
TOOL_NAME="${1:-}"

echo "[${TIMESTAMP}] Hook triggered: ${HOOK_TYPE} (tool: ${TOOL_NAME})" >> "${HOOK_LOG}"

# Also output marker to stdout so it's visible
echo "<!-- HOOK_TRIGGERED:${HOOK_TYPE}:${TOOL_NAME} -->"

exit 0