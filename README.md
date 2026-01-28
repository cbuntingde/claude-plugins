# Claude Code Plugins

A collection of plugins extending Claude Code with specialized capabilities for architecture review, dependency analysis, deployment planning, and performance optimization.

## Overview

This repository provides plugins developed for specific workflows and development needs. Each plugin focuses on a particular domain, from architectural guidance to security scanning and performance profiling.

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

| Plugin | Description | Category |
|--------|-------------|----------|
| [Architecture Advisor](plugins/architecture-advisor/) | Reviews design patterns and architectural decisions, providing guidance on SOLID principles and code structure | Architecture |
| [CI/CD Pipeline Generator](plugins/ci-cd-pipeline-generator/) | Generates CI/CD pipelines for GitHub Actions, GitLab CI, and Jenkins with best practices and common patterns | DevOps |
| [Dependency Safety Scanner](plugins/dependency-safety-scanner/) | Comprehensive npm dependency analysis including vulnerability detection, bloat analysis, license compliance, and maintainer tracking | Security |
| [Deployment Strategies](plugins/deployment-strategies-plugin/) | Generates deployment strategies including blue/green and canary deployments for various platforms | DevOps |
| [Documentation Onboarding](plugins/doc-onboarding-plugin/) | Automates creation of developer onboarding documentation and guides from codebase analysis | Documentation |
| [MCP JSON Setup](plugins/mcp-json-setup/) | Configures and manages Model Context Protocol (MCP) servers from JSON configurations | Configuration |
| [Optimization Suggester](plugins/optimization-suggester/) | Analyzes code for performance optimizations including caching, memoization, and async patterns | Performance |
| [Performance Profiler](plugins/performance-profiler/) | Identifies bottlenecks and suggests optimizations through intelligent profiling and benchmarking | Performance |
| [QA Assistant](plugins/qa-assistant/) | Comprehensive quality assurance and production readiness checks including breaking change detection, code quality analysis, and security scanning | Quality Assurance |
| [Tribal Knowledge Extractor](plugins/tribal-knowledge-extractor/) | Mines git history for context about code evolution, patterns, and team knowledge | Analysis |

## Usage

Once installed, plugins integrate with Claude Code's command interface. Each plugin provides domain-specific commands accessible through natural language interaction.

## Contributing

Contributions are welcome. Please submit Pull Requests with any improvements or additional plugins.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed by [Chris Bunting](https://github.com/cbuntingde)
