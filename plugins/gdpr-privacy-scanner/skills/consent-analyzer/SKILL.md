---
description: Consent mechanism validation and GDPR Article 7 compliance analysis
capabilities: ["consent_detection", "consent_validation", "granularity_check", "withdrawal_verification"]
---

# Consent Analyzer Skill

Analyzes consent management implementations against GDPR Article 7 requirements, validating that consent is freely given, specific, informed, and unambiguous.

## GDPR Article 7 Requirements

### Conditions for Valid Consent

1. **Freely Given** - No coercion, no undue pressure, genuine choice
2. **Specific** - Granular consent for distinct purposes
3. **Informed** - Clear information on processing purposes
4. **Unambiguous** - Clear affirmative action (opt-in)

### Right to Withdraw
- Must be as easy as giving consent
- Can be withdrawn at any time
- Must be informed of right before consent

## Detection Capabilities

### Consent Collection Checks
- [x] **No pre-checked boxes** - All checkboxes unchecked by default
- [x] **Affirmative action** - Explicit user action required
- [x] **Granular options** - Separate consent for each purpose
- [x] **Clear information** - Purpose explanation provided
- [x] **No bundling** - Consent not bundled with other terms

### Consent Storage Validation
- [x] **Timestamp recorded** - When consent was given
- [x] **Policy version** - Which policy version was agreed to
- [x] **IP address** - Recording of request source
- [x] **User agent** - Browser/device information
- [x] **Consent ID** - Unique identifier for consent record

### Withdrawal Mechanism Checks
- [x] **Easy access** - "Manage Consent" always available
- [x] **Self-service** - Users can withdraw themselves
- [x] **As easy as giving** - Same level of effort
- [x] **Immediate effect** - Withdrawal processed promptly
- [x] **Clear feedback** - Confirmation of withdrawal

## Analysis Patterns

### Detecting Invalid Consent

```javascript
// VULNERABLE - Pre-checked box
<input type="checkbox" checked id="marketing-consent" />

// VULNERABLE - Bundled consent
<label>
  <input type="checkbox" id="terms" />
  I agree to terms, privacy policy, and marketing emails
</label>

// VULNERABLE - Implicit consent
useEffect(() => {
  enableCookies(); // No consent obtained
}, []);

// SECURE - Opt-in with granularity
<form>
  <label>
    <input type="checkbox" name="essential" checked disabled />
    Essential cookies
  </label>
  <label>
    <input type="checkbox" name="analytics" />
    Analytics
  </label>
  <label>
    <input type="checkbox" name="marketing" />
    Marketing
  </label>
  <button type="submit">Accept Selected</button>
  <button type="button">Reject All</button>
</form>
```

### Valid Consent Structure

```typescript
interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'marketing' | 'analytics' | 'cookies';
  purpose: string;
  givenAt: Date;
  ipAddress: string;
  userAgent: string;
  policyVersion: string;
  withdrawnAt: Date | null;
}

const recordConsent = async (
  user: User,
  consentType: string,
  preferences: Record<string, boolean>
): Promise<ConsentRecord> => {
  return await db.consents.insert({
    id: uuid(),
    userId: user.id,
    consentType,
    purpose: getPurposeDescription(consentType),
    givenAt: new Date(),
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
    policyVersion: '2.1',
    withdrawnAt: null
  });
};
```

## Common Violations

### Critical
1. **Pre-checked consent boxes** - Consent must be opt-in
2. **No granular options** - Bundled consent is invalid
3. **No withdrawal mechanism** - Violates Article 7(3)
4. **Implicit consent** - No affirmative action taken

### High
5. **Hard to withdraw** - Withdrawal more difficult than giving consent
6. **Missing consent timestamp** - Cannot demonstrate when consent given
7. **No policy version** - Unclear which terms were agreed to
8. **Unclear purpose** - Data subjects not informed of usage

### Medium
9. **No "Reject All"** - Pressure to accept all cookies
10. **Dark patterns** - UI design nudging toward consent
11. **No consent link** - Privacy notice not easily accessible

## Cookie Consent (ePrivacy Directive)

### Requirements
- Banner appears before any cookies are set
- Granular options for each cookie category
- "Reject All" option prominent and accessible
- Privacy policy and cookie policy links provided
- Consent persists across sessions
- Easy withdrawal (Manage Cookies link in footer)

### Cookie Categories

| Category | Consent Required | Description |
|----------|------------------|-------------|
| **Essential** | No | Required for site to function |
| **Performance** | Yes | Analytics, load balancing |
| **Functionality** | Yes | Preferences, language settings |
| **Targeting** | Yes | Advertising, personalization |
| **Social Media** | Yes | Social sharing widgets |

### Cookie Consent Implementation

```html
<!-- GDPR-compliant cookie banner -->
<div id="cookie-banner">
  <h2>Cookie Preferences</h2>
  <p>We use cookies to improve your experience. Please choose which cookies you accept.</p>
  <p>
    <a href="/privacy-policy">Privacy Policy</a> |
    <a href="/cookie-policy">Cookie Policy</a>
  </p>

  <form id="cookie-consent">
    <label>
      <input type="checkbox" name="essential" checked disabled />
      Essential (Required)
    </label>
    <label>
      <input type="checkbox" name="analytics" />
      Analytics
    </label>
    <label>
      <input type="checkbox" name="marketing" />
      Marketing
    </label>
    <button type="submit">Accept Selected</button>
    <button type="button" id="reject-all">Reject All</button>
  </form>
</div>

<script>
// Only load tracking scripts after consent
document.getElementById('cookie-consent').addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const consent = {
    essential: true,
    analytics: formData.get('analytics') === 'on',
    marketing: formData.get('marketing') === 'on'
  };

  // Save consent
  localStorage.setItem('cookie_consent', JSON.stringify(consent));

  // Load scripts based on consent
  if (consent.analytics) loadAnalytics();
  if (consent.marketing) loadMarketing();

  // Hide banner
  document.getElementById('cookie-banner').style.display = 'none';
});
</script>
```

## Best Practices

1. **Always Opt-In** - Never pre-check consent boxes
2. **Granular Options** - Separate checkboxes for each purpose
3. **Clear Language** - Plain, non-legalistic descriptions
4. **Easy Withdrawal** - "Manage Consent" always accessible
5. **Record Everything** - Timestamp, IP, policy version
6. **Honor Preferences** - Respect choices across sessions
7. **Regular Review** - Update consent when processing changes
8. **No Dark Patterns** - Avoid manipulative UI design
9. **Inform First** - Privacy notice before consent
10. **Document Choices** - Maintain audit trail of consents
