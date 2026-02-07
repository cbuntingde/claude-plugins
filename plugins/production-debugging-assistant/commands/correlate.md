---
description: Correlate errors and events across multiple systems and services
---

# /correlate

Correlate events, errors, and metrics across multiple systems to identify relationships and dependencies.

## Usage

```
/correlate <systems> <time-range> <event-type>
```

**Arguments:**
- `systems` (optional): Systems to correlate (e.g., "app, database, cache")
- `time-range` (optional): Time window for analysis
- `event-type` (optional): Type of events to correlate (errors, latency, throughput)

## Examples

```
/correlate app, database, cache last 2 hours
/correlate api-gateway, auth-service errors
/correlate payment-service, database, redis since deploy
```

## What it does

Performs cross-system correlation analysis:

1. **Multi-System Search**: Queries logs and metrics from multiple systems simultaneously
2. **Temporal Correlation**: Identifies events that occur at the same time across systems
3. **Dependency Mapping**: Maps which system failures trigger cascading issues
4. **Pattern Recognition**: Finds recurring patterns of correlated failures
5. **Causality Analysis**: Attempts to distinguish between correlation and causation
6. **Impact Assessment**: Shows which system is the likely origin of issues

## Use Cases

- **Database Issues**: Correlate app errors with database query times, connection pool exhaustion, and replication lag
- **Cache Failures**: Correlate increased database load with cache miss rates or cache unavailability
- **Network Issues**: Correlate timeout errors across services with network metrics
- **Deployment Impact**: Correlate deployment timestamps with error rate changes
- **Upstream Dependencies**: Correlate API errors with external service status

## Output

- **Correlation Graph**: Visual representation of system relationships and failures
- **Timeline**: Synchronized view of events across systems
- **Root Cause Indicators**: Which system likely caused the cascade
- **Affected Services**: All services impacted by the root issue
- **Propagation Path**: How the issue spread through the system
- **Confidence Score**: How confident the analysis is about correlations

## Integration

Works with observability platforms that support:
- Multi-system log aggregation
- Cross-service metrics
- Distributed tracing
- Custom correlation queries
