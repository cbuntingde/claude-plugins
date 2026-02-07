# PlantUML Diagram Command

Generates PlantUML text format diagrams from codebase analysis.

## Usage

```
/diagram plantuml [--type=<type>] [--output=<file>] [--project-root=<path>]
```

## Options

- `--type` - Diagram type: `class`, `component` (default), `deployment`, `activity`, or `sequence`
- `--output` - Output file path (writes to stdout if not specified)
- `--project-root` - Root directory of the project to analyze (default: current directory)

## Examples

Generate a component diagram:

```
/diagram plantuml --type=component
```

Generate a class diagram:

```
/diagram plantuml --type=class
```

Generate a deployment diagram:

```
/diagram plantuml --type=deployment
```

Generate a sequence diagram:

```
/diagram plantuml --type=sequence
```

Save to file:

```
/diagram plantuml --output=diagram.puml
```

## Supported Diagram Types

- **class** - UML class diagram showing component structure
- **component** - Component diagram showing system architecture
- **deployment** - Deployment diagram showing infrastructure
- **activity** - Activity diagram showing workflow
- **sequence** - Sequence diagram showing interaction flow

## Rendering

To render PlantUML diagrams, use:

1. **PlantUML Server** - Upload .puml file to https://plantuml.com/server
2. **Command Line** - Install PlantUML and run:
   ```bash
   java -jar plantuml.jar diagram.puml
   ```
3. **VS Code** - Install PlantUML extension
4. **Online** - Use https://www.plantuml.com/plantuml/

## Example Output

\`\`\`plantuml
@startuml
actor "User" as User
[API Gateway] --> [Controllers]
[Controllers] --> [Services]
[Services] --> [Repositories]
[Repositories] --> [Database]
User --> [API Gateway]
@enduml
\`\`\`