#!/bin/bash
# Security scan script - scans codebase for vulnerabilities
# Supports multiple languages and vulnerability patterns

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SEVERITY="medium"
OUTPUT="text"
SCAN_PATH="."

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --severity)
            SEVERITY="$2"
            shift 2
            ;;
        --output)
            OUTPUT="$2"
            shift 2
            ;;
        --path)
            SCAN_PATH="$2"
            shift 2
            ;;
        --owasp)
            FOCUS_OWASP=true
            shift
            ;;
        --fix)
            AUTO_FIX=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --severity <level>  Minimum severity (critical, high, medium, low)"
            echo "  --output <format>   Output format (text, json)"
            echo "  --path <path>       Path to scan"
            echo "  --owasp             Focus on OWASP Top 10"
            echo "  --fix               Attempt to auto-fix issues"
            echo "  --help, -h          Show this help"
            exit 0
            ;;
        *)
            SCAN_PATH="$1"
            shift
            ;;
    esac
done

# Vulnerability patterns with severity
declare -A VULN_PATTERNS

# Critical patterns
VULN_PATTERNS["CRITICAL:SQL Injection (query interpolation)"]='query\s*=\s*[`"'\''].*\$.*[`"'\'']'
VULN_PATTERNS["CRITICAL:SQL Injection (string concat in execute)"]='execute\s*\(\s*[`"'\''].*\+.*[`"'\'']'
VULN_PATTERNS["CRITICAL:Command Injection (exec with concat)"]='exec\s*\(\s*[^)]*\+'
VULN_PATTERNS["CRITICAL:Command Injection (subprocess shell)"]='subprocess.*shell\s*=\s*true'
VULN_PATTERNS["CRITICAL:Hardcoded Password"]='password\s*=\s*['\"'][^\"\']{8,}['\"]'
VULN_PATTERNS["CRITICAL:Hardcoded API Key"]='api[_-]?key\s*=\s*['\"'][^\"\']{20,}['\"]'
VULN_PATTERNS["CRITICAL:Hardcoded Secret Key"]='secret[_-]?key\s*=\s*['\"'][^\"\']{20,}['\"]'
VULN_PATTERNS["CRITICAL:Hardcoded Token"]='token\s*=\s*['\"'][^\"\']{30,}['\"]'

# High severity patterns
VULN_PATTERNS["HIGH:XSS (innerHTML)"]='innerHTML\s*=\s*'
VULN_PATTERNS["HIGH:XSS (document.write)"]='document\.write\s*\('
VULN_PATTERNS["HIGH:Eval Usage"]='eval\s*\('
VULN_PATTERNS["HIGH:Weak Crypto (MD5)"]='\.md5\s*\('
VULN_PATTERNS["HIGH:Weak Crypto (SHA1)"]='\.sha1\s*\('
VULN_PATTERNS["HIGH:Path Traversal"]='\.\.\/.*\$'

# Medium severity patterns
VULN_PATTERNS["MEDIUM:Information Disclosure (console.log)"]='console\.log\s*\('
VULN_PATTERNS["MEDIUM:ParseInt without radix"]='parseInt\s*\('
VULN_PATTERNS["MEDIUM:Insecure Random"]='Math\.random\s*\(\)'
VULN_PATTERNS["MEDIUM:Missing CSRF protection"]='csrf'

# Files to scan
SCAN_EXTENSIONS="\.js$|\.ts$|\.jsx$|\.tsx$|\.py$|\.java$|\.go$|\.php$|\.rb$|\.cs$|\.c$|\.cpp$"

# Directories to skip
SKIP_DIRS="node_modules|vendor|\.git|__pycache__|\.venv|venv|env|dist|build|\.idea|\.vscode"

# Severity mapping
severity_level() {
    local vuln="$1"
    case "$vuln" in
        CRITICAL:*|"HIGH:"*) echo "high" ;;
        MEDIUM:*) echo "medium" ;;
        *) echo "low" ;;
    esac
}

# Print colored output
print_header() {
    echo ""
    echo -e "${BLUE}═════════════════════════════════════════════${NC}"
    echo -e "${BLUE}    SECURITY SCAN REPORT${NC}"
    echo -e "${BLUE}═════════════════════════════════════════════${NC}"
    echo ""
}

print_summary() {
    local total=$1
    local critical=$2
    local high=$3
    local medium=$4
    local low=$5

    echo "Total findings: $total"
    echo -e "  ${RED}Critical: $critical${NC}"
    echo -e "  ${YELLOW}High: $high${NC}"
    echo -e "  ${YELLOW}Medium: $medium${NC}"
    echo -e "  ${BLUE}Low: $low${NC}"
    echo ""
}

