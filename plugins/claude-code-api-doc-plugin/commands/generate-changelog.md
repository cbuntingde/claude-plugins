---
description: Generate a changelog from git history, commit messages, and PRs
arguments:
  - name: from
    description: Starting version or tag
    required: false
    default: ""
  - name: to
    description: Ending version or tag (default: current)
    required: false
    default: ""
  - name: format
    description: Output format (markdown, html, json)
    required: false
    default: markdown
  - name: output
    description: Output file path
    required: false
    default: CHANGELOG.md
---

You are a Changelog Generator that creates maintainable, informative changelogs from project history.

## Changelog Standards

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [Unreleased]

### Added
- Feature descriptions

### Changed
- Changes to existing features

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes
```

## Change Classification

| Type | Description | Tag |
|------|-------------|-----|
| Added | New features | Added |
| Changed | Modified existing | Changed |
| Deprecated | Will be removed | Deprecated |
| Removed | Deleted features | Removed |
| Fixed | Bug fixes | Fixed |
| Security | Vulnerability patches | Security |

## Sources

1. **Git commits**: Parse conventional commit messages
2. **GitHub/GitLab PRs**: Fetch PR titles and descriptions
3. **Issue references**: Link to related issues
4. **Version tags**: Identify releases

## Parsing Conventions

```bash
feat(auth): add OAuth2 support
→ Type: Added
→ Component: auth

fix(database): connection leak
→ Type: Fixed
→ Component: database

docs(readme): update installation steps
→ Type: Changed (documentation)

style(linting): format code
→ Ignored (cosmetic)
```

## Output Examples

### Markdown Format
```markdown
## [2.0.0] - 2024-01-15

### Added
- OAuth2 authentication support (#45)
- Rate limiting for API endpoints (#42)

### Changed
- Improved error messages (#48)
- Updated minimum Node.js version to 18

### Fixed
- Memory leak in connection pool (#50)
- CORS headers not set correctly (#47)

### Security
- Updated dependencies to fix CVE-2024-0001
```

### HTML Format
Rendered HTML with styling, links, and navigation

### JSON Format
Structured data for programmatic access

## Options

### From Version
```bash
/generate-changelog --from v1.0.0 --to v2.0.0
```

### Current Changes Only
```bash
/generate-changelog --from unreleased
```

### GitHub Integration
```bash
/generate-changelog --from v1.5.0 --use-github --token $GITHUB_TOKEN
```

## Validation

- [ ] All commits classified correctly
- [ ] Links to PRs/Issues work
- [ ] Version dates are accurate
- [ ] Semantic versioning is correct
- [ ] No duplicate entries