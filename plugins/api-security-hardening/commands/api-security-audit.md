---
description: Perform comprehensive API security audit for CORS, CSRF, XSS, JWT, and API key vulnerabilities
---

# /api-security-audit

Perform a comprehensive security audit of your API endpoints and configurations to detect vulnerabilities related to CORS, CSRF, XSS, JWT implementation, and API key management.

## What it audits

- **CORS Configuration**: Misconfigured origins, missing headers, overly permissive policies
- **CSRF Protection**: Missing tokens, vulnerable state-changing operations, cookie security
- **XSS Vulnerabilities**: Unescaped output, missing Content-Type headers, injection points
- **JWT Implementation**: Weak algorithms, missing validation, token leakage, improper claims
- **API Key Security**: Hardcoded keys, missing rotation, improper storage, weak authentication

## Usage

```bash
/api-security-audit
```

Audit the entire codebase.

```bash
/api-security-audit --path ./src/api
```

Audit a specific directory.

```bash
/api-security-audit --severity critical,high
```

Only show critical and high severity issues.

```bash
/api-security-audit --focus jwt
```

Focus only on JWT security issues.

## Options

- `--path <path>`: Specify directory or file to audit (default: current directory)
- `--severity <levels>`: Filter by severity levels (critical,high,medium,low)
- `--focus <area>`: Focus on specific area (cors,csrf,xss,jwt,apikey)
- `--output <format>`: Output format (text, json, markdown)
- `--fix`: Generate fix recommendations for detected issues

## Examples

Full API security audit:
```bash
/api-security-audit
```

Audit JWT implementation only:
```bash
/api-security-audit --focus jwt
```

Get JSON output for CI/CD:
```bash
/api-security-audit --output json > api-security-report.json
```

## Output

The audit produces a detailed report including:

- **Summary statistics**: Total issues found, breakdown by severity and category
- **Detailed findings**: Each vulnerability with:
  - File path and line number
  - Severity level
  - Vulnerability description
  - Affected code snippet
  - Recommended fix
  - Security references (OWASP, CWE)
