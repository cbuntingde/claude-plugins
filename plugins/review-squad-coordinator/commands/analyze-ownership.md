---
name: analyze-ownership
description: Analyze code ownership patterns and expertise in the repository
---

# /analyze-ownership

Analyze code ownership patterns and expertise distribution in your repository.

## What it does

- Scans git history to identify code expertise
- Analyzes CODEOWNERS file coverage
- Identifies expertise clusters and ownership gaps
- Generates ownership heatmaps

## Usage

```bash
/analyze-ownership
```

```bash
/analyze-ownership --since 2024-01-01
```

```bash
/analyze-ownership --output json
```

## Options

- `--since <date>`: Analyze commits since date (format: YYYY-MM-DD)
- `--output <format>`: Output format (text, json, markdown)
- `--pattern <glob>`: Only analyze files matching pattern
- `--threshold <number>`: Minimum commits to consider expertise (default: 5)

## Examples

```bash
/analyze-ownership --since 2024-01-01 --output markdown
/analyze-ownership --pattern "src/**/*.ts" --threshold 10
```

## Output

The analysis includes:
- Top expertise areas per contributor
- CODEOWNERS coverage percentage
- Ownership gaps and建议
- Expertise heatmap by directory

## Requirements

- Git repository with history
- CODEOWNERS file for ownership analysis