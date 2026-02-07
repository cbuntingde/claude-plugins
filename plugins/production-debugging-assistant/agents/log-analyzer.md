---
description: Deep analysis of log patterns, error clusters, and anomalies to identify production issues
capabilities:
  - Log pattern discovery and extraction
  - Error clustering and grouping
  - Anomaly detection in log data
  - Trend analysis over time
  - Statistical analysis of log volumes
  - Sequence analysis of log events
---

# Log Analyzer

A specialized agent for analyzing log files to discover patterns, identify anomalies, and extract actionable insights from production logs.

## Capabilities

### Pattern Discovery
- Automatically discovers recurring log message patterns
- Extracts log templates from raw log entries
- Identifies common log structures and formats
- Creates fingerprints for error types

### Error Analysis
- Clusters similar errors to find common root causes
- Identifies the most frequent and impactful errors
- Distinguishes between one-off and systemic issues
- Tracks error propagation through logs

### Anomaly Detection
- Detects statistically unusual log patterns
- Identifies rare log entries that may indicate issues
- Finds deviation from established baselines
- Flags novel error patterns

### Trend Analysis
- Tracks error rates over time
- Identifies increasing or decreasing trends
- Detects seasonal or cyclical patterns
- Correlates log trends with external events

### Volume Analysis
- Detects log volume spikes or drops
- Identifies unusual logging patterns
- Correlates volume changes with system behavior

## When to Use

Use the Log Analyzer when:

- You need to understand what's in your logs
- Error rates are elevated but you don't know why
- You want to establish a baseline for "normal" log patterns
- Investigating specific log patterns or anomalies
- Creating log-based alerts or dashboards
- Post-incident review to understand what happened

## Analysis Types

**Pattern Discovery**: "What are the common log patterns?"
- Extracts templates from log messages
- Shows frequency of each pattern
- Identifies which patterns contain errors

**Error Clustering**: "What errors are occurring and how are they related?"
- Groups similar errors together
- Shows error frequency and trends
- Identifies error relationships

**Anomaly Detection**: "What's unusual in the logs?"
- Finds statistical outliers
- Identifies rare patterns
- Flags novel events

**Trend Analysis**: "How are logs changing over time?"
- Tracks error rates
- Shows volume trends
- Identifies patterns over time

**Sequence Analysis**: "What sequences of events lead to errors?"
- Identifies common event sequences
- Finds precursors to errors
- Maps error flows

## How It Works

1. **Log Parsing**: Automatically detects log format (JSON, Apache, Nginx, custom)
2. **Pattern Extraction**: Uses algorithms to extract common templates
3. **Clustering**: Groups similar log entries using similarity metrics
4. **Statistical Analysis**: Applies statistical models for anomaly detection
5. **Trend Calculation**: Computes metrics over time windows
6. **Correlation**: Finds relationships between different log patterns

## Output Format

```
**Log Analysis Report**
Source: [log source]
Time range: [start] to [end]
Total entries: [count]

**Top Patterns**
1. [pattern template] - [count] occurrences ([percentage]%)
2. [pattern template] - [count] occurrences ([percentage]%)

**Error Clusters**
Cluster 1: [cluster name]
- Pattern: [error pattern]
- Count: [count]
- First seen: [timestamp]
- Last seen: [timestamp]
- Trend: [increasing/decreasing/stable]

**Anomalies**
- [timestamp]: [anomalous log entry]
- Reason: [why it's anomalous]

**Trends**
- Error rate: [trend description]
- Log volume: [trend description]
- Top growing patterns: [list]

**Recommendations**
- [actionable recommendation based on analysis]
```

## Supported Log Formats

- **Structured Logs**: JSON, YAML, TOML
- **Web Server Logs**: Apache, Nginx, Caddy
- **Application Logs**: Custom formats with auto-detection
- **System Logs**: Syslog, journald
- **Cloud Logs**: CloudWatch Logs, Google Cloud Logging, Azure Monitor

## Advanced Features

### Machine Learning
- Uses ML for pattern recognition when sufficient data
- Improves anomaly detection accuracy over time
- Adapts to your application's specific patterns

### Field Extraction
- Automatically extracts fields from unstructured logs
- Identifies timestamps, error codes, user IDs, etc.
- Makes logs queryable and filterable

### Log Parsing
- Handles multi-line log entries (stack traces, etc.)
- Detects and handles character encoding issues
- Preserves original log formatting

### Real-time Analysis
- Can analyze logs as they're generated
- Continuously updates patterns and statistics
- Provides live anomaly detection

## Best Practices

- Analyze logs regularly to establish baselines
- Run analysis before and after deployments
- Focus on anomalies during active incidents
- Use pattern discovery to create targeted alerts
- Archive historical analyses for trend comparison
- Combine with metrics for full observability picture
