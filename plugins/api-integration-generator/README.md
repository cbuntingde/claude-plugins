# API Integration Generator Plugin

Generate fully-typed, error-handled API client code from OpenAPI/Swagger specifications or documentation.

## Features

- 🚀 **Multi-Language Support**: TypeScript, Python, Go
- 🔒 **Full Type Safety**: Complete types, interfaces, and models
- 🛡️ **Error Handling**: Comprehensive error types and handling patterns
- 🔑 **Authentication**: Built-in support for API keys, OAuth2, Bearer tokens
- 🔄 **Auto-Updates**: Keep clients synchronized with API changes
- 📊 **Change Detection**: See exactly what changed between API versions
- 🧪 **Test Generation**: Generated test stubs and examples

## Installation

```bash
claude plugin install api-integration-generator
```

## Quick Start

### Generate a Client

```bash
# Generate TypeScript client
/api-gen https://api.example.com/openapi.json --language typescript

# Generate Python client with custom output
/api-gen https://api.example.com/openapi.json --language python --output ./src/api

# Generate from documentation URL
/api-gen https://docs.api.com --language go --name MyApiClient
```

### Update a Client

```bash
# Update using original spec
/api-update ./api-clients/petstore

# Check what changed
/api-update ./api-clients/petstore --strategy diff

# Update with new spec version
/api-update ./src/api --source https://api.example.com/v2/openapi.json
```

## Usage

### Automatic Generation

The plugin automatically detects API integration needs:

```
I need to integrate Stripe payments
```

The plugin will:
1. Fetch Stripe's OpenAPI spec
2. Generate a fully-typed client
3. Add authentication helpers
4. Create usage examples

### Manual Commands

#### `/api-gen`

Generate API client from specification:

```bash
/api-gen <spec-url> [options]
```

Options:
- `--language`: Target language (typescript, python, go)
- `--output`: Output directory
- `--name`: Client name

#### `/api-update`

Update existing client:

```bash
/api-update <client-path> [options]
```

Options:
- `--source`: New spec URL
- `--strategy`: merge, recreate, or diff
- `--migration-guide`: Generate migration guide

## What Gets Generated

### TypeScript Client

```
api-clients/example-api/
├── src/
│   ├── client.ts          # Main client class
│   ├── types.ts           # TypeScript interfaces
│   ├── errors.ts          # Custom error classes
│   └── endpoints/         # Endpoint modules
├── index.ts
└── examples/
    └── usage.ts
```

### Python Client

```
api-clients/example-api/
├── example_api/
│   ├── client.py          # Main client
│   ├── models.py          # Pydantic models
│   ├── errors.py          # Exceptions
│   └── endpoints/
├── examples/
│   └── usage.py
└── pyproject.toml
```

## Generated Features

### Type Safety

```typescript
// Fully typed requests and responses
const response = await client.users.getUser({
  params: { id: '123' },
  query: { include: 'posts' }
});
```

### Error Handling

```typescript
try {
  await client.users.create(data);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof AuthenticationError) {
    // Handle auth errors
  }
}
```

### Authentication

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

## Update Strategies

### Merge (Default)
Intelligently updates generated code while preserving customizations.

### Recreate
Completely regenerates from scratch (creates backup first).

### Diff
Shows changes without applying them:

```
📊 API Changes Detected:

Added endpoints:
  + POST /admin/users

Modified endpoints:
  ~ GET /users/{id}
    - Added query param: includePreferences

Breaking changes:
  ⚠️  User.email changed from string to object
```

## Automation

### Auto-Update Check

The plugin automatically checks for API changes on session start. To disable:

```json
// settings.json
{
  "plugins": {
    "api-integration-generator": {
      "autoUpdate": false
    }
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/api-update.yml
name: Check API Updates
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  check-updates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: claude /api-update ./api-clients/petstore --strategy diff
```

## Scripts

### `generate-client.py`

Direct Python script for client generation:

```bash
python scripts/generate-client.py \
  https://api.example.com/openapi.json \
  --language typescript \
  --output ./src/api
```

### `update-client.py`

Update existing clients:

```bash
python scripts/update-client.py \
  ./api-clients/petstore \
  --strategy diff
```

## MCP Server

The plugin includes an MCP server for API documentation operations:

- `fetch_openapi_spec`: Fetch OpenAPI specs from URLs
- `parse_openapi_spec`: Parse and extract endpoints, types, auth
- `generate_client_code`: Generate client code
- `detect_api_changes`: Compare API versions
- `search_api_docs`: Find API documentation URLs

## Best Practices

1. **Version Control**: Commit generated code to track API changes
2. **Regular Updates**: Re-generate when APIs change
3. **Custom Extensions**: Extend generated clients with custom methods
4. **Test Before Deploy**: Always run tests after updates
5. **Review Breaking Changes**: Don't auto-apply breaking changes
6. **Keep Backups**: Maintain version history for rollback

## Architecture

```
Plugin Components:
├── Commands: /api-gen, /api-update
├── Skills: Auto-detect API integration needs
├── Agents: API integration expert
├── MCP Server: API docs fetching & parsing
├── Scripts: Python/Node.js generation logic
└── Hooks: Auto-update checks
```

## Contributing

Contributions welcome! Areas for enhancement:

- Additional language support (Rust, Java, C#)
- GraphQL schema support
- WebSocket client generation
- Advanced retry strategies
- Mock server generation
- Performance optimization

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_KEY` | API key for authenticated requests | Conditional |
| `BEARER_TOKEN` | Bearer token for authentication | Conditional |

### Plugin Settings

```json
{
  "plugins": {
    "api-integration-generator": {
      "autoUpdate": true,
      "defaultLanguage": "typescript",
      "outputDir": "./api-clients"
    }
  }
}
```

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `autoUpdate` | boolean | `true` | Check for API changes on session start |
| `defaultLanguage` | string | `"typescript"` | Default programming language for generation |
| `outputDir` | string | `"./api-clients"` | Default output directory for generated clients |

### Command Options

#### `/api-gen` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--language` | Target language (typescript, python, go) | `typescript` |
| `--output` | Output directory | `./api-clients/{api-name}` |
| `--name` | Client name | Derived from spec title |

#### `/api-update` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--source` | New spec URL or path | Uses original spec |
| `--strategy` | merge, recreate, or diff | `merge` |
| `--migration-guide` | Generate migration guide | `false` |

## License

MIT

---

**Plugin Author**: cbuntingde
**Version**: 1.0.0
**Homepage**: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/api-integration-generator
