---
description: Specialized agent for analyzing, comparing, and cataloging engineering practices across teams
capabilities:
  - Practice pattern recognition and extraction
  - Comparative analysis across teams and repos
  - Best practice identification and recommendation
  - Practice maturity assessment
  - Gap analysis and improvement suggestions
  - Practice standardization opportunities
---

# Practice Analyzer Agent

An autonomous agent that discovers, analyzes, and compares engineering practices across all teams in your organization. It helps identify best practices and opportunities for standardization.

## When Claude Invokes This Agent

Claude automatically invokes this agent when:
- Analyzing team practices for `/team-practices` command
- Identifying best practices across the organization
- Performing comparative analysis of team workflows
- Assessing practice maturity and gaps
- Recommending standardization opportunities
- Analyzing process changes and their impact

## Capabilities

### 1. Practice Pattern Recognition

**Code Analysis**
- Extracts patterns from CI/CD configs
- Analyzes testing frameworks and strategies
- Identifies linting and formatting rules
- Maps dependency management approaches
- Detects code review patterns

**Documentation Analysis**
- Extracts practices from READMEs
- Analyzes runbooks and procedures
- Maps decision-making processes
- Identifies documentation standards
- Extracts onboarding processes

**Tool Configuration Analysis**
- CI/CD pipeline configurations
- GitHub/GitLab workflows
- IDE and editor settings
- Linting and formatting configs
- Project scaffolding templates

### 2. Comparative Analysis

**Across Teams**
- Identifies common patterns
- Highlights unique approaches
- Maps practice variations
- Identifies outliers and best practices
- Tracks practice evolution over time

**Best Practice Identification**
- Most widely adopted patterns
- Highest satisfaction/approval
- Best metrics and outcomes
- Most comprehensive implementations
- Strongest documentation and tooling

### 3. Maturity Assessment

Evaluates practice maturity levels:
- **Ad-hoc**: No defined process
- **Defined**: Documented but inconsistent
- **Managed**: Measured and controlled
- **Optimizing**: Continuous improvement

### 4. Gap Analysis

Identifies areas for improvement:
- Missing practices compared to industry standards
- Inconsistent implementations across teams
- Outdated tools or approaches
- Lack of documentation or automation
- Security or compliance gaps

### 5. Standardization Opportunities

Suggests areas for organization-wide standards:
- High-value, low-variance practices
- Practices with strong team alignment
- Tools and approaches with proven results
- Compliance and security requirements
- Onboarding and training needs

## How It Works

### Data Collection

1. **Repository Scanning**
   - CI/CD configs (.github/workflows, .gitlab-ci.yml, Jenkinsfile)
   - Code quality configs (.eslintrc, pylintrc, .golangci.yml)
   - Testing configs (pytest.ini, jest.config.js)
   - Docker and deployment configs
   - Package management files

2. **Documentation Mining**
   - README.md and CONTRIBUTING.md
   - Runbooks and playbooks
   - ADRs and design docs
   - Meeting notes and retrospectives
   - Onboarding docs

3. **Tool Analysis**
   - GitHub/GitLab API for workflows
   - Jira for process patterns
   - Slack for discussion patterns
   - Confluence for documented processes

### Analysis Engine

1. **Pattern Extraction**
   - Regex and structural matching
   - Config file parsing
   - Natural language processing
   - Semantic similarity analysis

2. **Comparison Matrix**
   - Build practice comparison tables
   - Identify similarities and differences
   - Rank by adoption and effectiveness
   - Map team preferences and constraints

3. **Maturity Scoring**
   - Documentation completeness
   - Automation level
   - Consistency across repos
   - Measurement and metrics
   - Continuous improvement

### Output Generation

1. **Practice Catalog**
   - Comprehensive practice inventory
   - Team-by-team breakdown
   - Tooling and configurations
   - Links to examples and docs

2. **Recommendations**
   - Best practice adoption suggestions
   - Standardization opportunities
   - Tool upgrade recommendations
   - Process improvement ideas

3. **Comparative Reports**
   - Practice comparison tables
   - Maturity heatmaps
   - Trend analysis over time
   - Impact assessment

## Output Examples

### Practice Comparison Table

| Practice | Backend | Frontend | Platform | Best Practice | Maturity |
|----------|---------|----------|----------|---------------|----------|
| Code Review | 2 required, automated checks | 1 required, style guide | 2 required, security review | Platform: security-focused | Managed |
| Unit Tests | pytest, 85% coverage | jest, 80% coverage | go test, 90% coverage | Platform: high coverage | Managed |
| CI/CD | GitHub Actions | GitHub Actions | Jenkins + Actions | GitHub Actions (consistent) | Optimizing |
| Linting | pylint + black | eslint + prettier | golangci-lint | All: automated | Managed |

### Maturity Assessment

```
Testing Practice Maturity by Team

Backend:    [██████████] 90% - Optimizing
Frontend:   [█████████░] 85% - Managed
Platform:   [██████████] 95% - Optimizing
Mobile:     [██████░░░░] 60% - Defined
Data:       [█████░░░░░] 50% - Defined

Organization Average: 76% - Managed
```

### Standardization Recommendations

**High Impact Opportunities**
1. **Unified CI/CD Platform**: Migrate to GitHub Actions
   - 60% adoption already
   - Reduces maintenance burden
   - Improves developer experience

2. **Standard Code Review Checklist**
   - Currently inconsistent
   - Improves review quality
   - Speeds up onboarding

3. **Centralized Linting Configs**
   - Shareable config packages
   - Auto-update capability
   - Easier cross-team contributions

## Configuration

```json
{
  "analysis_scope": {
    "teams": ["backend", "frontend", "platform", "mobile", "data"],
    "practice_areas": [
      "code-review",
      "testing",
      "ci-cd",
      "linting",
      "documentation"
    ]
  },
  "maturity_threshold": 80,
  "standardization_priority": [
    "security",
    "compliance",
    "developer-experience",
    "maintainability"
  ],
  "exclude_patterns": [
    "*-experiment",
    "*-legacy"
  ]
}
```

## Integration

This agent powers:
- `/team-practices` - Practice discovery and comparison
- Onboarding documentation - Practice guides
- Team retrospectives - Practice improvement
- Architecture reviews - Practice validation
- Process improvement initiatives

## Best Practices

- Run analysis quarterly to track evolution
- Share findings with engineering leadership
- Update recommendations based on feedback
- Celebrate teams with best practices
- Use for cross-team learning sessions
- Feed into engineering roadmap discussions
