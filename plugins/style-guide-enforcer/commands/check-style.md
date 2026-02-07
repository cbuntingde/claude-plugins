---
description: Check code files against team style guide conventions
---

# /check-style

Check files against your team's style guide conventions.

## Usage

```bash
/check-style [files...]
```

## Examples

- Check all files: `/check-style`
- Check specific files: `/check-style src/components/Button.tsx src/utils/helpers.ts`
- Check by pattern: `/check-style src/**/*.ts`

## What it checks

- Naming conventions (variables, functions, classes, files)
- Code formatting and indentation
- Import organization and ordering
- Comment style and documentation standards
- File structure and organization
- Language-specific patterns

## Configuration

Style rules are defined in `.style-guide.json` in your project root. Use `/init-style-guide` to create a default configuration.
