#!/usr/bin/env bash
#
# List Agents Command
#
# Lists all available agent definitions.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/list-agents.js" "$@"
