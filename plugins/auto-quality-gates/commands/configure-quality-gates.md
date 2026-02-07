---
description: Define and enforce quality gates for code changes
arguments:
  - name: coverage-threshold
    description: Minimum code coverage percentage (0-100)
    required: false
  - name: lint-rules
    description: Linting strictness (strict, moderate, relaxed)
    required: false
  - name: security-checks
    description: Enable security vulnerability scanning
    required: false
---

# Configure Quality Gates

Define automated quality standards that must pass before code can be merged.

## What it does

Quality gates are automated checks that prevent low-quality code from progressing through your pipeline. This command helps you configure:

### Code Coverage Gates

Enforce minimum test coverage thresholds:

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Linting Standards

Configure code quality rules:

```json
{
  "rules": {
    "no-console": "error",
    "no-unused-vars": "error",
    "complexity": ["warn", 10]
  }
}
```

### Security Scanning

Automated vulnerability detection:

- Dependency vulnerability scanning
- Static application security testing (SAST)
- Secret detection
- License compliance checks

## Usage

```bash
/configure-quality-gates --coverage-threshold=80 --lint-rules=strict --security-checks
```

## Quality Gate Levels

| Level | Coverage | Linting | Security |
|-------|----------|---------|----------|
| **Strict** | 90% | Error on all violations | Full scan |
| **Standard** | 80% | Error on critical, warn on others | Standard scan |
| **Relaxed** | 60% | Warnings only | Basic scan |

## CI/CD Integration

Creates configuration files for:

- GitHub Actions (`.github/workflows/quality-gate.yml`)
- GitLab CI (`.gitlab-ci.yml`)
- Jenkins (`Jenkinsfile`)
- Azure DevOps (`azure-pipelines.yml`)

## Examples

Configure strict quality gates:

> /configure-quality-gates --coverage-threshold=90 --lint-rules=strict --security-checks

Configure standard gates for a new project:

> /configure-quality-gates --coverage-threshold=70 --lint-rules=moderate
