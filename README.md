# Claude Code Plugins

A comprehensive collection of 61 plugins extending Claude Code with specialized capabilities for architecture review, dependency analysis, deployment planning, security scanning, performance optimization, and much more.

## Overview

This repository provides plugins developed for specific workflows and development needs. Each plugin focuses on a particular domain, from architectural guidance to security scanning, testing, and documentation generation.

## Installation

### Claude Code Marketplace

To install plugins from within Claude Code:

1. Open the `/plugins` directory in Claude Code
2. Select **Marketplace** from the navigation
3. Click **Add new** and enter: `https://github.com/cbuntingde/claude-plugins`

Individual plugins can be installed based on your requirements.

### Manual Installation

Clone the repository and install plugins manually:

```bash
git clone https://github.com/cbuntingde/claude-plugins.git
cd claude-plugins
```

## Available Plugins

### Architecture & Code Quality

| Plugin | Description | Category |
|--------|-------------|----------|
| [Architecture Advisor](plugins/architecture-advisor/) | Reviews design patterns and architectural decisions, providing guidance on SOLID principles and code structure | Architecture |
| [Architecture Gatekeeper](plugins/architecture-gatekeeper/) | Comprehensive architecture validation plugin that prevents commits violating architecture patterns or creating circular dependencies | Architecture |
| [Code Complexity Analyzer](plugins/code-complexity-analyzer/) | Analyzes code complexity and provides intelligent refactoring suggestions to improve maintainability and readability | Code Quality |
| [Style Guide Enforcer](plugins/style-guide-enforcer/) | A comprehensive Claude Code plugin for maintaining consistent code style and team conventions | Code Quality |
| [Style Guide Plugin](plugins/style-guide-plugin/) | A Claude Code plugin for accessing programming style guides and best practices with automatic fetching | Code Quality |
| [Dead Code Hunter](plugins/dead-code-hunter/) | Scans codebases to identify unused code, zombie files, and stale configurations with safe removal and rollback support | Code Quality |
| [Circular Deps Detector](plugins/claude-code-circular-deps-plugin/) | Detects circular dependencies in TypeScript and JavaScript projects and provides actionable suggestions for fixing them | Code Quality |

### API Development

| Plugin | Description | Category |
|--------|-------------|----------|
| [API Doc Generator](plugins/api-doc-generator-plugin/) | Generates comprehensive API documentation from source code and OpenAPI specifications | API |
| [API Integration Generator](plugins/api-integration-generator/) | Generate fully-typed, error-handled API client code from OpenAPI/Swagger specifications | API |
| [API Security Hardening](plugins/api-security-hardening/) | Comprehensive API security hardening with CORS, CSRF, XSS protection, API key rotation, and JWT flow security | API |
| [OpenAPI Generator](plugins/openapi-generator/) | Automatically generates OpenAPI 3.0 and Swagger 2.0 specifications from your codebase | API |
| [Claude API Doc Plugin](plugins/claude-code-api-doc-plugin/) | Generates API documentation portals with static sites, interactive explorers, code examples, SDK documentation, and changelogs | API |

### Database & ORM

| Plugin | Description | Category |
|--------|-------------|----------|
| [CRUD Generator](plugins/claude-crud-generator/) | Generate complete CRUD operations from database schemas for multiple frameworks and languages | Database |
| [Migration Generator](plugins/claude-migration-generator/) | Generate database migrations from natural language schema descriptions across multiple ORMs and frameworks | Database |
| [ORM SQL Converter](plugins/orm-sql-converter/) | Convert between ORM queries and raw SQL across multiple programming languages, frameworks, and database systems | Database |
| [SQL Query Optimizer](plugins/sql-query-optimizer/) | Analyzes, refactors, and optimizes complex SQL queries for better database performance | Database |

### Security & Compliance

