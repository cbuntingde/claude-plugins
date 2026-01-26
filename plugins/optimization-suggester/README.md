# Optimization Suggester Plugin

A Claude Code plugin that analyzes code and suggests performance optimizations focused on caching, memoization, and async patterns.

## Installation

1. Copy the `optimization-suggester` folder to your Claude Code plugins directory:
   ```
   # Typical plugin locations:
   - Windows: %APPDATA%\Claude\plugins\
   - macOS: ~/Library/Application Support/Claude/plugins/
   - Linux: ~/.config/claude/plugins/
   ```

2. Restart Claude Code to load the plugin

## Usage

Once installed, invoke the skill by running:

```
/suggest-optimizations
```

Or provide specific files to analyze:

```
/suggest-optimizations src/services/api.js
```

The plugin will:
- Scan the specified code for optimization opportunities
- Categorize suggestions by type (Caching, Memoization, Async Patterns)
- Provide before/after code examples
- Estimate performance impact

## What It Checks

### Caching
- Repeated database/API calls
- Expensive computations used multiple times
- File reads, regex compilations

### Memoization
- Pure functions with repeated arguments
- Recursive functions with overlapping subproblems
- Mathematical calculations

### Async Patterns
- Sequential I/O that could be parallel
- Missing `Promise.all()` usage
- Blocking operations that could be async
- Streaming opportunities for large operations

## Example Output

```
### **Caching: Database Query in Loop**
- **Location**: `src/services/user.js:45-50`
- **Issue**: Querying database inside a loop causes N+1 queries
- **Solution**: Fetch all users in a single query
- **Impact**: Reduces queries from O(n) to O(1)

### **Memoization: Fibonacci Function**
- **Location**: `src/utils/math.js:23-28`
- **Issue**: Exponential time complexity due to repeated calculations
- **Solution**: Add memoization to cache results
- **Impact**: Reduces time from O(2^n) to O(n)
```

## Configuration

You can customize the analysis scope by:
- Specifying individual files
- Targeting specific directories
- Using glob patterns like `src/**/*.js`

## License

MIT
