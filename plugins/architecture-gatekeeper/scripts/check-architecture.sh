#!/bin/bash
#
# Architecture Gatekeeper - Comprehensive Architecture Validation
#
# This script performs comprehensive architecture validation checks on
# files that have been written or edited during the current session.
#
# Features:
# - Circular dependency detection
# - Architecture pattern validation
# - Import rule enforcement
# - Violation tracking and reporting
#
# Output: JSON formatted results stored in plugin data directory
#

set -euo pipefail

# Get the plugin root directory
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"

# Configuration
DATA_DIR="${PLUGIN_ROOT}/data"
VIOLATIONS_FILE="${DATA_DIR}/violations.json"
CONFIG_FILE="${PLUGIN_ROOT}/config/architecture.json"
MAX_CYCLES="${MAX_CYCLES:-0}"
MAX_PATTERN_VIOLATIONS="${MAX_PATTERN_VIOLATIONS:-0}"

# Ensure data directory exists
mkdir -p "${DATA_DIR}"

# Initialize violations file if it doesn't exist
if [[ ! -f "${VIOLATIONS_FILE}" ]]; then
    echo '{"circular_dependencies": [], "pattern_violations": [], "import_violations": [], "timestamp": null}' > "${VIOLATIONS_FILE}"
fi

# Logging function with structured output
log_violation() {
    local severity="$1"
    local violation_type="$2"
    local message="$3"
    local file="$4"
    local line="${5:-0}"

    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local entry=$(cat <<EOF
{
  "severity": "${severity}",
  "type": "${violation_type}",
  "message": "${message}",
  "file": "${file}",
  "line": ${line},
  "timestamp": "${timestamp}"
}
EOF
)

    # Append to violations file
    local current
    current=$(cat "${VIOLATIONS_FILE}")
    local updated
    updated=$(echo "${current}" | jq --argjson new "${entry}" '. + {timestamp: "'"${timestamp}"'" }' | jq --argjson new "${entry}" '.[($new.type | split("_")[0] + "s")] += [$new]')
    echo "${updated}" > "${VIOLATIONS_FILE}"
}

# Detect circular dependencies using madge
check_circular_dependencies() {
    local project_root="${1:-.}"
    local file_pattern="${2:-**/*.{ts,tsx,js,jsx}}"

    if ! command -v npx &> /dev/null; then
        return 0
    fi

    if ! npx madge --circular --extensions ts,tsx,js,jsx "${project_root}" 2>/dev/null; then
        log_violation "error" "circular_dependency" "Circular dependencies detected in project" "${project_root}" 0
        return 1
    fi

    return 0
}

# Validate architecture patterns
check_architecture_patterns() {
    local project_root="${1:-.}"
    local pattern="${2:-layered}"

    case "${pattern}" in
        layered)
            validate_layered_architecture "${project_root}"
            ;;
        hexagonal)
            validate_hexagonal_architecture "${project_root}"
            ;;
        clean)
            validate_clean_architecture "${project_root}"
            ;;
        *)
            return 0
    esac
}

# Validate layered architecture (no layer skipping)
validate_layered_architecture() {
    local project_root="$1"

    # Check for violations like domain importing from infrastructure
    if grep -r "from.*infrastructure" "${project_root}/src/domain" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
        log_violation "error" "pattern_violation" "Domain layer imports from Infrastructure layer (layered architecture violation)" "${project_root}/src/domain" 0
    fi

    # Check for UI importing from data access
    if grep -r "from.*data-access\|from.*repositories" "${project_root}/src/ui" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
        log_violation "warning" "pattern_violation" "UI layer directly imports from data access layer (layered architecture violation)" "${project_root}/src/ui" 0
    fi
}

# Validate hexagonal architecture (ports and adapters)
validate_hexagonal_architecture() {
    local project_root="$1"

    # Domain should not import from adapters or infrastructure
    if grep -r "from.*adapters\|from.*infrastructure" "${project_root}/src/domain" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
        log_violation "error" "pattern_violation" "Domain imports from adapters/infrastructure (hexagonal architecture violation)" "${project_root}/src/domain" 0
    fi
}

# Validate clean architecture (entities use cases boundaries)
validate_clean_architecture() {
    local project_root="$1"

    # Entities should not import from frameworks or interface adapters
    if grep -r "from.*frameworks\|from.*interface-adapters\|from.*web" "${project_root}/src/entities" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
        log_violation "error" "pattern_violation" "Entities import from outer layers (clean architecture violation)" "${project_root}/src/entities" 0
    fi
}

# Check import rules
check_import_rules() {
    local project_root="${1:-.}"

    # Check for absolute path bypassing of layers
    if grep -r "import.*from.*\.\.\/.*\/src\/" "${project_root}/src" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
        log_violation "warning" "import_violation" "Import using relative path that bypasses module boundaries" "${project_root}/src" 0
    fi
}

# Main execution
main() {
    local project_root="${1:-.}"
    local config="${2:-${CONFIG_FILE}}"

    # Load configuration if exists
    if [[ -f "${config}" ]]; then
        MAX_CYCLES=$(jq -r '.circular_dependencies.max_cycles // 0' "${config}")
        MAX_PATTERN_VIOLATIONS=$(jq -r '.pattern_violations.max_violations // 0' "${config}")
    fi

    # Run checks
    check_circular_dependencies "${project_root}"
    check_architecture_patterns "${project_root}"
    check_import_rules "${project_root}"

    # Count violations
    local violations_count
    violations_count=$(jq '[.circular_dependencies, .pattern_violations, .import_violations] | add | length' "${VIOLATIONS_FILE}")

    if [[ "${violations_count}" -gt 0 ]]; then
        echo "Architecture validation completed with ${violations_count} violation(s)"
    fi
}

# Run main function
main "$@"
