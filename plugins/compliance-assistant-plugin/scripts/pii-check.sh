#!/usr/bin/env bash
# PII detection script
# Scans for Personally Identifiable Information in code

set -e

# Get the plugin root directory
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Default to current directory if no arguments
SCAN_PATH="${1:-.}"

echo "Scanning for PII..."
echo "Path: $SCAN_PATH"
echo ""
echo "⚠️  This scan uses pattern matching and may produce false positives."
echo "    Always verify findings before taking action."
echo ""

# Run the PII scan
node "$PLUGIN_ROOT/index.js" <<EOF
const plugin = require('./index.js');
const result = plugin.piiScan({
  path: '$SCAN_PATH',
  categories: ['email', 'ssn', 'creditCard', 'phone', 'ipAddress', 'passport', 'driversLicense', 'bankAccount', 'dateOfBirth', 'medicalRecord', 'healthInsurance'],
  severity: 'medium'
});
console.log(result.text);
EOF

echo ""
echo "PII scan complete."
echo "If any findings are confirmed PII:"
echo "  1. Remove the file from version control"
echo "  2. Use git filter-branch or BFG Repo-Cleaner to clean history"
echo "  3. Rotate any exposed credentials"
echo "  4. Update .gitignore to prevent future commits"
