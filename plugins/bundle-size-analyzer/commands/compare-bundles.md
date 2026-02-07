---
description: Compare bundle sizes between different builds or commits
---

# Compare Bundles

Compare bundle sizes across different builds, commits, or time periods to track size changes and detect regressions.

## Usage

```
/compare-bundles [baseline] [current] [options]
```

### Arguments

- `baseline` (optional): Path/commit/branch for baseline bundle. Defaults to `main` branch or last release.
- `current` (optional): Path/commit/branch for current bundle. Defaults to current working directory.
- `--format <type>`: Output format - `text`, `json`, `html`, or `markdown`. Default: `text`
- `--threshold <percentage>`: Warning threshold for size increase (percentage). Default: 10
- `--diff`: Show detailed diff of module changes
- `--trend`: Analyze size trends over multiple builds

### Options

- `-b, --baseline <path>`: Explicit baseline path
- `-c, --current <path>`: Explicit current path
- `-o, --output <file>`: Save comparison to file
- `--ignore <pattern>`: Ignore modules matching pattern
- `--commits <n>`: Compare last N commits
- `--tag`: Compare against latest git tag
- `--branch <name>`: Compare against specific branch

## Examples

**Compare current to main branch:**
```
/compare-bundles main
```

**Compare with detailed diff:**
```
/compare-bundles v1.0.0 HEAD --diff
```

**Compare last 5 commits:**
```
/compare-bundles --commits 5 --trend
```

**Compare with custom threshold:**
```
/compare-bundles origin/main --threshold 5
```

**Generate HTML comparison report:**
```
/compare-bundles --format html --output comparison.html
```

**Ignoring node_modules:**
```
/compare-bundles --ignore "node_modules/**"
```

## Output

The comparison provides:

### Size Changes
- **Total bundle size**: Overall size change (bytes and percentage)
- **Gzip size**: Compressed size comparison
- **Module count**: Number of modules added/removed
- **Chunk breakdown**: Per-chunk size changes

### Detailed Diff
- **Added modules**: New dependencies and their sizes
- **Removed modules**: Deleted code and size savings
- **Grown modules**: Existing modules that increased in size
- **Shrunk modules**: Existing modules that decreased in size
- **Changed imports**: Import pattern changes affecting size

### Regression Detection
- **Size increases**: Modules exceeding threshold
- **New large dependencies**: Big new additions
- **Unused additions**: Code added but not imported
- **Compression ratio**: Changes in compressibility

### Trend Analysis
- **Historical data**: Size changes over commits
- **Growth rate**: Average size increase per commit
- **Predictions**: Projected size if trend continues
- **Outliers**: Unusual size changes

## Report Formats

### Text Output
```
Bundle Size Comparison
======================

Baseline:  main (abc1234)
Current:   feature/add-analytics (def5678)

Total Size:     245.3 KB → 267.8 KB (+22.5 KB, +9.2%)
Gzip Size:      68.1 KB  → 72.3 KB  (+4.2 KB,  +6.2%)
Module Count:   342      → 358      (+16)

⚠️  Size increase exceeds 10% threshold

Largest Changes:
  + analytics/lib.js       +18.2 KB (NEW)
  + chart.js               +12.1 KB (NEW)
  - lodash/debounce.js     -2.3 KB  (REMOVED)
  ~ utils/helpers.js       +1.2 KB  (5.4 KB → 6.6 KB)
```

### JSON Output
```json
{
  "baseline": { "commit": "abc1234", "size": 245300 },
  "current": { "commit": "def5678", "size": 267800 },
  "diff": {
    "totalBytes": 22500,
    "percentage": 9.2,
    "added": [{ "name": "analytics/lib.js", "size": 18200 }],
    "removed": [{ "name": "lodash/debounce.js", "size": 2300 }],
    "changed": [{ "name": "utils/helpers.js", "before": 5400, "after": 6600 }]
  }
}
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Check bundle size
  run: npx bundle-size-check

- name: Compare bundles
  run: |
    /compare-bundles origin/main --threshold 10 \
      --format json --output bundle-comparison.json

- name: Comment PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v6
  with:
    script: |
      const report = require('./bundle-comparison.json');
      const body = generateBundleComment(report);
      github.rest.issues.createComment({ ...context.repo, body });
```

### Size Budget Configuration
```json
// .size-limit.json
{
  "limit": "250 KB",
  "path": "dist/**/*.js",
  "gzip": true,
  "fail": true
}
```

## Regression Prevention

1. **Set thresholds**: Configure acceptable size increase percentage
2. **PR checks**: Automatically compare in CI/CD pipelines
3. **Baseline branches**: Compare against stable branches
4. **Trend monitoring**: Track growth over time
5. **Alerting**: Get notified of significant changes

## Best Practices

1. **Baseline on releases**: Use tagged releases as baselines
2. **Monitor trends**: Check size changes over time, not single commits
3. **Investigate regressions**: Understand why size increased
4. **Set budgets**: Define maximum acceptable bundle sizes
5. **Document decisions**: Explain intentional size increases
6. **Regular reviews**: Check bundle size in PR reviews

## See Also

- `/analyze-bundle` - Analyze current bundle composition
- `/tree-shake` - Find and remove unused code
- `/export-report` - Generate comprehensive size report
