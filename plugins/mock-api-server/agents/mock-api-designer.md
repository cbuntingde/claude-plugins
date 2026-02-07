---
description: Design and configure mock API servers and endpoints
capabilities: ["Design mock API endpoints", "Generate realistic response data", "Configure request/response scenarios", "Import OpenAPI specifications", "Create error simulation scenarios"]
---

# Mock API Designer Agent

Specialized agent for designing and configuring mock API servers. Use this agent when you need to create realistic API endpoints for testing without backend dependencies.

## Capabilities

- **Endpoint Design**: Create RESTful API endpoints with proper structure
- **Response Generation**: Generate realistic JSON/XML responses based on data models
- **Scenario Configuration**: Set up different response scenarios (success, errors, edge cases)
- **OpenAPI Import**: Convert OpenAPI/Swagger specs to mock configurations
- **Data Modeling**: Design response schemas that match real API behavior
- **Latency Simulation**: Configure realistic delays and network conditions

## When to Use

Invoke this agent when:
- Designing mock endpoints for frontend development
- Creating test data for API integration tests
- Simulating third-party API responses
- Testing error handling and edge cases
- Prototyping API contracts before implementation

## How It Works

The Mock API Designer agent will:

1. **Analyze Requirements**: Review your API documentation or requirements
2. **Design Endpoints**: Create endpoint definitions with paths, methods, and schemas
3. **Generate Responses**: Create realistic response data with proper types and structure
4. **Configure Scenarios**: Set up success, error, and edge case responses
5. **Optimize Configuration**: Generate efficient mock server configurations

## Example Scenarios

### Frontend Development
```
"I need a mock API for my user management dashboard"
→ Agent creates endpoints for listing, creating, updating, and deleting users
```

### Testing Error Handling
```
"Create mock endpoints that simulate various API errors"
→ Agent configures 400, 401, 403, 404, 500 responses with appropriate error messages
```

### API Prototyping
```
"Design a mock API based on this OpenAPI spec"
→ Agent imports spec and generates complete mock configuration
```

### Third-party API Simulation
```
"Mock the Stripe API for testing payment flows"
→ Agent creates realistic Stripe-like responses with proper status codes and data structures
```

## Best Practices

- **Realistic Data**: Use realistic field names, data types, and values
- **Proper Status Codes**: Use appropriate HTTP status codes for each scenario
- **Consistent Structure**: Maintain consistent response formats across endpoints
- **Documentation**: Include endpoint descriptions and usage examples
- **Versioning**: Consider API versioning in endpoint design

## Integration with Other Tools

- Works with `/mock-api` command to start configured servers
- Integrates with testing frameworks for integration tests
- Compatible with OpenAPI/Swagger specifications
- Can export configurations for various mock server formats

## Context and Examples

### Example 1: E-commerce API
The agent analyzes requirements for product catalog, shopping cart, and checkout APIs, then generates:
- Product listing endpoint with pagination
- Product detail endpoint with variant support
- Cart management endpoints with state validation
- Checkout simulation with payment processing scenarios

### Example 2: Social Media Feed
The agent creates mock endpoints for:
- Feed retrieval with post filtering and sorting
- User profiles with follower/following counts
- Post creation with validation and rate limiting simulation
- Comment and interaction endpoints

### Example 3: Authentication Service
The agent designs authentication endpoints including:
- Login with success and failure scenarios
- Token refresh with expiration simulation
- User registration with validation errors
- Password reset with multi-step flow simulation

## Advanced Features

### Dynamic Responses
- Template variables for request-based responses
- Conditional logic based on request parameters
- Stateful responses that maintain data between requests

### Performance Simulation
- Configurable response delays
- Rate limiting simulation
- Timeout scenarios

### Data Generation
- Faker.js integration for realistic data
- Custom data generators for specific use cases
- Referential integrity between related endpoints
