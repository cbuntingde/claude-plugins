---
description: Safely rename functions, variables, classes, and other symbols across the entire codebase with full context awareness
usage: "/safe-rename <old-name> <new-name> [--scope <file|directory|all>] [--preview]"
examples:
  - "/safe-rename getUser fetchUser --scope all"
  - "/safe-rename UserDataModel UserProfile --preview"
  - "/safe-rename handleError logError --scope directory"
tags: ["refactoring", "rename", "safety", "code-intelligence"]
---

# Safe Rename

Intelligently rename symbols across your codebase with full context understanding and conflict detection.

## What it does

This command performs safe, comprehensive renaming of code symbols (functions, variables, classes, methods, etc.) with:

- **Scope-aware renaming**: Understands global vs. local scope
- **Type system integration**: Preserves type information
- **Cross-file updates**: Updates all references across the codebase
- **Conflict detection**: Identifies naming conflicts before renaming
- **Impact analysis**: Shows exactly what will change
- **Preview mode**: Review changes before applying
- **Safe rollback**: Easy to undo if needed

## What you can rename

- **Variables**: Local variables, parameters, fields, properties
- **Functions**: Function names, method names
- **Classes**: Class names, interface names, type aliases
- **Modules**: File names, import/export names
- **Constants**: Const declarations, enum values
- **Components**: React components, web components

## How it works

1. **Symbol identification**: Locates the symbol definition and all its usages
2. **Scope analysis**: Understands visibility and shadowing
3. **Reference finding**: Finds all references across files
4. **Conflict detection**: Checks for naming conflicts
5. **Impact analysis**: Identifies all affected files and locations
6. **Change preview**: Shows before/after for each change
7. **Incremental update**: Applies changes file by file with validation

## Options

- `<old-name>`: Current symbol name (required)
- `<new-name>`: New symbol name (required)
- `--scope`: Rename scope
  - `file`: Only rename in current file (default)
  - `directory`: Rename in current directory
  - `all`: Rename across entire codebase

- `--preview`: Show changes without applying them
  - Review what will change before committing

## Examples

### Basic rename (single file)
```
/safe-rename getUser fetchUser
```
Renames `getUser` to `fetchUser` in the current file.

### Cross-file rename
```
/safe-rename handleError logError --scope all
```
Renames `handleError` to `logError` across all files in the project.

### Preview before applying
```
/safe-rename UserDataModel UserProfile --scope all --preview
```
Shows all changes that would be made, without applying them.

## What you'll see

```
🔍 Analyzing rename operation...

Symbol: getUser (function)
Scope: Global
Language: TypeScript

📍 Definition Location
   src/services/user-service.ts:23

🔗 References Found: 47 locations
   - src/services/user-service.ts:23 (definition)
   - src/services/user-service.ts:45, 67, 89 (internal usage)
   - src/components/UserList.tsx:12, 34, 56 (imports and usage)
   - src/api/user-api.ts:78 (parameter)
   - tests/user-service.test.ts:23, 45, 67, 89 (tests)
   - ... (37 more locations)

⚠️  Potential Conflicts: 0

📊 Impact Summary
   Files affected: 12
   Total changes: 47
   Risk level: Low
   Estimated time: < 2 minutes

📋 Preview Changes

1. src/services/user-service.ts:23
   - export function getUser(id: string): Promise<User>
   + export function fetchUser(id: string): Promise<User>

2. src/services/user-service.ts:45
   - const user = await getUser(userId);
   + const user = await fetchUser(userId);

3. src/components/UserList.tsx:12
   - import { getUser } from '@/services/user-service';
   + import { fetchUser } from '@/services/user-service';

4. src/api/user-api.ts:78
   - async function fetchData(callback: (user: User) => void,
   -                          getUser: typeof getUser) {
   + async function fetchData(callback: (user: User) => void,
   +                          fetchUser: typeof fetchUser) {

... (43 more changes)

✅ Apply these 47 changes across 12 files? (yes/no/details)
```

## Safety features

### Scope awareness
```typescript
// Only renames the local variable, not the global function
function process() {
  const data = getData(); // local variable
  const data2 = processData(data); // parameter
  // Renaming 'data' here won't affect the function 'getData'
}
```

### Conflict detection
```typescript
// Detects and warns about naming conflicts
class UserProfile { } // already exists
// Trying to rename 'UserData' to 'UserProfile' will show:
// ⚠️  Conflict: 'UserProfile' already exists in src/models/User.ts:12
```

### Shadowing detection
```typescript
// Detects when a rename would create shadowing
const data = "global";
function process() {
  const data = "local"; // shadows global
  // Warns if renaming would create this situation
}
```

## Best practices

1. **Always use preview first**: Review changes before applying
2. **Start with file scope**: Test rename in single file first
3. **Check tests after renaming**: Ensure all tests still pass
4. **Commit before renaming**: Easy rollback if something goes wrong
5. **Use descriptive names**: Rename to improve clarity
6. **Follow naming conventions**: Maintain consistency with codebase

## Naming convention suggestions

The command can suggest better names based on conventions:

- `getUser` → `fetchUser` (if it fetches data)
- `data` → `userData` (more specific)
- `handleClick` → `onButtonClick` (React convention)
- `UserInfo` → `UserProfile` (more accurate)
- `doSomething` → `performAction` (more descriptive)

## Language-specific behavior

### TypeScript/JavaScript
- Renames across import/export statements
- Handles type annotations
- Updates JSX/TSX component names
- Maintains JSDoc comments

### Python
- Renames across import statements
- Handles type hints
- Updates dunder methods carefully
- Maintains docstring references

### Java
- Renames across package imports
- Handles generics properly
- Updates annotations
- Maintains Javadoc comments

## Limitations

- Cannot rename symbols in external libraries
- Cannot rename symbols in read-only files
- May not detect dynamic property access
- String references are not updated (intentional)

## Advanced usage

### Rename with scope override
```
/safe-rename data userData --scope file
```
Only renames in current file, even if symbol is used elsewhere.

### Bulk rename pattern
```
/safe-rename handle* on* --scope all
```
Renames all functions starting with `handle` to `on` (experimental).

## See also

- `/extract-duplication`: Extract and name duplicated logic
- `/modernize-code`: Modernize code while renaming
- `/analyze-refactor-opportunities`: Find symbols that need renaming
