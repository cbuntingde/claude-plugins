#!/bin/bash
# PR Review Enforcer - Check Documentation
# Verifies documentation completeness for all changes

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STRICT_MODE=false
DOC_TYPE="all"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --strict)
            STRICT_MODE=true
            shift
            ;;
        --type=*)
            DOC_TYPE="${1#*=}"
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Get modified files
get_modified_files() {
    if git rev-parse --git-dir > /dev/null 2>&1; then
        git diff --name-only --cached 2>/dev/null || git diff --name-only 2>/dev/null || true
    else
        echo -e "${YELLOW}⚠ Not in a git repository${NC}" >&2
        return 1
    fi
}

# Check README
check_readme() {
    if [ "$DOC_TYPE" = "inline" ]; then
        return 0
    fi

    if [ ! -f "README.md" ]; then
        echo -e "${YELLOW}⚠${NC} No README.md found"
        return 1
    fi

    # Check if README was recently modified
    local readme_modified
    readme_modified=$(get_modified_files | grep -i '^README.md' || true)

    if [ -z "$readme_modified" ]; then
        # Check for new features that should be documented
        local new_files
        new_files=$(get_modified_files | grep -E '\.(js|ts|py|java)$' || true)

        if [ -n "$new_files" ]; then
            echo -e "${YELLOW}⚠${NC} New files added but README not updated"
            return 1
        fi
    fi

    echo -e "${GREEN}✓${NC} README present"
    return 0
}

# Check API documentation (JSDoc/TSDoc)
check_api_docs() {
    if [ "$DOC_TYPE" = "readme" ]; then
        return 0
    fi

    local source_files
    source_files=$(get_modified_files | grep -E '\.(js|jsx|ts|tsx)$' || true)

    if [ -z "$source_files" ]; then
        echo -e "${GREEN}✓${NC} No TypeScript/JavaScript files to check"
        return 0
    fi

    local missing_docs=0
    local total_funcs=0

    while IFS= read -r file; do
        if [ ! -f "$file" ]; then
            continue
        fi

        # Count exported functions/classes
        local funcs
        funcs=$(grep -E '(export[[:space:]]+(function|const|class)|module\.exports)' "$file" || true)

        if [ -n "$funcs" ]; then
            while IFS= read -r func; do
                ((total_funcs++))

                # Check for JSDoc/TSDoc comment before function
                if ! grep -B1 "$func" "$file" | grep -qE '/\*\*|///'; then
                    ((missing_docs++))
                fi
            <<< "$funcs"
        fi
    done <<< "$source_files"

    if [ "$missing_docs" -gt 0 ]; then
        echo -e "${RED}✗${NC} $missing_docs function(s) missing JSDoc/TSDoc"
        return 1
    else
        echo -e "${GREEN}✓${NC} API documentation complete"
        return 0
    fi
}

# Check inline comments
check_inline_comments() {
    local source_files
    source_files=$(get_modified_files | grep -E '\.(js|jsx|ts|tsx|py|java)$' || true)

    if [ -z "$source_files" ]; then
        return 0
    fi

    # Check for complex logic without comments
    # Heuristic: Look for nested loops, complex conditionals without nearby comments
    local needs_comments=0

    while IFS= read -r file; do
        if [ ! -f "$file" ]; then
            continue
        fi

        # Check for nested structures (complexity)
        local complexity
        complexity=$(grep -E '(for[[:space:]]*\(.*for|while[[:space:]]*\(.*while|if[[:space:]]*\(.*if)' "$file" || true)

        if [ -n "$complexity" ]; then
            # Check if there's a comment nearby
            while IFS= read -r line; do
                local line_num
                line_num=$(grep -n "$line" "$file" | cut -d: -f1 | head -1)

                # Check 2 lines before
                local has_comment
                has_comment=$(sed -n "$((line_num-2)),${line_num}p" "$file" | grep -cE '^[[:space:]]*//' || true)

                if [ "$has_comment" -eq 0 ]; then
                    ((needs_comments++))
                fi
            <<< "$complexity"
        fi
    done <<< "$source_files"

    if [ "$needs_comments" -gt 0 ]; then
        echo -e "${YELLOW}⚠${NC} $needs_comments complex section(s) need comments"
        return 1
    else
        echo -e "${GREEN}✓${NC} Inline comments adequate"
        return 0
    fi
}

# Check CHANGELOG
check_changelog() {
    if [ "$DOC_TYPE" = "inline" ] || [ "$DOC_TYPE" = "api" ]; then
        return 0
    fi

    if [ ! -f "CHANGELOG.md" ]; then
        echo -e "${YELLOW}⚠${NC} No CHANGELOG.md found"
        return 1
    fi

    # Check if there are any recent changes
    local modified_files
    modified_files=$(get_modified_files | grep -vE 'CHANGELOG|README' || true)

    if [ -n "$modified_files" ]; then
        # Check if CHANGELOG was modified
        local changelog_modified
        changelog_modified=$(get_modified_files | grep -i 'CHANGELOG.md' || true)

        if [ -z "$changelog_modified" ]; then
            echo -e "${YELLOW}⚠${NC} Files modified but CHANGELOG not updated"
            return 1
        fi
    fi

    echo -e "${GREEN}✓${NC} CHANGELOG updated"
    return 0
}

