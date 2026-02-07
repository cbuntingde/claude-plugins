# Quick Start Command

Creates a condensed getting started guide for new team members.

## Usage

```
/onboarding quickstart [--output=<file>] [--project-root=<path>]
```

## Options

- `--output` - Output file path (default: ./docs/onboarding/QUICK_START.md)
- `--project-root` - Root directory to analyze (default: current directory)

## Examples

Generate quick start guide:

```
/onboarding quickstart
```

Generate with custom output:

```
/onboarding quickstart --output=./QUICKSTART.md
```

## Output

The generated guide is a 5-minute quick start covering:

1. Getting the code
2. Installing dependencies
3. Setting up environment
4. Starting development server
5. Verifying setup
6. Key commands reference
7. Project structure overview
8. Common tasks
9. Getting help

## Use Case

Perfect for new team members to get up and running quickly with essential information only.