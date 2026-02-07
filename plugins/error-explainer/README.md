# Error Explainer Plugin

A Claude Code plugin that provides context and solutions for cryptic error messages.

## Features

- **Plain language explanations** - Translates technical error messages into understandable terms
- **Root cause analysis** - Identifies what typically triggers each error
- **Actionable solutions** - Provides specific steps to resolve errors
- **Prevention guidance** - Recommends best practices to avoid similar errors
- **Multi-language support** - Works with errors from any programming language or framework

## Installation

### Option 1: User Scope (Recommended for personal use)

```bash
cd /path/to/your/plugins/directory
claude plugin install error-explainer --scope user
```

### Option 2: Project Scope

For team-wide usage via version control:

```bash
claude plugin install error-explainer --scope project
```

## Usage

### Using the Slash Command

After installation, use the `/explain` command:

```
/explain TypeError: Cannot read property 'map' of undefined
```

### Or Simply Ask Claude

You can also just paste an error message and ask Claude to explain it - the plugin enhances Claude's natural error explanation capabilities.

## Configuration

The error-explainer plugin works out of the box with no configuration required.

### Supported Error Types

The plugin provides explanations for common error types:

| Error Type | Languages/Frameworks |
|------------|---------------------|
| TypeError | JavaScript, TypeScript |
| ReferenceError | JavaScript, TypeScript |
| SyntaxError | JavaScript, TypeScript, Python, Ruby |
| RangeError | JavaScript, Python |
| AttributeError | Python |
| ValueError | Python |
| KeyError | Python |
| IndexError | Python, JavaScript arrays |
| PermissionError | Python |
| FileNotFoundError | All languages |
| ConnectionError | All languages |
| TimeoutError | All languages |

### Behavior

- Paste any error message and the plugin will parse it
- Works with errors from any programming language
- Provides context-aware explanations based on error patterns
- Suggests preventive measures for common error types

## Examples

### JavaScript Error

```
/explain "Uncaught TypeError: Cannot read properties of undefined (reading 'forEach')"
```

**Output includes:**
- What the error means
- Why undefined doesn't have forEach
- How to add null checks
- Prevention strategies

### Python Error

```
/explain "AttributeError: 'NoneType' object has no attribute 'split'"
```

**Output includes:**
- NoneType explanation
- Common scenarios causing None
- Defensive programming techniques
- Debugging steps

### Compiler Error

```
/explain "error: expected ';' before '}' token"
```

**Output includes:**
- Syntax issue explanation
- Where to look for missing semicolons
- How to spot similar issues
- Code review tips

## Plugin Structure

```
error-explainer/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/
│   └── explain.md           # /explain slash command
└── README.md                # This file
```

## How It Works

The plugin integrates with Claude's natural language understanding to:

1. Parse error messages and stack traces
2. Identify error patterns across languages
3. Match errors to common causes and solutions
4. Provide context-aware explanations
5. Suggest preventive measures

## Contributing

Contributions are welcome! Areas for enhancement:

- Additional language-specific error patterns
- Integration with error databases
- Visual error flow diagrams
- Common error fix templates
- Error severity classification

## License

MIT

## Author

Chris Dev

## Version

1.0.0
