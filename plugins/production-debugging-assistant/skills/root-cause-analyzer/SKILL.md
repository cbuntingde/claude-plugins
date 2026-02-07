---
description: Analyze production incidents to identify root causes through systematic elimination and evidence gathering
examples:
  - "Determine why the payment service is failing"
  - "Find the root cause of increased latency in the API"
  - "Why are database connections being exhausted?"
---

# Root Cause Analyzer

Systematically analyzes production incidents to identify root causes through evidence gathering, hypothesis generation, and systematic elimination.

## When This Skill Is Used

Claude will automatically invoke this skill when:

- You need to find the root cause of a production issue
- Incidents have multiple potential causes
- You need to understand why something is happening (not just what)
- Post-incident analysis and documentation
- Complex debugging scenarios involving multiple systems

## Root Cause Analysis Process

### 1. Evidence Gathering
- Collects relevant logs, metrics, and traces
- Examines error messages and stack traces
- Reviews recent changes (deployments, config, infrastructure)
- Identifies affected systems and users
- Gathers context from the reporting user

### 2. Symptom Categorization
- Distinguishes between symptoms and root causes
- Identifies proximate causes vs ultimate causes
- Classifies symptoms by system and severity
- Maps symptom relationships

### 3. Hypothesis Generation
- Generates multiple potential root cause hypotheses
- Considers technical and operational factors
- Includes common and uncommon causes
- Incorporates domain knowledge and historical incidents

### 4. Hypothesis Testing
- Examines evidence for and against each hypothesis
- Uses available data to test predictions
- Eliminates hypotheses contradicted by evidence
- Ranks remaining hypotheses by likelihood

### 5. Root Cause Identification
- Identifies the most likely root cause(s)
- Assigns confidence scores to conclusions
- Provides supporting evidence
- Notes any uncertainty or alternative explanations

### 6. Actionable Recommendations
- Provides immediate mitigation steps
- Suggests permanent fixes
- Recommends monitoring improvements
- Identifies preventive measures

## Analysis Frameworks

### Five Whys
Asks "why" repeatedly to drill down to the root cause:

```
Problem: API is returning 500 errors
Why 1? Database queries are timing out
Why 2? Database CPU is at 100%
Why 3? Complex queries aren't using indexes
Why 4? Indexes were dropped during migration
Why 5? Migration script had a bug that dropped indexes
→ Root cause: Bug in migration script
```

### Fishbone (Ishikawa) Diagram
Considers multiple categories of potential causes:
- **People**: Configuration errors, mistakes, lack of training
- **Process**: Deployment issues, missing steps, incorrect procedures
- **Technology**: Bugs, resource exhaustion, dependencies
- **Infrastructure**: Network issues, hardware failures, cloud provider issues
- **Environment**: Configuration drift, environment differences
- **Data**: Data corruption, missing data, invalid data

### Change Analysis
Examines recent changes for correlation with incident:
- Code deployments
- Configuration changes
- Infrastructure changes
- Data migrations
- Dependency updates
- Scaling events

### Timeline Reconstruction
Builds a detailed timeline to identify the first failure:
- When did the issue start?
- What was the first symptom?
- What happened just before?
- What changed around that time?

## Common Root Cause Categories

### Application Issues
- Bugs introduced in recent deployments
- Logic errors in business logic
- Memory leaks or resource exhaustion
- Race conditions or concurrency bugs
- Incorrect error handling

### Database Issues
- Slow queries missing indexes
- Connection pool exhaustion
- Lock contention or deadlocks
- Replication lag
- Resource exhaustion (CPU, memory, disk)

### Infrastructure Issues
- Network failures or high latency
- DNS issues
- Load balancer misconfiguration
- Server or container failures
- Cloud provider issues

### Configuration Issues
- Incorrect environment variables
- Misconfigured services
- Feature flags with wrong values
- Security certificate expiration
- Authentication/authorization misconfiguration

### Dependency Issues
- Third-party API failures
- Upstream service outages
- Library version incompatibilities
- Expired API keys or tokens

### Scaling Issues
- Insufficient capacity
- Autoscaling not triggered
- Cold start issues
- Queue backup
- Throttling or rate limiting

## Output Format

```
**Root Cause Analysis Report**

**Problem Statement**
[Description of the issue]

**Timeline**
[timestamp] - [First symptom observed]
[timestamp] - [Additional symptoms]
[timestamp] - [Detection/Reporting]

**Evidence Collected**
- Logs: [summary of log evidence]
- Metrics: [summary of metric evidence]
- Traces: [summary of trace evidence]
- Changes: [recent changes identified]

**Symptoms vs Root Causes**
Symptoms:
- [symptom 1]
- [symptom 2]

Root Causes:
- [root cause with evidence]

**Hypotheses Considered**
1. [hypothesis] - [supported/refuted] - [evidence]
2. [hypothesis] - [supported/refuted] - [evidence]

**Root Cause**
[Most likely root cause with confidence score]
Supporting Evidence: [list]

**Immediate Actions**
1. [Action to mitigate now]
2. [Additional immediate action]

**Permanent Fixes**
1. [Long-term fix]
2. [Additional long-term fix]

**Prevention**
- [How to prevent recurrence]
```

## Best Practices

1. **Be Systematic**: Follow the analysis process, don't jump to conclusions
2. **Gather Evidence First**: Let data drive conclusions, not assumptions
3. **Consider Multiple Hypotheses**: Don't fixate on the first possibility
4. **Check Recent Changes**: Most production issues are caused by recent changes
5. **Distinguish Symptom from Cause**: Slow queries might be a symptom, not the root cause
6. **Assign Confidence Levels**: Be clear about certainty in conclusions
7. **Provide Actionable Recommendations**: Give clear next steps
8. **Document for Future**: Create records for post-incident reviews

## Example Analysis

**User**: "Our checkout service is showing high error rates"

**Root Cause Analyzer**:

1. **Evidence Gathering**:
   - Checkout logs: Payment gateway timeout errors
   - Payment gateway logs: 40% timeout rate over last 20 minutes
   - Database metrics: Connection pool at 95% capacity
   - Recent changes: Schema migration 30 minutes ago

2. **Hypotheses**:
   - H1: Payment gateway is down (refuted - only 40% timeout)
   - H2: Database issue causing slow queries → timeouts (supported)
   - H3: Network issues (refuted - no network errors)
   - H4: Schema migration broke queries (supported - timing matches)

3. **Root Cause**: Schema migration dropped an index on the `payments` table, causing payment queries to run slowly and timeout at the payment gateway.

4. **Confidence**: 85% (timing matches, symptoms consistent, but need to verify index was dropped)

5. **Actions**:
   - Immediate: Rollback schema migration
   - Verify: Check if index exists in production
   - Permanent: Fix migration script, add index back, test migration

## Integration with Other Skills

Works with:
- **Error Correlation**: To find related errors across systems
- **Log Analyzer**: To deep dive into log patterns
- **Incident Investigator**: For comprehensive incident response
- **Metrics Analysis**: To correlate with performance data
