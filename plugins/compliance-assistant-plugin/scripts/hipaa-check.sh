#!/usr/bin/env bash
# HIPAA compliance check script
# Scans for HIPAA compliance issues

set -e

# Get the plugin root directory
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Default to current directory if no arguments
SCAN_PATH="${1:-.}"

echo "Checking HIPAA compliance..."
echo "Path: $SCAN_PATH"
echo ""

# Run the HIPAA check
node "$PLUGIN_ROOT/index.js" <<EOF
const plugin = require('./index.js');
const result = plugin.hipaaCheck({
  path: '$SCAN_PATH',
  severity: 'medium'
});
console.log(result.text);
EOF

echo ""
echo "HIPAA check complete."
echo "HIPAA Security Rule Key Areas:"
echo "  ✓ Administrative safeguards (policies and procedures)"
echo "  ✓ Physical safeguards (facility access and control)"
echo "  ✓ Technical safeguards (access control, audit controls, encryption)"
echo ""
echo "For detailed guidance, see: https://www.hhs.gov/hipaa/"
