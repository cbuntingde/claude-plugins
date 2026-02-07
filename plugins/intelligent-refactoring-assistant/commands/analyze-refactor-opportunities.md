---
description: Comprehensively analyze code for all refactoring opportunities and provide prioritized recommendations
usage: "/analyze-refactor-opportunities [--scope <file|directory|all>] [--focus <duplication|modernization|patterns|complexity|all>]"
examples:
  - "/analyze-refactor-opportunities --scope file"
  - "/analyze-refactor-opportunities --scope directory --focus modernization"
  - "/analyze-refactor-opportunities --scope all --focus all"
tags: ["analysis", "refactoring", "code-quality", "recommendations"]
---

# Analyze Refactor Opportunities

Get a comprehensive analysis of your codebase with prioritized refactoring recommendations.

## What it does

This command performs a deep analysis of your code to identify all potential refactoring opportunities across multiple dimensions:

- **Duplication detection**: Find repeated code patterns
- **Modernization needs**: Identify outdated syntax and APIs
- **Pattern applications**: Suggest design patterns to improve structure
- **Complexity hotspots**: Locate overly complex code that needs simplification
- **Maintainability issues**: Find code that's difficult to understand or modify
- **Performance opportunities**: Identify safe performance improvements

## Analysis dimensions

### 1. Code Duplication
- Exact duplicates across files
- Near-duplicates with minor variations
- Logic pattern duplication
- Configuration duplication

### 2. Modernization Opportunities
- Outdated language syntax
- Deprecated API usage
- Old patterns vs. modern alternatives
- Performance-enhancing language features

### 3. Design Pattern Applications
- Tight coupling that could benefit from patterns
- Complex conditionals suitable for strategy/command
- Scattered logic suitable for facade/repository
- Hard-to-test code suitable for dependency injection

### 4. Code Complexity
- Cyclomatic complexity hotspots
- Deep nesting levels
- Long functions/methods
- Complex boolean expressions

### 5. Maintainability
- Low test coverage areas
- Poor naming conventions
- Lack of documentation
- Magic numbers and strings
- Large classes/files

## How it works

1. **Comprehensive scan**: Analyzes code structure, patterns, and metrics
2. **Multi-dimensional analysis**: Evaluates across all dimensions
3. **Impact assessment**: Estimates effort, risk, and benefit for each opportunity
4. **Prioritization**: Ranks opportunities by ROI (Return on Investment)
5. **Dependency analysis**: Identifies opportunities that enable others
6. **Recommendation report**: Presents actionable, prioritized recommendations

## Options

- `--scope`: Analysis scope
  - `file`: Analyze current file only (default)
  - `directory`: Analyze all files in current directory
  - `all`: Analyze entire codebase

- `--focus`: Specific focus area
  - `duplication`: Only analyze code duplication
  - `modernization`: Only analyze modernization needs
  - `patterns`: Only analyze pattern opportunities
  - `complexity`: Only analyze code complexity
  - `all`: Analyze all dimensions (default)

## What you'll see

