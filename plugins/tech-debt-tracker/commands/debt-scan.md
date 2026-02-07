---
description: Scan the codebase for technical debt issues
usage: /debt-scan [path] [--severity=all|high|medium|low] [--categories=all|complexity|duplication|naming|security]
examples:
  - /debt-scan
  - /debt-scan src/components --severity=high
  - /debt-scan --categories=complexity,duplication
---

# Debt Scan

Scans the codebase for technical debt issues and generates a comprehensive report of areas needing refactoring.

## Features

- Multi-dimensional code analysis:
  - **Cyclomatic complexity**: Identifies overly complex functions/methods
  - **Code duplication**: Detects repeated patterns that could be abstracted
  - **Naming violations**: Finds unclear or inconsistent naming
  - **Security concerns**: Identifies potential security vulnerabilities
  - **Code smells**: Detects anti-patterns and maintenance issues
  - **Test coverage**: Gaps in test coverage

## Parameters

- `path` (optional): Specific file or directory to scan (default: entire project)
- `--severity`: Filter by severity level (default: all)
  - `high`: Critical issues requiring immediate attention
  - `medium`: Important issues that should be addressed soon
  - `low`: Minor improvements
- `--categories`: Filter by issue categories (default: all)

## Output

The scan produces:
- Summary of total issues found by severity
- Detailed issue list with file locations and line numbers
- Impact scores (1-10) based on complexity, frequency, and risk
- Suggestions for each issue category
- Links to relevant documentation

## Example Output

```
📊 Technical Debt Scan Results

🔴 High Priority Issues: 12
🟡 Medium Priority Issues: 34
🟢 Low Priority Issues: 28

Top Issues by Impact Score:
1. [9.2] UserController.authenticate() - Cyclomatic complexity: 45
   Location: src/controllers/UserController.js:145-189
   Impact: Extremely difficult to test and maintain
   Suggestion: Extract authentication logic into separate service

2. [8.7] Duplicate validation logic in 5 files
   Locations: src/utils/validators/*.js
   Impact: Changes require updates in multiple places
   Suggestion: Create shared validation module

[Full report saved to .claude/debt-report-2024-01-15.json]
```
