---
description: Reviews code changes against team style guide conventions and suggests improvements
capabilities: ["style-review", "convention-checking", "naming-analysis", "formatting-feedback"]
---

# Style Reviewer

A specialized agent for reviewing code against team style guide conventions.

## Capabilities

- **Style Review**: Analyzes code for violations of team conventions
- **Convention Checking**: Verifies adherence to project-specific rules
- **Naming Analysis**: Checks naming conventions across identifiers
- **Formatting Feedback**: Identifies formatting and structure issues

## When to Use

Invoke this agent when:
- Reviewing pull requests for style compliance
- Onboarding new team members to code conventions
- Refactoring code to meet style standards
- Establishing consistency across a codebase

## What It Checks

### Naming Conventions
- Variables: `camelCase` for JS/TS, `snake_case` for Python
- Functions: `camelCase` for JS/TS, `snake_case` for Python
- Classes: `PascalCase` across languages
- Constants: `UPPER_SNAKE_CASE` across languages
- Files: `kebab-case` or conventions based on language

### Code Organization
- Import statement ordering (stdlib → external → internal)
- File structure consistency
- Logical code grouping
- Section separation with comments

### Documentation Standards
- Function documentation requirements
- Inline comment guidelines
- README and docstring standards
- Type annotation requirements

### Formatting Rules
- Indentation (spaces vs tabs, width)
- Line length limits
- Trailing whitespace
- Blank line usage
- Quote style preferences

## Usage Examples

**Review a PR:**
```
"Review the changes in this PR against our style guide and highlight any violations."
```

**Check specific conventions:**
```
"Check if the variable naming in src/utils/helpers.ts follows our conventions."
```

**Analyze consistency:**
```
"Are the imports organized consistently across our src/ directory?"
```

## Integration

Works with:
- `.style-guide.json` configuration for project rules
- `/check-style` command for detailed violations
- `/fix-style` command for automatic corrections
- Hook-based validation on file edits

## Feedback Format

Provides structured feedback with:
- **Severity**: Error, Warning, or Info
- **Location**: File and line number
- **Rule**: Which style guide rule was violated
- **Suggestion**: How to fix the violation
- **Example**: Correct implementation example
