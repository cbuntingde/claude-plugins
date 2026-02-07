---
description: Check the trustworthiness and status of package maintainers
usage: "/maintainer-status <package-name>[@version]"
examples:
  - "/maintainer-status axios"
  - "/maintainer-status express@4.18.0"
arguments:
  - name: package-name
    description: Package name to check maintainer for
    required: true
---

# Maintainer Status

Investigate package maintainer trustworthiness, activity, and potential risks.

## Why Maintainer Status Matters

The 2023 `colors` and `faker` incidents showed what happens when maintainers lose interest or act maliciously. This command helps you:

- Detect **abandoned packages** before you depend on them
- Identify **maintainer turnover** after acquisitions
- Track **response times** for security issues
- Evaluate **multipackage risk** (same maintainer across many packages)

## Tracked Metrics

### Account Health
- npm account age
- Last publish date
- Recent commit activity
- GitHub account status

### Responsiveness
- Issue response time (average & median)
- PR review time
- Security advisory response
- Release cadence

### Portfolio Risk
- Number of packages maintained
- Concentration risk (too many packages)
- Package diversity (all same type?)
- Co-maintainer presence

### Corporate Changes
- Employment changes
- Company acquisitions
- Repository transfers
- TOS updates

## Example Output

```
👤 MAINTAINER STATUS: axios@1.5.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PROFILE: axios (Nick Zaparyniuk)
├─ npm age: 7 years
├─ Packages: 3 (axios, axios-curlirize, axios-logger)
├─ Last publish: 3 days ago
└─ GitHub: github.com/axios/axios (verified ✓)

🟢 ACTIVITY: HEALTHY
├─ Avg issue response: 6 hours
├─ Avg PR merge time: 2 days
├─ Releases: 4-5 per month
└─ Last security fix: 48 hours after CVE report

🎯 PORTFOLIO: LOW RISK
├─ Maintains 3 packages (manageable)
├─ Has 2 co-maintainers on axios
├─ All packages actively maintained
└─ No abandoned packages in history

🏢 CORPORATE STATUS: INDEPENDENT
├─ No recent acquisitions
├─ MIT license (stable)
├─ Repository owned by org (not individual)
└─ Transfer risk: LOW

⚠️  FLAGS: NONE DETECTED

🎯 OVERALL ASSESSMENT: TRUSTED
   This maintainer has a strong track record.
   Safe to use with confidence.
```

## Risk Flags

🔴 **CRITICAL FLAGS**
- Account deleted or suspended
- No commits in 2+ years
- Malicious code published
- All packages abandoned

🟡 **WARNING FLAGS**
- No response to critical issues in 30+ days
- Maintainer employed by company with poor track record
- Maintaining 50+ packages (burnout risk)
- Single maintainer (bus factor risk)

🟢 **POSITIVE SIGNALS**
- Quick security response (<48 hours)
- Multiple active maintainers
- Corporate backing
- Regular releases

## Acquisition Tracking

We track major acquisitions that affected package maintenance:

```
🏢 RECENT ACQUISITIONS (last 12 months)
├─ npm packages by Microsoft (npm, @azure scopes)
├─ Jest by Facebook/Meta (status: unaffected)
├─ Babel by OpenJS Foundation (status: improved)
└─ webpack by JS Foundation (status: stable)
```

## Maintainer Vetting Checklist

Before adding a new dependency:
1. [ ] Maintainer has published within last 6 months
2. [ ] Has response time < 1 week for issues
3. [ ] Has at least one co-maintainer
4. [ ] No abandoned packages in history
5. [ ] License hasn't changed recently
6. [ ] Repository activity in last month

## Historical Incidents

We maintain a database of maintainer-related incidents:

- **Jan 2023**: `colors` and `faker` maintainer pushed malicious updates
- **Nov 2021**: `ua-parser-js` maintainer account compromised
- **Mar 2021**: `event-stream` compromised via dependency injection
- **Sep 2020**: `eslint-scope` maintainer added malicious code

## Alternatives for Risky Maintainers

When high-risk maintainers are detected, we suggest:
- Community forks (if available)
- Alternative packages with similar functionality
- Wait-and-see approach (monitor for 30 days)

## See Also

- `/check-package` - Full package safety check
- `/scan-dependencies` - Scan all dependencies for maintainer issues
