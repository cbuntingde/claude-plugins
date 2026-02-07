# Architecture Diagram Command

Generates system architecture diagrams showing component relationships, data flow patterns, service boundaries, and security zones.

## Usage

```
/diagram architecture [--format=<format>] [--output=<file>] [--project-root=<path>]
```

## Options

- `--format` - Output format: `mermaid` (default), `plantuml`, or `dot`
- `--output` - Output file path (writes to stdout if not specified)
- `--project-root` - Root directory of the project to analyze (default: current directory)

## Examples

Generate a Mermaid architecture diagram:

```
/diagram architecture
```

Generate a PlantUML architecture diagram and save to file:

```
/diagram architecture --format=plantuml --output=architecture.puml
```

Generate a DOT architecture diagram:

```
/diagram architecture --format=dot
```

## Output

The command analyzes the codebase and generates a diagram showing:

- All components identified (controllers, services, models, views, utilities, middleware, repositories, config)
- Dependencies between components
- Component types and relationships
- Layer structure (Presentation, Application, Domain, Infrastructure)

## Requirements

- Node.js 18+
- Project must have source files (.js, .ts, .jsx, .tsx, .py, .go)