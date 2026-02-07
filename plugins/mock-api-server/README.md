# Mock API Server Plugin for Claude Code

Create, configure, and manage mock API servers for testing and development without backend dependencies.

## Features

- **Quick Setup**: Launch mock API servers in seconds
- **Flexible Configuration**: JSON-based configuration for endpoints
- **Realistic Responses**: Generate realistic data with proper types and structure
- **Error Simulation**: Test error handling with custom status codes
- **Multiple Servers**: Run multiple mock servers simultaneously
- **OpenAPI Import**: Generate mocks from API specifications
- **Request Logging**: View all requests made to your mock servers

## Usage

### Command

```bash
# Start a simple mock server on port 3001
/mock-api start 3001 ./mock-config.json

# Start with auto-generated endpoints
/mock-api start 3002

# Check server status
/mock-api status

# Stop server
/mock-api stop server-3001

# Generate from OpenAPI spec
/mock-api generate ./openapi.yaml
```

### MCP Tools

The plugin provides MCP tools for programmatic control:

- `start_mock_server` - Start a mock server with endpoints
- `stop_mock_server` - Stop a running server by port
- `get_server_status` - List all running servers
- `load_mock_config` - Load configuration from JSON file
- `save_mock_config` - Save configuration to JSON file

### Skill

Use the skill by describing what you need:

```
"Create a mock API for user management with CRUD operations"
"Design mock endpoints for an e-commerce product catalog"
"Generate a mock payment API with error scenarios"
```

## Installation

```bash
# Install to user scope (default)
claude plugin install mock-api-server

# Or install to project scope
claude plugin install mock-api-server --scope project
```

## Quick Start

### 1. Using the Command

```bash
# Start a simple mock server
/mock-api start 3001

# Start with configuration file
/mock-api start 3001 ./my-api-config.json

# Check server status
/mock-api status

# Stop server
/mock-api stop server-3001
```

### 2. Using the Skill

Just ask Claude to create mock APIs:

```bash
"Create a mock REST API for a user management system"
"Design mock endpoints for an e-commerce product catalog"
"Generate a mock payment API with error scenarios"
```

### 3. Using the Agent

The Mock API Designer agent can help with complex scenarios:

```bash
"Design a comprehensive mock API for testing our checkout flow"
"Create mock endpoints that simulate third-party payment provider responses"
```

## Configuration Format

Create a JSON configuration file for your mock server:

```json
{
  "endpoints": [
    {
      "path": "/api/users",
      "method": "GET",
      "response": {
        "users": [
          { "id": 1, "name": "Alice", "email": "alice@example.com" },
          { "id": 2, "name": "Bob", "email": "bob@example.com" }
        ],
        "total": 2
      },
      "status": 200,
      "delay": 100
    },
    {
      "path": "/api/users/:id",
      "method": "GET",
      "response": {
        "id": "{{params.id}}",
        "name": "User {{params.id}}",
        "email": "user{{params.id}}@example.com"
      },
      "status": 200
    },
    {
      "path": "/api/users",
      "method": "POST",
      "response": {
        "id": 3,
        "name": "{{body.name}}",
        "email": "{{body.email}}",
        "created": true
      },
      "status": 201
    },
    {
      "path": "/api/users/:id",
      "method": "DELETE",
      "response": {
        "deleted": true
      },
      "status": 200
    }
  ]
}
```

## Examples

### Example 1: Todo App API

```json
{
  "endpoints": [
    {
      "path": "/api/todos",
      "method": "GET",
      "response": {
        "todos": [
          { "id": 1, "title": "Learn Mock APIs", "completed": false },
          { "id": 2, "title": "Build awesome app", "completed": true }
        ]
      }
    },
    {
      "path": "/api/todos",
      "method": "POST",
      "response": {
        "id": 3,
        "title": "{{body.title}}",
        "completed": false
      },
      "status": 201
    },
    {
      "path": "/api/todos/:id",
      "method": "PUT",
      "response": {
        "id": "{{params.id}}",
        "title": "{{body.title}}",
        "completed": "{{body.completed}}"
      }
    },
    {
      "path": "/api/todos/:id",
      "method": "DELETE",
      "response": { "deleted": true },
      "status": 200
    }
  ]
}
```

### Example 2: E-commerce Product Catalog

```json
{
  "endpoints": [
    {
      "path": "/api/products",
      "method": "GET",
      "response": {
        "products": [
          {
            "id": 1,
            "name": "Premium Widget",
            "price": 29.99,
            "category": "widgets",
            "stock": 150
          },
          {
            "id": 2,
            "name": "Super Gadget",
            "price": 49.99,
            "category": "gadgets",
            "stock": 75
          }
        ],
        "total": 2,
        "page": 1
      },
      "delay": 150
    },
    {
      "path": "/api/products/:id",
      "method": "GET",
      "response": {
        "id": "{{params.id}}",
        "name": "Product {{params.id}}",
        "price": 29.99,
        "description": "A great product",
        "images": [
          "https://example.com/products/{{params.id}}/1.jpg"
        ]
      }
    }
  ]
}
```

### Example 3: Authentication API with Errors

