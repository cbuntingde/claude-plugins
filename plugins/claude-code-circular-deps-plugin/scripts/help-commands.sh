#!/bin/bash
# Show help information for circular dependency plugin commands

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "  Circular Dependency Plugin - Help"
echo "=============================================="
echo ""
echo "This plugin provides commands for detecting, fixing, and monitoring"
echo "circular dependencies in your TypeScript/JavaScript projects."
echo ""
echo "Available Commands:"
echo ""
echo "  /detect-circular"
echo "    Detects circular dependencies in the current project."
echo ""
echo "  /fix-circular"
echo "    Analyzes circular dependencies and provides actionable suggestions."
echo ""
echo "  /monitor-deps"
echo "    Continuously monitors for new circular dependencies."
echo ""
echo "  /visualize-deps"
echo "    Generates a visual representation of the dependency graph."
echo ""
echo "For more information, see: $PLUGIN_ROOT/README.md"
echo ""

# Display help from the commands directory
if [ -d "$PLUGIN_ROOT/commands" ]; then
  echo "Command Documentation Files:"
  for md in "$PLUGIN_ROOT/commands"/*.md; do
    if [ -f "$md" ]; then
      echo "  - $(basename "$md" .md)"
    fi
  done
fi