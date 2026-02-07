# create-agent

Creates a new custom agent definition for the multi-agent orchestrator.

## Usage

```
/create-agent <agent-name>
```

## Arguments

- `agent-name` - Name for the new agent (kebab-case)

## Interactive Prompts

After providing the agent name, you will be prompted for:
1. **Purpose** - What the agent does
2. **Agent Type** - Subagent type to use (default: general-purpose)
3. **Model** - Model preference (default: sonnet)
4. **Tools** - Required tools (default: Read, Grep, Glob, Bash)
5. **Default Prompt** - The agent's instruction prompt

## Example

```
/create-agent performance-analyzer
```

## Agent Definition Template

Generated agent files follow this structure:

```markdown
# <Agent Name>

## Purpose
<Description of what the agent does>

## Agent Configuration
- **Subagent Type**: <type>
- **Model**: <model>
- **Tools**: <tools>

## Default Prompt
<Agent instructions>
```

## Notes

- Agent names should use kebab-case
- Agent files are stored in the `agents/` directory
- Created agents can be used with `/agent-swarm <agent-name>`
