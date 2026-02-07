---
name: bundle-analyzer
description: Automatically analyzes bundle sizes and suggests tree-shaking optimizations during development
trigger:
  - "bundle"
  - "bundle size"
  - "tree-shake"
  "tree shaking"
  - "large bundle"
  - "optimize bundle"
  - "bundle analysis"
  - "reduce bundle"
  - "chunk size"
  - "webpack"
  - "vite"
  - "rollup"
  - "esbuild"
  - "minify"
categories:
  - performance
  - optimization
  - bundling
---

# Bundle Analyzer Skill

Continuously monitors bundle sizes and proactively suggests tree-shaking and optimization opportunities during development. Automatically detects bundle bloat, unused dependencies, and configuration issues that impact bundle size.

## Automatic Triggers

This skill activates when:

1. **Installing large dependencies**: Adding packages >100KB to node_modules
2. **Importing heavy libraries**: Using large libraries without tree-shaking
3. **Building bundles**: Analyzing build output for size issues
4. **Modifying bundler config**: Changes to webpack/vite/rollup configs
5. **Adding new imports**: Detecting inefficient import patterns
6. **Code splitting opportunities**: Identifying split points
7. **Unused code patterns**: Dead code or unreachable branches

## Analysis Patterns

### Heavy Library Detection

Detects when importing large libraries and suggests alternatives:

**Example Detection**:
```javascript
// DETECTED: Importing entire lodash library (72KB minified)
import _ from 'lodash';
const chunk = _.chunk(array, 3);

// SUGGESTION: Use lodash-es or individual methods
import { chunk } from 'lodash-es'; // Tree-shakeable (2KB)
// OR
import chunk from 'lodash/chunk'; // Individual method (3KB)
```

**Common Replacements**:
| Instead of | Use | Savings |
|------------|-----|---------|
| `moment` | `date-fns` or `dayjs` | ~70KB |
| `lodash` | `lodash-es` or native methods | ~50KB |
| `axios` | `fetch` or `ky` | ~15KB |
| `classnames` | Template literals | ~2KB |

### Import Pattern Analysis

Identifies inefficient import patterns:

```javascript
// BEFORE: Importing entire library for one function
import * as Utils from 'huge-lib';

// SUGGESTION: Named import for tree-shaking
import { specificFunction } from 'huge-lib';

// BEFORE: Deep import that prevents bundler optimization
import { Button } from '@mui/material'; // Loads entire MUI

// SUGGESTION: Use path-based imports if library supports
import Button from '@mui/material/Button'; // Tree-shakeable
```

### Unused Code Detection

Finds and suggests removal of unused code:

```javascript
// DETECTED: Exported but never used
export function legacyHelper() { /* ... */ } // ❌ Unused
export function activeHelper() { /* ... */ } // ✅ Used

// SUGGESTION: Remove unused exports
export function activeHelper() { /* ... */ }
```

### Side Effect Analysis

Identifies code that prevents tree-shaking:

```javascript
// BEFORE: Side effects prevent tree-shaking
// polyfill.js
Array.prototype.myMethod = function() { /* ... */ };

// SUGGESTION: Isolate side effects or mark as pure
// package.json
{
  "sideEffects": [
    "polyfill.js"
  ]
}
```

### Code Splitting Opportunities

Suggests strategic split points:

```javascript
// DETECTED: Heavy module loaded eagerly
import { Chart } from 'chart.js'; // 80KB

function renderDashboard() {
  const chart = new Chart(ctx, config);
}

// SUGGESTION: Lazy load non-critical code
async function renderDashboard() {
  const { Chart } = await import('chart.js');
  const chart = new Chart(ctx, config);
}
```

### Bundle Configuration Issues

Detects suboptimal bundler configurations:

**Webpack**:
```javascript
// DETECTED: Missing optimizations
module.exports = {
  // Missing mode: 'production'
  // Missing optimization: { usedExports: true }
};

// SUGGESTION: Enable optimizations
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: true,
  },
};
```

