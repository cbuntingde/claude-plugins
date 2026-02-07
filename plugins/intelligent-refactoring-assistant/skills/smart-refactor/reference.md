# Smart Refactor Reference

Technical reference for the Smart Refactor skill implementation.

## Detection Algorithms

### Code Duplication Detection

```
Algorithm: Token-based duplicate detection

1. Parse code into tokens (ignoring whitespace/comments)
2. Create sliding window of token sequences (default: 50 tokens)
3. Build hash map of token sequences → locations
4. Find sequences appearing in 3+ locations
5. Extend matches to find complete duplicate blocks
6. Filter trivial matches (boilerplate, imports)

Confidence calculation:
- Exact match 3+ times: HIGH
- Near-match (85% similarity) 3+ times: MEDIUM
- Near-match (70% similarity) 3+ times: LOW
```

### Modernization Detection

```
Algorithm: Pattern-based modernization detection

1. Parse code into AST
2. Match against known legacy patterns:
   - var declarations
   - callback functions
   - Function.prototype.bind
   - CommonJS require/module.exports
   - Prototype inheritance
   - String concatenation
   - Old-style classes

3. For each match:
   - Verify modern equivalent exists
   - Check behavior preservation
   - Assess complexity of change

Confidence calculation:
- Syntax sugar changes (var → const): HIGH
- Flow changes (callbacks → async/await): MEDIUM
- API replacements with behavior differences: LOW
```

### Pattern Opportunity Detection

```
Algorithm: Heuristic-based pattern detection

1. Analyze code metrics:
   - Cyclomatic complexity
   - Switch/if-else chain length
   - Method/class size
   - Change frequency (from git history)
   - Coupling metrics

2. Match against pattern heuristics:
   - Long switch/if-else + high change frequency → Strategy
   - Direct DB calls scattered → Repository
   - Complex object creation → Builder
   - Similar methods with small variations → Template Method

3. Calculate pattern fit score:
   - Problem match (0-100)
   - Benefit estimate (0-100)
   - Implementation complexity (0-100, inverted)

Confidence calculation:
- Score > 70: HIGH
- Score 50-70: MEDIUM
- Score 30-50: LOW
```

## Confidence Scoring

### High Confidence (>80%)
- Clear objective improvement
- Low risk of introducing bugs
- Simple, reversible change
- Aligns with best practices
- High frequency impact

### Medium Confidence (50-80%)
- Subjective but reasonable improvement
- Moderate risk
- Requires some judgment
- May need testing
- Medium frequency impact

### Low Confidence (<50%)
- Subjective improvement
- Higher risk or complexity
- Requires significant judgment
- Needs thorough testing
- Unclear benefit

## Suggestion Prioritization

```
Priority Score = (Impact × Frequency × Confidence) / Effort

Where:
- Impact: 1-10 (how much improvement)
- Frequency: 1-10 (how often code is used/changed)
- Confidence: 0.5-1.0 (our confidence in suggestion)
- Effort: 1-10 (time to implement, inverted)

Priority Levels:
- Score > 50: Critical (show immediately)
- Score 25-50: Important (show in next break)
- Score 10-25: Nice to have (mention if relevant)
- Score < 10: Defer (don't mention)
```

## Context Awareness

### Current Task Detection
- File type and language
- Recent edits in current session
- User's stated goals
- Code section being worked on

### Codebase Context
- Overall code structure
- Team conventions (from existing patterns)
- Test coverage
- Change history (git)
- Dependencies

### Timing Considerations
- Don't interrupt focused work
- Suggest during natural breaks
- Group related suggestions
- Respect user's workflow

## Implementation Guidelines

### When to Activate
1. User explicitly asks about refactoring
2. Code analysis is explicitly requested
3. User mentions code quality issues
4. After completing a primary task
5. During code review

### When NOT to Activate
1. User is actively typing/editing
2. Working in unrelated file
3. No clear refactoring opportunity
4. Low confidence suggestions only
5. User has declined similar suggestions

### Suggestion Format
```
🔍 Smart Refactor detected:
   [Clear, concise description of opportunity]

   📍 Location: [file:line-range]
   💡 Suggestion: [What to improve]
   ⚡ Confidence: [HIGH/MEDIUM/LOW]
   📊 Impact: [Why it matters]
   ⏱️  Effort: [Time estimate]

   Run: [exact command to execute]
```

## Testing and Validation

### Detection Quality Metrics
- Precision: What % of suggestions are valid?
- Recall: What % of actual issues do we detect?
- False Positive Rate: How often do we suggest incorrectly?
- User Acceptance: What % of suggestions does user act on?

### Safety Validation
- No suggestions that break existing tests
- No suggestions that introduce compilation errors
- No suggestions that change behavior
- All suggestions should be reversible

## Language-Specific Patterns

### JavaScript/TypeScript
- var → const/let
- Callback → Promise → async/await
- Function expression → Arrow function
- CommonJS → ES modules
- Prototype → class syntax
- String concat → Template literals

### Python
- % format → f-strings
- Legacy class syntax → dataclasses
- List comprehension → Generator (for large datasets)
- Threading → Asyncio (where appropriate)
- Manual decorators → @dataclass, @property

### Java
- Anonymous class → Lambda
- Date → LocalDate/LocalDateTime
- Optional.isPresent() → Optional.ifPresent()
- try-with-resources
- Record classes for data carriers

### Go
- Error handling patterns
- Interface design
- Goroutine patterns
- Context usage

## Performance Considerations

### Analysis Optimization
- Incremental analysis (only changed files)
- Cached AST parsing
- Lazy computation (only when needed)
- Parallel analysis for large codebases

### Resource Limits
- Max analysis time: 5 seconds per file
- Max memory: 500MB for analysis
- Max suggestions: 5 per activation
- Cache results for 10 minutes

## Error Handling

### When Analysis Fails
- Gracefully degrade (don't crash)
- Log error for debugging
- Fall back to basic patterns
- Don't show low-confidence suggestions

### Edge Cases
- Empty files
- Syntax errors (partial parsing)
- Mixed language files
- Generated code (ignore)
- Minified code (ignore)

## Future Enhancements

### Planned Features
- Machine learning for better detection
- Integration with IDE refactoring tools
- Automatic safe refactoring (with permission)
- Team-based learning from refactoring history
- Integration with code review platforms

### Research Areas
- Semantic duplicate detection (beyond syntax)
- Behavioral equivalence verification
- Impact prediction (what will break)
- Cost/benefit analysis
- Automated refactoring planning
