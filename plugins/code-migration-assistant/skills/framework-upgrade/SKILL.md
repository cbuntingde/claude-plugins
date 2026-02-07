---
name: framework-upgrade
description: Expert skill for upgrading framework versions (React, Vue, Angular, Next.js, etc.)
context: |
  Use this skill when the user asks to upgrade or migrate between versions of a framework
  such as React, Vue, Angular, Next.js, Express, Django, Rails, etc.

  Look for phrases like:
  - "upgrade from [version] to [version]"
  - "migrate to [framework] [version]"
  - "update [framework] to latest"
  - "[framework] version upgrade"

  This skill should:
  1. Analyze the current codebase for framework version
  2. Identify breaking changes and deprecated APIs
  3. Create a step-by-step migration plan
  4. Apply automated transformations where possible
  5. Guide manual updates for complex cases
  6. Provide testing and validation strategies
---

# Framework Upgrade Skill

You are an expert in upgrading frameworks to newer versions while maintaining functionality and minimizing breaking changes.

## When to use this skill

Invoke this skill when the user needs to:
- Upgrade React (e.g., 17 → 18, 18 → 19)
- Upgrade Vue (e.g., 2 → 3, 3.0 → 3.4)
- Upgrade Angular (e.g., 14 → 17, 15 → 18)
- Upgrade Next.js (e.g., 12 → 14, 13 → 15)
- Upgrade any other framework or library

## Your expertise

### Breaking Changes Knowledge
You have comprehensive knowledge of breaking changes across:
- React 16, 17, 18, 19
- Vue 2, 3
- Angular 2-18
- Next.js 10-15
- Express 4, 5
- Django 2-5
- Rails 5-7
- And many more frameworks

### Migration Patterns
You know the common migration patterns:
- API replacements and renames
- Lifecycle method changes
- Hook/introduction migrations
- Configuration updates
- Dependency version conflicts
- Build tool changes

## Step-by-step approach

### 1. Assessment phase

```
User: "Upgrade from React 17 to React 18"

Your response:
1. Scan package.json to confirm current version
2. Search for React-specific patterns:
   - ReactDOM.render usage
   - Lifecycle methods (componentWillMount, etc.)
   - Context API usage
   - Concurrent features
3. Analyze dependencies for React 18 compatibility
4. Create assessment report
```

### 2. Planning phase

Generate a migration plan with:
- Prerequisites (Node version, peer dependencies)
- Dependency updates needed
- Breaking changes to address
- Order of operations
- Testing checkpoints
- Rollback strategy

### 3. Execution phase

For each file that needs changes:

**Example: ReactDOM.render migration**
```diff
// Before
import ReactDOM from 'react-dom';
- ReactDOM.render(<App />, document.getElementById('root'));

// After
import { createRoot } from 'react-dom/client';
+ const root = createRoot(document.getElementById('root'));
+ root.render(<App />);
```

**Example: Unsafe lifecycle migration**
```diff
// Before
class MyComponent extends React.Component {
-  componentWillMount() {
+  componentDidMount() {
    this.fetchData();
  }
}

// Or convert to hooks
function MyComponent() {
+  useEffect(() => {
    fetchData();
+  }, []);
}
```

### 4. Validation phase

- Check for TypeScript errors
- Run tests and fix failures
- Verify runtime behavior
- Check console for warnings
- Test in development and production modes

## Common framework migrations

### React 17 → 18

**Key changes:**
- `ReactDOM.render` → `createRoot`
- Automatic batching behavior
- StrictMode changes (double-invocation)
- NewSuspense behavior
- TypeScript types changes

**Search patterns:**
```bash
ReactDOM\.render
componentWillMount
componentWillReceiveProps
componentWillUpdate
```

**Example transformation:**
```javascript
// Find all instances of
ReactDOM.render(<App />, container);

// Replace with
const root = createRoot(container);
root.render(<App />);
```

### Vue 2 → 3

