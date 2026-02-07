#!/bin/bash
#
# Architecture Gatekeeper - Configuration Management
#
# This script configures architecture gate rules and thresholds.
#
# Features:
# - Enable/disable specific checks
# - Configure violation thresholds
# - Set up custom architecture rules
# - Import/export configurations
# - Reset to defaults
#
# Configuration file: .claude/architecture.json
#

set -euo pipefail

# Get the plugin root directory
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"

# Configuration
DATA_DIR="${PLUGIN_ROOT}/data"
CONFIG_DIR=".claude"
CONFIG_FILE="${CONFIG_DIR}/architecture.json"
CONFIG_BACKUP_DIR="${DATA_DIR}/config-backups"

# Ensure directories exist
mkdir -p "${DATA_DIR}" "${CONFIG_DIR}" "${CONFIG_BACKUP_DIR}"

# Default configuration
DEFAULT_CONFIG=$(cat <<'EOF'
{
  "circular_dependencies": {
    "enabled": true,
    "max_cycles": 0,
    "severity": "error"
  },
  "pattern_violations": {
    "enabled": true,
    "max_violations": 0,
    "severity": "error",
    "pattern": "layered"
  },
  "import_rules": {
    "enabled": true,
    "check_absolute_imports": true,
    "check_relative_imports": true,
    "severity": "warning"
  },
  "commit_validation": {
    "enabled": true,
    "strict_mode": true,
    "check_staged_only": true
  },
  "exclude_patterns": [
    "node_modules",
    "dist",
    "build",
    ".claude",
    "coverage",
    "*.test.ts",
    "*.test.js",
    "*.spec.ts",
    "*.spec.js"
  ],
  "include_patterns": [
    "**/*.{ts,tsx,js,jsx}"
 ]
}
EOF
)

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [${level}] ${message}"
}

# Create default configuration
create_default_config() {
    log_message "INFO" "Creating default configuration at ${CONFIG_FILE}"

    echo "${DEFAULT_CONFIG}" > "${CONFIG_FILE}"

    echo "Default configuration created at ${CONFIG_FILE}"
    echo ""
    echo "Configuration summary:"
    echo "  - Circular dependencies: ENABLED (max: 0)"
    echo "  - Pattern violations: ENABLED (max: 0)"
    echo "  - Import rules: ENABLED"
    echo "  - Commit validation: ENABLED (strict mode)"
    echo ""
    echo "Edit ${CONFIG_FILE} to customize settings"
}

# Backup current configuration
backup_config() {
    if [[ -f "${CONFIG_FILE}" ]]; then
        local backup_file="${CONFIG_BACKUP_DIR}/architecture-$(date -u +"%Y%m%d-%H%M%S").json"
        cp "${CONFIG_FILE}" "${backup_file}"
        log_message "INFO" "Configuration backed up to ${backup_file}"
    fi
}

# Enable or disable a check
configure_check() {
    local check="$1"
    local action="$2"
    local value="$3"

    if [[ ! -f "${CONFIG_FILE}" ]]; then
        create_default_config
    fi

    case "${action}" in
        enable)
            local current
            current=$(cat "${CONFIG_FILE}")
            echo "${current}" | jq ".${check}.enabled = true" > "${CONFIG_FILE}"
            log_message "INFO" "Enabled ${check}"
            ;;
        disable)
            local current
            current=$(cat "${CONFIG_FILE}")
            echo "${current}" | jq ".${check}.enabled = false" > "${CONFIG_FILE}"
            log_message "INFO" "Disabled ${check}"
            ;;
        configure)
            local current
            current=$(cat "${CONFIG_FILE}")
            echo "${current}" | jq ".${check} = ${value}" > "${CONFIG_FILE}"
            log_message "INFO" "Configured ${check}"
            ;;
        *)
            log_message "ERROR" "Unknown action: ${action}"
            return 1
            ;;
    esac
}

