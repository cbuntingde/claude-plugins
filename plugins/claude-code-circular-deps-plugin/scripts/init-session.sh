#!/usr/bin/env bash
# Initialize dependency tracking for the session
# Sets up environment for circular dependency detection

set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$0")")}"
cd "$PLUGIN_ROOT"

echo "Circular Dependency Plugin loaded."
echo "Available commands: /circular-deps-detect, /circular-deps-fix, /circular-deps-monitor, /circular-deps-visualize"
echo "Use /circular-deps-detect --help for options."