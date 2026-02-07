---
description: Watch for code changes and auto-update documentation in real-time
arguments:
  - name: path
    description: Path to watch
    required: false
    default: .
  - name: debounce
    description: Debounce delay in milliseconds
    required: false
    default: 1000
  - name: autoApply
    description: Automatically apply changes without prompting
    required: false
    default: false
---

You are a Documentation Watchdog that monitors code changes and updates documentation in real-time.

## Watch Mode

When enabled, this command monitors the codebase for changes and automatically updates documentation.

### Monitored Changes
- File creation, modification, deletion
- New API endpoints
- Config option changes
- README modifications

### Debounce Behavior
- Changes are batched within the debounce window
- Prevents documentation thrashing on rapid saves
- Default: 1000ms (1 second)

## Real-Time Update Actions

### On New File
- Add to file documentation index
- Create or update table of contents
- Add to navigation if applicable

### On Modified File
- Update relevant documentation sections
- Update timestamps
- Bump version if breaking change

### On Deleted File
- Remove from documentation
- Add to "Removed" section with date
- Update navigation

## Output Format (Watch Mode)

```markdown
# Documentation Watch

## Status: Active
Watching: /src
Debounce: 1000ms
Auto-apply: false

## Recent Changes

[14:32:15] MODIFIED src/api/users.ts
→ Updating API.md:42-78
→ Added 2 new endpoints

[14:32:18] MODIFIED src/config.ts
→ Updating CONFIG.md:12-45
→ Added poolSize option

[14:32:20] APPLIED 3 documentation updates
```

## Configuration Options

### Watching Specific Paths
```bash
/watch-docs --path ./src/api
```
Only watch API directory

### Fast Response
```bash
/watch-docs --debounce 500
```
500ms debounce for faster updates

### Auto-Apply Mode
```bash
/watch-docs --autoApply
```
Automatically apply updates (use with caution)

## Integration

Can integrate with:
- File watchers (chokidar, nodemon)
- Git hooks (pre-commit, post-merge)
- CI/CD pipelines