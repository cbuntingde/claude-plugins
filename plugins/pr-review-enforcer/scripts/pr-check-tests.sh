#!/bin/bash
# PR Review Enforcer - Check Test Coverage
# Verifies test coverage for all modified files

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COVERAGE_THRESHOLD=80
SPECIFIED_FILES=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage=*)
            COVERAGE_THRESHOLD="${1#*=}"
            shift
            ;;
        --files=*)
            SPECIFIED_FILES="${1#*=}"
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
    if [ -n "$SPECIFIED_FILES" ]; then
        echo "$SPECIFIED_FILES" | tr ',' '\n'
    elif git rev-parse --git-dir > /dev/null 2>&1; then
        git diff --name-only --cached 2>/dev/null || git diff --name-only 2>/dev/null || true
    else
        echo -e "${YELLOW}⚠ Not in a git repository, no files to check${NC}" >&2
        return 1
    fi
}

# Filter to source files only (exclude test files, configs, etc.)
filter_source_files() {
    grep -E '\.(js|ts|jsx|tsx|py|java|go|cs|rb|php)$' | grep -vE '\.(test|spec)\.' | grep -vE '^test' || true
}

# Check if test file exists
check_test_file() {
    local source_file="$1"
    local test_file=""

    # Determine test file naming convention based on extension
    case "$source_file" in
        *.js|*.jsx|*.ts|*.tsx)
            # Try various test file patterns
            for pattern in "${source_file%.*}.test.${source_file##*.}" "${source_file%.*}.spec.${source_file##*.}"; do
                if [ -f "$pattern" ]; then
                    test_file="$pattern"
                    break
                fi
            done

            # Try __tests__ directory pattern
            if [ -z "$test_file" ]; then
                local dirname
                dirname=$(dirname "$source_file")
                local filename
                filename=$(basename "$source_file")
                if [ -f "$dirname/__tests__/$filename" ]; then
                    test_file="$dirname/__tests__/$filename"
                fi
            fi
            ;;
        *.py)
            # Python test files: test_module.py or module_test.py
            local basename
            basename=$(basename "$source_file" .py)
            local dirname
            dirname=$(dirname "$source_file")
            for pattern in "test_${basename}.py" "${basename}_test.py"; do
                if [ -f "$dirname/$pattern" ]; then
                    test_file="$dirname/$pattern"
                    break
                fi
            done
            ;;
        *.java)
            # Java test files: ClassNameTest.java
            local basename
            basename=$(basename "$source_file" .java)
            local dirname
            dirname=$(dirname "$source_file")
            if [ -f "$dirname/${basename}Test.java" ]; then
                test_file="$dirname/${basename}Test.java"
            fi
            ;;
    esac

    echo "$test_file"
}

# Check test file quality
check_test_quality() {
    local test_file="$1"

    if [ ! -f "$test_file" ]; then
        return 1
    fi

    # Check if file is not empty
    if [ ! -s "$test_file" ]; then
        echo -e "${RED}    ⚠ Test file is empty${NC}"
        return 1
    fi

    # Count test assertions/functions
    local test_count=0
    case "$test_file" in
        *.js|*.jsx|*.ts|*.tsx)
            test_count=$(grep -cE '(it\(|test\(|describe\()' "$test_file" 2>/dev/null || echo "0")
            ;;
        *.py)
            test_count=$(grep -cE 'def test_' "$test_file" 2>/dev/null || echo "0")
            ;;
        *.java)
            test_count=$(grep -cE '@Test|void test' "$test_file" 2>/dev/null || echo "0")
            ;;
    esac

    if [ "$test_count" -eq 0 ]; then
        echo -e "${RED}    ⚠ No test functions found${NC}"
        return 1
    fi

    echo "$test_count"
}

