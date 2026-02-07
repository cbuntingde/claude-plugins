---
description: Review codebase architecture and design patterns
arguments:
  - name: scope
    description: "Specific file, directory, or pattern to analyze (optional)"
    required: false
  - name: focus
    description: "Specific area to focus on: patterns, solid, anti-patterns, coupling, or all"
    required: false
examples:
  - "/architecture-review"
  - "/architecture-review src/auth"
  - "/architecture-review --focus solid"
  - "/architecture-review src/services --focus patterns"
---

# Architecture Review

Comprehensive review of your codebase's architecture, design patterns, and structural quality. This command provides actionable insights for improving software design.

## Usage

```
/architecture-review [scope] [--focus <area>]
```

### Arguments

- **scope** (optional): File, directory, or glob pattern to analyze
  - Examples: `src/`, `src/auth/`, `**/*.js`, `src/services/UserService.ts`
  - Default: Entire codebase

- **--focus** (optional): Specific analysis area
  - `patterns` - Design pattern usage and recommendations
  - `solid` - SOLID principles adherence
  - `anti-patterns` - Anti-patterns and code smells detection
  - `coupling` - Coupling and cohesion analysis
  - `all` - Comprehensive analysis (default)

## What It Analyzes

### Design Patterns
- Identifies patterns currently in use
- Suggests patterns that could improve design
- Detects pattern misapplications
- Provides pattern implementation examples

### SOLID Principles
- Single Responsibility Principle compliance
- Open/Closed Principle adherence
- Liskov Substitution Principle violations
- Interface Segregation Principle issues
- Dependency Inversion Principle problems

### Anti-Patterns
- God Objects and Blob anti-patterns
- Shotgun Surgery and Divergent Change
- Feature Envy and Inappropriate Intimacy
- Shotgun Surgery and Parallel Inheritance
- Magic numbers and strings
- Copy-paste programming

### Code Quality Metrics
- Cyclomatic complexity
- Coupling between modules
- Cohesion within classes
- Code duplication
- Nesting depth

## Output Format

The review provides:

### Executive Summary
High-level health score and critical issues

### Detailed Findings
- Issue category and severity
- File locations with line numbers
- Description of the problem
- Impact on maintainability

### Recommendations
- Specific refactoring suggestions
- Before/after code examples
- Priority ranking
- Estimated effort

### Action Plan
- Prioritized improvement list
- Dependencies between changes
- Risk assessment

## Examples

### Full Codebase Review
```bash
/architecture-review
```
Analyzes entire codebase across all focus areas

### Specific Module Review
```bash
/architecture-review src/auth
```
Deep dive into authentication module

### SOLID Principles Focus
```bash
/architecture-review --focus solid
```
Concentrates on SOLID principle adherence

### Pattern Analysis in Services
```bash
/architecture-review src/services --focus patterns
```
Examines design patterns in service layer

## Best Practices

1. **Run Regularly**: Conduct reviews during development, not just at the end
2. **Focus Incremental**: Use `--focus` for targeted analysis
3. **Address Critical Issues**: Prioritize high-severity findings
4. **Track Progress**: Compare reviews over time to measure improvement
5. **Team Discussion**: Use findings for architecture decision records

## Integration with Development

Consider running architecture review:
- Before major refactorings
- During code reviews for complex modules
- When adding new features to existing modules
- As part of regular technical debt assessment
- Before API/contract changes
