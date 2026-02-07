# Bundle Size Analyzer Plugin - Summary

## Overview

A powerful Claude Code plugin for analyzing JavaScript/TypeScript bundle sizes and identifying tree-shaking opportunities. Supports all major bundlers (Webpack, Vite, Rollup, esbuild, Parcel).

## Key Features

| Feature | Description |
|---------|-------------|
| Bundle Analysis | Deep dive into bundle composition and module sizes |
| Tree-Shaking Detection | Find unused code and exports that can be removed |
| Size Comparison | Compare bundles across builds, branches, or commits |
| Trend Tracking | Monitor bundle size changes over time |
| Optimization Suggestions | Actionable recommendations with code examples |
| Multi-Format Reports | HTML, Markdown, JSON, CSV, PDF output |
| CI/CD Integration | Automated size regression detection |

## Directory Structure

```
bundle-size-analyzer/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── commands/
│   ├── analyze-bundle.md     # /analyze-bundle command
│   ├── tree-shake.md         # /tree-shake command
│   ├── compare-bundles.md    # /compare-bundles command
│   └── export-report.md      # /export-report command
├── skills/
│   └── bundle-analyzer/
│       └── SKILL.md          # Automatic analysis skill
├── agents/
│   └── bundle-specialist.md  # Deep analysis agent
├── hooks/
│   └── hooks.json            # Lifecycle hooks
├── scripts/
│   ├── install-tools.sh      # Dependency installer
│   └── analyze-bundle.py     # Python analysis script
├── docs/
│   ├── PLUGIN_STRUCTURE.md   # Plugin architecture docs
│   └── QUICK_START.md        # Quick start guide
├── README.md                 # Main documentation
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT License
└── SUMMARY.md                # This file
```

## Commands Reference

### /analyze-bundle
Comprehensive bundle size analysis with module breakdown, dependency graph, and optimization suggestions.

### /tree-shake
Identify unused exports, dead code, and side effects that prevent tree-shaking. Auto-apply safe optimizations.

### /compare-bundles
Compare bundle sizes across different builds, commits, or time periods with trend analysis.

### /export-report
Generate detailed reports in multiple formats (HTML, Markdown, JSON, CSV, PDF).

## Installation

```bash
# Copy to Claude plugins directory
cp -r bundle-size-analyzer ~/.claude/plugins/

# Or install via npm
npm install --save-dev @claude-code/bundle-size-analyzer
```

## Quick Examples

```bash
# Analyze bundle
/analyze-bundle dist/app.js

# Find tree-shaking opportunities
/tree-shake src/ --fix

# Compare to main branch
/compare-bundles main

# Generate HTML report
/export-report --format html --output report.html
```

## Common Use Cases

1. **Reduce Bundle Size**: Analyze and optimize large dependencies
2. **Tree-Shaking**: Remove unused code and exports
3. **Code Splitting**: Split bundles for optimal loading
4. **CI/CD Monitoring**: Detect size regressions in pull requests
5. **Performance Tracking**: Monitor bundle size trends over time

## Supported Bundlers

- Webpack (via webpack-bundle-analyzer)
- Vite (via build manifest and rollup visualization)
- Rollup (via stats and output options)
- esbuild (via metafile)
- Parcel (via bundle report)

## Configuration

Plugin can be configured via Claude settings:

```json
{
  "bundleAnalyzer": {
    "enabled": true,
    "threshold": {
      "warn": 10,
      "error": 25,
      "maxSize": 500
    },
    "format": "text"
  }
}
```

## Key Benefits

✅ Automatic bundle size monitoring during development
✅ Proactive optimization suggestions
✅ Multi-format reporting for team collaboration
✅ CI/CD integration for regression prevention
✅ Support for all major JavaScript bundlers
✅ Tree-shaking detection and fixes
✅ Historical tracking and trend analysis

## Documentation

- [README.md](README.md) - Full documentation
- [docs/QUICK_START.md](docs/QUICK_START.md) - Getting started guide
- [docs/PLUGIN_STRUCTURE.md](docs/PLUGIN_STRUCTURE.md) - Architecture details

## License

MIT License - See LICENSE file for details.
