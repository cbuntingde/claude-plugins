# DOT Diagram Command

Generates Graphviz DOT format diagrams from codebase analysis.

## Usage

```
/diagram dot [--type=<type>] [--output=<file>] [--project-root=<path>]
```

## Options

- `--type` - Diagram type: `graph` (undirected), `digraph` (directed), `cluster` (grouped by package), or `hierarchy` (layered)
- `--output` - Output file path (writes to stdout if not specified)
- `--project-root` - Root directory of the project to analyze (default: current directory)

## Examples

Generate a directed graph:

```
/diagram dot --type=digraph
```

Generate a cluster graph showing package structure:

```
/diagram dot --type=cluster
```

Generate a hierarchy diagram:

```
/diagram dot --type=hierarchy
```

Save to a file:

```
/diagram dot --output=architecture.dot
```

## Supported Diagram Types

- **graph** - Simple undirected graph showing component relationships
- **digraph** - Directed graph with arrows showing dependency direction
- **cluster** - Graph with components grouped by package/namespace
- **hierarchy** - Graph organized by application layers (Presentation, Application, Domain, Infrastructure)

## Rendering

To render DOT diagrams, use Graphviz:

```bash
dot -Tpng architecture.dot -o architecture.png
dot -Tsvg architecture.dot -o architecture.svg
```