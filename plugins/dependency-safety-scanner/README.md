# Dependency Safety Scanner 🔍

Beyond basic vulnerability checking: Understand package acquisitions, maintainer abandonment, and dependency bloat before adding dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-blue)](https://code.claude.com/docs/en/plugins)

## 🎯 What It Does

Most dependency checkers only tell you about CVEs. **Dependency Safety Scanner** goes deeper:

### 🔒 Security Vulnerabilities
- Known CVEs and security advisories
- Exploit proof-of-concepts
- Patch availability
- Exploitability assessment (is it actually reachable in your code?)

### 👤 Maintainer Intelligence
- **Abandonment detection** - Packages without updates in 6+ months
- **Acquisition tracking** - When companies buy packages and change licenses
- **Responsiveness** - How fast maintainers fix issues
- **Bus factor** - Single maintainer risk assessment

### 📦 Dependency Bloat Analysis
- Packages that pull in 50+ dependencies you don't need
- Duplicate dependencies (same package, multiple versions)
- Unused dependencies detection
- Bundle size impact
- Install time impact

### 📄 License Compliance
- Incompatible licenses (GPL in MIT projects)
- Copyleft requirements (GPL, AGPL disclosure obligations)
- License change alerts
- Corporate policy compliance

## 🚀 Quick Start

### Installation

```bash
# Install the plugin
claude plugin install dependency-safety-scanner

# Or from a local directory
claude plugin install ./dependency-safety-scanner --scope project
```

## Usage

### Basic Usage

```bash
# Scan all dependencies
/scan-dependencies

# Check a specific package before installing
/check-package lodash

# Analyze dependency bloat
/analyze-bloat

# Check maintainer status
/maintainer-status express
```

## 📋 Commands

### `/scan-dependencies`

Comprehensive scan of all project dependencies.

```bash
/scan-dependencies [--severity low|moderate|high|critical] [--include-dev]
```

**Example:**
```
/scan-dependencies --severity critical

📊 DEPENDENCY SAFETY SCAN

🔴 CRITICAL (3 issues)
├─ lodash@4.17.20 - Prototype pollution (CVE-2021-23337)
├─ request@2.88.2 - Maintainer abandoned, deprecated
└─ colors@1.4.0 - Maintainer account compromised

🟡 WARNINGS (7 issues)
├─ moment@2.29.4 - 75 dependencies (bloat warning)
└─ ...

📊 SUMMARY
- Total dependencies: 152
- Critical issues: 3
- Warnings: 7
```

### `/check-package`

Evaluate a package before installing.

```bash
/check-package <package-name>[@version]
```

**Example:**
```
/check-package axios

📦 PACKAGE: axios@1.5.0

✅ SECURITY: No known vulnerabilities
🟢 MAINTAINER: Active (6 hour response time)
🟢 BLOAT: Minimal (2 deps, 380 KB)
✅ LICENSE: MIT (compatible)

🎯 RECOMMENDATION: SAFE TO INSTALL
```

### `/analyze-bloat`

Find packages pulling in excessive dependencies.

```bash
/analyze-bloat [--threshold 20] [--deep]
```

**Example output:**
```
🔴 HIGH BLOAT (20+ direct deps)
├─ webpack@5.88.0
│  ├─ Direct dependencies: 47
│  ├─ Install size: 12.4 MB
│  └─ Alternative: esbuild (7 deps, 3.2 MB)

💡 RECOMMENDATIONS
1. Replace webpack with esbuild (saves 9 MB, 40 deps)
2. Deduplicate lodash versions
```

### `/maintainer-status`

Investigate maintainer trustworthiness.

```bash
/maintainer-status <package-name>
```

## 🤖 Agents

The plugin includes specialized agents for deep analysis:

### Vulnerability Analyzer Agent
- Cross-references multiple vulnerability databases (npm, Snyk, OSV, GitHub Advisory)
- Assesses exploitability in your specific codebase
- Prioritizes fixes based on real impact

### Maintainer Tracker Agent
- Detects abandonment before it becomes a problem
- Tracks corporate acquisitions and license changes
- Evaluates bus factor and concentration risk

### Bloat Inspector Agent
- Identifies packages with excessive dependencies
- Suggests lightweight alternatives
- Calculates bundle size and install time impact

### License Auditor Agent
- Detects license incompatibilities
- Tracks copyleft obligations
- Monitors for license changes post-acquisition

## 🧩 Skills

### Dependency Safety Check Skill

Automatically activates when:
- You run `npm install`, `yarn add`, or `pnpm add`
- You ask about package safety
- You review PRs with dependency changes
- You discuss dependency issues

**How it works:**
1. Extracts package names from install commands
2. Runs comprehensive safety check
3. Displays risk assessment with recommendations
4. Blocks or warns based on risk level

## 🔗 Hooks

Automatic checks triggered by events:

### Pre-Install Hook
```bash
npm install axios
# ↓ Hook activates
# ↓ Runs safety check
# ↓ Displays report
# ↓ Asks: "Safe to proceed? [Y/n]"
```

### Post-Install Hook
After installation, runs dependency scan and updates safety status.

### Package.json Change Hook
When you modify package.json, analyzes dependency changes and risks.

## 🔌 MCP Servers

### Vulnerability Database Server
Aggregates data from:
- npm audit
- OSV (Open Source Vulnerabilities)
- Snyk vulnerability DB
- GitHub Advisory Database
- NVD (National Vulnerability Database)

### npm Audit Proxy Server
Proxies npm audit requests with intelligent caching to avoid rate limiting.

## 🎨 Use Cases

### Before Installing a Package

```bash
/check-package colors

🔴 BLOCKING INSTALLATION
   Previous maintainer pushed malicious code
   Use @colors/colors (community fork) instead
```

### During Code Review

```bash
# PR adds: "moment": "^2.29.4"

⚠️ DEPENDENCY CHANGE REVIEW

├─ Security: ✅ No vulnerabilities
├─ Maintainer: 🟡 Inactive (no updates in 8 months)
├─ License: ✅ MIT (compatible)
└─ Bloat: 🔴 70 dependencies

💡 RECOMMENDATION:
   Use dayjs or date-fns instead (lighter alternatives)
```

### Dependency Health Audit

```bash
/scan-dependencies

📊 PROJECT DEPENDENCY HEALTH: B+

🔴 Critical issues: 3
🟡 Warnings: 7
✅ Safe: 142

⚠️ ACTION REQUIRED:
   Update lodash, replace request, remove colors
```

## 📊 Risk Scoring

| Grade | Score | Criteria |
|------|-------|----------|
| **A** | 90-100 | No vulnerabilities, active maintainer, minimal bloat |
| **B** | 80-89 | Minor issues, low risk |
| **C** | 70-79 | Moderate vulnerabilities or inactive maintainer |
| **D** | 60-69 | High vulnerabilities, abandoned, or excessive bloat |
| **F** | 0-59 | Critical vulnerabilities, malicious code, or incompatible license |

## 🎯 Best Practices

1. **Check before installing** - Always run `/check-package` before adding dependencies
2. **Review PRs carefully** - Pay attention to dependency changes
3. **Audit regularly** - Run `/scan-dependencies` monthly
4. **Monitor bloat** - Use `/analyze-bloat` to keep dependencies lean
5. **Check maintainers** - Use `/maintainer-status` for critical dependencies
6. **Enable hooks** - Let the plugin automatically check installs

## Configuration

### Environment Variables

```bash
# Cache directory for audit results
export DEPENDENCY_SAFETY_CACHE_DIR="$HOME/.dependency-safety-cache"

# Audit cache TTL (milliseconds, default: 1 hour)
export AUDIT_CACHE_TTL="3600000"

# Minimum severity for warnings
export AUDIT_SEVERITY_LEVEL="moderate"
```

### Hooks Configuration

Edit `config/hooks.json` to customize:
- Which events trigger checks
- Risk thresholds
- Automatic blocking behavior

## 📚 Resources

- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins-reference)
- [npm Security Advisories](https://github.com/npm/advisories)
- [OSV Database](https://osv.dev/)
- [Snyk Vulnerability Database](https://snyk.io/vuln?type=npm)

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional vulnerability databases
- More ecosystem support (Python, Go, Rust)
- Enhanced maintainer tracking
- Better bloat analysis algorithms

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with:
- [Claude Code Plugin System](https://code.claude.com/docs/en/plugins)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- npm audit and security advisory databases

---

**Made with ❤️ by the Dependency Safety Scanner team**

*Stop installing unsafe dependencies. Start scanning today.*
