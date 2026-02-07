# Quick Start Guide - API Integration Generator

## Installation

1. **Navigate to the plugin directory**:
   ```bash
   cd api-integration-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install the plugin in Claude Code**:
   ```bash
   claude plugin install . --scope user
   ```

## Testing the Plugin

### 1. Test with Example OpenAPI Spec

The plugin includes a sample Petstore API specification. Test it:

```bash
# Generate TypeScript client
/api-gen ./examples/petstore-openapi.json --language typescript --output ./test-output

# Generate Python client
/api-gen ./examples/petstore-openapi.json --language python --output ./test-output-python

# Check what would change (diff mode)
/api-update ./test-output --strategy diff
```

### 2. Test with Real API

```bash
# Generate client from a real API
/api-gen https://petstore.swagger.io/v2/swagger.yaml --language typescript
```

### 3. Test Auto-Detection

In Claude Code, simply mention API integration:

```
I need to integrate with the GitHub API
```

The plugin will automatically:
- Search for GitHub's OpenAPI spec
- Generate a fully-typed client
- Add authentication helpers
- Create usage examples

### 4. Test Update Detection

```bash
# Update an existing client
/api-update ./api-clients/petstore

# See what changed first
/api-update ./api-clients/petstore --strategy diff
```

## Plugin Components

### Commands

```bash
/api-gen <spec-url> [options]
```
Generate API client from OpenAPI specification.

Options:
- `--language`: typescript, python, go
- `--output`: Output directory path
- `--name`: Custom client name

```bash
/api-update <client-path> [options]
```
Update existing client when API changes.

Options:
- `--source`: New spec URL
- `--strategy`: merge, recreate, diff
- `--migration-guide`: Generate migration guide

### Skills

The plugin automatically activates when:
- You mention integrating with an API
- You discuss OpenAPI/Swagger specs
- You need REST API clients
- You work with external services

### Agents

Use the API Integration Expert agent for:
- Complex multi-service architecture
- Security and authentication strategies
- Performance optimization
- Migration planning

```bash
/agent api-integration-expert "Design an architecture for integrating 5 APIs"
```

### MCP Server

The plugin provides these MCP tools:
- `fetch_openapi_spec`: Fetch specs from URLs
- `parse_openapi_spec`: Extract endpoints and types
- `generate_client_code`: Generate client code
- `detect_api_changes`: Compare API versions
- `search_api_docs`: Find API documentation

### Scripts

Run scripts directly:

```bash
# Generate client with Python script
python scripts/generate-client.py \
  https://api.example.com/openapi.json \
  --language typescript \
  --output ./src/api

# Update client
python scripts/update-client.py \
  ./api-clients/petstore \
  --strategy diff
```

## Example Generated Code

### TypeScript

```typescript
import { PetstoreClient } from './api-clients/petstore';

const client = new PetstoreClient({
  baseUrl: 'https://api.petstore.com/v1',
  apiKey: process.env.PETSTORE_API_KEY
});

// Fully typed
const pets = await client.listPets({ limit: 10 });
const pet = await client.getPetById({ petId: '123' });
await client.createPet({ body: { name: 'Fluffy', tag: 'cat' } });
```

### Python

```python
from api_clients.petstore import PetstoreClient

client = PetstoreClient(
    base_url="https://api.petstore.com/v1",
    api_key=os.getenv("PETSTORE_API_KEY")
)

# Fully typed with Pydantic
pets: Pets = client.listPets(limit=10)
pet: Pet = client.get_pet_by_id(pet_id="123")
client.create_pet(body=NewPet(name="Fluffy", tag="cat"))
```

## Features

- ✅ Full type safety (TypeScript, Python type hints, Go structs)
- ✅ Comprehensive error handling
- ✅ Multiple authentication schemes
- ✅ Request/response validation
- ✅ Automatic retries with backoff
- ✅ Change detection between API versions
- ✅ Migration guides for breaking changes
- ✅ Automatic backups before updates
- ✅ CI/CD integration support

## Architecture

```
api-integration-generator/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── commands/                  # Slash commands
│   ├── api-gen.md
│   └── api-update.md
├── skills/                    # Auto-invoked skills
│   └── api-integration/
│       └── SKILL.md
├── agents/                    # Expert agents
│   └── api-integration-expert.md
├── servers/                   # MCP server
│   └── api-docs-server/
│       └── index.js
├── scripts/                   # Generation logic
│   ├── check-api-updates.js
│   ├── generate-client.py
│   └── update-client.py
├── examples/                  # Sample specs
│   └── petstore-openapi.json
├── package.json
├── README.md
└── CHANGELOG.md
```

## Troubleshooting

### Plugin Not Loading

```bash
# Check for errors
claude --debug

# Validate plugin manifest
claude plugin validate .
```

### MCP Server Not Starting

```bash
# Check server logs
node servers/api-docs-server/index.js

# Verify dependencies
npm list
```

### Python Script Errors

```bash
# Ensure Python 3.8+
python --version

# Install dependencies (if needed)
pip install pydantic
```

## Next Steps

1. ✅ Install the plugin
2. ✅ Test with the example Petstore spec
3. ✅ Try with a real API
4. ✅ Explore auto-detection features
5. ✅ Integrate into your workflow

## Support

- Documentation: See README.md
- Examples: Check examples/ directory
- Issues: Report via `/glm-plan-bug:case-feedback`

---

**Plugin**: API Integration Generator v1.0.0
**Author**: Claude Code Plugin Team
**License**: MIT
