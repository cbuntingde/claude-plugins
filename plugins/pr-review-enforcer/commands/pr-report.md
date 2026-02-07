---
name: pr-report
description: Generate comprehensive PR readiness report
---

# PR Report

Generates a comprehensive report covering all PR readiness aspects.

## Usage

```
/pr-report [--format=table] [--output=pr-report.txt]
```

## Options

- `--format`: Report format (table, json, markdown)
- `--output`: Output file path (default: stdout)

## Description

This command generates a comprehensive readiness report including:
- PR description validation
- Test coverage analysis
- Documentation completeness
- Code quality checks
- Security considerations
- Merge readiness recommendation

## Report Sections

### 1. PR Description
- Required sections presence
- Description quality
- References and links
- Checklist completion

### 2. Test Coverage
- Overall coverage percentage
- File-by-file breakdown
- Missing tests identification
- Test quality assessment

### 3. Documentation
- README updates
- API documentation
- Inline comments
- Changelog entries

### 4. Code Quality
- Linting results
- Type checking
- Code complexity
- Best practices adherence

### 5. Security
- Secret exposure check
- Input validation
- Dependency vulnerabilities
- Security headers

### 6. Merge Recommendation
- Overall status (PASS/FAIL/WARN)
- Blocking issues
- Recommended actions
- Approval suggestion

## Examples

```
/pr-report
```

```
/pr-report --format=markdown
```

```
/pr-report --output=pr-report.md
```

## Output

The command outputs a comprehensive report:

```
╔════════════════════════════════════════════════════════════════════════╗
║                    PR READINESS COMPREHENSIVE REPORT                   ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  PR: #123 - Add user authentication feature                             ║
║  Branch: feature/user-auth                                              ║
║  Author: @developer                                                     ║
║  Generated: 2025-01-20T10:30:00Z                                        ║
║                                                                          ║
╠════════════════════════════════════════════════════════════════════════╣
║  CATEGORY                 │ STATUS │ SCORE │ ISSUES                     ║
╠════════════════════════════╪════════╪═══════╪══════════════════════════╣
║  PR Description           │ PASS   │ 95%   │ -                          ║
║  Test Coverage            │ WARN   │ 78%   │ 2 files below threshold    ║
║  Documentation            │ FAIL   │ 60%   │ Missing API docs           ║
║  Code Quality             │ PASS   │ 92%   │ -                          ║
║  Security                 │ PASS   │ 100%  │ -                          ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  OVERALL STATUS: READY WITH RECOMMENDATIONS                             ║
║  OVERALL SCORE: 85%                                                     ║
║                                                                          ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  BLOCKING ISSUES:                                                        ║
║  • Add JSDoc documentation to src/auth.js:authenticate()               ║
║  • Add JSDoc documentation to src/user.js:updateProfile()              ║
║                                                                          ║
║  RECOMMENDED ACTIONS:                                                    ║
║  • Increase test coverage for src/user.js (currently 45%)               ║
║  • Add inline comments for authentication flow                          ║
║  • Consider adding integration tests for login/logout                   ║
║                                                                          ║
║  MERGE RECOMMENDATION:                                                  ║
║  Address blocking issues before merging. The PR is otherwise ready.     ║
║                                                                          ║
╚════════════════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/pr-validate` - Validate PR description only
- `/pr-check-tests` - Check test coverage only
- `/pr-check-docs` - Check documentation only
