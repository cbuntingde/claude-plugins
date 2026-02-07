---
description: Automatically assess technical debt when analyzing code or making changes
triggers:
  - User asks about code quality
  - Pull request reviews
  - Architecture discussions
  - Performance investigations
  - Bug analysis
  - Refactoring planning
  - Sprint backlog grooming
---

# Debt Assessment Skill

Autonomously assess technical debt during code analysis, refactoring, and quality discussions.

## When This Skill Activates

Claude will automatically invoke this skill when:

1. **Code Quality Questions**
   - "How's the code quality?"
   - "What needs refactoring?"
   - "Is this code maintainable?"

2. **Code Review Context**
   - Reviewing pull requests
   - Analyzing proposed changes
   - Assessing impact of modifications

3. **Architecture & Design**
   - Evaluating system design
   - Planning refactoring initiatives
   - Assessing technical trade-offs

4. **Performance & Bug Investigation**
   - Investigating slow code
   - Analyzing bug root causes
   - Tracing error sources

5. **Planning & Prioritization**
   - Sprint planning
   - Backlog refinement
   - Technical debt prioritization

## Assessment Framework

### Multi-Dimensional Analysis

For each code artifact analyzed, assess:

**1. Complexity Metrics**
- Cyclomatic complexity
- Cognitive load
- Nesting depth
- Method/class length

**2. Maintainability**
- Code duplication
- Coupling and cohesion
- Modularity
- Testability

**3. Design Quality**
- SOLID principles adherence
- Design patterns use/abuse
- Architecture layering
- Separation of concerns

**4. Security & Safety**
- Input validation
- Error handling
- Resource management
- Dependency vulnerabilities

**5. Code Health**
- Dead code
- Commented code
- Naming clarity
- Documentation

### Debt Scoring

Calculate an overall debt score (0-100):

```
Debt Score = (Complexity Issues × 2) +
             (Maintainability Issues × 1.5) +
             (Design Issues × 1.8) +
             (Security Issues × 3) +
             (Code Health Issues × 1)
```

**Score Interpretation:**
- 0-20: Clean code ✅
- 21-40: Minor debt 🟡
- 41-60: Moderate debt 🟠
- 61-80: Significant debt 🔴
- 81-100: Critical debt 🚨

## Output Format

### Quick Assessment (Inline)
When discussing code, provide brief observations:

```
This function has a complexity of 8 and uses the database directly.
Consider:
• Extract data access to repository layer
• Add error handling for connection failures
Current debt score: 35/100 (moderate)
```

### Detailed Assessment (Structured)
For comprehensive analysis:

```markdown
## Technical Debt Assessment: AuthService

**Overall Debt Score: 62/100 (Significant)**

### Critical Issues (🚨)
1. SQL Injection Risk (Impact: 9/10)
   - Location: `authenticate()` line 45
   - Issue: Concatenating user input into SQL query
   - Fix: Use parameterized queries

2. Unhandled Exceptions (Impact: 7/10)
   - Location: `validateToken()` line 89
   - Issue: No error handling for invalid tokens
   - Fix: Add try-catch and return proper error

### High Priority Issues (🔴)
3. High Cyclomatic Complexity (15)
   - Location: `refreshAccessToken()` lines 120-156
   - Issue: Too many decision branches
   - Fix: Extract token validation logic

4. Code Duplication (3 instances)
   - Locations: Lines 45, 78, 134
   - Issue: Repeated user lookup pattern
   - Fix: Extract `findUser()` method

### Medium Priority Issues (🟡)
5. Unclear Variable Names
   - Locations: `tmp`, `data`, `res` throughout
   - Fix: Use descriptive names

6. Missing Documentation
   - Issue: No JSDoc comments
   - Fix: Document public methods

### Quick Wins
• Add JSDoc comments (5 min)
• Rename `tmp` to `userSession` (2 min)
• Extract user lookup (15 min)

### Recommended Refactoring Plan
Priority 1: Fix SQL injection (security critical)
Priority 2: Add error handling (reliability)
Priority 3: Reduce complexity (maintainability)

Estimated effort: 3-4 hours
Risk reduction: 70%
```

## Assessment Guidelines

### 1. Be Specific and Actionable
- ✅ Good: "Line 45: SQL query concatenates user input. Use parameterized query."
- ❌ Bad: "The code has security issues."

### 2. Provide Context
- Explain why something is a problem
- Show the impact on the system
- Reference best practices

### 3. Offer Solutions
- Suggest concrete refactoring steps
- Provide code examples when helpful
- Link to relevant documentation

### 4. Prioritize by Impact
- Focus on high-impact, high-severity issues
- Identify quick wins
- Distinguish between critical and nice-to-have

### 5. Be Constructive
- Frame feedback as improvement opportunities
- Acknowledge good practices when present
- Balance criticism with positives

## Common Patterns

### Analyzing Functions
```markdown
**Function: `processPayment(amount, card, options)`**

**Assessment: High Debt (72/100)**

Issues:
• Too many parameters (4) → Extract Parameter Object
• High complexity (13) → Extract validation logic
• No input validation → Add guards
• Missing error handling → Wrap in try-catch

Suggested refactor:
```javascript
class PaymentRequest {
  constructor(amount, card, options) { ... }
  validate() { ... }
}

function processPayment(request) {
  if (!request.validate()) throw ...
  try {
    return gateway.charge(request)
  } catch (error) {
    logger.error('Payment failed', error)
    throw new PaymentError(error)
  }
}
```

Expected improvement: Debt score 72 → 28
```

### Reviewing Classes
```markdown
**Class: UserController**

**Assessment: God Object (85/100)**

Issues:
• 1,250 lines, 32 methods → Extract classes
• Handles auth, profile, billing, notifications → SRP violation
• Directly uses 15 other classes → Tight coupling

Recommended extraction:
- AuthController (authentication)
- ProfileController (user profile)
- BillingController (payment methods)
- NotificationService (notifications)

Base UserController → 8 methods, 200 lines
```

### Examining Dependencies
```markdown
**Module Dependency Analysis**

**Assessment: Tight Coupling (68/100)**

Issues:
• Circular dependency: Service → Utils → Service
• God imports: Uses 25 modules
• Law of Demeter violations: `a.b.c.d.e` chains

Recommendations:
• Break circular dependencies with events
• Introduce facades for complex subsystems
• Apply Law of Demeter (talk to friends, not strangers)

Impact: Reduces change ripple effect by 60%
```

## Integration with Code Review

When reviewing pull requests:

1. **Assess New Debt**
   - Does the PR add technical debt?
   - What's the debt impact score?
   - Can the debt be addressed in this PR?

2. **Compare Alternatives**
   - Option A: Quick implementation, adds debt
   - Option B: Proper refactor, more time
   - Recommendation: Based on context

3. **Suggest Improvements**
   - "Consider extracting this to a service"
   - "This would benefit from error handling"
   - "The complexity could be reduced with..."

## Continuous Assessment

This skill enables continuous quality monitoring:
- Real-time debt detection during coding
- Proactive identification of problem areas
- Trend tracking over time
- Prevention of debt accumulation

## Best Practices

1. **Context-Aware**: Adjust severity based on context (prototype vs. production)
2. **Incremental**: Small, continuous improvements over big rewrites
3. **Evidence-Based**: Use metrics and concrete examples
4. **Team-Aligned**: Match team coding standards
5. **Action-Oriented**: Always provide clear next steps
