# list-agents

Lists all available agent definitions in the orchestrator.

## Usage

```
/list-agents
```

## Output

Displays a table of available agents with:
- Agent name
- Purpose/description
- Agent type
- Available tools

## Example Output

```
Available Agents:

┌─────────────────────┬────────────────────────────┬──────────────────┐
│ Agent               │ Purpose                    │ Type             │
├─────────────────────┼────────────────────────────┼──────────────────┤
│ observer            │ Code review & bug detection │ general-purpose  │
│ security            │ OWASP vulnerability scan   │ general-purpose  │
│ code-standards      │ Code quality validation     │ general-purpose  │
│ ai-slop             │ Incomplete code detection   │ general-purpose  │
│ coder               │ Fix implementation          │ general-purpose  │
│ performance         │ Performance analysis        │ general-purpose  │
└─────────────────────┴────────────────────────────┴──────────────────┘

Run an agent: /agent-swarm <agent-name>
```

## Notes

- Built-in agents are always available
- Custom agents are listed after being created
- Use `/create-agent` to add new agents
