# Bundle Size Analyzer Plugin

A comprehensive Claude Code plugin for analyzing JavaScript/TypeScript bundle sizes and identifying tree-shaking opportunities.

## Features

- 🔍 **Bundle Analysis**: Deep analysis of bundle composition and size breakdown
- 🌳 **Tree-Shaking Detection**: Identify unused code and exports
- 📊 **Size Comparison**: Compare bundles across builds or commits
- 📈 **Trend Tracking**: Monitor bundle size changes over time
- 🎯 **Optimization Suggestions**: Actionable recommendations for size reduction
- 🔧 **Multi-Bundler Support**: Works with Webpack, Vite, Rollup, esbuild, and Parcel

## Installation

1. Clone or copy this plugin to your project:
```bash
cp -r bundle-size-analyzer ~/.claude/plugins/
```

2. Or install via npm:
```bash
npm install --save-dev @claude-code/bundle-size-analyzer
```

## Usage

This plugin provides the following commands:

### `/analyze-bundle`
Analyze bundle sizes and composition.
```bash
/analyze-bundle                    # Analyze default bundle
/analyze-bundle dist/app.js        # Analyze specific file
/analyze-bundle --format html --output report.html  # Generate HTML report
```

### `/tree-shake`
Find and remove unused code.
```bash
/tree-shake src/                   # Find unused exports
/tree-shake --fix                  # Auto-apply safe optimizations
/tree-shake --side-effects         # Analyze with side-effect detection
```

### `/compare-bundles`
Compare bundle sizes across builds.
```bash
/compare-bundles main              # Compare to main branch
/compare-bundles --commits 5       # Compare last 5 commits
/compare-bundles origin/main --format json --output comparison.json  # Generate comparison report
```

### `/export-report`
Generate detailed analysis reports.
```bash
/export-report --format html --template full        # Generate comprehensive HTML report
/export-report --template executive --format pdf    # Generate executive summary PDF
/export-report --format csv                         # Generate CSV for spreadsheet analysis
```

## Quick Start

### Analyze Your Bundle

```bash
# Analyze default bundle
/analyze-bundle

# Analyze specific file
/analyze-bundle dist/app.js

# Generate HTML report
/analyze-bundle --format html --output report.html
```

### Find Tree-Shaking Opportunities

```bash
# Find unused exports
/tree-shake src/

# Auto-apply safe optimizations
/tree-shake --fix

# Analyze with side-effect detection
/tree-shake --side-effects
```

### Compare Bundle Sizes

```bash
# Compare to main branch
/compare-bundles main

# Compare last 5 commits
/compare-bundles --commits 5

# Generate comparison report
/compare-bundles origin/main --format json --output comparison.json
```

### Generate Reports

```bash
# Generate comprehensive HTML report
/export-report --format html --template full

# Generate executive summary PDF
/export-report --template executive --format pdf

# Generate CSV for spreadsheet analysis
/export-report --format csv
```

## Commands

| Command | Description |
|---------|-------------|
| `/analyze-bundle` | Analyze bundle sizes and composition |
| `/tree-shake` | Find and remove unused code |
| `/compare-bundles` | Compare bundle sizes across builds |
| `/export-report` | Generate detailed analysis reports |

## Configuration

### Claude Settings

```json
{
  "bundleAnalyzer": {
    "enabled": true,
    "threshold": {
      "warn": 10,
      "error": 25,
      "maxSize": 500
    },
    "bundler": "auto",
    "format": "text"
  }
}
```

### Bundler Configuration

#### Webpack

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

#### Vite

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['chart.js'],
        },
      },
    },
  },
};
```

## Use Cases

### 1. Reduce Initial Bundle Size

```bash
# Analyze current bundle
/analyze-bundle

# Find tree-shaking opportunities
/tree-shake src/ --fix

# Re-build and compare
npm run build
/compare-bundles main
```

### 2. Optimize Vendor Dependencies

```bash
# Analyze vendor chunk
/analyze-bundle dist/vendor.js --format json

# Identify large libraries
# Consider lighter alternatives (e.g., lodash → lodash-es)

# Split vendor chunks
# Update bundler config
```

### 3. Monitor Size in CI/CD

```yaml
# .github/workflows/bundle-check.yml
- name: Build and analyze
  run: |
    npm run build
    /compare-bundles origin/main --threshold 10

- name: Comment on PR
  uses: actions/github-script@v6
  with:
    script: |
      const report = require('./bundle-comparison.json');
      // Comment with size changes
```

### 4. Regular Performance Monitoring

```bash
# Weekly bundle size report
/export-report --format pdf --output reports/bundle-$(date +%Y-%m-%d).pdf
```

## Best Practices

1. **Set Size Budgets**: Define maximum bundle sizes and enforce them
2. **Monitor Trends**: Track size changes over time, not absolute values
3. **Optimize Incremental**: Focus on high-impact, low-effort wins first
4. **Test After Optimization**: Verify functionality isn't broken
5. **Consider Trade-offs**: Balance bundle size with developer experience

## Integration

### IDE Support

The plugin integrates with your editor to provide:
- Real-time bundle size feedback
- Inline warnings for large imports
- Quick fix suggestions
- Code completion optimizations

### Git Hooks

```bash
# .git/hooks/pre-commit
npm run build
/export-report --format json --output .bundle-report.json
git add .bundle-report.json
```

### CI/CD

```yaml
# GitHub Actions
- name: Check bundle size
  run: |
    npm run build
    /compare-bundles ${{ github.base_ref }}
```

## Examples

### Example 1: Reducing Lodash Usage

```javascript
// BEFORE: 72KB
import _ from 'lodash';
const result = _.map(data, fn);

// AFTER: 2KB (with lodash-es)
import { map } from 'lodash-es';
const result = map(data, fn);
```

### Example 2: Lazy Loading

```javascript
// BEFORE: 45KB loaded eagerly
import { Chart } from 'chart.js';

// AFTER: 45KB loaded on demand
const Chart = await import('chart.js');
```

### Example 3: Code Splitting

```javascript
// BEFORE: Single 300KB bundle

// AFTER: Three 100KB chunks
// vendor.js - React, libraries
// main.js - Application code
// charts.js - Chart library (lazy loaded)
```

## Troubleshooting

### Source Maps Not Found

Ensure your bundler generates source maps:
```javascript
// webpack.config.js
devtool: 'production-source-map'
```

### Tree-Shaking Not Working

1. Use ES modules (`import`/`export`)
2. Enable production mode
3. Mark pure functions with `/* #__PURE__ */`
4. Configure `"sideEffects": false` in package.json

### Inaccurate Size Analysis

1. Ensure build is in production mode
2. Check that minification is enabled
3. Verify source maps are generated
4. Clear bundler cache and rebuild

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Support

- Issues: [GitHub Issues](https://github.com/cbuntingde/claude-plugins-dev/issues)
- Documentation: [Full Docs](https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/bundle-size-analyzer#readme)
- Discussions: [GitHub Discussions](https://github.com/cbuntingde/claude-plugins-dev/discussions)

---

**Plugin Author**: cbuntingde
**Version**: 1.0.0
**Homepage**: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/bundle-size-analyzer
