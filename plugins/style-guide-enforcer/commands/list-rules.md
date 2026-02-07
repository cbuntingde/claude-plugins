---
description: List all active style guide rules and their configurations
---

# /list-rules

Display all currently configured style guide rules.

## Usage

```bash
/list-rules
```

## Output Format

Displays rules grouped by category:
- **Naming**: Variable, function, class naming conventions
- **Formatting**: Indentation, line length, spacing rules
- **Imports**: Import ordering and grouping rules
- **Documentation**: Comment and documentation standards
- **Structure**: File and folder organization rules
- **Language-specific**: JS/TS, Python, Go, etc. specific rules

## Examples

```
NAMING CONVENTIONS
├── Variables: camelCase
├── Functions: camelCase
├── Classes: PascalCase
└── Constants: UPPER_SNAKE_CASE

FORMATTING RULES
├── Indentation: 2 spaces
├── Max line length: 100 characters
└── Trailing whitespace: prohibited

IMPORT RULES
├── Order: stdlib → external → internal
└── Grouping: blank line between groups
```

## Configuration

Rules are loaded from `.style-guide.json` in your project root.
