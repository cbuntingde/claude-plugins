# Code Migration Assistant Plugin

An intelligent Claude Code plugin for upgrading between framework versions and translating between programming languages.

## Features

### 🔄 Framework Upgrades
- React (17 → 18, 18 → 19, etc.)
- Vue (2 → 3, 3.x upgrades)
- Angular (2-18 upgrades)
- Next.js (12 → 14, 13 → 15, etc.)
- Express, Django, Rails, and more

### 🌐 Language Translations
- JavaScript ↔ TypeScript
- JavaScript ↔ Python
- React Class Components → Functional Components with Hooks
- Vue Options API → Composition API
- Java → Kotlin
- And many more

### 📦 Dependency Management
- Update outdated packages
- Resolve peer dependency conflicts
- Fix security vulnerabilities
- Handle breaking changes
- Safe rollback strategies

### 🔍 Analysis Tools
- Codebase complexity assessment
- Breaking change detection
- Effort estimation
- Risk analysis
- Migration planning

## Installation

### From a marketplace (if published)

```bash
# Install to user scope (available in all projects)
claude plugin install code-migration-assistant

# Install to project scope (shared with team)
claude plugin install code-migration-assistant --scope project

# Install to local scope (gitignored)
claude plugin install code-migration-assistant --scope local
```

### Manual installation

```bash
# Clone or download this plugin
git clone https://github.com/your-repo/code-migration-assistant.git

# Create plugin directory
mkdir -p ~/.claude/plugins/code-migration-assistant

# Copy plugin files
cp -r code-migration-assistant/* ~/.claude/plugins/code-migration-assistant/

# Or use a marketplace entry in your marketplace.json
```

## Commands

### `/migrate-plan`

Create a comprehensive migration plan for framework upgrades or language translations.

```bash
# Framework upgrade plan
/migrate-plan react 17 react 18

# Language version upgrade
/migrate-plan python 2.7 python 3.12

# Language translation
/migrate-plan javascript typescript

# Scoped analysis
/migrate-plan next.js 12 next.js 14 --scope ./app
```

**Output:**
- Executive summary
- Prerequisites
- Detailed changes
- Step-by-step migration guide
- Risk matrix
- Rollback plan

### `/migrate-check`

Check compatibility and identify migration issues in specific files.

```bash
# Check all JSX files
/migrate-check react 17 react 18 "src/**/*.jsx"

# Check specific Python file
/migrate-check python 2.7 python 3.12 src/main.py

# Check multiple JavaScript files
/migrate-check javascript typescript "src/utils/*.js"
```

**Output:**
- Incompatible API usage
- Deprecated patterns
- Type mismatches
- Dependency issues
- Code examples for fixes

### `/migrate-apply`

Apply automated migrations and code transformations.

```bash
# Dry run first (recommended)
/migrate-apply react 17 react 18 "src/**/*.jsx" --dry-run

# Apply migrations
/migrate-apply react 17 react 18 "src/**/*.jsx"

# Migrate JavaScript to TypeScript
/migrate-apply javascript typescript "src/utils/*.js"
```

**Features:**
- Automatic git commit before changes
- Dry-run mode for preview
- Backup file creation
- Selective application

### `/migrate-analyze`

Analyze codebase complexity and provide detailed migration metrics.

```bash
# Analyze entire codebase
/migrate-analyze react 17 react 18

# JSON output for CI/CD
/migrate-analyze python 2.7 python 3.12 --format json > analysis.json

# Analyze specific directory
/migrate-analyze javascript typescript --scope ./src/utils

# Markdown report
/migrate-analyze vue 2 vue 3 --format markdown > migration-analysis.md
```

**Output:**
- Code metrics
- Dependency graph
- Complexity analysis
- Effort estimation
- Risk scoring
- Compatibility matrix

## Agents

This plugin includes three specialized agents:

### Migration Analyzer Agent
Performs deep analysis of codebases to plan and execute migrations.

**Capabilities:**
- Dependency graph analysis
- Code pattern recognition
- Complexity assessment
- Risk analysis

### Breaking Change Detector Agent
Identifies deprecated APIs, removed features, and breaking changes.

**Capabilities:**
- Deprecated API detection
- Breaking change identification
- Documentation cross-reference
- Alternative suggestions

### Code Translator Agent
Translates code between programming languages while preserving functionality.

**Capabilities:**
- Language pair translation
- Idiomatic code generation
- Type system translation
- Standard library mapping

## Skills

