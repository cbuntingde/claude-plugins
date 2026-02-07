# Consent Validate

Validate consent management implementation against GDPR Article 7 requirements, ensuring lawful, specific, informed, and unambiguous consent collection.

## Usage

```bash
/consent-validate [options]
```

## Options

- `--consent-types` - Consent types to check (marketing, analytics, cookies, all). Default: `all`
- `--check-ui` - Validate consent UI/UX implementation
- `--check-storage` - Validate consent record storage
- `--check-withdrawal` - Validate consent withdrawal mechanism
- `--check-age` - Validate age verification where required
- `--strict` - Fail on any consent violation

## GDPR Article 7 Requirements

### Conditions for Consent
1. **Lawful Processing** - Consent must be a lawful basis for processing
2. **Specific** - Consent must be given for specific, distinct purposes
3. **Informed** - Data subject must be informed of processing purposes
4. **Unambiguous** - Clear affirmative action required
5. **Freely Given** - No coercion, no undue pressure
6. **Demonstrable** - Controller must be able to demonstrate consent

### Right to Withdraw
- Data subjects have right to withdraw consent at any time
- Withdrawal must be as easy as giving consent
- Must be informed of right to withdraw before giving consent

## What It Checks

### Consent Collection

```javascript
// VULNERABLE - Implicit consent
document.addEventListener('load', () => {
  enableCookies(); // No consent obtained
});

// VULNERABLE - Pre-checked boxes
<input type="checkbox" checked id="marketing-consent" />

// VULNERABLE - Bundled consent
<form>
  <label>
    <input type="checkbox" id="terms" />
    I agree to terms, conditions, and marketing emails
  </label>
</form>

// SECURE - Opt-in with granularity
<form id="consent-form">
  <fieldset>
    <legend>Consent Preferences</legend>
    <label>
      <input type="checkbox" name="essential" checked disabled />
      Essential cookies (required)
    </label>
    <label>
      <input type="checkbox" name="analytics" />
      Analytics cookies
    </label>
    <label>
      <input type="checkbox" name="marketing" />
      Marketing communications
    </label>
  </fieldset>
  <button type="submit">Accept Selected</button>
  <button type="button" id="accept-all">Accept All</button>
  <button type="button" id="reject-all">Reject All</button>
</form>
```

### Consent Storage

```javascript
// SECURE - Consent record structure
const consentRecord = {
  id: uuid(),
  userId: user.id,
  consentType: 'marketing',
  purpose: 'email_newsletter',
  givenAt: new Date().toISOString(),
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  policyVersion: '2.1',
  withdrawnAt: null,
  granularity: ['email', 'sms'],
  lawfulBasis: 'consent'
};

await database.consents.insert(consentRecord);
```

### Consent Withdrawal

```javascript
// SECURE - Easy withdrawal mechanism
app.post('/consent/withdraw', async (req, res) => {
  const { consentType, userId } = req.body;

  await database.consents.update(
    { userId, consentType, withdrawnAt: null },
    { withdrawnAt: new Date() }
  );

  // Stop processing based on withdrawn consent
  await stopProcessing(userId, consentType);

  res.json({ message: 'Consent withdrawn successfully' });
});
```

### Cookie Consent

```html
<!-- SECURE - Cookie banner implementation -->
<div id="cookie-banner" class="cookie-banner">
  <div class="cookie-content">
    <h3>Cookie Preferences</h3>
    <p>We use cookies to improve your experience. Please choose which cookies you consent to:</p>
    <form id="cookie-consent-form">
      <label class="cookie-option">
        <input type="checkbox" name="essential" checked disabled>
        Essential (Required)
      </label>
      <label class="cookie-option">
        <input type="checkbox" name="analytics">
        Analytics
      </label>
      <label class="cookie-option">
        <input type="checkbox" name="marketing">
        Marketing
      </label>
      <button type="submit" class="btn-save">Save Preferences</button>
      <button type="button" class="btn-accept-all">Accept All</button>
      <button type="button" class="btn-reject-all">Reject All</button>
    </form>
    <a href="/privacy-policy" class="link-policy">Privacy Policy</a>
    <a href="/consent-preferences" class="link-manage">Manage Preferences</a>
  </div>
</div>
```

## Examples

### Validate all consent types
```bash
/consent-validate
```

### Check cookie consent only
```bash
/consent-validate --consent-types cookies
```

### Full consent validation
```bash
/consent-validate --check-ui --check-storage --check-withdrawal --check-age
```

### Generate consent report
```bash
/consent-validate --consent-types marketing,analytics --report
```

## Output

