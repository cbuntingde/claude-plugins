---
name: detect-breakage
description: Scan for code changes that could break production systems or cause incompatible changes
---

# Detect Breaking Changes

The `detect-breakage` command scans your codebase for patterns and issues that could cause breaking changes in production deployments.

## Usage

```bash
/detect-breakage
```

To run checks in specific directories:

```bash
/detect-breakage --path=/path/to/project
```

## Description

This command performs comprehensive breaking change analysis including:
- Detects mixing of ES modules and CommonJS patterns
- Identifies deprecated Promise chain syntax
- Checks for var declarations (prevents block scoping)
- Analyzes export/import patterns for compatibility issues
- Validates package.json main entry point format

## Checks Performed

### Module System Compatibility
- Detects mixed ES modules (`export`) and CommonJS (`module.exports`)
- Checks for compatibility issues between Node.js versions
- Identifies deprecated file extensions in package.json

### Code Structure
- Locates deprecated `.then()` and `.catch()` Promise chains
- Finds `var` declarations which prevent proper block scoping
- Analyzes deep nesting that impacts maintainability

### API Contracts
- Checks package.json `main` field for consistency
- Validates version format compliance
- Scans for breaking changes in public APIs

## Output Format

The command generates a detailed report with:

```
🔍 Searching for breaking changes...
🔍 Breaking Changes Check
╔═══════════════════════════════════╗
║ Check            │ Status          ║
╠══════════════════╪═════════════════╣
║ Module Mix       │ FAILED (3)      ║
║ Deprecated APIs  │ PASSED          ║
║ Deep Nesting     │ PASSED (1 warning)║
╚══════════════════╝

Sample Issues:
[WARNING] breaking-change
  Potential breaking change: mixing ES modules with CommonJS
  /path/to/file.js
  Hint: Use consistent module system throughout the project
```

## Files Analyzed

The check analyzes:
- All JavaScript (.js) and TypeScript (.ts) source files
- package.json for configuration issues
- Selected API files for export/import patterns

## When to Use This Command

- Before releasing a major version
- Reviewing Pull Requests that modify public APIs
- Onboarding onto an existing codebase
- Regular maintenance checks for technical debt

## Related Commands

- `/check-production-readiness` - Verify all production requirements
- `/analyze-code-quality` - Evaluate code maintainability
- `/scan-for-security-issues` - Find security vulnerabilities