The plugin provides three specialized skills:

### framework-upgrade
Expert skill for upgrading framework versions (React, Vue, Angular, Next.js, etc.)

**Automatically invoked when you ask to:**
- Upgrade from [version] to [version]
- Migrate to [framework] [version]
- Update [framework] to latest

### language-translation
Expert skill for translating code between programming languages.

**Automatically invoked when you ask to:**
- Convert [language] to [language]
- Translate this code to [language]
- Migrate from [language] to [language]

### dependency-migration
Expert skill for managing and migrating package dependencies.

**Automatically invoked when you ask to:**
- Update dependencies
- Upgrade packages
- Resolve dependency conflicts
- Fix peer dependency problems

## Usage Examples

### Example 1: React 17 → 18 Upgrade

```bash
# Step 1: Analyze current state
/migrate-analyze react 17 react 18

# Step 2: Create migration plan
/migrate-plan react 17 react 18

# Step 3: Check for issues
/migrate-check react 17 react 18 "src/**/*.jsx"

# Step 4: Preview changes
/migrate-apply react 17 react 18 "src/**/*.jsx" --dry-run

# Step 5: Apply migrations
/migrate-apply react 17 react 18 "src/**/*.jsx"

# Step 6: Verify
/migrate-check react 17 react 18 "src/**/*.jsx"
```

### Example 2: JavaScript → TypeScript Conversion

```bash
# Analyze complexity
/migrate-analyze javascript typescript --scope ./src

# Create conversion plan
/migrate-plan javascript typescript

# Check specific files
/migrate-check javascript typescript "src/utils/*.js"

# Apply conversion
/migrate-apply javascript typescript "src/utils/*.js"
```

### Example 3: Python 2 → 3 Migration

```bash
# Full analysis
/migrate-analyze python 2.7 python 3.12

# Create plan
/migrate-plan python 2.7 python 3.12

# Check compatibility
/migrate-check python 2.7 python 3.12 "src/**/*.py"

# Apply migrations
/migrate-apply python 2.7 python 3.12 "src/**/*.py"
```

## Hooks

The plugin includes helpful hooks:

### SessionStart Hook
Notifies you about migration capabilities when starting a session.

### PostToolUse Hook
After writing/editing code, checks if files might benefit from migration assistance.

## Configuration

### Environment Variables

None required. The plugin uses `${CLAUDE_PLUGIN_ROOT}` automatically for paths.

### Settings

No additional settings needed. The plugin works out of the box.

## Best Practices

1. **Always dry-run first** - Preview changes before applying
2. **Create branches** - Work in feature branches
3. **Commit often** - Small, reversible changes
4. **Test thoroughly** - Run tests after each migration step
5. **Review changes** - Check git diff before committing
6. **Update documentation** - Document migration decisions
7. **Keep tests green** - Fix test failures as they occur

## Troubleshooting

### Plugin not loading

```bash
# Check plugin status
claude plugin list

# Debug mode
claude --debug

# Validate plugin
claude plugin validate code-migration-assistant
```

### Commands not appearing

1. Check that `commands/` directory is at plugin root
2. Verify `.md` files are valid Markdown with frontmatter
3. Restart Claude Code
4. Check debug output for errors

### Migration errors

1. Use `--dry-run` to preview changes
2. Check git history for rollback
3. Review breaking changes documentation
4. Run `/migrate-check` to identify issues
5. Test in development environment first

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues, questions, or contributions:

- GitHub Issues: https://github.com/your-repo/code-migration-assistant/issues
- Documentation: https://github.com/your-repo/code-migration-assistant/wiki

## License

MIT License - See LICENSE file for details

## Changelog

### Version 1.0.0
- Initial release
- Support for React, Vue, Angular, Next.js upgrades
- JavaScript ↔ TypeScript translation
- Python 2 → 3 migration
- Dependency management
- Code analysis and planning tools
- Three specialized agents
- Three framework/language skills

## Roadmap

- [ ] Additional framework support (Svelte, Solid, etc.)
- [ ] More language pairs (Go, Rust, C#, etc.)
- [ ] Enhanced codemods
- [ ] Migration progress tracking
- [ ] Automated testing integration
- [ ] Visual migration reports
- [ ] Team collaboration features

## Acknowledgments

Built with:
- [Claude Code Plugin System](https://code.claude.com/docs/en/plugins)
- Community feedback and contributions
- Framework documentation and migration guides

---

**Made with ❤️ by the Code Migration Assistant team**
