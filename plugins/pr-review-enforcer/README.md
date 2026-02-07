# PR Review Enforcer Plugin for Claude Code

Comprehensive PR and code review enforcement plugin ensuring PR descriptions, tests, and documentation exist before merge.

## Overview

This plugin enforces code review standards by validating PR descriptions, checking test coverage, and verifying documentation completeness. It provides automated checks to ensure quality before code is merged.

## Features

- **PR Description Validation**: Validates PR descriptions against quality standards
- **Test Coverage Verification**: Checks test coverage for all modified files
- **Documentation Completeness**: Verifies API docs, README updates, and inline comments
- **Comprehensive Reporting**: Generates detailed readiness reports with scores and recommendations
- **Session Reminders**: Displays quality standards reminders at session start
- **Automated Hooks**: Runs checks after code changes

## Installation

```bash
claude plugin install pr-review-enforcer
```

## Usage

This plugin provides several commands for validating PR quality:

1. **Validate PR Description**: `/pr-validate [--strict]`
2. **Check Test Coverage**: `/pr-check-tests [--coverage=80]`
3. **Check Documentation**: `/pr-check-docs [--strict]`
4. **Generate Report**: `/pr-report [--format=table]`

## Quick Start

### 1. Create PR Description

Create a PR description at `data/pr_description.md` in the plugin directory:

```markdown
## Summary

Add user authentication feature with JWT tokens.

## Changes

- src/auth.js - New authentication module
- src/user.js - User profile management
- tests/auth.test.js - Authentication tests

## Testing

Added unit tests for login, logout, and token validation.
Integration tests cover full authentication flow.

## Breaking Changes

None
```

### 2. Validate PR Description

```bash
/pr-validate
```

### 3. Check Test Coverage

```bash
/pr-check-tests --coverage=80
```

### 4. Check Documentation

```bash
/pr-check-docs
```

### 5. Generate Full Report

```bash
/pr-report
```

## Commands

### `/pr-validate [--strict]`

Validate PR description against required standards.

**Options:**
- `--strict`: Enable strict validation mode

**Checks:**
- Required sections (Summary, Changes, Testing, Breaking Changes)
- Minimum description length (200 characters)
- No placeholder text (TODO, FIXME, etc.)
- Issue/PR references present

### `/pr-check-tests [--coverage=80] [--files=file1.js,file2.js]`

Verify test coverage for modified files.

**Options:**
- `--coverage`: Minimum coverage threshold (default: 80)
- `--files`: Comma-separated list of files to check

**Checks:**
- Test file existence for each source file
- Coverage percentage analysis
- Test quality assessment

### `/pr-check-docs [--strict] [--type=all]`

Verify documentation completeness.

**Options:**
- `--strict`: Require docs for all changes
- `--type`: Documentation type (all, api, readme, inline)

**Checks:**
- README updates for new features
- API documentation (JSDoc/TSDoc)
- Inline comments for complex logic
- CHANGELOG entries

### `/pr-report [--format=table] [--output=file.txt]`

Generate comprehensive readiness report.

**Options:**
- `--format`: Report format (table, json, markdown)
- `--output`: Output file path

**Report Sections:**
- PR description validation
- Test coverage analysis
- Documentation completeness
- Code quality checks
- Security considerations
- Merge recommendation

## Configuration

### PR Description Location

PR descriptions are stored in:
```
${CLAUDE_PLUGIN_ROOT}/data/pr_description.md
```

### Coverage Thresholds

Default test coverage threshold: 80%

Configure via command:
```bash
/pr-check-tests --coverage=90
```

### Strict Mode

Enable strict validation to fail on warnings:
```bash
/pr-validate --strict
/pr-check-docs --strict
```

## Output Examples

### PR Validation Output

