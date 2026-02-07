# Performance Profiler Plugin - Installation Guide

## Quick Installation

### Option 1: Install from Local Directory

```bash
# Navigate to the plugin directory
cd performance-profiler

# Install to user scope (recommended)
claude plugin install . --scope user

# Or install to project scope (shared with team)
claude plugin install . --scope project
```

### Option 2: Manual Installation

1. Copy the `performance-profiler` directory to your desired location
2. Add to your Claude Code settings:

**User scope** (`~/.claude/settings.json`):
```json
{
  "plugins": [
    {
      "source": "/path/to/performance-profiler"
    }
  ]
}
```

**Project scope** (`.claude/settings.json`):
```json
{
  "plugins": [
    {
      "source": "./performance-profiler"
    }
  ]
}
```

## Post-Installation Setup

### 1. Install Profiling Tools

The plugin includes a helper script to install language-specific profiling tools:

```bash
cd performance-profiler/scripts
bash install-tools.sh
```

This will install:
- **Node.js**: 0x, clinic.js, autocannon
- **Python**: py-spy, memory-profiler, line-profiler
- **Go**: pprof
- **Rust**: flamegraph

### 2. Verify Installation

```bash
# Check that the plugin is loaded
claude --debug | grep performance-profiler

# Test the commands
claude /profile --help
claude benchmark --help
```

### 3. Create Initial Baseline (Optional)

```bash
cd performance-profiler/scripts
python generate-baseline.py --name "initial"
```

## Usage

Once installed, you can use these commands in any Claude Code session:

- `/profile [file]` - Profile code execution
- `/benchmark [target]` - Run benchmarks
- `/optimize [target]` - Apply optimizations
- `/analyze-memory` - Analyze memory usage
- `/compare-perf [files]` - Compare performance

## Troubleshooting

### Plugin Not Loading

1. Check the plugin manifest:
```bash
cat performance-profiler/.claude-plugin/plugin.json
```

2. Validate JSON syntax:
```bash
claude plugin validate ./performance-profiler
```

3. Check debug output:
```bash
claude --debug
```

### Commands Not Available

1. Verify commands directory exists:
```bash
ls -la performance-profiler/commands/
```

2. Check command files have proper frontmatter:
```bash
head -n 5 performance-profiler/commands/profile.md
```

### Profiling Tools Not Working

1. Reinstall tools:
```bash
cd performance-profiler/scripts
bash install-tools.sh
```

2. Check individual tools:
```bash
# For Node.js
npm list -g 0x clinic.js autocannon

# For Python
pip list | grep -E 'py-spy|memory-profiler|line-profiler'

# For Go
which pprof
```

## Uninstallation

```bash
# Uninstall the plugin
claude plugin uninstall performance-profiler

# Or remove from settings.json manually
```

## Next Steps

- Read the [README.md](./README.md) for detailed usage
- Check [CHANGELOG.md](./CHANGELOG.md) for version history
- Review the command files in `commands/` for specific usage
