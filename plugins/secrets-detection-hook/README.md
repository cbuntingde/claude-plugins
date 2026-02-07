# Secrets Detection Hook

A security-focused Claude Code plugin that detects and blocks commands/files containing API keys, passwords, or personally identifiable information (PII) before execution.

## Description

Prevents accidental exposure of sensitive information by:
- Scanning tool arguments before execution
- Detecting API keys, tokens, passwords, and credentials
- Identifying PII (SSNs, credit cards, email addresses)
- Blocking operations that contain sensitive data
- Providing detailed feedback about detected secrets

Supports detection for:
- **Cloud Providers**: AWS, Google Cloud, Azure
- **API Platforms**: GitHub, Stripe, Slack, Twilio, Auth0, Heroku
- **Credentials**: Database URLs, JWT tokens, Bearer tokens, Private keys
- **PII**: Social Security Numbers, Credit Card numbers, Email addresses

## Installation

### From Marketplace

```bash
claude plugin install secrets-detection-hook@chris-claude-plugins-dev
```

### Local Development

Add to `~/.claude/plugins/installed_plugins.json`:
```json
{
  "plugins": {
    "secrets-detection-hook@chris-claude-plugins-dev": [
      {
        "scope": "user",
        "installPath": "C:\\path\\to\\secrets-detection-hook",
        "version": "1.0.0",
        "installedAt": "2026-01-20T00:00:00.000Z"
      }
    ]
  }
}
```

Add to `~/.claude/settings.json`:
```json
{
  "enabledPlugins": {
    "secrets-detection-hook@chris-claude-plugins-dev": true
  }
}
```

Build the plugin:
```bash
cd secrets-detection-hook
npm install
npm run build
```

## Usage

The plugin automatically intercepts tool executions before they run. When secrets are detected:

### Example - Blocked Operation

Attempting to write a file with an API key:
```
Tool: Write
Arguments: {
  "file_path": "./config.js",
  "content": "const apiKey = 'sk_live_51M...'"
}

⚠️  Secrets detected!

Severity: CRITICAL
Found 1 potential secret(s):

❌  CRITICAL:
  • Stripe Live API Key
    Line 1: sk_l***********

❌  Operation blocked to prevent sensitive data exposure.
   Please remove or redact the sensitive information before proceeding.
```

### Scanned Tools

By default, the plugin scans:
- `Write` - File write operations
- `Edit` - File edit operations
- `Bash` - Command execution
- `WebSearch` - Search queries
- `WebFetch` - URL fetching

## Configuration

Configure via environment variables in `~/.claude/settings.json`:

### Enable Specific Tools

```json
{
  "env": {
    "SECRETS_DETECTION_ENABLED_TOOLS": "Write,Edit,Bash"
  }
}
```

### Block Severity Levels

Control which severity levels trigger blocks:

```json
{
  "env": {
    "SECRETS_DETECTION_BLOCKED_SEVERITY": "critical,high"
  }
}
```

Options: `critical`, `high`, `medium`

### Allow Custom Patterns

Exclude specific patterns from detection:

```json
{
  "env": {
    "SECRETS_DETECTION_ALLOW_PATTERNS": "test-key,example-token"
  }
}
```

### Full Configuration Example

```json
{
  "enabledPlugins": {
    "secrets-detection-hook@chris-claude-plugins-dev": true
  },
  "env": {
    "SECRETS_DETECTION_ENABLED_TOOLS": "Write,Edit,Bash",
    "SECRETS_DETECTION_BLOCKED_SEVERITY": "critical,high",
    "SECRETS_DETECTION_ALLOW_PATTERNS": "demo-key,test-api-key"
  }
}
```

## Detected Patterns

### Critical Severity
- AWS Access Keys and Secret Keys
- GitHub Personal Access Tokens
- Google Cloud API Keys
- Stripe API Keys (live)
- Database connection URLs with credentials
- RSA/EC/OpenSSH Private Keys
- API keys in URLs

### High Severity
- JWT Tokens
- Bearer Tokens
- Stripe Test Keys
- Slack Tokens
- Password assignments
- Generic API Key assignments

### Medium Severity
- Email addresses (common providers)
- Private IP addresses (10.x, 172.16-31.x, 192.168.x)

## Security Considerations

- **False Positives**: The plugin uses exclusion patterns for common placeholders (YOUR_API_KEY, test, demo)
- **Performance**: Scanning happens synchronously before tool execution
- **Scope**: Only scans tool arguments, not file contents on disk
- **Storage**: Detected secrets are redacted in output (only first/last chars shown)
- **Logging**: No secrets are logged; only detection metadata is stored

## License

MIT
