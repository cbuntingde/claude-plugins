---
description: Run comparative benchmarks and performance tests
---

# Benchmark

Executes performance benchmarks comparing different implementations or tracking performance over time.

## Usage

```
benchmark [target] [options]
```

### Arguments

- `target`: What to benchmark - function, file, or implementation pattern
- `--iterations <n>`: Number of benchmark iterations. Default: 1000
- `--warmup <n>`: Warmup iterations before measurement. Default: 100
- `--compare <implementation>`: Alternative implementation to compare against

### Options

- `--suite <name>`: Run a predefined benchmark suite
- `--filter <pattern>`: Filter benchmarks by name pattern
- `--save <name>`: Save results as a named baseline
- `--regression`: Check for performance regressions against saved baselines
- `-j, --json`: Output results in JSON format

## Examples

**Benchmark a specific function:**
```
benchmark src/utils/sort.ts --iterations 10000
```

**Compare two implementations:**
```
benchmark src/algorithms/ --compare src/algorithms-optimized/
```

**Run benchmark suite:**
```
benchmark --suite database-queries
```

**Check for regressions:**
```
benchmark --regression --save v2.0.0
```

## Benchmark Suites

Common benchmark suites included:

- `database-queries`: Query execution and ORM performance
- `api-endpoints`: API response times and throughput
- `data-processing`: Data transformation and computation
- `rendering`: UI rendering and update cycles
- `memory-operations`: Memory allocation and GC patterns

## Output

Benchmarks provide:

- **Mean/Median/Std Dev**: Statistical analysis of execution times
- **Percentiles**: P50, P95, P99 latency measurements
- **Throughput**: Operations per second
- **Comparison**: Relative performance differences
- **Trend analysis**: Performance changes over time

## CI/CD Integration

Benchmarks can detect performance regressions:

```yaml
# Example CI check
- name: Performance benchmarks
  run: claude benchmark --regression
```

## See Also

- `/profile` - Detailed execution profiling
- `/compare-perf` - Visualize performance trends
