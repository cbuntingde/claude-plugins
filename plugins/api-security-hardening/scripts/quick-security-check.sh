#!/bin/bash
# Quick API security check on file writes

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"
NODE_CMD="${NODE_CMD:-node}"

# Run quick API security check on modified files
"$NODE_CMD" "$PLUGIN_ROOT/scripts/api-security-audit.js" --severity high --output json
