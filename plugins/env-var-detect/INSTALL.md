# Installation Guide

## Prerequisites

- [Claude Code](https://code.claude.com/) installed
- [Node.js](https://nodejs.org/) v14 or higher (for the detection script)

## Installation Steps

### 1. Clone or Download the Plugin

```bash
# Clone the repository
git clone https://github.com/chris-dev/env-var-detect.git
cd env-var-detect
```

Or download and extract the ZIP file.

### 2. Install the Plugin

Choose your installation scope:

#### Project Scope (Recommended for Teams)
Install for the current project only. Shared via version control.

```bash
claude plugin install . --scope project
```

#### User Scope
Install for all your projects. Only available to you.

```bash
claude plugin install . --scope user
```

#### Local Scope
Install for the current project but gitignored.

```bash
claude plugin install . --scope local
```

### 3. Verify Installation

```bash
claude plugin list
```

You should see `env-var-detect` in the list.

### 4. Test the Plugin

```bash
/check-env
```

This will scan your current directory for environment variables.

## Upgrading

To upgrade to the latest version:

```bash
claude plugin update env-var-detect
```

## Uninstalling

To remove the plugin:

```bash
claude plugin uninstall env-var-detect --scope <scope>
```

Replace `<scope>` with the scope you installed it to (project, user, or local).

## Disabling (Without Uninstalling)

To temporarily disable the plugin:

```bash
claude plugin disable env-var-detect
```

To re-enable it:

```bash
claude plugin enable env-var-detect
```

## Troubleshooting

### Plugin Not Appearing

1. Verify the installation:
   ```bash
   claude plugin list
   ```

2. Check for errors:
   ```bash
   claude --debug
   ```

3. Validate the plugin:
   ```bash
   claude plugin validate .
   ```

### Script Not Running

1. Ensure Node.js is installed:
   ```bash
   node --version
   ```

2. Test the script directly:
   ```bash
   node scripts/detect-env-vars.js
   ```

3. Check file permissions (Linux/Mac):
   ```bash
   chmod +x scripts/detect-env-vars.js
   ```

### Hooks Not Triggering

1. Check the hooks configuration:
   ```bash
   cat hooks/hooks.json
   ```

2. Verify the `${CLAUDE_PLUGIN_ROOT}` variable is correct

3. Enable debug mode to see hook execution:
   ```bash
   claude --debug
   ```

## Next Steps

- Read the [README.md](README.md) for usage instructions
- Check out the [.env.example](.env.example) for a template
- Review the [CHANGELOG.md](CHANGELOG.md) for recent changes

## Support

If you encounter any issues:
- Check the [Troubleshooting](README.md#troubleshooting) section in the README
- Open an issue on GitHub
- Consult the [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
