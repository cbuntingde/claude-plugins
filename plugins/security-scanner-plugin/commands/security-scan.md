---
description: Perform comprehensive security scan for vulnerabilities and security issues
---

# /security-scan

Perform a comprehensive security scan of your codebase to detect common vulnerabilities, security misconfigurations, and potential security risks.

## What it scans

- **OWASP Top 10 vulnerabilities**: SQL injection, XSS, CSRF, authentication flaws, etc.
- **Code-level security issues**: Insecure functions, hardcoded secrets, weak cryptography
- **Dependency vulnerabilities**: Known CVEs in package dependencies
- **Configuration security**: Insecure settings, exposed credentials, overly permissive permissions
- **API security**: Unprotected endpoints, missing rate limiting, improper authentication

## Usage

```bash
/security-scan
```

Scan the entire codebase.

```bash
/security-scan --path ./src
```

Scan a specific directory or file.

```bash
/security-scan --severity high,critical
```

Only show high and critical severity issues.

```bash
/security-scan --owasp
```

Focus on OWASP Top 10 vulnerabilities only.

## Options

- `--path <path>`: Specify directory or file to scan (default: current directory)
- `--severity <levels>`: Filter by severity levels (critical,high,medium,low)
- `--owasp`: Only check OWASP Top 10 vulnerabilities
- `--dependencies`: Only check dependency vulnerabilities
- `--config`: Only check configuration security
- `--fix`: Automatically attempt to fix detected issues
- `--output <format>`: Output format (text, json, markdown)

## Examples

Scan your entire project:
```bash
/security-scan
```

Scan only backend code with high severity focus:
```bash
/security-scan --path ./backend --severity critical,high
```

Get JSON output for CI/CD integration:
```bash
/security-scan --output json > security-report.json
```

## Output

The scan produces a detailed report including:

- **Summary statistics**: Total issues found, breakdown by severity
- **Detailed findings**: Each vulnerability with:
  - File path and line number
  - Severity level (CVSS score when available)
  - Vulnerability description
  - Affected code snippet
  - Recommended fix
  - References to security advisories

## Integration with hooks

This command integrates with automated security hooks that run on:
- File writes (PostToolUse)
- Before commits (pre-commit style)
- Session start (periodic scans)

See `hooks/hooks.json` for configuration.
