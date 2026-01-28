---
name: analyze-quality
description: Evaluate code quality metrics including complexity, maintainability, and technical debt
---

# Code Quality Analysis

The `analyze-quality` command analyzes your codebase for metrics that impact maintainability and production reliability.

## Usage

```bash
/analyze-quality
```

To analyze specific directories:

```bash
/analyze-quality --scope=src/components
```

To generate JSON output:

```bash
/analyze-quality --output=json
```

## Description

This command performs comprehensive code quality assessment including:
- Code complexity analysis
- Nesting depth detection
- Code length violations
- Comment ratio evaluation
- Function count validation
- Cyclomatic complexity checks

## Detected Issues

### High Complexity
- Exceptionally deep nesting (10+ depth, >1000 chars)
- Lines exceeding 120 characters
- Functions exceeding 300 lines

### Maintainability
- Large files with excessive functions
- High comment ratios (>40%)
- Duplicate code patterns

### Readability
- Mixed indentation (tabs vs spaces)
- Inconsistent naming conventions
- Magic numbers and strings

## Metrics Collected

1. **Lines of Code (LOC)**
   - Total project lines
   - Source vs test code ratio
   - Distribution by file

2. **Function/Class Counts**
   - Functions per file
   - Classes per file
   - Decorators per file

3. **Complexity Metrics**
   - Average nesting depth
   - Maximum nesting depth
   - Cyclomatic complexity (estimated)

4. **Documentation**
   - Comment ratio
   - Docstring coverage
   - README completeness

## Output Format

```
📊 Code Quality Analysis
╔═══════════════════════════════════════════════╗
║ Metric                    │ Value            ║
╠══════════════════════════╪══════════════════╣
║ Files Analyzed           │ 147              ║
║ Functions                │ 2,847            ║
║ Classes                  │ 87               ║
║ Total Lines              │ 112,459          ║
║ Avg Nesting Depth        │ 3.2              ║
║ Max Nesting Depth        │ 5                ║
║ Files > 200 lines        │ 23 (16%)         ║
║ Files > 1000 lines       │ 3 (2%)           ║
║ Total Complexity         │ 45,123           ║
╚══════════════════════════╝

⚠️ Issues Found: 8

Large File Detection:
[WARNING] code-quality
  Exceptionally deep nesting (depth: 11) detected
  /path/to/complex-module.ts
  Hint: Consider refactoring to reduce nesting depth at line 432

Code Length:
[WARNING] code-quality
  Line exceeds recommended width (145 chars)
  /path/to/config.js
  Hint: Consider breaking into multiple lines around column 120

Large File:
[INFO] code-quality
  Large file with 84 functions
  /path/to/bookmarking.module.ts
  Hint: Consider splitting into smaller, focused modules

Comment Ratio:
[INFO] code-quality
  High comment ratio (47.3%)
  /path/to/docs.js
  Hint: Consider refactoring: large blocks of commented code may indicate technical debt
```

## Severity Levels

- **Error**: Failing requirement, blocks deployment
- **Warning**: Performance impact, refactor recommended
- **Info**: Observations for optimization

## Code Quality Standards

| Issue Type | Error | Warning | Info |
|------------|-------|---------|------|
| Nesting depth | > 10 | > 8 | > 5 |
| Line length | > 150 | > 120 | > 100 |
| Function length | > 300 | > 200 | > 100 |
| File size | > 1000 | > 500 | > 200 |
| Comment ratio | > 60% | > 50% | > 40% |

## Recommendations

Based on analysis results:

### Improve Readability
- Break long functions into smaller ones
- Reduce nesting depth using guard clauses
- Use meaningful variable names
- Extract magic numbers to constants

### Enhance Maintainability
- Split large files into focused modules
- Increase the number of test files
- Add JSDoc comments for public APIs
- Remove duplicate code

### Reduce Complexity
- Extract complex logic to helper functions
- Use composition over inheritance
- Organize code by feature, not layering
- Apply design patterns appropriately

## Codebase Health Score

Each metric contributes to a health score calculated as:

```
Score = (1 - (Issues / Threshold)) × 100
```

Multiply individual scores by weight:
- Complexity: 25%
- Readability: 30%
- Maintainability: 25%
- Documentation: 20%

## Integration with CI/CD

The analysis can be used in pre-commit hooks or CI pipelines:

```json
{
  "scripts": {
    "quality-check": "node qa-assistant index.js --output=ci"
  }
}
```

Pass `-o ci` flag for machine-readable output for CI integration.

## Related Commands

- `/detect-breakage` - Find potential breaking changes
- `/check-production-ready` - Verify production standards
- `/scan-for-security-issues` - Security vulnerabilities
- `/dependency-health` - Third-party risk analysis