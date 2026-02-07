---
name: api-integration
description: Automatically detect API integration needs and generate client code
triggers:
  - "integrate with.*API"
  - "add.*API client"
  - "connect to.*API"
  - "API.*integration"
  - "REST.*client"
  - "OpenAPI.*spec"
  - "Swagger.*client"
capabilities:
  - Parse OpenAPI/Swagger specifications
  - Generate typed API clients in multiple languages
  - Handle authentication schemes
  - Generate error handling code
  - Create test cases for API endpoints
---

# API Integration Skill

Automatically detects when you need to integrate with an external API and generates production-ready client code.

## When I Activate

I automatically activate when you're working on API integration tasks such as:

- Mentioning integration with a specific API service
- Asking to create API client code
- Discussing OpenAPI/Swagger specifications
- Implementing REST API calls
- Setting up external service connections

## What I Do

### 1. Analyze Your Needs
I identify:
- Which API you want to integrate with
- What language/framework you're using
- Authentication requirements
- Data models and types needed

### 2. Fetch API Documentation
I automatically:
- Search for official API docs
- Look for OpenAPI/Swagger specs
- Parse authentication schemes
- Extract endpoint definitions

### 3. Generate Client Code
I create:
- Fully-typed client classes
- Request/response types
- Error handling utilities
- Authentication helpers
- Test stubs and examples

### 4. Integrate with Your Codebase
I:
- Place generated code in appropriate directories
- Match your project's code style
- Add necessary dependencies
- Update imports and exports

## Examples

### Example 1: Stripe Integration

**You say:**
```
I need to integrate Stripe payments into our Node.js app
```

**I automatically:**
1. Fetch Stripe's OpenAPI spec
2. Generate TypeScript client with full type safety
3. Add authentication helpers for Stripe API keys
4. Create example payment flow code
5. Add test stubs for payment endpoints

```typescript
// Generated code
import { StripeClient } from './api-clients/stripe';

const stripe = new StripeClient({
  apiKey: process.env.STRIPE_API_KEY,
  apiVersion: '2023-10-16'
});

// Fully typed
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
  payment_method: 'pm_card_visa'
});
```

### Example 2: Custom API Integration

**You say:**
```
We need to connect to our company's user service API
```

**I ask:**
- Do you have the OpenAPI spec URL?
- What's the base URL for the API?
- Which endpoints do you need?

**Then I generate:**
- Complete TypeScript client
- All required types and interfaces
- Error handling for your API's error format
- Authentication (API keys, OAuth, etc.)

### Example 3: Python FastAPI Integration

**You say:**
```
I'm building a Python microservice that needs to call the external product API
```

**I generate:**
```python
# Generated Python client
from api_clients.product_api import ProductClient

client = ProductClient(
    base_url="https://api.products.com",
    api_key=os.getenv("PRODUCT_API_KEY")
)

# Fully typed with Pydantic models
products: Page[Product] = client.products.list(
    params={"category": "electronics", "limit": 10}
)
```

## Capabilities

### Supported Languages
- **TypeScript**: For Node.js, Deno, Browser
- **Python**: AsyncIO with Pydantic models
- **Go**: With proper structs and error handling

### Authentication Schemes
- API Keys (header, query)
- Bearer tokens (JWT)
- OAuth2 (authorization code, client credentials)
- Basic Auth
- Custom schemes

### API Specifications
- OpenAPI 3.x
- Swagger 2.0
- JSON Schema
- GraphQL schemas
- HTML documentation (auto-parsing)

### Features I Generate

#### Full Type Safety
```typescript
// Request types
interface CreateUserRequest {
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
}

// Response types
interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Error types
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) { super(message); }
}
```

#### Automatic Retries
```typescript
const client = new ApiClient({
  baseUrl: 'https://api.example.com',
  retry: {
    maxRetries: 3,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    backoffMultiplier: 2
  }
});
```

#### Request Validation
```typescript
// Validates against OpenAPI schema before sending
try {
  await client.users.create({ email: 'invalid' }); // Missing required 'name'
} catch (error) {
  // ValidationError thrown before API call
}
```

#### Response Validation
```typescript
// Validates response matches schema
const user = await client.users.get({ id: '123' });
// user.data is validated and typed
```

## Best Practices I Follow

1. **Type Safety First**: Always generate fully-typed code
2. **Error Handling**: Comprehensive error types and handling
3. **Documentation**: Include JSDoc/DocComments
4. **Testing**: Generate test stubs and examples
5. **Standards**: Follow language-specific conventions
6. **Security**: Never hardcode credentials, use env vars
7. **Performance**: Include connection pooling, caching hints

## Integration Patterns

### Singleton Pattern
```typescript
// lib/api-client.ts
export const apiClient = new ApiClient({
  baseUrl: process.env.API_URL!,
  auth: { apiKey: process.env.API_KEY! }
});
```

### Factory Pattern
```typescript
// lib/api-factory.ts
export function createApiClient(token: string) {
  return new ApiClient({
    baseUrl: process.env.API_URL!,
    auth: { bearer: token }
  });
}
```

### Dependency Injection
```typescript
// services/user.service.ts
export class UserService {
  constructor(private apiClient: ApiClient) {}

  async getUser(id: string) {
    return this.apiClient.users.get({ params: { id } });
  }
}
```

## See Also

- `/api-gen` - Manual API client generation
- `/api-update` - Update existing clients when APIs change
