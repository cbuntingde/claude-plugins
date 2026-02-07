---
description: Prioritize technical debt issues based on impact and effort
usage: /debt-prioritize [--strategy=impact|effort|roi|timeline] [--limit=N]
examples:
  - /debt-prioritize
  - /debt-prioritize --strategy=roi --limit=20
  - /debt-prioritize --strategy=timeline
---

# Debt Prioritize

Intelligently prioritize technical debt issues using multiple strategies to maximize the value of refactoring efforts.

## Features

- **Multiple prioritization strategies**:
  - `impact`: Prioritize by severity and impact score
  - `effort`: Quick wins first (lowest effort, highest impact)
  - `roi`: Return on investment (impact ÷ effort ratio)
  - `timeline`: Time-sensitive issues (security, dependencies)

- **Effort estimation**:
  - Automatic effort calculation based on issue complexity
  - Manual override capabilities
  - Team velocity integration

- **Dependencies and blockers**:
  - Identifies issues blocking other work
  - Detects prerequisite relationships
  - Highlights safe refactoring opportunities

## Parameters

- `--strategy`: Prioritization strategy (default: roi)
  - `impact`: Highest impact scores first
  - `effort`: Lowest effort for quick wins
  - `roi`: Best return on investment
  - `timeline`: Time-sensitive and blocking issues
- `--limit`: Number of items to display (default: 50)

## Prioritization Algorithm

The plugin uses a weighted scoring system:

```
Impact Score = (Severity × 0.4) + (Risk × 0.3) + (Frequency × 0.2) + (Business Value × 0.1)
ROI Score = Impact Score / Estimated Effort
Priority Ranking = ROI Score + Dependency Bonus + Time Sensitivity Bonus
```

## Categories

1. **Quick Wins** (High Impact, Low Effort)
   - Simple refactors with immediate benefits
   - Example: Extract constants, rename variables

2. **High Value Investments** (High Impact, High Effort)
   - Major architectural improvements
   - Example: Break down monolith, redesign API

3. **Maintenance Tasks** (Low Impact, Low Effort)
   - Small improvements during regular work
   - Example: Standardize formatting, add comments

4. **Defer** (Low Impact, High Effort)
   - Not worth the investment currently
   - Reassess during major refactors

## Example Output

```
🎯 Prioritized Technical Debt
Strategy: ROI (Return on Investment)

🚀 Quick Wins (Do First)
─────────────────────────
1. [ROI: 8.7] Extract magic numbers in config/service.js
   Impact: 7.8 | Effort: 0.9 hours
   Category: Code Quality
   Action: Define constants for API endpoints

2. [ROI: 7.2] Rename unclear variables in utils/formatters.js
   Impact: 6.5 | Effort: 0.9 hours
   Category: Readability
   Action: Rename 'x', 'tmp', 'data' to descriptive names

💎 High Value Investments (Plan Sprints)
─────────────────────────
3. [ROI: 4.3] Refactor UserController.authenticate()
   Impact: 9.2 | Effort: 12 hours
   Category: Complexity
   Action: Break down into smaller, testable methods
   Prerequisite: Create AuthService module

4. [ROI: 3.9] Consolidate duplicate validation logic
   Impact: 8.7 | Effort: 8 hours
   Category: Duplication
   Action: Create shared validation framework

⏰ Time Sensitive (Address Soon)
─────────────────────────
5. [Security] Update deprecated dependency lodash@4.17.15
   Risk: Vulnerability CVE-2021-23337
   Impact: 9.5 | Effort: 2 hours
   Deadline: Before next security scan

6. [Blocking] Circular dependency in services/
   Blocks: New payment feature implementation
   Impact: 7.1 | Effort: 4 hours

📋 Recommended Sprint Plan
─────────────────────────
Sprint 1 (Quick Wins):
  • Extract magic numbers (3 hours)
  • Rename unclear variables (2 hours)
  • Add missing error handling (1 hour)
  Total: 6 hours | 3 issues resolved

Sprint 2 (High Impact):
  • Refactor UserController (12 hours)
  • Consolidate validation (8 hours)
  Total: 20 hours | 2 issues resolved
```
