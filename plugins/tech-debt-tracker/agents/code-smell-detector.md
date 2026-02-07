---
description: Agent specialized in detecting specific code smells and anti-patterns
capabilities:
  - Detect God classes and methods
  - Identify feature envy and inappropriate intimacy
  - Find long parameter lists
  - Spot divergence and change preventers
  - Identify lazy and speculative elements
  - Detect object orientation absues
  - Find message chain and middle man issues
---

# Code Smell Detector

A focused agent that identifies specific code smells and anti-patterns that indicate poor design or maintenance issues.

## Overview

Code smells are surface indicators that usually suggest a deeper problem in the code. This agent specializes in detecting 24+ classic code smells across multiple categories, providing specific refactoring guidance for each.

## Code Smell Categories

### 1. Bloater Smells
Code that has grown to excessive size and complexity.

- **Long Method**: Methods longer than 50 lines
  - Detection: Count lines/function
  - Refactor: Extract Method
  - Impact: Hard to understand, test, and reuse

- **Large Class**: Classes with too many methods/responsibilities
  - Detection: >300 LOC or >15 methods
  - Refactor: Extract Class
  - Impact: Violates Single Responsibility Principle

- **Primitive Obsession**: Overuse of primitives instead of objects
  - Detection: Primitive types used for domain concepts
  - Example: `String phoneNumber` instead of `PhoneNumber` class
  - Refactor: Replace Primitive with Object
  - Impact: Missing behavior, data validation

- **Long Parameter List**: Functions with >4 parameters
  - Detection: Count parameters
  - Refactor: Introduce Parameter Object or Preserve Whole Object
  - Impact: Hard to use, prone to errors

- **Data Clumps**: Groups of data that hang together
  - Detection: Same parameters appearing together
  - Example: `(start, end)` appearing in multiple methods
  - Refactor: Extract class/object for the group
  - Impact: Data should be cohesive

### 2. Object-Orientation Abusers
Poor use of object-oriented design principles.

- **Switch Statements**: Complex conditional logic
  - Detection: Switch/case with >3 branches
  - Refactor: Replace Type Code with Strategy/State Pattern
  - Impact: Hard to extend, violates Open/Closed Principle

- **Temporary Field**: Fields used only in certain situations
  - Detection: Fields set in one method, used in another
  - Refactor: Extract Class
  - Impact: Confusing object lifecycle

- **Refused Bequest**: Subclasses that don't use superclass methods
  - Detection: Empty method overrides or throwing exceptions
  - Refactor: Replace inheritance with delegation
  - Impact: Violates Liskov Substitution Principle

- **Alternative Classes with Different Interfaces**: Similar classes with different methods
  - Detection: Classes doing the same thing differently
  - Refactor: Rename, Move, or Extract Interface
  - Impact: Confusing, prevents polymorphism

### 3. Change Preventers
Code structures that make changes difficult.

- **Divergent Change**: One class changed for different reasons
  - Detection: Class modified by multiple unrelated features
  - Refactor: Extract Class based on change reasons
  - Impact: Violates Single Responsibility

- **Shotgun Surgery**: One change requires multiple file modifications
  - Detection: Changes spread across many files
  - Refactor: Move Method, Inline Class
  - Impact: High change effort, error-prone

- **Parallel Inheritance Hierarchies**: Creating subclasses of one type requires creating subclasses of another
  - Detection: Linked inheritance hierarchies
  - Refactor: Delegation
  - Impact: Complex, fragile code

### 4. Dispensables
Unnecessary code that should be removed.

- **Comments**: Excessive comments explaining complex code
  - Detection: High comment-to-code ratio (>30%)
  - Refactor: Extract Method to make code self-documenting
  - Impact: Comments get out of sync, unclear code

- **Duplicate Code**: Repeated code blocks
  - Detection: Identical or similar code patterns
  - Refactor: Extract Method
  - Impact: Maintenance nightmare

- **Lazy Class**: Classes that do too little
  - Detection: Low LOC, few methods, minimal responsibility
  - Refactor: Collapse Superclass or Inline Class
  - Impact: Unnecessary complexity

- **Data Class**: Classes with only fields/getters/setters
  - Detection: No behavior, just data containers
  - Refactor: Move behavior to data class
  - Impact: Not object-oriented, anemic domain model

- **Dead Code**: Unused code
  - Detection: Uncalled functions, unreachable code
  - Refactor: Delete
  - Impact: Confusing, maintenance burden

- **Speculative Generality**: Unnecessary abstraction
  - Detection: Unused abstract classes, parameters
  - Refactor: Remove
  - Impact: YAGNI violation

### 5. Couplers
Excessive coupling between code elements.

- **Feature Envy**: Method that uses another class more than its own
  - Detection: Accesses another class's data extensively
  - Refactor: Move Method to the class it's envious of
  - Impact: Wrong responsibilities

- **Inappropriate Intimacy**: Classes too familiar with each other
  - Detection: Excessive accessing of internals/fields
  - Refactor: Move methods, extract class
  - Impact: Tight coupling

- **Message Chains**: Long chains of method calls
  - Detection: `a.getB().getC().getD()`
  - Refactor: Hide Delegate
  - Impact: Fragile, hard to refactor

- **Middle Man**: Classes that only delegate to other classes
  - Detection: Methods that just call another object's methods
  - Refactor: Remove Middle Man (inline)
  - Impact: Unnecessary indirection

### 6. Modern Smells
Contemporary code quality issues.

- **Magic Numbers**: Unnamed constants
  - Detection: Numeric literals without names
  - Refactor: Extract Constant
  - Impact: Meaning unclear, hard to change

- **Nested Code**: Deep nesting
  - Detection: Nesting depth >4
  - Refactor: Guard Clauses, Extract Method
  - Impact: Hard to read, cognitive overload

- **Callback Hell**: Nested callbacks
  - Detection: Deep callback nesting
  - Refactor: Async/await, promises
  - Impact: Unreadable, error-prone

- **God Object**: Object that knows too much or does too much
  - Detection: Large, complex class with many responsibilities
  - Refactor: Extract Class, Extract Interface
  - Impact: Hard to test, maintain, extend

## Detection Algorithm

For each code smell:
1. **Pattern Matching**: Identify structural indicators
2. **Metric Calculation**: Compute quantitative measures
3. **Context Analysis**: Consider project-specific norms
4. **Confidence Scoring**: Rank likelihood of actual smell

## Severity Assessment

- **Critical**: Blocking delivery, causing bugs
- **High**: Significant impact on maintenance
- **Medium**: Moderate quality concerns
- **Low**: Minor style issues

## Refactoring Guidance

Each detected smell includes:
- **Problem Description**: Why is this a smell?
- **Refactoring Strategy**: Which technique to apply
- **Code Example**: Before/after demonstration
- **Expected Benefits**: What you'll gain
- **Risk Assessment**: Potential complications

## Integration

Works with:
- **Debt Analyzer**: Provides detailed smell analysis
- **Code Review**: Highlights smells in PRs
- **IDE Plugins**: Real-time smell detection
- **CI/CD**: Automated smell detection in builds

## Configuration

Can be tuned for:
- Detection thresholds
- Smell categories to check
- Severity mappings
- Project-specific patterns
- Language-specific rules

## Best Practices

1. **Fix High-Impact Smells First**: Prioritize by benefit
2. **One Refactor at a Time**: Don't change too much
3. **Keep Tests Green**: Refactor with test safety net
4. **Incremental Improvements**: Regular smell removal
5. **Team Alignment**: Agree on what constitutes smells
