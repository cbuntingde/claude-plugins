---
description: Analyze memory usage and identify leaks
---

# Analyze Memory

Performs comprehensive memory analysis to identify leaks, high allocations, and optimization opportunities.

## Usage

```
analyze-memory [target] [options]
```

### Arguments

- `target`: Application entry point or PID to analyze. Default: starts and analyzes current project.
- `--duration <seconds>`: Analysis duration. Default: 60
- `--interval <ms>`: Sampling interval in milliseconds. Default: 100

### Options

- `--leaks`: Focus on memory leak detection
- `--allocations`: Track allocation patterns
- `--heap`: Analyze heap snapshot
- `--compare <baseline>`: Compare against baseline memory profile
- `--threshold <mb>`: Alert threshold in MB. Default: 100
- `--export <format>`: Export format - `json`, `html`, or `text`

## Examples

**Analyze running application:**
```
analyze-memory --leaks
```

**Heap snapshot analysis:**
```
analyze-memory --heap --export html
```

**Compare memory usage:**
```
analyze-memory --compare baseline-memory.json
```

**Monitor allocations over time:**
```
analyze-memory --duration 300 --allocations
```

## Analysis Types

### Memory Leak Detection
- Identifies objects that should be garbage collected but aren't
- Tracks event listeners and closures preventing GC
- Detects cache accumulations
- Finds circular references

### Allocation Analysis
- Hot allocation paths
- Most allocated object types
- Allocation rate by function
- Generational GC pressure

### Heap Analysis
- Object retention
- Dominator tree
- Reference chains
- Size distribution

## Output

Memory analysis provides:

- **Memory leak report**: Suspected leaks with location
- **Allocation hotspots**: Functions allocating most memory
- **Heap summary**: Total usage, broken down by object type
- **Retention paths**: Why objects are being kept in memory
- **Optimization suggestions**: Specific memory improvements

## Alerts

The analyzer will alert on:

- Sudden memory spikes
- Continuous growth patterns
- Exceeding threshold limits
- Known leak patterns

## Integration

Can be integrated into development workflows:

```json
// package.json
{
  "scripts": {
    "test:memory": "claude analyze-memory --leaks --threshold 50"
  }
}
```

## See Also

- `/profile` - General performance profiling
- `/optimize` --category memory - Memory optimizations
