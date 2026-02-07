---
description: Get design pattern recommendations based on context
arguments:
  - name: problem
    description: "Description of the design problem or requirement"
    required: true
  - name: language
    description: "Programming language (optional, auto-detected)"
    required: false
examples:
  - "/pattern-suggest Need to handle multiple payment methods"
  - "/pattern-suggest --language python How to implement undo/redo"
  - "/pattern-suggest Database connection pooling"
---

# Pattern Suggest

Get intelligent design pattern recommendations based on your specific problem context. This command analyzes your requirements and suggests the most appropriate patterns with implementation guidance.

## Usage

```
/pattern-suggest <problem-description> [--language <lang>]
```

### Arguments

- **problem** (required): Description of what you're trying to solve
  - Examples: "Need to handle multiple export formats", "Object creation is complex", "Too many conditional branches"

- **--language** (optional): Target programming language
  - Auto-detected from codebase if not specified
  - Examples: `python`, `typescript`, `java`, `csharp`, `go`

## How It Works

1. **Understand Context**: Analyzes your problem description
2. **Pattern Matching**: Maps requirements to appropriate patterns
3. **Best Fit Selection**: Ranks patterns by suitability
4. **Implementation Guidance**: Provides code examples and considerations

## Supported Pattern Categories

### Creational Patterns
- **Factory Method**: Create objects without specifying exact classes
- **Abstract Factory**: Families of related objects
- **Builder**: Complex object construction step-by-step
- **Singleton**: Single instance of a class
- **Prototype**: Clone existing objects

### Structural Patterns
- **Adapter**: Make incompatible interfaces work together
- **Bridge**: Separate abstraction from implementation
- **Composite**: Tree structures of objects
- **Decorator**: Add responsibilities dynamically
- **Facade**: Simplified interface to complex subsystems
- **Flyweight**: Shared objects to reduce memory
- **Proxy**: Placeholder for another object

### Behavioral Patterns
- **Chain of Responsibility**: Pass requests along chain
- **Command**: Encapsulate requests as objects
- **Iterator**: Traverse collections sequentially
- **Mediator**: Coordinate objects loosely
- **Memento**: Restore object state
- **Observer**: One-to-many dependency notifications
- **State**: Object behavior changes with internal state
- **Strategy**: Interchangeable algorithms
- **Template Method**: Algorithm skeleton with overrideable steps
- **Visitor**: Separate operations from object structure

## Examples

### Multiple Format Support
```bash
/pattern-suggest Need to support exporting data to PDF, Excel, and CSV formats
```
**Suggestion**: Strategy Pattern
- Each export format is a strategy
- Easy to add new formats
- Clean separation of concerns

### Object Creation Complexity
```bash
/pattern-suggest Object creation has many optional parameters and complex validation
```
**Suggestion**: Builder Pattern
- Step-by-step construction
- Fluent interface
- Immutability support

### Conditional Branches
```bash
/pattern-suggest Too many if/else statements based on payment type
```
**Suggestion**: Strategy Pattern or Factory Pattern
- Each payment type is a strategy/factory product
- Eliminates conditionals
- Easy to add new types

### Undo Functionality
```bash
/pattern-suggest --language python Need to implement undo/redo for user actions
```
**Suggestion**: Command Pattern + Memento Pattern
- Commands encapsulate actions
- Mementos store state
- Clean undo/redo stack

## Output Format

### Primary Recommendation
- Pattern name and category
- Why it fits your problem
- Implementation overview

### Alternative Options
- Other patterns to consider
- Trade-offs compared to primary
- When to choose alternatives

### Implementation Guide
- Language-specific code example
- Class structure diagram
- Key implementation points

### Considerations
- Benefits of using this pattern
- Potential downsides
- Testing implications
- Performance considerations

## Tips for Best Results

1. **Be Specific**: Describe the actual problem, not the symptom
2. **Include Context**: Mention constraints, scale, and requirements
3. **Consider Future**: Think about extensibility needs
4. **Check Existing**: See if a pattern is already in use

### Good Problem Descriptions

✓ "Need to handle multiple authentication providers (OAuth, JWT, Basic)"
✓ "Report generation needs to support different output formats"
✓ "Too many classes depend directly on concrete database implementations"

### Poor Problem Descriptions

✗ "Which pattern should I use?"
✗ "Improve this code" (too vague)
✗ "Use Factory pattern" (already decided, asking for implementation)

## Integration with Codebase

When you run `/pattern-suggest`, the command:
1. Analyzes your codebase structure
2. Identifies existing patterns in use
3. Suggests patterns that complement your architecture
4. Provides implementation examples matching your code style
