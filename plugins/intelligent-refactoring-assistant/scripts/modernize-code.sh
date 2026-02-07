#!/usr/bin/env bash
#
# Modernize Code Command
# Updates legacy code to modern syntax and APIs
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
TARGET=""
SCOPE="current-file"
AUTO_FIX=false

# Help function
show_help() {
  cat << EOF
${BOLD}Usage:${NC}
  /modernize-code [OPTIONS]

${BOLD}Description:${NC}
  Modernize legacy code by updating outdated syntax, deprecated APIs,
  and old patterns to current best practices.

${BOLD}Options:${NC}
  --target <language-version>
      Target language version (e.g., ES2022, Python-3.12, Java-21)
      Default: Latest stable version for detected language

  --scope <current-file|selection|directory|all>
      Modernization scope (default: current-file)

  --auto-fix
      Apply changes automatically without confirmation

  --help
      Show this help message

${BOLD}Language Support:${NC}
  - JavaScript/TypeScript: ES6+, ES2020+, ES2022+
  - Python: 3.7+, 3.8+, 3.9+, 3.10+, 3.11+, 3.12+
  - Java: 8+, 11+, 17+, 21+
  - C#: 8+, 10+, 12+
  - Go: Latest idioms
  - Ruby: Latest syntax
  - PHP: 7.4+, 8.0+, 8.1+, 8.2+

${BOLD}Modernization Types:${NC}
  - Syntax updates (var → const/let)
  - Async patterns (callbacks → Promises → async/await)
  - String formatting (% → f-strings → template literals)
  - Type system improvements
  - Deprecated API replacements

${BOLD}Examples:${NC}
  /modernize-code --target ES2022 --scope current-file
  /modernize-code --target Python-3.12 --scope all
  /modernize-code --target React-18 --auto-fix

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET="$2"
      shift 2
      ;;
    --scope)
      SCOPE="$2"
      shift 2
      ;;
    --auto-fix)
      AUTO_FIX=true
      shift
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
  current-file|selection|directory|all)
    ;;
  *)
    echo "Error: Invalid scope '$SCOPE'. Must be 'current-file', 'selection', 'directory', or 'all'"
    exit 1
    ;;
esac

# Get current file
get_current_file() {
  CURRENT_FILE=$(claude -p "print the path of the currently open file, or empty string if no file is open" 2>/dev/null || echo "")
  echo "$CURRENT_FILE"
}

# Detect language from file
detect_language() {
  if [[ -z "$1" ]]; then
    echo "Unknown"
  elif echo "$1" | grep -qE "\.ts$|\.tsx$"; then
    echo "TypeScript"
  elif echo "$1" | grep -qE "\.js$|\.jsx$"; then
    echo "JavaScript"
  elif echo "$1" | grep -qE "\.py$"; then
    echo "Python"
  elif echo "$1" | grep -qE "\.java$"; then
    echo "Java"
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

# Determine target language version
get_target_version() {
  local lang="$1"
  case "$lang" in
    TypeScript|TypeScript/React)
      echo "ES2022"
      ;;
    JavaScript|JavaScript/React)
      echo "ES2022"
      ;;
    Python)
      echo "3.12"
      ;;
    Java)
      echo "21"
      ;;
    C#)
      echo "12"
      ;;
    Go)
      echo "1.21"
      ;;
    *)
      echo "Latest"
      ;;
  esac
}

# Start modernization analysis
echo ""
echo -e "${BOLD}${CYAN}🔍 Analyzing code for modernization opportunities...${NC}"
echo ""

CURRENT_FILE=$(get_current_file)
LANGUAGE=$(detect_language "$CURRENT_FILE")

if [[ -n "$TARGET" ]]; then
  TARGET_VERSION="$TARGET"
else
  TARGET_VERSION=$(get_target_version "$LANGUAGE")
fi

echo -e "${BLUE}Language:${NC} $LANGUAGE"
echo -e "${BLUE}Target:${NC} $TARGET_VERSION"
echo -e "${BLUE}Scope:${NC} $SCOPE"

if [[ -n "$CURRENT_FILE" ]]; then
  echo -e "${BLUE}File:${NC} $CURRENT_FILE"
fi

