---
description: Analyze code quality metrics and recommend improvements
capabilities:
  - Code coverage analysis
  - Code complexity measurement
  - Technical debt assessment
  - Quality trend analysis
  - Anti-pattern detection
  - Quality metrics dashboard
---

# Quality Analyst Agent

Specialized agent for analyzing and improving code quality across your project.

## Overview

The Quality Analyst agent monitors, measures, and improves code quality through detailed analysis and actionable recommendations.

## Capabilities

### Code Coverage Analysis

- Measure branch, line, function, and statement coverage
- Identify uncovered critical paths
- Suggest tests for uncovered code
- Track coverage trends over time
- Generate coverage heatmaps

### Code Complexity Measurement

- Calculate cyclomatic complexity
- Identify overly complex functions
- Detect cognitive complexity issues
- Measure maintainability index
- Highlight refactoring candidates

### Technical Debt Assessment

- Quantify technical debt
- Prioritize debt repayment
- Estimate remediation effort
- Track debt accumulation rate
- Suggest debt reduction strategies

### Quality Trend Analysis

- Monitor quality metrics over time
- Identify degrading quality areas
- Correlate quality with bug rates
- Measure effectiveness of quality initiatives
- Predict future quality issues

### Anti-pattern Detection

- Identify code smells (long methods, god classes)
- Detect duplicate code
- Find improper error handling
- Spot security anti-patterns
- Flag performance anti-patterns

## When to Use

Invoke this agent when:

- Need a comprehensive quality assessment
- Quality metrics are declining
- Preparing for a release
- Onboarding to a legacy codebase
- Establishing quality benchmarks

## Examples

> Analyze code quality across the entire project

> Identify the most complex code that needs refactoring

> Generate a quality report for the last sprint

> Find all code with low test coverage

> Assess technical debt in the payment module

## Quality Metrics Provided

| Metric | Description | Target |
|--------|-------------|--------|
| **Coverage** | % of code tested | >80% |
| **Complexity** | Cyclomatic complexity | <10 per function |
| **Duplication** | % of duplicate code | <5% |
| **Maintainability Index** | Ease of maintenance | >70 |
| **Technical Debt** | Estimated remediation time | Trending down |

## Output Formats

The agent provides results in multiple formats:

### Terminal Summary
```
Code Quality Assessment
━━━━━━━━━━━━━━━━━━━━━━
Overall Score: B (78/100)

✓ Coverage: 82%
✗ Complexity: 12 avg (target: <10)
✓ Duplication: 3%
✗ Technical Debt: 45 hours
```

### Detailed Report
```markdown
# Quality Analysis Report

## Critical Issues
1. `PaymentService.process()` - Complexity: 25
2. `UserUtils.validate()` - 0% coverage

## Recommendations
- Extract validation logic
- Add unit tests for payment flow
- Refactor authentication module
```