```
Consent Management Validation Report
=====================================

Evaluation Date: 2025-01-20
GDPR Article: Article 7 - Conditions for Consent

Overall Status: NON-COMPLIANT
Compliance Score: 68%

Critical Issues:
┌────────────────────────────────────────────────────────────────────────────┐
│ Rule: Granular Consent                                                     │
│ File: src/components/ConsentModal.tsx:45                                   │
│ Severity: CRITICAL                                                          │
│ Issue: Bundled consent detected                                            │
│ Description: Consent for terms and marketing collected together           │
│ GDPR Violation: Article 7(2) - Consent must be granular                   │
│ Impact: Invalid consent, potential fines up to 20M EUR or 4% revenue       │
│ Fix: Separate consent into distinct, granular options                      │
└────────────────────────────────────────────────────────────────────────────┘

High Priority:
┌────────────────────────────────────────────────────────────────────────────┐
│ Rule: Easy Withdrawal                                                      │
│ File: src/api/consent.ts:89                                                │
│ Severity: HIGH                                                             │
│ Issue: Withdrawal requires contacting support                             │
│ Description: Users cannot withdraw consent themselves                     │
│ GDPR Violation: Article 7(3) - Withdrawal must be as easy as giving       │
│ Impact: Violation of right to withdraw consent                            │
│ Fix: Implement self-service consent withdrawal in user settings          │
└────────────────────────────────────────────────────────────────────────────┘

Medium Priority:
┌────────────────────────────────────────────────────────────────────────────┐
│ Rule: Consent Record-Keeping                                               │
│ File: src/services/ConsentService.ts:156                                   │
│ Severity: MEDIUM                                                           │
│ Issue: Consent records lack timestamp and policy version                  │
│ Description: Cannot demonstrate when consent was given or under which policy │
│ GDPR Violation: Article 7(1) - Controller must demonstrate consent        │
│ Fix: Add consent timestamp, policy version, IP address to records         │
└────────────────────────────────────────────────────────────────────────────┘

Passed Checks:
├── ✓ No pre-checked consent boxes detected
├── ✓ Affirmative action required for consent
├── ✓ Consent information link provided
├── ✓ Privacy notice accessible before consent
└── ✓ Consent options clearly separated

Recommendations:
1. Implement granular consent checkboxes for each processing purpose
2. Add self-service consent management in user settings
3. Enhance consent records with full audit trail
4. Implement consent versioning and migration
5. Add consent dashboard for users to review all consents
```

## Consent Management Best Practices

### UI/UX Guidelines

1. **Clear Language** - Use plain, non-legalistic language
2. **Granular Options** - Separate checkboxes for each purpose
3. **No Pre-checking** - Boxes must be unchecked by default
4. **Easy Withdrawal** - Link to manage preferences on every page
5. **Information Access** - Privacy policy link on consent screen
6. **Layered Information** - Summary with "Learn More" options

### Technical Implementation

```javascript
// Consent state management
class ConsentManager {
  constructor() {
    this.consents = new Map();
  }

  // Record consent with full audit trail
  async recordConsent(userId, consentType, preferences, context) {
    const record = {
      id: generateId(),
      userId,
      consentType,
      preferences,
      givenAt: new Date(),
      policyVersion: getCurrentPolicyVersion(),
      ipAddress: context.ip,
      userAgent: context.userAgent,
      referrer: context.referrer,
      withdrawnAt: null
    };

    await this.storage.save(record);
    this.consents.set(`${userId}:${consentType}`, record);

    return record;
  }

  // Check if consent exists and is valid
  hasValidConsent(userId, consentType) {
    const consent = this.consents.get(`${userId}:${consentType}`);
    return consent && !consent.withdrawnAt;
  }

  // Withdraw consent
  async withdrawConsent(userId, consentType) {
    const consent = this.consents.get(`${userId}:${consentType}`);
    if (consent) {
      consent.withdrawnAt = new Date();
      await this.storage.update(consent);
      await this.stopProcessing(userId, consentType);
    }
  }

  // Get all user consents
  getUserConsents(userId) {
    return Array.from(this.consents.values())
      .filter(c => c.userId === userId);
  }
}
```

### Database Schema

```sql
CREATE TABLE consents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  consent_type VARCHAR(50) NOT NULL,
  preferences JSONB NOT NULL,
  given_at TIMESTAMPTZ NOT NULL,
  policy_version VARCHAR(20) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  withdrawn_at TIMESTAMPTZ,
  INDEX idx_user_consents (user_id, consent_type),
  INDEX idx_consent_dates (given_at, withdrawn_at)
);
```

## Testing Consent Implementation

```javascript
// Test consent flow
describe('Consent Management', () => {
  it('should require affirmative action for consent', async () => {
    const response = await request(app)
      .post('/api/consent/marketing')
      .send({ consent: false });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Affirmative consent required');
  });

  it('should record consent with timestamp', async () => {
    const response = await request(app)
      .post('/api/consent/marketing')
      .send({ consent: true, userId: 'user-123' });

    expect(response.status).toBe(201);
    expect(response.body.givenAt).toBeDefined();
  });

  it('should allow easy withdrawal', async () => {
    const response = await request(app)
      .post('/api/consent/withdraw')
      .send({ consentType: 'marketing', userId: 'user-123' });

    expect(response.status).toBe(200);
    expect(response.body.withdrawnAt).toBeDefined();
  });
});
```
