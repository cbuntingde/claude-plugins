---
name: performance-analyzer
description: Automatically detects performance issues and suggests optimizations while you code
trigger:
  - "slow"
  - "performance"
  - "optimize"
  - "bottleneck"
  - "inefficient"
  - "takes too long"
  - "timeout"
  - "memory leak"
  - "high memory"
  - "cpu usage"
categories:
  - performance
  - optimization
  - profiling
---

# Performance Analyzer Skill

Autonomously detects performance issues and suggests optimizations during development. This skill proactively identifies code patterns that commonly cause performance problems and provides actionable recommendations.

## Automatic Triggers

This skill activates when:

1. **Writing inefficient code patterns**: Nested loops, unbounded iterations, expensive operations in hot paths
2. **Database queries in loops**: N+1 query patterns, repeated similar queries
3. **Missing caching**: Repeated expensive computations or I/O operations
4. **Large memory allocations**: Creating large objects or arrays unnecessarily
5. **Blocking I/O**: Synchronous file/network operations that could be async
6. **Redundant operations**: Repeated work that could be done once
7. **Inefficient data structures**: Using wrong data structure for the use case
8. **Unoptimized regex**: Complicated regular expressions in loops

## Analysis Patterns

### Loop Efficiency
Detects and suggests improvements for:
- Nested loops with high complexity
- Repeated computations inside loops
- Database/API calls inside loops
- Unnecessary iterations
- Opportunities for early exit

**Example Detection**:
```typescript
// BEFORE: Inefficient
for (const user of users) {
  const profile = await db.profiles.find(user.id); // N+1 query
  user.profile = profile;
}

// SUGGESTION: Use data loader or batch query
const profiles = await db.profiles.findByIds(users.map(u => u.id));
const profileMap = new Map(profiles.map(p => [p.id, p]));
users.forEach(user => user.profile = profileMap.get(user.id));
```

### Caching Opportunities
Identifies repeated operations that benefit from caching:
- Expensive function calls with same inputs
- Repeated database queries
- File reads of same content
- Computed values that don't change
- API calls with identical parameters

**Example Detection**:
```javascript
// BEFORE: Repeated expensive computation
function processUser(userId) {
  const permissions = fetchUserPermissions(userId); // Called many times
  // ... use permissions
}

// SUGGESTION: Cache permissions
const permissionCache = new Map();
async function getCachedPermissions(userId) {
  if (!permissionCache.has(userId)) {
    permissionCache.set(userId, await fetchUserPermissions(userId));
  }
  return permissionCache.get(userId);
}
```

### Memory Optimization
Detects memory-related issues:
- Large arrays growing unbounded
- Objects retained unnecessarily
- Missing cleanup in event handlers/listeners
- Temporary large allocations
- Opportunities for object pooling

**Example Detection**:
```typescript
// BEFORE: Memory leak - event listeners not removed
class Component {
  ngOnInit() {
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('scroll', this.handleScroll);
  }
  // Missing cleanup - listeners persist after component destroy
}

// SUGGESTION: Proper cleanup
class Component {
  private handlers: Array<() => void> = [];

  ngOnInit() {
    const resizeHandler = this.handleResize.bind(this);
    const scrollHandler = this.handleScroll.bind(this);

    window.addEventListener('resize', resizeHandler);
    document.addEventListener('scroll', scrollHandler);

    this.handlers.push(
      () => window.removeEventListener('resize', resizeHandler),
      () => document.removeEventListener('scroll', scrollHandler)
    );
  }

  ngOnDestroy() {
    this.handlers.forEach(unregister => unregister());
    this.handlers = [];
  }
}
```

### Database Query Optimization
Identifies inefficient database patterns:
- N+1 query problems
- Missing indexes for frequent queries
- Unselected columns in SELECT *
- Inefficient JOIN orders
- Repeated similar queries

**Example Detection**:
```python
# BEFORE: N+1 query problem
def get_users_with_posts():
    users = User.objects.all()
    for user in users:
        user.posts = user.post_set.all()  # Query per user!
    return users

# SUGGESTION: Use select_related/prefetch_related
def get_users_with_posts():
    return User.objects.prefetch_related('post_set').all()
```

### Async/Await Optimization
Finds async/await inefficiencies:
- Sequential awaits that could be parallel
- Missing async in I/O operations
- Unnecessary async operations
- Promise.all opportunities

**Example Detection**:
```typescript
// BEFORE: Sequential async operations
async function getData() {
  const user = await fetchUser(userId);
  const posts = await fetchUserPosts(userId);  // Waits for user
  const comments = await fetchUserComments(userId);  // Waits for posts
  return { user, posts, comments };
}

// SUGGESTION: Parallel where possible
async function getData() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
    fetchUserComments(userId)
  ]);
  return { user, posts, comments };
}
```

## Response Format

When a performance issue is detected, this skill provides:

1. **Problem identification**: Clear description of the issue
2. **Impact assessment**: How severe the performance impact is (Low/Medium/High)
3. **Optimization suggestion**: Specific code improvement
4. **Before/after comparison**: Show the change
5. **Expected improvement**: Quantitative or qualitative impact
6. **Trade-off considerations**: Any downsides to the optimization

## Integration

This skill works automatically in the background while you code. It:
- Analyzes code as you write it
- Provides suggestions before you commit
- Learns from your codebase patterns
- Adapts to your optimization preferences
- Respects your coding style

## Configuration

Can be configured via settings:

```json
{
  "performanceAnalyzer": {
    "enabled": true,
    "severity": "medium",  // low, medium, high
    "autoSuggest": true,
    "categories": ["loops", "memory", "database", "async"],
    "threshold": {
      "loopComplexity": 1000,
      "allocationSize": 1048576,  // 1MB
      "queryInLoop": true
    }
  }
}
```

## Best Practices

1. **Prioritize impact**: Focus on hot paths and frequently called code
2. **Measure first**: Use `/profile` to identify real bottlenecks
3. **Consider trade-offs**: Readability vs. performance
4. **Test after optimization**: Ensure correctness is maintained
5. **Document decisions**: Explain why optimizations were made
6. **Review periodically**: Re-evaluate optimizations as codebase evolves

## Related Commands

- `/profile` - Detailed performance profiling
- `/benchmark` - Comparative performance testing
- `/optimize` - Apply automatic optimizations
- `/analyze-memory` - Memory-specific analysis
