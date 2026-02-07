---
description: Correlate errors across multiple systems, logs, metrics, and traces to identify relationships during production incidents
examples:
  - "Error spike in API coincides with database slowdown"
  - "Correlate authentication failures with identity provider issues"
  - "Payment errors started after cache service restart"
---

# Error Correlation Skill

Correlates errors, events, and anomalies across multiple systems, services, and data sources to identify relationships, dependencies, and root causes during production incidents.

## When This Skill Is Used

Claude will automatically invoke this skill when:

- You're investigating production issues involving multiple systems
- Error patterns need to be correlated across logs, metrics, or traces
- You need to understand if errors in one system are causing issues in another
- Recent deployments might have introduced problems
- You ask about relationships between different error patterns or systems

## What This Skill Does

### Multi-System Correlation
- Queries logs, metrics, and traces from multiple systems
- Aligns events by timestamp to find temporal correlations
- Identifies which system failures trigger cascading issues
- Maps dependency relationships between services

### Signal Correlation
- **Log-to-Log**: Finds error patterns that appear across multiple services
- **Log-to-Metric**: Correlates error spikes with performance metrics (CPU, memory, latency)
- **Log-to-Trace**: Follows distributed traces to see how errors propagate
- **Metric-to-Metric**: Finds correlations between different system metrics

### Deployment Correlation
- Identifies deployments that coincide with error rate changes
- Correlates configuration changes with system behavior changes
- Maps deployment timestamps to incident start times
- Identifies rollback candidates

### Pattern Recognition
- Discovers recurring correlation patterns
- Identifies which correlations are coincidental vs causal
- Learns from historical incidents to improve future analysis
- Flags previously seen correlation patterns

## Correlation Types

### Temporal Correlation
Events that occur at the same time across systems:
```
2:15:00 PM - Payment service: timeout errors start
2:15:05 PM - Database: connection pool exhaustion
2:15:10 PM - Checkout service: 500 errors begin
→ Conclusion: Payment service timeouts caused by database issues
```

### Causal Correlation
Identifies which event likely caused another:
```
Database replica lag increases → Read queries slow down → API timeouts increase → Frontend errors spike
→ Root cause: Database replication issue
```

### Deployment Correlation
Links incidents to code changes:
```
2:00 PM - Deployment of PR #1234 (auth-service)
2:05 PM - Authentication error rate increases from 0.1% to 15%
→ Conclusion: Deployment likely caused auth failures
```

## Output Format

This skill provides structured correlation analysis:

```
**Correlation Analysis**
Time window: [start] to [end]

**Detected Correlations**
1. [System A] [event type] → [System B] [event type]
   - Correlation strength: [percentage]%
   - Time lag: [X] seconds
   - Confidence: [high/medium/low]

2. [Additional correlations...]

**Root Cause Indicators**
- Most likely origin: [system name]
- Supporting evidence: [list of evidence]

**Cascading Failures**
[Visualization of how the failure spread]

**Deployment Correlation**
- Recent deployment: [deployment info]
- Deployment impact: [assessment]
```

## Data Sources

This skill works with:

**Log Sources**
- Application logs (app servers, microservices)
- Infrastructure logs (load balancers, proxies)
- Database logs (slow queries, errors)
- System logs (OS, networking)

**Metrics Sources**
- Application performance metrics (latency, throughput, error rates)
- Infrastructure metrics (CPU, memory, disk, network)
- Business metrics (transactions, conversions, revenue)
- Custom metrics

**Trace Sources**
- Distributed tracing data (Jaeger, Zipkin, OpenTelemetry)
- Request traces across service boundaries
- Transaction timelines

**Deployment Sources**
- CI/CD systems (GitHub Actions, GitLab CI, Jenkins)
- Deployment logs and timestamps
- Configuration change history

## Best Practices

1. **Specify Time Ranges**: Narrow time windows reduce noise during incidents
2. **Include Context**: Mention which systems are affected
3. **Check Recent Changes**: Always consider recent deployments and config changes
4. **Look for Cascades**: One system's failure often causes downstream issues
5. **Verify Causality**: Correlation doesn't always mean causation
6. **Document Findings**: Save correlation analysis for post-incident reviews

## Examples

**Example 1: Multi-System Outage**

User: "Our checkout flow is failing and I'm seeing database errors too"

Claude with Error Correlation:
- Queries checkout service logs for errors
- Queries database logs for slow queries/errors
- Checks metrics for database connection pool, query latency
- Reviews recent deployments to both services
- Correlates timestamps across all signals
- Reports: "Database connection pool exhaustion started at 2:15 PM, causing checkout timeouts. No recent deployments. Likely cause: Increased traffic causing connection exhaustion."

**Example 2: Post-Deployment Investigation**

User: "We deployed 10 minutes ago and now users are reporting errors"

Claude with Error Correlation:
- Checks deployment logs for changes in last 15 minutes
- Queries error rates before and after deployment
- Correlates error patterns with changed files/components
- Identifies specific commit likely responsible
- Reports: "Deployment of commit abc123 introduced authentication token validation bug. 401 errors increased 1000% starting at 2:05 PM (deploy time). Suggested rollback commit: abc122"

**Example 3: Gradual Degradation**

User: "Response times have been getting worse over the last hour"

Claude with Error Correlation:
- Analyzes latency metrics over time
- Correlates with database query performance
- Checks for memory leaks or resource exhaustion
- Examines cache hit rates
- Reports: "Cache hit rate dropped from 95% to 40% over last hour, causing increased database load. Redis memory limit reached at 1:45 PM. Recommendation: Increase Redis memory allocation."
