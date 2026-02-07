---
name: pr-check-tests
description: Verify test coverage for all modified files
---

# PR Check Tests

Analyzes code changes and verifies that adequate test coverage exists.

## Usage

```
/pr-check-tests [--coverage=80] [--files]
```

## Options

- `--coverage`: Minimum coverage threshold (default: 80)
- `--files`: Comma-separated list of files to check (default: all modified files)

## Description

This command performs comprehensive test verification including:
- Test file existence for modified source files
- Coverage threshold validation
- Test quality assessment
- Uncovered code identification

## Validation Checks

### Test File Existence
- Checks for corresponding test files (e.g., `user.js` → `user.test.js`)
- Validates test file is not empty
- Ensures test imports are correct

### Coverage Analysis
- Line coverage percentage
- Branch coverage percentage
- Function coverage percentage
- Statement coverage percentage

### Test Quality
- meaningful test descriptions
- Assertion presence
- Edge case coverage
- Mock usage where appropriate

## Examples

```
/pr-check-tests
```

```
/pr-check-tests --coverage=90
```

```
/pr-check-tests --files=src/auth.js,src/user.js
```

## Output

The command outputs a test coverage report:

```
╔════════════════════════════════════════════════════════════════════════╗
║                        TEST COVERAGE REPORT                             ║
╠════════════════════════════════════════════════════════════════════════╣
║  File                    │ Status │ Coverage │ Tests │ Missing          ║
╠══════════════════════════╪════════╪══════════╪═══════╪══════════════════╣
║  src/auth.js             │ PASS   │ 95%      │ 12    │ -                ║
║  src/user.js             │ FAIL   │ 45%      │ 3     │ login(), logout()║
║  src/api.js              │ WARN   │ 78%      │ 8     │ handleError()    ║
╚══════════════════════════════════════════════════════════════════════════╝

Overall Coverage: 72.6% (Threshold: 80%)
Status: FAILED

Recommendations:
- Add tests for src/user.js:login(), logout()
- Improve coverage for src/api.js:handleError()
```

## Related Commands

- `/pr-validate` - Validate PR description
- `/pr-check-docs` - Verify documentation completeness
- `/pr-report` - Generate comprehensive readiness report