| Plugin | Description | Category |
|--------|-------------|----------|
| [Dependency Safety Scanner](plugins/dependency-safety-scanner/) | Comprehensive npm dependency analysis including vulnerability detection, bloat analysis, license compliance | Security |
| [Security Scanner Plugin](plugins/security-scanner-plugin/) | Detects common vulnerabilities, security misconfigurations, and provides actionable fix recommendations | Security |
| [Secrets Detection Hook](plugins/secrets-detection-hook/) | Detects and blocks commands/files containing API keys, passwords, or PII before execution | Security |
| [API Security Hardening](plugins/api-security-hardening/) | Comprehensive API security hardening with CORS, CSRF, XSS protection | Security |
| [GDPR Privacy Scanner](plugins/gdpr-privacy-scanner/) | GDPR compliance scanner with PII detection, data retention validation, and consent management verification | Compliance |
| [Compliance Assistant](plugins/compliance-assistant-plugin/) | Detects GDPR, HIPAA, SOC2 violations and PII handling issues | Compliance |
| [WCAG Scanner](plugins/wcag-scanner-plugin/) | Scans WCAG 2.2 compliance issues in web applications | Compliance |

### DevOps & Deployment

| Plugin | Description | Category |
|--------|-------------|----------|
| [CI/CD Pipeline Generator](plugins/ci-cd-pipeline-generator/) | Generates CI/CD pipelines for GitHub Actions, GitLab CI, and Jenkins with best practices | DevOps |
| [Deployment Strategies](plugins/deployment-strategies-plugin/) | Generates deployment strategies including blue/green and canary deployments for various platforms | DevOps |
| [Bundle Size Analyzer](plugins/bundle-size-analyzer/) | Analyzes JavaScript/TypeScript bundle sizes and identifies tree-shaking opportunities | DevOps |

### Testing & Quality Assurance

| Plugin | Description | Category |
|--------|-------------|----------|
| [QA Assistant](plugins/qa-assistant/) | Comprehensive quality assurance and production readiness checks including breaking change detection | Quality Assurance |
| [Auto Quality Gates](plugins/auto-quality-gates/) | Comprehensive automated testing and quality gates configuration framework | Quality Assurance |
| [Testing Assistant](plugins/testing-assistant-plugin/) | Enterprise-grade testing assistant - automated test generation, edge case identification, and test quality improvement | Testing |
| [Hook Test Plugin](plugins/hook-test-plugin/) | A plugin for testing Claude Code hook functionality | Testing |
| [Bug Catcher Plugin](plugins/bug-catcher-plugin/) | Automatically captures tool execution failures and provides commands to view them in a formatted table | Testing |
| [Mock API Server](plugins/mock-api-server/) | Create, configure, and manage mock API servers for testing and development | Testing |

### Performance & Optimization

| Plugin | Description | Category |
|--------|-------------|----------|
| [Performance Profiler](plugins/performance-profiler/) | Identifies bottlenecks and suggests optimizations through intelligent profiling and benchmarking | Performance |
| [Optimization Suggester](plugins/optimization-suggester/) | Analyzes code for performance optimizations including caching, memoization, and async patterns | Performance |
| [Memory Leak Detector](plugins/memory-leak-detector-plugin/) | Detects memory leaks and provides actionable suggestions for fixing them | Performance |

### Documentation

| Plugin | Description | Category |
|--------|-------------|----------|
| [Documentation Onboarding](plugins/doc-onboarding-plugin/) | Automates creation of developer onboarding documentation and guides from codebase analysis | Documentation |
| [Auto Doc Updater](plugins/auto-doc-updater-plugin/) | Automatically detects code changes and suggests documentation updates | Documentation |
| [Diagram Generator](plugins/diagram-generator-plugin/) | Generates architectural diagrams from code using Mermaid, PlantUML, or DOT formats | Documentation |

### Code Analysis & Search

