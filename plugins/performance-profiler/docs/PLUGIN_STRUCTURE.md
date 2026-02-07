# Performance Profiler Plugin - Structure Overview

## Directory Structure

```
performance-profiler/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest (metadata + component paths)
│
├── commands/                     # Slash commands
│   ├── profile.md               # /profile - Execution profiling
│   ├── benchmark.md             # /benchmark - Performance benchmarks
│   ├── optimize.md              # /optimize - Auto optimization
│   ├── analyze-memory.md        # /analyze-memory - Memory analysis
│   └── compare-perf.md          # /compare-perf - Performance comparison
│
├── agents/                       # Specialized subagents
│   └── performance-analyst.md   # Deep performance analysis agent
│
├── skills/                       # Agent Skills (auto-invoked)
│   └── performance-analyzer/
│       └── SKILL.md             # Auto-detection of performance issues
│
├── hooks/                        # Event handlers
│   └── hooks.json               # Config for automatic analysis
│
├── scripts/                      # Utility scripts
│   ├── install-tools.sh         # Install profiling tools
│   └── generate-baseline.py     # Generate performance baselines
│
├── docs/                         # Documentation
│   └── PLUGIN_STRUCTURE.md      # This file
│
├── README.md                     # Main documentation
├── INSTALL.md                    # Installation guide
├── CHANGELOG.md                  # Version history
└── LICENSE                       # MIT License
```

## Component Breakdown

### 1. Plugin Manifest (`.claude-plugin/plugin.json`)

Defines plugin metadata and component locations:

```json
{
  "name": "performance-profiler",
  "version": "1.0.0",
  "description": "Intelligent performance profiler...",
  "commands": [...],      // Path to command files
  "agents": "...",        // Path to agent directory
  "skills": "...",        // Path to skills directory
  "hooks": "..."          // Path to hooks config
}
```

### 2. Commands (`commands/*.md`)

Slash commands that users can invoke:

| Command | Purpose |
|---------|---------|
| `/profile` | Profile code execution and identify bottlenecks |
| `/benchmark` | Run comparative benchmarks |
| `/optimize` | Apply automatic optimizations |
| `/analyze-memory` | Analyze memory usage and leaks |
| `/compare-perf` | Compare performance across runs |

**Command Structure:**
```markdown
---
description: Brief description
---

# Command Name

Detailed usage information...
```

### 3. Agents (`agents/*.md`)

Specialized subagents Claude can invoke:

**Performance Analyst Agent:**
- Deep performance analysis
- Root cause identification
- Optimization strategies
- Multi-language expertise

**Agent Structure:**
```markdown
---
description: What the agent does
capabilities: ["cap1", "cap2", ...]
---

# Agent Name

Detailed information about when and how to use this agent...
```

### 4. Skills (`skills/*/SKILL.md`)

Auto-invoked capabilities based on context:

**Performance Analyzer Skill:**
- Automatically detects performance issues while coding
- Triggers on keywords: "slow", "performance", "optimize", etc.
- Provides real-time suggestions

**Skill Structure:**
```markdown
---
name: skill-name
description: What the skill does
trigger: ["keyword1", "keyword2"]
categories: ["category1", "category2"]
---

# Skill Name

Detailed skill behavior...
```

### 5. Hooks (`hooks/hooks.json`)

Event handlers for automatic actions:

**Configured Hooks:**
- **PostToolUse**: Analyzes code changes after Write/Edit
- **SessionStart**: Checks for performance baselines
- **UserPromptSubmit**: Invokes agent for performance-related queries

**Hook Structure:**
```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "pattern",
        "hooks": [
          {
            "type": "command|prompt|agent",
            "description": "...",
            "command/prompt/agent": "..."
          }
        ]
      }
    ]
  }
}
```

### 6. Scripts (`scripts/*`)

Utility scripts for setup and profiling:

**install-tools.sh:**
- Installs language-specific profiling tools
- Supports Node.js, Python, Go, Java, Rust

**generate-baseline.py:**
- Creates performance baseline profiles
- Detects project type automatically
- Saves baselines for regression detection

## Integration Points

### User-Invoked Commands

Users directly call:
```
/profile src/api/
benchmark --regression
optimize src/services/
```

### Automatic Skill Invocation

Claude automatically uses the Performance Analyzer skill when:
- Writing inefficient code patterns
- User mentions performance issues
- Context suggests optimization need

### Agent Invocation

Claude can invoke the Performance Analyst agent for:
- Deep performance analysis
- Complex optimization strategies
- Root cause investigation

### Hook Triggers

Hooks automatically:
- Analyze code after edits
- Check baselines on session start
- Route performance queries to the analyst

## Data Flow

```
User Request
    ↓
Command (/profile, /benchmark, etc.)
    ↓
Skill (auto-detects issues)
    ↓
Agent (deep analysis if needed)
    ↓
Hooks (continuous monitoring)
    ↓
Optimization Suggestions
```

## Extension Points

To extend the plugin:

1. **Add new commands**: Create `.md` files in `commands/`
2. **Add new agents**: Create `.md` files in `agents/`
3. **Add new skills**: Create directories in `skills/` with `SKILL.md`
4. **Add new hooks**: Update `hooks/hooks.json`
5. **Add new scripts**: Create executable files in `scripts/`

## Testing the Plugin

```bash
# 1. Install the plugin
claude plugin install ./performance-profiler

# 2. Test commands work
claude /profile --help

# 3. Verify agents are available
claude /agents

# 4. Check hooks are loaded
claude --debug | grep performance-profiler

# 5. Try profiling
claude /profile src/
```

## Configuration Files

The plugin can be configured via:

**Project-level** (`.claude/settings.json`):
```json
{
  "performanceProfiler": {
    "enabled": true,
    "autoProfile": false,
    "regressionThreshold": 10
  }
}
```

**User-level** (`~/.claude/settings.json`):
```json
{
  "performanceProfiler": {
    "categories": ["cpu", "memory", "io"],
    "exclude": ["node_modules/**"]
  }
}
```

## Debugging

Enable debug mode to see plugin behavior:

```bash
claude --debug
```

Look for:
- Plugin loading messages
- Command registration
- Agent availability
- Hook triggers
- Skill invocations

## Best Practices

1. **Start with `/profile`**: Always profile before optimizing
2. **Use baselines**: Create baselines for regression detection
3. **Test after optimization**: Verify correctness isn't broken
4. **Review changes**: Use `--dry-run` to preview optimizations
5. **Monitor trends**: Use `/compare-perf` to track over time
