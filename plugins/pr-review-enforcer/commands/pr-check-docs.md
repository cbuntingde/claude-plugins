---
name: pr-check-docs
description: Verify documentation completeness for changes
---

# PR Check Docs

Verifies that all code changes have corresponding documentation updates.

## Usage

```
/pr-check-docs [--strict] [--type=all]
```

## Options

- `--strict`: Require docs for all changes (no exceptions)
- `--type`: Documentation type to check (all, api, readme, inline)

## Description

This command verifies documentation completeness including:
- README updates for new features
- API documentation for public APIs
- Inline code comments for complex logic
- JSDoc/TypeScript doc coverage
- Changelog updates

## Validation Checks

### README Documentation
- New features documented in README
- Configuration changes noted
- Breaking changes highlighted
- Installation instructions updated

### API Documentation
- Public functions have JSDoc/TypeScript docs
- Parameters documented with types
- Return values described
- Examples provided for complex APIs

### Inline Documentation
- Complex logic explained
- Non-obvious implementations commented
- Algorithm choices documented
- Security considerations noted

### Changelog
- Changes added to CHANGELOG.md
- Proper format followed
- Version number updated
- Breaking changes highlighted

## Examples

```
/pr-check-docs
```

```
/pr-check-docs --strict
```

```
/pr-check-docs --type=api
```

## Output

The command outputs a documentation coverage report:

```
╔════════════════════════════════════════════════════════════════════════╗
║                     DOCUMENTATION COVERAGE REPORT                      ║
╠════════════════════════════════════════════════════════════════════════╣
║  Check                    │ Status │ Details                            ║
╠════════════════════════════╪════════╪══════════════════════════════════╣
║  README updated            │ PASS   │ New feature documented            ║
║  API documentation         │ FAIL   │ 3 functions missing JSDoc         ║
║  Inline comments           │ WARN   │ Complex logic needs explanation   ║
║  CHANGELOG updated         │ PASS   │ Entry added for v1.2.0            ║
║  Parameter docs            │ FAIL   │ 2 functions missing @param        ║
║  Return value docs         │ PASS   │ All returns documented            ║
╚══════════════════════════════════════════════════════════════════════════╝

Status: FAILED

Missing Documentation:
- src/auth.js:authenticate() - Missing JSDoc
- src/user.js:updateProfile() - Missing @param tags
- src/api.js:fetchData() - Missing JSDoc

Recommendations:
- Add JSDoc comments to all public API functions
- Document parameters with @param tags
- Add inline comments for complex authentication logic
```

## Related Commands

- `/pr-validate` - Validate PR description
- `/pr-check-tests` - Verify test coverage
- `/pr-report` - Generate comprehensive readiness report
