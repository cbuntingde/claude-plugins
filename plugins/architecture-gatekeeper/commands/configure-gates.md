---
description: Configure architecture gate rules and thresholds
---

# /configure-gates

Configure architecture gate rules, thresholds, and settings.

## Usage

```
/configure-gates <action> [options]
```

## Actions

### `create`
Create default configuration file at `.claude/architecture.json`

```bash
/configure-gates create
```

### `show`
Display current configuration

```bash
/configure-gates show
```

### `reset`
Reset configuration to defaults (backs up current config first)

```bash
/configure-gates reset
```

### `enable <check>`
Enable a specific check

```bash
/configure-gates enable circular_dependencies
/configure-gates enable pattern_violations
/configure-gates enable import_rules
```

### `disable <check>`
Disable a specific check

```bash
/configure-gates disable circular_dependencies
```

### `threshold <check> <value>`
Set violation threshold for a check

```bash
/configure-gates threshold circular_dependencies 0
/configure-gates threshold pattern_violations 5
```

### `severity <check> <level>`
Set severity level (error, warning, info)

```bash
/configure-gates severity circular_dependencies error
/configure-gates severity import_rules warning
```

### `pattern <name>`
Set architecture pattern (layered, hexagonal, clean, microservices)

```bash
/configure-gates pattern layered
/configure-gates pattern hexagonal
```

### `backup`
Backup current configuration

```bash
/configure-gates backup
```

## Configuration File

Configuration is stored in `.claude/architecture.json`:

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
  "commit_validation": {
    "enabled": true,
    "strict_mode": true,
    "check_staged_only": true
  },
  "exclude_patterns": [
    "node_modules",
    "dist",
    "build",
    ".claude",
    "coverage",
    "*.test.ts",
    "*.test.js"
  ],
  "include_patterns": [
    "**/*.{ts,tsx,js,jsx}"
  ]
}
```

## Examples

```bash
# Create default configuration
/configure-gates create

# Disable circular dependency checking
/configure-gates disable circular_dependencies

# Allow up to 5 pattern violations before failing
/configure-gates threshold pattern_violations 5

# Change import rule severity to warning
/configure-gates severity import_rules warning

# Switch to clean architecture validation
/configure-gates pattern clean

# View current settings
/configure-gates show
```

## Severity Levels

- **error** - Violations block commits (in strict mode)
- **warning** - Violations are reported but don't block
- **info** - Informational only

## Environment Variables

- `STRICT_MODE` - Override strict mode setting (`true` or `false`)
- `MAX_CYCLES` - Override circular dependency threshold
- `MAX_PATTERN_VIOLATIONS` - Override pattern violation threshold
