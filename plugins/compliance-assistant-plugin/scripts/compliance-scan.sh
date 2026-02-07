#!/usr/bin/env bash
# Comprehensive compliance scan script
# Runs full compliance scan across all frameworks

set -e

# Get the plugin root directory
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Parse arguments
SCAN_PATH="."
FRAMEWORKS="gdpr,hipaa,soc2"
PII_SCAN="true"
SEVERITY="medium"

while [[ $# -gt 0 ]]; do
  case $1 in
    --path)
      SCAN_PATH="$2"
      shift 2
      ;;
    --frameworks)
      FRAMEWORKS="$2"
      shift 2
      ;;
    --no-pii)
      PII_SCAN="false"
      shift
      ;;
    --severity)
      SEVERITY="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--path PATH] [--frameworks LIST] [--no-pii] [--severity LEVEL]"
      exit 1
      ;;
  esac
done

echo "═════════════════════════════════════════════"
echo "    COMPREHENSIVE COMPLIANCE SCAN"
echo "═════════════════════════════════════════════"
echo ""
echo "Path: $SCAN_PATH"
echo "Frameworks: $FRAMEWORKS"
echo "PII Detection: $PII_SCAN"
echo "Severity Threshold: $SEVERITY"
echo ""

# Convert frameworks string to array
IFS=',' read -ra FRAMEWORK_ARRAY <<< "$FRAMEWORKS"

# Run the comprehensive compliance scan
node "$PLUGIN_ROOT/index.js" <<EOF
const plugin = require('./index.js');
const frameworks = ${FRAMEWORKS[@]#};
const result = plugin.complianceScan({
  path: '$SCAN_PATH',
  frameworks: frameworks,
  pii: $PII_SCAN,
  severity: '$SEVERITY'
});
console.log(result.text);
EOF

echo ""
echo "═════════════════════════════════════════════"
echo "    COMPLIANCE SCAN COMPLETE"
echo "═════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "  1. Review critical and high severity findings"
echo "  2. Verify findings are not false positives"
echo "  3. Implement recommended remediations"
echo "  4. Re-scan to verify fixes"
echo ""
echo "Resources:"
echo "  GDPR: https://gdpr-info.eu/"
echo "  HIPAA: https://www.hhs.gov/hipaa/"
echo "  SOC2: https://www.aicpa.org/trust-services-criteria"
