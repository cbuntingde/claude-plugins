# Performance Profiler Plugin

A comprehensive performance profiling and optimization plugin for Claude Code that identifies bottlenecks, analyzes execution patterns, and suggests actionable optimizations.

## Features

### 🔍 Intelligent Profiling
- **Hot spot identification**: Automatically find the most frequently executed code paths
- **Call graph analysis**: Understand function call relationships and frequencies
- **Multi-language support**: Works with JavaScript/TypeScript, Python, Go, Java, and more
- **Memory leak detection**: Identify objects that should be garbage collected but aren't

### 📊 Performance Commands

#### `/profile`
Profile code execution and identify performance bottlenecks.

```bash
# Profile a specific file
/profile src/utils/data-processor.ts

# Profile with call graph analysis
/profile src/api/ --deep

# Compare against baseline
/profile src/services/user.service.ts --compare baseline.json
```

#### `/benchmark`
Run comparative benchmarks and performance tests.

```bash
# Benchmark a function
benchmark src/utils/sort.ts --iterations 10000

# Compare implementations
benchmark src/algorithms/ --compare src/algorithms-optimized/

# Check for regressions
benchmark --regression --save v2.0.0
```

#### `/optimize`
Apply automatic performance optimizations.

```bash
# Safe optimizations
optimize src/services/

# Aggressive memory optimizations
optimize src/ --category memory --aggressive

# Preview changes
optimize src/api/ --dry-run
```

#### `/analyze-memory`
Analyze memory usage and identify leaks.

```bash
# Detect memory leaks
analyze-memory --leaks

# Heap snapshot analysis
analyze-memory --heap --export html
```

#### `/compare-perf`
Compare performance across multiple profile runs.

```bash
# Compare two profiles
compare-perf profile-before.json profile-after.json

# Generate trend report
compare-perf --trend "profiles/build-*.json" --format chart
```

### 🤖 Performance Analyst Agent

A specialized agent for deep performance analysis:

- Root cause analysis of performance issues
- Database query optimization (N+1 detection, indexing suggestions)
- Caching strategy design
- Concurrency and parallelization optimization
- Language-specific optimization patterns

### ⚡ Performance Analyzer Skill

Automatically detects performance issues while you code:

- Loop inefficiencies and complexity issues
- N+1 query patterns
- Missing caching opportunities
- Memory leak patterns
- Async/await optimization opportunities
- Inefficient data structures

### 🪝 Automatic Hooks

- **Post-write analysis**: Analyzes code changes for performance implications
- **Session start**: Checks for existing performance baselines
- **Keyword triggers**: Automatically invokes performance analyst for performance-related queries

## Installation

### From Marketplace

```bash
claude plugin install performance-profiler
```

### Manual Installation

1. Clone or download this plugin
2. Install to your preferred scope:

```bash
# User scope (recommended)
claude plugin install ./performance-profiler --scope user

# Project scope (team shared)
claude plugin install ./performance-profiler --scope project

# Local scope (gitignored)
claude plugin install ./performance-profiler --scope local
```

### Tool Installation

The plugin includes a script to install language-specific profiling tools:

```bash
# Run from plugin directory
cd performance-profiler/scripts
bash install-tools.sh
```

This will install:
- **Node.js**: 0x, clinic.js, autocannon
- **Python**: py-spy, memory-profiler, line-profiler
- **Go**: pprof
- **Rust**: flamegraph

## Quick Start

### 1. Profile Your Code

Start by profiling your application to identify bottlenecks:

```bash
/profile src/
```

This will:
- Analyze code execution patterns
- Identify hot paths and bottlenecks
- Provide specific optimization suggestions
- Generate a performance report

### 2. Create a Baseline

Generate a baseline for regression detection:

```bash
cd performance-profiler/scripts
python generate-baseline.py --name "v1.0.0"
```

### 3. Run Benchmarks

Establish performance metrics:

```bash
benchmark src/api/ --iterations 1000 --save baseline
```

### 4. Apply Optimizations

Let the plugin suggest optimizations:

```bash
optimize src/services/ --dry-run
```

Review the suggestions, then apply them:

```bash
optimize src/services/
```

### 5. Verify Improvements

Compare against your baseline:

```bash
compare-perf --baseline .claude/performance-baseline.json
```

## Usage Examples

### Example 1: Optimize Slow API Endpoint

**Problem**: API endpoint takes 3 seconds to respond

