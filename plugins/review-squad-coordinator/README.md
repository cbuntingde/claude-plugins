# Review Squad Coordinator

Auto-assign code reviewers based on code ownership patterns, expertise analysis, and availability.

## Description

This plugin analyzes your repository's CODEOWNERS file, git history, and contributor patterns to intelligently suggest reviewers for pull requests. It prioritizes:

- **Codeowners**: Files matching CODEOWNERS patterns get their designated reviewers
- **Expertise**: Contributors with history in modified files get higher priority
- **Availability**: Round-robin distribution prevents reviewer burnout
- **Fairness**: Automatically excludes recently reviewed files and PR authors

## Installation

```bash
# Install via Claude Code plugin manager
/plugin install review-squad-coordinator@dev-plugins
```

## Usage

### Assign Reviewers

Automatically assign the best reviewers for your PR:

```bash
/assign-reviewers
```

Options:
- `--author <username>`: PR author's username
- `--files <patterns...>`: Specific files to analyze
- `--max-reviewers <n>`: Maximum reviewers (default: 3)
- `--base-branch <branch>`: Base branch for diff (default: main)

Example:
```bash
/assign-reviewers --author developer1 --max-reviewers 2
```

### Analyze Ownership

Get insights into code ownership patterns:

```bash
/analyze-ownership
```

Options:
- `--since <date>`: Analyze commits since date (YYYY-MM-DD)
- `--output <format>`: Output format: text, json, markdown
- `--pattern <glob>`: Only analyze files matching pattern
- `--threshold <n>`: Minimum commits for expertise (default: 5)

Example:
```bash
/analyze-ownership --since 2024-01-01 --output markdown
```

### Generate CODEOWNERS

Create CODEOWNERS suggestions based on git blame:

```bash
/generate-owners
```

Options:
- `--files <patterns...>`: Specific files to analyze
- `--output <path>`: Output file path
- `--exclude <patterns...>`: Patterns to exclude
- `--min-commits <n>`: Minimum commits to be owner (default: 3)

Example:
```bash
/generate-owners --output .github/CODEOWNERS
```

## Configuration

Create a `.review-squadrc.json` file in your repository root:

```json
{
  "ownershipFile": "CODEOWNERS",
  "maxReviewersPerPR": 3,
  "minReviewersPerPR": 1,
  "excludeAuthorFromReview": true,
  "excludeRecentlyReviewed": true,
  "recentReviewThresholdDays": 7,
  "expertiseWeight": 0.4,
  "ownershipWeight": 0.4,
  "availabilityWeight": 0.2,
  "roundRobinEnabled": true,
  "fallbackReviewers": ["@team-lead", "@senior-dev"]
}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `ownershipFile` | Path to CODEOWNERS file | `CODEOWNERS` |
| `maxReviewersPerPR` | Maximum reviewers to assign | 3 |
| `minReviewersPerPR` | Minimum reviewers needed | 1 |
| `excludeAuthorFromReview` | Don't assign PR author | `true` |
| `excludeRecentlyReviewed` | Exclude recent reviewers | `true` |
| `recentReviewThresholdDays` | Days to consider "recent" | 7 |
| `expertiseWeight` | Weight for expertise score | 0.4 |
| `ownershipWeight` | Weight for ownership score | 0.4 |
| `availabilityWeight` | Weight for availability | 0.2 |
| `roundRobinEnabled` | Enable load balancing | `true` |
| `fallbackReviewers` | Fallback reviewer list | `[]` |

## Requirements

- Git repository with history
- Node.js 18+
- Optional: CODEOWNERS file for ownership-based assignment

## Troubleshooting

### No CODEOWNERS file found

Create a basic CODEOWNERS file:
```bash
/generate-owners --output CODEOWNERS
```

Then review and commit the generated file.

### No reviewers being assigned

Ensure:
1. Files are tracked in git
2. CODEOWNERS file exists and has valid patterns
3. Fallback reviewers are configured

### Exclude patterns not working

The `--exclude` patterns use glob matching. Escape special characters:
```bash
/generate-owners --exclude "**/node_modules/**" "**/*.generated.*"
```

## Security

- Git history is read locally only
- No external API calls
- Configuration files are local
- No sensitive data is transmitted

## License

MIT