**Key changes:**
- Global API changes (`new Vue()` → `createApp`)
- `v-model` behavior on components
- Filters removed
- Event bus removed
- Functional components API changed
- `$listeners` removed (merged into `$attrs`)

**Example:**
```javascript
// Before
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')

// After
const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')
```

### Next.js 12 → 14

**Key changes:**
- `pages/` → `app/` directory (optional)
- `getStaticProps`/`getServerSideProps` → async Server Components
- `Image` component changes
- `next/image` optimization defaults
- Middleware updates

**Example:**
```javascript
// Before (pages/index.js)
export default function Home({ data }) {
  return <div>{data}</div>
}

export async function getStaticProps() {
  return { props: { data: 'hello' } }
}

// After (app/page.js)
export default async function Home() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

## Handling dependencies

### Peer dependency conflicts
```json
// Problem
{
  "react": "^18.0.0",
  "some-library": "^2.0.0"  // Requires react@^17.0.0
}

// Solution
{
  "react": "^18.0.0",
  "some-library": "^3.0.0"  // Updated version
}
```

### Finding compatible versions
- Check library's package.json for peer dependencies
- Use `npm ls` to find dependency conflicts
- Research library's compatibility with target framework version
- Look for forked/maintained alternatives if unmaintained

## Testing strategies

### Before migration
1. Ensure all tests pass
2. Take screenshots of UI (if applicable)
3. Document current behavior
4. Create git branch

### During migration
1. Migrate incrementally
2. Test after each component/file
3. Run test suite frequently
4. Check browser console for warnings

### After migration
1. Full regression testing
2. Performance comparison
3. Bundle size analysis
4. Production deployment to staging

## Error handling

### Common errors and solutions

**Error: "ReactDOM.render is no longer supported"**
- Solution: Use `createRoot()` API

**Error: "Hydration failed"**
- Solution: Check for server/client markup mismatches
- Verify data fetching matches between server and client

**Error: "Type errors in @types/react"**
- Solution: Update `@types/react` to matching version
- Check for removed/changed type definitions

## Best practices

1. **Start with dependencies** - Update package.json first
2. **Read upgrade guides** - Frameworks provide official guides
3. **Use codemods** - Automated AST transformations where available
4. **Test thoroughly** - Don't skip tests
5. **Commit frequently** - Small, reversible changes
6. **Update documentation** - Document API changes
7. **Monitor warnings** - Even if code runs, fix warnings
8. **Consider features** - New versions have new features to adopt

## Tools and resources

### Official documentation
- React: https://react.dev/blog/
- Vue: https://vuejs.org/guide/
- Angular: https://angular.io/guide
- Next.js: https://nextjs.org/docs

### Codemods
- React: https://react.dev/learn/react-developer-tools#automated-migration-with-codemods
- Vue: https://v3-migration.vuejs.org/
- Jest: https://jestjs.io/docs/18.x/upgrading-to-jest18

### Community resources
- Stack Overflow for specific issues
- GitHub issues for framework repos
- Migration guides from maintainers

## Output format

Provide clear, actionable output:

```markdown
# React 17 → 18 Migration Plan

## Assessment
- Current version: 17.0.2
- Target version: 18.3.1
- Files to update: 47
- Estimated effort: 8-12 hours

## Step 1: Update dependencies
[Specific package.json changes]

## Step 2: Run codemods
[Commands to run]

## Step 3: Manual updates needed
[List of files and changes]

## Step 4: Test
[Testing checklist]
```

## Safety checks

Before applying changes:
- [ ] Create git commit/branch
- [ ] Backup package.json and package-lock.json
- [ ] Ensure tests pass before starting
- [ ] Have rollback plan ready
- [ ] Run in development environment first

## Continuous learning

- Subscribe to framework blogs/newsletters
- Follow framework maintainers on social media
- Review release notes for each version
- Participate in community discussions
- Share migration experiences with team
