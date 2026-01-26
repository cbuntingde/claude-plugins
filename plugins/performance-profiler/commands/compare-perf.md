---
description: Compare performance across multiple profile runs
---

# Compare Performance

Visualizes and compares performance data across multiple profile runs, benchmarks, or time periods.

## Usage

```
compare-perf [profiles...] [options]
```

### Arguments

- `profiles`: Profile files or benchmark results to compare. Can use glob patterns.
- `--baseline <file>`: Baseline profile for comparison
- `--trend <pattern>`: Analyze trend across matching profiles

### Options

- `--metric <type>`: Metric to compare - `time`, `memory`, `throughput`, or `all`
- `--threshold <percent>`: Significant change threshold. Default: 10
- `--format <type>`: Output format - `text`, `json`, `html`, or `chart`
- `--output <file>`: Save comparison report to file
- `--regression`: Check for performance regressions only

## Examples

**Compare two profiles:**
```
compare-perf profile-before.json profile-after.json
```

**Compare against baseline:**
```
compare-perf --baseline profile-v1.0.json profile-current.json
```

**Analyze performance trend:**
```
compare-perf --trend "profiles/build-*.json" --format chart
```

**Check for regressions:**
```
compare-perf --regression --threshold 5
```

**Generate HTML report:**
```
compare-perf profile-*.json --format html --output comparison.html
```

## Comparison Metrics

### Time Metrics
- Total execution time
- Function-level timings
- Percentiles (P50, P95, P99)
- Time by category

### Memory Metrics
- Peak memory usage
- Average memory
- Memory growth rate
- GC frequency and duration

### Throughput Metrics
- Operations per second
- Request rate
- Batch processing speed

## Output Formats

### Text
Human-readable comparison table with color-coded changes:
- 🔴 Regressions (worse performance)
- 🟢 Improvements (better performance)
- 🟡 No significant change

### JSON
Machine-readable format for CI/CD integration:
```json
{
  "comparisons": [
    {
      "metric": "total_time",
      "before": 1250,
      "after": 980,
      "change": -21.6,
      "status": "improved"
    }
  ]
}
```

### HTML
Interactive visual report with:
- Charts and graphs
- Drill-down capability
- Trend lines
- Export options

### Chart
Visual comparison images (PNG/SVG)

## Regression Detection

Automatically detects and reports regressions:

```
🔴 REGRESSION: processOrders() +45.2% (234ms → 340ms)
   Location: src/services/order.service.ts:45
   Impact: High - affects API response time
```

## CI/CD Integration

Fail builds on performance regression:

```yaml
# .github/workflows/performance.yml
- name: Compare performance
  run: |
    claude compare-perf \
      --baseline baseline.json \
      --threshold 10 \
      --regression
```

## Trend Analysis

Track performance over time:

```
compare-perf --trend "perf-*.json" --format chart
```

Generates trend charts showing:
- Performance over builds/commits
- Moving averages
- Regression detection
- Capacity planning insights

## See Also

- `/profile` - Generate profiles to compare
- `/benchmark` --save - Create benchmark baselines
