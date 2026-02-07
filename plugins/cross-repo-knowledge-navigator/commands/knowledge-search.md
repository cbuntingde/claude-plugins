---
description: Search across all company knowledge sources (repos, Slack, Jira, Confluence) to find answers
usage: "/knowledge-search [query] [options]"
arguments:
  - name: query
    description: The question or topic to search for
    required: true
  - name: --sources
    description: Filter by sources (repos,slack,jira,confluence,all)
    default: "all"
  - name: --team
    description: Filter by team name
    required: false
  - name: --days
    description: Only search content from last N days
    required: false
examples:
  - "/knowledge-search how do other teams handle rate limiting"
  - "/knowledge-serch Postgres vs MongoDB --sources repos"
  - "/knowledge-search authentication patterns --team backend --days 90"
---

# Knowledge Search

Search across ALL your company knowledge sources to find answers to questions like:
- "How do other teams handle rate limiting?"
- "Where did we decide to use Postgres?"
- "What's our standard pattern for error handling?"
- "How does the payments team handle API versioning?"

## Features

- **Cross-repository search**: Search code, docs, and READMEs across 10+ repos
- **Slack integration**: Find discussions and decisions in Slack threads
- **Jira connectivity**: Locate tickets, requirements, and bug reports
- **Confluence access**: Search documentation and decision records
- **Smart ranking**: Results ranked by relevance and recency
- **Team filtering**: Focus on specific teams or projects
- **Time-based search**: Find recent decisions or historical context

## What It Searches

### Repositories
- Code files and comments
- README files and documentation
- Architecture docs (ADR, AIP)
- Config files and examples
- Pull request descriptions and discussions

### Slack
- Public channels and threads
- Direct messages (with permissions)
- Shared files and code snippets
- Decision discussions

### Jira
- Ticket descriptions and comments
- Requirements and specifications
- Bug reports and fixes
- Sprint notes and retrospectives

### Confluence
- Technical documentation
- Meeting notes
- Decision records (ADRs)
- Runbooks and playbooks

## Examples

```bash
# Find how teams handle rate limiting
/knowledge-search rate limiting strategies

# Search only in repositories
/knowledge-search database patterns --sources repos

# Find recent authentication decisions
/knowledge-search authentication architecture --days 180

# Search specific team's practices
/knowledge-search --team payments API versioning

# Find PostgreSQL usage decisions
/knowledge-search Postgres vs MySQL --sources repos,jira,confluence
```

## Output Format

Results are presented with:
- **Source** (repo/channel/ticket/page)
- **Relevance score**
- **Context snippet**
- **Direct link** to open in browser
- **Related items** for deeper exploration

## Tips

- Use specific keywords for better results
- Combine with team filters to focus scope
- Add time filters for recent changes
- Follow related items to discover context
- Save frequent searches as snippets
