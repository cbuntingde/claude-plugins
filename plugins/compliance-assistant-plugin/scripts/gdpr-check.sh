#!/usr/bin/env bash
# GDPR compliance check script
# Scans for GDPR compliance issues

set -e

# Get the plugin root directory
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Default to current directory if no arguments
SCAN_PATH="${1:-.}"

echo "Checking GDPR compliance..."
echo "Path: $SCAN_PATH"
echo ""

# Run the GDPR check
node "$PLUGIN_ROOT/index.js" <<EOF
const plugin = require('./index.js');
const result = plugin.gdprCheck({
  path: '$SCAN_PATH',
  severity: 'medium'
});
console.log(result.text);
EOF

echo ""
echo "GDPR check complete."
echo "Key GDPR Requirements:"
echo "  ✓ Lawful basis for processing (Article 6)"
echo "  ✓ Consent management (Article 7)"
echo "  ✓ Right to erasure (Article 17)"
echo "  ✓ Right to portability (Article 20)"
echo "  ✓ Data protection by design (Article 25)"
echo ""
echo "For detailed guidance, see: https://gdpr-info.eu/"
