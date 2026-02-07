#!/bin/bash
#
# Architecture Gatekeeper - Circular Dependency Detection
#
# This script detects circular dependencies in TypeScript/JavaScript projects
# using madge (module dependency graph analyzer).
#
# Features:
# - Detects circular dependencies across entire project
# - Supports multiple file extensions (.ts, .tsx, .js, .jsx)
# - Configurable exclude patterns (node_modules, dist, build)
# - Detailed cycle reporting with file paths
#
# Output: JSON formatted circular dependency report
#

set -euo pipefail

# Get the plugin root directory
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"

# Configuration
DATA_DIR="${PLUGIN_ROOT}/data"
VIOLATIONS_FILE="${DATA_DIR}/violations.json"
CIRCULAR_REPORT="${DATA_DIR}/circular-report.json"
MAX_CYCLES="${MAX_CYCLES:-0}"

# Ensure data directory exists
mkdir -p "${DATA_DIR}"

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [${level}] ${message}"
}

# Detect circular dependencies using madge
detect_circular_dependencies() {
    local project_root="${1:-.}"
    local file_pattern="${2:-**/*.{ts,tsx,js,jsx}}"
    local exclude_patterns="${3:-node_modules,dist,build,.claude}"

    log_message "INFO" "Starting circular dependency detection in ${project_root}"

    # Check if npx is available
    if ! command -v npx &> /dev/null; then
        log_message "ERROR" "npx is not available. Please install Node.js."
        return 1
    fi

    # Build madge command
    local madge_cmd="npx madge --circular --extensions ts,tsx,js,jsx"

    # Add exclude patterns
    IFS=',' read -ra EXCLUDE_ARRAY <<< "${exclude_patterns}"
    for pattern in "${EXCLUDE_ARRAY[@]}"; do
        madge_cmd="${madge_cmd} --exclude ${pattern}"
    done

    madge_cmd="${madge_cmd} ${project_root}"

    # Run madge and capture output
    local output
    local exit_code

    output=$(${madge_cmd} 2>&1) || exit_code=$?

    # Parse results
    if [[ ${exit_code:-0} -eq 0 ]] && [[ "${output}" =~ "No circular dependencies found" ]]; then
        log_message "INFO" "No circular dependencies found"

        # Write empty report
        cat > "${CIRCULAR_REPORT}" <<EOF
{
  "circular_dependencies": [],
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "clean"
}
EOF

        return 0
    fi

    # Circular dependencies found
    log_message "WARNING" "Circular dependencies detected"

    # Parse output to extract cycles
    local cycles_json="[]"
    local in_cycles=false
    declare -a cycles

    while IFS= read -r line; do
        if [[ "${line}" =~ "Found" ]] && [[ "${line}" =~ "circular" ]]; then
            in_cycles=true
            continue
        fi

        if [[ "${in_cycles}" == true ]]; then
            # Extract cycle path (e.g., "path/to/file.ts -> path/to/other.ts")
            if [[ "${line}" =~ .+\.(ts|tsx|js|jsx).*$ ]]; then
                cycles+=("${line}")
            fi
        fi
    done <<< "${output}"

    # Build JSON output
    if [[ ${#cycles[@]} -gt 0 ]]; then
        local cycles_array="["
        for i in "${!cycles[@]}"; do
            if [[ $i -gt 0 ]]; then
                cycles_array="${cycles_array}, "
            fi
            cycles_array="${cycles_array}{\"cycle\": \"${cycles[$i]}\", \"index\": ${i}}"
        done
        cycles_array="${cycles_array}]"
        cycles_json="${cycles_array}"
    fi

    # Write report
    cat > "${CIRCULAR_REPORT}" <<EOF
{
  "circular_dependencies": ${cycles_json},
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "violations",
  "total_cycles": ${#cycles[@]}
}
EOF

    # Update violations file
    if [[ -f "${VIOLATIONS_FILE}" ]]; then
        local current
        current=$(cat "${VIOLATIONS_FILE}")
        local updated
        updated=$(echo "${current}" | jq --argjson report "$(cat "${CIRCULAR_REPORT}")" '.circular_dependencies = $report.circular_dependencies | .timestamp = $report.timestamp')
        echo "${updated}" > "${VIOLATIONS_FILE}"
    fi

    # Display results
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║              CIRCULAR DEPENDENCY DETECTION RESULTS            ║"
    echo "╠════════════════════════════════════════════════════════════════╣"
    echo "║  Status: VIOLATIONS DETECTED                                   ║"
    echo "║  Total Cycles: ${#cycles[@]}                                                ║"
    echo "╠════════════════════════════════════════════════════════════════╣"

    for i in "${!cycles[@]}"; do
        printf "║  [%d] %s\n" "$((i + 1))" "${cycles[$i]}"
        # Pad with spaces to maintain table width
        local cycle_len=${#cycles[$i]}
        local padding=$((61 - cycle_len))
        printf "%${padding}s║\n" ""
    done

    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Use /check-circular --fix to see suggestions for resolving these issues."
    echo ""

    # Return error if cycles exceed threshold
    if [[ ${#cycles[@]} -gt ${MAX_CYCLES} ]]; then
        return 1
    fi

    return 0
}

# Provide fix suggestions
suggest_fixes() {
    echo ""
    echo "SUGGESTED FIXES FOR CIRCULAR DEPENDENCIES:"
    echo ""
    echo "1. Extract Common Code:"
    echo "   - Move shared code to a separate module that both files can import"
    echo "   - This breaks the cycle by creating a one-way dependency"
    echo ""
    echo "2. Use Dependency Inversion:"
    echo "   - Create an interface/abstraction that both modules depend on"
    echo "   - Place the interface in a separate 'interfaces' or 'types' module"
    echo ""
    echo "3. Introduce Events/Messaging:"
    echo "   - Replace direct imports with event-based communication"
    echo "   - Use an event emitter or pub/sub pattern"
    echo ""
    echo "4. Lazy Loading:"
    echo "   - Defer the import to when it's actually needed (inside a function)"
    echo "   - This can sometimes break the immediate circular reference"
    echo ""
    echo "5. Restructure Modules:"
    echo "   - Consider if one of the modules really needs to import the other"
    echo "   - Restructure to follow the dependency rule (depend on abstractions)"
    echo ""
}

# Main execution
main() {
    local project_root="${1:-.}"
    local action="${2:-detect}"
    local file_pattern="${3:-**/*.{ts,tsx,js,jsx}}"
    local exclude_patterns="${4:-node_modules,dist,build,.claude}"

    case "${action}" in
        detect)
            detect_circular_dependencies "${project_root}" "${file_pattern}" "${exclude_patterns}"
            ;;
        fix)
            detect_circular_dependencies "${project_root}" "${file_pattern}" "${exclude_patterns}"
            suggest_fixes
            ;;
        *)
            echo "Usage: $0 [project_root] [detect|fix] [file_pattern] [exclude_patterns]"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
