---
description: Validate staged changes against architecture rules
---

# /validate-commit

Validate staged changes against architecture rules before committing.

## Usage

```
/validate-commit [strict]
```

## Arguments

- **strict** (optional) - Fail validation on any violation (default: `true`)

## What It Does

Validates only the files that are staged for commit, providing fast incremental checks:

1. **Changed Files Only** - Analyzes only files in git staging area
2. **Fast Validation** - Quick checks optimized for pre-commit hooks
3. **Incremental** - Doesn't re-analyze unchanged code
4. **Commit Blocking** - Blocks commit if violations found (in strict mode)

## Checks Performed

- Absolute imports that bypass module boundaries
- Multi-level relative imports (may skip layers)
- Test files in production directories
- Large index files (potential coupling)
- Domain layer importing from infrastructure
- Direct database imports outside data layer

## Examples

```bash
# Validate with strict mode (default)
/validate-commit

# Validate without blocking commit
/validate-commit false

# Set environment variable for non-strict mode
STRICT_MODE=false /validate-commit
```

## Integration with Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Run architecture gatekeeper
CLAUDE_PLUGIN_ROOT=/path/to/plugin ./validate-commit.sh
```

Or use with husky:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "CLAUDE_PLUGIN_ROOT=./plugins/architecture-gatekeeper ./plugins/architecture-gatekeeper/scripts/validate-commit.sh"
    }
  }
}
```

## Output

```
╔════════════════════════════════════════════════════════════════╗
║              ARCHITECTURE COMMIT VALIDATION                   ║
╠════════════════════════════════════════════════════════════════╣
║  Files Checked: 3                                              ║
║  Files with Violations: 1                                      ║
║  Total Violations: 2                                           ║
║  Strict Mode: ENABLED                                          ║
╠════════════════════════════════════════════════════════════════╣
║  Status: FAIL (Architecture violations detected)               ║
╠════════════════════════════════════════════════════════════════╣
║  COMMIT BLOCKED - Fix violations before committing             ║
╠════════════════════════════════════════════════════════════════╣
║  FILE: src/services/auth.service.ts                           ║
║  VIOLATIONS:                                                   ║
║    - Direct database import outside data layer                 ║
║    - Uses multi-level relative import (may skip layers)        ║
╚════════════════════════════════════════════════════════════════╝

To bypass temporarily (not recommended):
  git commit --no-verify

Or disable strict mode:
  export STRICT_MODE=false
```

## Bypassing

If you need to bypass temporarily:

```bash
# Bypass for a single commit
git commit --no-verify

# Disable strict mode
export STRICT_MODE=false
```

## Exit Codes

- `0` - No violations found
- `1` - Violations detected (and strict mode enabled)
