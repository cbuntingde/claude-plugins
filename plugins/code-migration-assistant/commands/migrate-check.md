---
description: Check compatibility and identify migration issues in specific files
arguments:
  - name: source
    description: Current framework/version or language
    required: true
  - name: target
    description: Target framework/version or language
    required: true
  - name: files
    description: Files or patterns to check (supports glob patterns)
    required: true
examples:
  - "/migrate-check react 17 react 18 \"src/**/*.jsx\""
  - "/migrate-check python 2.7 python 3.12 \"src/main.py\""
  - "/migrate-check javascript typescript \"src/utils/*.js\""
---

# /migrate-check

Analyze specific files for compatibility issues when migrating between versions or languages.

## What it does

This command performs targeted analysis on specified files to identify:

- **Incompatible API usage**: Functions/methods that changed between versions
- **Deprecated patterns**: Code using deprecated features
- **Type mismatches**: Type incompatibilities in language translations
- **Dependency issues**: Import/require statements needing updates
- **Syntax errors**: Code that won't compile in the target version

## How to use

```
/migrate-check <source> <target> <files>
```

### Examples

**Check all JSX files:**
```
/migrate-check react 17 react 18 "src/**/*.jsx"
```

**Check specific Python file:**
```
/migrate-check python 2.7 python 3.12 src/main.py
```

**Check multiple JavaScript files:**
```
/migrate-check javascript typescript "src/utils/*.js"
```

**Check specific directories:**
```
/migrate-check angular 14 angular 17 "src/app/**/*.ts"
```

## Output format

For each file analyzed, you'll see:

### 📄 File: `src/components/Button.jsx`

#### ✅ Compatible
- Basic component structure is compatible
- Props interface works in React 18

#### ⚠️ Warnings (3 items)

**Line 45: `ReactDOM.render` deprecated**
```jsx
// Current
ReactDOM.render(<App />, document.getElementById('root'));

// Suggested for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

**Line 78: Unsafe lifecycle method**
`componentWillMount` is deprecated and removed in React 18
→ Use `componentDidMount` or `useEffect` instead

**Line 120: Missing dependency in useEffect**
Missing dependency: `userData`
→ Add to dependency array or use `useCallback`

#### 🔴 Blocking Issues (1 item)

**Line 156: Using removed PropTypes import**
`import PropTypes from 'prop-types'` needs to be installed separately

## Tips

- Use **glob patterns** to check multiple files at once
- Run **before and after** migration to verify changes
- Combine with `/migrate-apply` to automatically fix some issues
- Check **test files first** to understand expected behavior changes

## Common patterns

### React 17 → 18
```bash
/migrate-check react 17 react 18 "src/**/*.{jsx,js,tsx,ts}"
```

### Python 2 → 3
```bash
/migrate-check python 2.7 python 3.12 "src/**/*.py"
```

### JavaScript → TypeScript
```bash
/migrate-check javascript typescript "src/**/*.js"
```

### Vue 2 → 3
```bash
/migrate-check vue 2 vue 3 "src/**/*.{vue,js,ts}"
```
