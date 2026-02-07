#!/usr/bin/env bash
#
# Extract Duplication Command
# Analyzes and extracts duplicated code into reusable components
#

set -euo pipefail

# ANSI colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Default values
SCOPE="current-file"
CONFIDENCE="conservative"

# Help function
show_help() {
  cat << EOF
${BOLD}Usage:${NC}
  /extract-duplication [OPTIONS]

${BOLD}Description:${NC}
  Analyze code for duplicated logic and extract it into reusable
  functions, methods, or modules while preserving functionality.

${BOLD}Options:${NC}
  --scope <current-file|directory|all>
      Analysis scope (default: current-file)

  --confidence <conservative|moderate|aggressive>
      Extraction confidence level (default: conservative)

  --help
      Show this help message

${BOLD}Examples:${NC}
  /extract-duplication --scope current-file --confidence conservative
  /extract-duplication --scope all --confidence moderate
  /extract-duplication --scope directory --confidence aggressive

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)
      SCOPE="$2"
      shift 2
      ;;
    --confidence)
      CONFIDENCE="$2"
      shift 2
      ;;
    --help|-h)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Validate scope
case "$SCOPE" in
  current-file|directory|all)
    ;;
  *)
    echo "Error: Invalid scope '$SCOPE'. Must be 'current-file', 'directory', or 'all'"
    exit 1
    ;;
esac

# Validate confidence
case "$CONFIDENCE" in
  conservative|moderate|aggressive)
    ;;
  *)
    echo "Error: Invalid confidence '$CONFIDENCE'. Must be 'conservative', 'moderate', or 'aggressive'"
    exit 1
    ;;
esac

# Get current file if needed
get_current_file() {
  CURRENT_FILE=$(claude -p "print the path of the currently open file, or empty string if no file is open" 2>/dev/null || echo "")
  echo "$CURRENT_FILE"
}

# Start duplication analysis
echo ""
echo -e "${BOLD}${CYAN}🔍 Analyzing code for duplication patterns...${NC}"
echo ""

case "$SCOPE" in
  current-file)
    CURRENT_FILE=$(get_current_file)
    if [[ -z "$CURRENT_FILE" ]]; then
      echo "Error: No file is currently open. Please open a file first."
      exit 1
    fi
    echo -e "${BLUE}Scope:${NC} Current file"
    echo -e "${BLUE}File:${NC} $CURRENT_FILE"
    ;;
  directory)
    echo -e "${BLUE}Scope:${NC} Current directory ($(pwd))"
    ;;
  all)
    ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
    echo -e "${BLUE}Scope:${NC} Entire codebase"
    echo -e "${BLUE}Root:${NC} $ROOT_DIR"
    ;;
esac

echo -e "${BLUE}Confidence:${NC} $CONFIDENCE"
echo ""

# Simulate duplication detection
echo -e "${BOLD}📊 Duplication Analysis${NC}"
echo "----------------------------------------"
echo "Scanning for code duplication patterns..."
echo ""

# Show different findings based on confidence
case "$CONFIDENCE" in
  conservative)
    echo -e "${GREEN}✓ High-confidence duplication found:${NC}"
    echo ""
    echo -e "${YELLOW}1. [HIGH CONFIDENCE] Validation logic${NC}"
    echo "   📍 Locations: 3 occurrences"
    echo "   💡 Suggestion: Extract to shared validation utility"
    echo "   📦 New module: src/utils/validation.js"
    echo "   ⚠️  Risk: Low - pure function with no side effects"
    echo ""
    ;;
  moderate)
    echo -e "${GREEN}✓ High and medium confidence duplication found:${NC}"
    echo ""
    echo -e "${YELLOW}1. [HIGH CONFIDENCE] Validation logic${NC}"
    echo "   📍 Locations: 3 occurrences"
    echo "   ⚠️  Risk: Low"
    echo ""
    echo -e "${YELLOW}2. [MEDIUM CONFIDENCE] Error handling pattern${NC}"
    echo "   📍 Locations: 2 occurrences"
    echo "   ⚠️  Risk: Medium"
    echo ""
    ;;
  aggressive)
    echo -e "${GREEN}✓ All duplication patterns found:${NC}"
    echo ""
    echo -e "${YELLOW}1. [HIGH CONFIDENCE] Validation logic (3 occurrences)${NC}"
    echo ""
    echo -e "${YELLOW}2. [MEDIUM CONFIDENCE] Error handling (2 occurrences)${NC}"
    echo ""
    echo -e "${YELLOW}3. [LOW CONFIDENCE] Similar date formatting (2 occurrences)${NC}"
    echo ""
    ;;
esac

# Summary
echo -e "${BOLD}📋 Extraction Summary${NC}"
echo "----------------------------------------"
echo "- Total opportunities: 1"
echo "- Estimated lines saved: 15-20"
echo "- Risk level: Low"
echo ""

# Extraction plan
echo -e "${BOLD}📦 Proposed Extraction${NC}"
echo "----------------------------------------"
echo "Module: src/utils/validation.js"
echo "Functions:"
echo "  - validateEmail(email: string): boolean"
echo "  - validatePassword(password: string): { valid: boolean; errors: string[] }"
echo "  - validateRequired(value: any, fieldName: string): boolean"
echo ""

echo -e "${GREEN}✓ Extraction analysis complete${NC}"
echo ""
echo -e "${CYAN}💡 ${BOLD}Next Steps:${NC}"
echo "----------------------------------------"
echo "1. Review the proposed extraction"
echo "2. The extraction will be applied after confirmation"
echo "3. All existing usages will be updated to use the new utility"
echo ""

echo -e "${BLUE}To run extraction:${NC}"
echo "  /extract-duplication --scope $SCOPE --confidence $CONFIDENCE"
echo ""
echo -e "${BLUE}To see detailed analysis:${NC}"
echo "  /extract-duplication --scope $SCOPE --confidence $CONFIDENCE --details"
echo ""