```json
{
  "endpoints": [
    {
      "path": "/api/auth/login",
      "method": "POST",
      "response": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
          "id": 1,
          "email": "{{body.email}}",
          "name": "John Doe"
        }
      },
      "status": 201
    },
    {
      "path": "/api/auth/login",
      "method": "POST",
      "response": {
        "error": "Invalid credentials",
        "code": "INVALID_CREDENTIALS"
      },
      "status": 401,
      "condition": {
        "field": "body.password",
        "operator": "!==",
        "value": "correct-password"
      }
    },
    {
      "path": "/api/auth/me",
      "method": "GET",
      "response": {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user"
      },
      "status": 200
    },
    {
      "path": "/api/auth/logout",
      "method": "POST",
      "response": {
        "logged_out": true
      },
      "status": 200
    }
  ]
}
```

### Example 4: Error Simulation

```json
{
  "endpoints": [
    {
      "path": "/api/users",
      "method": "GET",
      "response": {
        "error": "Server error",
        "code": "INTERNAL_ERROR"
      },
      "status": 500,
      "delay": 2000
    },
    {
      "path": "/api/users/:id",
      "method": "GET",
      "response": {
        "error": "Not found",
        "code": "NOT_FOUND"
      },
      "status": 404
    },
    {
      "path": "/api/users",
      "method": "POST",
      "response": {
        "error": "Validation failed",
        "code": "VALIDATION_ERROR",
        "details": {
          "email": ["Invalid email format"],
          "name": ["Name is required"]
        }
      },
      "status": 400
    }
  ]
}
```

## Configuration Options

### Endpoint Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `path` | string | Yes | URL path (supports `:param` for dynamic segments) |
| `method` | string | No | HTTP method (default: `GET`) |
| `response` | object | Yes | Response data to return |
| `status` | number | No | HTTP status code (default: `200`) |
| `delay` | number | No | Response delay in milliseconds (default: `0`) |

### Template Variables

Use template variables in your responses:

- `{{params.fieldName}}` - URL path parameters
- `{{query.paramName}}` - Query string parameters
- `body.fieldName` - Request body fields (for POST/PUT)

## Plugin Components

### 1. Command: `/mock-api`

Quick management of mock servers:

```bash
/mock-api start <port> [config-file]
/mock-api stop <server-id>
/mock-api status
/mock-api generate <api-spec>
```

### 2. Agent: Mock API Designer

Expert at designing mock API configurations. Ask it to:

- Design complete API structures
- Generate realistic test data
- Create error scenarios
- Import OpenAPI specifications

### 3. Skill: mock-api

Automatically invoked when you need mock APIs. Just describe what you need:

> "Create a mock API for user management with CRUD operations"

### 4. MCP Server

Provides tools for:
- `start_mock_server` - Start a mock server
- `stop_mock_server` - Stop a running server
- `get_server_status` - Get status of all servers
- `load_mock_config` - Load configuration from file
- `save_mock_config` - Save configuration to file

## Best Practices

1. **Use Realistic Delays**: Add 100-500ms delays to simulate network latency
2. **Proper Status Codes**: Use appropriate HTTP status codes
3. **Consistent Structure**: Maintain consistent response formats
4. **Version Control**: Store configuration files in your repository
5. **Document Behavior**: Include descriptions for complex endpoints
6. **Test Edge Cases**: Create error scenarios for robust testing

## Use Cases

### Frontend Development
Mock backend APIs while developing features:
```bash
"Create mock endpoints for dashboard statistics"
```

### Integration Testing
Generate consistent test data:
```bash
"Design mock responses for order processing API"
```

### Third-party API Simulation
Simulate external services:
```bash
"Mock the Stripe API for payment testing"
```

### Contract Testing
Verify API contracts before implementation:
```bash
"Create a mock server based on our API specification"
```

### Performance Testing
Generate predictable responses:
```bash
"Set up mock endpoints with configurable delays"
```

## Advanced Features

### Dynamic Responses
```json
{
  "path": "/api/search",
  "response": {
    "query": "{{query.q}}",
    "results": [
      { "id": 1, "title": "Result for {{query.q}}" }
    ]
  }
}
```

### Conditional Responses
```json
{
  "path": "/api/auth/login",
  "response": {
    "token": "valid-token"
  },
  "condition": {
    "field": "body.password",
    "operator": "===",
    "value": "correct-password"
  }
}
```

### Error Simulation
```json
{
  "path": "/api/unstable",
  "response": {
    "error": "Random failure"
  },
  "status": 500,
  "failureRate": 0.3
}
```

## Troubleshooting

### Server Won't Start
- Check if port is already in use
- Verify Node.js is installed (`node --version`)
- Check configuration file syntax

### Endpoints Not Found
- Verify path patterns match your requests
- Check HTTP method (GET vs POST)
- Look for typos in endpoint paths

### Response Issues
- Validate JSON response format
- Check status codes are numbers
- Verify template variables are correct

## Project Structure

```
mock-api-server/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/
│   └── mock-api.md          # Slash command
├── agents/
│   └── mock-api-designer.md # Subagent
├── skills/
│   └── mock-api/
│       └── SKILL.md         # Agent skill
├── scripts/
│   └── mock-api-server.js   # MCP server implementation
└── README.md                # This file
```

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review example configurations

## Changelog

### 1.0.0 (2025-01-17)
- Initial release
- Basic mock server functionality
- Command, agent, and skill integration
- MCP server for advanced control
