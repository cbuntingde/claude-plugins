# Architecture Gatekeeper Plugin

Comprehensive architecture validation plugin for Claude Code that prevents commits violating architecture patterns or creating circular dependencies.

## Description

The Architecture Gatekeeper plugin provides automated validation of code architecture, ensuring your codebase maintains clean architecture principles throughout development. It detects circular dependencies, validates architecture patterns, and enforces import rules to prevent architectural degradation.

## Features

- **Circular Dependency Detection** - Automatically detects circular imports using madge
- **Architecture Pattern Validation** - Validates compliance with:
  - Layered/N-tier Architecture
  - Hexagonal/Ports and Adapters Architecture
  - Clean/Onion Architecture
  - Microservices Architecture
- **Import Rule Enforcement** - Validates proper module boundaries
- **Pre-commit Hooks** - Automatic validation on staged files
- **Configurable Rules** - Customize thresholds and severity levels
- **Multiple Output Formats** - Table, JSON, or Markdown reports
- **Fix Suggestions** - Actionable recommendations for violations

## Installation

```bash
claude plugin install ./plugins/architecture-gatekeeper --scope user
```

## Requirements

- Node.js 14+ with `npx` available
- Git (for commit validation hooks)
- Bash 4+ (for shell scripts)

## Usage

### Basic Workflow

1. **Create default configuration**
   ```bash
   /configure-gates create
   ```

2. **Run architecture validation**
   ```bash
   /check-architecture
   ```

3. **View detected violations**
   ```bash
   /show-violations
   ```

### Common Commands

**Check for circular dependencies:**
```bash
/check-circular
```

**Validate architecture patterns:**
```bash
/check-patterns . layered
```

**Validate staged changes before committing:**
```bash
/validate-commit
```

**Configure rules and thresholds:**
```bash
/configure-gates create
/configure-gates severity import_rules warning
/configure-gates pattern hexagonal
```

**Display violations in different formats:**
```bash
/show-violations table error
/show-violations json warning
/show-violations markdown info
```

### Quick Start

For first-time users, run these commands to get started:

1. `/configure-gates create` - Create default configuration
2. `/check-architecture` - Run validation on your codebase
3. `/show-violations` - View any detected violations

## Commands

### `/check-architecture`
Run comprehensive architecture validation checks on your codebase.

### `/check-circular`
Detect and report circular dependencies in TypeScript/JavaScript projects.

### `/check-patterns`
Validate compliance with specified architecture patterns.

### `/validate-commit`
Validate staged changes against architecture rules before committing.

### `/configure-gates`
Configure architecture gate rules, thresholds, and settings.

### `/show-violations`
Display detected architecture violations in various formats.

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
  "commit_validation": {
    "enabled": true,
    "strict_mode": true,
    "check_staged_only": true
  },
  "exclude_patterns": [
    "node_modules",
    "dist",
    "build",
    ".claude"
  ]
}
```

## Architecture Patterns

### Layered Architecture
Validates that layers don't skip levels:
- Presentation → Application → Domain → Infrastructure
- No upward dependencies allowed
- Each layer only depends on layers below

### Hexagonal Architecture
Validates ports and adapters separation:
- Domain is isolated from external concerns
- Ports define interfaces
- Adapters implement ports
- No domain dependencies on infrastructure

### Clean Architecture
Validates onion architecture principles:
- Entities at the core (no dependencies)
- Use cases surround entities
- Interface adapters surround use cases
- Frameworks at the outer edge
- Dependencies point inward

### Microservices
Validates service boundaries:
- No direct imports between services
- Shared code in dedicated modules
- Clear service separation

## Integration with Git Hooks

### Using Husky

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "CLAUDE_PLUGIN_ROOT=./plugins/architecture-gatekeeper ./plugins/architecture-gatekeeper/scripts/validate-commit.sh"
    }
  }
}
```

### Manual Git Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
CLAUDE_PLUGIN_ROOT=/path/to/plugins/architecture-gatekeeper \
  ./plugins/architecture-gatekeeper/scripts/validate-commit.sh
```

## Security Considerations

- Configuration files (`architecture.json`) should not contain secrets
- Violation logs may contain file paths - handle appropriately
- Plugin runs with user permissions - no privilege escalation
- All file operations are scoped to project directory

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STRICT_MODE` | Enable strict validation | `true` |
| `MAX_CYCLES` | Allowed circular dependency cycles | `0` |
| `MAX_PATTERN_VIOLATIONS` | Allowed pattern violations | `0` |
| `FORMAT` | Output format | `table` |
| `SEVERITY` | Severity filter | `error` |

## Troubleshooting

### "npx: command not found"
Install Node.js from https://nodejs.org

### "No such file or directory: data/violations.json"
Run `/check-architecture` once to initialize data files

### Hooks not firing
- Ensure scripts have execute permissions: `chmod +x scripts/*.sh`
- Check `${CLAUDE_PLUGIN_ROOT}` is set correctly
- Verify hooks.json is valid JSON

### False positives in pattern validation
- Adjust exclude patterns in configuration
- Set severity to `warning` for non-critical rules
- Use `threshold` to allow some violations

## Files

- `.claude-plugin/plugin.json` - Plugin metadata
- `hooks/hooks.json` - Hook configuration for automatic validation
- `scripts/check-architecture.sh` - Main validation script
- `scripts/check-circular.sh` - Circular dependency detection
- `scripts/check-patterns.sh` - Architecture pattern validation
- `scripts/validate-commit.sh` - Pre-commit validation
- `scripts/configure-gates.sh` - Configuration management
- `scripts/show-violations.sh` - Violation display
- `commands/*.md` - Command documentation

## License

MIT
