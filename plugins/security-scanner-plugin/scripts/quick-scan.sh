#!/bin/bash
# Quick security scan script - runs on session start
# Performs a fast security check for obvious issues

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔒 Running quick security scan..."

# Function to check for hardcoded secrets
check_secrets() {
    echo "Checking for hardcoded secrets..."

    # Common secret patterns
    PATTERNS=(
        "password\s*=\s*['\"][^'\"]{8,}['\"]"
        "api[_-]?key\s*=\s*['\"][^'\"]{20,}['\"]"
        "secret[_-]?key\s*=\s*['\"][^'\"]{20,}['\"]"
        "token\s*=\s*['\"][^'\"]{30,}['\"]"
        "private[_-]?key\s*=\s*['\"][^'\"]{40,}['\"]"
        "AKIA[0-9A-Z]{16}"  # AWS access key
        "ghp_[a-zA-Z0-9]{36}"  # GitHub token
        "sk-[a-zA-Z0-9]{48}"  # Stripe key
    )

    FOUND=0

    for pattern in "${PATTERNS[@]}"; do
        if git grep -E "$pattern" -- . ':!.env*' ':!node_modules/*' ':!vendor/*' 2>/dev/null | head -5; then
            FOUND=1
        fi
    done

    if [ $FOUND -eq 1 ]; then
        echo -e "${RED}⚠️  Potential hardcoded secrets found!${NC}"
        echo "Please review and move to environment variables or secret manager."
    else
        echo -e "${GREEN}✓ No obvious hardcoded secrets detected${NC}"
    fi
}

# Function to check for insecure file permissions
check_permissions() {
    echo "Checking file permissions..."

    # Check for overly permissive files
    PERMISSIVE_FILES=$(find . -type f -perm /o=rwx -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -5)

    if [ -n "$PERMISSIVE_FILES" ]; then
        echo -e "${YELLOW}⚠️  Files with overly permissive permissions:${NC}"
        echo "$PERMISSIVE_FILES"
        echo "Consider restricting file permissions (chmod 600/644)."
    else
        echo -e "${GREEN}✓ File permissions look okay${NC}"
    fi
}

# Function to check for dependency vulnerabilities (if package manager exists)
check_dependencies() {
    echo "Checking dependency vulnerabilities..."

    if [ -f "package.json" ] && command -v npm &> /dev/null; then
        echo "Running npm audit..."
        npm audit --production --audit-level high || echo -e "${YELLOW}⚠️  Some dependency vulnerabilities found${NC}"
    elif [ -f "requirements.txt" ] && command -v pip-audit &> /dev/null; then
        echo "Running pip-audit..."
        pip-audit || echo -e "${YELLOW}⚠️  Some dependency vulnerabilities found${NC}"
    elif [ -f "Gemfile" ] && command -v bundle &> /dev/null; then
        echo "Running bundle audit..."
        bundle audit check || echo -e "${YELLOW}⚠️  Some dependency vulnerabilities found${NC}"
    else
        echo "No supported package manager found for dependency check"
    fi
}

# Function to check for .env files
check_env_files() {
    echo "Checking for exposed .env files..."

    ENV_FILES=$(find . -maxdepth 2 -name ".env*" -not -name ".env.example" 2>/dev/null)

    if [ -n "$ENV_FILES" ]; then
        echo -e "${YELLOW}⚠️  .env files found in repository:${NC}"
        echo "$ENV_FILES"
        echo "Ensure .env files are in .gitignore and not committed to git."
    else
        echo -e "${GREEN}✓ No .env files detected${NC}"
    fi
}

# Main execution
main() {
    echo "═════════════════════════════════════════════"
    echo "    Security Scanner - Quick Scan"
    echo "═════════════════════════════════════════════"
    echo ""

    # Run all checks
    check_secrets
    echo ""
    check_permissions
    echo ""
    check_dependencies
    echo ""
    check_env_files
    echo ""
    echo "═════════════════════════════════════════════"
    echo "Quick scan complete!"
    echo ""
    echo "For a comprehensive scan, run: /security-scan"
    echo "═════════════════════════════════════════════"
}

# Run main function
main