# Check parameter documentation
check_param_docs() {
    if [ "$DOC_TYPE" = "readme" ]; then
        return 0
    fi

    local source_files
    source_files=$(get_modified_files | grep -E '\.(js|jsx|ts|tsx)$' || true)

    if [ -z "$source_files" ]; then
        return 0
    fi

    local missing_params=0

    while IFS= read -r file; do
        if [ ! -f "$file" ]; then
            continue
        fi

        # Find functions with parameters
        local funcs_with_params
        funcs_with_params=$(grep -E 'function[[:space:]]+[a-zA-Z_]+\(|^[[:space:]]*[a-zA-Z_]+[[:space:]]*\([^)]*\)[[:space:]]*=>|[a-zA-Z_]+\([^{]*\)\s*{' "$file" || true)

        if [ -n "$funcs_with_params" ]; then
            # For each function, check if there's a @param tag in JSDoc above it
            while IFS= read -r func; do
                local func_line
                func_line=$(grep -n "$func" "$file" | cut -d: -f1 | head -1)

                # Check 5 lines before for JSDoc with @param
                local has_param_doc
                has_param_doc=$(sed -n "$((func_line-5)),${func_line}p" "$file" | grep -c '@param' || true)

                if [ "$has_param_doc" -eq 0 ]; then
                    # Check if function actually has parameters
                    if echo "$func" | grep -qE '\([^)]+[a-zA-Z_]'; then
                        ((missing_params++))
                    fi
                fi
            <<< "$funcs_with_params"
        fi
    done <<< "$source_files"

    if [ "$missing_params" -gt 0 ]; then
        echo -e "${RED}✗${NC} $missing_params function(s) missing @param tags"
        return 1
    else
        echo -e "${GREEN}✓${NC} Parameters documented"
        return 0
    fi
}

# Check return value documentation
check_return_docs() {
    if [ "$DOC_TYPE" = "readme" ]; then
        return 0
    fi

    local source_files
    source_files=$(get_modified_files | grep -E '\.(js|jsx|ts|tsx)$' || true)

    if [ -z "$source_files" ]; then
        return 0
    fi

    local missing_returns=0

    while IFS= read -r file; do
        if [ ! -f "$file" ]; then
            continue
        fi

        # Find functions with return statements
        local funcs_with_return
        funcs_with_return=$(grep -B10 'return[[:space:]]' "$file" | grep -E 'function[[:space:]]+[a-zA-Z_]+\(|^[[:space:]]*[a-zA-Z_]+[[:space:]]*\(' | head -20 || true)

        if [ -n "$funcs_with_return" ]; then
            # Check for @return or @returns in JSDoc
            while IFS= read -r func; do
                local func_line
                func_line=$(grep -n "$func" "$file" | cut -d: -f1 | head -1)

                local has_return_doc
                has_return_doc=$(sed -n "$((func_line-5)),${func_line}p" "$file" | grep -cE '@returns?|@type' || true)

                if [ "$has_return_doc" -eq 0 ]; then
                    ((missing_returns++))
                fi
            <<< "$funcs_with_return"
        fi
    done <<< "$source_files"

    if [ "$missing_returns" -gt 0 ]; then
        echo -e "${RED}✗${NC} $missing_returns function(s) missing @return tags"
        return 1
    else
        echo -e "${GREEN}✓${NC} Return values documented"
        return 0
    fi
}

# Run checks
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     DOCUMENTATION COVERAGE REPORT                      ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Check                    │ Status │ Details                            ║${NC}"
echo -e "${BLUE}╠════════════════════════════╪════════╪══════════════════════════════════╣${NC}"

fail_count=0
warn_count=0

check_readme || ((fail_count++))
check_api_docs || ((fail_count++))
check_inline_comments || ((warn_count++))
check_changelog || ((warn_count++))
check_param_docs || ((fail_count++))
check_return_docs || ((warn_count++))

echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Determine status
if [ "$fail_count" -gt 0 ]; then
    echo -e "${RED}Status: FAILED${NC}"
    echo -e "${RED}Action: Add missing documentation before merging${NC}"
    exit 1
elif [ "$warn_count" -gt 0 ]; then
    if [ "$STRICT_MODE" = true ]; then
        echo -e "${RED}Status: FAILED (strict mode)${NC}"
        echo -e "${RED}Action: Address all warnings before merging${NC}"
        exit 1
    else
        echo -e "${YELLOW}Status: PASSED WITH WARNINGS${NC}"
        echo -e "${YELLOW}Action: Review $warn_count warning(s)${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}Status: PASSED${NC}"
    echo -e "${GREEN}Action: Documentation is complete${NC}"
    exit 0
fi
