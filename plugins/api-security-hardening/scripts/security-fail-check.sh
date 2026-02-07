#!/bin/bash
# Check for API security issues on write failures

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"
NODE_CMD="${NODE_CMD:-node}"

# Run targeted security check when file writes fail
"$NODE_CMD" "$PLUGIN_ROOT/scripts/api-security-audit.js" --severity critical --output json