# Set violation threshold
set_threshold() {
    local check="$1"
    local threshold="$2"

    if [[ ! -f "${CONFIG_FILE}" ]]; then
        create_default_config
    fi

    local current
    current=$(cat "${CONFIG_FILE}")

    # Determine the correct threshold field
    local threshold_field="max_violations"
    [[ "${check}" == "circular_dependencies" ]] && threshold_field="max_cycles"

    echo "${current}" | jq ".${check}.${threshold_field} = ${threshold}" > "${CONFIG_FILE}"
    log_message "INFO" "Set ${check} threshold to ${threshold}"
}

# Set severity level
set_severity() {
    local check="$1"
    local severity="$2"

    if [[ ! -f "${CONFIG_FILE}" ]]; then
        create_default_config
    fi

    # Validate severity
    if [[ ! "${severity}" =~ ^(error|warning|info)$ ]]; then
        log_message "ERROR" "Invalid severity: ${severity} (must be: error, warning, info)"
        return 1
    fi

    local current
    current=$(cat "${CONFIG_FILE}")
    echo "${current}" | jq ".${check}.severity = \"${severity}\"" > "${CONFIG_FILE}"
    log_message "INFO" "Set ${check} severity to ${severity}"
}

# Set architecture pattern
set_pattern() {
    local pattern="$1"

    if [[ ! -f "${CONFIG_FILE}" ]]; then
        create_default_config
    fi

    # Validate pattern
    if [[ ! "${pattern}" =~ ^(layered|hexagonal|clean|microservices)$ ]]; then
        log_message "ERROR" "Invalid pattern: ${pattern}"
        echo "Valid patterns: layered, hexagonal, clean, microservices"
        return 1
    fi

    local current
    current=$(cat "${CONFIG_FILE}")
    echo "${current}" | jq '.pattern_violations.pattern = "'"${pattern}"'"' > "${CONFIG_FILE}"
    log_message "INFO" "Set architecture pattern to ${pattern}"
}

# Display current configuration
show_config() {
    if [[ ! -f "${CONFIG_FILE}" ]]; then
        echo "No configuration file found at ${CONFIG_FILE}"
        echo "Run 'configure-gates.sh create' to create a default configuration"
        return 0
    fi

    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║              ARCHITECTURE GATEKEEPER CONFIGURATION            ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    jq '.' "${CONFIG_FILE}"

    echo ""
}

# Reset configuration to defaults
reset_config() {
    backup_config
    create_default_config
    log_message "INFO" "Configuration reset to defaults"
}

# Main execution
main() {
    local action="${1:-show}"
    shift || true

    case "${action}" in
        create)
            create_default_config
            ;;
        backup)
            backup_config
            ;;
        show)
            show_config
            ;;
        reset)
            reset_config
            ;;
        enable)
            [[ $# -lt 1 ]] && { echo "Usage: $0 enable <check>"; exit 1; }
            configure_check "$1" "enable"
            ;;
        disable)
            [[ $# -lt 1 ]] && { echo "Usage: $0 disable <check>"; exit 1; }
            configure_check "$1" "disable"
            ;;
        threshold)
            [[ $# -lt 2 ]] && { echo "Usage: $0 threshold <check> <value>"; exit 1; }
            set_threshold "$1" "$2"
            ;;
        severity)
            [[ $# -lt 2 ]] && { echo "Usage: $0 severity <check> <error|warning|info>"; exit 1; }
            set_severity "$1" "$2"
            ;;
        pattern)
            [[ $# -lt 1 ]] && { echo "Usage: $0 pattern <layered|hexagonal|clean|microservices>"; exit 1; }
            set_pattern "$1"
            ;;
        *)
            echo "Architecture Gatekeeper - Configuration Management"
            echo ""
            echo "Usage: $0 <action> [options]"
            echo ""
            echo "Actions:"
            echo "  create                    Create default configuration file"
            echo "  show                      Display current configuration"
            echo "  backup                    Backup current configuration"
            echo "  reset                     Reset to default configuration"
            echo "  enable <check>            Enable a check (circular_dependencies, pattern_violations, import_rules)"
            echo "  disable <check>           Disable a check"
            echo "  threshold <check> <val>   Set violation threshold for a check"
            echo "  severity <check> <level>  Set severity level (error, warning, info)"
            echo "  pattern <name>            Set architecture pattern (layered, hexagonal, clean, microservices)"
            echo ""
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
