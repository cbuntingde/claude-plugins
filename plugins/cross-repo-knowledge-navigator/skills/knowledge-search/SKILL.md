---
description: Search and retrieve knowledge from multiple company sources including repositories, Slack, Jira, and Confluence
capabilities:
  - Cross-source semantic search
  - Relevance ranking and scoring
  - Context-aware result filtering
  - Relationship mapping between sources
  - Expert identification
  - Decision lineage tracking
priority: high
---

# Knowledge Search Skill

Autonomously searches across all company knowledge sources to answer questions and find information. This skill uses semantic search and relationship mapping to provide comprehensive, contextually relevant results.

## When This Skill Is Invoked

Claude autonomously invokes this skill when:
- User asks questions about company-wide knowledge
- Searching for decisions, patterns, or practices
- Looking for expertise or subject matter experts
- Finding how something was done elsewhere in the company
- Questions span multiple repositories or knowledge bases
- Need for cross-team or cross-project information

## Core Capabilities

### 1. Multi-Source Search

Searches across all configured knowledge sources:
- **Code repositories**: GitHub/GitLab/Bitbucket
- **Documentation**: Confluence, Notion, GitHub Wikis
- **Discussions**: Slack, Discord, Microsoft Teams
- **Issue trackers**: Jira, Linear, GitHub Issues
- **Design docs**: ADRs, RFCs, design specs

### 2. Semantic Understanding

Uses vector embeddings for intelligent search:
- Understands concept similarity beyond keywords
- Handles different terminology for same concepts
- Finds related but differently named items
- Discovers implicit connections

### 3. Relevance Ranking

Smart ranking based on:
- Semantic similarity to query
- Recency and freshness
- Source authority and trustworthiness
- Cross-reference count and linkage
- User engagement and feedback

### 4. Context Awareness

Filters results based on:
- Team or project context
- Time period constraints
- Source type preferences
- Confidence thresholds
- Access permissions

## Search Process

1. **Query Analysis**
   - Extract key concepts and entities
   - Identify search intent (fact-finding, comparison, exploration)
   - Determine relevant sources
   - Apply context filters

2. **Multi-Source Retrieval**
   - Parallel search across all sources
   - Semantic vector search
   - Keyword-based fallback
   - Relationship traversal

3. **Result Fusion**
   - Combine results from all sources
   - Deduplicate overlapping items
   - Relevance scoring and ranking
   - Confidence assessment

4. **Response Generation**
   - Summarize key findings
   - Provide context and relationships
   - Include direct links
   - Suggest related queries

## Output Format

### Structured Results

```markdown
## Found 15 results for "rate limiting strategies"

### Top Results

**1. Rate Limiter Implementation (payments-service)**
- Repository: github.com/company/payments-service
- File: src/middleware/rate_limiter.py
- Confidence: 94%
- Last updated: 3 days ago
- Related: [#backend discussion](slack://...), [JIRA-1234](jira://...)

Snippet: Token bucket algorithm using Redis for distributed rate limiting...
[View code](github:///company/payments-service/src/middleware/rate_limiter.py)

**2. API Gateway Rate Limiting Architecture**
- Source: Confluence
- Page: API Gateway Architecture
- Confidence: 89%
- Team: Platform

[View documentation](confluence://api-gateway-architecture)
```

### Confidence Indicators

- **High (90-100%)**: Direct matches, authoritative sources
- **Medium (70-89%)**: Related content, indirect evidence
- **Low (50-69%)**: Partial matches, requires verification

## Best Practices

### For Users

- **Be specific**: Use precise terminology for better results
- **Combine concepts**: "Postgres connection pooling" vs "Postgres"
- **Use filters**: Limit by team, time, or source type
- **Explore related items**: Follow connections for context
- **Verify important findings**: Check primary sources

### For Implementation

- **Index regularly**: Keep search index fresh
- **Monitor feedback**: Use user signals to improve ranking
- **Expand coverage**: Add new sources as they emerge
- **Maintain quality**: Flag and remove outdated content
- **Respect permissions**: Enforce access controls

## Integration Points

This skill integrates with:
- **Knowledge Indexer Agent**: Provides search index
- **MCP servers**: External API connections
- **Slash commands**: `/knowledge-search`, `/decision-tracker`
- **Custom tools**: Organization-specific integrations

## Configuration

```json
{
  "sources": {
    "repos": {
      "enabled": true,
      "scan_code": true,
      "scan_docs": true,
      "scan_adrs": true
    },
    "slack": {
      "enabled": true,
      "channels": "public",
      "retention_days": 365
    },
    "jira": {
      "enabled": true,
      "projects": ["BACKEND", "FRONTEND", "PLATFORM"]
    },
    "confluence": {
      "enabled": true,
      "spaces": ["TECH", "ARCH", "RUNBOOKS"]
    }
  },
  "ranking": {
    "recency_weight": 0.3,
    "authority_weight": 0.4,
    "relevance_weight": 0.3
  },
  "embedding_model": "text-embedding-3-small",
  "max_results": 20
}
```

## Example Queries

Good queries for this skill:
- "How do other teams handle database migrations?"
- "Where did we decide to use GraphQL?"
- "What's our authentication pattern for microservices?"
- "Show me rate limiting implementations across the company"
- "Who are the experts on Kubernetes networking?"
- "Find all decisions related to message queue choice"

## Troubleshooting

**No results found**
- Try broader search terms
- Remove specific filters
- Check if sources are configured
- Verify index is up to date

**Low relevance results**
- Use different terminology
- Add more specific keywords
- Combine multiple concepts
- Try semantic search vs keyword search

**Missing sources**
- Check MCP server configuration
- Verify API credentials
- Check source permissions
- Review integration logs
