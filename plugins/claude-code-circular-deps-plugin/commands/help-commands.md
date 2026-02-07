---
description: Show help information for all available circular dependency plugin commands
---

# Circular Dependency Plugin - Help

This plugin provides commands for detecting, fixing, and monitoring circular dependencies in your TypeScript/JavaScript projects.

## Available Commands

### `/circular-deps-detect`
Detects circular dependencies in the current project.

**Usage:**
```bash
/circular-deps-detect
```

**Options:**
- `--directory`: Root directory to scan (defaults to current directory)
- `--file-pattern`: File pattern to match (default: `**/*.{ts,tsx,js,jsx}`)
- `--exclude`: Patterns to exclude (default: `node_modules,dist,build`)

### `/circular-deps-fix`
Analyzes circular dependencies and provides actionable suggestions for resolving them.

**Usage:**
```bash
/circular-deps-fix
```

**Options:**
- Same as detect command

### `/circular-deps-monitor`
Continuously monitors the project for new circular dependencies as files change.

**Usage:**
```bash
/circular-deps-monitor
```

### `/circular-deps-visualize`
Generates a visual representation of the dependency graph.

**Usage:**
```bash
/circular-deps-visualize
```

## Examples

Detect circular dependencies in a specific directory:
```bash
/circular-deps-detect --directory ./src
```

Get fix suggestions for found issues:
```bash
/circular-deps-fix --directory ./packages/api
```

## See Also

- [Circular Dependency Detector MCP Server](../src/index.ts) - Low-level API access
- [Dependency Analyzer](../src/dependency-analyzer.ts) - Core analysis logic