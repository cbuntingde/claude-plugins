#!/bin/bash
# Run API security check on session start

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"
NODE_CMD="${NODE_CMD:-node}"

echo "Running API Security Hardening check..."

# Run comprehensive security check
"$NODE_CMD" "$PLUGIN_ROOT/scripts/api-security-audit.js" --severity medium
