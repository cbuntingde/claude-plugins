---
description: Analyze JavaScript/TypeScript bundle sizes and identify large dependencies
---

# Analyze Bundle

Comprehensive bundle size analysis for JavaScript/TypeScript projects. Identifies large modules, unused code, and optimization opportunities.

## Usage

```
/analyze-bundle [path] [options]
```

### Arguments

- `path` (optional): Path to bundle file or project root. Defaults to current working directory.
- `--format <type>`: Output format - `text`, `json`, `html`, or `markdown`. Default: `text`
- `--threshold <kb>`: Minimum size threshold for reporting (in KB). Default: 10
- `--bundler <type>`: Auto-detect bundler or specify - `webpack`, `rollup`, `vite`, `esbuild`, `parcel`
- `--deep`: Enable deep analysis with dependency graph visualization
- `--minified`: Analyze minified bundles (requires source maps)

### Options

- `-o, --output <file>`: Save analysis results to file
- `-m, --module-graph`: Generate module dependency graph
- `-s, --source-map <path>`: Use specific source map for analysis
- `-e, --exclude <pattern>`: Exclude modules matching pattern (e.g., `node_modules/**`)
- `--no-color`: Disable colored output

## Examples

**Analyze default bundle:**
```
/analyze-bundle
```

**Analyze with module graph:**
```
/analyze-bundle dist/bundle.js --module-graph --format html
```

**Analyze Vite build with deep analysis:**
```
/analyze-bundle dist/assets/ --bundler vite --deep --threshold 5
```

**Export JSON report:**
```
/analyze-bundle --format json --output bundle-analysis.json
```

**Analyze with exclusions:**
```
/analyze-bundle --exclude "node_modules/**" --exclude "*.test.js"
```

## Output

The analyzer provides:

- **Bundle overview**: Total size, gzip size, module count
- **Size breakdown**: Per-module size ranking (largest first)
- **Dependency tree**: Visual representation of module dependencies
- **Duplicate code**: Identifies duplicate code across bundles
- **Large dependencies**: Third-party libraries contributing to bundle size
- **Code splitting opportunities**: Suggests optimal split points
- **Compression impact**: Shows potential savings with compression

## Detected Bundlers

Automatically detects and analyzes:
- **Webpack** (via webpack-bundle-analyzer or stats.json)
- **Vite** (via build manifest and rollup visualization)
- **Rollup** (via stats and output options)
- **esbuild** (via metafile)
- **Parcel** (via bundle report)

## Integration

This command automatically:
- Detects bundler type from project configuration
- Generates bundle analysis using appropriate tools
- Parses source maps for accurate module sizes
- Identifies tree-shaking opportunities
- Provides actionable optimization recommendations

## Optimization Suggestions

Common recommendations include:

1. **Replace large libraries**: Use smaller alternatives
2. **Enable tree-shaking**: Configure ES module output
3. **Code splitting**: Split routes or features
4. **Dynamic imports**: Lazy load non-critical code
5. **Remove unused dependencies**: Clean up package.json
6. **Configure compression**: Enable gzip/brotli

## See Also

- `/tree-shake` - Analyze and suggest tree-shaking improvements
- `/compare-bundles` - Compare bundle sizes across builds
- `/export-report` - Generate detailed analysis report
