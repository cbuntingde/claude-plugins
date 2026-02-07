# Tribal Knowledge Extractor

Mine git history for context about code evolution, patterns, and team knowledge.

## Description

Extracts valuable insights from your git repository to understand:
- Who contributes what and when
- How code evolves over time
- Team collaboration patterns
- Project velocity and trends
- Common commit patterns and keywords

This plugin helps uncover tribal knowledge that's often lost in commit history, making it easier to understand project context, contributor patterns, and code evolution.

## Installation

1. Install dependencies:
```bash
npm install
```

2. The plugin scripts are now available via npm:

```bash
npm run extract-knowledge
npm run file-history -- <file-path>
npm run author-patterns
npm run commit-timeline
```

## Usage

### extract-knowledge

Generate a comprehensive knowledge extraction report for your repository:

```bash
npm run extract-knowledge
npm run extract-knowledge -- --since="1 year ago"
npm run extract-knowledge -- --since="30 days ago"
```

Output includes:
- Top contributors and their percentages
- Commit patterns (fix, feat, refactor, etc.)
- Activity distribution by time of day
- Most changed files
- Common keywords in commit messages
- Branch insights

Also generates `tribal-knowledge-report.json` with complete data.

### file-history

Analyze a specific file's history and author contributions:

```bash
npm run file-history -- src/index.js
npm run file-history -- package.json
npm run file-history -- components/Header.tsx
```

Shows:
- File statistics (lines, commits, additions/deletions)
- Author contributions via git blame
- Recent activity timeline
- Complete commit history

### author-patterns

Analyze contribution patterns by author:

```bash
# List all contributors
npm run author-patterns

# Analyze specific author
npm run author-patterns -- "John Doe"

# Custom time period
npm run author-patterns -- --since="1 year ago" "Jane Smith"
```

Reveals:
- Commit pattern distribution
- Working hours and day preferences
- Most worked-on files
- Collaboration patterns
- Overall repository ranking

### commit-timeline

Visualize commit activity over time:

```bash
# Default: 30 days, daily view
npm run commit-timeline

# Custom period
npm run commit-timeline -- --since="7 days ago"

# Weekly view (3 months)
npm run commit-timeline -- --weekly
```

Displays:
- Daily/weekly activity with visual charts
- Hourly commit distribution
- Day of week analysis
- Activity hotspots
- Velocity metrics and trends

## Configuration

No configuration required. The plugin works with any git repository.

### Time Period Formats

All commands support `--since` with flexible time formats:
- `--since="30 days ago"`
- `--since="6 months ago"`
- `--since="1 year ago"`
- `--since="2024-01-01"`

## Security Considerations

- The plugin reads only git history, which is typically local to your repository
- No external API calls or network requests
- Commit messages and author information are extracted from git log
- Generated JSON reports may contain sensitive project information - handle appropriately
- No credentials or secrets are accessed or stored

## Requirements

- Node.js >= 14.0.0
- A git repository with commit history
- Terminal with UTF-8 support (for colored output)

## Troubleshooting

**"Not a git repository" error**
- Ensure you're running commands from within a git repository
- Check that `.git` directory exists

**No commits found**
- Verify your repository has commits within the specified time period
- Try a longer time period: `--since="1 year ago"`

**Author name not found**
- Use exact author name as shown in `git log`
- Run `npm run author-patterns` to list all available authors

**File not found error**
- Use relative or absolute paths to files
- Verify the file exists and is tracked by git

## Dependencies

- `chalk` - Terminal string styling
- `cli-table3` - Pretty CLI tables
