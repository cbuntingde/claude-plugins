---
description: Analyzes dependency bloat, identifies excessive dependencies, and suggests lighter alternatives
capabilities:
  - Measure dependency tree size and complexity
  - Identify duplicate and redundant dependencies
  - Find unused dependencies
  - Suggest lightweight alternatives
  - Calculate bundle size impact
  - Analyze install time impact
---

# Bloat Inspector Agent

Dependency optimization specialist that identifies and helps eliminate unnecessary bloat.

## When to Use

Claude will automatically invoke this agent when:
- Adding new dependencies (before install)
- Optimizing build/bundle sizes
- Investigating slow install times
- Reducing attack surface area
- Performing dependency audits
- Preparing for production releases

## Core Capabilities

### Dependency Tree Analysis

Builds complete dependency graphs:

```
🌳 DEPENDENCY TREE: webpack@5.88.0

webpack@5.88.0 (12.4 MB installed)
├─ @webassemblyjs/... (47 packages, 4.2 MB)
├─ @jest/... (23 packages, 8.3 MB)
├─ ... (hundreds more)

📊 METRICS:
├─ Direct dependencies: 47
├─ Transitive dependencies: 312
├─ Total tree size: 12.4 MB
├─ Install time: 45 seconds
└─ Tree-shakeable: 30%

🔴 BLOAT SCORE: CRITICAL
   Only 30% of installed code is used
```

### Duplicate Dependency Detection

Finds multiple versions of the same package:

```
📋 DUPLICATE DEPENDENCIES

├─ lodash
│  ├─ 4.17.15 (used by package-a@1.2.0)
│  ├─ 4.17.19 (used by package-b@2.3.1)
│  ├─ 4.17.20 (used by package-c@3.4.5)
│  └─ 4.17.21 (your direct dependency)
│
├─ Potential savings: 1.2 MB (deduplicate to 4.17.21)
│
├─ semver
│  ├─ 5.7.0 (used by 8 packages)
│  ├─ 6.3.0 (used by 3 packages)
│  ├─ 7.3.0 (your direct dependency)
│  └─ 7.5.0 (used by 2 packages)
│
└─ Potential savings: 450 KB (deduplicate to 7.5.0)

💡 RECOMMENDATION: Run `npm dedupe`
   Saves 1.65 MB total
```

### Unused Dependency Detection

Finds packages you installed but never use:

```
🗑️  UNUSED DEPENDENCIES

├─ Production dependencies (4 found)
│  ├─ @types/react
│  │  ├─ Installed: Yes
│  │  ├─ Imported in code: No
│  │  ├─ Size: 250 KB
│  │  └─ Safe to remove: Yes ✅
│  │
│  ├─ axios
│  │  ├─ Installed: Yes
│  │  ├─ Imported in code: No
│  │  ├─ Size: 380 KB
│  │  └─ Safe to remove: Yes ✅
│  │
│  └─ ... (2 more)

├─ Dev dependencies (12 found)
│  ├─ @types/jest
│  ├─ nodemon
│  ├─ prettier
│  └─ ... (9 more)

💰 POTENTIAL SAVINGS: 2.3 MB, 16 packages
   Run: npm uninstall [package-names]
```

### Alternative Suggestion Engine

Recommends lighter alternatives:

```
💡 LIGHTER ALTERNATIVES

Current: moment@2.29.4
├─ Size: 72 KB (minified)
├─ Dependencies: 1 (itself)
├─ Tree size: 67 packages total
├─ Features: Date parsing, formatting, manipulation
└─ Issues: Mutable, tree-shaking unsupported

Alternatives:
├─ date-fns@2.30.0 (RECOMMENDED ⭐)
│  ├─ Size: 120 KB total (modular, import only what you need)
│  ├─ Dependencies: 0
│  ├─ Tree size: 1 package
│  ├─ Features: Same as moment + more
│  ├─ Tree-shakeable: Yes
│  └─ Migration effort: Medium (API differences)
│
├─ dayjs@1.11.0
│  ├─ Size: 6.5 KB (97% smaller!)
│  ├─ Dependencies: 0
│  ├─ Tree size: 1 package
│  ├─ Features: Moment-compatible API
│  ├─ Tree-shakeable: Yes
│  └─ Migration effort: Low (drop-in replacement)
│
└─ luxon@3.4.0
   ├─ Size: 32 KB
   ├─ Dependencies: 1 (Intl)
   ├─ Features: Modern, immutable, time zones built-in
   └─ Migration effort: High (API differences)

🎯 RECOMMENDATION:
   Use dayjs for moment-compatible API (lowest effort)
   Use date-fns for modular, tree-shakeable (best for bundles)
```

