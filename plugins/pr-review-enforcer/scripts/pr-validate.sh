#!/bin/bash
# PR Review Enforcer - Validate PR Description
# Validates PR description against comprehensive quality standards

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PR_DESC_FILE="${CLAUDE_PLUGIN_ROOT}/data/pr_description.md"
STRICT_MODE=false
MIN_DESC_LENGTH=200

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --strict)
            STRICT_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Ensure data directory exists
mkdir -p "$(dirname "$PR_DESC_FILE")"

# Check if PR description file exists
if [ ! -f "$PR_DESC_FILE" ]; then
    echo -e "${RED}✗ No PR description file found${NC}"
    echo -e "${YELLOW}Create a PR description at: $PR_DESC_FILE${NC}"
    echo ""
    echo "Required sections:"
    echo "  ## Summary"
    echo "  ## Changes"
    echo "  ## Testing"
    echo "  ## Breaking Changes"
    exit 1
fi

# Validation functions
check_section() {
    local section="$1"
    local content
    content=$(sed -n "/^##[[:space:]]\+$section/,/^##[[:space:]]/p" "$PR_DESC_FILE" | sed '$d' || true)

    if [ -z "$content" ] || [ -z "$(echo "$content" | grep -v '^[[:space:]]*$' || true)" ]; then
        echo -e "${RED}✗${NC} $section section is missing or empty"
        return 1
    else
        echo -e "${GREEN}✓${NC} $section section present"
        return 0
    fi
}

check_summary() {
    local summary
    summary=$(sed -n '/^##[[:space:]]\+Summary/,/^##[[:space:]]/p' "$PR_DESC_FILE" | sed '$d' | tr -d '\n' || true)

    local length=${#summary}

    if [ "$length" -lt "$MIN_DESC_LENGTH" ]; then
        echo -e "${YELLOW}⚠${NC} Summary too short ($length chars, min: $MIN_DESC_LENGTH)"
        return 1
    else
        echo -e "${GREEN}✓${NC} Summary length adequate ($length chars)"
        return 0
    fi
}

check_placeholders() {
    local has_placeholders
    has_placeholders=$(grep -iE '(TODO|FIXME|TBD|XXX)' "$PR_DESC_FILE" || true)

    if [ -n "$has_placeholders" ]; then
        echo -e "${YELLOW}⚠${NC} Placeholder text found (TODO/FIXME/TBD)"
        return 1
    else
        echo -e "${GREEN}✓${NC} No placeholder text"
        return 0
    fi
}

check_references() {
    local has_refs
    has_refs=$(grep -iE '(#[0-9]+|close[sd]?|fix|resolve)[[:space:]]*#[0-9]+' "$PR_DESC_FILE" || true)

    if [ -z "$has_refs" ]; then
        echo -e "${YELLOW}⚠${NC} No issue/PR references found"
        return 1
    else
        echo -e "${GREEN}✓${NC} Issue/PR references present"
        return 0
    fi
}

check_breaking_changes() {
    local breaking
    breaking=$(sed -n '/^##[[:space:]]\+Breaking Changes/,/^##[[:space:]]/p' "$PR_DESC_FILE" | sed '$d' || true)

    if [ -z "$breaking" ]; then
        echo -e "${RED}✗${NC} Breaking Changes section missing"
        return 1
    fi

    if echo "$breaking" | grep -iqE 'none|n/a'; then
        echo -e "${GREEN}✓${NC} Breaking changes explicitly marked as None"
        return 0
    else
        echo -e "${GREEN}✓${NC} Breaking changes documented"
        return 0
    fi
}

# Run validation checks
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     PR VALIDATION REPORT                              ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Check                    │ Status │ Details                            ║${NC}"
echo -e "${BLUE}╠════════════════════════════╪════════╪══════════════════════════════════╣${NC}"

fail_count=0
warn_count=0

check_section "Summary" || ((fail_count++))
check_section "Changes" || ((fail_count++))
check_section "Testing" || ((fail_count++))
check_breaking_changes || ((fail_count++))
check_summary || ((warn_count++))
check_placeholders || ((warn_count++))
check_references || ((warn_count++))

echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Determine overall status
if [ "$fail_count" -gt 0 ]; then
    if [ "$STRICT_MODE" = true ]; then
        echo -e "${RED}Status: FAILED${NC}"
        echo -e "${RED}Action: Fix $fail_count failed check(s) before merging${NC}"
        exit 1
    else
        echo -e "${YELLOW}Status: FAILED (non-strict mode)${NC}"
        echo -e "${YELLOW}Action: Address $fail_count failed check(s) and $warn_count warning(s)${NC}"
        exit 1
    fi
elif [ "$warn_count" -gt 0 ]; then
    echo -e "${YELLOW}Status: PASSED WITH WARNINGS${NC}"
    echo -e "${YELLOW}Action: Review $warn_count warning(s)${NC}"
    exit 0
else
    echo -e "${GREEN}Status: PASSED${NC}"
    echo -e "${GREEN}Action: PR description meets all quality standards${NC}"
    exit 0
fi
