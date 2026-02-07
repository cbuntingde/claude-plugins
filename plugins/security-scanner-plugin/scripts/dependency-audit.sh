#!/bin/bash
# Dependency audit script - audits project dependencies for vulnerabilities
# Supports multiple package managers: npm, pip, bundler, composer, maven, go, cargo

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SEVERITY="high"
PRODUCTION=false
LICENSES=false
OUTPUT="text"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --severity)
            SEVERITY="$2"
            shift 2
            ;;
        --production)
            PRODUCTION=true
            shift
            ;;
        --dev)
            DEV_ONLY=true
            shift
            ;;
        --licenses)
            LICENSES=true
            shift
            ;;
        --fix)
            AUTO_FIX=true
            shift
            ;;
        --output)
            OUTPUT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --severity <level>   Filter by severity (critical, high, medium, low)"
            echo "  --production         Only audit production dependencies"
            echo "  --dev                Only audit dev dependencies"
            echo "  --licenses           Check for problematic licenses"
            echo "  --fix                Auto-update vulnerable packages"
            echo "  --output <format>    Output format (text, json)"
            echo "  --help, -h           Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_header() {
    echo ""
    echo -e "${BLUE}═════════════════════════════════════════════${NC}"
    echo -e "${BLUE}    DEPENDENCY SECURITY AUDIT${NC}"
    echo -e "${BLUE}═════════════════════════════════════════════${NC}"
    echo ""
}

print_summary() {
    local total=$1
    local critical=$2
    local high=$3
    local medium=$4
    local low=$5

    echo "Audit Summary:"
    echo "  Total vulnerabilities: $total"
    echo -e "    ${RED}Critical: $critical${NC}"
    echo -e "    ${YELLOW}High: $high${NC}"
    echo -e "    ${YELLOW}Medium: $medium${NC}"
    echo -e "    ${BLUE}Low: $low${NC}"
    echo ""
}

# Detect available package managers
detect_package_managers() {
    local pms=()

    [ -f "package.json" ] && pms+=("npm")
    [ -f "requirements.txt" ] || [ -f "Pipfile" ] || [ -f "pyproject.toml" ] && pms+=("pip")
    [ -f "Gemfile" ] && pms+=("bundler")
    [ -f "composer.json" ] && pms+=("composer")
    [ -f "pom.xml" ] && pms+=("maven")
    [ -f "go.mod" ] && pms+=("go")
    [ -f "Cargo.toml" ] && pms+=("cargo")
    [ -f "packages.config" ] || [ -f "*.csproj" ] && pms+=("nuget")

    printf '%s\n' "${pms[@]}"
}

# Audit npm dependencies
audit_npm() {
    echo -e "${BLUE}Detected: npm (Node.js)${NC}"
    echo ""

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm not found${NC}"
        return 1
    fi

    local audit_args="--audit-level=$SEVERITY"
    $PRODUCTION && audit_args="$audit_args --production"
    $DEV_ONLY && audit_args="$audit_args --only=dev"

    echo "Running: npm audit $audit_args"
    echo ""

    # Run audit and capture output
    local audit_output
    audit_output=$(npm audit $audit_args --json 2>&1) || true

    if echo "$audit_output" | grep -q '"vulnerabilities":{}'; then
        echo -e "${GREEN}✓ No vulnerabilities found!${NC}"
        return 0
    fi

    # Parse and display results
    local total_critical
    local total_high
    local total_medium
    local total_low

    total_critical=$(echo "$audit_output" | jq '[.vulnerabilities | to_entries[] | select(.value.severity == "critical")] | length' 2>/dev/null || echo "0")
    total_high=$(echo "$audit_output" | jq '[.vulnerabilities | to_entries[] | select(.value.severity == "high")] | length' 2>/dev/null || echo "0")
    total_medium=$(echo "$audit_output" | jq '[.vulnerabilities | to_entries[] | select(.value.severity == "medium")] | length' 2>/dev/null || echo "0")
    total_low=$(echo "$audit_output" | jq '[.vulnerabilities | to_entries[] | select(.value.severity == "low")] | length' 2>/dev/null || echo "0")

    local total=$((total_critical + total_high + total_medium + total_low))

    print_summary $total $total_critical $total_high $total_medium $total_low

    echo "Top vulnerabilities:"
    echo "$audit_output" | jq -r '.vulnerabilities | to_entries[:10] | .[] | "  - \(.key): \(.value.severity) - \(.value.title)"' 2>/dev/null || true

    echo ""
    echo "To fix: npm audit fix [--force]"

    # Return error if vulnerabilities found
    [ $total -gt 0 ]
}

