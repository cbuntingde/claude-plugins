---
description: Automatically scan project dependencies for known vulnerabilities, outdated packages, and security advisories
invocation:
  triggers:
    - "scan.*dependencies"
    - "check.*packages"
    - "audit.*deps"
    - "vulnerability.*database"
  priority: medium
---

# Dependency Scanner Skill

Autonomously scans project dependencies for known security vulnerabilities, CVEs, and recommended updates. Activates when dependency files are modified or when dependency security is mentioned.

## When this skill activates

- Package manager files are modified (package.json, requirements.txt, Gemfile, etc.)
- Lock files are updated (package-lock.json, yarn.lock, Pipfile.lock, etc.)
- User mentions dependencies, packages, vulnerabilities, or outdated packages
- New dependencies are added to the project
- CI/CD pipelines require security validation
- Deployment preparation requires dependency verification

## What it scans

### Package managers supported
- **JavaScript/TypeScript**: npm, yarn, pnpm (package.json, package-lock.json, yarn.lock)
- **Python**: pip, pipenv, poetry (requirements.txt, Pipfile, poetry.lock, setup.py)
- **Ruby**: bundler (Gemfile, Gemfile.lock)
- **PHP**: composer (composer.json, composer.lock)
- **Java**: Maven, Gradle (pom.xml, build.gradle, gradle.lock)
- **Go**: go modules (go.mod, go.sum)
- **Rust**: Cargo (Cargo.toml, Cargo.lock)
- **.NET**: NuGet (packages.config, .csproj)

### Vulnerability sources
- npm Security Advisory Database
- GitHub Advisory Database (GHSA)
- PyPI Security Reports
- RubySec Advisory Database
- Snyk Vulnerability Database
- OSS Index by Sonatype
- NVD (National Vulnerability Database)
- Language-specific security advisories

### Scan types
1. **Direct dependencies**: Packages explicitly listed in manifest
2. **Transitive dependencies**: Sub-dependencies of direct packages
3. **Outdated packages**: Packages with available updates
4. **License compliance**: Problematic or non-compliant licenses
5. **Supply chain security**: Malicious or compromised packages

## Analysis approach

1. **Parse dependency files**: Extract package names and versions
2. **Build dependency tree**: Map transitive dependencies
3. **Query vulnerability databases**: Check for known CVEs
4. **Version comparison**: Identify outdated packages
5. **License analysis**: Check for problematic licenses
6. **Severity assessment**: Rate findings by CVSS score
7. **Fix recommendations**: Identify safe versions that fix vulnerabilities

## Output format

```markdown
## 📦 Dependency Security Scan

### Summary
- Total packages: X (Y direct, Z transitive)
- Vulnerabilities: A critical, B high, C medium, D low
- Outdated packages: E

### Critical Vulnerabilities
[Package name and version with CVE details]

### High Severity Vulnerabilities
[Package name and version with CVE details]

### Outdated Packages
[Packages with available updates]

### Recommendations
1. [Most critical updates]
2. [Recommended upgrades]
3. [Optional improvements]
```

## Example scan

**Input**: User modifies package.json or runs scan

**Output**:
```markdown
## 📦 Dependency Security Scan

### Summary
- Total packages: 487 (23 direct, 464 transitive)
- Vulnerabilities: 2 critical, 3 high, 7 medium
- Outdated packages: 12

### 🔴 Critical Vulnerabilities

**lodash < 4.17.21**
- Current: 4.17.20
- Vulnerable to: Prototype pollution (CVE-2021-23337)
- CVSS: 7.5 (HIGH)
- Fixed in: 4.17.21
- Advisory: https://github.com/advisories/GHSA-p6mc-m468-83fw
- Command: `npm install lodash@4.17.21`

**axios < 0.21.2**
- Current: 0.21.1
- Vulnerable to: SSRF (CVE-2021-3749)
- CVSS: 8.2 (HIGH)
- Fixed in: 0.21.2
- Advisory: https://github.com/advisories/GHSA-rw93-p8gm-2pch
- Command: `npm install axios@0.21.2`

### 🟡 High Severity Vulnerabilities

**minimist < 1.2.6**
- Current: 1.2.5
- Vulnerable to: Prototype pollution (CVE-2021-44906)
- CVSS: 6.5 (MEDIUM)
- Fixed in: 1.2.6
- Command: `npm install minimist@1.2.6`

### Recommendations

**Immediate Actions (Critical):**
1. Update lodash to 4.17.21:
   ```bash
   npm install lodash@4.17.21
   ```

2. Update axios to 0.21.2:
   ```bash
   npm install axios@0.21.2
   ```

**High Priority:**
3. Update minimist to 1.2.6
4. Update 7 other medium-severity packages

**Optional (Non-security):**
5. Update 12 outdated packages for latest features

### Auto-Fix Command
```bash
# Fix all critical and high vulnerabilities
npm audit fix --force

# Manual review recommended for:
- Breaking changes in major version updates
- Transitive dependency conflicts
```
```

## Automated fixing

This skill can automatically fix vulnerabilities:

```bash
# Automatic fix for safe updates
dependency-scanner --auto-fix

# Interactive mode for review
dependency-scanner --interactive

# Fix only critical/high severity
dependency-scanner --auto-fix --severity critical,high
```

## License compliance

Detects problematic licenses:

```markdown
### ⚠️ License Issues

**package-name (GPL-3.0)**
- Issue: GPL license may require disclosure of source code
- Recommendation: Review with legal team
- Alternative: MIT-licensed alternative-package

**another-package (AGPL-3.0)**
- Issue: AGPL requires network copyleft
- Recommendation: Assess compliance requirements
```

## Supply chain security

Checks for compromised packages:

```markdown
### 🚨 Supply Chain Alert

**malicious-package (1.0.0)**
- Status: Compromised package detected
- Published: 2025-12-15
- Issue: Contains cryptocurrency miner
- Action: Immediately remove this package
- Reference: https://github.com/advisories/GHSA-xxxx
```

## Configuration

Create `.dependency-rules.json`:

```json
{
  "severity": "high",
  "licenseWhitelist": ["MIT", "Apache-2.0", "BSD-3-Clause"],
  "licenseBlacklist": ["GPL-3.0", "AGPL-3.0"],
  "autoUpdate": false,
  "ignoreAdvisories": ["GHSA-xxxx-xxxx"], // GitHub IDs to ignore
  "allowedPackages": {
    "lodash": ">=4.17.21"
  }
}
```

## Integration

This skill autonomously activates when:
- Dependency files are modified
- User mentions dependency security
- CI/CD pipeline requires security checks
- Deployment validation is needed
- Package updates are being considered

Works seamlessly with:
- `/dependency-audit` command
- Vulnerability Detector agent
- Package manager audit commands (npm audit, pip-audit, etc.)
- Security hooks on dependency file changes
- CI/CD security gates
