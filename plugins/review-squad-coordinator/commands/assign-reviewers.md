---
name: assign-reviewers
description: Auto-assign code reviewers based on CODEOWNERS and expertise analysis
---

# /assign-reviewers

Auto-assign the most appropriate reviewers for your pull request based on code ownership patterns, expertise, and availability.

## What it does

- Analyzes modified files against CODEOWNERS patterns
- Scores reviewers by ownership, expertise, and availability
- Excludes the PR author from reviewers
- Respects round-robin distribution for fair workload
- Falls back to configured reviewers if needed

## Usage

```bash
/assign-reviewers
```

```bash
/assign-reviewers --author @username
```

```bash
/assign-reviewers --files "src/api/**" "src/utils/**"
```

```bash
/assign-reviewers --max-reviewers 5
```

## Options

- `--author <username>`: PR author's username (auto-detected from git config if not provided)
- `--files <patterns...>`: Specific files to analyze (defaults to changed files from git)
- `--max-reviewers <number>`: Maximum reviewers to assign (default: 3)
- `--config <path>`: Path to config file
- `--exclude-recent`: Exclude recently reviewed files (default: true)

## Examples

```bash
/assign-reviewers --author developer1
/assign-reviewers --files "src/**/*.ts" "src/**/*.js" --max-reviewers 2
```

## Output

The command outputs a markdown-formatted reviewer assignment including:
- Selected reviewers with scores
- Matched files for each reviewer
- Reason for selection
- Overall summary

## Configuration

Create a `.review-squadrc.json` file:

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

## Requirements

- Git repository with CODEOWNERS file (optional)
- Git history for expertise analysis (optional)