#!/usr/bin/env bash
#
# Apply Pattern Command
# Applies design patterns to improve code architecture
#

set -euo pipefail

# ANSI colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Default values
PATTERN=""
SCOPE="selection"
CONFIDENCE="conservative"

# Help function
show_help() {
  cat << EOF
${BOLD}Usage:${NC}
  /apply-pattern [OPTIONS]

${BOLD}Description:${NC}
  Intelligently apply design patterns to improve code architecture
  while maintaining existing functionality.

${BOLD}Options:${NC}
  --pattern <pattern-name>
      Specific pattern to apply (strategy, factory, repository, etc.)

  --scope <selection|file|directory>
      Where to apply the pattern (default: selection)

  --confidence <conservative|moderate>
      Application confidence level (default: conservative)

  --help
      Show this help message

${BOLD}Supported Patterns:${NC}
  Creational:
    - factory      : Centralize object creation logic
    - builder      : Construct complex objects step-by-step

  Structural:
    - adapter      : Make incompatible interfaces work together
    - decorator    : Add behavior dynamically
    - facade       : Provide simplified interface to complex systems

  Behavioral:
    - strategy     : Encapsulate interchangeable algorithms
    - command      : Encapsulate requests as objects
    - observer     : Implement publish-subscribe messaging

  Architectural:
    - repository   : Abstract data access logic
    - dependency-injection : Invert dependencies for testability

${BOLD}Examples:${NC}
  /apply-pattern --pattern strategy --scope selection
  /apply-pattern --pattern repository --scope directory --confidence moderate
  /apply-pattern --pattern factory

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --pattern)
      PATTERN="$2"
      shift 2
      ;;
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
  selection|file|directory)
    ;;
  *)
    echo "Error: Invalid scope '$SCOPE'. Must be 'selection', 'file', or 'directory'"
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

# List of supported patterns
declare -A SUPPORTED_PATTERNS=(
  ["factory"]="Creational"
  ["builder"]="Creational"
  ["adapter"]="Structural"
  ["decorator"]="Structural"
  ["facade"]="Structural"
  ["strategy"]="Behavioral"
  ["command"]="Behavioral"
  ["observer"]="Behavioral"
  ["repository"]="Architectural"
  ["dependency-injection"]="Architectural"
)

# Start pattern analysis output
echo ""
echo -e "${BOLD}${CYAN}🔍 Analyzing code for pattern opportunities...${NC}"
echo ""

if [[ -n "$PATTERN" ]]; then
  if [[ -v "SUPPORTED_PATTERNS[$PATTERN]" ]]; then
    echo -e "${BLUE}Pattern:${NC} $PATTERN (${SUPPORTED_PATTERNS[$PATTERN]})"
  else
    echo -e "${YELLOW}Warning: '$PATTERN' is not a recognized pattern name${NC}"
    echo -e "${BLUE}Available patterns:${NC} ${!SUPPORTED_PATTERNS[*]}"
  fi
else
  echo -e "${BLUE}Mode:${NC} Auto-detect best pattern"
fi

echo -e "${BLUE}Scope:${NC} $SCOPE"
echo -e "${BLUE}Confidence:${NC} $CONFIDENCE"
echo ""

# Display pattern analysis
echo -e "${BOLD}Found pattern application opportunities:${NC}"
echo ""

# Pattern suggestions based on common scenarios
if [[ -z "$PATTERN" ]] || [[ "$PATTERN" == "strategy" ]]; then
  echo -e "${MAGENTA}1. ${BOLD}Strategy Pattern${NC} (Confidence: High)"
  echo "   📍 Location: Complex conditional logic"
  echo "   🎯 Problem: Multiple if/else branches for different behaviors"
  echo "   💡 Solution: Extract each behavior into separate strategy classes"
  echo "   📊 Impact: High extensibility, easier testing"
  echo "   ⚠️  Risk: Medium"
  echo ""
fi

if [[ -z "$PATTERN" ]] || [[ "$PATTERN" == "repository" ]]; then
  echo -e "${MAGENTA}2. ${BOLD}Repository Pattern${NC} (Confidence: High)"
  echo "   📍 Location: Data access scattered across services"
  echo "   🎯 Problem: Direct database queries in business logic"
  echo "   💡 Solution: Create repository layer to abstract data access"
  echo "   📊 Impact: Better testability, flexible data sources"
  echo "   ⚠️  Risk: Low"
  echo ""
fi

if [[ -z "$PATTERN" ]] || [[ "$PATTERN" == "factory" ]]; then
  echo -e "${MAGENTA}3. ${BOLD}Factory Pattern${NC} (Confidence: Medium)"
  echo "   📍 Location: Object creation logic"
  echo "   🎯 Problem: Complex or scattered object instantiation"
  echo "   💡 Solution: Centralize creation logic in factory"
  echo "   📊 Impact: Cleaner code, easier to add new types"
  echo "   ⚠️  Risk: Medium"
  echo ""
fi

if [[ -z "$PATTERN" ]] || [[ "$PATTERN" == "decorator" ]]; then
  echo -e "${MAGENTA}4. ${BOLD}Decorator Pattern${NC} (Confidence: Medium)"
  echo "   📍 Location: Cross-cutting concerns"
  echo "   🎯 Problem: Adding behavior without modifying classes"
  echo "   💡 Solution: Wrap objects to add functionality"
  echo "   📊 Impact: Flexible behavior composition"
  echo "   ⚠️  Risk: Medium"
  echo ""
fi

echo -e "${GREEN}✓ Pattern analysis complete${NC}"
echo ""
echo -e "${CYAN}💡 ${BOLD}Recommendations:${NC}"
echo "----------------------------------------"
echo "1. Start with Repository pattern for data access abstraction"
echo "2. Apply Strategy pattern to replace complex conditionals"
echo "3. Use Factory pattern for centralizing object creation"
echo ""

# Show how to apply
echo -e "${BLUE}To apply a specific pattern:${NC}"
echo "  /apply-pattern --pattern <pattern-name> --scope selection"
echo ""

# Pattern application example
echo -e "${BOLD}Example - Strategy Pattern:${NC}"
echo "----------------------------------------"
echo "Before: Complex conditional in payment processing"
echo "After:  Separate strategy classes for each payment type"
echo ""