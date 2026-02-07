# author-patterns

Analyzes contribution patterns by author to understand individual working styles and collaboration patterns.

## Description

Provides detailed analysis of author contributions:
- Commit patterns and distribution (fix, feat, refactor, etc.)
- Working hours and day-of-week preferences
- Most frequently edited files by the author
- Collaboration patterns with other contributors
- Overall ranking in the repository

## Usage

```bash
npm run author-patterns                           # List all authors
npm run author-patterns -- <author-name>          # Analyze specific author
npm run author-patterns -- --since="1 year ago"   # Custom time period
```

## Options

- `<author-name>` - Name of the author to analyze (optional, without this lists all authors)
- `--since=<period>` - Time period to analyze (default: "6 months ago")
- `--help`, `-h` - Show help message

## Examples

```bash
# List all contributors
npm run author-patterns

# Analyze a specific author
npm run author-patterns -- "John Doe"

# Analyze with custom time period
npm run author-patterns -- --since="1 year ago" "Jane Smith"

# Last 30 days
npm run author-patterns -- --since="30 days ago"
```

## Output

For specific author analysis:
- Summary statistics (total commits, date range, avg message length)
- Commit pattern distribution
- Working hours analysis
- Day of week distribution
- Most worked on files
- Frequent collaborators
- Overall ranking

For all authors view:
- Table of all contributors sorted by commit count

## Example Output

```
═══════════════════════════════════════════════════════════
                  AUTHOR PATTERN ANALYSIS
═══════════════════════════════════════════════════════════

Repository: my-project
Author: John Doe
Email: john@example.com
Analysis Period: 6 months ago

📊 Summary
┌──────────────────────────┬─────────────────────────┐
│ Metric                   │ Value                   │
├──────────────────────────┼─────────────────────────┤
│ Total Commits            │ 456                     │
│ First Commit             │ 2024-07-15              │
│ Last Commit              │ 2025-01-22              │
│ Avg Message Length       │ 45.2 chars              │
│ Most Active Period       │ Afternoon               │
└──────────────────────────┴─────────────────────────┘

🏷️  Commit Pattern Distribution
┌────────────────────┬─────────────┬─────────────┐
│ Pattern            │ Commits     │ Percentage  │
├────────────────────┼─────────────┼─────────────┤
│ feat               │ 180         │ 39.5%       │
│ fix                │ 90          │ 19.7%       │
│ refactor           │ 60          │ 13.2%       │
└────────────────────┴─────────────┴─────────────┘

🤝 Frequent Collaborators
┌───────────────────────────────┬─────────────────┐
│ Collaborator                  │ Shared Commits  │
├───────────────────────────────┼─────────────────┤
│ Jane Smith                    │ 45              │
│ Bob Johnson                   │ 23              │
└───────────────────────────────┴─────────────────┘

🏆 Standing in Repository
  Rank: 1 of 12 authors
  Contribution: 36.6% of all commits
```
