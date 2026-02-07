#!/bin/bash
#
# Architecture Gatekeeper - Violations Display
#
# This script displays detected architecture violations in various formats.
#
# Features:
# - Display violations in table, JSON, or markdown format
# - Filter by severity level (error, warning, info)
# - Show violation history and trends
# - Export violations for reporting
#
# Output: Formatted violation report
#

set -euo pipefail

# Get the plugin root directory
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"

# Configuration
DATA_DIR="${PLUGIN_ROOT}/data"
VIOLATIONS_FILE="${DATA_DIR}/violations.json"
CIRCULAR_REPORT="${DATA_DIR}/circular-report.json"
PATTERN_REPORT="${DATA_DIR}/pattern-report.json"
COMMIT_REPORT="${DATA_DIR}/commit-validation.json"

# Display format
FORMAT="${FORMAT:-table}"
SEVERITY="${SEVERITY:-error}"

# Colors for terminal output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [${level}] ${message}"
}

# Load violations from all sources
load_violations() {
    local all_violations="[]"

    # Load from main violations file
    if [[ -f "${VIOLATIONS_FILE}" ]]; then
        all_violations=$(jq -s 'add' "${VIOLATIONS_FILE}" "${CIRCULAR_REPORT}" "${PATTERN_REPORT}" "${COMMIT_REPORT}" 2>/dev/null || echo "[]")
    fi

    echo "${all_violations}"
}

