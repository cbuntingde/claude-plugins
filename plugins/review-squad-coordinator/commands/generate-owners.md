---
name: generate-owners
description: Generate CODEOWNERS suggestions based on git blame history
---

# /generate-owners

Generate suggested CODEOWNERS entries based on git blame history for modified files.

## What it does

- Analyzes git blame to identify primary contributors
- Groups files by directory for cleaner CODEOWNERS
- Outputs ready-to-use CODEOWNERS entries
- Excludes generated files and dependencies

## Usage

```bash
/generate-owners
```

```bash
/generate-owners --files "src/api/**" "tests/**"
```

```bash
/generate-owners --output CODEOWNERS.suggested
```

## Options

- `--files <patterns...>`: Specific files to analyze
- `--output <path>`: Output file path (default: stdout)
- `--exclude <patterns...>`: Patterns to exclude (node_modules, *.generated.*)
- `--min-commits <number>`: Minimum commits to be considered owner (default: 3)

## Examples

```bash
/generate-owners --output .github/CODEOWNERS
/generate-owners --files "src/**/*.ts" --exclude "**/*.test.ts"
```

## Output

Produces CODEOWNERS format entries:

```text
# Suggested CODEOWNERS entries
# Add these to your CODEOWNERS file

/src/api/ @developer1 @developer2
/src/utils/ @developer1
/tests/ @qa-team
```

## Requirements

- Git repository with commit history
- Git blame support