---
description: Discover and compare engineering practices across different teams
usage: "/team-practices [practice-area] [options]"
arguments:
  - name: practice-area
    description: Type of practice to explore (testing, deployment, code-review, monitoring, etc.)
    required: true
  - name: --compare
    description: Compare specific teams (comma-separated)
    required: false
  - name: --format
    description: Output format (table,detailed,markdown)
    default: "table"
examples:
  - "/team-practices testing"
  - "/team-practices deployment --compare backend,frontend,platform"
  - "/team-practices code-review --format detailed"
---

# Team Practices

Discover how different teams handle common engineering challenges. Learn from best practices and avoid reinventing the wheel.

## Practice Areas

### Development Practices
- **Code review**: Review processes, checklists, automation
- **Testing**: Unit, integration, E2E strategies and coverage
- **Linting**: Static analysis and formatting standards
- **Documentation**: How teams document code and decisions

### Deployment Practices
- **CI/CD**: Pipeline configurations and deployment strategies
- **Feature flags**: Management and usage patterns
- **Rollback**: Procedures and automation
- **Environment management**: Dev/staging/prod setups

### Operational Practices
- **Monitoring**: Observability stacks and alerting
- **On-call**: Rotation, runbooks, escalation policies
- **Incident response**: Postmortem processes and follow-up
- **Capacity planning**: Scaling strategies and triggers

### Architecture Practices
- **API design**: REST, GraphQL, gRPC patterns
- **Database**: Migration, backup, sharding strategies
- **Caching**: CDN, application-level caching approaches
- **Message queues**: Event-driven architecture patterns

## Examples

```bash
# See how all teams handle testing
/team-practices testing

# Compare deployment strategies
/team-practices deployment --compare backend,frontend,platform

# Find code review patterns
/team-practices code-review --format detailed

# Discover monitoring setups
/team-practices monitoring

# Learn API design patterns
/team-practices api-design --compare payments,user-service
```

## Output Formats

### Table (default)
```
Testing Practices Comparison

| Team      | Unit Tests | Integration | E2E | Coverage Target | Framework      |
|-----------|-----------|-------------|-----|-----------------|----------------|
| Backend   | pytest    | pytest      |     | 85%             | pytest         |
| Frontend  | jest      | jest        | Cypress | 80%       | jest + RTL     |
| Platform  | go test   | go test     |     | 90%             | go test        |
```

### Detailed
Deep dive into each team's approach:
- Philosophy and goals
- Toolchain and configurations
- Examples and templates
- Metrics and KPIs
- Links to repo examples

### Markdown
Exportable documentation for sharing or onboarding

## Practice Intelligence

The command analyzes:
- **Code patterns**: From repository analysis
- **Configuration files**: CI configs, tool settings
- **Documentation**: READMEs, runbooks, guides
- **Discussions**: Slack threads and decision records
- **Artifacts**: Tests, pipelines, templates

## Common Use Cases

**Standardization**
"What's the most common CI/CD pattern across teams?"

**New Service Setup**
"How should we structure our new service's testing?"

**Process Improvement**
"What are the top teams doing for code review?"

**Tech Stack Decisions**
"What monitoring stack do most teams use?"

**Onboarding**
"Show me the platform team's deployment process"
