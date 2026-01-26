---
description: Analyze dependency bloat and identify packages that pull in too many dependencies
usage: "/analyze-bloat [--threshold <number>] [--deep]"
examples:
  - "/analyze-bloat"
  - "/analyze-bloat --threshold 25"
  - "/analyze-bloat --deep"
arguments:
  - name: threshold
    description: Dependency count threshold for warnings (default: 20)
    required: false
    type: number
    default: 20
  - name: deep
    description: Include transitive dependencies analysis
    required: false
    type: boolean
    default: false
---

# Analyze Bloat

Identify packages that are pulling in more dependencies than necessary.

## Why Bloat Matters

- **Security surface area** - More dependencies = more attack vectors
- **Install time** - Excessive dependencies slow down CI/CD
- **Bundle size** - Impacts application performance
- **Maintenance burden** - More packages to update and audit
- **License compliance** - Harder to track license obligations

## Analysis Dimensions

### Direct Dependency Bloat
Packages that directly depend on too many other packages.

### Transitive Bloat
Packages that pull in large dependency trees.

### Duplicate Dependencies
Multiple versions of the same package.

### Circular Dependencies
Dependencies that depend on each other.

### Unused Dependencies
Packages installed but not imported in your code.

## Example Output

```
📊 DEPENDENCY BLOAT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 HIGH BLOAT (20+ direct deps)
├─ webpack@5.88.0
│  ├─ Direct dependencies: 47
│  ├─ Install size: 12.4 MB
│  ├─ Used in: 2 files
│  └─ Alternative: esbuild (7 deps, 3.2 MB)
│
├─ babel-preset-env@7.22.0
│  ├─ Direct dependencies: 31
│  ├─ Transitive: 247 packages
│  └─ Consider: @babel/preset-env (better maintained)

🟡 MODERATE BLOAT (10-19 direct deps)
├─ react-dom@18.2.0 (15 deps, 2.1 MB)
├─ @apollo/client@3.7.0 (13 deps, 1.8 MB)
└─ ...

📈 DUPLICATE DEPENDENCIES
├─ lodash: 4 versions found (4.17.15, 4.17.19, 4.17.20, 4.17.21)
├─ debug: 3 versions found
└─ semver: 4 versions found

🗑️  UNUSED (found 8)
├─ @types/jest (not imported)
├─ nodemon (dev dependency, never used)
└─ ... (run with --list-unused for full list)

💡 RECOMMENDATIONS
1. Replace webpack with esbuild (saves 9 MB, 40 deps)
2. Deduplicate lodash versions (save 1.2 MB)
3. Remove unused dev dependencies (save 8 deps)
4. Consider replacing moment with date-fns (save 70 deps)

Total potential savings: 18.2 MB, 93 dependencies
```

## Bloat Reduction Strategies

1. **Replace heavy alternatives**
   - webpack → esbuild
   - babel → swc
   - moment → date-fns or luxon
   - lodash → lodash-es or native methods

2. **Enable tree-shaking**
   - Use ES modules
   - Check for "sideEffects": false in package.json
   - Use module bundlers with tree-shaking

3. **Remove duplicates**
   - Use `npm dedupe`
   - Check for conflicting version ranges
   - Use resolution strategies

4. **Audit regularly**
   - Run this command monthly
   - Check after major version updates
   - Review before releases

## Cost Analysis

Each dependency above your threshold incurs:
- **Security risk**: 2.3% chance of CVE per year (average)
- **Update burden**: 15 minutes per month (maintenance)
- **Install time**: +200ms per dependency (average)
- **Storage**: +150KB on average (varies widely)

## See Also

- `/scan-dependencies` - Full dependency security scan
- `/check-package` - Check bloat before installing
