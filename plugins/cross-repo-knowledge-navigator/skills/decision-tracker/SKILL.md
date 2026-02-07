---
description: Track, discover, and analyze technical decisions across the entire organization
capabilities:
  - Decision extraction from multiple sources
  - Decision lineage and evolution tracking
  - Status monitoring (active, deprecated, superceded)
  - Cross-team decision mapping
  - Alternative analysis tracking
  - Impact and outcome assessment
priority: high
---

# Decision Tracker Skill

Autonomously discovers, tracks, and analyzes technical decisions made across your organization. This skill extracts both explicit decisions (ADRs, design docs) and implicit decisions (technology choices in code, consensus in discussions).

## When This Skill Is Invoked

Claude autonomously invokes this skill when:
- User asks about technology choices or architecture decisions
- Looking for rationale behind technical approaches
- Tracking decision evolution and history
- Finding who made specific decisions
- Identifying deprecated or superseded patterns
- Understanding cross-team alignment on technologies

## Core Capabilities

### 1. Decision Extraction

**Explicit Decisions**
- Architecture Decision Records (ADRs)
- Design documents and RFCs
- Meeting notes with decisions
- Approved technical proposals
- Architecture review outcomes

**Implicit Decisions**
- Package dependencies (package.json, requirements.txt, go.mod)
- Framework and library choices
- CI/CD platform selections
- Infrastructure as code patterns
- Code structure revealing architectural decisions

### 2. Decision Lineage Tracking

- **Evolution**: How decisions changed over time
- **Supersession**: What replaced old decisions
- **Dependencies**: Decisions that influenced others
- **Reversals**: Decisions that were rolled back
- **Migration**: Paths from old to new approaches

### 3. Status Monitoring

Tracks decision lifecycle:
- **Proposed**: Under discussion or review
- **Active**: Currently in use
- **Deprecated**: Still in use but discouraged
- **Superseded**: Replaced by new decisions
- **Abandoned**: Never implemented

### 4. Cross-Team Mapping

- Discover similar decisions across teams
- Identify standardization opportunities
- Map technology choices by team
- Find decision inconsistencies
- Track best practice adoption

### 5. Impact Analysis

- Which services use a decision
- Code impacted by the choice
- Teams affected by changes
- Related dependencies
- Migration complexity

## Decision Discovery Process

1. **Source Scanning**
   - Scan repos for ADRs and design docs
   - Analyze package files for tech stack
   - Extract decisions from PR discussions
   - Search Slack for consensus discussions
   - Review Jira tickets for decisions

2. **Relationship Extraction**
   - Link related decisions
   - Trace decision dependencies
   - Map implementation evidence
   - Identify stakeholders
   - Track timeline and evolution

3. **Confidence Assessment**
   - **High**: Explicit ADRs, documented decisions
   - **Medium**: Strong evidence from code/discussions
   - **Low**: Inferred from patterns, requires verification

4. **Indexing and Storage**
   - Store in knowledge graph
   - Maintain version history
   - Update incrementally
   - Preserve lineage information

## Output Format

### Decision Record

```markdown
## Decision: Postgres for Payments Service

**Status**: Active
**Decided**: 2024-03-15
**Team**: Backend
**Confidence**: High

### Context
The payments service needed a database with strong ACID guarantees for financial transactions.

### Decision
Chose PostgreSQL 14 for the primary database.

### Alternatives Considered
1. **MySQL**: Rejected due to weaker MVCC support
2. **MongoDB**: Rejected due to lack of transactional guarantees
3. **CockroachDB**: Considered but deemed too complex for current needs

### Rationale
- Strong ACID compliance for financial transactions
- Excellent JSON support for flexible schemas
- Mature ecosystem and tooling
- Team expertise and familiarity
- Proven reliability at scale

### Implementation
- [Code](github.com/company/payments-service/tree/main/db)
- [Migrations](github.com/company/payments-service/tree/main/migrations)
- [ADR-003](github.com/company/payments-service/docs/adr/003-database.md)

### Related Decisions
- Supersedes: [MySQL evaluation](decisions/2023/11/mysql-prototype)
- Influenced: [Analytics warehouse](decisions/2024/06/analytics-db)
- Related: [Redis caching layer](decisions/2024/04/cache-layer)

### Stakeholders
- Decision maker: @alice (Staff Engineer)
- Contributors: @bob, @charlie
- Approved by: Engineering Architecture Review

### Impact
- Services: payments-service, transaction-processor
- Teams: Backend, DevOps
- Dependencies: Requires Postgres expertise in on-call

### Outcomes
- Successfully deployed March 2024
- Handles 10k TPS with <50ms latency
- Zero data loss incidents to date
```

### Decision Summary Table

| Decision | Status | Date | Team | Related |
|----------|--------|------|------|---------|
| Postgres for Payments | Active | 2024-03-15 | Backend | [ADR-003](...) |
| MongoDB for User Service | Superseded | 2023-11-01 | Backend | → Postgres migration |
| GraphQL for API | Active | 2024-01-20 | Frontend | [RFC-42](...) |
| Kafka Event Streaming | Active | 2024-02-10 | Platform | [ADR-007](...) |

## Use Cases

### For New Engineers
- "Why did we choose Kafka over RabbitMQ?"
- "What's our standard database migration approach?"
- "Who made the decision to use TypeScript?"

### For Architecture Decisions
- "What message queue patterns do other teams use?"
- "Show me all microservices architecture decisions"
- "Are we standardizing on any specific framework?"

### For Migration Planning
- "What services still use the deprecated auth library?"
- "Which teams decided against using our standard CI/CD?"
- "What are we migrating away from?"

### For Cross-Team Learning
- "How did the platform team solve multi-tenancy?"
- "What testing strategies work best for similar services?"
- "Who has experience with GraphQL federation?"

## Configuration

```json
{
  "decision_sources": {
    "adr_locations": [
      "docs/adr/**",
      "decisions/**",
      "docs/architecture/**"
    ],
    "design_docs": [
      "docs/design/**",
      "docs/rfc/**"
    ],
    "package_files": [
      "package.json",
      "requirements.txt",
      "go.mod",
      "Cargo.toml"
    ]
  },
  "implicit_confidence_threshold": 0.7,
  "track_lineage": true,
  "status_monitoring": true,
  "related_decisions_limit": 5
}
```

## Best Practices

### For Decision Documentation
- Use standard ADR format
- Include alternatives considered
- Document rationale clearly
- Link to implementation
- Update status when changes occur
- Record outcomes and learnings

### For Decision Discovery
- Check confidence levels
- Verify implicit decisions
- Cross-reference multiple sources
- Update index regularly
- Maintain decision lineage

### For Decision Tracking
- Monitor for deprecation
- Track superseding decisions
- Map dependencies
- Assess impact
- Identify migration needs

## Integration

This skill works with:
- **Knowledge Indexer Agent**: Builds decision index
- **Practice Analyzer Agent**: Identifies decision patterns
- **Slash commands**: `/decision-tracker`, `/knowledge-search`
- **MCP servers**: Git, Slack, Jira, Confluence APIs

## Troubleshooting

**Missing decisions**
- Check ADR directory configuration
- Verify repo access permissions
- Ensure index is up to date
- Look for implicit decisions in code

**Low confidence decisions**
- Cross-reference with other sources
- Check for explicit documentation
- Verify with team members
- Mark for review

**Stale status information**
- Run index update
- Check for recent code changes
- Review recent discussions
- Update decision records
