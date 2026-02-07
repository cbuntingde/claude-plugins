#!/usr/bin/env bash
# Quick compliance check script
# Runs a fast compliance scan on changed or specified files

set -e

# Get the plugin root directory
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Default to current directory if no arguments
SCAN_PATH="${1:-.}"

echo "Running quick compliance check..."
echo "Path: $SCAN_PATH"
echo ""

# Run the compliance scan with medium severity threshold
node "$PLUGIN_ROOT/index.js" <<EOF
const plugin = require('./index.js');
const result = plugin.complianceScan({
  path: '$SCAN_PATH',
  frameworks: ['gdpr', 'hipaa', 'soc2'],
  pii: true,
  severity: 'medium'
});
console.log(result.text);
EOF

echo ""
echo "Quick compliance check complete."
echo "Run /compliance-scan for a full scan."
