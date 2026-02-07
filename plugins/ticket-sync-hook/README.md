# Ticket Sync Hook

Automatically update Jira and Linear tickets based on git commit activity. This plugin hooks into post-commit events to add comments and update ticket statuses, keeping your project management tools in sync with your development workflow.

## Features

- **Automatic Ticket Detection**: Parses commit messages for Jira (e.g., `PROJ-123`) and Linear (e.g., `ENG-456`) ticket IDs
- **Comment Syncing**: Adds formatted comments to tickets with commit details
- **Status Updates**: Optionally updates ticket status based on commit type (fix, feat, etc.)
- **Dual Platform Support**: Works with both Jira and Linear simultaneously
- **Secure Configuration**: Uses environment variables for all credentials
- **Error Handling**: Comprehensive error handling with detailed logging
- **Commit Type Mapping**: Maps conventional commit types to appropriate ticket statuses

## Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Configure environment variables** (see Configuration section below)

3. **Set up automatic git hook** (optional):

For automatic ticket syncing after each commit, set up a git post-commit hook:

```bash
# Create post-commit hook
cat > .git/hooks/post-commit << 'EOF'
#!/bin/sh
export JIRA_ENABLED=true
export JIRA_BASE_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"

node path/to/ticket-sync-hook/scripts/sync-ticket.js
EOF

# Make executable
chmod +x .git/hooks/post-commit
```

Or use environment variables from a `.env` file:

```bash
# .env
JIRA_ENABLED=true
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token

# .git/hooks/post-commit
#!/bin/sh
eval $(cat .env | xargs)
node path/to/ticket-sync-hook/scripts/sync-ticket.js
```

## Configuration

### Required Environment Variables

Enable at least one platform:

**For Jira:**

- `JIRA_ENABLED=true` - Enable Jira integration
- `JIRA_BASE_URL` - Your Jira instance URL (e.g., `https://your-domain.atlassian.net`)
- `JIRA_EMAIL` - Your Jira account email
- `JIRA_API_TOKEN` - Your Jira API token (create at [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens))

**For Linear:**

- `LINEAR_ENABLED=true` - Enable Linear integration
- `LINEAR_API_KEY` - Your Linear API key (create in Linear Settings > API > Personal API Keys)

### Optional Environment Variables

**Jira Options:**

- `JIRA_UPDATE_STATUS=false` - Disable automatic status updates (default: `true`)
- `JIRA_DEFAULT_STATUS=Done` - Default status when commit type doesn't match (default: `Done`)

**Linear Options:**

- `LINEAR_UPDATE_STATUS=false` - Disable automatic status updates (default: `true`)
- `LINEAR_DEFAULT_STATUS=Done` - Default status when commit type doesn't match (default: `Done`)

**Sync Options:**

- `SYNC_ADD_COMMENT=false` - Disable adding comments to tickets (default: `true`)
- `SYNC_INCLUDE_BRANCH_NAME=true` - Include branch name in comments (default: `false`)
- `SYNC_INCLUDE_COMMIT_HASH=false` - Exclude commit hash from comments (default: `true`)

**Logging:**

- `TICKET_SYNC_VERBOSE=true` - Enable verbose logging for debugging (default: `false`)

## Usage

### Command Line

Use the `/ticket-sync sync` command to manually sync tickets after a commit:

```bash
# Make a commit with ticket reference
git commit -m "feat(PROJ-123): implement new feature"

# Run the sync command
/ticket-sync sync
```

### Automatic Git Hook Integration

When you set up the git post-commit hook (see Installation), tickets sync automatically after each commit. No manual command required.

### Commit Message Format

Include ticket IDs in your commit messages:

```bash
# Single ticket
git commit -m "feat(PROJ-123): implement new feature"

# Multiple tickets
git commit -m "fix(PROJ-123, ENG-456): resolve authentication issue"

# Conventional commit format
git commit -m "fix(auth): PROJ-123 handle login timeout"
```

