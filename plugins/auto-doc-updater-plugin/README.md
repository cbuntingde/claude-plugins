# Auto Documentation Updater Plugin

Automatically detects code changes and suggests documentation updates.

## Installation

```bash
# Available via Claude marketplace
```

## Usage

### Manual Update Check

```
/update-docs
```

Analyzes recent changes and suggests documentation updates.

### Analyze Specific File

```
/update-docs <file-path>
```

Checks a specific file for documentation gaps.

### Full Project Audit

```
/update-docs --full
```

Performs comprehensive documentation audit of the entire project.

## Features

- Detects new APIs requiring documentation
- Identifies outdated doc references
- Suggests documentation for undocumented functions
- Tracks doc-to-code coverage metrics

## Hook Integration

The plugin can integrate with Claude's hook system to suggest documentation updates after code modifications.

## Configuration

### Environment Variables

No environment variables required for this plugin.

### Plugin Settings

```json
{
  "plugins": {
    "auto-doc-updater": {
      "includePatterns": ["**/*.ts", "**/*.js", "**/*.py", "**/*.md"],
      "excludePatterns": ["**/node_modules/**", "**/dist/**", "**/.git/**"],
      "autoWatch": false,
      "docExtensions": [".md", ".txt", ".rst"]
    }
  }
}
```

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `includePatterns` | string[] | See default | File patterns to watch for changes |
| `excludePatterns` | string[] | See default | Patterns to exclude from analysis |
| `autoWatch` | boolean | `false` | Automatically watch files for changes |
| `docExtensions` | string[] | See default | File extensions considered as documentation |

### Command Options

#### `/auto-update-docs` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--file` | Specific file to check | All changed files |
| `--full` | Run full project audit | `false` |
| `--output` | Output format (text, json) | `text` |

#### `/sync-docs` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Show changes without applying | `true` |
| `--force` | Apply all suggested changes | `false` |

#### `/watch-docs` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--interval` | Check interval in seconds | `30` |
| `--quiet` | Only report issues | `false` |

## Author

[cbuntingde](https://github.com/cbuntingde)

## License

MIT