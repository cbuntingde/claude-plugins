---
description: Apply automated migrations and code transformations
arguments:
  - name: source
    description: Current framework/version or language
    required: true
  - name: target
    description: Target framework/version or language
    required: true
  - name: files
    description: Files or patterns to migrate (supports glob patterns)
    required: true
  - name: dry-run
    description: Preview changes without writing to disk
    required: false
examples:
  - "/migrate-apply react 17 react 18 \"src/**/*.jsx\""
  - "/migrate-apply react 17 react 18 \"src/**/*.jsx\" --dry-run"
  - "/migrate-apply javascript typescript \"src/utils/*.js\""
---

# /migrate-apply

Automatically apply code transformations for framework upgrades and language migrations.

## What it does

This command performs automated code transformations including:

- **API updates**: Replaces deprecated APIs with new versions
- **Import statements**: Updates import/export syntax
- **Syntax modernization**: Converts old syntax to new patterns
- **Type annotations**: Adds type hints for language translations
- **Config updates**: Migrates configuration files
- **Dependency updates**: Updates package.json requirements

## ⚠️ Safety features

**Always commits changes first** - Creates a git commit before modifying files
**Dry-run mode** - Preview changes without writing
**Backup creation** - Creates `.backup` files before modification
**Selective application** - Choose which transformations to apply

## How to use

```
/migrate-apply <source> <target> <files> [--dry-run]
```

### Examples

**Dry run first (recommended):**
```
/migrate-apply react 17 react 18 "src/**/*.jsx" --dry-run
```

**Apply migrations:**
```
/migrate-apply react 17 react 18 "src/**/*.jsx"
```

**Migrate JavaScript to TypeScript:**
```
/migrate-apply javascript typescript "src/utils/*.js"
```

**Migrate specific directory:**
```
/migrate-apply vue 2 vue 3 "src/components/**/*.vue"
```

## What gets transformed

### React 17 → 18
- `ReactDOM.render` → `ReactDOM.createRoot`
- Removes unsafe lifecycle methods
- Updates concurrent features usage
- Migrates to new strict mode behavior

### Python 2 → 3
- `print` statement → `print()` function
- `xrange` → `range`
- `raw_input` → `input`
- Updates exception syntax
- Converts `unicode` to `str`

### JavaScript → TypeScript
- Adds JSDoc type annotations
- Creates interface definitions
- Converts `PropTypes` to TypeScript types
- Adds type imports

### Vue 2 → 3
- Options API → Composition API (optional)
- Updates `v-model` syntax
- Migrates `filter` usage
- Updates component registration
- Transforms plugin API

## Dry-run output example

```diff
--- a/src/components/Button.jsx
+++ b/src/components/Button.jsx

@@ -42,7 +42,7 @@

-ReactDOM.render(<App />, document.getElementById('root'));
+const root = ReactDOM.createRoot(document.getElementById('root'));
+root.render(<App />);

@@ -77,7 +77,7 @@

-componentWillMount() {
+componentDidMount() {

```

**[DRY RUN] No files modified. Use /migrate-apply without --dry-run to apply changes.**

## After migration

1. **Review changes**: Check the git diff
2. **Run tests**: Execute test suite to catch issues
3. **Fix remaining issues**: Use `/migrate-check` to find remaining problems
4. **Update documentation**: Document API changes in comments/docs

## Tips

- **Always dry-run first** to preview changes
- **Run on test files** before production code
- **Use git** to easily review and revert changes
- **Migrate incrementally** - don't do everything at once
- **Keep tests green** - fix test failures as you go
- **Create branches** - migrate in feature branches

## Safety checklist

Before running `/migrate-apply`:

- [ ] Committed all current changes
- [ ] Created a feature branch
- [ ] Ran `/migrate-check` to understand changes
- [ ] Reviewed dry-run output
- [ ] Have test suite ready
- [ ] Have rollback plan ready

## Troubleshooting

**Syntax errors after migration:**
- Some transformations may be incomplete
- Run `/migrate-check` to find remaining issues
- Manual fixes may be needed for complex cases

**Type errors in TypeScript:**
- Add `@ts-ignore` for complex cases temporarily
- Create type definitions for external libraries
- Use `any` type as a last resort

**Test failures:**
- Update tests to match new APIs
- Check for behavioral changes in framework
- Review breaking changes documentation