```
🔍 Comprehensive refactoring analysis...

Codebase Analysis Report
========================

Scope: Entire codebase (47 files)
Language: TypeScript (React)
Analysis Date: 2025-01-17

📊 SUMMARY
--------
Total Opportunities: 34
- High Priority: 8
- Medium Priority: 15
- Low Priority: 11

Estimated Total Effort: 18 hours
Expected Impact: High

🎯 HIGH PRIORITY (Quick Wins)
----------------------------

1. [EXTRACTION] Extract validation logic (3 locations)
   📍 auth/validator.ts:45-52, user/service.ts:78-85, admin/utils.ts:112-119
   🎯 Impact: High - Repeated across 3 files, frequently modified
   ⏱️  Effort: 30 minutes
   ⚠️  Risk: Low - Pure functions, well-tested
   💡 Recommendation: Extract to shared validation utility
   📈 Value: Eliminate duplication, improve consistency

2. [MODERNIZATION] Convert callbacks to async/await (12 locations)
   📍 api/*-service.ts files
   🎯 Impact: High - Significantly improves readability
   ⏱️  Effort: 2 hours
   ⚠️  Risk: Medium - Changes execution flow
   💡 Recommendation: Modernize error handling pattern
   📈 Value: Better error handling, easier testing

3. [PATTERN] Apply Repository pattern to data access
   📍 services/data-access.ts, services/api-client.ts
   🎯 Impact: High - Enables testing, decouples from database
   ⏱️  Effort: 1.5 hours
   ⚠️  Risk: Low - Preserves behavior, improves abstraction
   💡 Recommendation: Create repository layer for all data access
   📈 Value: Testability, flexibility, cleaner architecture

4. [COMPLEXITY] Simplify complex conditional (cyclomatic complexity: 15)
   📍 utils/payment-processor.ts:89-156
   🎯 Impact: High - Difficult to understand and modify
   ⏱️  Effort: 45 minutes
   ⚠️  Risk: Medium - Core business logic
   💡 Recommendation: Apply Strategy pattern for payment types
   📈 Value: Maintainability, extensibility

🔄 MEDIUM PRIORITY
-----------------

5. [MODERNIZATION] Replace var with const/let (28 locations)
   📍 legacy/utils.ts, legacy/helpers.ts
   ⏱️  Effort: 15 minutes
   ⚠️  Risk: Low - Automatic refactoring
   💡 Recommendation: Use modern variable declarations

6. [EXTRACTION] Extract date formatting logic (5 locations)
   📍 Multiple components
   ⏱️  Effort: 30 minutes
   ⚠️  Risk: Low - Deterministic transformations
   💡 Recommendation: Create date utility module

7. [PATTERN] Apply Facade pattern to API client
   📍 api/client.ts
   🏪  Impact: Medium - Simplifies API usage
   ⏱️  Effort: 1 hour
   ⚠️  Risk: Low - Wrapper pattern
   💡 Recommendation: Create simplified API facade

... (more medium and low priority items)

📋 PRIORITIZED ROADMAP
---------------------

Phase 1: Quick Wins (Total: 2.5 hours)
✓ Extract validation logic (30 min)
✓ Modernize variable declarations (15 min)
✓ Extract date formatting (30 min)
✓ Extract error handling (45 min)
✓ Remove unused imports (30 min)

Phase 2: Structural Improvements (Total: 6 hours)
✓ Apply Repository pattern (1.5 hr)
✓ Apply Strategy pattern for payments (45 min)
✓ Modernize async patterns (2 hr)
✓ Extract API facade (1 hr)
✓ Improve naming conventions (30 min)

Phase 3: Deep Refactoring (Total: 9.5 hours)
✓ Simplify complex conditionals (2 hr)
✓ Extract large functions (3 hr)
✓ Apply additional design patterns (3 hr)
✓ Improve error handling (1.5 hr)

🎯 RECOMMENDATIONS
-----------------

1. Start with Phase 1 quick wins to build momentum
2. Focus on high-frequency, high-change code first
3. Ensure test coverage before major refactoring
4. Commit after each major change for easy rollback
5. Refactor incrementally, not all at once

💪 NEXT STEPS
-----------

Run these commands to get started:

/extract-duplication --scope all --confidence conservative
/modernize-code --target ES2022 --scope all
/apply-pattern --pattern repository --scope directory

Would you like me to help with any specific refactoring?
```

## Prioritization criteria

Opportunities are prioritized based on:

1. **Impact**: How much will this improve the codebase?
2. **Effort**: How long will it take?
3. **Risk**: How likely is something to break?
4. **Frequency**: How often is this code modified?
5. **Dependencies**: Does this enable other improvements?

**Priority = (Impact × Frequency) / (Effort × Risk)**

## Best practices

- Start with high-priority, low-risk items
- Create a git branch before refactoring
- Ensure tests pass before starting
- Focus on high-change areas first
- Don't refactor everything at once
- Communicate changes with your team

## Analysis metrics used

- **Cyclomatic complexity**: Measures decision points in code
- **Duplication index**: Percentage of duplicated code
- **Maintainability index**: Overall code maintainability score
- **Code churn**: Frequency of changes to specific files
- **Test coverage**: Percentage of code covered by tests
- **Coupling metrics**: How tightly components are coupled
- **Cohesion metrics**: How related code is grouped together

## Export options

After analysis, you can:

- Export report to Markdown
- Create GitHub Issues from recommendations
- Generate a refactoring roadmap
- Compare with previous analyses
- Track progress over time

## See also

- `/extract-duplication`: Remove code duplication
- `/modernize-code`: Update to modern syntax
- `/apply-pattern`: Apply design patterns
- `/safe-rename`: Rename symbols safely
