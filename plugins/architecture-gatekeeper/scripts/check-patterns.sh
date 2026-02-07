#!/bin/bash
#
# Architecture Gatekeeper - Architecture Pattern Validation
#
# This script validates compliance with specified architecture patterns.
#
# Supported patterns:
# - Layered Architecture (N-tier)
# - Hexagonal Architecture (Ports and Adapters)
# - Clean Architecture (Onion Architecture)
# - Microservices (service boundaries)
#
# Features:
# - Validates layer isolation rules
# - Checks for proper dependency direction
# - Identifies architecture violations
# - Provides detailed violation reports
#
# Output: JSON formatted pattern violation report
#

set -euo pipefail

# Get the plugin root directory
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"

# Configuration
DATA_DIR="${PLUGIN_ROOT}/data"
VIOLATIONS_FILE="${DATA_DIR}/violations.json"
PATTERN_REPORT="${DATA_DIR}/pattern-report.json"

# Ensure data directory exists
mkdir -p "${DATA_DIR}"

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [${level}] ${message}"
}

# Validate layered architecture
validate_layered_architecture() {
    local project_root="$1"
    local violations=()

    log_message "INFO" "Validating layered architecture in ${project_root}"

    # Define layer order (top to bottom)
    local layers=("presentation" "application" "domain" "infrastructure" "persistence")

    # Rule 1: Presentation should not import from persistence/infrastructure
    if [[ -d "${project_root}/src/presentation" ]]; then
        local bad_imports
        bad_imports=$(grep -r "from.*\.\.*/\(persistence\|infrastructure\)" "${project_root}/src/presentation" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

        if [[ -n "${bad_imports}" ]]; then
            violations+=("Presentation layer imports from Persistence/Infrastructure layer")
        fi
    fi

    # Rule 2: Application should not import from presentation
    if [[ -d "${project_root}/src/application" ]]; then
        local bad_imports
        bad_imports=$(grep -r "from.*\.\.*/presentation" "${project_root}/src/application" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

        if [[ -n "${bad_imports}" ]]; then
            violations+=("Application layer imports from Presentation layer")
        fi
    fi

    # Rule 3: Domain should not import from application, presentation, or infrastructure
    if [[ -d "${project_root}/src/domain" ]]; then
        local bad_imports
        bad_imports=$(grep -r "from.*\.\.*/\(application\|presentation\|infrastructure\|persistence\)" "${project_root}/src/domain" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

        if [[ -n "${bad_imports}" ]]; then
            violations+=("Domain layer imports from outer layers")
        fi
    fi

    # Rule 4: Infrastructure should not import from presentation
    if [[ -d "${project_root}/src/infrastructure" ]]; then
        local bad_imports
        bad_imports=$(grep -r "from.*\.\.*/presentation" "${project_root}/src/infrastructure" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

        if [[ -n "${bad_imports}" ]]; then
            violations+=("Infrastructure layer imports from Presentation layer")
        fi
    fi

    echo "${violations[@]}"
}

# Validate hexagonal architecture (ports and adapters)
validate_hexagonal_architecture() {
    local project_root="$1"
    local violations=()

    log_message "INFO" "Validating hexagonal architecture in ${project_root}"

    # Rule 1: Domain should not import from adapters
    if [[ -d "${project_root}/src/domain" ]]; then
        local bad_imports
        bad_imports=$(grep -r "from.*\.\.*/adapters" "${project_root}/src/domain" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

        if [[ -n "${bad_imports}" ]; then
            violations+=("Domain imports from Adapters layer")
        fi
    fi

    # Rule 2: Domain should not import from infrastructure
    if [[ -d "${project_root}/src/domain" ]]; then
        local bad_imports
        bad_imports=$(grep -r "from.*\.\.*/infrastructure" "${project_root}/src/domain" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

        if [[ -n "${bad_imports}" ]]; then
            violations+=("Domain imports from Infrastructure layer")
        fi
    fi

    # Rule 3: Ports should only define interfaces
    if [[ -d "${project_root}/src/ports" ]]; then
        # Check for implementations in ports
        local implementations
        implementations=$(find "${project_root}/src/ports" -name "*.ts" -o -name "*.js" | xargs grep -l "class.*implements" 2>/dev/null || true)

        if [[ -n "${implementations}" ]]; then
            violations+=("Ports directory contains implementation classes (should only define interfaces)")
        fi
    fi

    echo "${violations[@]}"
}

# Validate clean architecture (onion architecture)
validate_clean_architecture() {
    local project_root="$1"
    local violations=()

    log_message "INFO" "Validating clean architecture in ${project_root}"

    # Rule 1: Entities should not import from any outer layer
    if [[ -d "${project_root}/src/entities" ]]; then
        local bad_imports
        bad_imports=$(grep -r "from.*\.\.*/\(use-cases\|application\|interface-adapters\|frameworks\|web\)" "${project_root}/src/entities" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

        if [[ -n "${bad_imports}" ]]; then
            violations+=("Entities import from outer layers")
        fi
    fi

    # Rule 2: Use Cases should not import from frameworks or web
    if [[ -d "${project_root}/src/use-cases" ]] || [[ -d "${project_root}/src/application" ]]; then
        local use_cases_dir="${project_root}/src/use-cases"
        [[ -d "${project_root}/src/application" ]] && use_cases_dir="${project_root}/src/application"

        local bad_imports
        bad_imports=$(grep -r "from.*\.\.*/\(frameworks\|web\|interface-adapters\)" "${use_cases_dir}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

        if [[ -n "${bad_imports}" ]]; then
            violations+=("Use Cases import from Frameworks or Web layers")
        fi
    fi

    # Rule 3: Interface Adapters should not import from frameworks/web directly
    if [[ -d "${project_root}/src/interface-adapters" ]] || [[ -d "${project_root}/src/presenters" ]]; then
        local adapters_dir="${project_root}/src/interface-adapters"
        [[ -d "${project_root}/src/presenters" ]] && adapters_dir="${project_root}/src/presenters"

        # Check for direct framework imports (should go through use cases)
        local framework_imports
        framework_imports=$(grep -r "from.*\.\.*/frameworks\|from.*\.\.*/web" "${adapters_dir}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

        if [[ -n "${framework_imports}" ]]; then
            violations+=("Interface Adapters directly import from Frameworks/Web layer")
        fi
    fi

    echo "${violations[@]}"
}

# Validate microservices architecture
validate_microservices_architecture() {
    local project_root="$1"
    local violations=()

    log_message "INFO" "Validating microservices architecture in ${project_root}"

    # Rule 1: Services should not directly import from other services
    local services
    services=$(find "${project_root}/src" -maxdepth 1 -type d -name "service-*" -o -name "*-service" 2>/dev/null || true)

    if [[ -n "${services}" ]]; then
        while IFS= read -r service; do
            local cross_service_imports
            cross_service_imports=$(grep -r "from.*\.\.\/service-" "${service}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true)

            if [[ -n "${cross_service_imports}" ]]; then
                violations+=("Service $(basename "${service}") imports directly from another service")
            fi
        done <<< "${services}"
    fi

    # Rule 2: Shared code should be in a dedicated module
    if [[ -d "${project_root}/src/services" ]]; then
        local has_shared_module=false
        [[ -d "${project_root}/src/shared" ]] && has_shared_module=true
        [[ -d "${project_root}/src/common" ]] && has_shared_module=true

        if [[ "${has_shared_module}" == false ]]; then
            violations+=("Microservices architecture should have a shared/common module for reusable code")
        fi
    fi

    echo "${violations[@]}"
}

# Display violations in formatted table
display_violations() {
    local pattern="$1"
    shift
    local violations=("$@")

    if [[ ${#violations[@]} -eq 0 ]]; then
        echo ""
        echo "╔════════════════════════════════════════════════════════════════╗"
        echo "║           ARCHITECTURE PATTERN VALIDATION RESULTS              ║"
        echo "╠════════════════════════════════════════════════════════════════╣"
        echo "║  Pattern: ${pattern}                                            "
        echo "║  Status: PASS                                                 ║"
        echo "║  Violations: 0                                                ║"
        echo "╚════════════════════════════════════════════════════════════════╝"
        echo ""
        return 0
    fi

    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║           ARCHITECTURE PATTERN VALIDATION RESULTS              ║"
    echo "╠════════════════════════════════════════════════════════════════╣"
    echo "║  Pattern: ${pattern}                                            "
    echo "║  Status: FAIL                                                  ║"
    echo "║  Violations: ${#violations[@]}                                                ║"
    echo "╠════════════════════════════════════════════════════════════════╣"

    for i in "${!violations[@]}"; do
        printf "║  [%d] %s\n" "$((i + 1))" "${violations[$i]}"
        local msg_len=${#violations[$i]}
        local padding=$((61 - msg_len))
        printf "%${padding}s║\n" ""
    done

    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

# Main execution
main() {
    local project_root="${1:-.}"
    local pattern="${2:-layered}"

    local violations=()

    case "${pattern}" in
        layered)
            violations=($(validate_layered_architecture "${project_root}"))
            ;;
        hexagonal)
            violations=($(validate_hexagonal_architecture "${project_root}"))
            ;;
        clean)
            violations=($(validate_clean_architecture "${project_root}"))
            ;;
        microservices)
            violations=($(validate_microservices_architecture "${project_root}"))
            ;;
        *)
            log_message "ERROR" "Unknown architecture pattern: ${pattern}"
            echo "Valid patterns: layered, hexagonal, clean, microservices"
            exit 1
            ;;
    esac

    display_violations "${pattern}" "${violations[@]}"

    # Write report
    local violations_json="[]"
    if [[ ${#violations[@]} -gt 0 ]]; then
        violations_json="["
        for i in "${!violations[@]}"; do
            if [[ $i -gt 0 ]]; then
                violations_json="${violations_json}, "
            fi
            violations_json="${violations_json}{\"message\": \"${violations[$i]}\", \"index\": ${i}}"
        done
        violations_json="${violations_json}]"
    fi

    cat > "${PATTERN_REPORT}" <<EOF
{
  "pattern": "${pattern}",
  "violations": ${violations_json},
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "$([[ ${#violations[@]} -eq 0 ]] && echo "pass" || echo "fail")",
  "total_violations": ${#violations[@]}
}
EOF

    # Return error if violations found
    [[ ${#violations[@]} -eq 0 ]]
}

# Run main function
main "$@"
