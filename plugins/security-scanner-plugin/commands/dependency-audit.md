---
description: Audit dependencies for known vulnerabilities and outdated packages
---

# /dependency-audit

Scan project dependencies for known vulnerabilities (CVEs), outdated packages, and recommended security updates. Supports multiple package managers and lock files.

## What it checks

- **Known vulnerabilities**: CVEs and security advisories
- **Outdated packages**: Packages with available updates
- **License compliance**: problematic license types
- **Dependency tree**: Transitive dependencies
- **Supply chain**: Malicious or compromised packages

## Supported package managers

- npm/yarn/pnpm (package-lock.json, yarn.lock, pnpm-lock.yaml)
- Python (requirements.txt, Pipfile.lock, poetry.lock)
- Ruby (Gemfile.lock)
- PHP (composer.lock)
- Java (pom.xml, gradle.lock)
- Go (go.sum, go.mod)
- Rust (Cargo.lock)
- .NET (packages.lock)

## Usage

```bash
/dependency-audit
```

Audit all dependencies in the project.

```bash
/dependency-audit --severity high,critical
```

Only show high and critical severity issues.

```bash
/dependency-audit --fix
```

 Automatically update vulnerable packages to safe versions.

```bash
/dependency-audit --production
```

Only audit production dependencies.

## Options

- `--severity <levels>`: Filter by severity (critical,high,medium,low)
- `--fix`: Automatically update vulnerable packages
- `--production`: Only check production dependencies
- `--dev`: Only check development dependencies
- `--licenses`: Check for problematic licenses
- `--output <format>`: Output format (text, json, markdown)
- `--registry <url>`: Custom registry for vulnerability database

## Examples

Basic audit:
```bash
/dependency-audit
```

Audit and auto-fix:
```bash
/dependency-audit --fix --severity critical,high
```

Check for license issues:
```bash/dependency-audit --licenses
```

Get JSON report for CI/CD:
```bash
/dependency-audit --output json > audit-report.json
```

Audit only production deps:
```bash
/dependency-audit --production
```

## Output format

For each vulnerable package, the report includes:

```
📦 lodash < 4.17.21
   Severity: HIGH (CVSS: 7.5)
   CVE: CVE-2021-23337
   Current: 4.17.20
   Fixed in: 4.17.21
   Description: Prototype pollution vulnerability
   Advisory: https://github.com/advisories/GHSA-p6mc-m468-83fw
```

## Automatic fixes

When using `--fix`, the plugin will:

1. Identify safe versions that fix vulnerabilities
2. Update package.json / requirements.txt
3. Run package manager install command
4. Verify fix resolves the vulnerability
5. Report any conflicts or breaking changes

## Integration with CI/CD

Recommended CI/CD configuration:

```yaml
# Example GitHub Actions
- name: Security Audit
  run: claude dependency-audit --severity critical,high --output json

- name: Check for vulnerabilities
  run: |
    if [ $? -ne 0 ]; then
      echo "Security vulnerabilities found!"
      exit 1
    fi
```

## Database sources

The plugin queries multiple vulnerability databases:

- npm Security Advisory Database
- GitHub Advisory Database
- PyPI Security Reports
- RubySec
- Snyk DB
- OSS Index

Database is cached locally for 24 hours by default.
