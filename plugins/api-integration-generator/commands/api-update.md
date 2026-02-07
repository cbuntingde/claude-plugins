---
description: Update existing API clients when the underlying API specification changes
arguments:
  - name: path
    description: Path to the existing generated client directory
    required: true
  - name: source
    description: Updated API spec URL (uses original if not provided)
    required: false
  - name: strategy
    description: Update strategy (merge, recreate, diff) - default: merge
    required: false
examples:
  - command: /api-update ./api-clients/petstore
    description: Update client using original spec URL
  - command: /api-update ./src/api --source https://api.example.com/v2/openapi.json
    description: Update client with new spec version
  - command: /api-update ./api-clients/petstore --strategy diff
    description: Show what changed before applying updates
---

# API Client Updater

Keep your generated API clients synchronized with the latest API specifications.

## Features

- **Smart Merging**: Preserve custom code while updating generated code
- **Change Detection**: See exactly what changed between versions
- **Version Tracking**: Automatically tracks API version history
- **Safe Updates**: Backup existing code before applying changes
- **Migration Guides**: Get help for breaking changes

## Usage

Update a client using its original spec:

```bash
/api-update ./api-clients/petstore
```

Update with a new spec version:

```bash
/api-update ./api-clients/petstore --source https://api.example.com/v2/openapi.json
```

## Update Strategies

### Merge (Default)
Intelligently updates generated code while preserving your customizations.

- Updates types, endpoints, and client core
- Preserves custom methods and extensions
- Merges configuration changes
- Safe for iterative development

### Recreate
Completely regenerates the client from scratch.

- Fresh generation from spec
- Removes all customizations
- Use for major version changes
- Creates backup first

### Diff
Shows changes without applying them.

```
📊 API Changes Detected:

Added endpoints:
  + POST /admin/users

Modified endpoints:
  ~ GET /users/{id}
    - Added query param: includePreferences

Removed endpoints:
  - DELETE /legacy/endpoint

Breaking changes:
  ⚠️  User.email changed from string to object
  ⚠️  POST /posts now requires 'category' field
```

## What Gets Updated

### 1. Type Definitions
- New types added to the API
- Modified type fields
- Removed deprecated types
- Updated validation rules

### 2. Endpoint Signatures
- New endpoints
- Modified parameters
- Changed response types
- Updated authentication requirements

### 3. Core Client
- Base URL changes
- Authentication schemes
- Retry logic
- Middleware configuration

## Version Tracking

The updater maintains a version history:

```
api-clients/petstore/
├── .api-version-history.json
└── .api-backups/
    ├── v1.0.0-backup/
    ├── v1.1.0-backup/
    └── v2.0.0-backup/
```

### Version History File

```json
{
  "currentVersion": "2.0.0",
  "lastUpdated": "2024-01-17T10:00:00Z",
  "updates": [
    {
      "version": "2.0.0",
      "specUrl": "https://api.example.com/openapi.json",
      "updated": "2024-01-17T10:00:00Z",
      "changes": {
        "added": 12,
        "modified": 5,
        "removed": 2
      }
    }
  ]
}
```

## Handling Breaking Changes

### Automatic Migration

For common breaking changes, the updater attempts automatic migration:

```typescript
// Before: User.email was string
interface User {
  email: string;
}

// After: User.email is object
interface User {
  email: { address: string; verified: boolean };
}

// Updater adds migration helper:
function migrateUserEmail(user: any): User {
  if (typeof user.email === 'string') {
    return { ...user, email: { address: user.email, verified: false } };
  }
  return user;
}
```

### Manual Migration Guide

For complex breaking changes, get a migration guide:

```bash
/api-update ./api-clients/petstore --strategy diff --migration-guide
```

Outputs:

```markdown
# Migration Guide: v1.0.0 → v2.0.0

## Breaking Changes

### 1. User.email Type Change
**Impact:** High
**Action Required:** Update all code accessing user.email

```typescript
// Old code
const email = user.email;

// New code
const email = user.email.address;
```

### 2. Authentication Required
**Impact:** Medium
**Action Required:** Add API key to client initialization

```typescript
// Old code
const client = new ApiClient({ baseUrl: '...' });

// New code
const client = new ApiClient({
  baseUrl: '...',
  auth: { apiKey: process.env.API_KEY }
});
```
```

## Safe Updates Workflow

1. **Check for changes**:
   ```bash
   /api-update ./api-clients/petstore --strategy diff
   ```

2. **Review breaking changes**:
   ```bash
   /api-update ./api-clients/petstore --migration-guide
   ```

3. **Create backup** (automatic):
   - Backup created at `.api-backups/{version}/`

4. **Apply update**:
   ```bash
   /api-update ./api-clients/petstore
   ```

5. **Run tests**:
   ```bash
   npm test  # or pytest, go test
   ```

6. **Rollback if needed**:
   ```bash
   /api-update ./api-clients/petstore --rollback-to v1.0.0
   ```

## Automation

### Automatic Updates
Enable automatic checks when API specs change:

```json
// .claude-plugin/config.json
{
  "autoUpdate": {
    "enabled": true,
    "checkInterval": "daily",
    "notifyOnChanges": true
  }
}
```

### CI/CD Integration
Add to your CI pipeline:

```yaml
# .github/workflows/api-update.yml
name: Check API Updates
on:
  schedule:
    - cron: '0 0 * * *'  # Daily
jobs:
  check-updates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for API updates
        run: claude /api-update ./api-clients/petstore --strategy diff
```

## Best Practices

1. **Test Before Deploying**: Always run tests after updates
2. **Review Breaking Changes**: Don't auto-apply breaking changes
3. **Keep Backups**: Maintain version history for easy rollback
4. **Update Documentation**: Update your API docs when clients change
5. **Monitor APIs**: Use webhooks for real-time API change notifications

## Related Commands

- `/api-gen` - Generate new API clients
