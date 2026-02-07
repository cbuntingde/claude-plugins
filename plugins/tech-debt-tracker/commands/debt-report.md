---
description: View and analyze technical debt reports
usage: /debt-report [period] [--format=table|json|markdown] [--sort=impact|severity|file]
examples:
  - /debt-report
  - /debt-report last-7-days --format=markdown
  - /debt-report --sort=impact
---

# Debt Report

View comprehensive technical debt reports with trends, analytics, and actionable insights.

## Features

- Historical tracking of technical debt over time
- Trend analysis showing debt accumulation or reduction
- Category-wise breakdown (complexity, duplication, security, etc.)
- File and module hotspots
- Team ownership and assignment tracking
- Integration with project management tools

## Parameters

- `period` (optional): Time period for the report
  - Default: All time
  - Examples: `last-7-days`, `last-30-days`, `this-month`, `since-release`
- `--format`: Output format
  - `table`: Interactive table view (default)
  - `json`: Machine-readable JSON export
  - `markdown`: Documentation-ready report
- `--sort`: Sort criteria
  - `impact`: By impact score (default)
  - `severity`: By severity level
  - `file`: By file path
  - `category`: By issue category

## Report Sections

1. **Executive Summary**
   - Total debt score
   - High-priority item count
   - Debt velocity (issues added/resolved per week)
   - Estimated remediation effort

2. **Category Breakdown**
   - Issues by type with percentages
   - Top categories needing attention
   - Historical trends per category

3. **File Hotspots**
   - Files with highest debt concentration
   - Technical debt density (issues per 100 LOC)
   - Risk assessment by module

4. **Trend Analysis**
   - Debt accumulation over time
   - Resolution velocity
   - Predictions based on current trends

5. **Action Items**
   - Prioritized refactoring recommendations
   - Quick wins (high impact, low effort)
   - Strategic initiatives (high impact, high effort)

## Example Output

```
📈 Technical Debt Report
Period: Last 30 days

🎯 Executive Summary
─────────────────────────
Total Debt Score: 1,247
High Priority: 12 | Medium: 34 | Low: 28
Debt Velocity: +2.3 issues/week
Estimated Effort: 8 developer-weeks

📊 Category Breakdown
─────────────────────────
Complexity:    42% (31 issues) 🔴
Duplication:   28% (21 issues) 🟡
Security:      15% (11 issues) 🔴
Naming:        10% (7 issues)  🟢
Testing:       5%  (4 issues)  🟡

🔥 File Hotspots
─────────────────────────
1. src/controllers/UserController.js
   Score: 156 | Issues: 8 | Density: 2.1/100 LOC
   Top Issue: Cyclomatic complexity: 45

2. src/utils/validators.js
   Score: 134 | Issues: 6 | Density: 1.8/100 LOC
   Top Issue: 5 duplicate validation functions

✅ Quick Wins (High Impact, Low Effort)
─────────────────────────
1. Rename unclear variables in utils/helpers.js
   Estimated: 30 minutes | Impact: 3.4

2. Extract magic numbers to constants in config.js
   Estimated: 1 hour | Impact: 4.1
```
