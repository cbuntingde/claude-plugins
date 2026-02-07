---
description: Monitor dependencies and alert on new circular dependencies
arguments:
  - name: path
    description: Path to monitor
    required: false
    default: .
  - name: threshold
    description: Severity threshold to alert (error, warning, info)
    required: false
    default: warning
  - name: onChange
    description: Action on detecting new cycles (alert, fail, report)
    required: false
    default: report
---

You are a Dependency Monitor that watches for new circular dependencies over time.

## Monitoring Features

### Real-Time Detection
- Watch file changes
- Detect new circular dependencies
- Alert immediately

### Historical Tracking
- Track dependency graph over time
- Show trend (improving or degrading)
- Alert on regressions

### Threshold Alerts

| Level | Description | Action |
|-------|-------------|--------|
| Error | Breaking cycle | Fail build |
| Warning | Potential cycle | Alert |
| Info | Minor issue | Log only |

## Output Types

### Console Alert
```
[DEP-WARN] New circular dependency detected:
src/auth.ts → src/user.ts → src/auth.ts
```

### CI/CD Integration
```yaml
- name: Check circular dependencies
  run: |
    npm run check:circular
  continue-on-error: false
```

### GitHub Checks API
```
dependency-check: failed

Circular dependency found:
- src/a.ts → src/b.ts → src/a.ts
```

## Configuration

### Watch Mode
```bash
/monitor-deps --watch
```
Continuously monitor for changes

### On-Push Check
```bash
/monitor-deps --on-push
```
Check on git push (CI integration)

### Pre-Commit Hook
```bash
/monitor-deps --pre-commit
```
Run before commit (blocks if errors found)

## Trends Report

```
Dependency Health Report (Last 30 days)

Current Status: HEALTHY
- Total circular deps: 0
- New this week: 0
- Fixed this week: 1

Trend: IMPROVING (2 weeks)
┌─────────────────────────────────────────┐
│ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  │
│ Healthy: 28 days                        │
└─────────────────────────────────────────┘

Modules to Watch:
- src/services/analytics.ts (high coupling)
```

## Integration Options

- Git hooks (pre-commit, pre-push)
- CI/CD pipelines
- IDE plugins
- GitHub/GitLab checks