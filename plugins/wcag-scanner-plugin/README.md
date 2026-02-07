# WCAG Scanner Plugin

A comprehensive Claude Code plugin for scanning WCAG 2.2 compliance issues in web applications.

## Overview

This plugin provides three integrated components for accessibility testing:

1. **`/scan-wcag` Command** - Explicit WCAG compliance scanning with flexible options
2. **Accessibility Reviewer Agent** - Specialized agent for deep accessibility audits
3. **WCAG Scan Skill** - Autonomous accessibility issue detection during development

## Features

- Comprehensive WCAG 2.2 compliance checks (Levels A, AA, AAA)
- Support for HTML, CSS, JavaScript/TypeScript, and framework components
- Intelligent issue categorization (Critical, Serious, Moderate, Minor)
- Actionable remediation guidance with code examples
- Framework-specific analysis (React, Vue, Angular, Svelte, Next.js)
- Automatic hooks for real-time accessibility feedback
- Multiple output formats (text, JSON, HTML)
- Watch mode for continuous scanning during development

## Installation

### User Scope (Recommended)
```bash
cd wcag-scanner-plugin
claude plugin install . --scope user
```

### Project Scope (Team Sharing)
```bash
cd wcag-scanner-plugin
claude plugin install . --scope project
```

### Local Scope (Gitignored)
```bash
cd wcag-scanner-plugin
claude plugin install . --scope local
```

## Usage

### 1. Command: `/scan-wcag`

Explicitly scan files for WCAG compliance issues:

```bash
# Scan all HTML files
/scan-wcag **/*.html

# Scan with WCAG AAA level
/scan-wcag src/ --level AAA

# Generate JSON report
/scan-wcag src/ --format json --report a11y-report.json

# Watch mode for continuous scanning
/scan-wcag src/ --watch

# Exclude directories
/scan-wcag src/ --exclude "node_modules/**" --exclude "dist/**"
```

### 2. Agent: Accessibility Reviewer

Request comprehensive accessibility audits:

```
Review the navigation component for WCAG 2.2 AA compliance
```

```
Audit this form for keyboard accessibility issues
```

```
Check if our modal implementation follows accessibility best practices
```

### 3. Skill: WCAG Scan (Automatic)

The skill automatically activates when:
- You create or modify web files (HTML, CSS, JS, TS, JSX, TSX, Vue, Svelte, Astro)
- You mention accessibility-related keywords
- You ask questions about WCAG, ARIA, or semantic HTML

Examples:
```
Create an accessible navigation bar
```
```
Is this modal WCAG compliant?
```
```
Add alt text to these images
```

### 4. Hook: Automatic WCAG Checks (Optional)

The PostToolUse hook automatically performs quick WCAG checks after writing or editing files. To enable:

1. Uncomment the hooks section in `plugin.json`:
```json
{
  "name": "wcag-scanner",
  "hooks": "./hooks/hooks.json"
}
```

2. Reload Claude Code

## WCAG 2.2 Coverage

### Perceivable
- 1.1.1 Non-text Content (alt text)
- 1.3.1 Info and Relationships (semantic HTML, headings, lists)
- 1.3.4 Orientation (no display restrictions)
- 1.4.1 Use of Color (color not only indicator)
- 1.4.10 Reflow (320px content scaling)
- 1.4.11 Non-text Contrast (3:1 ratio)
- 1.4.12 Text Spacing (readable when adjusted)
- 1.4.13 Content on Hover/Focus (dismissible, not obscuring)

### Operable
- 2.1.1 Keyboard (all functionality keyboard accessible)
- 2.1.4 No Keyboard Trap (focus can move away)
- 2.4.1 Bypass Blocks (skip navigation links)
- 2.4.2 Page Titles (descriptive page titles)
- 2.4.3 Focus Order (logical tab order)
- 2.4.4 Link Purpose (clear link text)
- 2.4.6 Headings/Labels (descriptive headings and labels)
- 2.4.7 Focus Visible (visible focus indicators)
- 2.5.5 Target Size (44x44px touch targets)
- 2.5.7 Dragging Movements (drag alternatives)

### Understandable
- 3.1.1 Language of Page (lang attribute)
- 3.1.2 Language of Parts (lang changes)
- 3.2.1 On Focus (no context changes on focus)
- 3.2.2 On Input (no context changes on input)
- 3.3.1 Error Identification (clear error messages)
- 3.3.2 Labels/Instructions (form labels)
- 3.3.3 Error Suggestion (helpful error suggestions)
- 3.3.4 Error Prevention (confirmations for critical actions)

### Robust
- 4.1.1 Parsing (valid HTML structure)
- 4.1.2 Name/Role/Value (proper ARIA attributes)

## Output Examples

### Command Output
```
🔍 WCAG 2.2 Compliance Scan Results

Files scanned: 47
Issues found: 23

Critical (1):
  [CRITICAL] Missing alt text - hero-image.png
  src/components/Hero.jsx:15
  WCAG 1.1.1 - Non-text Content must have text alternative

Serious (5):
  [SERIOUS] Low contrast ratio - 2.8:1 (minimum 4.5:1)
  src/styles/buttons.css:23
  WCAG 1.4.3 - Contrast requirements not met
```

### Agent Review
```
## Accessibility Review Report

### Summary
- Component: Header Navigation
- Files Reviewed: 3
- WCAG Level Checked: AA
- Issues Found: 7 (2 Critical, 3 Serious, 2 Moderate)

### Critical Issues

1. Missing Skip Navigation Link
   - WCAG: 2.4.1 Bypass Blocks
   - Impact: Keyboard users must tab through all menu items
   - Fix: Add "Skip to main content" link
```

## Plugin Structure

```
wcag-scanner-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/
│   └── scan-wcag.md         # /scan-wcag command
├── agents/
│   └── accessibility-reviewer.md  # Accessibility specialist
├── skills/
│   └── wcag-scan/
│       └── SKILL.md         # Autonomous WCAG scanning
├── hooks/
│   └── hooks.json           # PostToolUse hooks (optional)
├── README.md                # This file
└── CHANGELOG.md             # Version history
```

## Configuration

### Enable Hooks

To enable automatic WCAG checks after file writes:

1. Add to `plugin.json`:
```json
{
  "name": "wcag-scanner",
  "hooks": "./hooks/hooks.json"
}
```

2. Or configure in project settings

### Customize Scan Options

Create `.wcagrc.json` in your project root:

```json
{
  "level": "AA",
  "severity": "moderate",
  "exclude": ["node_modules/**", "dist/**", "build/**"],
  "watch": false,
  "format": "text"
}
```

## Integration

### Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
claude /scan-wcag src/ --severity serious
if [ $? -ne 0 ]; then
  echo "❌ Critical or serious accessibility issues found. Please fix before committing."
  exit 1
fi
```

### CI/CD Pipeline

Example GitHub Actions:

```yaml
name: Accessibility Check
on: [pull_request]

jobs:
  wcag-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Claude Code
        run: npm install -g @anthropic/claude-code
      - name: Run WCAG Scan
        run: claude /scan-wcag src/ --format json --report wcag-report.json
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: wcag-report
          path: wcag-report.json
```

## Development

### Testing the Plugin

1. Install the plugin locally:
```bash
cd wcag-scanner-plugin
claude plugin install . --scope local
```

2. Test with sample files:
```bash
/scan-wcag test-files/
```

3. Verify agent invocation:
```
Review test-files/sample.html for accessibility issues
```

### Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM Accessibility Checklist](https://webaim.org/standards/wcag/checklist)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)

## License

MIT License - See LICENSE file for details

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.
