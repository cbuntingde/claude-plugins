---
description: Analyze codebase complexity and provide detailed migration metrics
arguments:
  - name: source
    description: Current framework/version or language
    required: true
  - name: target
    description: Target framework/version or language
    required: true
  - name: scope
    description: Directory or files to analyze (default: entire codebase)
    required: false
  - name: format
    description: Output format: text, json, or markdown (default: text)
    required: false
examples:
  - "/migrate-analyze react 17 react 18"
  - "/migrate-analyze python 2.7 python 3.12 --format json"
  - "/migrate-analyze javascript typescript --scope ./src/utils"
---

# /migrate-analyze

Perform comprehensive analysis of codebase to assess migration complexity and provide detailed metrics.

## What it does

This command provides an in-depth analysis including:

- **Code metrics**: Lines of code, file counts, complexity scores
- **Dependency graph**: Visual representation of package dependencies
- **Complexity analysis**: Identifies complex code that may need extra attention
- **Effort estimation**: Predicts time/effort required for migration
- **Risk scoring**: Assigns risk scores to different modules
- **Compatibility matrix**: Shows which parts are compatible vs. incompatible

## How to use

```
/migrate-analyze <source> <target> [--scope <path>] [--format <format>]
```

### Examples

**Analyze entire codebase:**
```
/migrate-analyze react 17 react 18
```

**JSON output for CI/CD:**
```
/migrate-analyze python 2.7 python 3.12 --format json > analysis.json
```

**Analyze specific directory:**
```
/migrate-analyze javascript typescript --scope ./src/utils
```

**Markdown report:**
```
/migrate-analyze vue 2 vue 3 --format markdown > migration-analysis.md
```

## Output sections

### 1. Overview Metrics

```
📊 Codebase Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Files:              247
Total Lines of Code:      18,432
Framework Version:        React 17.0.2
Target Version:           React 18.3.1
Language:                 JavaScript/JSX
```

### 2. Complexity Analysis

```
🔍 Complexity Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Low Complexity (60%):    148 files  ✅ Straightforward
Medium Complexity (30%): 74 files   ⚠️  Requires attention
High Complexity (10%):   25 files   🔴 Manual review needed
```

### 3. Effort Estimation

```
⏱️  Effort Estimation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Automatable Changes:     65%  (12,080 LOC)
Semi-automatable:        25%  (4,608 LOC)
Manual Only:             10%  (1,844 LOC)

Estimated Time:
  - Automated:            2-3 hours
  - Semi-automated:       8-12 hours
  - Manual work:          16-24 hours
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total:                  26-39 hours
```

### 4. Risk Assessment

```
⚠️  Risk Matrix
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Critical Risk:
  - src/components/LegacyWrapper.jsx (Uses removed APIs)
  - src/utils/async-helpers.js ( incompatible patterns)

High Risk:
  - src/state-management/ (Custom state logic conflicts with React 18)
  - src/performance/ (Concurrent features may affect)

Medium Risk:
  - src/hooks/ (7 files need review)
  - src/api/ (5 files with deprecated patterns)
```

### 5. Breaking Changes Detected

```
🔴 Breaking Changes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Found 12 breaking changes that will affect your codebase:

1. ReactDOM.render() removed
   Impact: 8 files need updating
   Difficulty: Low

2. Unsafe lifecycle methods removed
   Impact: 15 components affected
   Difficulty: Medium

3. Automatic batching changes
   Impact: 23 components may need useEffect adjustments
   Difficulty: Medium

[... more changes ...]
```

### 6. Dependency Analysis

```
📦 Dependencies Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compatible (45):
  ✅ react-dom → Already compatible
  ✅ lodash → No changes needed
  ✅ axios → Compatible

Update Required (12):
  ⚠️  @testing-library/react → Update to v13+
  ⚠️  react-router-dom → Update to v6+
  ⚠️  redux → Update to v8+

Incompatible (3):
  🔴 react-select-v2 → Need migration to v5
  🔴 redux-saga → Breaking changes in v1.2+
  🔴 @types/react → Major version bump needed
```

### 7. File-by-File Assessment

```
📋 File Assessment (Sample)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ src/App.jsx                    Compatible - No changes needed
⚠️  src/components/Button.jsx     Medium - 3 deprecated APIs
🔴 src/components/Modal.jsx       High - Removed lifecycle methods
✅ src/utils/format.js            Compatible
⚠️  src/hooks/useAuth.js          Medium - Async patterns changed
```

## Output formats

### Text (default)
Human-readable terminal output with color coding and emojis

### JSON
Machine-readable for CI/CD integration:
```json
{
  "summary": {
    "totalFiles": 247,
    "totalLines": 18432,
    "estimatedHours": 35
  },
  "complexity": {
    "low": 148,
    "medium": 74,
    "high": 25
  },
  "risks": [...]
}
```

### Markdown
Formatted documentation for reports and documentation

## Tips

- **Run early** in planning phase to understand scope
- **Use JSON output** for CI/CD pipelines and reporting
- **Compare analyses** before and after migration
- **Focus on high-risk files** identified in the analysis
- **Estimate based on your team's velocity**

## Integration with other commands

1. Start with `/migrate-analyze` to understand scope
2. Use `/migrate-plan` to create detailed migration plan
3. Run `/migrate-check` on specific files
4. Apply with `/migrate-apply`
5. Re-run `/migrate-analyze` to verify migration

## Example workflow

```bash
# Initial analysis
/migrate-analyze react 17 react 18 --format markdown > before-analysis.md

# Create plan
/migrate-plan react 17 react 18 > migration-plan.md

# Perform migration (review and repeat)
/migrate-check react 17 react 18 "src/**/*.jsx"
/migrate-apply react 17 react 18 "src/**/*.jsx"

# Verify results
/migrate-analyze react 17 react 18 --format markdown > after-analysis.md

# Compare analyses
diff before-analysis.md after-analysis.md
```
