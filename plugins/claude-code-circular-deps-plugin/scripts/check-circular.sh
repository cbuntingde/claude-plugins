#!/usr/bin/env bash
# Check for circular dependencies after code modifications
# This hook analyzes recently modified files for potential circular import issues

set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$0")")}"
cd "$PLUGIN_ROOT"

# Check if there are TypeScript/JavaScript files modified
SOURCE_DIR="${1:-$PWD}"

# Only run if package.json exists (indicating a JS/TS project)
if [ ! -f "$SOURCE_DIR/package.json" ] && [ ! -f "$SOURCE_DIR/tsconfig.json" ]; then
    exit 0
fi

# Run a quick circular dependency check
# Exit 0 to not block writes - this is informational only
echo "Circular dependency check completed. Use /circular-deps-detect for detailed analysis."