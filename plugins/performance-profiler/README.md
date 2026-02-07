# Performance Profiler Plugin

Intelligent performance profiler that identifies bottlenecks and suggests optimizations.

## Description

Analyzes code execution performance, detects memory leaks, identifies N+1 query patterns, and provides actionable optimization recommendations for JavaScript/TypeScript, Python, Go, and Java projects.

## Installation

```bash
# From marketplace
claude plugin install performance-profiler

# From local directory
claude plugin install ./performance-profiler --scope user
```

## Usage

### Profile Code

```bash
/profile src/utils/data-processor.ts
/profile src/api/ --deep
/profile src/services/user.service.ts --compare baseline.json
```

### Run Benchmarks

```bash
benchmark src/utils/sort.ts --iterations 10000
benchmark src/algorithms/ --compare src/algorithms-optimized/
benchmark --regression --save v2.0.0
```

### Apply Optimizations

```bash
optimize src/services/
optimize src/ --category memory --aggressive
optimize src/api/ --dry-run
```

### Analyze Memory

```bash
analyze-memory --leaks
analyze-memory --heap --export html
```

### Compare Performance

```bash
compare-perf profile-before.json profile-after.json
compare-perf --trend "profiles/build-*.json" --format json
```

## Configuration

Create `.claude/settings.json`:

```json
{
  "performanceProfiler": {
    "enabled": true,
    "autoProfile": false,
    "baselineBranch": "main",
    "regressionThreshold": 10,
    "categories": ["cpu", "memory", "io"],
    "exclude": ["node_modules/**", "dist/**", "**/*.test.ts"]
  }
}
```

## Features

- Hot spot identification and call graph analysis
- Multi-language support (JavaScript/TypeScript, Python, Go, Java)
- Memory leak detection and heap snapshot analysis
- N+1 query pattern detection
- Automatic optimization suggestions
- Performance regression detection
- Baseline comparison and trend analysis

## Automatic Hooks

- Analyzes code changes after Write/Edit operations for performance implications
- Checks for performance baselines on session start
- Invokes performance analyst for performance-related queries

## Security Considerations

- Profiling adds overhead and should not be enabled in production by default
- Output files may contain sensitive code patterns - store securely
- Auto-apply optimization creates backups before modifying files

## Troubleshooting

**Profiling tools not working:**
```bash
cd performance-profiler/scripts
bash install-tools.sh
```

**Baseline not found:**
```bash
python scripts/generate-baseline.py --name "my-baseline"
```

## License

MIT
