# Technical Debt Tracker

A comprehensive Claude Code plugin for identifying, tracking, and prioritizing technical debt in your codebase.

## Features

- **Automated Debt Scanning**: Detect code smells, complexity issues, security vulnerabilities, and more
- **Prioritized Recommendations**: Get actionable refactoring suggestions based on impact and effort
- **Comprehensive Reporting**: Track debt trends, analyze hotspots, and measure improvement over time
- **Intelligent Agents**: Specialized subagents for deep code analysis
- **Automatic Assessment**: Real-time feedback during coding and code reviews

## Installation

```bash
claude plugin install tech-debt-tracker
```

## Usage

Run the following commands to scan, track, and prioritize technical debt in your codebase.

### Scanning for Issues

```bash
# Scan entire project
/debt-scan

# Scan specific directory
/debt-scan src/components

# Scan with high severity filter
/debt-scan --severity=high

# Scan specific categories
/debt-scan --categories=complexity,duplication
```

### Generating Reports

```bash
# View all-time debt report
/debt-report

# View recent report in markdown format
/debt-report last-7-days --format=markdown

# Sort by impact score
/debt-report --sort=impact
```

### Prioritizing Debt

```bash
# ROI-based prioritization (default)
/debt-prioritize

# Quick wins first (low effort, high impact)
/debt-prioritize --strategy=effort

# Top 10 items
/debt-prioritize --limit=10
```

### Resolving Issues

```bash
# Mark issue as refactored
/debt-resolve TD-001 --resolution=refactored

# Defer issue with notes
/debt-resolve TD-042 --resolution=deferred --notes="Address in Q2"

# Document as acceptable limitation
/debt-resolve TD-087 --resolution=documented --notes="Legacy compatibility required"
```

## Commands

### `/debt-scan`
Scan the codebase for technical debt issues.

```bash
/debt-scan                           # Scan entire project
/debt-scan src/components            # Scan specific directory
/debt-scan --severity=high           # Only high-priority issues
/debt-scan --categories=complexity,duplication  # Specific categories
```

### `/debt-report`
View comprehensive technical debt reports.

```bash
/debt-report                                    # All-time report
/debt-report last-7-days --format=markdown     # Recent report
/debt-report --sort=impact                      # Sort by impact
```

### `/debt-prioritize`
Get prioritized refactoring recommendations.

```bash
/debt-prioritize                        # ROI-based prioritization
/debt-prioritize --strategy=quick-wins  # Quick wins first
/debt-prioritize --limit=20             # Top 20 items
```

### `/debt-resolve`
Mark technical debt issues as resolved.

```bash
/debt-resolve TD-001 --resolution=refactored
/debt-resolve TD-042 --resolution=deferred --notes="Address in Q2"
```

## Agents

### Debt Analyzer
Autonomously analyzes code for technical debt across multiple dimensions:
- Complexity analysis (cyclomatic, cognitive, nesting)
- Code smell detection (24+ smell types)
- Duplication detection
- Security assessment
- Architecture evaluation
- Test coverage gaps

### Code Smell Detector
Specialized agent for identifying specific code smells:
- Bloaters (long methods, large classes)
- OO abusers (switch statements, refused bequest)
- Change preventers (divergent change, shotgun surgery)
- Dispensables (dead code, lazy classes)
- Couplers (feature envy, inappropriate intimacy)

## Skills

### Debt Assessment
Automatically assesses technical debt when:
- Analyzing code quality
- Reviewing pull requests
- Planning refactoring initiatives
- Investigating performance issues

### Refactoring Recommender
Provides specific refactoring strategies:
- 60+ refactoring techniques
- Before/after code examples
- Step-by-step implementation guides
- Testing strategies

## Hooks

Automatically runs analysis:
- **PostToolUse**: Analyzes code after edits for new debt
- **SessionStart**: Highlights critical debt items
- **SessionEnd**: Summarizes debt changes in session

## Configuration

### Thresholds
Customize detection thresholds in `.claude/debt-config.json`:

```json
{
  "complexity": {
    "high": 15,
    "medium": 10,
    "low": 5
  },
  "methodLength": {
    "high": 50,
    "medium": 30,
    "low": 20
  },
  "duplication": {
    "minTokens": 50,
    "minInstances": 2
  }
}
```

### Ignore Patterns
Exclude files/directories from analysis:

```json
{
  "ignore": [
    "node_modules/**",
    "dist/**",
    "generated/**",
    "**/*.test.js",
    "**/*.spec.ts"
  ]
}
```

## Output Examples

### Scan Results
```
📊 Technical Debt Scan Results

🔴 High Priority Issues: 12
🟡 Medium Priority Issues: 34
🟢 Low Priority Issues: 28

Top Issues:
1. [9.2] UserController.authenticate() - Complexity: 45
   src/controllers/UserController.js:145
   Extract authentication logic into service

2. [8.7] Duplicate validation in 5 files
   src/utils/validators/*.js
   Create shared validation module
```

### Report Summary
```
📈 Technical Debt Report

Total Score: 1,247
Debt Velocity: +2.3 issues/week
Estimated Effort: 8 developer-weeks

Top Categories:
• Complexity: 42% (31 issues)
• Duplication: 28% (21 issues)
• Security: 15% (11 issues)
```

## Best Practices

1. **Regular Scans**: Run weekly or per sprint
2. **Address High Priority First**: Focus on high-impact issues
3. **Incremental Improvement**: Small, continuous improvements
4. **Track Trends**: Monitor debt accumulation rate
5. **Team Awareness**: Share findings with team
6. **Pre-commit Hooks**: Quick checks before commits
7. **CI Integration**: Generate reports in builds

## Workflow Integration

### Sprint Planning
```bash
# Before sprint planning
/debt-prioritize --strategy=roi

# Review top items and add to backlog
# Estimate effort for top 10 items
```

### Code Review
The plugin automatically analyzes PRs for:
- New technical debt introduced
- Regression risks
- Improvement opportunities

### Continuous Monitoring
```bash
# Add to CI/CD pipeline
claude debt-scan --severity=high --format=json > debt-report.json
```

## Development

### Project Structure
```
tech-debt-tracker/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/                # Slash commands
│   ├── debt-scan.md
│   ├── debt-report.md
│   ├── debt-prioritize.md
│   └── debt-resolve.md
├── agents/                  # Specialized subagents
│   ├── debt-analyzer.md
│   └── code-smell-detector.md
├── skills/                  # Agent skills
│   ├── debt-assessment/
│   └── refactoring-recommender/
├── hooks/                   # Event hooks
│   └── hooks.json
└── README.md               # This file
```

### Contributing
Contributions welcome! Areas for improvement:
- Additional code smell detectors
- Language-specific analyzers
- Integration with CI/CD tools
- Custom refactoring templates
- Enhanced reporting features

## License

MIT

## Author

cbuntingde <cbuntingde@gmail.com>

## Links

- [Documentation](https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/tech-debt-tracker)
- [Issues](https://github.com/cbuntingde/claude-plugins-dev/issues)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
