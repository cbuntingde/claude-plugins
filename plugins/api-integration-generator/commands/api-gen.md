---
description: Generate fully-typed API client code from OpenAPI/Swagger specs or documentation
arguments:
  - name: source
    description: URL to OpenAPI/Swagger spec JSON/YAML, or documentation URL
    required: true
  - name: output
    description: Output directory for generated client (default: ./api-clients/{name})
    required: false
  - name: language
    description: Target language (typescript, python, go) - default: typescript
    required: false
  - name: name
    description: Client name (default: derived from API spec)
    required: false
examples:
  - command: /api-gen https://api.example.com/openapi.json --language typescript
    description: Generate TypeScript client from OpenAPI spec
  - command: /api-gen https://petstore.swagger.io/v2/swagger.yaml --output ./src/api/petstore
    description: Generate client with custom output directory
  - command: /api-gen https://docs.api.com --language python --name MyApiClient
    description: Generate Python client from documentation URL
---

# API Client Generator

Automatically generate production-ready, fully-typed API client code from OpenAPI/Swagger specifications or API documentation.

## Features

- **Multiple Languages**: TypeScript, Python, Go
- **Full Type Safety**: Complete TypeScript types, Python type hints, Go structs
- **Error Handling**: Comprehensive error types and handling patterns
- **Authentication**: Built-in support for API keys, OAuth2, Bearer tokens
- **Validation**: Request/response validation based on API schema
- **Documentation**: Generated JSDoc/DocComments for all methods
- **Testing**: Generated test stubs and examples

## Usage

Generate a client from an OpenAPI spec:

```bash
/api-gen https://api.example.com/openapi.json
```

Generate with specific options:

```bash
/api-gen https://api.example.com/openapi.json --language python --output ./src/api
```

## What Gets Generated

### TypeScript Client
```
api-clients/example-api/
├── src/
│   ├── client.ts          # Main client class
│   ├── types.ts           # All TypeScript interfaces/types
│   ├── errors.ts          # Custom error classes
│   └── endpoints/         # Individual endpoint modules
│       ├── users.ts
│       └── posts.ts
├── index.ts               # Exports
└── examples/
    └── usage.ts           # Usage examples
```

### Python Client
```
api-clients/example-api/
├── example_api/
│   ├── __init__.py
│   ├── client.py          # Main client class
│   ├── models.py          # Pydantic models
│   ├── errors.py          # Custom exceptions
│   └── endpoints/         # Endpoint modules
│       ├── users.py
│       └── posts.py
├── examples/
│   └── usage.py
└── pyproject.toml         # Dependencies
```

### Go Client
```
api-clients/example-api/
├── client.go              # Main client
├── models.go              # Struct definitions
├── errors.go              # Error types
├── endpoints/             # Endpoint packages
│   ├── users.go
│   └── posts.go
├── examples/
│   └── usage.go
└── go.mod                 # Module definition
```

## Generated Features

### 1. Type Safety
All request parameters, response bodies, and error types are fully typed.

```typescript
// TypeScript example
const response = await client.users.getUser({
  params: { id: '123' },
  query: { include: 'posts' }
});
// response.data is fully typed
```

### 2. Error Handling
Comprehensive error types for different failure scenarios.

```typescript
try {
  await client.users.createUser({ body: userData });
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof AuthenticationError) {
    // Handle auth errors
  }
}
```

### 3. Authentication Support
Built-in support for common authentication schemes.

```typescript
const client = new ApiClient({
  baseUrl: 'https://api.example.com',
  auth: {
    apiKey: process.env.API_KEY,
    // or
    bearer: process.env.BEARER_TOKEN,
    // or
    oauth2: { accessToken: '...' }
  }
});
```

### 4. Retry Logic
Automatic retries with exponential backoff for transient failures.

```typescript
const client = new ApiClient({
  baseUrl: 'https://api.example.com',
  retry: {
    maxRetries: 3,
    backoffMultiplier: 2
  }
});
```

## Advanced Options

### Selective Generation
Generate only specific endpoints:

```bash
/api-gen https://api.example.com/openapi.json --tags users,posts
```

### Custom Configuration
Use a config file for complex setups:

```json
{
  "source": "https://api.example.com/openapi.json",
  "language": "typescript",
  "output": "./src/api",
  "options": {
    "includeEndpoints": ["users.*", "posts.list"],
    "excludeEndpoints": ["admin.*"],
    "generateTests": true,
    "generateExamples": true
  }
}
```

## Best Practices

1. **Version Control**: Commit generated code to track API changes
2. **Regular Updates**: Re-generate when APIs change
3. **Custom Extensions**: Extend generated clients with custom methods
4. **Type Checking**: Always run type checkers after generation

## Related Commands

- `/api-update` - Update existing generated clients when APIs change
