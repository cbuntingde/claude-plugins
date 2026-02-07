---
description: Automatically fix style guide violations in code files
---

# /fix-style

Automatically fix style guide violations in your code.

## Usage

```bash
/fix-style [files...]
```

## Examples

- Fix all files: `/fix-style`
- Fix specific files: `/fix-style src/components/Button.tsx`
- Fix with preview (asks before each change): `/fix-style --preview`

## What it fixes

- Indentation and formatting issues
- Import statement ordering
- Naming convention violations (where safe)
- Trailing whitespace and blank lines
- Quote style consistency
- Semicolon usage (if configured)

## Safety

- Only makes safe, non-breaking changes
- Preserves code logic
- Can be run with `--preview` to review changes first
- Creates backups for major refactors

## Configuration

Fix behavior is controlled by your `.style-guide.json` configuration.
