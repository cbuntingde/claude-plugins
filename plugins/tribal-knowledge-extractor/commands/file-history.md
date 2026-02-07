# file-history

Shows detailed history for a specific file including author attribution and evolution over time.

## Description

Provides comprehensive analysis of a single file's history:
- File statistics (lines, commits, additions/deletions)
- Author contributions based on git blame
- Recent activity timeline
- Complete commit history for the file

## Usage

```bash
npm run file-history -- <file-path>
```

## Options

- `<file-path>` - Path to the file to analyze (required)
- `--help`, `-h` - Show help message

## Examples

```bash
# Analyze a specific file
npm run file-history -- src/index.js

# Analyze a config file
npm run file-history -- package.json

# Analyze a component file
npm run file-history -- components/Header.tsx
```

## Output

The command displays:
- File statistics table
- Authors by contribution (with percentages)
- Recent activity timeline (last 30 days)
- Most recent 10 commit history entries

## Example Output

```
═══════════════════════════════════════════════════════════
                    FILE HISTORY REPORT
═══════════════════════════════════════════════════════════

Repository: my-project
File: src/index.js
Analysis Date: 2025-01-23T10:30:00.000Z

📊 File Statistics
┌──────────────────────┬─────────────────────┐
│ Metric               │ Value               │
├──────────────────────┼─────────────────────┤
│ Current Lines        │ 1,234               │
│ Total Commits        │ 56                  │
│ Lines Added          │ 3,456               │
│ Lines Deleted        │ 2,222               │
│ Net Change           │ 1,234               │
└──────────────────────┴─────────────────────┘

✍️  Authors by Contribution
┌──────────────────────┬────────────────┬─────────────┐
│ Author               │ Lines Authored │ Percentage  │
├──────────────────────┼────────────────┼─────────────┤
│ John Doe             │ 800             │ 64.8%       │
│ Jane Smith           │ 300             │ 24.3%       │
└──────────────────────┴────────────────┴─────────────┘
```
