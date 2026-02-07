---
description: Analyze code and generate OpenAPI/Swagger specifications
capabilities:
  - Parse code to extract API endpoints
  - Detect web frameworks and routing patterns
  - Generate OpenAPI 3.0 and Swagger 2.0 specifications
  - Infer request/response schemas from type definitions
  - Document authentication and security schemes
  - Export specifications in JSON or YAML format
---

# OpenAPI/Swagger Generator

Autonomously analyze codebases and generate comprehensive OpenAPI/Swagger specifications from API implementations.

## When to Use This Skill

Invoke this skill when:
- User asks to generate API documentation from code
- Creating or updating REST API specifications
- Need to document existing API endpoints
- User mentions "OpenAPI", "Swagger", or "API spec"
- Working with web frameworks (Express, FastAPI, Spring Boot, etc.)
- Need to analyze API structure and contracts

## Capabilities

This skill specializes in:

- **Multi-language parsing**: Analyze code in JavaScript, TypeScript, Python, Java, Go, C#, Ruby, PHP
- **Framework detection**: Automatically recognize web frameworks and routing patterns
- **Endpoint extraction**: Identify all API endpoints with methods, paths, and parameters
- **Schema inference**: Generate JSON schemas from type definitions and interfaces
- **Documentation parsing**: Extract descriptions from JSDoc, docstrings, and annotations
- **Security analysis**: Detect authentication mechanisms and security schemes
- **Validation mapping**: Document validation rules and constraints
- **Format support**: Output both OpenAPI 3.0 and Swagger 2.0 formats

## Analysis Approach

### 1. Framework Detection

Identify the web framework by analyzing:
- Dependency files (package.json, requirements.txt, pom.xml, go.mod)
- Import statements and module patterns
- Routing decorators and annotations
- Framework-specific directory structures

### 2. Endpoint Discovery

Scan for API endpoints by parsing:
- Route definitions and controllers
- Decorator annotations (@app.get, @GetMapping, @route)
- Router configurations and middleware
- File-based routing patterns

### 3. Parameter Extraction

Extract parameters from:
- Route parameters and path variables
- Query string parameters
- Request body schemas
- Header and cookie parameters
- Form data and file uploads

### 4. Type Analysis

Generate schemas by analyzing:
- TypeScript interfaces and types
- Python type hints and dataclasses
- Java classes and POJOs
- Go structs and interfaces
- C# models and DTOs

### 5. Documentation Parsing

Extract documentation from:
- JSDoc comments and annotations
- Python docstrings
- JavaDoc comments
- Inline code comments
- Summary and description attributes

### 6. Security Detection

Identify security schemes from:
- Authentication middleware (JWT, OAuth, sessions)
- Decorators and annotations (@auth, @secured)
- Guard classes and interceptors
- API key and token implementations

## Supported Frameworks

### Node.js/TypeScript
- **Express.js**: `app.get()`, `router.post()`, route handlers
- **NestJS**: `@Controller()`, `@Get()`, decorators
- **Fastify**: `fastify.get()`, route schemas
- **Koa**: `router.get()`, middleware patterns
- **Hapi**: `server.route()`, config objects

### Python
- **FastAPI**: `@app.get()`, `@app.post()`, Pydantic models
- **Flask**: `@app.route()`, Flask-RESTful
- **Django REST**: ViewSets, APIView, @api_view
- **Tornado**: `web.RequestHandler`, route tuples

### Java
- **Spring Boot**: `@RestController`, `@RequestMapping`, `@GetMapping`
- **JAX-RS**: `@Path`, `@GET`, `@POST`
- **Spring MVC**: Controller mappings

### Go
- **Gin**: `router.GET()`, `router.POST()`
- **Echo**: `e.GET()`, `e.POST()`
- **Fiber**: `app.Get()`, `app.Post()`

### C#
- **ASP.NET Core**: `[HttpGet]`, `[Route]`, Controller actions

### Ruby
- **Rails API**: resources, routes, controllers
- **Grape**: `get()`, `post()`, params declarations

### PHP
- **Laravel**: `Route::get()`, Controller methods
- **Symfony**: `@Route`, annotations

## Output Structure

Generate comprehensive OpenAPI specs including:

```yaml
openapi: 3.0.0
info:
  title: API Title
  version: 1.0.0
  description: API description
servers:
  - url: http://api.example.com/v1
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
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

## Analysis Steps

When invoked, follow this workflow:

1. **Identify target**: Determine which code to analyze (specific files, directories, or entire project)

2. **Detect framework**: Scan dependencies and code patterns to identify the web framework

3. **Locate routes**: Find all route definitions and API endpoint declarations

4. **Parse endpoints**: For each endpoint, extract:
   - HTTP method and path
   - Parameters (path, query, header, body)
   - Request/response schemas
   - Authentication requirements
   - Validation rules
   - Descriptions and examples

5. **Generate schemas**: Create JSON Schema definitions for all models and data types

6. **Build spec**: Assemble the complete OpenAPI specification with all discovered information

7. **Validate output**: Ensure the generated spec is valid OpenAPI/Swagger

8. **Export format**: Output in requested format (JSON or YAML)

## Best Practices

- **Be thorough**: Scan all relevant files, don't miss endpoints
- **Infer intelligently**: Make reasonable assumptions when explicit documentation is missing
- **Preserve context**: Maintain the structure and organization of the original API
- **Document everything**: Include descriptions, examples, and usage notes
- **Validate types**: Ensure generated schemas match actual runtime behavior
- **Handle security**: Always document authentication and authorization requirements
- **Group logically**: Use tags to group related endpoints
- **Be explicit**: Clear is better than clever - make the spec easy to understand

## Limitations

- Cannot execute code - analysis is static only
- Dynamic routes may not be fully captured
- Runtime behavior and middleware effects may not be visible
- Some framework-specific features may require manual annotation
- Complex validation rules may be simplified

## Tips

- Start by examining package.json, requirements.txt, or similar dependency files
- Look for common framework patterns (decorators, annotations, routing functions)
- Check for existing OpenAPI definitions or Swagger decorators to enhance
- Use type information to generate accurate schemas
- Include examples from test files if available
- Document any assumptions or limitations in the spec description
