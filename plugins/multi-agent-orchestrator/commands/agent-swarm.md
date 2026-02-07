# agent-swarm

Launches multiple parallel AI agents for comprehensive code analysis.

## Usage

```
/agent-swarm [agents...] [path]
```

## Arguments

- `agents` - Optional list of specific agents to run:
  - `observer` - Code review and bug detection
  - `security` - OWASP vulnerability scanning
  - `code-standards` - Code quality validation
  - `ai-slop` - Incomplete code detection
  - `qa` - Quality assurance testing and validation
  - `coder` - Fix implementation (requires analysis results)
- `path` - Optional target path to analyze (default: current directory)

## Examples

### Run all analysis agents in parallel
```
/agent-swarm
```

### Run specific agents
```
/agent-swarm observer security
```

### Run agents on specific directory
```
/agent-swarm security ./src/api
```

### Run coder agent after analysis
```
/agent-swarm coder
```

## Output

Each agent produces a markdown report with:
- File paths and line numbers
- Severity levels (critical, high, medium, low)
- Issue descriptions
- Suggested fixes

## Notes

- Agents run in parallel for faster analysis
- Results can be passed to the coder agent for automated fixes
- All agents use the general-purpose subagent type
