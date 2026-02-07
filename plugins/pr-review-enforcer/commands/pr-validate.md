---
name: pr-validate
description: Validate PR description against required standards
---

# PR Validate

Validates the current PR description against comprehensive quality standards.

## Usage

```
/pr-validate [--strict]
```

## Options

- `--strict`: Enable strict validation mode (all checks must pass)

## Description

This command performs comprehensive validation of PR descriptions including:
- Required sections (Summary, Changes, Testing, Breaking Changes)
- Description length and quality
- Issue/PR references
- Checklist completion

## Validation Checks

### Required Sections
- **Summary**: Clear description of what the PR does
- **Changes**: List of files and components modified
- **Testing**: Description of tests added/updated
- **Breaking Changes**: Explicit "None" or detailed explanation

### Quality Checks
- Minimum description length (200 characters)
- No placeholder text (TODO, FIXME, etc.)
- Proper formatting and structure
- Linked issues or PRs referenced

## Examples

```
/pr-validate
```

```
/pr-validate --strict
```

## Output

The command outputs a validation report:

```
╔════════════════════════════════════════════════════════════════════════╗
║                        PR VALIDATION REPORT                             ║
╠════════════════════════════════════════════════════════════════════════╣
║  Check                    │ Status │ Details                            ║
╠════════════════════════════╪════════╪══════════════════════════════════╣
║  Summary section           │ PASS   │ Present and clear                 ║
║  Changes section           │ PASS   │ 5 files listed                    ║
║  Testing section           │ FAIL   │ Missing test description          ║
║  Breaking changes section  │ PASS   │ Explicitly marked as "None"       ║
║  Description length        │ PASS   │ 450 characters (min: 200)         ║
║  Issue references          │ WARN   │ No linked issues found            ║
╚══════════════════════════════════════════════════════════════════════════╝

Status: FAILED
Action: Add testing section to PR description before merging.
```

## Related Commands

- `/pr-check-tests` - Verify test coverage for changes
- `/pr-check-docs` - Verify documentation completeness
- `/pr-report` - Generate comprehensive readiness report
