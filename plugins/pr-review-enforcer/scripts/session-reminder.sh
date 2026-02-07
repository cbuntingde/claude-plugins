#!/bin/bash
# PR Review Enforcer - Session Start Reminder
# Displays PR review standards reminder at session start

set -euo pipefail

# Color codes for output
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📋 PR Review Enforcer Active${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Remember to follow PR review standards:${NC}"
echo ""
echo "  ✓ Include PR description with Summary, Changes, Testing sections"
echo "  ✓ Add/update tests for all code changes"
echo "  ✓ Document new features and API changes"
echo "  ✓ Run /pr-report before submitting PR"
echo ""
echo -e "${CYAN}Available commands:${NC}"
echo "  /pr-validate       - Validate PR description"
echo "  /pr-check-tests    - Check test coverage"
echo "  /pr-check-docs     - Check documentation"
echo "  /pr-report         - Generate comprehensive report"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""

exit 0
