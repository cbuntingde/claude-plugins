# Sync Tickets

Manually sync Jira/Linear tickets based on the latest git commit.

## Usage

```bash
/ticket-sync sync
```

## Description

This command parses the most recent git commit message for ticket IDs and syncs them to Jira and/or Linear by:
- Adding formatted comments with commit details
- Optionally updating ticket status based on commit type

## Examples

### Sync after a commit

```bash
# Make a commit with ticket reference
git commit -m "feat(PROJ-123): implement OAuth2 login"

# Sync the tickets
/ticket-sync sync
```

### Multiple tickets

```bash
git commit -m "fix(PROJ-123, ENG-456): resolve authentication issue"
/ticket-sync sync
```

## Configuration

Requires the following environment variables to be set:

**For Jira:**
- `JIRA_ENABLED=true`
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

**For Linear:**
- `LINEAR_ENABLED=true`
- `LINEAR_API_KEY`

## See Also

- [Git Hook Setup](../../README.md#automatic-git-hook-integration) for automatic syncing
- [Configuration Guide](../../README.md#configuration) for all options
