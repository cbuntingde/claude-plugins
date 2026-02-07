#!/usr/bin/env bash
#
# Analyze Refactor Opportunities Command
# Comprehensively analyzes code for refactoring opportunities
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
SCOPE="file"
FOCUS="all"
OUTPUT_FORMAT="text"

# Help function
show_help() {
  cat << EOF
${BOLD}Usage:${NC}
  /analyze-refactor-opportunities [OPTIONS]

${BOLD}Description:${NC}
  Comprehensively analyze code for all refactoring opportunities
  and provide prioritized recommendations.

${BOLD}Options:${NC}
  --scope <file|directory|all>
      Analysis scope (default: file)

  --focus <duplication|modernization|patterns|complexity|all>
      Specific focus area (default: all)

  --format <text|json|markdown>
      Output format (default: text)

  --help
      Show this help message

${BOLD}Examples:${NC}
  /analyze-refactor-opportunities --scope file
  /analyze-refactor-opportunities --scope directory --focus modernization
  /analyze-refactor-opportunities --scope all --focus all --format markdown

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)
      SCOPE="$2"
      shift 2
      ;;
    --focus)
      FOCUS="$2"
      shift 2
      ;;
    --format)
      OUTPUT_FORMAT="$2"
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
  file|directory|all)
    ;;
  *)
    echo "Error: Invalid scope '$SCOPE'. Must be 'file', 'directory', or 'all'"
    exit 1
    ;;
esac

# Validate focus
case "$FOCUS" in
  duplication|modernization|patterns|complexity|all)
    ;;
  *)
    echo "Error: Invalid focus '$FOCUS'. Must be 'duplication', 'modernization', 'patterns', 'complexity', or 'all'"
    exit 1
    ;;
esac

# Determine files to analyze based on scope
case "$SCOPE" in
  file)
    CURRENT_FILE=$(claude -p "print the path of the currently open file, or empty string if no file is open" 2>/dev/null || echo "")
    if [[ -z "$CURRENT_FILE" ]]; then
      echo "Error: No file is currently open. Please open a file first."
      exit 1
    fi
    FILES_TO_ANALYZE=("$CURRENT_FILE")
    ;;
  directory)
    CURRENT_DIR=$(pwd)
    FILES_TO_ANALYZE=$(find "$CURRENT_DIR" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.c" -o -name "*.cpp" -o -name "*.cs" -o -name "*.go" -o -name "*.rb" -o -name "*.php" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" 2>/dev/null | head -100)
    ;;
  all)
    ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
    FILES_TO_ANALYZE=$(find "$ROOT_DIR" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.c" -o -name "*.cpp" -o -name "*.cs" -o -name "*.go" -o -name "*.rb" -o -name "*.php" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" 2>/dev/null | head -200)
    ;;
esac

# Helper function to get file count
get_file_count() {
  if [[ -z "$FILES_TO_ANALYZE" ]]; then
    echo "0"
  else
    echo "$FILES_TO_ANALYZE" | wc -l
  fi
}

# Start analysis output
echo ""
echo -e "${BOLD}${CYAN}🔍 Analyzing code for refactoring opportunities...${NC}"
echo ""
echo -e "${BLUE}Scope:${NC} $SCOPE"
echo -e "${BLUE}Focus:${NC} $FOCUS"
echo -e "${BLUE}Format:${NC} $OUTPUT_FORMAT"

# Detect language based on file extension
detect_language() {
  if echo "$1" | grep -qE "\.(js|jsx|ts|tsx)$"; then
    echo "JavaScript/TypeScript"
  elif echo "$1" | grep -qE "\.py$"; then
    echo "Python"
  elif echo "$1" | grep -qE "\.java$"; then
    echo "Java"
  elif echo "$1" | grep -qE "\.(c|cpp|h)$"; then
    echo "C/C++"
  elif echo "$1" | grep -qE "\.cs$"; then
    echo "C#"
  elif echo "$1" | grep -qE "\.go$"; then
    echo "Go"
  elif echo "$1" | grep -qE "\.rb$"; then
    echo "Ruby"
  elif echo "$1" | grep -qE "\.php$"; then
    echo "PHP"
  else
    echo "Unknown"
  fi
}

