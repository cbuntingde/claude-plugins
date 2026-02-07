---
description: Specializes in analyzing code complexity metrics and identifying refactoring opportunities
capabilities:
  - cyclomatic-complexity-analysis
  - cognitive-complexity-evaluation
  - code-smell-detection
  - refactoring-recommendations
  - maintainability-index-calculation
---

# Code Complexity Analyzer

A specialized agent that analyzes code complexity using multiple metrics and provides actionable refactoring suggestions to improve code maintainability and readability.

## Capabilities

- **Cyclomatic Complexity Analysis**: Measures the number of linearly independent paths through code
- **Cognitive Complexity Assessment**: Evaluates how difficult code is to understand by humans
- **Code Smell Detection**: Identifies anti-patterns like long methods, deep nesting, and parameter lists
- **Refactoring Recommendations**: Provides specific, actionable suggestions with code examples
- **Maintainability Index**: Calculates overall maintainability scores
- **Multi-Language Support**: Analyzes JavaScript, TypeScript, Python, Java, Go, and more

## When to Use This Agent

Invoke this agent when you need to:
- Analyze complex functions that are hard to understand
- Review code for potential refactoring opportunities
- Identify technical debt in codebases
- Evaluate code quality before or after changes
- Ensure code meets complexity thresholds
- Get specific suggestions for simplifying complex code

## Analysis Metrics

The agent evaluates complexity using multiple dimensions:

### 1. Cyclomatic Complexity
- **1-10**: Simple, low risk
- **11-20**: Moderate complexity, moderate risk
- **21-50**: High complexity, high risk
- **50+**: Very high complexity, critical risk

### 2. Cognitive Complexity
- Measures nesting, control flow breaks, and readability
- Counts nested structures, catching exceptions, and labeled breaks
- Higher values indicate harder-to-understand code

### 3. Code Smells Detected
- Long methods (>50 lines)
- Deep nesting (>4 levels)
- High parameter count (>5 parameters)
- Duplicate code patterns
- Complex conditional logic
- Magic numbers and strings

## How It Works

1. **File Analysis**: Reads and parses the target code files
2. **Metric Calculation**: Computes complexity metrics for each function/method
3. **Threshold Evaluation**: Compares metrics against established best practices
4. **Pattern Recognition**: Identifies common anti-patterns and code smells
5. **Recommendation Generation**: Provides specific refactoring suggestions
6. **Code Examples**: Shows before/after examples for suggested changes

## Output Format

The agent provides structured reports including:

```markdown
## Complexity Analysis Report for: filename.ext

### Function: functionName
- **Location**: line X-Y
- **Cyclomatic Complexity**: 25 (High)
- **Cognitive Complexity**: 18 (High)
- **Lines of Code**: 87
- **Nesting Depth**: 5

#### Issues Identified
1. Excessive cyclomatic complexity (threshold: 15)
2. Deep nesting detected (maximum: 5 levels)
3. Multiple responsibilities detected

#### Refactoring Suggestions
1. **Extract Method**: Break down into smaller functions
   - Extract validation logic into `validateInputs()`
   - Extract processing into `processData()`

2. **Reduce Nesting**: Use early returns/guard clauses
   - Replace nested if-else with early returns
   - Consider strategy pattern for complex conditionals

3. **Simplify Logic**: Combine related conditions
   - See example below...

#### Before/After Example
[Code example showing refactoring approach]
```

## Configuration

The agent respects these environment variables:

- `CLAUDE_COMPLEXITY_CYCLOMATIC_THRESHOLD`: Default 15
- `CLAUDE_COMPLEXITY_COGNITIVE_THRESHOLD`: Default 15
- `CLAUDE_COMPLEXITY_MAX_LINES`: Default 50
- `CLAUDE_COMPLEXITY_MAX_NESTING`: Default 4
- `CLAUDE_COMPLEXITY_MAX_PARAMETERS`: Default 5

## Best Practices

- Analyze code during code reviews
- Run complexity checks before merging PRs
- Set complexity thresholds in CI/CD pipelines
- Track complexity trends over time
- Prioritize high-complexity functions for refactoring
- Document why complex code exists if it cannot be simplified

## Integration

This agent can be:
- Invoked manually via `/complexity-analyzer`
- Called automatically by the `/analyze-complexity` command
- Used by the `complexity-check` skill for automated analysis
- Triggered by hooks after code edits (when `CLAUDE_COMPLEXITY_AUTO_CHECK=true`)

## Example Usage

```
User: Analyze the complexity of src/utils/dataProcessor.js

Agent: [Provides detailed complexity analysis with refactoring suggestions]

User: What's the cognitive complexity of this function?

Agent: [Calculates and explains cognitive complexity score]
```

## Limitations

- Requires parseable code syntax
- May not handle dynamic code generation
- Complex type systems may require additional analysis
- Some language-specific patterns need manual interpretation
