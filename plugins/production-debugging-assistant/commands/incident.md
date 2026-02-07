---
description: Investigate and correlate production incidents across logs, metrics, and traces
---

# /incident

Investigate a production incident by correlating errors across logs, metrics, traces, and recent deployments.

## Usage

```
/incident <time-range> <error-pattern>
```

**Arguments:**
- `time-range` (optional): Time window to analyze (e.g., "last 30 minutes", "between 2-3 PM today")
- `error-pattern` (optional): Specific error pattern or description to search for

## Examples

```
/incident last 30 minutes
/incident last hour database timeout errors
/incident since 2 PM connection refused
```

## What it does

This command performs comprehensive incident analysis by:

1. **Time-based Correlation**: Analyzes the specified time window for patterns
2. **Log Analysis**: Searches for error spikes, exceptions, and unusual patterns
3. **Metrics Correlation**: Correlates with performance metrics (CPU, memory, latency, throughput)
4. **Deploy Correlation**: Checks for recent deployments that may have caused issues
5. **Cross-System Analysis**: Identifies if errors in one system correlate with issues in another (e.g., app errors coinciding with database slowdown)
6. **Trace Analysis**: Follows distributed traces to identify bottlenecks and failure points
7. **Root Cause Hypothesis**: Generates likely root causes based on correlations

## Output

The investigation produces:

- **Incident Timeline**: Chronological view of events during the incident
- **Correlation Matrix**: Shows relationships between different signals
- **Affected Systems**: List of impacted components
- **Likely Root Causes**: Prioritized list of probable causes with confidence scores
- **Recommended Actions**: Immediate mitigation steps
- **Evidence**: Links to relevant logs, metrics, and traces

## Integration

This command works with:
- Log aggregation systems (ELK, Splunk, CloudWatch Logs, etc.)
- Metrics platforms (Prometheus, Datadog, CloudWatch, etc.)
- Tracing systems (Jaeger, Zipkin, OpenTelemetry, etc.)
- CI/CD platforms (to check recent deployments)

## Tips

- Start with `/incident` without arguments for a quick overview of recent anomalies
- Use specific time windows to reduce noise during ongoing incidents
- Include error patterns to focus investigation on known issues
- Combine with `/correlate` for deeper cross-system analysis