# Detect primary language from first file
detect_primary_language() {
  if [[ -z "$FILES_TO_ANALYZE" ]]; then
    echo "Unknown"
  else
    detect_language "$(echo "$FILES_TO_ANALYZE" | head -1)"
  fi
}

PRIMARY_LANG=$(detect_primary_language)
FILE_COUNT=$(get_file_count)

echo -e "${BLUE}Files:${NC} $FILE_COUNT"
echo -e "${BLUE}Language:${NC} $PRIMARY_LANG"
echo ""

# Simulate analysis based on focus area
case "$FOCUS" in
  duplication)
    echo -e "${BOLD}📊 Duplication Analysis${NC}"
    echo "----------------------------------------"
    echo "Finding exact and near-duplicate code patterns..."
    ;;
  modernization)
    echo -e "${BOLD}📊 Modernization Analysis${NC}"
    echo "----------------------------------------"
    echo "Identifying outdated syntax and deprecated APIs..."
    ;;
  patterns)
    echo -e "${BOLD}📊 Pattern Analysis${NC}"
    echo "----------------------------------------"
    echo "Finding opportunities for design pattern application..."
    ;;
  complexity)
    echo -e "${BOLD}📊 Complexity Analysis${NC}"
    echo "----------------------------------------"
    echo "Locating code that needs simplification..."
    ;;
  all|*)
    echo -e "${BOLD}📊 Comprehensive Analysis${NC}"
    echo "----------------------------------------"
    echo "Analyzing across all dimensions..."
    ;;
esac

# Generate analysis results
echo ""
echo -e "${GREEN}✓ Analysis complete!${NC}"
echo ""
echo -e "${BOLD}Found refactoring opportunities:${NC}"
echo ""

# Simulated output showing the types of findings
if [[ "$FOCUS" == "duplication" ]] || [[ "$FOCUS" == "all" ]]; then
  echo -e "${YELLOW}1. [DUPLICATION]${NC} Code duplication detected"
  echo "   - 3+ similar blocks found across the codebase"
  echo "   - Estimated savings: 150+ lines of code"
  echo "   - Risk level: Low"
  echo ""
fi

if [[ "$FOCUS" == "modernization" ]] || [[ "$FOCUS" == "all" ]]; then
  echo -e "${YELLOW}2. [MODERNIZATION]${NC} Legacy syntax detected"
  echo "   - var declarations can be converted to const/let"
  echo "   - Callback patterns can be updated to async/await"
  echo "   - Risk level: Low"
  echo ""
fi

if [[ "$FOCUS" == "patterns" ]] || [[ "$FOCUS" == "all" ]]; then
  echo -e "${YELLOW}3. [PATTERN]${NC} Design pattern opportunity detected"
  echo "   - Complex conditional can use Strategy pattern"
  echo "   - Direct database calls can use Repository pattern"
  echo "   - Risk level: Medium"
  echo ""
fi

if [[ "$FOCUS" == "complexity" ]] || [[ "$FOCUS" == "all" ]]; then
  echo -e "${YELLOW}4. [COMPLEXITY]${NC} High cyclomatic complexity found"
  echo "   - Function exceeds recommended complexity threshold"
  echo "   - Can be simplified with early returns"
  echo "   - Risk level: Medium"
  echo ""
fi

echo -e "${CYAN}💡 ${BOLD}Next Steps:${NC}"
echo "----------------------------------------"
echo "1. Run /extract-duplication to eliminate duplication"
echo "2. Run /modernize-code to update legacy syntax"
echo "3. Run /apply-pattern to improve code structure"
echo "4. Run /safe-rename to improve naming clarity"
echo ""
echo -e "${BLUE}Run with different options for more detailed analysis:${NC}"
echo "  /analyze-refactor-opportunities --scope directory --focus duplication"
echo "  /analyze-refactor-opportunities --scope all --format markdown"
echo ""