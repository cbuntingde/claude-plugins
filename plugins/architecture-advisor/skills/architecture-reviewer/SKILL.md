---
name: architecture-reviewer
description: Reviews design patterns, architectural decisions, and suggests improvements
invocation:
  automatic: true
  triggers:
    - "review.*architecture|design.*pattern"
    - "analyze.*structure|architectural.*review"
    - "suggest.*design.*pattern|recommend.*pattern"
    - "anti.*pattern|code.*smell.*detect"
    - "solid.*principle.*analy|evaluate.*design"
    - "refactor.*advice|improve.*architecture"
    - "coupling|cohesion.*analy"
    - "design.*pattern.*best.*practic"
examples:
  - "Review the architecture of this authentication module"
  - "Analyze design patterns in the payment system"
  - "What anti-patterns exist in this codebase?"
  - "Evaluate this class for SOLID principles"
  - "Suggest improvements for the service layer architecture"
  - "Review coupling between modules"
  - "What design patterns should I use for this feature?"
outputStyle: comprehensive
---

# Architecture Reviewer Skill

An intelligent architecture advisor that automatically activates when you need design pattern analysis, architectural reviews, or structural improvement recommendations. This skill provides expert-level guidance on software architecture, design patterns, and best practices.

## When This Skill Activates

This skill automatically engages when you ask questions or give tasks related to:
- Architecture and design pattern reviews
- Anti-pattern and code smell detection
- SOLID principles evaluation
- Structural analysis (coupling, cohesion)
- Design pattern recommendations
- Refactoring guidance
- Architectural improvement suggestions

## Core Capabilities

### Pattern Analysis & Review
- Identify design patterns currently in use
- Detect pattern misapplications and anti-patterns
- Suggest appropriate patterns for specific contexts
- Review pattern implementations for correctness
- Recommend pattern combinations for complex scenarios

### Architectural Evaluation
- Assess overall codebase structure and organization
- Evaluate layer separation and boundaries
- Analyze module dependencies and coupling
- Review abstraction levels and hierarchies
- Identify architectural debt and risks

### SOLID Principles Assessment
- Single Responsibility Principle compliance
- Open/Closed Principle adherence
- Liskov Substitution Principle violations
- Interface Segregation Principle issues
- Dependency Inversion Principle implementation

### Quality Metrics
- Coupling analysis (afferent, efferent, instability)
- Cohesion measurement within modules
- Complexity assessment (cyclomatic, cognitive)
- Code duplication detection
- Maintainability index

### Anti-Pattern Detection
- God Objects and Blob anti-patterns
- Shotgun Surgery and Divergent Change
- Feature Envy and Inappropriate Intimacy
- Spaghetti Code and Lava Flow
- Magic numbers and strings
- Copy-paste programming

## What You'll Receive

### Comprehensive Analysis Report
1. **Executive Summary**
   - Overall architecture health score
   - Critical issues requiring immediate attention
   - Key strengths and areas for improvement

2. **Detailed Findings**
   - Categorized issues with severity levels
   - File locations with specific line references
   - Impact assessment on maintainability and scalability
   - Root cause analysis

3. **Pattern Inventory**
   - Patterns currently in use
   - Pattern locations and implementations
   - Effectiveness of pattern applications
   - Missing pattern opportunities

4. **Recommendations**
   - Prioritized improvement suggestions
   - Before/after code examples
   - Refactoring strategies with steps
   - Alternative approaches with trade-offs

5. **Action Plan**
   - Short-term wins (quick improvements)
   - Medium-term refactoring goals
   - Long-term architectural vision
   - Risk assessment for each change

## Analysis Approach

When reviewing your codebase, this skill:

1. **Explores Structure**
   - Maps module organization and boundaries
   - Identifies key components and relationships
   - Understands the overall architecture style

2. **Detects Patterns**
   - Recognizes creational, structural, and behavioral patterns
   - Identifies architectural patterns (layers, ports, microservices)
   - Notes pattern implementations and variations

3. **Evaluates Quality**
   - Measures coupling and cohesion metrics
   - Assesses SOLID principles adherence
   - Checks for common anti-patterns
   - Analyzes code complexity and duplication

4. **Provides Context-Aware Advice**
   - Considers your specific domain and requirements
   - Recommends patterns fitting your architecture
   - Suggests incremental improvements
   - Balances idealism with practicality

## Examples

### Architecture Review
```
User: "Review the architecture of our payment processing system"

Architecture Reviewer activates and provides:
- Analysis of current payment system structure
- Identification of patterns (Strategy, Factory, etc.)
- Detection of potential issues (tight coupling, etc.)
- Recommendations for improvements
```

### Pattern Recommendation
```
User: "What design patterns should I use for handling multiple notification channels?"

Architecture Reviewer suggests:
- Strategy Pattern for different notification methods
- Observer Pattern for subscribers
- Builder Pattern for complex notification construction
- Implementation examples in your language
```

### Anti-Pattern Detection
```
User: "Find anti-patterns in the user management module"

Architecture Reviewer identifies:
- God Object anti-patterns in UserService
- Feature Envy in controllers
- Tight coupling to database implementation
- Specific refactoring suggestions
```

### SOLID Analysis
```
User: "Does this ReportGenerator class follow SOLID principles?"

Architecture Reviewer evaluates:
- Single Responsibility: May be handling generation + formatting + export
- Open/Closed: Requires modification for new report types
- Provides specific refactoring steps
```

## Best Practices

This skill promotes:
- **Composition over inheritance** for flexibility
- **Interface segregation** for focused contracts
- **Dependency injection** for testability
- **Separation of concerns** for maintainability
- **Tell, Don't Ask** principle for encapsulation
- **You Ain't Gonna Need It (YAGNI)** for simplicity
- **Keep It Simple, Stupid (KISS)** for clarity

## Language & Framework Support

The architecture reviewer adapts recommendations to:
- **Languages**: TypeScript, JavaScript, Python, Java, C#, Go, Ruby, PHP, and more
- **Frameworks**: Express, Django, Spring, .NET, Rails, etc.
- **Paradigms**: OOP, functional, or hybrid approaches
- **Architectural Styles**: Monolith, microservices, serverless, modular monolith

## Integration with Development

Use this skill during:
- **Architecture decision meetings**: Get objective analysis
- **Code reviews**: Ensure architectural consistency
- **Refactoring sessions**: Plan structural improvements
- **Technical debt assessment**: Prioritize architectural work
- **Design discussions**: Evaluate pattern choices
- **Sprint planning**: Estimate architectural tasks

## Continuous Improvement

The architecture reviewer helps you:
- Track architectural metrics over time
- Measure progress from refactoring efforts
- Identify recurring patterns in your codebase
- Establish architectural standards
- Build a shared vocabulary with your team