### Commit Type to Status Mapping

| Commit Type | Default Status |
|------------|---------------|
| `fix` | Done |
| `feat` | Done |
| `chore` | Done |
| `docs` | Done |
| `refactor` | In Review |
| `test` | In Review |
| `perf` | In Review |
| `build` | Done |
| `ci` | Done |
| `style` | Done |
| Other | In Progress |

### Example Comment Format

When a commit is made with ticket references, the following comment is added to the ticket:

```
**Git Commit Update**

**Commit:** `a1b2c3d`
**Message:** feat(auth): implement OAuth2 login
**Branch:** `feature/oauth-login`
**Author:** John Doe
**Date:** 2026-01-20 10:30:45 +0000
```

## Security Considerations

- **API Tokens**: Never commit API tokens to version control. Use environment variables or a secrets manager.
- **Token Scope**: Use API tokens with minimum required permissions (read/write access to specific projects only)
- **HTTPS Only**: Ensure all API communications use HTTPS
- **Token Rotation**: Rotate API tokens regularly (recommended: every 90 days)
- **Access Logs**: Monitor access logs for suspicious activity
- **Token Storage**: Store tokens securely using your operating system's credential manager or environment variables

### API Token Best Practices

**Jira:**
- Create API tokens at [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
- Label tokens clearly (e.g., "Claude Code - ticket-sync-hook")
- Revoke unused tokens immediately
- Use separate tokens for different tools

**Linear:**
- Create API keys in Linear Settings > API
- Use personal API keys with appropriate scopes
- Restrict key access to specific teams when possible
- Disable keys when not in use

## Troubleshooting

### Command doesn't work

- Verify the plugin is installed and enabled in Claude Code
- Check that environment variables are set correctly
- Use verbose logging to debug issues

### Git hook doesn't trigger

- Ensure the post-commit hook file is executable (`chmod +x .git/hooks/post-commit`)
- Verify the hook script has the correct path to the sync script
- Check that environment variables are set in the hook script
- Test the hook manually: `.git/hooks/post-commit`

### "Ticket not found" errors

- Verify ticket IDs match the correct format (Jira: `PROJ-123`, Linear: `ABC-456`)
- Confirm tickets exist in your project
- Check that API credentials have access to the tickets

### Authentication failures

- Verify API tokens are valid and not expired
- Confirm credentials have proper permissions
- Check for typos in environment variable names

### "Git command failed" errors

- Ensure you're in a git repository
- Verify git is installed and accessible
- Check file permissions on the `.git` directory

### Status update fails

- Verify the target status exists in your workflow
- Check that the ticket allows transitions to the target status
- Review available statuses in your Jira/Linear configuration

Enable verbose logging to debug issues:

```bash
export TICKET_SYNC_VERBOSE=true
```

## Development

### Running Manually

Test the plugin manually using the command:

```bash
# Set required environment variables
export JIRA_ENABLED=true
export JIRA_BASE_URL=https://your-domain.atlassian.net
export JIRA_EMAIL=your-email@example.com
export JIRA_API_TOKEN=your-api-token

# Run the command
/ticket-sync sync
```

Or run the script directly:

```bash
node scripts/sync-ticket.js
```

### Testing with Different Commit Messages

Create test commits with various formats:

```bash
# Test single ticket
git commit --allow-empty -m "feat(TEST-123): test commit"

# Test multiple tickets
git commit --allow-empty -m "fix(TEST-123, TEST-456): test multiple tickets"

# Test with scope
git commit --allow-empty -m "feat(auth): TEST-789 add OAuth support"
```

## Requirements

- Node.js >= 16.0.0
- Git >= 2.0.0
- Valid Jira API token (if using Jira)
- Valid Linear API key (if using Linear)
- Axios ^1.6.0

## License

MIT

## Author

Chris Bunting <cbuntingde@gmail.com>
