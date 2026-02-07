#!/usr/bin/env bash
# SOC2 compliance check script
# Scans for SOC2 compliance issues

set -e

# Get the plugin root directory
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Default to current directory if no arguments
SCAN_PATH="${1:-.}"

echo "Checking SOC2 compliance..."
echo "Path: $SCAN_PATH"
echo ""

# Run the SOC2 check
node "$PLUGIN_ROOT/index.js" <<EOF
const plugin = require('./index.js');
const result = plugin.soc2Check({
  path: '$SCAN_PATH',
  severity: 'medium'
});
console.log(result.text);
EOF

echo ""
echo "SOC2 check complete."
echo "SOC2 Trust Services Criteria:"
echo "  Security: Access controls, encryption, monitoring"
echo "  Availability: Backup and recovery"
echo "  Processing Integrity: Change management"
echo "  Confidentiality: Data classification"
echo "  Privacy: Data handling practices"
echo ""
echo "For detailed guidance, see: https://www.aicpa.org/trust-services-criteria"