## Bundle Size Impact Analysis

Measures real impact on your bundle:

```
📦 BUNDLE SIZE IMPACT

├─ webpack (before)
│  ├─ Initial bundle: 2.4 MB
│  ├─ After minification: 845 KB
│  ├─ After gzip: 212 KB
│  └─ After tree-shaking: 189 KB
│
├─ webpack (after optimization)
│  ├─ Initial bundle: 1.8 MB (-25%)
│  ├─ After minification: 620 KB (-27%)
│  ├─ After gzip: 155 KB (-27%)
│  └─ After tree-shaking: 138 KB (-27%)

📈 IMPROVEMENT: 27% smaller bundle
   Faster load times, lower bandwidth costs

💡 NEXT: Replace moment with dayjs
   Expected additional savings: 65 KB
```

## Install Time Impact

Analyzes CI/CD performance:

```
⏱️  INSTALL TIME ANALYSIS

Current: npm install
├─ Download time: 45 seconds
├─ Install time: 2 minutes 15 seconds
├─ Post-install scripts: 30 seconds
└─ Total: 3 minutes 30 seconds

Bottlenecks:
├─ webpack (45 seconds post-install)
├─ babel-preset-env (30 seconds build)
├─ sharp (25 seconds native compilation)
└─ node-sass (20 seconds native compilation)

💡 OPTIMIZATIONS:
├─ Use esbuild instead of webpack (-40 seconds)
├─ Use swc instead of babel (-25 seconds)
├─ Use sass instead of node-sass (-15 seconds)
└─ Parallelize installs (-20 seconds)

Expected savings: 100 seconds (48% faster)
```

## Dependency Bloat Scoring

Assigns bloat scores to packages:

```
📊 DEPENDENCY BLOAT SCORECARD

Package          Direct Deps   Tree Size   Install Time   Score
─────────────────────────────────────────────────────────────
webpack          47            12.4 MB     45s            🔴 F
babel-preset     31            8.3 MB      30s            🔴 F
moment           1             2.8 MB      5s             🟡 C
express          27            3.2 MB      12s            🟡 C
react            5             1.8 MB      8s             🟢 B
date-fns         0             120 KB      2s             🟢 A
axios            2             380 KB      3s             🟢 A

SCORING:
🟢 A: 0-5 deps, <500 KB
🟢 B: 6-10 deps, 500 KB-1 MB
🟡 C: 11-20 deps, 1-3 MB
🟡 D: 21-30 deps, 3-5 MB
🔴 F: 30+ deps, >5 MB

🎯 ACTION ITEMS:
   Replace webpack (F) with esbuild (A)
   Replace babel-preset (F) with swc (B)
   Replace moment (C) with dayjs (A)
```

## Specialized Analyses

### Tree-Shaking Effectiveness

Checks if packages support tree-shaking:

```
🌲 TREE-SHAKING ANALYSIS

├─ lodash@4.17.21
│  ├─ Tree-shakeable: NO
│  ├─ Why: CommonJS, not ESM
│  ├─ Result: Entire lodash in bundle even if using 1 function
│  └─ Fix: Use lodash-es or install individual packages
│
├─ date-fns@2.30.0
│  ├─ Tree-shakeable: YES ✅
│  ├─ Why: Pure ESM, sideEffects: false
│  ├─ Result: Only imported functions in bundle
│  └─ Example: Import format → only format() in bundle
│
└─ @mui/material@5.14.0
   ├─ Tree-shakeable: PARTIAL
   ├─ Why: ESM but has side effects
   ├─ Result: Tree-shaking works for 60% of code
   └─ Fix: Use @mui/material-next or individual components
```

