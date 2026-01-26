---
description: Apply automatic performance optimizations
---

# Optimize

Analyzes code and applies safe, automatic performance optimizations with rollback capability.

## Usage

```
optimize [target] [options]
```

### Arguments

- `target`: File, directory, or specific function to optimize. Default: current directory.
- `--aggressive`: Enable more aggressive optimizations (may require testing)
- `--safe-only`: Apply only safe, conservative optimizations. Default: true

### Options

- `--dry-run`: Show optimizations without applying them
- `--backup`: Create backup before optimizing. Default: true
- `--category <type>`: Optimization category - `memory`, `cpu`, `io`, or `all`
- `--exclude <pattern>`: Exclude files matching pattern
- `-y, --yes`: Apply optimizations without confirmation

## Optimization Categories

### Memory Optimizations
- Reduce unnecessary object allocations
- Optimize data structures
- Eliminate memory leaks
- Pool reusable objects
- Lazy initialization

### CPU Optimizations
- Algorithm improvements
- Loop optimizations
- Reduce computational complexity
- Memoization and caching
- Avoid redundant calculations

### I/O Optimizations
- Batch database queries
- Async/await optimization
- Buffer management
- Connection pooling
- Reduce network round-trips

## Examples

**Safe optimizations on a directory:**
```
optimize src/services/
```

**Aggressive memory optimizations:**
```
optimize src/ --category memory --aggressive
```

**Dry run to preview changes:**
```
optimize src/api/ --dry-run
```

**Optimize specific file:**
```
optimize src/utils/data-processor.ts --safe-only
```

## Safety Features

- **Backup creation**: Automatic backups before changes
- **Rollback support**: Easy revert of optimizations
- **Dry run mode**: Preview before applying
- **Test verification**: Run tests after optimization
- **Change logging**: Detailed log of all modifications

## Output

For each optimization, you'll see:

- **Location**: File and line number
- **Type**: Optimization category
- **Description**: What was changed and why
- **Impact**: Expected performance improvement
- **Risk level**: Low/Medium/High

## Best Practices

1. **Always test** after applying optimizations
2. **Use version control** for easy rollback
3. **Measure impact** with `/benchmark` before/after
4. **Start conservative** with `--safe-only`
5. **Review changes** with `--dry-run` first

## See Also

- `/profile` - Identify bottlenecks before optimizing
- `/benchmark` - Measure optimization impact
