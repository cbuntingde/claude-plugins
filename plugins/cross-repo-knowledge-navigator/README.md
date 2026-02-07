# Cross-Repository Knowledge Navigator

An AI-powered knowledge navigator that searches across multiple repositories, Slack threads, Jira tickets, and Confluence docs to answer company-wide questions.

## Overview

In real companies, knowledge is scattered across 10+ repos, Slack threads, Jira tickets, and Confluence docs. This plugin helps you answer questions like:

- "How do other teams handle rate limiting?"
- "Where did we decide to use Postgres?"
- "What's our standard pattern for error handling?"
- "How does the payments team handle API versioning?"

## Features

- **Cross-Repository Search**: Search code, docs, and READMEs across all repos
- **Slack Integration**: Find discussions and decisions in Slack threads
- **Jira Connectivity**: Locate tickets, requirements, and bug reports
- **Confluence Access**: Search documentation and decision records
- **Decision Tracking**: Track technical decisions across the organization
- **Team Practices**: Discover and compare engineering practices across teams
- **Smart Ranking**: Results ranked by relevance and recency
- **Semantic Search**: Find concepts even with different terminology

## Installation

### Prerequisites

```bash
# Node.js 18+ and Python 3.10+
node --version
python3 --version

# API tokens for integrations (optional)
export GITHUB_TOKEN="your-github-token"
export SLACK_TOKEN="your-slack-token"
export JIRA_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="your-email@company.com"
export JIRA_TOKEN="your-jira-token"
export CONFLUENCE_URL="https://your-domain.atlassian.net/wiki"
export CONFLUENCE_TOKEN="your-confluence-token"
```

### Install Plugin

```bash
# Install to user scope (available across all projects)
claude plugin install cross-repo-knowledge-navigator

# Or install to project scope (shared with team via git)
cd your-project
claude plugin install cross-repo-knowledge-navigator --scope project

# Or install from local directory
claude plugin install ./cross-repo-knowledge-navigator
```

### Initial Setup

```bash
# Run initial index build
cd cross-repo-knowledge-navigator
./scripts/update-index.sh

# Configure sources
cp .env.example .env
# Edit .env with your API tokens and repository patterns
```

## Usage

### Knowledge Search

Search across all company knowledge sources:

```bash
# Find how teams handle rate limiting
/knowledge-search rate limiting strategies

# Search only in repositories
/knowledge-search database patterns --sources repos

# Find recent authentication decisions
/knowledge-search authentication architecture --days 180

# Search specific team's practices
/knowledge-search --team payments API versioning
```

### Decision Tracker

Find technical decisions across the organization:

```bash
# Find all Postgres-related decisions
/decision-tracker Postgres

# Get detailed decision history
/decision-tracker microservices --format detailed

# Find only active decisions
/decision-tracker message queue --status active
```

### Team Practices

Discover and compare engineering practices:

```bash
# See how all teams handle testing
/team-practices testing

# Compare deployment strategies
/team-practices deployment --compare backend,frontend,platform

# Find code review patterns
/team-practices code-review --format detailed
```

## Configuration

### Environment Variables

```bash
# GitHub (required for repo search)
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export GITHUB_ORG="your-company"
export REPO_PATTERN="*"

# Slack (optional)
export SLACK_TOKEN="xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxx"
export SLACK_CHANNELS="#backend,#frontend,#platform"

# Jira (optional)
export JIRA_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="your-email@company.com"
export JIRA_TOKEN="your-api-token"
export JIRA_PROJECTS="BACKEND,FRONTEND,PLATFORM"

# Confluence (optional)
export CONFLUENCE_URL="https://your-domain.atlassian.net/wiki"
export CONFLUENCE_TOKEN="your-api-token"
export CONFLUENCE_SPACES="TECH,ARCH,RUNBOOKS"
```

### MCP Servers

The plugin includes MCP servers for each integration:

- `github-repo-scanner`: Search and index GitHub repositories
- `slack-search`: Search Slack messages and threads
- `jira-integration`: Access Jira tickets and projects
- `confluence-search`: Search Confluence pages
- `knowledge-indexer`: Build and maintain knowledge index

## Plugin Components

### Commands
- `/knowledge-search`: Search across all knowledge sources
- `/decision-tracker`: Track and find technical decisions
- `/team-practices`: Discover engineering practices

### Agents
- **Knowledge Indexer**: Builds and maintains knowledge index
- **Practice Analyzer**: Analyzes team practices and patterns

### Skills
- **Knowledge Search**: Semantic search across sources
- **Decision Tracker**: Decision extraction and tracking

### Hooks
- Auto-index files after edits
- Check for index updates on session start
- Suggest knowledge search for relevant queries

## Architecture

```
cross-repo-knowledge-navigator/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/                # Slash commands
│   ├── knowledge-search.md
│   ├── decision-tracker.md
│   └── team-practices.md
├── agents/                  # Specialized subagents
│   ├── knowledge-indexer.md
│   └── practice-analyzer.md
├── skills/                  # Agent skills
│   ├── knowledge-search/
│   │   └── SKILL.md
│   └── decision-tracker/
│       └── SKILL.md
├── hooks/                   # Event handlers
│   └── hooks.json
├── scripts/                 # Utility scripts
│   ├── check-index-updates.sh
│   ├── update-index.sh
│   └── queue-indexing.sh
├── servers/                 # MCP servers
│   ├── github-mcp-server/
│   ├── slack-mcp-server/
│   ├── jira-mcp-server/
│   └── confluence-mcp-server/
└── .mcp.json               # MCP server configuration
```

## Development

### Building MCP Servers

```bash
# Build GitHub MCP server
cd servers/github-mcp-server
npm install
npm run build

# Build Confluence MCP server
cd servers/confluence-mcp-server
npm install
npm run build

# Install Python MCP servers
pip install -r servers/slack-mcp-server/requirements.txt
pip install -r servers/jira-mcp-server/requirements.txt
```

### Testing

```bash
# Test knowledge search
/knowledge-search test query

# View index status
cat data/knowledge_index/.last_update

# Check update logs
tail -f data/knowledge_index/update.log
```

## Troubleshooting

### No Search Results

- Check that API tokens are configured
- Verify repositories are accessible
- Run index update: `./scripts/update-index.sh`
- Check logs: `data/knowledge_index/update.log`

### MCP Server Failures

```bash
# Test MCP server directly
node servers/github-mcp-server/dist/index.js

# Check environment variables
env | grep -E "(GITHUB|SLACK|JIRA|CONFLUENCE)"

# Verify permissions
gh repo list
```

### Performance Issues

- Reduce scope: Filter by specific teams or sources
- Adjust retention: Set `INDEX_RETENTION_DAYS` in config
- Use incremental indexing: Enable `INCREMENTAL_INDEX=true`

## Contributing

Contributions welcome! Areas for improvement:

- Additional integrations (Notion, Discord, Linear)
- Improved semantic search with custom embeddings
- Real-time streaming updates
- Visual knowledge graph explorer
- Decision impact analysis
- Automated ADR generation

## License

MIT License - see LICENSE file

## Support

For issues and questions:
- GitHub Issues: https://github.com/company/cross-repo-knowledge-navigator/issues
- Documentation: https://github.com/company/cross-repo-knowledge-navigator/wiki
- Slack: #knowledge-navigator-support

## Acknowledgments

Built with Claude Code Plugin System
Inspired by company-wide knowledge management challenges
