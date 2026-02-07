---
description: Create a comprehensive migration plan for framework upgrades or language translations
arguments:
  - name: source
    description: Current framework/version or programming language (e.g., "react 17", "python 2.7", "javascript")
    required: true
  - name: target
    description: Target framework/version or programming language (e.g., "react 18", "python 3.12", "typescript")
    required: true
  - name: scope
    description: Specific directories or files to analyze (default: entire codebase)
    required: false
examples:
  - "/migrate-plan react 17 react 18"
  - "/migrate-plan python 2.7 python 3.12 --scope ./src"
  - "/migrate-plan javascript typescript"
---

# /migrate-plan

Generate a comprehensive, step-by-step migration plan for upgrading frameworks or translating code between languages.

## What it does

This command analyzes your codebase and creates a detailed migration strategy including:

- **Dependency analysis**: Identifies packages/libs that need updates
- **Breaking changes**: Highlights API changes and deprecations
- **Code patterns**: Finds patterns that need manual intervention
- **Risk assessment**: Categorizes changes by complexity and risk
- **Step-by-step guide**: Provides ordered migration steps
- **Rollback plan**: Defines fallback strategies

## How to use

```
/migrate-plan <source> <target> [--scope <path>]
```

### Examples

**Framework upgrade:**
```
/migrate-plan react 17 react 18
```

**Language version upgrade:**
```
/migrate-plan python 2.7 python 3.12
```

**Language translation:**
```
/migrate-plan javascript typescript
```

**Scoped analysis:**
```
/migrate-plan next.js 12 next.js 14 --scope ./app
```

## Output

The command generates a migration plan document with:

1. **Executive Summary**
   - Overview of changes
   - Estimated effort level
   - Recommended timeline

2. **Prerequisites**
   - Required tools and dependencies
   - Backup recommendations
   - Testing setup requirements

3. **Detailed Changes**
   - Breaking changes with impact levels
   - Deprecated features to replace
   - New features to adopt

4. **Migration Steps**
   - Ordered checklist of actions
   - Code samples for common migrations
   - Testing validation points

5. **Risk Matrix**
   - High/medium/low risk areas
   - Recommended rollback strategies

## Tips

- Run this command **before** starting any migration
- Save the output to a file for reference: `/migrate-plan react 17 react 18 > migration-plan.md`
- Review the risk matrix to prioritize testing efforts
- Use with `/migrate-check` to validate specific files
