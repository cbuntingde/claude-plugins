---
description: Detect and report circular dependencies
---

# /check-circular

Detect and report circular dependencies in TypeScript/JavaScript projects.

## Usage

```
/check-circular [directory] [filePattern] [excludePatterns]
```

## Arguments

- **directory** (optional) - Root directory to analyze (default: current directory)
- **filePattern** (optional) - Glob pattern for files to check (default: `**/*.{ts,tsx,js,jsx}`)
- **excludePatterns** (optional) - Comma-separated patterns to exclude (default: `node_modules,dist,build,.claude`)

## What It Does

Uses `madge` (module dependency graph analyzer) to detect circular dependencies across your entire codebase.

## Examples

```bash
# Check current directory
/check-circular

# Check specific directory
/check-circular ./src

# Check with custom patterns
/check-circular . "**/*.ts" "node_modules,dist,test"

# Show fix suggestions
/check-circular --fix
```

## Output

```
╔════════════════════════════════════════════════════════════════╗
║              CIRCULAR DEPENDENCY DETECTION RESULTS            ║
╠════════════════════════════════════════════════════════════════╣
║  Status: VIOLATIONS DETECTED                                   ║
║  Total Cycles: 2                                               ║
╠════════════════════════════════════════════════════════════════╣
║  [1] src/services/auth.service.ts -> src/utils/auth.ts -> src/services/auth.service.ts
║  [2] src/components/Button.tsx -> src/hooks/useButton.ts -> src/components/Button.tsx
╚════════════════════════════════════════════════════════════════╝

Use /check-circular --fix to see suggestions for resolving these issues.
```

## Fix Suggestions

When circular dependencies are detected, the plugin provides these suggestions:

1. **Extract Common Code** - Move shared code to a separate module
2. **Dependency Inversion** - Create interfaces both modules depend on
3. **Events/Messaging** - Replace direct imports with event-based communication
4. **Lazy Loading** - Defer imports to when they're needed
5. **Restructure Modules** - Re-evaluate module dependencies

## Requirements

- Node.js with `npx` available
- Files must be TypeScript or JavaScript (.ts, .tsx, .js, .jsx)

## Exit Codes

- `0` - No circular dependencies found
- `1` - Circular dependencies detected
