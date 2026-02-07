---
name: dependency-migration
description: Expert skill for managing and migrating package dependencies during framework upgrades
context: |
  Use this skill when the user needs to update, upgrade, or migrate package dependencies
  as part of a framework upgrade or language migration.

  Look for phrases like:
  - "update dependencies"
  - "upgrade packages"
  - "resolve dependency conflicts"
  - "package.json outdated"
  - "npm/yarn/pnpm upgrade issues"
  - "peer dependency problems"
  - "breaks after updating packages"

  This skill should:
  1. Analyze current dependency versions and constraints
  2. Identify outdated packages and security vulnerabilities
  3. Resolve peer dependency conflicts
  4. Find compatible package versions
  5. Handle breaking changes in dependencies
  6. Update lockfiles safely
  7. Provide rollback strategies
  8. Test dependency changes
---

# Dependency Migration Skill

You are an expert in managing package dependencies, resolving version conflicts, and safely updating packages during framework migrations and upgrades.

## When to use this skill

Invoke this skill when:
- Upgrading framework versions (React, Vue, Angular, etc.)
- Updating outdated dependencies
- Resolving peer dependency conflicts
- Dealing with breaking changes in packages
- Managing npm/yarn/pnpm upgrades
- Handling security vulnerabilities
- Migrating between package managers

## Core concepts

### Dependency types

1. **dependencies**
   - Required for production
   - Installed in production
   - Example: `react`, `lodash`, `express`

2. **devDependencies**
   - Only needed for development
   - Not installed in production
   - Example: `typescript`, `jest`, `eslint`

3. **peerDependencies**
   - Must be provided by consuming project
   - Not automatically installed
   - Example: React plugins require `react`

4. **optionalDependencies**
   - Not required but used if available
   - Installation failures don't break install
   - Example: `fsevents` on macOS

## Version constraints

```json
{
  "exact": "1.2.3",           // Exactly 1.2.3
  "caret": "^1.2.3",          // >=1.2.3 <2.0.0
  "tilde": "~1.2.3",          // >=1.2.3 <1.3.0
  "greater": ">=1.2.3",       // 1.2.3 or higher
  "range": ">=1.2.3 <2.0.0",  // Range
  "latest": "*",              // Latest version (risky)
  "url": "git+https://..."    // Git repository
}
```

## Dependency analysis workflow

### Step 1: Audit current dependencies

```bash
# Check for outdated packages
npm outdated
# or
yarn outdated
# or
pnpm outdated

# Check for security vulnerabilities
npm audit
# or
yarn audit
# or
pnpm audit

# View dependency tree
npm ls
# or
yarn why <package>
# or
pnpm why <package>
```

**Analysis output:**
```
Package          Current  Wanted  Latest  Location
react            17.0.2   17.0.2  18.3.1  project
react-dom        17.0.2   17.0.2  18.3.1  project
@types/react     17.0.0   17.0.0  18.3.0  project
```

### Step 2: Identify conflicts

```bash
# Check for peer dependency conflicts
npm ls --depth=0

# Look for UNMET PEER DEPENDENCY warnings
```

**Example conflict:**
```
project@1.0.0
├── react@18.3.1
├── some-library@2.0.0
│   └── UNMET PEER DEPENDENCY react@^17.0.0
└── other-library@3.0.0
    └── UNMET PEER DEPENDENCY react@^16.0.0
```

### Step 3: Create upgrade plan

```markdown
# Dependency Upgrade Plan

## Critical upgrades (security)
- [ ] `lodash` 4.17.15 → 4.17.21 (CVE-2021-23337)
- [ ] `axios` 0.21.1 → 1.6.0 (security fixes)

## Framework upgrades
- [ ] `react` 17.0.2 → 18.3.1
- [ ] `react-dom` 17.0.2 → 18.3.1
- [ ] `@types/react` 17.0.0 → 18.3.0

## Peer dependency resolution
- [ ] Find replacement for `some-library` (React 17 only)
- [ ] Update `other-library` to v4 (supports React 18)

## Order of operations
1. Update dev dependencies (types, tools)
2. Update framework packages
3. Update peer dependencies
4. Update other dependencies
5. Fix conflicts
6. Run tests
7. Commit changes
```

### Step 4: Execute upgrades

```bash
# Update specific packages
npm install react@latest react-dom@latest

# Update to specific versions
npm install react@18.3.1 react-dom@18.3.1

# Update all packages (careful!)
npm update

# Use interactive updater (safer)
npx npm-check-updates -u
npm install
```

## Common scenarios

### Scenario 1: React upgrade with peer conflicts

**Problem:**
```json
{
  "dependencies": {
    "react": "^17.0.0",
    "react-select": "^4.0.0"
  }
}
```

`react-select@4` requires React 17, but we want React 18.

**Solution:**
```bash
# Check latest react-select version
npm view react-select versions

# Update to version that supports React 18
npm install react-select@5
npm install react@18
```

**Updated package.json:**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-select": "^5.0.0"
  }
}
```

### Scenario 2: TypeScript type conflicts

**Problem:**
```bash
TS2717: Object literal may only specify known properties
```

Type mismatches between `@types/react` and `react` versions.

**Solution:**
```bash
# Ensure types match React version
npm install @types/react@18 @types/react-dom@18

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server in editor
```

### Scenario 3: Circular dependency issues

**Problem:**
```
npm ERR! peer dep missing: package-a requires package-b@^2.0.0
npm ERR! peer dep missing: package-b requires package-a@^1.0.0
```

**Solution:**
```bash
# Use npm ls to trace the conflict
npm ls package-a package-b

# Find versions that are compatible
npm view package-a versions
npm view package-b versions

