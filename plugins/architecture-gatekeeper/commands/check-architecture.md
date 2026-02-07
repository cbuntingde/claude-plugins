---
description: Run comprehensive architecture validation checks
---

# /check-architecture

Run comprehensive architecture validation checks on your codebase.

## Usage

```
/check-architecture [directory] [config] [output]
```

## Arguments

- **directory** (optional) - Root directory to analyze (default: current directory)
- **config** (optional) - Path to architecture configuration file (default: `.claude/architecture.json`)
- **output** (optional) - Output format: `json`, `table`, `markdown` (default: `table`)

## What It Checks

1. **Circular Dependencies** - Detects circular imports using madge
2. **Architecture Patterns** - Validates layer isolation for:
   - Layered Architecture
   - Hexagonal Architecture
   - Clean Architecture
   - Microservices
3. **Import Rules** - Checks for:
   - Absolute imports bypassing module boundaries
   - Relative imports crossing layer boundaries
   - Direct database imports outside data layer

## Examples

```bash
# Check current directory
/check-architecture

# Check specific directory
/check-architecture ./src

# Use custom config and JSON output
/check-architecture ./.claude/architecture.json json
```

## Configuration

Create `.claude/architecture.json` in your project root:

```json
{
  "circular_dependencies": {
    "enabled": true,
    "max_cycles": 0,
    "severity": "error"
  },
  "pattern_violations": {
    "enabled": true,
    "max_violations": 0,
    "severity": "error",
    "pattern": "layered"
  },
  "import_rules": {
    "enabled": true,
    "check_absolute_imports": true,
    "check_relative_imports": true,
    "severity": "warning"
  },
  "exclude_patterns": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

## Output

Returns a formatted report showing:
- Total violations found
- Violations by type (circular, pattern, import)
- File paths and line numbers
- Severity levels
- Suggested fixes

## Exit Codes

- `0` - No violations found
- `1` - Violations detected or errors occurred
