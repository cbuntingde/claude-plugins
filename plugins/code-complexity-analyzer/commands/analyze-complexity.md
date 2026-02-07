---
description: Analyze code complexity and get refactoring recommendations
arguments:
  - name: target
    description: "File, directory, or function to analyze (optional: defaults to current directory)"
    required: false
    variadic: true
  - name: threshold
    description: "Complexity threshold for flagging (default: 15)"
    required: false
  - name: output
    description: "Output format: table, detailed, json (default: detailed)"
    required: false
options:
  - name: --cognitive
    description: "Include cognitive complexity analysis"
  - name: --minimal
    description: "Only show functions exceeding thresholds"
  - name: --suggest
    description: "Include refactoring suggestions"
---

# Analyze Code Complexity

Analyzes code complexity metrics for functions and methods, identifying overly complex code that may benefit from refactoring.

## Usage

```bash
/analyze-complexity [target] [--threshold=N] [--output=format] [--cognitive] [--minimal] [--suggest]
```

### Arguments

- **`target`** (optional): File path, directory, or function name to analyze
  - Defaults to analyzing all code in the current directory
  - Can be a specific file: `src/utils/dataProcessor.js`
  - Can be a directory: `src/components/`
  - Can be a glob pattern: `**/*.py`

### Options

- **`--threshold=N`**: Set complexity threshold for flagging (default: 15)
  - Functions with complexity above this value will be flagged
  - Lower values = more strict analysis

- **`--output=format`**: Choose output format
  - `table`: Compact table view with key metrics
  - `detailed`: Full analysis with explanations (default)
  - `json`: Machine-readable JSON format

- **`--cognitive`**: Include cognitive complexity analysis
  - Measures how hard code is to understand
  - Adds cognitive complexity scores to output

- **`--minimal`**: Only show functions exceeding thresholds
  - Hides functions that pass complexity checks
  - Useful for large codebases

- **`--suggest`**: Include refactoring suggestions
  - Provides specific recommendations for each flagged function
  - Shows before/after code examples

## Examples

### Analyze Current Directory

```bash
/analyze-complexity
```

Analyzes all code files in the current directory and displays detailed complexity metrics.

### Analyze Specific File with Suggestions

```bash
/analyze-complexity src/utils/dataProcessor.js --suggest
```

Analyzes the specified file and includes refactoring suggestions for complex functions.

### Table View with Custom Threshold

```bash
/analyze-complexity src/ --threshold=10 --output=table
```

Shows a compact table of all functions in `src/` that exceed complexity 10.

### Include Cognitive Complexity

```bash
/analyze-complexity --cognitive --minimal
```

Shows only functions exceeding thresholds, including cognitive complexity scores.

### JSON Output for CI/CD

```bash
/analyze-complexity --output=json --threshold=20 > complexity-report.json
```

Generates a JSON report suitable for CI/CD pipelines or automated tooling.

## What Gets Analyzed

The command analyzes:

1. **Cyclomatic Complexity**: Number of decision points
2. **Function Length**: Lines of code per function
3. **Nesting Depth**: Maximum nesting level
4. **Parameter Count**: Number of function parameters
5. **Cognitive Complexity** (with `--cognitive`): Readability difficulty

## Output Examples

### Table Output

```
Complexity Analysis Report

┌─────────────────────────────┬───────┬──────────┬────────┬───────┬─────────┐
│ File                        │ Func  │ Cycloma  │ Lines  │ Nest  │ Params  │
├─────────────────────────────┼───────┼──────────┼────────┼───────┼─────────┤
│ src/processor.js            │ parse │ 28       │ 89     │ 5     │ 3       │
│ src/processor.js            │ valid │ 12       │ 45     │ 3     │ 2       │
│ utils/helper.js             │ fetch │ 35       │ 124    │ 6     │ 4       │
└─────────────────────────────┴───────┴──────────┴────────┴───────┴─────────┘

Threshold: 15
⚠️ 3 functions exceed complexity threshold
```

### Detailed Output

```markdown
## Complexity Analysis for: src/processor.js

### Function: parseData (lines 15-103)
🔴 **HIGH COMPLEXITY** - Action Required

**Metrics:**
- Cyclomatic Complexity: **28** (threshold: 15) ⚠️
- Lines of Code: 89
- Nesting Depth: 5 levels
- Parameters: 3

**Issues:**
1. Excessive cyclomatic complexity (13 over threshold)
2. Deep nesting detected (5 levels)
3. Function too long (89 lines)

**Recommendations:**
1. Extract validation logic into separate function
2. Reduce nesting using early returns
3. Consider Strategy pattern for data processing

[View detailed refactoring plan with /analyze-complexity --suggest]
```

## Integration with Hooks

This command can be triggered automatically via hooks after code edits when the environment variable `CLAUDE_COMPLEXITY_AUTO_CHECK=true` is set.

## Related Commands

- `/complexity-check` (skill): Automated complexity checking during development
- `/complexity-analyzer` (agent): Direct agent access for custom analysis

## See Also

- [Code Complexity Analyzer Agent](../agents/complexity-analyzer.md)
- [Complexity Check Skill](../skills/complexity-check/SKILL.md)
