---
description: Analyze code for tree-shaking opportunities and unused exports
---

# Tree Shake

Analyzes codebase for tree-shaking opportunities, unused exports, and dead code that can be eliminated from bundles.

## Usage

```
/tree-shake [path] [options]
```

### Arguments

- `path` (optional): Path to analyze. Defaults to `src/` directory or current working directory.
- `--format <type>`: Output format - `text`, `json`, `diff`, or `markdown`. Default: `text`
- `--severity <level>`: Filter by severity - `all`, `high`, `medium`, `low`. Default: `all`
- `--fix`: Automatically apply safe tree-shaking improvements
- `--side-effects`: Analyze potential side effects that prevent tree-shaking

### Options

- `-e, --export-only`: Only analyze unused exports (ignore dead code)
- `-d, --dead-code`: Include dead code detection within functions
- `-i, --import-analysis`: Show import usage patterns
- `-p, --package`: Analyze package.json for side effect configuration
- `-o, --output <file>`: Save suggestions to file
- `--no-interactive`: Apply fixes without confirmation

## Examples

**Analyze tree-shaking opportunities:**
```
/tree-shake src/
```

**Analyze with side-effect detection:**
```
/tree-shake --side-effects --import-analysis
```

**Auto-apply safe improvements:**
```
/tree-shake --fix
```

**Show only high-priority issues:**
```
/tree-shake --severity high --format json
```

**Analyze package.json configuration:**
```
/tree-shake --package
```

## Output

The analyzer identifies:

### Unused Exports
- Exported functions, classes, or variables never imported
- Re-exports that chain unused code
- Type-only exports in JavaScript files
- Default exports that could be named exports

### Dead Code
- Unreachable code after return/throw
- Conditional branches that never execute
- Functions defined but never called
- Variables declared but never used

### Side Effect Issues
- Module-level code that prevents tree-shaking
- Implicit side effects in pure modules
- Missing `"sideEffects": false` in package.json
- Class decorators or prototype mutations

### Import Patterns
- Unused imports
- Barrel file inefficiencies
- Circular dependencies
- Deep imports vs. full library imports

## Recommendations

### 1. Remove Unused Exports
```javascript
// BEFORE: Unused export
export function unusedHelper() { /* ... */ }
export function usedHelper() { /* ... */ }

// AFTER: Remove unused export
export function usedHelper() { /* ... */ }
```

### 2. Configure Side Effects
```json
// package.json
{
  "sideEffects": false,
  "sideEffects": [
    "*.css",
    "dist/polyfill.js"
  ]
}
```

### 3. Use Named Exports
```javascript
// BEFORE: Default export (harder to tree-shake)
export default {
  foo() { /* ... */ },
  bar() { /* ... */ }
};

// AFTER: Named exports (better tree-shaking)
export function foo() { /* ... */ }
export function bar() { /* ... */ }
```

### 4. Avoid Barrel Files
```javascript
// BEFORE: Barrel file (index.js)
export * from './foo';
export * from './bar';
export * from './baz';

// AFTER: Direct imports
import { foo } from './foo';
import { bar } from './bar';
```

### 5. Pure Functions
```javascript
// Add pure annotation for webpack
/** #__PURE__ */
export function pureFunction(x) {
  return x * 2;
}
```

## Auto-Fix Behavior

When using `--fix`, the tool will:
1. Remove unused exports (with confirmation)
2. Add `"sideEffects": false` to package.json if safe
3. Remove unused imports
4. Refactor barrel files to direct imports
5. Add `/* #__PURE__ */` annotations to pure functions

**Safety checks:**
- Never removes code with potential side effects
- Preserves exports in public APIs
- Keeps type exports for TypeScript
- Validates imports before removal

## Integration

Works with:
- **Webpack**: Requires mode: 'production' and usedExports: true
- **Rollup**: Native tree-shaking support
- **Vite**: Uses Rollup with production optimizations
- **esbuild**: Requires format: 'esm'

## Best Practices

1. **Enable production mode**: Tree-shaking works best in production builds
2. **Use ES modules**: CommonJS cannot be tree-shaken
3. **Mark pure functions**: Help bundlers identify side-effect-free code
4. **Analyze regularly**: Run before releases to catch bloat
5. **Test after removal**: Verify nothing breaks after removing unused code

## See Also

- `/analyze-bundle` - Analyze bundle sizes
- `/compare-bundles` - Compare bundle sizes before/after optimization
- `/export-report` - Generate comprehensive optimization report
