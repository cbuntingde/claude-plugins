---
description: Scan all project dependencies for security vulnerabilities, maintainer issues, and bloat
usage: "/scan-dependencies [--severity low|moderate|high|critical] [--include-dev]"
examples:
  - "/scan-dependencies"
  - "/scan-dependencies --severity critical"
  - "/scan-dependencies --include-dev"
arguments:
  - name: severity
    description: Minimum severity level to report (low, moderate, high, critical)
    required: false
    default: moderate
  - name: include-dev
    description: Include dev dependencies in scan
    required: false
    type: boolean
    default: false
---

# Scan Dependencies

Comprehensive dependency safety scan that goes beyond basic vulnerability checking.

## What It Checks

- **Security vulnerabilities** from npm audit, Snyk, and OSV databases
- **Maintainer status** - abandoned packages, inactive maintainers
- **Corporate acquisitions** - packages acquired by companies with poor track records
- **License compliance** - problematic or incompatible licenses
- **Dependency bloat** - packages that pull in excessive dependencies
- **Supply chain risks** - typosquatting, maintainer account compromises

## Output Format

The scan generates a categorized report:

```
🔴 CRITICAL (3 issues)
├─ lodash@4.17.20 - Prototype pollution (CVE-2021-23337)
├─ request@2.88.2 - Maintainer abandoned, deprecated package
└─ colors@1.4.0 - Maintainer account compromised

🟡 WARNINGS (7 issues)
├─ moment@2.29.4 - 75 dependencies (bloat warning)
├─ babel-preset-env@7.8.0 - Deprecated, use @babel/preset-env
└─ ...

✅ SAFE (142 packages)

📊 SUMMARY
- Total dependencies: 152
- Critical issues: 3
- Warnings: 7
- Recommendation: Update lodash to 4.17.21, replace request with axios
```

## Automated Actions

When critical issues are found, the scanner will:
1. Show affected files in your codebase
2. Suggest safer alternatives
3. Create a dependency upgrade plan
4. Offer to generate fix commits

## See Also

- `/check-package <package>` - Check a specific package before installing
- `/analyze-bloat` - Analyze dependency bloat in detail
- `/maintainer-status` - Check maintainer trustworthiness