# Display violations in table format
display_table() {
    local violations="$1"
    local severity_filter="$2"

    local violations_array
    violations_array=$(echo "${violations}" | jq "[.[] | select(.severity == \"${severity_filter}\" or .severity == null)]")

    local count
    count=$(echo "${violations_array}" | jq 'length')

    if [[ "${count}" -eq 0 ]]; then
        echo ""
        echo "╔════════════════════════════════════════════════════════════════╗"
        echo "║                    ARCHITECTURE VIOLATIONS                     ║"
        echo "╠════════════════════════════════════════════════════════════════╣"
        echo "║  Status: CLEAN (No violations found)                          ║"
        echo "╚════════════════════════════════════════════════════════════════╝"
        echo ""
        return 0
    fi

    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    ARCHITECTURE VIOLATIONS                     ║"
    echo "╠════════════════════════════════════════════════════════════════╣"
    echo "║  Total: ${count} violation(s) (severity: ${severity_filter})                     "
    echo "╠════════════════════════════════════════════════════════════════╣"

    for i in $(seq 0 $((count - 1))); do
        local violation
        violation=$(echo "${violations_array}" | jq ".[${i}]")

        local type
        type=$(echo "${violation}" | jq -r '.type // .message // "unknown"')
        local message
        message=$(echo "${violation}" | jq -r '.message // "N/A"')
        local file
        file=$(echo "${violation}" | jq -r '.file // "N/A"')
        local line
        line=$(echo "${violation}" | jq -r '.line // 0')
        local timestamp
        timestamp=$(echo "${violation}" | jq -r '.timestamp // "N/A"')

        # Format timestamp to readable format
        local readable_time
        readable_time=$(date -d "${timestamp}" +"%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "${timestamp}")

        printf "║  [%d] %s\n" "$((i + 1))" "${type}"
        printf "║      Message: %s\n" "${message}"
        printf "║      File: %s:%d\n" "${file}" "${line}"
        printf "║      Time: %s\n" "${readable_time}"
        echo "║"
    done

    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

# Display violations in JSON format
display_json() {
    local violations="$1"
    local severity_filter="$2"

    local filtered
    filtered=$(echo "${violations}" | jq "[.[] | select(.severity == \"${severity_filter}\" or .severity == null)]")

    echo "${filtered}" | jq -r '.'
}

# Display violations in Markdown format
display_markdown() {
    local violations="$1"
    local severity_filter="$2"

    local violations_array
    violations_array=$(echo "${violations}" | jq "[.[] | select(.severity == \"${severity_filter}\" or .severity == null)]")

    local count
    count=$(echo "${violations_array}" | jq 'length')

    echo "# Architecture Violations Report"
    echo ""
    echo "**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo "**Severity:** ${severity_filter}"
    echo "**Total Violations:** ${count}"
    echo ""

    if [[ "${count}" -eq 0 ]]; then
        echo "No violations found."
        echo ""
        return 0
    fi

    echo "## Violations"
    echo ""

    for i in $(seq 0 $((count - 1))); do
        local violation
        violation=$(echo "${violations_array}" | jq ".[${i}]")

        local type
        type=$(echo "${violation}" | jq -r '.type // .message // "unknown"')
        local message
        message=$(echo "${violation}" | jq -r '.message // "N/A"')
        local file
        file=$(echo "${violation}" | jq -r '.file // "N/A"')
        local line
        line=$(echo "${violation}" | jq -r '.line // 0')
        local timestamp
        timestamp=$(echo "${violation}" | jq -r '.timestamp // "N/A"')

        echo "### Violation $((i + 1)): ${type}"
        echo ""
        echo "| Field | Value |"
        echo "|-------|-------|"
        echo "| Message | \`${message}\` |"
        echo "| File | \`${file}:${line}\` |"
        echo "| Timestamp | ${timestamp} |"
        echo ""
    done

    echo "## Summary"
    echo ""
    echo "- Total violations: ${count}"
    echo "- Severity: ${severity_filter}"
    echo ""
}

# Display summary statistics
display_summary() {
    local violations="$1"

    local total
    total=$(echo "${violations}" | jq 'length')
    local errors
    errors=$(echo "${violations}" | jq '[.[] | select(.severity == "error")] | length')
    local warnings
    warnings=$(echo "${violations}" | jq '[.[] | select(.severity == "warning")] | length')
    local info
    info=$(echo "${violations}" | jq '[.[] | select(.severity == "info")] | length')

    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                 VIOLATION SUMMARY STATISTICS                   ║"
    echo "╠════════════════════════════════════════════════════════════════╣"
    printf "║  Total Violations: %-40d ║\n" "${total}"
    printf "║  Errors: %-50d ║\n" "${errors}"
    printf "║  Warnings: %-48d ║\n" "${warnings}"
    printf "║  Info: %-51d ║\n" "${info}"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

# Main execution
main() {
    local format="${1:-${FORMAT}}"
    local severity="${2:-${SEVERITY}}"
    local action="${3:-display}"

    # Load violations
    local violations
    violations=$(load_violations)

    case "${action}" in
        display)
            case "${format}" in
                table)
                    display_table "${violations}" "${severity}"
                    ;;
                json)
                    display_json "${violations}" "${severity}"
                    ;;
                markdown)
                    display_markdown "${violations}" "${severity}"
                    ;;
                *)
                    echo "Unknown format: ${format}"
                    echo "Valid formats: table, json, markdown"
                    exit 1
                    ;;
            esac
            ;;
        summary)
            display_summary "${violations}"
            ;;
        clear)
            # Clear violations file
            echo '{"circular_dependencies": [], "pattern_violations": [], "import_violations": [], "timestamp": null}' > "${VIOLATIONS_FILE}"
            log_message "INFO" "Violations cleared"
            ;;
        export)
            local export_file="${DATA_DIR}/violations-export-$(date -u +"%Y%m%d-%H%M%S").json"
            cp "${VIOLATIONS_FILE}" "${export_file}"
            log_message "INFO" "Violations exported to ${export_file}"
            ;;
        *)
            echo "Architecture Gatekeeper - Violations Display"
            echo ""
            echo "Usage: $0 [format] [severity] [action]"
            echo ""
            echo "Formats:"
            echo "  table      Display in table format (default)"
            echo "  json       Display in JSON format"
            echo "  markdown   Display in Markdown format"
            echo ""
            echo "Severities:"
            echo "  error      Show only errors (default)"
            echo "  warning    Show only warnings"
            echo "  info       Show only info"
            echo ""
            echo "Actions:"
            echo "  display    Display violations (default)"
            echo "  summary    Show summary statistics"
            echo "  clear      Clear all violations"
            echo "  export     Export violations to file"
            echo ""
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
