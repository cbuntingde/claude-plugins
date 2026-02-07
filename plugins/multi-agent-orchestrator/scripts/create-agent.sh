#!/usr/bin/env bash
#
# Create Agent Command
#
# Creates a new custom agent definition.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/create-agent.js" "$@"