print_finding() {
    local severity=$1
    local vuln_type=$2
    local file=$3
    local line=$4
    local code=$5

    local emoji="🔵"
    local color="${BLUE}"

    case "$severity" in
        critical) emoji="🔴"; color="${RED}" ;;
        high) emoji="🟠"; color="${YELLOW}" ;;
        medium) emoji="🟡"; color="${YELLOW}" ;;
    esac

    echo -e "${emoji} ${severity^^}: ${vuln_type}"
    echo -e "   ${color}File: ${file}:${line}${NC}"
    echo -e "   ${color}Code: ${code}${NC}"
    echo ""
}

# Main scanning function
scan_file() {
    local file="$1"
    local findings=()

    while IFS= read -r line; do
        line_num="${line%%:*}"
        code="${line#*:}"

        for vuln_pattern in "${!VULN_PATTERNS[@]}"; do
            pattern="${VULN_PATTERNS[$vuln_pattern]}"
            if echo "$code" | grep -Eqi "$pattern"; then
                local severity
                severity=$(severity_level "$vuln_pattern")

                # Filter by severity threshold
                local pass=false
                case "$SEVERITY" in
                    critical)   [[ "$severity" == "critical" ]] && pass=true ;;
                    high)       [[ "$severity" == "critical" || "$severity" == "high" ]] && pass=true ;;
                    medium)     [[ "$severity" != "low" ]] && pass=true ;;
                    low)        pass=true ;;
                esac

                if $pass; then
                    findings+=("$severity|$vuln_pattern|$file|$line_num|$code")
                fi
            fi
        done
    done < "$file"

    printf '%s\n' "${findings[@]}"
}

# Main execution
main() {
    print_header

    if [ ! -d "$SCAN_PATH" ]; then
        echo -e "${RED}Error: Path not found: $SCAN_PATH${NC}"
        exit 1
    fi

    echo "Scanning: $SCAN_PATH"
    echo "Severity: $SEVERITY"
    echo ""

    # Collect all findings
    all_findings=()
    critical=0
    high=0
    medium=0
    low=0

    while IFS= read -r file; do
        if [ -f "$file" ]; then
            while IFS= read -r finding; do
                [ -z "$finding" ] && continue

                IFS='|' read -r sev type fpath fline code <<< "$finding"

                all_findings+=("$sev|$type|$fpath|$fline|$code")

                case "$sev" in
                    critical) ((critical++)) ;;
                    high)     ((high++)) ;;
                    medium)   ((medium++)) ;;
                    low)      ((low++)) ;;
                esac
            done < <(scan_file "$file" 2>/dev/null || true)
        fi
    done < <(find "$SCAN_PATH" -type f -regextype posix-extended -regex ".*($SCAN_EXTENSIONS)" 2>/dev/null | grep -Ev "($SKIP_DIRS)" | head -500)

    local total=$((critical + high + medium + low))

    if [ "$OUTPUT" == "json" ]; then
        cat << EOF
{
  "summary": {
    "total": $total,
    "critical": $critical,
    "high": $high,
    "medium": $medium,
    "low": $low
  },
  "findings": [
$(for f in "${all_findings[@]}"; do
    IFS='|' read -r sev type fpath fline code <<< "$f"
    echo "    {"
    echo "      \"severity\": \"$sev\","
    echo "      \"type\": \"$type\","
    echo "      \"file\": \"$fpath\","
    echo "      \"line\": $fline,"
    echo "      \"code\": \"$(echo "$code" | sed 's/"/\\"/g')\""
    echo -n "    },"
done | sed '$ s/,$//')
  ]
}
EOF
        return
    fi

    print_summary $total $critical $high $medium $low

    if [ $total -eq 0 ]; then
        echo -e "${GREEN}✓ No vulnerabilities found!${NC}"
    else
        # Sort findings by severity
        for finding in "${all_findings[@]}"; do
            IFS='|' read -r sev type fpath fline code <<< "$finding"
            print_finding "$sev" "$type" "$fpath" "$fline" "$code"
        done
    fi

    echo -e "${BLUE}═════════════════════════════════════════════${NC}"
    echo ""
    echo "For detailed analysis, run:"
    echo "  /security-scan --path $SCAN_PATH --output json > report.json"
    echo ""
}

main