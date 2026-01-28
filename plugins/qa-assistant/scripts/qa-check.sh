#!/bin/bash
# Main QA Check Command - runs all checks

set -euo pipefail

QA_INDEX="${CLAUDE_PLUGIN_ROOT}/index.js"

if [ ! -f "$QA_INDEX" ]; then
  echo "Error: QA Assistant not found" >&2
  exit 1
fi

node "$QA_INDEX"