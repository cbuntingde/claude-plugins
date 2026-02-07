# Changelog

All notable changes to the Cross-Repository Knowledge Navigator plugin will be documented in this file.

## [1.0.0] - 2025-01-17

### Added
- Initial release of Cross-Repository Knowledge Navigator
- Multi-source knowledge search across repos, Slack, Jira, and Confluence
- Decision tracking with lineage and status monitoring
- Team practices discovery and comparison
- Knowledge Indexer agent for automated indexing
- Practice Analyzer agent for cross-team analysis
- Semantic search with vector embeddings
- Knowledge graph construction
- Auto-indexing hooks for real-time updates
- MCP server integrations for external APIs
- Comprehensive slash commands with filtering options
- Expertise mapping and subject matter expert identification
- Outdated information detection
- Practice maturity assessment

### Features
- **Knowledge Search Command**: `/knowledge-search [query] [options]`
  - Cross-repository code and documentation search
  - Slack thread and discussion search
  - Jira ticket and issue search
  - Confluence page search
  - Relevance ranking with confidence scores
  - Team and time-based filtering

- **Decision Tracker Command**: `/decision-tracker [query] [options]`
  - Architecture Decision Record (ADR) indexing
  - Implicit decision extraction from code
  - Decision lineage tracking
  - Status monitoring (active, deprecated, superceded)
  - Cross-team decision mapping

- **Team Practices Command**: `/team-practices [practice-area] [options]`
  - Practice pattern recognition
  - Comparative analysis across teams
  - Best practice identification
  - Maturity assessment
  - Standardization opportunities

### Integrations
- GitHub repository scanning
- Slack message and thread search
- Jira ticket and project access
- Confluence page search
- Vector embeddings for semantic search
- Knowledge graph for relationship mapping

### Documentation
- Comprehensive README with examples
- Installation and setup guide
- Configuration reference
- Troubleshooting guide
- Component architecture documentation

## [Unreleased]

### Planned
- Notion integration
- Discord integration
- Linear integration
- Real-time streaming updates
- Visual knowledge graph explorer
- Decision impact analysis
- Automated ADR generation
- Web dashboard for knowledge exploration
- Export functionality for decision records
- Integration with code review tools
