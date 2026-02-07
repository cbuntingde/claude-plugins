#!/bin/bash
#
# Architecture Gatekeeper - Pre-commit Validation
#
# This script validates staged changes against architecture rules
# before allowing commits. Acts as a quality gate.
#
# Features:
# - Validates only changed files
# - Fast incremental checks
# - Configurable strictness level
# - Detailed violation reporting
# - Supports bypass flags with documentation
#
# Output: Exit code 0 if valid, 1 if violations found
#

set -euo pipefail

# Get the plugin root directory
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"

# Configuration
DATA_DIR="${PLUGIN_ROOT}/data"
VIOLATIONS_FILE="${DATA_DIR}/violations.json"
COMMIT_REPORT="${DATA_DIR}/commit-validation.json"
STRICT_MODE="${STRICT_MODE:-true}"

# Ensure data directory exists
mkdir -p "${DATA_DIR}"

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [${level}] ${message}"
}

# Get list of staged files
get_staged_files() {
    local files=()

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_message "WARNING" "Not in a git repository"
        return 0
    fi

    # Get staged files (TS/JS only)
    while IFS= read -r file; do
        [[ -n "${file}" ]] && files+=("${file}")
    done < <(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)

    echo "${files[@]}"
}

# Validate a single file for architecture violations
validate_file() {
    local file="$1"
    local project_root="${2:-.}"
    local violations=()

    # Get file extension
    local ext="${file##*.}"
    if [[ ! "${ext}" =~ ^(ts|tsx|js|jsx)$ ]]; then
        return 0
    fi

    # Check for common architecture violations

    # 1. Check for absolute imports that bypass layers
    if grep -q "from.*'\/src\/" "${file}" 2>/dev/null; then
        violations+=("Uses absolute import that bypasses module boundaries")
    fi

    # 2. Check for sibling directory traversal (potential layer skipping)
    if grep -E "from\s+['\"]\.\.\/\.\.\/" "${file}" 2>/dev/null; then
        violations+=("Uses multi-level relative import (may skip layers)")
    fi

    # 3. Check for test code in production directories
    if [[ "${file}" =~ ^src\/ ]] && [[ "${file}" =~ .*\.(test|spec)\. ]]; then
        violations+=("Test file in production directory")
    fi

    # 4. Check for index files that re-export everything (potential coupling)
    if [[ "${file}" =~ /index\.(ts|js)$ ]]; then
        local export_count
        export_count=$(grep -c "export " "${file}" 2>/dev/null || echo "0")
        if [[ "${export_count}" -gt 20 ]]; then
            violations+=("Index file exports many items (potential coupling point)")
        fi
    fi

    # 5. Check file location vs imports
    local file_dir
    file_dir=$(dirname "${file}")

    # If file is in domain/, check it doesn't import from infrastructure
    if [[ "${file_dir}" =~ src\/domain ]] || [[ "${file_dir}" =~ src\/entities ]]; then
        if grep -E "from\s+['\"].*infrastructure|from\s+['\"].*adapters|from\s+['\"].*frameworks" "${file}" 2>/dev/null; then
            violations+=("Domain layer imports from infrastructure/adapters")
        fi
    fi

    # 6. Check for direct database imports in wrong layers
    if [[ ! "${file_dir}" =~ (infrastructure|persistence|data) ]]; then
        if grep -Ei "from\s+['\"].*database|from\s+['\"].*prisma|from\s+['\"].*sequelize|from\s+['\"].*mongoose|from\s+['\"].*knex" "${file}" 2>/dev/null; then
            violations+=("Direct database import outside data layer")
        fi
    fi

    echo "${violations[@]}"
}

