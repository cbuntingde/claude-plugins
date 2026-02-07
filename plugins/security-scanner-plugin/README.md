# 🔒 Security Scanner Plugin for Claude Code

A comprehensive security scanner plugin for Claude Code that detects common vulnerabilities, security misconfigurations, and provides actionable fix recommendations.

## Features

- **OWASP Top 10 Detection**: Automatically identifies injection flaws, broken authentication, XSS, CSRF, and more
- **Vulnerability Scanning**: Deep code analysis for security vulnerabilities across multiple languages
- **Dependency Auditing**: Scans dependencies for known CVEs and security advisories
- **Configuration Validation**: Checks for security misconfigurations and exposed secrets
- **Automated Hooks**: Real-time security checks on file operations
- **Security Agents**: Specialized AI agents for vulnerability detection and security auditing
- **Auto-Fix Suggestions**: Provides specific remediation steps for each vulnerability found

## Installation

### Option 1: Install from Local Directory

```bash
# Navigate to your project directory
cd /path/to/your/project

# Install the plugin
claude plugin install /path/to/security-scanner-plugin
```

### Option 2: Copy to Project

```bash
# Copy plugin to your project's .claude directory
cp -r security-scanner-plugin /path/to/your/project/.claude/plugins/security-scanner
```

### Option 3: Install from Marketplace (when published)

```bash
claude plugin install security-scanner
```

## Quick Start

After installation, the plugin automatically:

1. **Runs on session start**: Quick security scan checks for obvious issues
2. **Scans on file writes**: Automatically analyzes code when you save files
3. **Provides commands**: Use slash commands for comprehensive scans

### Basic Usage

```bash
# Full security scan
/security-scan

# Check specific vulnerabilities
/vulnerability-check sql-injection

# Audit dependencies
/dependency-audit
```

## Usage

### Running Security Scans

The security scanner provides multiple ways to scan your codebase for vulnerabilities:

#### Full Project Scan
```bash
# Scan the entire project
/security-scan

# Scan a specific directory
/security-scan --path ./src

# Scan with severity filtering
/security-scan --severity critical,high

# Focus on OWASP Top 10 vulnerabilities
/security-scan --owasp

# Auto-fix detected vulnerabilities
/security-scan --fix

# Export results to JSON
/security-scan --output json > report.json
```

#### Vulnerability Checks
```bash
# Check for specific vulnerability types
/vulnerability-check sql-injection
/vulnerability-check xss --path ./frontend
/vulnerability-check secrets
/vulnerability-check auth-hardcoded
```

#### Dependency Audits
```bash
# Audit all dependencies
/dependency-audit

# Filter by severity
/dependency-audit --severity critical,high

# Auto-update vulnerable packages
/dependency-audit --fix

# Check only production dependencies
/dependency-audit --production

# Export audit report
/dependency-audit --output json > audit.json
```

### Interpreting Results

Scan results are categorized by severity:

- **Critical**: Immediate action required - severe security vulnerabilities
- **High**: Significant risk - should be addressed promptly
- **Medium**: Moderate risk - plan remediation
- **Low**: Minor issues - address when convenient

Each finding includes:
- File location and line number
- Vulnerable code snippet
- Security impact description
- Recommended fix or remediation steps

## Commands

### `/security-scan`

Perform a comprehensive security scan of your codebase.

```bash
/security-scan                                    # Scan entire project
/security-scan --path ./src                      # Scan specific directory
/security-scan --severity critical,high          # Only show critical/high issues
/security-scan --owasp                           # Focus on OWASP Top 10
/security-scan --fix                             # Auto-fix vulnerabilities
/security-scan --output json > report.json       # Export JSON report
```

### `/vulnerability-check`

Quick vulnerability check for specific security issues.

```bash
/vulnerability-check sql-injection              # Check for SQL injection
/vulnerability-check xss --path ./frontend      # Check for XSS in frontend
/vulnerability-check secrets                    # Check for hardcoded secrets
/vulnerability-check auth-hardcoded             # Check for hardcoded credentials
```