```bash
# 1. Profile the endpoint
/profile src/api/users.ts

# 2. Review findings
# Output shows:
# - N+1 database queries in loop
# - No caching of user permissions
# - Synchronous I/O operations

# 3. Apply optimizations
optimize src/api/users.ts

# 4. Benchmark improvement
benchmark src/api/users.ts --compare before-optimization.json

# Result: 3s → 200ms (15x improvement)
```

### Example 2: Fix Memory Leak

**Problem**: Memory usage grows continuously

```bash
# 1. Analyze memory
analyze-memory --leaks --duration 300

# 2. Review leak report
# Output shows:
# - Event listeners not removed on unmount
# - Closures retaining large objects
# - Cache growing without bounds

# 3. Apply fixes
optimize src/ --category memory

# 4. Monitor memory
analyze-memory --compare baseline-memory.json
```

### Example 3: Database Query Optimization

**Problem**: Database queries are slow

```bash
# 1. Profile database operations
/profile src/services/ --deep

# 2. Use Performance Analyst agent
# Claude will automatically invoke the agent when it detects:
# - N+1 query patterns
# - Missing indexes
# - Inefficient joins

# 3. Apply suggested optimizations
# - Add data loader pattern
# - Create indexes
# - Use select_related/prefetch_related

# 4. Benchmark improvements
benchmark --suite database-queries --regression
```

## Configuration

Create `.claude/settings.json` in your project:

```json
{
  "performanceProfiler": {
    "enabled": true,
    "autoProfile": false,
    "baselineBranch": "main",
    "regressionThreshold": 10,
    "categories": ["cpu", "memory", "io"],
    "exclude": [
      "node_modules/**",
      "dist/**",
      "**/*.test.ts"
    ]
  }
}
```

## CI/CD Integration

### Performance Regression Tests

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on: [pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Claude Code
        run: npm install -g claude-code

      - name: Install plugin
        run: claude plugin install performance-profiler

      - name: Run benchmarks
        run: claude benchmark --regression --threshold 10

      - name: Compare with baseline
        run: |
          claude compare-perf \
            --baseline .claude/baselines/main.json \
            --threshold 10 \
            --regression
```

### Pre-commit Hooks

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Quick performance check
claude profile src/ --duration 5 --format json > /tmp/profile.json

# Check for significant slowdowns
python scripts/check-regression.py /tmp/profile.json
```

## Performance Analysis Patterns

### Memory Optimization
- Reduce unnecessary object allocations
- Optimize data structures
- Eliminate memory leaks
- Pool reusable objects
- Lazy initialization

### CPU Optimization
- Algorithm improvements (O(n²) → O(n log n))
- Loop optimizations
- Reduce computational complexity
- Memoization and caching
- Avoid redundant calculations

### I/O Optimization
- Batch database queries
- Async/await patterns
- Buffer management
- Connection pooling
- Reduce network round-trips

## Best Practices

1. **Measure First**: Always profile before optimizing - you might optimize the wrong thing
2. **Focus on Hot Paths**: 80% of execution time is typically in 20% of code
3. **Consider Trade-offs**: Optimization vs. maintainability vs. development time
4. **Test Thoroughly**: Optimization bugs can be subtle
5. **Monitor in Production**: Real-world performance differs from benchmarks
6. **Document Decisions**: Record why optimizations were made

## Troubleshooting

### Profiler Not Working

```bash
# Check if profiling tools are installed
cd performance-profiler/scripts
bash install-tools.sh

# Verify plugin is loaded
claude --debug | grep performance-profiler
```

### Baseline Not Found

```bash
# Generate a new baseline
python scripts/generate-baseline.py --name "my-baseline"
```

### High Memory During Profiling

Profiling adds overhead. For production profiling:
- Use sampling profilers (not instrumentation)
- Profile for shorter durations
- Filter to specific modules/packages

## Contributing

Contributions welcome! Areas for improvement:
- Additional language support (Ruby, PHP, .NET)
- More profiling tools integration
- Enhanced visualization in `/compare-perf`
- Machine learning for anomaly detection

## License

MIT License - see LICENSE file for details

## Support

- 📖 Documentation: [Plugin Docs](https://code.claude.com/docs/en/plugins)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/performance-profiler/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/performance-profiler/discussions)

## Acknowledgments

Built with:
- [Claude Code Plugin System](https://code.claude.com/docs/en/plugins)
- Various open-source profiling tools (0x, py-spy, pprof, etc.)
