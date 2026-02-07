---
description: Display detected architecture violations
---

# /show-violations

Display detected architecture violations in various formats.

## Usage

```
/show-violations [format] [severity] [action]
```

## Arguments

- **format** (optional) - Display format: `table`, `json`, `markdown` (default: `table`)
- **severity** (optional) - Filter by severity: `error`, `warning`, `info` (default: `error`)
- **action** (optional) - Action: `display`, `summary`, `clear`, `export` (default: `display`)

## Formats

### `table` (default)
Formatted table output with color coding

```bash
/show-violations table error
```

### `json`
Raw JSON output for programmatic consumption

```bash
/show-violations json warning
```

### `markdown`
Markdown format for documentation

```bash
/show-violations markdown error
```

## Actions

### `display` (default)
Display violations in specified format

```bash
/show-violations table error display
```

### `summary`
Show summary statistics

```bash
/show-violations summary
```

Output:
```
╔════════════════════════════════════════════════════════════════╗
║                 VIOLATION SUMMARY STATISTICS                   ║
╠════════════════════════════════════════════════════════════════╣
║  Total Violations: 15                                          ║
║  Errors: 8                                                     ║
║  Warnings: 5                                                   ║
║  Info: 2                                                       ║
╚════════════════════════════════════════════════════════════════╝
```

### `clear`
Clear all stored violations

```bash
/show-violations clear
```

### `export`
Export violations to timestamped file

```bash
/show-violations export
```

Creates: `data/violations-export-20240120-143022.json`

## Examples

```bash
# Show errors in table format
/show-violations

# Show warnings as JSON
/show-violations json warning

# Show all violations in markdown
/show-violations table info

# Display summary statistics
/show-violations summary

# Clear violations
/show-violations clear

# Export for reporting
/show-violations export
```

## Output Examples

### Table Format
```
╔════════════════════════════════════════════════════════════════╗
║                    ARCHITECTURE VIOLATIONS                     ║
╠════════════════════════════════════════════════════════════════╣
║  Total: 2 violation(s) (severity: error)                       ║
╠════════════════════════════════════════════════════════════════╣
║  [1] circular_dependency
║      Message: src/auth.ts -> src/utils/auth.ts -> src/auth.ts
║      File: src/auth.ts:15
║      Time: 2024-01-20 14:30:22
║
║  [2] pattern_violation
║      Message: Domain imports from outer layers
║      File: src/domain/user.service.ts:8
║      Time: 2024-01-20 14:30:25
║
╚════════════════════════════════════════════════════════════════╝
```

### JSON Format
```json
[
  {
    "severity": "error",
    "type": "circular_dependency",
    "message": "src/auth.ts -> src/utils/auth.ts -> src/auth.ts",
    "file": "src/auth.ts",
    "line": 15,
    "timestamp": "2024-01-20T14:30:22Z"
  }
]
```

### Markdown Format
```markdown
# Architecture Violations Report

**Generated:** 2024-01-20 14:30:22 UTC
**Severity:** error
**Total Violations:** 2

## Violations

### Violation 1: circular_dependency

| Field | Value |
|-------|-------|
| Message | `src/auth.ts -> src/utils/auth.ts -> src/auth.ts` |
| File | `src/auth.ts:15` |
| Timestamp | 2024-01-20T14:30:22Z |
```

## Environment Variables

- `FORMAT` - Default output format (default: `table`)
- `SEVERITY` - Default severity filter (default: `error`)
