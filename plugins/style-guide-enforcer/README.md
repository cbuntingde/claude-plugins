# Style Guide Enforcer Plugin

A comprehensive Claude Code plugin for maintaining consistent code style and team conventions.

## Features

- **Automatic validation**: Real-time style checking on every code edit
- **Smart fixes**: Automatically correct common style violations
- **Team standards**: Define and enforce project-specific conventions
- **Multi-language**: Support for JavaScript, TypeScript, Python, Go, and more
- **Customizable rules**: Configure naming, formatting, and organization rules

## Installation

```bash
claude plugin install style-guide-enforcer
```

## Quick Start

1. **Initialize your style guide**:
   ```bash
   /init-style-guide --preset=javascript
   ```

2. **Check your code**:
   ```bash
   /check-style src/
   ```

3. **Fix violations**:
   ```bash
   /fix-style src/
   ```

## Commands

### `/check-style [files...]`
Check files against style guide conventions.

### `/fix-style [files...]`
Automatically fix style violations.

### `/list-rules`
Display all configured style rules.

### `/init-style-guide [--preset=<preset>]`
Initialize or update style guide configuration.

## Configuration

Style rules are defined in `.style-guide.json` in your project root:

```json
{
  "rules": {
    "naming": {
      "variables": "camelCase",
      "functions": "camelCase",
      "classes": "PascalCase"
    },
    "formatting": {
      "indentation": "spaces",
      "indentSize": 2,
      "maxLineLength": 100
    }
  }
}
```

## Usage

### Initialize a Style Guide

Create a `.style-guide.json` configuration for your project:

```bash
/init-style-guide --preset=javascript
```

### Check Code Style

Validate files against your style guide:

```bash
/check-style src/
/check-style src/components/*.tsx
```

### Fix Style Violations

Automatically fix style issues:

```bash
/fix-style src/
/fix-style --preview src/
```

### List Active Rules

View all configured style rules:

```bash
/list-rules
```

## How It Works

1. **Hooks**: Automatically validates code after Write/Edit operations
2. **Skills**: Style reviewer agent provides intelligent feedback
3. **Commands**: Manual checking and fixing capabilities
4. **Configuration**: Project-specific rules in `.style-guide.json`

## Example Output

```
📋 src/components/Button.tsx
  WARNING: Line 23 - Trailing whitespace
  INFO: Line 45 - Exceeds 100 characters (105)

❌ Found 2 style violation(s)
Run /fix-style to automatically fix issues
```

## License

MIT
