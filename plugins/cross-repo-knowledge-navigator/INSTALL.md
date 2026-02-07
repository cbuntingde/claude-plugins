# Installation Guide

Complete installation instructions for the Cross-Repository Knowledge Navigator plugin.

## Prerequisites

### Required Software

- **Claude Code**: Latest version with plugin support
- **Node.js**: 18.0.0 or higher
- **Python**: 3.10 or higher
- **Git**: For cloning repositories

### Optional but Recommended

- GitHub CLI (`gh`) - for GitHub integration
- API tokens for services you want to integrate

## Step 1: Install Claude Code

```bash
# Using npm
npm install -g @anthropic-ai/claude-code

# Or using homebrew (macOS)
brew install claude-code

# Verify installation
claude --version
```

## Step 2: Get API Tokens

### GitHub Token (Required)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with scopes:
   - `repo` (for repository access)
   - `read:org` (for organization repositories)
3. Copy the token (starts with `ghp_`)

### Slack Token (Optional)

1. Go to https://api.slack.com/apps
2. Create new app → Bot permissions
3. Add scopes: `channels:history`, `channels:read`, `search:read`
4. Install app to workspace
5. Copy Bot User OAuth Token (starts with `xoxb-`)

### Jira Token (Optional)

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API token
3. Copy token
4. Note your Jira URL (e.g., `https://your-domain.atlassian.net`)

### Confluence Token (Optional)

Same process as Jira - use the same API token for both.

## Step 3: Install Plugin

### Option A: Install from Marketplace (when available)

```bash
claude plugin install cross-repo-knowledge-navigator
```

### Option B: Install from Local Directory

```bash
# Clone or download the plugin
git clone https://github.com/company/cross-repo-knowledge-navigator.git
cd cross-repo-knowledge-navigator

# Install to user scope (recommended)
claude plugin install ./cross-repo-knowledge-navigator

# Or install to project scope (shared with team)
claude plugin install ./cross-repo-knowledge-navigator --scope project
```

### Option C: Install from Remote Git Repository

```bash
claude plugin install https://github.com/company/cross-repo-knowledge-navigator.git
```

## Step 4: Configure Environment

### Create Configuration File

```bash
cd cross-repo-knowledge-navigator
cp .env.example .env
```

### Edit `.env` File

```bash
# Add your tokens
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_ORG=your-company-name
SLACK_TOKEN=xoxb-your-slack-token
# ... etc
```

### Load Environment Variables

```bash
# On Linux/macOS - add to ~/.bashrc or ~/.zshrc
export $(cat .env | xargs)

# Or use direnv (recommended)
echo ".env" > .envrc
direnv allow
```

## Step 5: Install Dependencies

### Node.js Dependencies

```bash
cd cross-repo-knowledge-navigator

# GitHub MCP Server
cd servers/github-mcp-server
npm install
npm run build
cd ../..

# Confluence MCP Server
cd servers/confluence-mcp-server
npm install
npm run build
cd ../..
```

### Python Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python MCP servers
pip install -r servers/slack-mcp-server/requirements.txt
pip install -r servers/jira-mcp-server/requirements.txt

# Install indexing dependencies
pip install -r requirements.txt
```

## Step 6: Build Initial Index

```bash
cd cross-repo-knowledge-navigator

# Make scripts executable (Linux/macOS)
chmod +x scripts/*.sh

# Run initial index build
./scripts/update-index.sh
```

This will take 5-30 minutes depending on:
- Number of repositories
- Size of Slack history
- Number of Jira tickets
- Confluence page count

## Step 7: Verify Installation

```bash
# Start Claude Code
claude

# Test knowledge search
> /knowledge-search test query

# Test decision tracker
> /decision-tracker database

# Test team practices
> /team-practices testing
```

## Step 8: Set Up Automatic Updates

### Option A: Cron Job (Linux/macOS)

```bash
# Edit crontab
crontab -e

# Add daily update at 2 AM
0 2 * * * cd /path/to/cross-repo-knowledge-navigator && ./scripts/update-index.sh
```

### Option B: GitHub Actions (Team Install)

```bash
# Create .github/workflows/update-index.yml
# See .github/workflows/example.yml for template
```

## Troubleshooting

### Plugin Not Loading

```bash
# Check plugin is installed
claude plugin list

# Check for errors
claude --debug

# Verify plugin.json is valid
cat .claude-plugin/plugin.json | jq .
```

### MCP Servers Not Starting

```bash
# Check MCP server configuration
cat .mcp.json

# Test individual servers
node servers/github-mcp-server/dist/index.js

# Check environment variables
env | grep -E "(GITHUB|SLACK|JIRA|CONFLUENCE)"
```

### Index Build Fails

```bash
# Check logs
cat data/knowledge_index/update.log

# Run with debug output
DEBUG=true ./scripts/update-index.sh

# Test individual indexers
python3 scripts/index-repos.py
python3 scripts/index-slack.py
python3 scripts/index-jira.py
python3 scripts/index-confluence.py
```

### Permission Errors

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Check file permissions
ls -la scripts/
```

### Missing Dependencies

```bash
# Verify Node.js version
node --version  # Should be 18+

# Verify Python version
python3 --version  # Should be 3.10+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Uninstallation

```bash
# Remove plugin
claude plugin uninstall cross-repo-knowledge-navigator

# Remove data directory (optional)
rm -rf cross-repo-knowledge-navigator/data

# Remove environment variables from ~/.bashrc or ~/.zshrc
```

## Next Steps

1. Read the [README.md](README.md) for usage examples
2. Configure additional integrations as needed
3. Set up automatic index updates
4. Share with your team!
