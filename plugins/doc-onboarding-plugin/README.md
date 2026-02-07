# Documentation Onboarding Plugin

Generates comprehensive onboarding documentation and developer guides from codebase analysis. Automatically extracts project structure, technology stack, coding standards, and API information.

## Installation

```bash
# Available via Claude marketplace
```

## Usage

### Generate Full Onboarding

```
/onboarding generate [--roles=<roles>] [--output=<path>]
```

Generates comprehensive onboarding documentation with:
- Project overview and architecture
- Development setup guide
- Role-specific guides (developer, devops, qa)
- Common tasks and troubleshooting

### Generate Quick Start

```
/onboarding quickstart [--output=<path>]
```

Creates a condensed 5-minute getting started guide for new team members.

### Generate Developer Guide

```
/onboarding developer-guide [--output=<path>]
```

Creates detailed developer documentation with coding standards and best practices.

## Examples

Generate onboarding for developers:

```
/onboarding generate --roles=developer
```

Generate onboarding for all roles:

```
/onboarding generate --roles=developer,devops,qa
```

Generate quick start:

```
/onboarding quickstart
```

Generate developer guide:

```
/onboarding developer-guide
```

## Generated Output

| Command | Output File | Description |
|---------|-------------|-------------|
| `generate` | `./docs/onboarding/ONBOARDING.md` | Comprehensive onboarding |
| `quickstart` | `./docs/onboarding/QUICK_START.md` | Quick start guide |
| `developer-guide` | `./docs/onboarding/DEVELOPER_GUIDE.md` | Developer reference |

## Configuration

### Environment Variables

- `ONBOARDING_OUTPUT_DIR` - Output directory (default: ./docs/onboarding)
- `ONBOARDING_ROLES` - Default roles (default: developer)
- `ONBOARDING_INCLUDE_API` - Include API docs (default: true)
- `ONBOARDING_INCLUDE_SETUP` - Include setup instructions (default: true)

### Role Options

| Role | Content Included |
|------|------------------|
| `developer` | Coding standards, adding features, git workflow |
| `devops` | Deployment environments, CI/CD, Docker |
| `qa` | Testing framework, test types, coverage requirements |

## What It Analyzes

The plugin automatically extracts from your codebase:

- **Language and Framework** - Detects JavaScript, TypeScript, Python, Go
- **Project Structure** - Identifies controllers, services, models, routes
- **Dependencies** - Extracts package.json dependencies and scripts
- **API Endpoints** - Parses routes and HTTP methods
- **Test Setup** - Identifies Jest, Vitest, Cypress, etc.
- **Configuration Files** - ESLint, Prettier, TypeScript configs

## Requirements

- Node.js 18 or higher
- Source files in: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.go`
- Git repository (for some features)

## Troubleshooting

### Empty documentation

Ensure source files are in the project root or subdirectories. Check that files are not in `node_modules` or `.git`.

### Missing API endpoints

The analyzer looks for common patterns like Express routes, Fastify routes, and decorators. Check that your routes use standard patterns.

### Wrong project name

The project name is extracted from `package.json`. Ensure it exists in the project root.

---

## Author

[cbuntingde](https://github.com/cbuntingde)

## License

MIT