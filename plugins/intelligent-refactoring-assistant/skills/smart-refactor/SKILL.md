---
name: smart-refactor
description: Autonomously detect and suggest safe refactoring opportunities while working on code changes
trigger:
  - When analyzing code for improvements
  - When reviewing code quality
  - When working with legacy code
  - When detecting code duplication
  - When identifying modernization needs
capabilities:
  - Detect code duplication patterns
  - Identify outdated syntax and APIs
  - Recognize opportunities for design patterns
  - Suggest safe refactoring improvements
  - Analyze code complexity and maintainability
  - Provide confidence-based recommendations
confidence_levels:
  high:
    - Exact code duplication (3+ occurrences)
    - Deprecated API usage with clear replacement
    - Obvious syntax improvements (var → const/let)
    - Simple extractions with no side effects
  medium:
    - Near-duplicate code with variations
    - Modernization with behavior changes
    - Design pattern applications
    - Moderate complexity improvements
  low:
    - Complex architectural changes
    - Pattern applications with high complexity
    - Refactoring with unclear trade-offs
---

# Smart Refactor Skill

Autonomous skill that intelligently detects and suggests safe refactoring opportunities while you work.

## Purpose

The Smart Refactor skill continuously analyzes code as you work, identifying opportunities to improve code quality through safe, context-aware refactoring. It focuses on "safe" improvements—changes that clearly enhance maintainability without introducing risk.

## What It Does

This skill autonomously:

1. **Detects Code Duplication**: Identifies repeated code patterns across files
2. **Finds Modernization Opportunities**: Spots outdated syntax and deprecated APIs
3. **Recognizes Pattern Applications**: Identifies where design patterns would help
4. **Analyzes Complexity**: Finds overly complex code that needs simplification
5. **Suggests Safe Improvements**: Provides prioritized, confidence-rated recommendations

## When It Activates

The skill activates when you:

- Ask about code quality or improvements
- Work with legacy code that needs updating
- Make changes that introduce duplication
- Review code for maintainability
- Express concern about code complexity
- Ask for refactoring suggestions

## Confidence Levels

### High Confidence (Safe to Suggest)
- Exact code duplication appearing 3+ times
- Deprecated APIs with clear, drop-in replacements
- Obvious syntax improvements (e.g., var → const/let)
- Simple function extractions with pure logic
- Clear naming improvements

### Medium Confidence (Worth Discussing)
- Near-duplicate code with minor variations
- Modernization that changes execution flow (e.g., callbacks → async/await)
- Design pattern applications with clear benefits
- Moderate complexity reductions
- Structural improvements

### Low Confidence (Mention Carefully)
- Complex architectural changes
- Pattern applications with high complexity
- Refactoring with unclear trade-offs
- Changes affecting multiple systems
- Performance optimizations that may not matter

## How It Works

1. **Context Analysis**: Understands the codebase structure and your current task
2. **Pattern Recognition**: Identifies refactoring opportunities using multiple heuristics
3. **Safety Assessment**: Evaluates risk and confidence for each opportunity
4. **Prioritization**: Ranks suggestions by impact and safety
5. **Presentation**: Suggests only high-value, safe improvements at appropriate moments

## Examples

### Detecting Duplication

```
While analyzing user authentication code:

🔍 Smart Refactor detected:
   Validation logic is duplicated in 4 files:
   - src/auth/validator.ts:23-30
   - src/services/user-service.ts:45-52
   - src/services/admin-service.ts:78-85
   - src/api/auth-api.ts:112-119

   💡 Suggestion: Extract to shared validation utility
   ⚡ Confidence: HIGH
   📊 Impact: Eliminate duplication, improve consistency
   ⏱️  Effort: ~15 minutes

   Run: /extract-duplication --scope all --confidence conservative
```

### Modernization Opportunities

```
While reviewing legacy JavaScript code:

🔍 Smart Refactor detected:
   Callback pattern can be modernized to async/await:
   - src/services/data-service.ts:56-68

   💡 Suggestion: Convert to async/await for better readability
   ⚡ Confidence: HIGH
   📊 Impact: Improved error handling, easier testing
   ⏱️  Effort: ~10 minutes

   Run: /modernize-code --scope current-file --target ES2022
```

### Pattern Applications

```
While analyzing payment processing code:

🔍 Smart Refactor detected:
   Complex conditional logic suggests Strategy pattern:
   - src/services/payment-processor.ts:89-156
   - 12 payment types handled in if/else chain
   - Frequently modified code (15 changes in last 3 months)

   💡 Suggestion: Apply Strategy pattern for payment types
   ⚡ Confidence: MEDIUM
   📊 Impact: Easier to add new payment types, better testability
   ⏱️  Effort: ~1 hour

   Run: /apply-pattern --pattern strategy --scope selection
```

## Safety Principles

### When to Suggest
✓ Changes that clearly improve maintainability
✓ Refactoring with low risk of introducing bugs
✓ Improvements that align with codebase conventions
✓ Changes that save future development time
✓ Suggestions that can be easily reverted

### When NOT to Suggest
✗ Highly subjective style preferences
✗ Changes that "look cleaner" but aren't safer
✗ Refactoring without clear benefit
✗ Changes that don't match team conventions
✗ Optimizations that don't matter

## Best Practices

1. **Respect Context**: Only suggest refactoring relevant to current work
2. **High Confidence First**: Prioritize suggestions you're confident about
3. **Explain Value**: Always explain WHY a suggestion is valuable
4. **Estimate Effort**: Give effort estimates to help with prioritization
5. **Provide Commands**: Include exact commands to execute suggestions
6. **Accept Refusal**: Gracefully accept if user doesn't want to refactor

## Integration with Workflow

The Smart Refactor skill works best when:

- You're actively working on code changes
- The codebase has good test coverage
- You've expressed interest in code quality
- Working in areas that change frequently
- Reviewing code before commits

## Limitations

- Cannot force refactoring—user must choose to apply
- Requires code context to make good suggestions
- May not detect all opportunities (false negatives)
- May suggest things user already knows (false positives)
- Can't verify that refactoring is actually safe

## Complementary Tools

This skill works with:

- `/extract-duplication`: Remove code duplication
- `/modernize-code`: Update syntax and APIs
- `/apply-pattern`: Apply design patterns
- `/analyze-refactor-opportunities`: Comprehensive analysis
- Refactoring agents: Specialized refactoring expertise

## Learning and Adaptation

The skill:

- Learns from user feedback on suggestions
- Adapts to team coding conventions
- Refines confidence levels based on responses
- Improves suggestion relevance over time
- Recognizes when to stop suggesting

## Success Metrics

The skill is successful when:

- Users act on high-confidence suggestions
- Refactoring improves code quality
- No bugs are introduced by suggestions
- Users feel more confident refactoring
- Codebase becomes more maintainable
