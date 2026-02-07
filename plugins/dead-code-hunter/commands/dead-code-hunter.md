---
description: Hunt down and safely remove dead code, zombie files, and unused configurations
---

# Dead Code Hunter

Scans your codebase to identify truly unused code, zombie configuration files, and dead assets. Provides safe removal recommendations with rollback support.

## Usage

```
/dead-code-hunter [options]
```

## Options

| Option | Description |
|--------|-------------|
| `--types <types>` | File types to scan (js, ts, py, java, etc.) |
| `--depth <n>` | Directory depth to scan (default: 10) |
| `--exclude <patterns>` | Patterns to exclude (comma-separated) |
| `--report` | Generate a detailed report without making changes |
| `--dry-run` | Preview what would be removed without actual deletion |
| `--auto-remove` | Automatically remove confirmed dead code |
| `--backup` | Create backup before removal |

## Examples

```bash
# Scan for dead code in JavaScript/TypeScript files
/dead-code-hunter --types js,ts

# Generate a report without making changes
/dead-code-hunter --report

# Preview removals without deleting
/dead-code-hunter --dry-run

# Scan with custom exclusions
/dead-code-hunter --exclude node_modules,dist,build
```

## What It Detects

### Unused Code
- Functions never called
- Variables never used
- Classes never instantiated
- Imports without references
- Unreachable code (after return/throw)
- Dead else branches

### Zombie Files
- Files not referenced anywhere
- Orphaned test files
- Unused assets (images, styles, fonts)
- Stale configuration files
- Deprecated dependency files

### Unused Configuration
- Package.json dependencies not imported
- Config sections never used
- Environment variables never referenced
- Build targets without output

## Safety Features

- **Backup Creation**: Automatically backs up before removal
- **Rollback Support**: Restore removed code with single command
- **Confirmation Prompts**: Asks before major deletions
- **Dry Run Mode**: Preview all changes before applying
- **Dependency Analysis**: Checks for cascading effects

## Rollback Commands

If you need to restore removed code:

```bash
# List available backups
/dead-code-hunter --list-backups

# Restore from backup
/dead-code-hunter --restore <backup-id>
```

## Configuration

Create a `.deadcoderc` file in your project root:

```json
{
  "types": ["js", "ts", "py", "java"],
  "exclude": ["node_modules", "dist", ".git", "*.min.js"],
  "minSize": 1024,
  "ignorePatterns": ["TODO", "FIXME", "legacy"],
  "backupEnabled": true,
  "autoConfirm": false
}
```