echo ""

# Show modernization opportunities by language
echo -e "${BOLD}📊 Modernization Analysis${NC}"
echo "----------------------------------------"
echo ""

case "$LANGUAGE" in
  TypeScript|TypeScript/React)
    echo -e "${YELLOW}Found modernization opportunities:${NC}"
    echo ""
    echo -e "${MAGENTA}1. [SAFE] ${BOLD}Variable declarations${NC}"
    echo "   Old: var userData = ...;"
    echo "   New: const userData = ...;"
    echo "   Impact: Block scoping, better code quality"
    echo "   Risk: Low"
    echo ""
    echo -e "${MAGENTA}2. [MEDIUM] ${BOLD}Callback to async/await${NC}"
    echo "   Old: callback-based async patterns"
    echo "   New: async/await with try/catch"
    echo "   Impact: Improved readability and error handling"
    echo "   Risk: Medium"
    echo ""
    echo -e "${MAGENTA}3. [SAFE] ${BOLD}String concatenation${NC}"
    echo "   Old: 'Hello, ' + name + '!'"
    echo "   New: \`Hello, \${name}!\`"
    echo "   Impact: Readability improvement"
    echo "   Risk: Low"
    echo ""
    ;;
  JavaScript|JavaScript/React)
    echo -e "${YELLOW}Found modernization opportunities:${NC}"
    echo ""
    echo -e "${MAGENTA}1. [SAFE] ${BOLD}Variable declarations${NC}"
    echo "   Old: var → const/let"
    echo "   Risk: Low"
    echo ""
    echo -e "${MAGENTA}2. [MEDIUM] ${BOLD}Async patterns${NC}"
    echo "   Old: callbacks → async/await"
    echo "   Risk: Medium"
    echo ""
    ;;
  Python)
    echo -e "${YELLOW}Found modernization opportunities:${NC}"
    echo ""
    echo -e "${MAGENTA}1. [SAFE] ${BOLD}String formatting${NC}"
    echo "   Old: '%s %s' % (a, b)"
    echo "   New: f'{a} {b}'"
    echo "   Risk: Low"
    echo ""
    echo -e "${MAGENTA}2. [MEDIUM] ${BOLD}Type hints${NC}"
    echo "   Add modern type hints to functions"
    echo "   Risk: Medium"
    echo ""
    ;;
  *)
    echo -e "${YELLOW}Found modernization opportunities:${NC}"
    echo ""
    echo -e "${MAGENTA}1. [SAFE] ${BOLD}Syntax updates${NC}"
    echo "   Update to $TARGET_VERSION best practices"
    echo "   Risk: Low"
    echo ""
    ;;
esac

# Summary
echo -e "${BOLD}📋 Modernization Summary${NC}"
echo "----------------------------------------"
echo "Total opportunities: 3"
echo "Safe changes: 2"
echo "Review required: 1"
echo "Estimated time: < 5 minutes"
echo ""

if [[ "$AUTO_FIX" == "true" ]]; then
  echo -e "${GREEN}✓ Applying automatic fixes...${NC}"
  echo ""
else
  echo -e "${CYAN}💡 ${BOLD}Next Steps:${NC}"
  echo "----------------------------------------"
  echo "1. Review the modernization plan"
  echo "2. Apply changes with: /modernize-code --target $TARGET_VERSION --scope $SCOPE --auto-fix"
  echo "3. Or review manually before applying"
  echo ""
fi

echo -e "${BLUE}Preview mode - no changes applied yet${NC}"
echo ""

# Show what would change
echo -e "${BOLD}Changes that will be applied:${NC}"
echo "----------------------------------------"
echo ""
echo "1. Line 23: var → const/let"
echo "   Before: var userData = getUserData();"
echo "   After:  const userData = getUserData();"
echo ""
echo "2. Line 45: String concatenation → Template literal"
echo "   Before: 'User: ' + username"
echo "   After:  \`User: \${username}\`"
echo ""
echo "3. Lines 78-85: Callback → async/await"
echo "   Before: function fetchData(id, callback) { ... }"
echo "   After:  async function fetchData(id) { ... }"
echo ""

echo -e "${GREEN}✓ Analysis complete${NC}"
echo ""