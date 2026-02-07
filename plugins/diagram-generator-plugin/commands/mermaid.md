# Mermaid Diagram Command

Generates Mermaid markdown-compatible diagrams from codebase analysis.

## Usage

```
/diagram mermaid [--type=<type>] [--output=<file>] [--project-root=<path>] [--theme=<theme>]
```

## Options

- `--type` - Diagram type: `flowchart` (default), `class`, `sequence`, `state`, or `er`
- `--output` - Output file path (writes to stdout if not specified)
- `--project-root` - Root directory of the project to analyze (default: current directory)
- `--theme` - Color theme: `default`, `dark`, or `forest`

## Examples

Generate a flowchart:

```
/diagram mermaid --type=flowchart
```

Generate a class diagram:

```
/diagram mermaid --type=class
```

Generate a sequence diagram:

```
/diagram mermaid --type=sequence
```

Generate with dark theme:

```
/diagram mermaid --type=flowchart --theme=dark
```

Save to file:

```
/diagram mermaid --output=diagram.md
```

## Supported Diagram Types

- **flowchart** - Component flowchart with type-based styling
- **class** - UML class diagram (for TypeScript/JavaScript classes)
- **sequence** - Sequence diagram showing request flow
- **state** - State diagram showing component states
- **er** - Entity-relationship diagram (for models)

## Rendering

Mermaid diagrams render in:
- GitHub/GitLab markdown files
- Notion
- Obsidian
- Mermaid Live Editor (https://mermaid.live/)
- VS Code with Mermaid extension

## Example Output

\`\`\`mermaid
flowchart TB
    Controller["Controller"] --> Service["Service"]
    Service --> Repository["Repository"]
    class Controller fill:#e1f5fe
    class Service fill:#f3e5f5
    class Repository fill:#efebe9
\`\`\`