**Supported vulnerability types:**
- Injection vulnerabilities (SQL, command, LDAP, XPath)
- Cross-site scripting (reflected, stored, DOM-based)
- Authentication & authorization issues
- Hardcoded secrets and sensitive data
- Weak cryptography
- Configuration security issues

### `/dependency-audit`

Audit dependencies for known vulnerabilities and outdated packages.

```bash
/dependency-audit                                # Audit all dependencies
/dependency-audit --severity critical,high      # Filter by severity
/dependency-audit --fix                         # Auto-update vulnerable packages
/dependency-audit --production                  # Check only production deps
/dependency-audit --output json > audit.json    # Export report
```

**Supported package managers:**
- npm/yarn/pnpm (JavaScript/TypeScript)
- pip/pipenv/poetry (Python)
- bundler (Ruby)
- composer (PHP)
- Maven/Gradle (Java)
- Go modules
- Cargo (Rust)
- NuGet (.NET)

## Agents

The plugin includes specialized security agents that Claude can automatically invoke:

### Vulnerability Detector Agent

Automatically detects security vulnerabilities by analyzing code patterns, API usage, and known vulnerability signatures.

**When it activates:**
- Files with sensitive operations are modified
- User asks about security vulnerabilities
- Security scans are initiated

### Security Auditor Agent

Performs comprehensive security audits focusing on configuration security, infrastructure security, and compliance.

**When it activates:**
- Configuration files are modified
- Infrastructure-as-code is changed
- Security audits are requested
- Pre-deployment validation is needed

### Security Code Reviewer Agent

Performs security-focused code reviews for pull requests and code changes.

**When it activates:**
- Files are changed in a PR or commit
- User requests security review
- Critical files are modified (auth, crypto, sessions)

## Skills

Autonomous security skills that automatically activate based on context:

### Security Analyzer Skill

Analyzes code for OWASP Top 10 vulnerabilities and security anti-patterns.

**Triggers:**
- User mentions security or vulnerabilities
- High-risk functions are used (eval, exec, SQL queries)
- Authentication or session code is changed

### Dependency Scanner Skill

Scans project dependencies for known security vulnerabilities.

**Triggers:**
- Package manager files are modified
- User mentions dependencies or packages
- CI/CD validation is needed

### Configuration Validator Skill

Validates configuration files for security misconfigurations and exposed secrets.

**Triggers:**
- Configuration files are modified
- Environment variables are set
- Infrastructure-as-code is changed

## Automated Hooks

The plugin automatically runs security checks:

- **On file writes**: Scans modified files for vulnerabilities
- **On session start**: Runs quick security check
- **On session end**: Generates security summary
- **On permission requests**: Validates security implications
- **Before history compaction**: Preserves security context

## Configuration

### Custom Security Policies

Create `.security-policies.json` in your project root:

```json
{
  "policies": {
    "requireHttps": true,
    "allowedCorsOrigins": ["https://example.com"],
    "maxSessionDuration": "8h",
    "requiredHeaders": ["CSP", "HSTS", "X-Frame-Options"],
    "forbiddenPorts": [22, 23, 80, 3306]
  },
  "exemptions": {
    "config/development.json": "local development"
  }
}
```

### Dependency Rules

Create `.dependency-rules.json`:

```json
{
  "severity": "high",
  "licenseWhitelist": ["MIT", "Apache-2.0", "BSD-3-Clause"],
  "licenseBlacklist": ["GPL-3.0", "AGPL-3.0"],
  "autoUpdate": false,
  "ignoreAdvisories": ["GHSA-xxxx-xxxx"],
  "allowedPackages": {
    "lodash": ">=4.17.21"
  }
}
```

### Security Review Rules

Create `.security-review-rules.json`:

```json
{
  "severity": "high",
  "rules": {
    "requireAuthForAPI": true,
    "allowEval": false,
    "requireHttps": true,
    "maxLineChanges": 500,
    "criticalFiles": [
      "src/auth/**",
      "src/crypto/**",
      "config/**"
    ]
  },
  "exemptions": {
    "test/**": "low",
    "docs/**": "skip"
  }
}
```

## Examples