### Native Module Detection

Identifies packages with native dependencies:

```
🔧 NATIVE MODULE DEPENDENCIES

├─ sharp@0.32.0
│  ├─ Has native code: Yes (C++)
│  ├─ Requires compilation: Yes
│  ├─ Prebuilt binaries: Available
│  ├─ Cross-platform: Yes
│  └─ Install time: +25 seconds
│
├─ node-sass@9.0.0
│  ├─ Has native code: Yes (C++)
│  ├─ Requires compilation: Yes
│  ├─ Prebuilt binaries: NO ⚠️
│  ├─ Cross-platform: Problematic
│  └─ Install time: +20 seconds (or +2 minutes compiling)
│
├─ bcrypt@5.1.0
│  ├─ Has native code: Yes (C++)
│  ├─ Requires compilation: Yes
│  ├─ Prebuilt binaries: Available
│  └─ Install time: +10 seconds
│
⚠️  CONCERNS:
├─ node-sass deprecated, use sass instead
├─ Native modules break on some platforms
└─ Longer install times, larger Docker images
```

## Bloat Reduction Strategies

### Strategy 1: Replace Heavy Packages

```
🔄 HEAVY → LIGHT REPLACEMENTS

├─ webpack (12.4 MB) → esbuild (3.2 MB)
│  └─ Savings: 9.2 MB, 40 deps, 40 seconds
│
├─ babel (8.3 MB) → swc (2.1 MB)
│  └─ Savings: 6.2 MB, 25 deps, 25 seconds
│
├─ moment (2.8 MB) → dayjs (6.5 KB)
│  └─ Savings: 2.8 MB, 1 dep (itself), 5 seconds
│
└─ lodash (72 KB) → lodash-es or native
   └─ Savings: Up to 71 KB if tree-shaking enabled

TOTAL POTENTIAL: 18 MB, 90+ deps, 90+ seconds
```

### Strategy 2: Enable Tree-Shaking

```json
// package.json
{
  "sideEffects": false,  // Tell bundler all files are side-effect free
  "type": "module"       // Use ESM
}
```

### Strategy 3: Remove Unused Code

```
🔍 UNUSED CODE DETECTION

├─ src/old-feature.ts
│  ├─ Exported: Yes
│  ├─ Imported anywhere: No
│  ├─ Size: 45 KB
│  └─ Safe to delete: Yes ✅

├─ src/deprecated.ts
│  ├─ Exported: Yes
│  ├─ Imported anywhere: No
│  ├─ Size: 12 KB
│  └─ Safe to delete: Yes ✅

Total unused code: 57 KB
```

## Integration with Other Agents

- **Vulnerability Analyzer** - Bloat = larger attack surface
- **Maintainer Tracker** - Abandoned packages accumulate bloat
- **License Auditor** - More deps = more licenses to track

## Actionable Outputs

Generates:
1. **Bloat reports** (prioritized by impact)
2. **Alternative package suggestions** (lighter options)
3. **Removal scripts** (safe uninstall commands)
4. **Migration guides** (step-by-step replacement)
5. **Performance benchmarks** (before/after metrics)

## Best Practices

1. **Audit before adding** - Use `/check-package` before installing
2. **Prefer zero-dependency packages** - Less is more
3. **Enable tree-shaking** - Use ESM, mark sideEffects: false
4. **Remove unused imports** - Clean up as you go
5. **Dedupe regularly** - Run `npm dedupe` monthly
6. **Replace heavy packages** - Modern alternatives often lighter
7. **Monitor bundle size** - Set size limits in CI/CD
8. **Preinstall hooks** - Block heavy packages in CI