# Estimate coverage (simplified - real implementation would use coverage tools)
estimate_coverage() {
    local source_file="$1"
    local test_file="$2"

    # Simplified heuristic: count test assertions vs source functions
    local source_functions=0
    local test_assertions=0

    case "$source_file" in
        *.js|*.jsx|*.ts|*.tsx)
            source_functions=$(grep -cE 'function[[:space:]]+[a-zA-Z_]|const[[:space:]]+[a-zA-Z_]+[[:space:]]*=[[:space:]]*\(|export[[:space:]]+(const|function)' "$source_file" 2>/dev/null || echo "1")
            test_assertions=$(grep -cE '(expect|assert|toBe|toEqual)' "$test_file" 2>/dev/null || echo "0")
            ;;
        *.py)
            source_functions=$(grep -cE 'def[[:space:]]+[a-zA-Z_]' "$source_file" 2>/dev/null || echo "1")
            test_assertions=$(grep -cE '(assert|assertEquals|assertTrue)' "$test_file" 2>/dev/null || echo "0")
            ;;
    esac

    if [ "$source_functions" -eq 0 ]; then
        source_functions=1
    fi

    local coverage=$(( (test_assertions * 100) / (source_functions * 2) ))
    if [ "$coverage" -gt 100 ]; then
        coverage=100
    fi

    echo "$coverage"
}

# Run checks
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                        TEST COVERAGE REPORT                             ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  File                    │ Status │ Coverage │ Tests │ Missing          ║${NC}"
echo -e "${BLUE}╠══════════════════════════╪════════╪══════════╪═══════╪══════════════════╣${NC}"

modified_files=$(get_modified_files | filter_source_files)

if [ -z "$modified_files" ]; then
    echo -e "${YELLOW}║  No source files found to check                                        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
fi

total_coverage=0
file_count=0
fail_count=0
warn_count=0

while IFS= read -r source_file; do
    if [ ! -f "$source_file" ]; then
        continue
    fi

    test_file=$(check_test_file "$source_file")
    status="${RED}FAIL${NC}"
    coverage="N/A"
    test_count="0"
    missing="-"

    if [ -n "$test_file" ]; then
        test_count=$(check_test_quality "$test_file")
        if [ "$test_count" != "0" ]; then
            coverage=$(estimate_coverage "$source_file" "$test_file")

            if [ "$coverage" -ge "$COVERAGE_THRESHOLD" ]; then
                status="${GREEN}PASS${NC}"
                missing="-"
            else
                status="${YELLOW}WARN${NC}"
                missing="Some functions"
                ((warn_count++))
            fi

            total_coverage=$((total_coverage + coverage))
            ((file_count++))
        else
            missing="No test functions"
            ((fail_count++))
        fi
    else
        missing="No test file"
        ((fail_count++))
    fi

    # Truncate file name if too long
    display_file="${source_file:0:24}"
    printf "${BLUE}║  %-24s │ %s  │ %-8s │ %-5s │ %-16s ║${NC}\n" \
        "$display_file" "$status" "$coverage%" "$test_count" "$missing"
done <<< "$modified_files"

echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Calculate overall coverage
if [ "$file_count" -gt 0 ]; then
    overall_coverage=$((total_coverage / file_count))
    echo -e "Overall Coverage: ${overall_coverage}% (Threshold: ${COVERAGE_THRESHOLD}%)"
else
    echo -e "${YELLOW}⚠ No valid test files found${NC}"
    overall_coverage=0
fi

echo ""

# Determine status
if [ "$fail_count" -gt 0 ]; then
    echo -e "${RED}Status: FAILED${NC}"
    echo -e "${RED}Action: Add tests for $fail_count file(s) without tests${NC}"
    exit 1
elif [ "$warn_count" -gt 0 ] || [ "$overall_coverage" -lt "$COVERAGE_THRESHOLD" ]; then
    echo -e "${YELLOW}Status: NEEDS IMPROVEMENT${NC}"
    echo -e "${YELLOW}Action: Increase test coverage to meet ${COVERAGE_THRESHOLD}% threshold${NC}"
    exit 1
else
    echo -e "${GREEN}Status: PASSED${NC}"
    echo -e "${GREEN}Action: Test coverage meets requirements${NC}"
    exit 0
fi
