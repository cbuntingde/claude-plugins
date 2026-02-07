# Environment Variable Detection Plugin for Claude Code

Automatically detect missing environment variables in your codebase with this Claude Code plugin.

## Features

- 🔍 **Automatic Detection**: Automatically scans code after file edits/writes
- 📝 **Manual Command**: Run `/check-env` anytime for a full scan
- 🌐 **Multi-Language Support**: JavaScript, TypeScript, Python, Shell, PHP, Ruby, Go, Java
- 📊 **Detailed Reports**: See exactly which variables are missing and where they're used
- 💡 **Smart Suggestions**: Get suggested `.env` additions for missing variables
- ⚡ **Zero Configuration**: Works out of the box with sensible defaults

## Installation

### Install from local directory

```bash
cd env-var-detect
claude plugin install . --scope project
```

### Install to user scope (available in all projects)

```bash
cd env-var-detect
claude plugin install . --scope user
```

## Usage

### Automatic Detection

The plugin automatically runs after you write or edit files. It will:
1. Detect environment variable usage patterns in your code
2. Check if they're defined in your `.env` files
3. Display a warning if any are missing

### Manual Command

Run the `/check-env` slash command anytime:

```
/check-env
```

This performs a complete scan of your codebase and provides a comprehensive report.

## What Gets Detected

### Environment Files

The plugin checks these files for variable definitions:
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.test`
- `.env.example`
- `.env.sample`
- `.env.template`
- `env`, `env.local`, `env.dist`

### Language Patterns

| Language | Pattern Examples |
|----------|-----------------|
| JavaScript/TypeScript | `process.env.API_KEY`, `import.meta.env.VAR` |
| Python | `os.environ['DB_HOST']`, `os.getenv('API_KEY')` |
| Shell | `$VAR`, `${VAR}` |
| PHP | `$_ENV['VAR']`, `getenv('VAR')` |
| Ruby | `ENV['VAR']` |
| Go | `os.Getenv('VAR')` |
| Java | `System.getenv('VAR')` |

## Output Example

```
🔍 Detecting Environment Variables...

✓ Found 12 defined environment variable(s)
✓ Scanning 45 file(s)...

⚠️  Found 3 missing environment variable(s):

📄 src/config/database.ts
   • DB_HOST
   • DB_PORT

📄 src/services/api.ts
   • API_KEY

📋 Summary:
   Missing: 3
   Defined: 12
   Used in code: 15

💡 Suggested .env additions:
DB_HOST=
DB_PORT=
API_KEY=
```

## Configuration

### Enable/Disable Automatic Scanning

Edit `hooks/hooks.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/detect-env-vars.js",
            "enabled": true  // Set to false to disable
          }
        ]
      }
    ]
  }
}
```

### Enable Session Start Scanning

Edit `hooks/hooks.json` to enable scanning on session start:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/detect-env-vars.js --scan",
            "enabled": true  // Change from false to true
          }
        ]
      }
    ]
  }
}
```

## Project Structure

```
env-var-detect/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/
│   └── check-env.md         # Slash command definition
├── hooks/
│   └── hooks.json           # Hook configuration
├── scripts/
│   └── detect-env-vars.js   # Detection script
└── README.md                # This file
```

## How It Works

1. **Hook Triggers**: The plugin hooks into Claude Code's `PostToolUse` event
2. **Pattern Matching**: Uses regex patterns to find environment variable usage
3. **Cross-Reference**: Checks used variables against definitions in `.env` files
4. **Reporting**: Displays missing variables grouped by file with helpful suggestions

## Development

### Running the Script Directly

```bash
node scripts/detect-env-vars.js
```

### Scan Specific Directory

```bash
node scripts/detect-env-vars.js /path/to/project
```

## Best Practices

1. **Keep `.env.example` Updated**: Document all required variables
2. **Use Descriptive Names**: UPPERCASE_WITH_UNDERSCORES
3. **Run Before Deploy**: Check for missing variables before production
4. **Document Sensitive Values**: Add comments in `.env.example`
5. **Never Commit Secrets**: Add `.env` to `.gitignore`

## Troubleshooting

### Plugin Not Loading

- Verify plugin is installed: `claude plugin list`
- Check for syntax errors: `claude plugin validate env-var-detect`
- Enable debug mode: `claude --debug`

### Script Not Executing

- Ensure Node.js is installed: `node --version`
- Make script is executable: `chmod +x scripts/detect-env-vars.js` (Linux/Mac)
- Check `${CLAUDE_PLUGIN_ROOT}` path in hooks.json

### False Positives

Some patterns may trigger false positives. You can:
- Disable automatic detection in hooks.json
- Run manually only when needed
- Extend the script with ignore patterns

## Contributing

Contributions are welcome! Feel free to:
- Add support for more languages
- Improve detection patterns
- Enhance error reporting
- Add configuration options

## License

MIT License - feel free to use this plugin in your projects.

## Author

Created by Chris Dev

## See Also

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code Overview](https://code.claude.com/docs/en/overview)
- [Plugin Development Guide](https://github.com/anthropics/claude-code/blob/main/plugins/README.md)

---

**Happy coding! 🚀**