# Install compatible versions explicitly
npm install package-a@3.0.0 package-b@2.5.0
```

### Scenario 4: Lockfile corruption

**Problem:**
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Option 1: Delete and regenerate
rm package-lock.json
npm install

# Option 2: Use --force (risky)
npm install --force

# Option 3: Use --legacy-peer-deps (temporary)
npm install --legacy-peer-deps

# Option 4: Resolve conflicts manually
npm install <package>@<version> --save-exact
```

## Framework-specific guides

### React

**Essential packages:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^20.0.0"
  }
}
```

**Common peer dependencies:**
- React Router: Need matching React version
- Redux: Need compatible react-redux
- Material-UI: Check peer dependencies
- Testing Library: Update with React

### Vue

**Vue 3 packages:**
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "@vueuse/core": "^10.7.0"
  }
}
```

### Next.js

**Version alignment:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.3.0"
  }
}
```

## Package manager migrations

### npm → yarn

```bash
# Install yarn
npm install -g yarn

# Import from npm
yarn import

# Install dependencies
yarn install

# Use yarn commands going forward
yarn add <package>
yarn remove <package>
yarn upgrade
```

### npm → pnpm

```bash
# Install pnpm
npm install -g pnpm

# Import from npm
pnpm import

# Install dependencies
pnpm install

# Use pnpm commands
pnpm add <package>
pnpm remove <package>
pnpm update
```

## Automation tools

### npm-check-updates

```bash
# Install
npm install -g npm-check-updates

# Check what can be updated
ncu

# Update package.json (safe)
ncu -u

# Interactively select updates
ncu -i

# Target specific version
ncu --target greatest
ncu --target newest
ncu --target minor
```

### renovate-bot

Automated dependency updates via PRs:
```json
// renovate.json
{
  "extends": ["config:base"],
  "schedule": ["every weekend"],
  "labels": ["dependencies"],
  "assignees": ["@maintenance-team"]
}
```

### dependabot

GitHub's dependency updater:
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

## Safety practices

### Before updating

1. **Create a branch**
```bash
git checkout -b dependency-updates
```

2. **Check current state**
```bash
npm test  # Ensure tests pass
```

3. **Review changelogs**
- Check GitHub releases
- Look for breaking changes
- Review migration guides

4. **Backup package.json**
```bash
cp package.json package.json.backup
```

### During updates

1. **Update incrementally**
```bash
# Start with dev dependencies
npm install --save-dev @types/react@latest

# Then framework packages
npm install react@latest react-dom@latest

# Then other dependencies
npm update
```

2. **Test after each batch**
```bash
npm test
npm run build
```

3. **Commit successful updates**
```bash
git add package.json package-lock.json
git commit -m "Update dependencies"
```

### After updates

1. **Run full test suite**
```bash
npm test
npm run lint
npm run build
```

2. **Check for warnings**
- Browser console
- Terminal output
- Build logs

3. **Test in development**
```bash
npm run dev
# Manual testing
```

4. **Test in production mode**
```bash
npm run build
npm run start  # production server
```

## Rollback strategy

If updates break something:

```bash
# Option 1: Restore from git
git checkout HEAD~1 package.json package-lock.json
npm install

# Option 2: Use backup file
cp package.json.backup package.json
npm install

# Option 3: Install specific versions
npm install package@previous-version
```

## Security vulnerabilities

### Handling CVE reports

```bash
# Audit for vulnerabilities
npm audit

# Automatic fix (safe updates)
npm audit fix

# Automatic fix (including breaking changes)
npm audit fix --force

# Manual review
npm audit --json
```

### Example: Fixing lodash vulnerability

```bash
# Vulnerability detected in lodash@4.17.15
npm audit

# Update to patched version
npm install lodash@4.17.21

# Verify fix
npm audit
```

## Best practices

1. **Pin major versions** - Use `^18.0.0` not `*`
2. **Update regularly** - Don't let packages get too old
3. **Test thoroughly** - Run tests after updates
4. **Read changelogs** - Know what changed
5. **Use lockfiles** - Commit package-lock.json
6. **Automate** - Use Dependabot or Renovate
7. **Monitor** - Watch for security advisories
8. **Document** - Note why specific versions are pinned

## Troubleshooting

### Issue: "ERESOLVE unable to resolve dependency tree"

**Cause:** Conflicting peer dependencies

**Solutions:**
1. Check for peer dependency conflicts
2. Find compatible package versions
3. Use `--legacy-peer-deps` as last resort
4. Manually resolve conflicts

### Issue: "Cannot find module"

**Cause:** Missing or incorrectly installed dependency

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check if module is listed in package.json
npm ls <module>
```

### Issue: "TypeScript errors after update"

**Cause:** Type definitions don't match installed packages

**Solutions:**
```bash
# Update @types packages
npm install @types/<package>@latest

# Ensure type versions match package versions
npm install @types/react@18 react@18

# Clear TypeScript cache
rm -rf node_modules/.cache
```

## Monitoring

### Tools for monitoring dependencies

1. **Dependabot** - GitHub native
2. **Renovate** - Highly configurable
3. **Snyk** - Security-focused
4. **npm audit** - Built-in
5. **OWASP Dependency-Check** - Security scanning

### Setting up alerts

```json
// package.json
{
  "scripts": {
    "preinstall": "npx npm-force-resolutions",
    "audit:fix": "npm audit fix",
    "check-updates": "ncu"
  }
}
```

## Resources

- npm docs: https://docs.npmjs.com/
- yarn docs: https://yarnpkg.com/getting-started
- pnpm docs: https://pnpm.io/
- Node.js security advisories: https://github.com/nodejs/security-wg
