# Bundle Size Analyzer - Quick Start Guide

Get started with the Bundle Size Analyzer plugin in 5 minutes.

## Installation

### Step 1: Install the Plugin

```bash
# Option A: Copy to Claude plugins directory
cp -r bundle-size-analyzer ~/.claude/plugins/

# Option B: Install via npm
npm install --save-dev @claude-code/bundle-size-analyzer
```

### Step 2: Verify Installation

```bash
# Check if plugin is loaded
claude plugin list

# Should see: bundle-size-analyzer ✓
```

### Step 3: Install Analysis Tools (Optional)

```bash
# Run the installation script
./bundle-size-analyzer/scripts/install-tools.sh
```

## Basic Usage

### Analyze Your First Bundle

```bash
# Navigate to your project
cd my-project

# Build your project (if not already built)
npm run build

# Analyze the bundle
/analyze-bundle
```

**Output**:
```
📊 Bundle Analysis
==================

Total Size:     287 KB
Gzip Size:      72 KB
Modules:        354

Largest Modules:
  vendor.js          156 KB (54%)
  main.js            98 KB  (34%)
  charts.js          33 KB  (11%)

💡 Optimization: /tree-shake can save ~25 KB
```

### Find Tree-Shaking Opportunities

```bash
# Analyze your source code
/tree-shake src/

# Auto-apply safe fixes
/tree-shake src/ --fix
```

**Output**:
```
🌳 Tree-Shaking Analysis
========================

Unused Exports: 12
  • src/utils/helpers.ts: unusedHelper()
  • src/components/Old.tsx: OldComponent

Dead Code: 847 bytes
  • src/app.ts:23 - unreachable after return

Potential Savings: 15.2 KB

Apply fixes? [Y/n]
```

### Compare Bundle Sizes

```bash
# Compare to main branch
/compare-bundles main
```

**Output**:
```
📊 Bundle Comparison
====================

Baseline:  main (abc1234)
Current:   feature/new-ui (def5678)

Size: 287 KB → 312 KB (+25 KB, +8.7%)

⚠️  Size increase exceeds 5% threshold

Changes:
  + new-ui-library.js    +22 KB (NEW)
  - old-components.js    -8 KB  (REMOVED)
```

## Common Scenarios

### Scenario 1: Reduce Initial Bundle Size

**Problem**: Your bundle is too large and slow to load.

**Solution**:
```bash
# 1. Analyze current bundle
/analyze-bundle dist/main.js

# 2. Find unused code
/tree-shake src/ --fix

# 3. Check for large dependencies
/analyze-bundle --format json | jq '.largest_modules'

# 4. Re-build and compare
npm run build
/compare-bundles HEAD~1
```

### Scenario 2: Setup CI/CD Bundle Monitoring

**Problem**: You want to prevent bundle size regressions in PRs.

**Solution**: Add to `.github/workflows/bundle-check.yml`:

```yaml
name: Bundle Size Check

on: [pull_request]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: /compare-bundles origin/main --threshold 10
```

### Scenario 3: Optimize Vendor Dependencies

**Problem**: `node_modules` is bloating your bundle.

**Solution**:
```bash
# 1. Analyze vendor chunk
/analyze-bundle dist/vendor.js

# 2. Find large libraries
# Look for libraries > 50KB

# 3. Consider alternatives
# - moment (67KB) → date-fns (varies by import)
# - lodash (72KB) → lodash-es (tree-shakeable)
# - axios (15KB) → fetch (native)

# 4. Update imports
# BEFORE: import _ from 'lodash'
# AFTER:  import { debounce } from 'lodash-es'
```

### Scenario 4: Generate Weekly Reports

**Problem**: You want to track bundle size trends over time.

**Solution**:
```bash
# Generate weekly report
/export-report --format pdf --template executive \
  --output reports/bundle-$(date +%Y-%m-%d).pdf

# Add to cron (optional)
0 9 * * 1 /export-report --format pdf --output /reports/weekly.pdf
```

## Configuration

### Basic Configuration

Create `.claude/config.json`:

```json
{
  "bundleAnalyzer": {
    "enabled": true,
    "threshold": {
      "warn": 10,
      "error": 25
    },
    "format": "text"
  }
}
```

### Advanced Configuration

```json
{
  "bundleAnalyzer": {
    "enabled": true,
    "mode": "continuous",
    "thresholds": {
      "warn": 5,
      "error": 15,
      "maxBundle": 300
    },
    "ignores": [
      "node_modules/react/**",
      "node_modules/react-dom/**"
    ],
    "bundler": "auto",
    "sourceMaps": true
  }
}
```

## Bundler-Specific Setup

### Webpack

Ensure your `webpack.config.js` has:

```javascript
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: true,
  },
  devtool: 'production-source-map',
};
```

### Vite

Ensure your `vite.config.js` has:

```javascript
export default {
  build: {
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
};
```

### Rollup

Ensure your `rollup.config.js` has:

```javascript
export default {
  output: {
    sourcemap: true,
    manualChunks: {
      vendor: ['react', 'react-dom'],
    },
  },
};
```

## Tips and Tricks

### 1. Set Realistic Thresholds

```bash
# Don't be too strict initially
/compare-bundles main --threshold 20  # 20% threshold

# Tighten over time
/compare-bundles main --threshold 10  # 10% threshold
/compare-bundles main --threshold 5   # 5% threshold
```

### 2. Focus on High-Impact Wins

```bash
# Show only largest modules
/analyze-bundle --format json | \
  jq '.modules | sort_by(.size) | reverse | .[0:10]'
```

### 3. Use Multiple Formats

```bash
# HTML for detailed review
/analyze-bundle --format html --output detailed.html

# JSON for automation
/analyze-bundle --format json --output metrics.json

# Markdown for documentation
/analyze-bundle --format markdown --output REPORT.md
```

### 4. Track History

```bash
# Save baseline
/analyze-bundle --format json > baseline.json

# Compare later
/compare-bundles --baseline baseline.json
```

## Troubleshooting

### "Bundler not detected"

**Solution**: Specify bundler explicitly:
```bash
/analyze-bundle --bundler webpack
```

### "Source map not found"

**Solution**: Generate source maps:
```javascript
// webpack.config.js
module.exports = {
  devtool: 'production-source-map',
};
```

### "Tree-shaking not working"

**Solution**: Ensure you're using ES modules:
```javascript
// ✓ Good - ES modules
import { fn } from 'lib'
export function helper() {}

// ✗ Bad - CommonJS
const lib = require('lib')
module.exports = { helper }
```

## Next Steps

1. ✅ Run `/analyze-bundle` on your project
2. ✅ Fix issues with `/tree-shake --fix`
3. ✅ Set up `/compare-bundles` in CI/CD
4. ✅ Configure size thresholds
5. ✅ Generate regular reports with `/export-report`

## Additional Resources

- [Full Documentation](../README.md)
- [Plugin Structure](./PLUGIN_STRUCTURE.md)
- [Troubleshooting Guide](../README.md#troubleshooting)

## Support

Need help? Open an issue at:
https://github.com/your-org/bundle-size-analyzer/issues