```
╔════════════════════════════════════════════════════════════════════════╗
║                        PR VALIDATION REPORT                             ║
╠════════════════════════════════════════════════════════════════════════╣
║  Check                    │ Status │ Details                            ║
╠════════════════════════════╪════════╪══════════════════════════════════╣
║  Summary section           │ PASS   │ Present and clear                 ║
║  Changes section           │ PASS   │ 5 files listed                    ║
║  Testing section           │ PASS   │ Tests documented                  ║
║  Breaking changes section  │ PASS   │ Marked as "None"                  ║
║  Description length        │ PASS   │ 450 characters (min: 200)         ║
╚══════════════════════════════════════════════════════════════════════════╝

Status: PASSED
```

### Test Coverage Output

```
╔════════════════════════════════════════════════════════════════════════╗
║                        TEST COVERAGE REPORT                             ║
╠════════════════════════════════════════════════════════════════════════╣
║  File                    │ Status │ Coverage │ Tests │ Missing          ║
╠════════════════════════════╪════════╪══════════╪═══════╪══════════════════╣
║  src/auth.js             │ PASS   │ 95%      │ 12    │ -                ║
║  src/user.js             │ PASS   │ 88%      │ 8     │ -                ║
╚══════════════════════════════════════════════════════════════════════════╝

Overall Coverage: 91.5% (Threshold: 80%)
Status: PASSED
```

### Comprehensive Report Output

```
╔════════════════════════════════════════════════════════════════════════╗
║                  PR READINESS COMPREHENSIVE REPORT                   ║
╠════════════════════════════════════════════════════════════════════════╣
║  CATEGORY                 │ STATUS │ SCORE │ ISSUES                     ║
╠════════════════════════════╪════════╪═══════╪══════════════════════════╣
║  PR Description           │ PASS   │ 95%   │ -                          ║
║  Test Coverage            │ PASS   │ 91%   │ -                          ║
║  Documentation            │ PASS   │ 90%   │ -                          ║
║  Code Quality             │ PASS   │ 92%   │ -                          ║
║  Security                 │ PASS   │ 100%  │ -                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  OVERALL STATUS: READY                                                     ║
║  OVERALL SCORE: 85%                                                       ║
║  MERGE RECOMMENDATION: PR is ready for merge                             ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Hooks

### SessionStart Hook

Displays PR review standards reminder at the start of each session.

### PostToolUse Hook

Runs lightweight requirements check after Write/Edit operations.

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: PR Quality Gates

on: [pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate PR Description
        run: |
          claude plugin install pr-review-enforcer
          /pr-validate --strict
      - name: Check Test Coverage
        run: /pr-check-tests --coverage=80
      - name: Check Documentation
        run: /pr-check-docs --strict
      - name: Generate Report
        run: /pr-report --output=pr-report.txt
```

## Best Practices

1. **Run Early**: Validate PR descriptions when creating the PR
2. **Fix Incrementally**: Address failures as they're reported
3. **Use Strict Mode**: Enable strict mode for critical branches
4. **Review Reports**: Generate full reports before merge
5. **Update Documentation**: Keep docs in sync with code changes

## Troubleshooting

### "No PR description file found"

Create a PR description at the expected location:
```bash
mkdir -p "${CLAUDE_PLUGIN_ROOT}/data"
echo "## Summary\n\nDescription here" > "${CLAUDE_PLUGIN_ROOT}/data/pr_description.md"
```

### "Not in a git repository"

Commands require a git repository. Initialize git:
```bash
git init
```

### Test coverage shows 0%

Ensure test files follow naming conventions:
- JavaScript: `file.test.js` or `file.spec.js`
- Python: `test_file.py` or `file_test.py`
- Java: `ClassNameTest.java`

## Security

- No external API calls
- All validation runs locally
- No data transmitted to external services
- Respects git security settings
- Input validation on all file operations

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/cbuntingde/claude-plugins-dev/issues
- Documentation: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/pr-review-enforcer

---

**Plugin Author**: cbuntingde
**Version**: 1.0.0
**Homepage**: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/pr-review-enforcer