# Audit pip dependencies
audit_pip() {
    echo -e "${BLUE}Detected: pip (Python)${NC}"
    echo ""

    if ! command -v pip-audit &> /dev/null; then
        echo -e "${YELLOW}Warning: pip-audit not installed${NC}"
        echo "Install with: pip install pip-audit"
        echo ""
        echo "Alternative: pip check"
        command -v pip &> /dev/null && pip check 2>/dev/null || true
        return 0
    fi

    local audit_args="--severity=$SEVERITY"
    $PRODUCTION && audit_args="$audit_args --pip-args='--exclude-dev'"

    echo "Running: pip-audit $audit_args"
    echo ""

    if pip-audit $audit_args --format json 2>/dev/null | jq '.[] | select(.severity == "critical" or .severity == "high")' 2>/dev/null | grep -q "severity"; then
        pip-audit $audit_args 2>/dev/null || true
    else
        echo -e "${GREEN}✓ No critical or high severity vulnerabilities found!${NC}"
    fi

    echo ""
    echo "To fix: pip-audit --fix"
}

# Audit bundler dependencies
audit_bundler() {
    echo -e "${BLUE}Detected: bundler (Ruby)${NC}"
    echo ""

    if ! command -v bundle &> /dev/null; then
        echo -e "${RED}Error: bundler not found${NC}"
        return 1
    fi

    if ! command -v bundle-audit &> /dev/null; then
        echo "Installing bundler-audit..."
        gem install bundler-audit 2>/dev/null || true
    fi

    if command -v bundle-audit &> /dev/null; then
        echo "Running: bundle-audit check"
        echo ""
        bundle-audit check 2>/dev/null || true
    else
        echo -e "${YELLOW}Warning: bundle-audit not available${NC}"
        echo "Try: gem install bundler-audit"
    fi
}

# Audit go dependencies
audit_go() {
    echo -e "${BLUE}Detected: Go modules${NC}"
    echo ""

    if ! command -v govulncheck &> /dev/null; then
        echo -e "${YELLOW}Warning: govulncheck not installed${NC}"
        echo "Install with: go install golang.org/x/vuln/cmd/govulncheck@latest"
        echo ""
        echo "Alternative: Check Go advisories with 'go list -m -json all | jq -r .Path | xargs -I {} go list -m -versions {} 2>/dev/null'"
        return 0
    fi

    echo "Running: govulncheck ./..."
    echo ""
    govulncheck ./... 2>/dev/null || true
}

# Audit composer dependencies
audit_composer() {
    echo -e "${BLUE}Detected: composer (PHP)${NC}"
    echo ""

    if ! command -v composer &> /dev/null; then
        echo -e "${RED}Error: composer not found${NC}"
        return 1
    fi

    echo "Running: composer audit"
    echo ""
    composer audit 2>/dev/null || true
}

# Audit maven dependencies
audit_maven() {
    echo -e "${BLUE}Detected: Maven (Java)${NC}"
    echo ""

    if ! command -v mvn &> /dev/null; then
        echo -e "${RED}Error: mvn not found${NC}"
        return 1
    fi

    echo "Running: mvn org.owasp:dependency-check-maven:check"
    echo ""
    mvn org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=$SEVERITY 2>/dev/null || true
}

# Main execution
main() {
    print_header

    local package_managers
    mapfile -t package_managers < <(detect_package_managers)

    if [ ${#package_managers[@]} -eq 0 ]; then
        echo -e "${RED}Error: No supported package manager found${NC}"
        echo ""
        echo "Supported package managers:"
        echo "  - npm/yarn/pnpm (package.json)"
        echo "  - pip (requirements.txt, Pipfile, pyproject.toml)"
        echo "  - bundler (Gemfile)"
        echo "  - composer (composer.json)"
        echo "  - maven (pom.xml)"
        echo "  - go (go.mod)"
        echo "  - cargo (Cargo.toml)"
        exit 1
    fi

    echo "Detected package managers: ${package_managers[*]}"
    echo ""

    local has_vulnerabilities=false

    for pm in "${package_managers[@]}"; do
        case "$pm" in
            npm)
                audit_npm && : || has_vulnerabilities=true
                ;;
            pip)
                audit_pip
                ;;
            bundler)
                audit_bundler
                ;;
            go)
                audit_go
                ;;
            composer)
                audit_composer
                ;;
            maven)
                audit_maven
                ;;
            *)
                echo -e "${YELLOW}Audit for $pm not yet implemented${NC}"
                ;;
        esac
        echo ""
    done

    echo -e "${BLUE}═════════════════════════════════════════════${NC}"
    echo ""
    echo "For comprehensive scanning, consider:"
    echo "  - Snyk: https://snyk.io"
    echo "  - OWASP Dependency-Check: https://owasp.org/www-project-dependency-check/"
    echo "  - GitHub Dependabot (for GitHub repos)"
    echo ""

    if $has_vulnerabilities; then
        exit 1
    fi
}

main