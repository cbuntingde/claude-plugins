---
description: Deep analysis of log patterns, error clusters, and anomalies
---

# /analyze-logs

Perform deep analysis of log files to identify patterns, clusters, and anomalies that may indicate production issues.

## Usage

```
/analyze-logs <log-source> <analysis-type>
```

**Arguments:**
- `log-source` (optional): Path to log file, log directory, or log service name
- `analysis-type` (optional): Type of analysis (patterns, anomalies, errors, trends)

## Examples

```
/analyze-logs ./logs/app.log patterns
/analyze-logs /var/log/application errors
/analyze-logs cloudwatch-prod anomalies
/analyze-logs trends last 24 hours
```

## What it does

Performs comprehensive log analysis:

1. **Pattern Discovery**: Identifies recurring log patterns and templates
2. **Error Clustering**: Groups similar errors to find common root causes
3. **Anomaly Detection**: Finds unusual log patterns that deviate from normal
4. **Trend Analysis**: Identifies increasing/decreasing error rates over time
5. **Log Volume Analysis**: Detects log volume spikes or drops
6. **Error Signature Analysis**: Creates fingerprints of error types
7. **Sequence Analysis**: Identifies common event sequences that lead to errors
8. **Frequency Analysis**: Finds the most frequent errors and warnings

## Analysis Types

**patterns**: Discovers common log message patterns and structures
**errors**: Focuses on error and exception messages
**anomalies**: Finds statistically unusual log entries
**trends**: Analyzes how log patterns change over time
**all**: Performs all analyses

## Output

- **Pattern Summary**: Most common log patterns with counts
- **Error Clusters**: Grouped errors by similarity
- **Anomalies**: Unusual log entries requiring attention
- **Trends**: Time-series data showing error rate changes
- **Heat Maps**: Visual representation of error frequency by time and severity
- **Recommendations**: Suggested actions based on findings

## Advanced Features

- **Log Parsing**: Automatically detects log formats (JSON, Apache, Nginx, custom)
- **Template Extraction**: Generates log templates from raw logs
- **Field Extraction**: Identifies and extracts key fields from unstructured logs
- **Statistical Analysis**: Applies statistical models for anomaly detection
- **Machine Learning**: Uses ML for pattern recognition when sufficient data available

## Integration

Supports:
- Local log files
- Remote log servers via SSH
- Log aggregation APIs (ELK, Splunk, CloudWatch Logs, etc.)
- Standard input (piped logs)

## Tips

- Use `/analyze-logs` proactively to establish baselines
- Compare analysis before and after deployments
- Focus on anomalies during incidents
- Use patterns analysis to create log-based alerts
