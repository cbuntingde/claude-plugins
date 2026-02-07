# Diagram Generator Plugin

Generates architectural diagrams from code using Mermaid, PlantUML, or DOT formats. Analyzes project structure and automatically identifies components, dependencies, and relationships.

## Installation

```bash
# Available via Claude marketplace
```

## Usage

### Architecture Diagram

```
/diagram architecture [--format=<format>] [--output=<file>]
```

Generates a system architecture diagram showing:
- Component relationships
- Data flow patterns
- Service boundaries
- Security zones

### Mermaid Diagram

```
/diagram mermaid --type=<type> [--theme=<theme>] [--output=<file>]
```

Generates Mermaid diagrams in various formats:
- `flowchart` - Component flowchart
- `class` - UML class diagram
- `sequence` - Sequence diagram
- `state` - State diagram
- `er` - ER diagram

### PlantUML Diagram

```
/diagram plantuml --type=<type> [--output=<file>]
```

Generates PlantUML diagrams in various formats:
- `class` - UML class diagram
- `component` - Component diagram
- `deployment` - Deployment diagram
- `activity` - Activity diagram
- `sequence` - Sequence diagram

### DOT Diagram

```
/diagram dot --type=<type> [--output=<file>]
```

Generates Graphviz DOT diagrams:
- `graph` - Simple undirected graph
- `digraph` - Directed graph
- `cluster` - Clustered by package
- `hierarchy` - Layered hierarchy

## Supported Formats

- `mermaid` - Markdown-compatible diagrams
- `plantuml` - PlantUML text format
- `dot` - Graphviz DOT format
- `puml` - PlantUML alias

## Examples

### Architecture Diagram

```
/diagram architecture --format=mermaid --output=architecture.md
```

### Component Diagram

```
/diagram mermaid --type=flowchart --theme=dark --output=flowchart.md
```

### DOT Graph

```
/diagram dot --type=hierarchy --output=hierarchy.dot
```

## Configuration

### Environment Variables

- `DIAGRAM_DEFAULT_FORMAT` - Default diagram format (default: mermaid)
- `DIAGRAM_OUTPUT_DIR` - Output directory for generated diagrams (default: ./docs/diagrams)

### Format-Specific Options

#### Mermaid

| Option | Description | Default |
|--------|-------------|---------|
| `--type` | Diagram type | flowchart |
| `--theme` | Color theme | default |

#### PlantUML

| Option | Description | Default |
|--------|-------------|---------|
| `--type` | Diagram type | component |

#### DOT

| Option | Description | Default |
|--------|-------------|---------|
| `--type` | Diagram type | graph |

## Output

Diagrams are generated in the following formats:

- **Mermaid**: Markdown code blocks with `mermaid` syntax
- **PlantUML**: `@startuml` / `@enduml` blocks
- **DOT**: Graphviz DOT syntax

## Requirements

- Node.js 18 or higher
- Source files in: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.go`

## Supported Component Types

| Type | Description | Default Color |
|------|-------------|---------------|
| controller | HTTP request handlers | #e1f5fe |
| service | Business logic | #f3e5f5 |
| model | Data models | #e8f5e9 |
| view | UI templates | #fff3e0 |
| utility | Helper functions | #fafafa |
| middleware | Request middleware | #fce4ec |
| router | Route definitions | #e0f7fa |
| repository | Data access | #efebe9 |
| config | Configuration | #fffde7 |
| api | API clients | #ede7f6 |

## Troubleshooting

### No components detected

Ensure source files are in supported languages and not in `node_modules` or `.git` directories.

### Empty output

Check that the project root contains valid source files with recognized patterns.

### Rendering issues

For DOT files, ensure Graphviz is installed:
```bash
# macOS
brew install graphviz

# Ubuntu
sudo apt-get install graphviz

# Windows
choco install graphviz
```

For PlantUML, use the PlantUML server or local installation.

---

## Author

[cbuntingde](https://github.com/cbuntingde)

## License

MIT