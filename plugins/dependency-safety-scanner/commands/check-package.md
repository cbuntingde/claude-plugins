---
description: Check a specific package for safety issues before installing
usage: "/check-package <package-name>[@version]"
examples:
  - "/check-package lodash"
  - "/check-package express@4.18.2"
  - "/check-package @types/node@20.0.0"
arguments:
  - name: package-name
    description: Package name with optional version
    required: true
  - name: version
    description: Specific version to check (defaults to latest)
    required: false
---

# Check Package

Evaluate a package's safety profile before you add it to your project.

## Safety Dimensions

### 1. Security Posture
- Known vulnerabilities (CVEs)
- Security advisories
- Malicious code reports
- Typosquatting risks

### 2. Maintainer Trustworthiness
- Account age and activity
- Package update frequency
- Response time to issues
- Other packages maintained

### 3. Corporate Status
- Recent acquisitions
- Maintainer employment changes
- License changes post-acquisition
- Terms of service shifts

### 4. Dependency Impact
- Direct dependency count
- Transitive dependency tree
- Installation size
- Build time impact

### 5. Community Health
- Download trends
- Open issues
- PR response time
- Fork count and alternatives

## Example Output

```
📦 PACKAGE: lodash@4.17.21
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SECURITY
   No known vulnerabilities in current version
   Last audit: 2 hours ago

🟢 MAINTAINER
   Active maintainer (jdalton)
   15+ years on npm, 50+ packages
   Average issue response: 4 hours

⚠️  BLOAT
   Direct dependencies: 0
   Install size: 71 KB
   Tree-shakeable: Yes

📊 COMMUNITY
   Weekly downloads: 45M
   Open issues: 12 (responded within 24h)
   Alternatives: remeda, lodash-es

🎯 RECOMMENDATION: SAFE TO INSTALL
   Consider lodash-es for tree-shaking benefits
```

## Risk Indicators

🔴 **DO NOT INSTALL**
- Active CVEs with no patch
- Malicious code detected
- Maintainer account compromised
- Abandoned with critical issues

🟡 **PROCEED WITH CAUTION**
- Recent acquisition
- Inactive maintainer
- Excessive dependency bloat
- License concerns

🟢 **SAFE TO INSTALL**
- No known issues
- Active maintainer
- Reasonable dependencies
- Permissive license

## Integration with Install

This command runs automatically when you try to install a package with hooks enabled. It will block installation of packages marked with 🔴.

## See Also

- `/scan-dependencies` - Scan all current dependencies
- `/analyze-bloat` - Analyze dependency bloat
