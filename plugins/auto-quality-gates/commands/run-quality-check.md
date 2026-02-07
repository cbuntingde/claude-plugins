---
description: Execute all quality gate checks and generate report
arguments:
  - name: fix
    description: Automatically fix fixable issues
    required: false
  - name: report-format
    description: Output format (json, html, markdown)
    required: false
---

# Run Quality Check

Execute all configured quality gates and generate a comprehensive report.

## What it checks

Runs the following checks in parallel:

### 1. Unit Tests
```bash
npm test                 # JavaScript
pytest                  # Python
go test ./...           # Go
```

### 2. Code Coverage
- Branch coverage
- Function coverage
- Line coverage
- Statement coverage

### 3. Linting
- ESLint/Pylint/golint
- Code style violations
- Potential bugs
- Code smells

### 4. Type Checking
- TypeScript type validation
- MyPy (Python)
- Static type analysis

### 5. Security Scanning
- npm audit / pip-audit
- SAST scan
- Dependency vulnerabilities
- Secret detection

## Usage

```bash
/run-quality-check
```

Generate HTML report:

```bash
/run-quality-check --report-format=html
```

Auto-fix issues:

```bash
/run-quality-check --fix
```

## Output

### Terminal Output

```
✓ Unit Tests: 245 passed, 0 failed
✗ Code Coverage: 78% (threshold: 80%)
✓ Linting: No issues
✗ Security: 2 vulnerabilities found
✓ Type Checking: No errors

Quality Gate: FAILED
```

### Report Formats

**JSON:**
```json
{
  "status": "failed",
  "checks": {
    "tests": { "status": "passed", "coverage": "78%" },
    "linting": { "status": "passed", "issues": 0 },
    "security": { "status": "failed", "vulnerabilities": 2 }
  },
  "timestamp": "2025-01-17T10:30:00Z"
}
```

**HTML:**
Generates `quality-report.html` with:
- Overall status dashboard
- Individual check results
- Detailed failure information
- Historical trends
- Fix recommendations

## Exit Codes

- `0` - All checks passed
- `1` - One or more checks failed
- `2` - Configuration error

## Examples

Run checks with auto-fix:

> /run-quality-check --fix

Generate markdown report for CI logs:

> /run-quality-check --report-format=markdown
