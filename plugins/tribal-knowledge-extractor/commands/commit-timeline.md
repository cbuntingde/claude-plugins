# commit-timeline

Visualizes commit activity over time with various granularity options to understand project velocity and patterns.

## Description

Generates visual timelines of commit activity:
- Daily activity timeline (last 21 days shown)
- Weekly activity summary (3 months)
- Hourly distribution showing when commits are made
- Day of week analysis
- Activity hotspots and velocity trends

## Usage

```bash
npm run commit-timeline                     # Default: 30 days
npm run commit-timeline -- --since=<period> # Custom period
npm run commit-timeline -- --weekly         # Weekly view (3 months)
```

## Options

- `--since=<period>` - Time period to analyze (default: "30 days ago")
- `--weekly` - Show weekly aggregation (uses 3 months of data)
- `--help`, `-h` - Show help message

## Examples

```bash
# Default: Last 30 days, daily view
npm run commit-timeline

# Last 7 days
npm run commit-timeline -- --since="7 days ago"

# Last 3 months, weekly view
npm run commit-timeline -- --weekly

# Last year, daily view
npm run commit-timeline -- --since="1 year ago"

# Last 6 months with weekly aggregation
npm run commit-timeline -- --since="6 months ago" --weekly
```

## Output

The command displays:
- Daily or weekly activity timeline with visual bar charts
- Hourly activity distribution (when commits happen during the day)
- Day of week activity distribution
- Most active days (hotspots)
- Velocity metrics (average daily commits, trend)

## Example Output

```
═══════════════════════════════════════════════════════════
                    COMMIT TIMELINE REPORT
═══════════════════════════════════════════════════════════

Repository: my-project
Analysis Period: 30 days ago
Generated: 2025-01-23T10:30:00.000Z

📅 Daily Activity
  Jan 01    Wed  ████████████████░░░░░░░░░░░░   12 commits
  Jan 02    Thu  ████████████████████████████   24 commits
  Jan 03    Fri  ████████░░░░░░░░░░░░░░░░░░░░░    8 commits

📈 Velocity Metrics
  Average Daily Commits: 15.3
  Trend: increasing 📈

⏰ Hourly Activity Distribution

  Commits by hour of day (24-hour format):

  00:00  ████░░░░░░░░░░░░░░░░░░░░░░░░░   12
  09:00  ████████████████████████████   45
  10:00  ████████████████████████████   52
  14:00  ████████████████████░░░░░░░░░   32
  ...

📊 Day of Week Activity
┌─────────────┬───────────┬─────────────┬───────────────────┐
│ Day         │ Commits   │ Percentage  │ Activity          │
├─────────────┼───────────┼─────────────┼───────────────────┤
│ Monday      │ 234       │ 28.5%       │ ████████████      │
│ Tuesday     │ 189       │ 23.0%       │ ██████████        │
│ Wednesday   │ 156       │ 19.0%       │ ████████          │
│ Thursday    │ 123       │ 15.0%       │ ██████            │
│ Friday      │ 98        │ 11.9%       │ █████             │
│ Saturday    │ 15        │ 1.8%        │ █                 │
│ Sunday      │ 6         │ 0.7%        │                  │
└─────────────┴───────────┴─────────────┴───────────────────┘
```