**Vite**:
```javascript
// DETECTED: Not using manual chunks
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        // No manual chunks defined
      }
    }
  }
}

// SUGGESTION: Split vendor code
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['chart.js', 'chartjs-plugin-datalabels'],
        }
      }
    }
  }
}
```

## Real-Time Monitoring

### During Installation
```
⚠️  Installing large dependency
   Package: @mega/library
   Size: 145KB (minified)
   Impact: Will increase bundle by 12%

   Consider:
   ✓ @mini/library (35KB) - Similar API
   ✓ Custom implementation (5KB)
```

### During Import
```
💡 Import optimization available
   File: src/components/Dashboard.tsx:15
   Import: import * as Chart from 'chart.js'

   Potential savings: 65KB (81% reduction)
   Quick fix: import { Chart } from 'chart.js/auto'
```

### During Build
```
📊 Build analysis complete
   Bundle: dist/main.js (287KB)
   Issues found:
   - 12KB unused lodash methods
   - 8KB duplicate utility functions
   - 22KB analytics library (not tree-shakeable)

   Quick fixes available. Run /tree-shake --fix
```

## Proactive Suggestions

### High Priority (>50KB potential savings)
```
🔴 HIGH: Large unused dependency detected
   Location: package.json
   Issue: 'moment' imported but only date formatting used

   Fix: Replace with date-fns format function
   Savings: ~67KB
   Difficulty: Easy (5 min)

   Apply? [Y/n]
```

### Medium Priority (10-50KB potential savings)
```
🟡 MEDIUM: Code splitting opportunity
   Location: src/routes/Admin.tsx
   Issue: Admin routes loaded with main bundle (45KB)

   Fix: Lazy load admin routes
   Savings: ~45KB from initial load
   Difficulty: Easy (10 min)

   Apply? [Y/n]
```

### Low Priority (<10KB potential savings)
```
🟢 LOW: Unused imports
   Location: src/utils/helpers.ts
   Issue: 3 unused imports (8KB combined)

   Fix: Remove unused imports
   Savings: ~8KB
   Difficulty: Trivial (1 min)

   Apply? [Y/n]
```

## Analysis Modes

### Quick Scan
- Checks import patterns
- Identifies large dependencies
- Suggests quick wins
- Runs in <1 second

### Deep Analysis
- Full dependency graph
- Side effect detection
- Dead code elimination
- Compression simulation
- Runs in 5-30 seconds depending on project size

### Continuous Monitoring
- Analyzes on every file change
- Tracks bundle size trends
- Alerts on regressions
- Minimal overhead (<50ms per change)

## Integration

### IDE Support
Real-time feedback in editor:
- Inline warnings for large imports
- Quick fixes for optimization
- Progress indicators for analysis
- Bundle size annotations

### Build Integration
- Pre-build bundle size check
- Post-build analysis report
- CI/CD regression detection
- Automated PR comments

### Git Hooks
- Pre-commit: Check for bundle bloat
- Pre-push: Verify size thresholds
- Post-merge: Update baseline metrics

## Configuration

```json
{
  "bundleAnalyzer": {
    "enabled": true,
    "mode": "continuous",
    "thresholds": {
      "warn": 10,     // Warn at 10% increase
      "error": 25,    // Error at 25% increase
      "maxBundle": 500 // Maximum bundle size in KB
    },
    "ignores": [
      "node_modules/react/**",
      "dist/vendor/**"
    ],
    "suggestions": {
      "autoApply": false,
      "requireConfirmation": true,
      "difficultyFilter": "easy"
    }
  }
}
```

## Best Practices

1. **Monitor continuously**: Don't wait until deployment to check bundle size
2. **Fix early**: Address bloat when introduced, not later
3. **Set budgets**: Define maximum bundle sizes and enforce them
4. **Measure real impact**: Test on actual devices, not just local
5. **Prioritize by impact**: Focus on largest savings first
6. **Consider trade-offs**: Bundle size vs. development time vs. maintainability

## Related Commands

- `/analyze-bundle` - Perform comprehensive bundle analysis
- `/tree-shake` - Find and remove unused code
- `/compare-bundles` - Compare bundle sizes across builds
- `/export-report` - Generate detailed size reports
