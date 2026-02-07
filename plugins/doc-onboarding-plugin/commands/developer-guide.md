# Developer Guide Command

Creates detailed developer documentation with coding standards and practices.

## Usage

```
/onboarding developer-guide [--output=<file>] [--project-root=<path>]
```

## Options

- `--output` - Output file path (default: ./docs/onboarding/DEVELOPER_GUIDE.md)
- `--project-root` - Root directory to analyze (default: current directory)

## Examples

Generate developer guide:

```
/onboarding developer-guide
```

Generate with custom output:

```
/onboarding developer-guide --output=./DEV_GUIDE.md
```

## Output

The generated guide includes comprehensive documentation:

- **Overview** - Technology stack and key features
- **Development Environment** - Required tools, setup, and recommended extensions
- **Project Structure** - Directory guidelines and conventions
- **Coding Standards** - Style guides, error handling, and git conventions
- **Architecture** - Design patterns and component responsibilities
- **API Development** - RESTful conventions and endpoint creation
- **Testing** - Framework setup, running tests, and coverage requirements
- **Debugging** - VS Code debugging and common issues
- **Deployment** - Environments, Docker, and CI/CD pipeline
- **Troubleshooting** - Installation and runtime issue solutions

## Use Case

Comprehensive reference for developers working on the project, covering best practices and conventions.