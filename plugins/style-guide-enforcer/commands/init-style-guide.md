---
description: Initialize or update the team style guide configuration
---

# /init-style-guide

Create or update a `.style-guide.json` configuration file for your project.

## Usage

```bash
/init-style-guide [--preset=<preset>]
```

## Presets

- `--preset=javascript`: JavaScript/TypeScript best practices
- `--preset=python`: Python PEP 8 style
- `--preset=go`: Go conventions
- `--preset=react`: React component conventions
- `--preset=custom`: Interactive setup (default)

## Interactive Setup

When run without a preset, guides you through:
1. Language selection
2. Naming convention preferences
3. Indentation style (spaces/tabs)
4. Import organization preferences
5. Documentation requirements
6. Project-specific rules

## Example

```bash
/init-style-guide --preset=javascript
```

Creates a `.style-guide.json` with JavaScript-optimized defaults that you can customize.

## Configuration File

The generated `.style-guide.json` includes:
- Language-specific rules
- Team conventions
- Enforcement settings
- File pattern matching
- Custom rule definitions
