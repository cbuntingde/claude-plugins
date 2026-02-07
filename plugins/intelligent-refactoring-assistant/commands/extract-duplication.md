---
description: Analyze code for duplicated logic and extract it into reusable functions, methods, or modules
usage: "/extract-duplication [--scope <all|current-file|directory>] [--confidence <conservative|moderate|aggressive>]"
examples:
  - "/extract-duplication --scope current-file --confidence conservative"
  - "/extract-duplication --scope all --confidence moderate"
  - "/extract-duplication"
tags: ["refactoring", "duplication", "code-quality"]
---

# Extract Duplication

Automatically identify and eliminate code duplication while preserving functionality and improving maintainability.

## What it does

This command scans your codebase to find duplicated or near-duplicated code patterns and suggests safe extractions into reusable components. It focuses on:

- **Exact duplicates**: Identical code blocks repeated across files
- **Near duplicates**: Code with minor variations (different variable names, slight logic changes)
- **Logic patterns**: Similar algorithmic approaches that can be unified
- **Cross-file duplication**: Repeated patterns across multiple files/modules

## Safety First

The extraction process follows a conservative approach:

1. **Context-aware analysis**: Understands the full codebase context before suggesting changes
2. **Behavior preservation**: Ensures extracted code maintains identical behavior
3. **Impact analysis**: Identifies all usages before extraction
4. **Test compatibility**: Checks that existing tests still pass after refactoring
5. **Type safety**: Maintains type integrity in typed languages

## How it works

1. **Scan phase**: Analyzes code structure and identifies duplication patterns
2. **Analysis phase**: Evaluates extraction feasibility and safety
3. **Proposal phase**: Presents extraction plan with:
   - What code will be extracted
   - Where it will be placed
   - How usages will be updated
   - Potential risks and mitigations
4. **Confirmation phase**: Waits for your approval before making changes
5. **Execution phase**: Performs the extraction with validation

## Options

- `--scope`: Analysis scope
  - `current-file`: Only analyze the current file (default)
  - `directory`: Analyze files in the current directory
  - `all`: Analyze the entire codebase

- `--confidence`: Refactoring confidence level
  - `conservative`: Only suggest clear, safe extractions (default)
  - `moderate`: Include some near-duplicates with higher confidence
  - `aggressive`: Suggest more complex pattern extractions

## Examples

### Basic usage (current file, conservative)
```
/extract-duplication
```
Analyzes only the current file for obvious duplication patterns.

### Scope expansion (entire codebase)
```
/extract-duplication --scope all --confidence moderate
```
Scans all files and suggests moderate-confidence extractions.

### Conservative approach
```
/extract-duplication --scope current-file --confidence conservative
```
Only suggests the safest, most obvious duplications to extract.

## What you'll see

```
🔍 Analyzing code for duplication patterns...

Found 3 duplication opportunities:

1. [HIGH CONFIDENCE] Validation logic repeated in 4 files
   📍 Locations: auth.js:45-52, user-service.js:78-85, admin.js:112-119, api.js:234-241
   💡 Suggestion: Extract to shared validation utility
   📦 New file: src/utils/validation.js
   ⚠️  Risk: Low - pure function with no side effects

2. [MEDIUM CONFIDENCE] API error handling pattern
   📍 Locations: api-client.js:89-98, data-service.js:156-165
   💡 Suggestion: Create error handling wrapper
   📦 New method: ApiClient.handleError()
   ⚠️  Risk: Medium - requires understanding error propagation

3. [HIGH CONFIDENCE] Date formatting logic
   📍 Locations: 3 components
   💡 Suggestion: Extract to date utility function
   📦 New function: formatDate(date, format)
   ⚠️  Risk: Low - deterministic transformation

Extract these 3 opportunities? (yes/no/details)
```

## Best practices

- Start with `--confidence conservative` to build trust
- Use `--scope current-file` for targeted refactoring
- Review tests after extraction to ensure behavior is preserved
- Commit changes before bulk extraction for easy rollback
- Focus on business logic duplication rather than trivial patterns

## Limitations

- Does not modify external dependencies
- Preserves existing function signatures unless safe to change
- Requires type information in typed languages for safety
- May not detect semantic duplication (same logic, different implementation)

## See also

- `/modernize-code`: Update outdated syntax and patterns
- `/apply-pattern`: Apply design patterns to improve structure
- `/analyze-refactor-opportunities`: Comprehensive refactoring analysis
