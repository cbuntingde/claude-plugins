# CLAUDE.md Hook Plugin

Automatically includes your CLAUDE.md project rules with every user prompt.

## Features

- **Automatic Context Injection**: Prepends CLAUDE.md content to every prompt
- **Prevents Duplication**: Detects if CLAUDE.md was already included
- **Safe Path Resolution**: Finds CLAUDE.md relative to where the plugin is installed
- **Size Limits**: Respects input size limits to prevent bloat

## Installation

```bash
claude plugin install ./claude-md-hook --scope local
```

## How It Works

The plugin registers a `UserPromptSubmit` hook that triggers on every user prompt. Before sending your prompt to Claude, the hook:

1. Locates CLAUDE.md by walking up directories from the plugin root
2. Reads the CLAUDE.md content (up to 64KB)
3. Prepends it to your prompt with markers to prevent duplication
4. Outputs the combined prompt

## Usage

Once installed, the plugin works automatically:

1. User submits a prompt
2. The hook triggers and locates CLAUDE.md
3. CLAUDE.md content is prepended to the prompt
4. Claude receives the combined context

**Note**: The plugin detects if CLAUDE.md was already included to avoid duplication.

## Configuration

No configuration required. The plugin automatically:
- Locates CLAUDE.md by walking up from the plugin installation directory
- Limits CLAUDE.md content to 64KB to prevent bloat
- Validates file paths to prevent path traversal attacks
- Exits silently if no CLAUDE.md is found

## Files

- `.claude-plugin/plugin.json` - Plugin metadata
- `hooks/hooks.json` - Hook configuration for `UserPromptSubmit`
- `scripts/prepend-claude-md.sh` - Script that prepends CLAUDE.md to prompts
- `index.js` - Plugin entry point