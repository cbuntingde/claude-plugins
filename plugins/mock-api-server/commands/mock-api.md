---
description: Start and manage mock API servers for testing
---

# /mock-api

Quickly start and manage mock API servers for testing. This command helps you create realistic API endpoints without backend dependencies.

## Usage

```
/mock-api start <port> <config-file>
/mock-api stop <server-id>
/mock-api status
/mock-api generate <api-spec>
```

## Options

- `start` - Start a new mock API server on the specified port
- `stop` - Stop a running mock API server
- `status` - Show status of all running mock servers
- `generate` - Generate mock API configuration from OpenAPI/Swagger spec

## Examples

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

## Features

- **Quick Start**: Launch mock servers in seconds
- **Dynamic Responses**: Configure realistic response data and delays
- **Multiple Servers**: Run multiple mock servers simultaneously
- **OpenAPI Import**: Generate mocks from API specifications
- **Request Logging**: View all requests made to your mock servers
- **Error Simulation**: Test error handling with custom status codes

## Configuration Format

```json
{
  "endpoints": [
    {
      "path": "/api/users",
      "method": "GET",
      "response": {
        "users": [
          {"id": 1, "name": "Alice"},
          {"id": 2, "name": "Bob"}
        ]
      },
      "delay": 100,
      "status": 200
    },
    {
      "path": "/api/users/:id",
      "method": "GET",
      "response": {
        "id": "{{params.id}}",
        "name": "User {{params.id}}"
      }
    }
  ]
}
```

## Tips

- Use relative delays (100-500ms) to simulate network latency
- Store configuration files in your project for version control
- Use template variables like `{{params.id}}` for dynamic paths
- Combine with `/test` commands for integration testing