| Plugin | Description | Category |
|--------|-------------|----------|
| [Semantic Code Search](plugins/semantic-code-search/) | Transform how you find code by searching using natural language instead of exact keywords | Search |
| [Tribal Knowledge Extractor](plugins/tribal-knowledge-extractor/) | Mines git history for context about code evolution, patterns, and team knowledge | Analysis |
| [Cross-Repo Knowledge Navigator](plugins/cross-repo-knowledge-navigator/) | AI-powered knowledge navigator that searches across repositories, Slack, Jira, and Confluence | Analysis |
| [Tech Debt Tracker](plugins/tech-debt-tracker/) | Identifies, tracks, and prioritizes technical debt in your codebase | Analysis |
| [Code Migration Assistant](plugins/code-migration-assistant/) | Intelligent plugin for upgrading between framework versions and translating between programming languages | Analysis |
| [Intelligent Refactoring Assistant](plugins/intelligent-refactoring-assistant/) | Safe, context-aware refactoring tools for modernizing legacy code and applying design patterns | Refactoring |

### Environment & Configuration

| Plugin | Description | Category |
|--------|-------------|----------|
| [MCP JSON Setup](plugins/mcp-json-setup/) | Configures and manages Model Context Protocol (MCP) servers from JSON configurations | Configuration |
| [Env Generator Plugin](plugins/env-generator-plugin/) | Automatically generates .env files by analyzing your codebase for environment variable usage patterns | Configuration |
| [Env Var Detect](plugins/env-var-detect/) | Automatically detect missing environment variables in your codebase | Configuration |

### Git & Workflow Automation

| Plugin | Description | Category |
|--------|-------------|----------|
| [Ticket Sync Hook](plugins/ticket-sync-hook/) | Automatically update Jira and Linear tickets based on git commit activity | Workflow |
| [PR Review Enforcer](plugins/pr-review-enforcer/) | Comprehensive PR and code review enforcement ensuring PR descriptions, tests, and documentation exist before merge | Workflow |
| [Review Squad Coordinator](plugins/review-squad-coordinator/) | Auto-assign code reviewers based on code ownership patterns, expertise analysis, and availability | Workflow |
| [Commit Gen Plugin](plugins/commit-gen-plugin/) | Generates conventional commit messages based on staged changes | Workflow |
| [Audit Trail Logger](plugins/audit-trail-logger/) | Comprehensive audit trail logging for compliance reporting with timestamps and session tracking | Workflow |
| [Claude MD Hook](plugins/claude-md-hook/) | Automatically includes your CLAUDE.md project rules with every user prompt | Workflow |

### Accessibility

| Plugin | Description | Category |
|--------|-------------|----------|
| [ARIA Improver](plugins/aria-improver/) | Automatically suggests ARIA labels and semantic HTML improvements for better accessibility and SEO | Accessibility |
| [WCAG Scanner](plugins/wcag-scanner-plugin/) | Scans WCAG 2.2 compliance issues in web applications | Accessibility |

### Development Tools

| Plugin | Description | Category |
|--------|-------------|----------|
| [Error Explainer](plugins/error-explainer/) | Provides context and solutions for cryptic error messages | Tools |
| [Production Debugging Assistant](plugins/production-debugging-assistant/) | Correlates errors across logs, metrics, and traces during production incidents to identify root causes | Tools |
| [Multi-Agent Orchestrator](plugins/multi-agent-orchestrator/) | Orchestrates multiple parallel AI agents for comprehensive code analysis, review, and automated fixes | Tools |
| [Auto Memory Plugin](plugins/auto-memory-plugin/) | Automatic memory system that hooks into Claude Code lifecycle events for seamless context retention | Tools |
| [Memory System Plugin](plugins/memory-system-plugin/) | Manages persistent memory across sessions for long-running AI assistance | Tools |
| [Tavily Search Plugin](plugins/tavily-search-plugin/) | Web search and research using Tavily AI search engine | Tools |

## Usage

Once installed, plugins integrate with Claude Code's command interface. Each plugin provides domain-specific commands accessible through natural language interaction.

## Contributing

Contributions are welcome. Please submit Pull Requests with any improvements or additional plugins.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed by [Chris Bunting](https://github.com/cbuntingde)