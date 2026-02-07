#!/bin/bash
# Dependency vulnerability checker
# Supports multiple package managers

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Detect package manager
detect_package_manager() {
    if [ -f "package.json" ]; then
        echo "npm"
    elif [ -f "requirements.txt" ] || [ -f "Pipfile" ] || [ -f "pyproject.toml" ]; then
        echo "pip"
    elif [ -f "Gemfile" ]; then
        echo "bundler"
    elif [ -f "composer.json" ]; then
        echo "composer"
    elif [ -f "pom.xml" ]; then
        echo "maven"
    elif [ -f "go.mod" ]; then
        echo "go"
    elif [ -f "Cargo.toml" ]; then
        echo "cargo"
    else
        echo "unknown"
    fi
}

# Run npm audit
audit_npm() {
    echo "Running npm audit..."

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm not found${NC}"
        return 1
    fi

    # Run audit with JSON output
    AUDIT_RESULT=$(npm audit --json --production 2>/dev/null || echo '{"vulnerabilities": {}}')

    # Parse and display results
    VULN_COUNT=$(echo "$AUDIT_RESULT" | jq '[.vulneratures | to_entries[] | select(.value.severity == "critical" or .value.severity == "high")] | length' 2>/dev/null || echo "0")

    if [ "$VULN_COUNT" -gt 0 ]; then
        echo -e "${RED}⚠️  Found $VULN_COUNT critical/high vulnerabilities${NC}"
        npm audit --production
        echo ""
        echo "To fix: npm audit fix --force"
    else
        echo -e "${GREEN}✓ No critical vulnerabilities found${NC}"
    fi
}

# Run pip-audit
audit_pip() {
    echo "Running pip-audit..."

    if ! command -v pip-audit &> /dev/null; then
        echo -e "${YELLOW}Warning: pip-audit not found. Install with: pip install pip-audit${NC}"
        return 1
    fi

    pip-audit --format json --output /tmp/audit.json 2>/dev/null || true

    if [ -f "/tmp/audit.json" ]; then
        VULN_COUNT=$(jq '[.[] | select(.severity == "high" or .severity == "critical")] | length' /tmp/audit.json 2>/dev/null || echo "0")

        if [ "$VULN_COUNT" -gt 0 ]; then
            echo -e "${RED}⚠️  Found $VULN_COUNT critical/high vulnerabilities${NC}"
            pip-audit
        else
            echo -e "${GREEN}✓ No critical vulnerabilities found${NC}"
        fi

        rm -f /tmp/audit.json
    fi
}

# Run bundle audit
audit_bundler() {
    echo "Running bundle audit..."

    if ! command -v bundle &> /dev/null; then
        echo -e "${RED}Error: bundler not found${NC}"
        return 1
    fi

    # Install bundler-audit if not present
    if ! command -v bundle-audit &> /dev/null; then
        echo "Installing bundler-audit..."
        gem install bundler-audit
    fi

    bundle-audit check
}

# Main function
main() {
    echo "═════════════════════════════════════════════"
    echo "    Dependency Security Audit"
    echo "═════════════════════════════════════════════"
    echo ""

    PKG_MANAGER=$(detect_package_manager)

    if [ "$PKG_MANAGER" = "unknown" ]; then
        echo -e "${RED}Error: No supported package manager found${NC}"
        echo ""
        echo "Supported package managers:"
        echo "  - npm/yarn/pnpm (package.json)"
        echo "  - pip (requirements.txt, Pipfile)"
        echo "  - bundler (Gemfile)"
        echo "  - composer (composer.json)"
        echo "  - maven (pom.xml)"
        echo "  - go (go.mod)"
        echo "  - cargo (Cargo.toml)"
        exit 1
    fi

    echo "Detected package manager: $PKG_MANAGER"
    echo ""

    case $PKG_MANAGER in
        npm)
            audit_npm
            ;;
        pip)
            audit_pip
            ;;
        bundler)
            audit_bundler
            ;;
        *)
            echo -e "${YELLOW}⚠️  Audit for $PKG_MANAGER not yet implemented${NC}"
            ;;
    esac

    echo ""
    echo "═════════════════════════════════════════════"
    echo "Dependency audit complete!"
    echo "═════════════════════════════════════════════"
}

main
