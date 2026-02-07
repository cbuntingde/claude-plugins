# Installation Guide

## Quick Installation

### Step 1: Navigate to Your Project

```bash
cd /path/to/your/project
```

### Step 2: Install the Plugin

```bash
# Option A: Install directly
claude plugin install /path/to/security-scanner-plugin

# Option B: Copy to project plugins directory
mkdir -p .claude/plugins
cp -r /path/to/security-scanner-plugin .claude/plugins/
```

### Step 3: Verify Installation

```bash
# List installed plugins
claude plugin list

# Should show: security-scanner
```

### Step 4: Make Scripts Executable (Linux/Mac)

```bash
chmod +x .claude/plugins/security-scanner-plugin/scripts/*.sh
```

## Verification

Test the plugin is working:

```bash
# Run a quick security scan
/security-scan

# You should see a security scan report
```

## Configuration (Optional)

Create optional configuration files in your project root:

```bash
# Security policies
touch .security-policies.json

# Dependency rules
touch .dependency-rules.json

# Security review rules
touch .security-review-rules.json
```

## Usage Examples

### Basic Security Scan

```bash
# Scan entire project
/security-scan

# Scan specific directory
/security-scan --path ./src

# Only critical/high issues
/security-scan --severity critical,high
```

### Vulnerability Checks

```bash
# Check for SQL injection
/vulnerability-check sql-injection

# Check for hardcoded secrets
/vulnerability-check secrets

# Check for XSS
/vulnerability-check xss
```

### Dependency Audit

```bash
# Audit all dependencies
/dependency-audit

# Audit and auto-fix
/dependency-audit --fix

# Only production dependencies
/dependency-audit --production
```

## Uninstallation

```bash
# Uninstall the plugin
claude plugin uninstall security-scanner

# Or remove manually
rm -rf .claude/plugins/security-scanner-plugin
```

## Troubleshooting

### Plugin Not Appearing

1. Check plugin list: `claude plugin list`
2. Enable if disabled: `claude plugin enable security-scanner`
3. Check for errors: `claude --debug`

### Scripts Not Running

1. Make scripts executable: `chmod +x scripts/*.sh`
2. Check shebang lines (#!/bin/bash, #!/usr/bin/env python3)
3. Verify script permissions

### Hooks Not Triggering

1. Verify hooks.json syntax is correct
2. Check event names are correct (case-sensitive)
3. Review matcher patterns

## Next Steps

- Read the [README.md](README.md) for detailed usage
- Check [CHANGELOG.md](CHANGELOG.md) for version history
- Configure custom security policies for your project
- Integrate with your CI/CD pipeline

## Support

For issues or questions:
- GitHub Issues: [security-scanner-plugin/issues](https://github.com/example/security-scanner-plugin/issues)
- Documentation: [Full Docs](https://github.com/example/security-scanner-plugin/wiki)
