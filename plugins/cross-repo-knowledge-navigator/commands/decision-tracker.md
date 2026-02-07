---
description: Track and find technical decisions across the entire organization
usage: "/decision-tracker [query] [options]"
arguments:
  - name: query
    description: Decision topic or technology to find
    required: true
  - name: --format
    description: Output format (summary,detailed,adrs)
    default: "summary"
  - name: --status
    description: Filter by decision status (active,deprecated,superceded,all)
    default: "all"
examples:
  - "/decision-tracker Postgres"
  - "/decision-tracker microservices architecture --format detailed"
  - "/decision-tracker React vs Vue --status active"
---

# Decision Tracker

Find technical decisions made anywhere in your company. Track architecture decisions, technology choices, and pattern adoptions across all teams and repositories.

## Capabilities

- **Architecture Decision Records (ADRs)**: Find formal decision documentation
- **Implicit decisions**: Extract decisions from PRs, tickets, and discussions
- **Decision lineage**: Track how decisions evolved over time
- **Cross-team patterns**: Discover what other teams decided
- **Status tracking**: See if decisions are active, deprecated, or superceded

## Decision Sources

### Explicit Decisions
- ADR files in repositories (`docs/adr/`, `decisions/`)
- Confluence decision pages
- Design documents and RFCs
- Meeting notes with decisions

### Implicit Decisions
- Technology choices in package.json, requirements.txt, go.mod
- Architecture patterns in code structure
- PR discussions and reviews
- Jira ticket resolutions
- Slack consensus discussions

## Examples

```bash
# Find all Postgres-related decisions
/decision-tracker Postgres

# Get detailed decision history
/decision-tracker microservices --format detailed

# Find only active decisions
/decision-tracker message queue --status active

# See React adoption across teams
/decision-tracker React framework choice

# Find deprecated patterns
/decision-tracker authentication --status deprecated
```

## Output Formats

### Summary (default)
```
Postgres Usage Decisions (3 found)

1. [ACTIVE] Payments Service - Postgres for transactions
   Decided: 2024-03-15 | Team: Backend
   Context: Chosen for ACID compliance

2. [ACTIVE] Analytics Data Warehouse - Postgres + Timescale
   Decided: 2024-06-20 | Team: Data
   Context: Time-series optimization

3. [SUPERSEDED] User Service - Originally Postgres, migrated to MongoDB
   Decided: 2023-11-01 | Replaced: 2024-02-15
   Superceded by: MONGO-001
```

### Detailed
Full decision records including:
- Decision date and stakeholders
- Rationale and alternatives considered
- Pros/cons analysis
- Implementation notes
- Related decisions
- Links to source documents

### ADRs
Standard Architecture Decision Record format for formal documentation

## Use Cases

**New Hire Onboarding**
"Where did we decide to use Kafka vs RabbitMQ?"

**Pattern Discovery**
"What patterns do other teams use for configuration management?"

**Dependency Analysis**
"Which teams still use the deprecated auth library?"

**Technology Audit**
"What's our current stance on serverless vs containers?"

**Cross-Team Learning**
"How did the platform team solve multi-tenancy?"