# Display commit validation results
display_results() {
    local total_files="$1"
    local files_with_violations="$2"
    local total_violations="$3"
    local strict="$4"

    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║              ARCHITECTURE COMMIT VALIDATION                   ║"
    echo "╠════════════════════════════════════════════════════════════════╣"
    echo "║  Files Checked: ${total_files}                                              ║"
    echo "║  Files with Violations: ${files_with_violations}                                       ║"
    echo "║  Total Violations: ${total_violations}                                              ║"
    echo "║  Strict Mode: ${strict}                                              "
    echo "╠════════════════════════════════════════════════════════════════╣"

    if [[ "${total_violations}" -eq 0 ]]; then
        echo "║  Status: PASS (No architecture violations found)              ║"
        echo "╚════════════════════════════════════════════════════════════════╝"
        echo ""
        return 0
    fi

    echo "║  Status: FAIL (Architecture violations detected)               ║"
    echo "╠════════════════════════════════════════════════════════════════╣"
    echo "║  COMMIT BLOCKED - Fix violations before committing             ║"
    echo "╠════════════════════════════════════════════════════════════════╣"
    echo "║                                                                ║"
    echo "║  To bypass temporarily (not recommended):                      ║"
    echo "║  git commit --no-verify                                        ║"
    echo "║                                                                ║"
    echo "║  Or disable strict mode:                                       ║"
    echo "║  export STRICT_MODE=false                                      ║"
    echo "║                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    return 1
}

# Main execution
main() {
    local project_root="${1:-.}"
    local strict="${2:-${STRICT_MODE}}"

    log_message "INFO" "Starting commit validation in ${project_root}"

    # Get staged files
    local staged_files
    staged_files=($(get_staged_files))

    if [[ ${#staged_files[@]} -eq 0 ]]; then
        log_message "INFO" "No staged TypeScript/JavaScript files to validate"
        exit 0
    fi

    log_message "INFO" "Validating ${#staged_files[@]} staged file(s)"

    local total_violations=0
    local files_with_violations=0
    declare -a all_violations

    # Validate each file
    for file in "${staged_files[@]}"; do
        if [[ ! -f "${file}" ]]; then
            continue
        fi

        local violations
        violations=($(validate_file "${file}" "${project_root}"))

        if [[ ${#violations[@]} -gt 0 ]]; then
            ((files_with_violations++))
            total_violations=$((total_violations + ${#violations[@]}))

            echo ""
            echo "FILE: ${file}"
            echo "VIOLATIONS:"
            for violation in "${violations[@]}"; do
                echo "  - ${violation}"
                all_violations+=("${file}: ${violation}")
            done
        fi
    done

    # Display results
    local strict_display="ENABLED"
    [[ "${strict}" != "true" ]] && strict_display="DISABLED"

    if ! display_results "${#staged_files[@]}" "${files_with_violations}" "${total_violations}" "${strict_display}"; then
        # Write failure report
        cat > "${COMMIT_REPORT}" <<EOF
{
  "status": "fail",
  "strict_mode": ${strict},
  "files_checked": ${#staged_files[@]},
  "files_with_violations": ${files_with_violations},
  "total_violations": ${total_violations},
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "violations": [
$(for v in "${all_violations[@]}"; do
    echo "    {\"message\": \"${v}\"},"
done | sed '$ s/,$//')
  ]
}
EOF

        # Update violations file
        if [[ -f "${VIOLATIONS_FILE}" ]]; then
            local current
            current=$(cat "${VIOLATIONS_FILE}")
            local updated
            updated=$(echo "${current}" | jq --argjson report "$(cat "${COMMIT_REPORT}")" '.commit_violations = $report.violations')
            echo "${updated}" > "${VIOLATIONS_FILE}"
        fi

        # Exit with error if strict mode
        if [[ "${strict}" == "true" ]]; then
            exit 1
        fi
    fi

    # Write success report
    cat > "${COMMIT_REPORT}" <<EOF
{
  "status": "pass",
  "strict_mode": ${strict},
  "files_checked": ${#staged_files[@]},
  "files_with_violations": 0,
  "total_violations": 0,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "violations": []
}
EOF

    exit 0
}

# Run main function
main "$@"
