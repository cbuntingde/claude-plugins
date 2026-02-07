# OpenAPI/Swagger Generator Plugin

A Claude Code plugin that automatically generates OpenAPI 3.0 and Swagger 2.0 specifications from your codebase.

## Features

- **Multi-Language Support**: Analyze code in JavaScript, TypeScript, Python, Java, Go, C#, Ruby, and PHP
- **Framework Detection**: Automatically detect web frameworks and routing patterns
- **Comprehensive Specs**: Generate complete API documentation including paths, schemas, parameters, responses, and security schemes
- **Interactive Mode**: Guided workflow for easy configuration
- **Auto-Detection**: Automatically identify frameworks and API endpoints
- **Format Support**: Export to JSON or YAML

## Supported Frameworks

### Node.js/TypeScript
- Express.js
- NestJS
- Fastify
- Koa
- Hapi

### Python
- FastAPI
- Flask
- Django REST Framework
- Tornado

### Java
- Spring Boot
- JAX-RS (Jersey)

### Go
- Gin
- Echo
- Fiber

### C#
- ASP.NET Core Web API

### Ruby
- Rails API
- Grape

### PHP
- Laravel
- Symfony

## Installation

### From a Local Directory

```bash
# Navigate to your project directory
cd my-project

# Install the plugin
claude plugin install /path/to/openapi-generator
```

### From GitHub (when published)

```bash
claude plugin install openapi-generator@github-marketplace
```

## Usage

### Slash Command

Generate OpenAPI specs with the `/generate-openapi` command:

```bash
# Interactive mode
/generate-openapi

# Specify framework and output
/generate-openapi --framework express --output api-spec.json

# Auto-detect framework
/generate-openapi --auto-detect --format yaml --output openapi.yaml

# Generate for specific directory
/generate-openapi --path ./src/api --framework fastapi --output spec.json
```

### Agent Skill

Claude will automatically use this skill when:
- You ask to generate API documentation from code
- You're working with web frameworks and mention OpenAPI/Swagger
- You need to document existing API endpoints

Examples:
- "Generate an OpenAPI spec for my Express app"
- "Create API documentation from this FastAPI project"
- "What endpoints are defined in this Spring Boot application?"

### Command Options

- `--framework <name>`: Specify framework (express, fastapi, spring-boot, flask, django, nestjs, etc.)
- `--path <directory>`: Directory to analyze (default: current directory)
- `--output <file>`: Output file path (default: openapi.json)
- `--format <format>`: Output format: json or yaml (default: json)
- `--version <version>`: OpenAPI version: 3.0 or 2.0 (default: 3.0)
- `--auto-detect`: Automatically detect framework and endpoints
- `--include-tags`: Include operation tags for grouping
- `--include-examples`: Include request/response examples

## What Gets Generated

The plugin generates comprehensive OpenAPI specifications including:

### API Metadata
- Title, version, and description
- Contact and license information
- Servers and base URLs

### Paths & Operations
- All HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
- Path parameters, query parameters, headers
- Request bodies with content types
- Response schemas for all status codes
- Operation IDs and descriptions

### Components
- Reusable schemas for data models
- Security schemes (JWT, OAuth, API keys)
- Request/response examples
- Links and callbacks

### Documentation
- JSDoc, docstring, and annotation extraction
- Parameter descriptions
- Response descriptions
- Usage examples

## Examples

### Express.js Example

Input code:
```javascript
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  res.json(user);
});
```

Generated OpenAPI:
```yaml
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

### FastAPI Example

Input code:
```python
@app.post("/users", response_model=User)
async def create_user(user: UserCreate):
    return user_service.create(user)
```

Generated OpenAPI:
```yaml
paths:
  /users:
    post:
      summary: Create user
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

### Spring Boot Example

Input code:
```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable String id) {
    return userService.findById(id);
}
```

Generated OpenAPI:
```yaml
paths:
  /users/{id}:
    get:
      summary: Get user
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

## Analysis Scripts

The plugin includes specialized analyzers for each framework:

- `express-analyzer.js`: Parses Express.js routing and middleware
- `fastapi-analyzer.py`: Analyzes FastAPI decorators and Pydantic models
- `flask-analyzer.py`: Extracts Flask routes and blueprint patterns
- `spring-analyzer.py`: Parses Spring annotations and controller mappings

These scripts can be used standalone:

```bash
# Analyze Express.js project
node skills/openapi-generator/scripts/express-analyzer.js ./src

# Analyze FastAPI project
python skills/openapi-generator/scripts/fastapi-analyzer.py ./src

