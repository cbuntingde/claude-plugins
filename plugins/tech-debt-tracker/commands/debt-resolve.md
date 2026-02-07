---
description: Mark technical debt issues as resolved or track progress
usage: /debt-resolve <issue-id> [--resolution-fixed|refactored|documented|deferred] [--notes=""]
examples:
  - /debt-resolve TD-001 --resolution=refactored
  - /debt-resolve TD-015 --resolution=documented --notes="Accepted as technical limitation"
---

# Debt Resolve

Track resolution of technical debt issues and maintain history of refactoring efforts.

## Features

- Mark issues as resolved with specific resolution types
- Add notes and justification for resolution decisions
- Link to commits/PRs that address the debt
- Track deferred items with reasons
- Generate resolution metrics and reports

## Parameters

- `issue-id`: Technical debt issue identifier (e.g., TD-001)
- `--resolution`: How the issue was resolved
  - `fixed`: Bug fixed without refactoring
  - `refactored`: Code properly refactored
  - `documented`: Documented as acceptable technical limitation
  - `deferred`: Intentionally deferred with justification
  - `false-positive`: Not actually a debt item
- `--notes`: Additional notes about the resolution
- `--link`: Link to commit/PR (optional)

## Resolution Tracking

Each resolution records:
- Resolution date and author
- Resolution type
- Notes and justification
- Linked commits/PRs
- Time spent on resolution
- Verification status

## Resolution Types Explained

### Fixed
The issue was resolved with a minimal fix rather than full refactoring.
- Use when: Time constraints prevent proper refactor
- Follow-up: Schedule refactoring for later

### Refactored
The code was properly refactored to eliminate the debt.
- Use when: Root cause addressed
- Best practice: Preferred resolution type

### Documented
The issue was documented as an accepted technical limitation.
- Use when: Fix cost outweighs benefit
- Requirement: Business justification required

### Deferred
The issue was intentionally deferred with a plan to address later.
- Use when: Not currently critical
- Follow-up: Add to backlog with priority

### False Positive
The item was flagged but is not actually technical debt.
- Use when: Analysis was incorrect
- Action: Update scanning rules

## Example Usage

```
/debt-resolve TD-042 --resolution=refactored --notes="Extracted authentication logic into AuthService. Added unit tests."

/debt-resolve TD-087 --resolution=deferred --notes="Depends on payment gateway migration. Revisit in Q2."

/debt-resolve TD-123 --resolution=documented --notes="Circular dependency required for legacy compatibility. Documented in ARCHITECTURE.md"
```

## Resolution Metrics

Track team performance:
- Resolution rate (issues resolved per sprint)
- Average time to resolution
- Resolution type distribution
- Deferred item follow-up rate

## Example Output

```
✅ Debt Issue Resolved

Issue: TD-042 - UserController.authenticate() complexity
Resolution: Refactored
Date: 2024-01-15
Author: chris

Notes: Extracted authentication logic into AuthService. Added unit tests.
Link: https://github.com/repo/pull/123

📊 Resolution Metrics
─────────────────────────
Total Resolved: 45
This Week: 8
This Month: 23
Resolution Rate: 78% (45/58 issues)

By Type:
  • Refactored: 28 (62%) ✨
  • Fixed: 10 (22%)
  • Documented: 4 (9%)
  • Deferred: 3 (7%)

Next Steps:
  • Review TD-087 (deferred) - scheduled for Q2
  • Address TD-156 (high priority) - blocking feature work
```
