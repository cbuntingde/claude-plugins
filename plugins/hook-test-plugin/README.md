# Hook Test Plugin

A plugin for testing Claude Code hook functionality.

## Description

This plugin provides utilities for testing and debugging hook configurations in Claude Code. It helps developers verify that their hooks are working correctly before deploying to production.

## Installation

Clone this repository and link it to your Claude Code plugins directory:

```bash
git clone https://github.com/cbuntingde/claude-plugins-dev.git
cd claude-plugins-dev/plugins/hook-test-plugin
```

## Usage

This plugin is primarily used for testing hook configurations. See the hooks.json file for available hook definitions.

## Configuration

No additional configuration required. The plugin uses the hooks defined in `hooks/hooks.json`.

## Security

- This plugin only reads configuration files
- No external network calls are made
- All operations are read-only