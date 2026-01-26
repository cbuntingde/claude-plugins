# extract-knowledge

Mine git history for tribal knowledge and context about your repository.

## Description

Analyzes your git repository to extract valuable insights including:
- Top contributors and their commit patterns
- Commit message patterns (fix, feat, refactor, etc.)
- Activity distribution by time of day
- Most frequently changed files
- Common keywords and phrases in commit messages
- Branch insights

## Usage

```bash
npm run extract-knowledge
npm run extract-knowledge -- --since="1 year ago"
```

## Options

- `--since=<period>` - Time period to analyze (default: "6 months ago")

## Examples

```bash
# Analyze last 6 months (default)
npm run extract-knowledge

# Analyze last year
npm run extract-knowledge -- --since="1 year ago"

# Analyze last 30 days
npm run extract-knowledge -- --since="30 days ago"
```

## Output

The command generates:
1. A formatted console report with all insights
2. A JSON file (`tribal-knowledge-report.json`) with the complete data

## Example Output

```
═══════════════════════════════════════════════════════════
          TRIBAL KNOWLEDGE EXTRACTION REPORT
═══════════════════════════════════════════════════════════

Repository: my-project
Analysis Date: 2025-01-23T10:30:00.000Z
Commits Analyzed: 1,247

📊 Top Contributors
┌──────────────────────┬─────────────┬─────────────┐
│ Author               │ Commits     │ Percentage  │
├──────────────────────┼─────────────┼─────────────┤
│ John Doe             │ 456         │ 36.6%       │
│ Jane Smith           │ 234         │ 18.8%       │
└──────────────────────┴─────────────┴─────────────┘

🏷️  Commit Patterns
┌────────────────────┬─────────────┬─────────────┐
│ Pattern            │ Count       │ Percentage  │
├────────────────────┼─────────────┼─────────────┤
│ fix                │ 234         │ 18.8%       │
│ feat               │ 456         │ 36.6%       │
│ refactor           │ 123         │ 9.9%        │
└────────────────────┴─────────────┴─────────────┘
```
