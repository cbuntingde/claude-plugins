---
description: Profile code execution and identify performance bottlenecks
---

# Profile

Analyzes code execution performance and identifies bottlenecks, hot paths, and optimization opportunities.

## Usage

```
/profile [file-or-function] [options]
```

### Arguments

- `file-or-function` (optional): Specific file, function, or directory to profile. Defaults to current working directory.
- `--format <type>`: Output format - `text`, `json`, or `html`. Default: `text`
- `--duration <ms>`: Minimum duration threshold for reporting (in milliseconds). Default: 100
- `--deep`: Enable deep profiling with call graph analysis
- `--compare <baseline>`: Compare results against a baseline profile

### Options

- `-o, --output <file>`: Save profile results to file
- `-v, --verbose`: Include detailed timing information
- `--no-color`: Disable colored output

## Examples

**Profile a specific file:**
```
/profile src/utils/data-processor.ts
```

**Profile with call graph analysis:**
```
/profile src/api/ --deep
```

**Compare against baseline:**
```
/profile src/services/user.service.ts --compare baseline.json
```

**Export to HTML report:**
```
/profile --format html --output profile-report.html
```

## Output

The profiler provides:

- **Hot spot identification**: Functions with highest execution time
- **Call frequency analysis**: Most frequently called functions
- **Memory usage patterns**: Memory allocation and GC pressure
- **I/O bottlenecks**: File, network, and database operation timing
- **Optimization suggestions**: Specific recommendations with expected impact

## Integration

This command automatically:
- Generates performance profiles using appropriate language-specific profilers
- Analyzes the results to identify meaningful bottlenecks
- Provides actionable optimization suggestions
- Can integrate with CI/CD for regression detection

## See Also

- `/benchmark` - Run comparative benchmarks
- `/optimize` - Apply automatic optimizations
- `/compare-perf` - Compare multiple profile runs
