# Dead Code Hunter

A Claude Code plugin that scans codebases to identify unused code, zombie files, and stale configurations with safe removal and rollback support.

## Features

### Dead Code Detection
- Unused functions, classes, and variables
- Unreachable code paths
- Dead conditional branches
- Imports without references

### Zombie File Identification
- Files not referenced anywhere
- Orphaned test files
- Unused assets (images, fonts, styles)
- Stale configuration files

### Safe Removal
- Dependency-aware removal planning
- Automatic backup before removal
- Rollback support for all changes
- Dry-run mode for preview
- Impact assessment before removal

## Installation

```bash
claude plugin install dead-code-hunter
```

Or install from the marketplace:
```bash
claude plugin install dead-code-hunter@chris-claude-plugins-dev
```

## Usage

### Command

```bash
/dead-code-hunter [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--types <types>` | File types to scan (js, ts, py, java, etc.) |
| `--depth <n>` | Directory depth to scan (default: 10) |
| `--exclude <patterns>` | Patterns to exclude (comma-separated) |
| `--report` | Generate a detailed report without making changes |
| `--dry-run` | Preview what would be removed without actual deletion |
| `--auto-remove` | Automatically remove confirmed dead code |
| `--backup` | Create backup before removal (default: true) |
| `--no-backup` | Skip backup creation |
| `--list-backups` | List available backups |
| `--restore <id>` | Restore from backup ID |

### Examples

```bash
# Scan for dead code in JavaScript/TypeScript files
/dead-code-hunter --types js,ts

# Generate a report without making changes
/dead-code-hunter --report

# Preview removals without deleting
/dead-code-hunter --dry-run

# Scan with custom exclusions
/dead-code-hunter --exclude node_modules,dist,build

# Automatically remove zombie files with backup
/dead-code-hunter --auto-remove --backup

# List available backups
/dead-code-hunter --list-backups

# Restore from a backup
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

## Security

- **Path Traversal Protection**: All file paths validated against directory traversal attacks
- **Input Validation**: All user inputs sanitized and validated against strict allow-lists
- **Safe Operations**: File operations checked for safety before execution
- **Backup Required**: Backup created by default before any deletion
- **No Data Loss**: All deletions can be rolled back
- **Structured Logging**: All operations logged with timestamps and context
- **Error Handling**: Comprehensive error handling with descriptive messages

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The plugin maintains 80%+ test coverage for all business logic and 100% coverage for security-critical code.

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
- package.json dependencies not imported
- Config sections never used
- Environment variables never referenced
- Build targets without output

## Safety Features

- **Backup Creation**: Automatically backs up before removal
- **Rollback Support**: Restore removed code with single command
- **Confirmation Prompts**: Asks before major deletions
- **Dry Run Mode**: Preview all changes before applying
- **Dependency Analysis**: Checks for cascading effects
- **Path Validation**: Prevents access outside project directory
- **Size Limits**: Skips files larger than 10MB

## Rollback

If you need to restore removed code:

```bash
# List available backups
/dead-code-hunter --list-backups

# Restore from backup
/dead-code-hunter --restore <backup-id>
```

## License

MIT

## Author

Chris Bunting - cbuntingde@gmail.com

## Repository

https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/dead-code-hunter
