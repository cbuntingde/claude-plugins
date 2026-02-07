# Production Debugging Assistant

A Claude Code plugin that helps you correlate errors across logs, metrics, and traces during production incidents to identify root causes faster.

## Overview

When production breaks, you need answers fast. This plugin correlates errors across systems, analyzes patterns, and helps identify root causes during high-pressure incidents.

## Features

### Slash Commands

- **`/incident`** - Investigate production incidents by correlating errors across logs, metrics, traces, and deployments
- **`/correlate`** - Correlate events across multiple systems to identify relationships and dependencies
- **`/analyze-logs`** - Deep analysis of log patterns, error clusters, and anomalies

### Specialized Agents

- **Incident Investigator** - Deep investigation of production incidents with cross-system correlation
- **Log Analyzer** - Pattern discovery, error clustering, and anomaly detection in logs

### Agent Skills

- **Error Correlation** - Correlate errors across systems to identify relationships during incidents
- **Root Cause Analyzer** - Systematic root cause identification through evidence gathering

## Installation

```bash
# Install to user scope (available across all projects)
claude plugin install production-debugging-assistant

# Install to project scope (shared with team via git)
claude plugin install production-debugging-assistant --scope project

# Install to local scope (gitignored)
claude plugin install production-debugging-assistant --scope local
```

## Usage

### Investigate Production Incidents

```bash
# Investigate recent errors
/incident last 30 minutes

# Investigate specific error pattern
/incident last hour database timeout errors

# Investigate with time range
/incident between 2 PM and 3 PM today
```

### Correlate Events Across Systems

```bash
# Correlate multiple systems
/correlate app, database, cache last 2 hours

# Focus on specific event type
/correlate api-gateway, auth-service errors

# Correlate since deployment
/correlate payment-service, database, redis since deploy
```

### Analyze Log Files

```bash
# Analyze log patterns
/analyze-logs ./logs/app.log patterns

# Focus on errors
/analyze-logs /var/log/application errors

# Detect anomalies
/analyze-logs cloudwatch-prod anomalies

# Analyze trends
/analyze-logs trends last 24 hours
```

## Configuration

The plugin works with your existing observability infrastructure. No additional configuration required.

### Optional Environment Variables

- `LOG_SOURCE` - Default log source path or service name
- `OBSERVABILITY_PLATFORM` - Primary platform (elk, splunk, cloudwatch, datadog, prometheus)
- `TIMEZONE` - Timezone for time-based queries (default: UTC)

### Platform-Specific Configuration

For platforms requiring authentication, ensure your environment has the necessary credentials configured:

- **AWS CloudWatch**: AWS CLI configured with `aws configure`
- **Datadog**: `DATADOG_API_KEY` and `DATADOG_APP_KEY` environment variables
- **Splunk**: SPLUNK_TOKEN and SPLUNK_HOST environment variables
- **ELK Stack**: ELASTICSEARCH_URL and authentication credentials

## Quick Start

### During an Active Incident

```bash
# Investigate recent errors
/incident last 30 minutes

# Correlate across systems
/correlate app, database, cache last 2 hours

# Deep dive into logs
/analyze-logs ./logs/app.log errors
```

### Post-Incident Review

```bash
# Analyze the full incident timeline
/incident between 2 PM and 3 PM yesterday

# Find patterns that led to the incident
/analyze-logs ./logs/app.log patterns

# Understand what went wrong
# Claude will automatically use Root Cause Analyzer skill
```

## Use Cases

### 1. Database Issues Causing Cascading Failures

```bash
/correlate app, database, cache last hour
```

The plugin will identify that database slow queries caused API timeouts, which triggered frontend errors.

### 2. Deployment-Induced Incident

```bash
/incident since deploy
```

The plugin will correlate the deployment timestamp with error spikes and identify which commit likely caused the issue.

### 3. Cache Failures

```bash
/correlate app, redis, database last 45 minutes
```

The plugin will detect that Redis failures caused increased database load, which led to app errors.

### 4. Third-Party Service Issues

```bash
/incident last 30 minutes payment-gateway errors
```

The plugin will correlate payment gateway errors with your application logs to show impact.

## How It Works

### Multi-System Correlation

The plugin queries multiple systems simultaneously:

- **Logs**: Application logs, database logs, infrastructure logs
- **Metrics**: CPU, memory, latency, throughput, error rates
- **Traces**: Distributed traces following requests across services
- **Deployments**: CI/CD systems to check recent deployments

### Temporal Alignment

Events from all systems are aligned by timestamp to find correlations:

```
2:15:00 - Database: Connection pool exhaustion
2:15:05 - Payment service: Timeout errors start
2:15:10 - Checkout service: 500 errors begin
→ Root cause: Database issue caused cascading failures
```

### Root Cause Identification

The plugin generates multiple hypotheses and ranks them by confidence:

1. Database replication lag (85% confidence)
2. Network issues (10% confidence)
3. Application bug (5% confidence)

## Architecture

```
production-debugging-assistant/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/
│   ├── incident.md              # /incident command
│   ├── correlate.md             # /correlate command
│   └── analyze-logs.md          # /analyze-logs command
├── agents/
│   ├── incident-investigator.md # Incident investigation agent
│   └── log-analyzer.md          # Log analysis agent
├── skills/
│   ├── error-correlation/
│   │   └── SKILL.md            # Error correlation skill
│   └── root-cause-analyzer/
│       └── SKILL.md            # Root cause analysis skill
└── README.md                    # This file
```

## Integration

The plugin works with common observability platforms:

**Logs**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- CloudWatch Logs
- Google Cloud Logging
- Azure Monitor Logs
- LogDNA, Papertrail, and more

**Metrics**
- Prometheus + Grafana
- Datadog
- New Relic
- CloudWatch
- InfluxDB
- And more

**Traces**
- Jaeger
- Zipkin
- OpenTelemetry
- Honeycomb
- And more

**CI/CD**
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI
- And more

## Tips for Best Results

1. **Act Fast**: Start investigation as soon as incident is detected
2. **Narrow Time Windows**: Specific time ranges reduce noise
3. **Provide Context**: Mention which systems are affected
4. **Check Recent Changes**: Always consider recent deployments
5. **Use During War Rooms**: Great for incident response discussions
6. **Document Findings**: Save analysis for post-incident reviews

## Contributing

Contributions welcome! Areas for enhancement:

- Additional observability platform integrations
- More sophisticated ML-based anomaly detection
- Real-time monitoring and alerting
- Custom correlation rules
- Integration with incident management tools (PagerDuty, Opsgenie)

## License

MIT License - see LICENSE file for details

## Version History

### 1.0.0 (Initial Release)
- /incident command for comprehensive incident investigation
- /correlate command for multi-system correlation
- /analyze-logs command for deep log analysis
- Incident Investigator agent
- Log Analyzer agent
- Error Correlation skill
- Root Cause Analyzer skill
