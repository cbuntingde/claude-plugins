---
description: Mock API server for testing and development
examples:
  - "Create a mock REST API for user management"
  - "Generate mock endpoints from this OpenAPI spec"
  - "Set up a mock server that simulates payment API responses"
  - "Design error scenarios for API testing"
  - "Create realistic test data for product catalog API"
invocationPhrases:
  - "mock API"
  - "mock server"
  - "fake API"
  - "stub server"
  - "test API"
---

# Mock API Server

Generate and configure mock API servers for testing and development. This skill helps you create realistic API endpoints without backend dependencies.

## When to Use

Use this skill when:
- Creating mock API endpoints for frontend development
- Generating test data for API integration testing
- Simulating third-party API responses
- Testing error handling and edge cases
- Prototyping API contracts before implementation
- Isolating tests from external dependencies

## What This Skill Does

1. **Analyzes Requirements**: Understands your API structure and data models
2. **Designs Endpoints**: Creates RESTful endpoint definitions
3. **Generates Responses**: Produces realistic response data and schemas
4. **Configures Scenarios**: Sets up success, error, and edge case responses
5. **Creates Configuration**: Generates mock server configuration files

## How to Invoke

Simply ask Claude to:
- "Create a mock API for [your use case]"
- "Design mock endpoints based on [specification]"
- "Generate mock server configuration for [API description]"
- "Set up error scenarios for testing [feature]"

## Example Workflows

### 1. Quick Mock Generation
```
You: "Create a mock API for a todo app with CRUD operations"
Claude: [Generates complete mock configuration with endpoints for listing, creating, updating, and deleting todos]
```

### 2. From OpenAPI Spec
```
You: "Generate mock endpoints from this OpenAPI spec: [spec file]"
Claude: [Analyzes spec and creates mock configuration with all defined endpoints]
```

### 3. Error Simulation
```
You: "Create error scenarios for a payment API mock"
Claude: [Generates endpoints with various error responses - 400, 401, 403, 404, 500]
```

### 4. Realistic Data
```
You: "Make a mock user API with realistic data"
Claude: [Creates user endpoints with realistic names, emails, and profile data]
```

## Output Format

The skill generates configuration in multiple formats:
- JSON configuration for mock servers
- Complete endpoint documentation
- Example requests and responses
- Usage instructions and best practices

## Integration

This skill integrates with:
- `/mock-api` command to start and manage servers
- Mock API Designer agent for complex scenarios
- Testing frameworks for integration tests
- OpenAPI/Swagger specifications

## Best Practices

1. **Define Clear Contracts**: Specify request/response schemas upfront
2. **Use Realistic Data**: Generate data that matches production characteristics
3. **Simulate Latency**: Add appropriate delays to mimic network conditions
4. **Test Edge Cases**: Include error scenarios and edge cases in your mocks
5. **Version Your Mocks**: Keep mock configurations in version control
6. **Document Behavior**: Clearly document what each mock endpoint does

## Common Use Cases

### Frontend Development
Mock backend APIs while developing frontend features
```
"Create mock endpoints for dashboard statistics"
```

### Integration Testing
Generate consistent test data for API integration tests
```
"Design mock responses for order processing API"
```

### Third-party API Simulation
Simulate external services without API keys or rate limits
```
"Mock the Stripe API for payment testing"
```

### Contract Testing
Verify API contracts before backend implementation
```
"Create a mock server based on our API specification"
```

### Performance Testing
Generate predictable responses for load testing
```
"Set up mock endpoints with configurable delays"
```

## Advanced Features

### Dynamic Responses
- Template variables for request-based responses
- Conditional logic based on request parameters
- Stateful responses that maintain data between requests

### Data Generation
- Realistic data generation with proper types
- Custom data generators for specific use cases
- Referential integrity between related endpoints

### Scenario Testing
- Success and error scenarios
- Edge cases and boundary conditions
- Rate limiting and throttling simulation

## Tips for Best Results

1. **Provide Context**: Share API documentation or requirements when available
2. **Specify Behavior**: Clearly describe what endpoints should do
3. **Define Data Structure**: Specify response schema and data types
4. **Include Error Cases**: Mention error scenarios you need to test
5. **Set Realistic Expectations**: Configure appropriate delays and response times

## Limitations

- Mock servers run locally and are not accessible externally
- Complex business logic should be mocked at the appropriate level
- State persistence is limited to the server runtime
- Authentication simulation requires explicit configuration
