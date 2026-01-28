---
name: check-production-ready
description: Verify that the project meets production deployment requirements
---

# Production Readiness Check

The `check-production-ready` command validates that your project meets all requirements for safe deployment to production.

## Usage

```bash
/check-production-ready
```

To check specific areas only:

```bash
/check-production-ready --checks=tests,security
```

Or to regenerate test coverage report:

```bash
/check-production-ready --regenerate
```

## Description

This command performs a comprehensive production readiness assessment including:
- Configuration validation (ESLint, TypeScript configs)
- Test coverage verification
- Security audit execution
- Environment variable handling
- Error handling patterns
- Logging configuration

## Checks Performed

### Required Checks

#### TypeScript/ESLint Config
- Verifies ESLint configuration exists
- Checks TypeScript configuration if applicable
- Ensures code style standards are enforced

#### Test Coverage
- Validates test suite exists and runs
- Checks for minimum coverage requirements
- Runs actual test suite with coverage report

#### Security Audit
- Executes `npm audit --audit-level=high`
- Detects high and critical vulnerabilities
- Checks for advisory information

#### Environment Variables
- Validates `.env.example` exists
- Checks for `.gitignore` protection
- Ensures secrets are properly isolated

#### Error Handling
- Analyzes try/catch block usage
- Validates async operation error handling
- Checks for proper error logging

#### Logging Configuration
- Verifies logging library is configured
- Checks for log levels setup
- Validates request/response logging

## Requirements

The project must have one or more of:

```json
{
  "scripts": {
    "lint": "...",
    "test": "..."
  },
  "devDependencies": {
    "eslint": ">=8.0.0",
    "typescript": ">=5.0.0"
  }
}
```

## Output Format

```
🛡️  Production Readiness Check
╔═════════════════════════════════════════════════════╗
║ Check                         │ Status             ║
╠══════════════════════════════╪═══════════════════╣
║ TypeScript/ESLint config     │ PASSED             ║
║ Test coverage                │ PASSED (85%)       ║
║ Security audit               │ PASSED             ║
║ Environment variables        │ PASSED             ║
║ Error handling               │ PASSED (42/97%)    ║
║ Logging configured           │ PASSED             ║
╚══════════════════════════════╝

Overall: PASSED

Sample Issues:
[ERROR] production-readiness
  Missing Error handling
  project
  Hint: Wrap async operations in try/catch blocks
[ERROR] production-readiness
  Missing Test coverage
  project
  Hint: Write unit and integration tests
```

## What Happens When Checks Fail

- Security failures block deployment
- Configuration errors prevent CI/CD
- Coverage below threshold flags for improvement
- Missing error handlers waitlist deployment

## Regenerating Coverage Report

Run with `--regenerate` to create new coverage report:

```bash
/check-production-ready --regenerate
```

This executes the test suite with coverage enabled and generates an HTML report:

```bash
npm test -- --coverage
```

## Thresholds

| Check | Threshold |
|-------|-----------|
| Security | No high/critical vulnerabilities |
| Coverage | 70% minimum recommended |
| Error Handling | 30% minimum async operations |
| Configuration | All required configs present |

## Next Steps After Passing

1. Review warnings for potential improvements
2. Address any blocking errors
3. Deploy to staging environment
4. Run smoke tests
5. Monitor production metrics

## Related Commands

- `/detect-breakage` - Find potential breaking changes
- `/analyze-code-quality` - Evaluate code maintainability
- `/scan-for-security-issues` - Deep security analysis
- `/drift-detection` - Compare with baseline