### Scan a React Project

```bash
# Full security scan
/security-scan --path ./src

# Check for XSS vulnerabilities
/vulnerability-check xss --path ./src/components

# Audit npm dependencies
/dependency-audit --production
```

### Scan a Python Backend

```bash
# Scan backend directory
/security-scan --path ./backend

# Check for SQL injection
/vulnerability-check sql-injection --path ./backend

# Audit Python dependencies
/dependency-audit
```

### Scan Configuration Files

```bash
# Check all config files
/security-scan --path ./config

# Validate environment variables
/vulnerability-check secrets
```

### CI/CD Integration

```yaml
# Example GitHub Actions
- name: Security Scan
  run: claude security-scan --output json > security-report.json

- name: Check for vulnerabilities
  run: |
    if grep -q '"severity": "critical"' security-report.json; then
      echo "Critical vulnerabilities found!"
      exit 1
    fi
```

## Output Format

### Security Scan Report

```
═════════════════════════════════════════════
    SECURITY SCAN REPORT
═════════════════════════════════════════════

Total findings: 15
  Critical: 2
  High: 5
  Medium: 6
  Low: 2

🔴 CRITICAL: SQL Injection
   File: src/auth.js:45
   Code: const query = `SELECT * FROM users WHERE id = ${userId}`;
   Impact: Attackers can bypass authentication, extract data
   Fix: Use parameterized queries

🔴 CRITICAL: Hardcoded API Key
   File: config/api.js:12
   Code: const API_KEY = "sk-1234567890abcdefghijklmnop..."
   Impact: Credential theft, unauthorized access
   Fix: Move to environment variable

🟠 HIGH: XSS Vulnerability
   File: src/components/UserInput.tsx:23
   Code: div.innerHTML = userInput
   Impact: Cross-site scripting attacks
   Fix: Use textContent or sanitize input

═════════════════════════════════════════════
```

## Supported Languages

- JavaScript / TypeScript
- Python
- Java
- Go
- PHP
- Ruby
- C#
- And more

## Troubleshooting

### Plugin not loading

1. Verify installation: `claude plugin list`
2. Check for errors: `claude --debug`
3. Validate manifest: `claude plugin validate`

### Scripts not executing

1. Make scripts executable: `chmod +x scripts/*.sh`
2. Check shebang lines
3. Verify `${CLAUDE_PLUGIN_ROOT}` path usage

### Hooks not triggering

1. Verify hook event names (case-sensitive)
2. Check matcher patterns
3. Review hook configuration syntax

## Security

### Security Considerations

This plugin is designed to help identify security vulnerabilities but should be used with awareness of these considerations:

- **False Positives**: The scanner uses pattern matching and may produce false positives. Always verify findings manually.
- **Secrets Detection**: Pattern-based secret detection may miss well-hidden credentials. Do not rely solely on this tool.
- **Coverage Limitations**: Static analysis cannot catch all vulnerabilities. Manual code review remains essential.
- **Dependency Scanning**: Uses npm audit, pip-audit, and similar tools. Ensure these tools are kept up to date.

### Best Practices

1. **Run Regularly**: Execute security scans regularly, not just before deployments
2. **CI/CD Integration**: Add security scanning to your pipeline
3. **Fix High Severity**: Prioritize critical and high severity findings
4. **Defense in Depth**: Combine with other security tools (SAST, DAST, SCA)
5. **Keep Updated**: Update the plugin regularly for new vulnerability patterns

### Reporting Security Issues

If you discover a security vulnerability in this plugin, please:
1. Do not disclose it publicly
2. Contact the maintainers privately
3. Provide details of the vulnerability and potential fix

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new vulnerability patterns
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CVE Database](https://cve.mitre.org/)
- [CWE Dictionary](https://cwe.mitre.org/)
- [Claude Code Documentation](https://code.claude.com/docs)

## Support

- GitHub Issues: [security-scanner-plugin/issues](https://github.com/example/security-scanner-plugin/issues)
- Documentation: [Full Documentation](https://github.com/example/security-scanner-plugin/wiki)

---

Made with ❤️ for secure code
