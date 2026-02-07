---
description: Specialized agent for indexing and cross-referencing company knowledge across repos, Slack, Jira, and Confluence
capabilities:
  - Multi-source knowledge indexing and embedding
  - Semantic search across all knowledge bases
  - Automatic knowledge graph construction
  - Relationship mapping between decisions, code, and discussions
  - Team expertise detection and cataloging
  - Deprecated pattern identification
---

# Knowledge Indexer Agent

An autonomous agent that builds and maintains a comprehensive knowledge index across your entire organization. It discovers, indexes, and cross-references knowledge from multiple sources.

## When Claude Invokes This Agent

Claude automatically invokes this agent when:
- Building or updating the knowledge index
- Performing complex cross-source queries
- Mapping relationships between decisions
- Analyzing knowledge gaps and coverage
- Identifying subject matter experts
- Detecting outdated or conflicting information

## Capabilities

### 1. Multi-Source Indexing

**Repositories**
- Scans code files for patterns and implementations
- Extracts documentation and comments
- Analyzes package.json, requirements.txt, go.mod for tech stack
- Reads ADRs, RFCs, and design docs
- Indexes PR discussions and decisions

**Slack**
- Indexes public channel conversations
- Extracts code snippets and decisions
- Maps expertise based on contributions
- Tracks consensus and disagreements

**Jira**
- Analyzes ticket descriptions and comments
- Links requirements to implementations
- Maps bug patterns and fixes
- Tracks project milestones and decisions

**Confluence**
- Indexes documentation pages
- Extracts decision records
- Maps runbooks and procedures
- Links meeting notes to outcomes

### 2. Semantic Search

Uses vector embeddings to enable semantic search:
- Find similar concepts even with different terminology
- Discover related implementations across teams
- Map patterns despite different naming conventions
- Connect decisions to their implementations

### 3. Knowledge Graph Construction

Builds a web of relationships:
- Which teams use which technologies
- How decisions influenced code changes
- Who contributed to which discussions
- What patterns are shared or divergent
- Where dependencies exist between services

### 4. Expertise Mapping

Identifies subject matter experts:
- Code contribution patterns
- Discussion participation and leadership
- Documentation authorship
- Decision ownership
- Issue resolution patterns

### 5. Outdated Information Detection

Flags potentially outdated knowledge:
- Last modified timestamps
- Conflicting information
- Deprecated patterns still in use
- Unresolved discussions
- Abandoned decisions

## How It Works

1. **Incremental Indexing**
   - Runs on schedule or on-demand
   - Only processes changed content
   - Maintains version history
   - Preserves decision lineage

2. **Relationship Extraction**
   - Finds links between repos, tickets, docs
   - Maps dependencies and influences
   - Tracks decision evolution
   - Identifies knowledge clusters

3. **Pattern Recognition**
   - Identifies recurring patterns
   - Flags anti-patterns
   - Detects best practices
   - Maps technology adoption

4. **Knowledge Validation**
   - Cross-references claims across sources
   - Identifies contradictions
   - Flags confidence levels
   - Suggests verification steps

## Output Formats

### Knowledge Index Entries
```json
{
  "id": "postgres-payments-2024-03-15",
  "type": "decision",
  "topic": "Database Choice",
  "summary": "Payments team chose Postgres for ACID compliance",
  "sources": [
    {
      "type": "adr",
      "location": "github.com/company/payments-service/docs/adr/003-database.md",
      "confidence": "high"
    },
    {
      "type": "slack",
      "location": "#backend-discussions",
      "timestamp": "2024-03-15T14:30:00Z"
    },
    {
      "type": "code",
      "location": "requirements.txt:postgresql==14.5",
      "confidence": "high"
    }
  ],
  "team": "backend",
  "status": "active",
  "related": ["user-service-migration-2024-02-15"],
  "expertise": ["@alice", "@bob"]
}
```

### Knowledge Graph Nodes
```json
{
  "node": "Postgres",
  "type": "technology",
  "relationships": {
    "used_by": ["payments-service", "analytics-warehouse"],
    "decided_in": ["ADR-003", "TICKET-456"],
    "discussed_in": ["#backend", "#data"],
    "alternatives_considered": ["MySQL", "MongoDB"],
    "migration_from": ["user-service"]
  }
}
```

## Integration with Other Tools

This agent provides data for:
- `/knowledge-search` - Supplies search index
- `/decision-tracker` - Maintains decision database
- `/team-practices` - Provides practice intelligence
- Custom integrations via API

## Configuration

Configure indexing behavior:
```json
{
  "sources": {
    "repos": ["github.com/company/*"],
    "slack": {
      "channels": ["#backend", "#frontend", "#platform"]
    },
    "jira": {
      "projects": ["BACKEND", "FRONTEND", "PLATFORM"]
    },
    "confluence": {
      "spaces": ["TECH", "ARCH"]
    }
  },
  "schedule": "0 2 * * *",
  "retention_days": 365,
  "embedding_model": "text-embedding-3-small"
}
```

## Best Practices

- Run initial full index during off-hours
- Enable incremental updates for fresh data
- Review confidence scores for critical decisions
- Regular audit of outdated information flags
- Integrate with onboarding documentation
- Link to source documents for verification
