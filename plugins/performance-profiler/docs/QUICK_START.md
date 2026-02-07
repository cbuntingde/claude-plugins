# Performance Profiler - Quick Start Guide

Get started with the Performance Profiler plugin in 5 minutes.

## Installation (1 minute)

```bash
# Install the plugin
cd performance-profiler
claude plugin install . --scope user

# Install profiling tools (optional but recommended)
cd scripts
bash install-tools.sh
```

## Your First Profile (2 minutes)

### 1. Profile Your Code

Start Claude Code in your project:

```bash
cd your-project
claude
```

Then run:

```
/profile src/
```

**What happens:**
- The plugin analyzes your code execution
- Identifies bottlenecks and hot paths
- Provides optimization suggestions

**Example output:**
```
🔍 Performance Profile Analysis

Hot Spots:
  🔴 processItems() - 1.2s (45% of total time)
     Location: src/services/processor.ts:123
     Called 1,000 times

  🟡 fetchUserData() - 450ms (17% of total time)
     Location: src/api/user.ts:45
     Called 500 times (N+1 query detected)

Optimization Suggestions:
  1. Use data loader for user queries (expected -400ms)
  2. Add caching to processItems (expected -600ms)
  3. Implement batch processing (expected -200ms)
```

## Your First Benchmark (1 minute)

### 2. Run Benchmarks

```
benchmark src/api/users.ts --iterations 1000
```

**What happens:**
- Runs the code 1000 times
- Collects timing statistics
- Provides mean, median, P95, P99

**Example output:**
```
📊 Benchmark Results

Iterations: 1000
Total Time: 2.3s

Statistics:
  Mean:   2.3ms
  Median: 2.1ms
  P95:    3.2ms
  P99:    4.1ms
  StdDev: 0.4ms

Throughput: 434 ops/sec
```

## Your First Optimization (1 minute)

### 3. Apply Optimizations

First, preview changes:

```
optimize src/ --dry-run
```

Review the suggestions, then apply:

```
optimize src/
```

**What happens:**
- Analyzes code for optimization opportunities
- Shows what will be changed
- Applies optimizations with automatic backup
- Runs tests to verify correctness

## Common Workflows

### Workflow 1: Diagnose Slow API

```
# 1. Profile the slow endpoint
/profile src/api/slow-endpoint.ts

# 2. Review findings and apply fixes
# (manually fix the issues found)

# 3. Verify improvement
benchmark src/api/slow-endpoint.ts --compare baseline.json
```

### Workflow 2: Memory Leak Hunt

```
# 1. Analyze memory
analyze-memory --leaks --duration 300

# 2. Review leak report
# (fix identified leaks)

# 3. Verify memory is stable
analyze-memory --compare baseline-memory.json
```

### Workflow 3: Performance Regression Testing

```
# 1. Create baseline on main branch
git checkout main
python scripts/generate-baseline.py --name "main"

# 2. Switch to feature branch
git checkout feature/improvements

# 3. Check for regressions
benchmark --regression --threshold 10
```

## Automatic Features

The plugin also works **automatically** in the background:

### Auto-Detection
While you code, the plugin detects:
- Inefficient loops (nested O(n²) patterns)
- N+1 database queries
- Missing caching opportunities
- Memory leak patterns
- Async/await issues

### Smart Suggestions
Claude will automatically suggest:
- "This loop has O(n²) complexity. Consider using a Map for O(n) lookup."
- "You're calling the database inside a loop. Use a batch query instead."
- "This expensive computation could be cached."

## Next Steps

### Learn More
- 📖 [Full Documentation](../README.md)
- 🏗️ [Plugin Structure](./PLUGIN_STRUCTURE.md)
- 📥 [Installation Guide](../INSTALL.md)

### Advanced Features
- 📈 Create performance baselines
- 🔄 Set up CI/CD regression testing
- 📊 Generate performance trend reports
- 🤖 Use the Performance Analyst agent for deep dives

### Configuration
Create `.claude/settings.json`:
```json
{
  "performanceProfiler": {
    "enabled": true,
    "autoProfile": false,
    "regressionThreshold": 10,
    "exclude": ["node_modules/**", "dist/**"]
  }
}
```

## Tips

✅ **Do:**
- Always profile before optimizing
- Create baselines for comparison
- Test thoroughly after optimization
- Monitor performance in production

❌ **Don't:**
- Optimize without measuring first
- Optimize code that's rarely executed
- Sacrifice readability for micro-optimizations
- Forget to document why you optimized

## Troubleshooting

**Plugin not found:**
```bash
claude plugin install ./performance-profiler --scope user
```

**Commands not working:**
```bash
claude --debug | grep performance-profiler
```

**Profiling tools missing:**
```bash
cd scripts && bash install-tools.sh
```

## Get Help

- Command help: `/profile --help`
- Plugin docs: [README.md](../README.md)
- Issues: [GitHub Issues](https://github.com/your-org/performance-profiler/issues)

---

Happy profiling! 🚀
