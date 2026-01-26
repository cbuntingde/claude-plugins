# Generate Onboarding Command

Generates comprehensive onboarding documentation from codebase analysis.

## Usage

```
/onboarding generate [--roles=<roles>] [--output=<file>] [--project-root=<path>]
```

## Options

- `--roles` - Comma-separated list of roles to include (default: developer)
  - `developer` - Development setup and coding standards
  - `devops` - CI/CD and deployment processes
  - `qa` - Testing procedures
- `--output` - Output file path (default: ./docs/onboarding/ONBOARDING.md)
- `--project-root` - Root directory to analyze (default: current directory)

## Examples

Generate onboarding for all roles:

```
/onboarding generate --roles=developer,devops,qa
```

Generate onboarding for developers only:

```
/onboarding generate --roles=developer
```

Generate with custom output path:

```
/onboarding generate --output=./custom/ONBOARDING.md
```

## Output

The generated documentation includes:

- Project overview and architecture
- Quick start guide
- Development setup instructions
- Technology stack information
- API endpoint documentation
- Role-specific guides
- Common tasks and troubleshooting

## Requirements

- Node.js 18+
- Project with source files in common languages