# Analyze Spring Boot project
python skills/openapi-generator/scripts/spring-analyzer.py ./src
```

## How It Works

### 1. Framework Detection

The plugin analyzes:
- Dependency files (package.json, requirements.txt, pom.xml, go.mod)
- Import statements and module patterns
- Framework-specific directory structures
- Routing decorators and annotations

### 2. Endpoint Discovery

Scans for:
- Route definitions and controllers
- Decorator annotations (@app.get, @GetMapping, @route)
- Router configurations and middleware
- File-based routing patterns

### 3. Schema Inference

Generates schemas from:
- TypeScript interfaces and types
- Python type hints and Pydantic models
- Java classes and POJOs
- Go structs and interfaces
- C# models and DTOs

### 4. Documentation Extraction

Parses:
- JSDoc comments and annotations
- Python docstrings
- JavaDoc comments
- Inline code comments
- Summary and description attributes

### 5. Security Analysis

Detects:
- Authentication middleware (JWT, OAuth, sessions)
- Decorators and annotations (@auth, @secured)
- Guard classes and interceptors
- API key and token implementations

## Configuration

### Environment Variables

No environment variables are required for basic usage. The plugin operates entirely through command-line options.

### Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--framework <name>` | Specify the framework to analyze | Auto-detect |
| `--path <directory>` | Directory to scan for source files | Current directory |
| `--output <file>` | Output file path for generated spec | `openapi.json` |
| `--format <format>` | Output format: `json` or `yaml` | `json` |
| `--version <version>` | OpenAPI version: `3.0` or `2.0` | `3.0` |
| `--auto-detect` | Automatically detect framework and endpoints | `false` |
| `--include-tags` | Include operation tags for grouping | `false` |
| `--include-examples` | Include request/response examples | `false` |

### Framework Detection

The plugin auto-detects frameworks from project dependency files:

| Framework | Detection File |
|-----------|---------------|
| Express.js, Fastify, NestJS | `package.json` |
| FastAPI, Flask, Django | `requirements.txt` |
| Spring Boot | `pom.xml` |
| Gin, Echo, Fiber | `go.mod` |
| ASP.NET Core | `*.csproj` |

### Output Configuration

Generated specifications include:
- OpenAPI version 3.0 or 2.0 format
- JSON or YAML output format
- File path for saving the spec

## Customization

### Adding Custom Analyzers

Create a new analyzer script in `skills/openapi-generator/scripts/`:

```javascript
#!/usr/bin/env node
class CustomAnalyzer {
  analyze(directory) {
    // Your analysis logic
    return {
      endpoints: [],
      schemas: {},
      securitySchemes: {}
    };
  }

  generateOpenAPI(info) {
    // Generate OpenAPI spec
  }
}

module.exports = CustomAnalyzer;
```

### Extending the Skill

Modify `skills/openapi-generator/SKILL.md` to add capabilities or change behavior.

### Adding Commands

Create new markdown files in the `commands/` directory following the command format.

## Plugin Structure

```
openapi-generator/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/
│   └── generate-openapi.md  # Slash command definition
├── skills/
│   └── openapi-generator/
│       ├── SKILL.md         # Agent skill definition
│       └── scripts/         # Framework analyzers
│           ├── express-analyzer.js
│           ├── fastapi-analyzer.py
│           ├── flask-analyzer.py
│           └── spring-analyzer.py
├── README.md                # This file
└── LICENSE                  # MIT License
```

## Limitations

- **Static Analysis Only**: Cannot execute code or observe runtime behavior
- **Dynamic Routes**: Routes generated dynamically may not be fully captured
- **Complex Middleware**: Middleware effects on request/response may not be visible
- **Framework-Specific Features**: Some specialized features may require manual annotation
- **Type Inference**: Complex type systems may be simplified in generated schemas

## Best Practices

1. **Type Definitions**: Use strong typing for accurate schema generation
2. **Documentation**: Include JSDoc, docstrings, and annotations
3. **Validation**: Document validation rules and constraints
4. **Security**: Explicitly declare authentication requirements
5. **Examples**: Add example values in your code for better documentation
6. **Review**: Always review generated specs for accuracy

## Troubleshooting

### Endpoints Not Detected

- Ensure dependency files (package.json, requirements.txt) are present
- Check that routes use standard framework patterns
- Verify file paths are correct with `--path` option
- Use `--auto-detect` for framework discovery

### Missing Schemas

- Add type annotations to function parameters and return values
- Use TypeScript interfaces or Pydantic models
- Include JSDoc or docstrings for type hints
- Define DTO classes for complex types

### Incorrect Parameter Types

- Provide explicit type annotations
- Use validation decorators (@Query, @Param, @Body)
- Add type hints to function signatures
- Include parameter descriptions in comments

## Contributing

Contributions are welcome! Areas for improvement:

- Additional framework analyzers
- Enhanced type inference
- Better security scheme detection
- Improved documentation extraction
- Support for more OpenAPI features

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or contributions, please visit the plugin marketplace repository.

## Acknowledgments

Built with Claude Code Plugin System. Supports analysis for major web frameworks and languages.
