# Cookie Consent Check

Validate cookie consent implementation against GDPR and ePrivacy Directive requirements, ensuring proper user consent for non-essential cookies and tracking technologies.

## Usage

```bash
/cookie-consent-check [options]
```

## Options

- `--domain` - Specific domain to check
- `--scan-cookies` - Scan website for cookies being set
- `--check-banner` - Validate cookie banner UI/UX
- `--check-preferences` - Validate preference management
- `--check-withdrawal` - Validate consent withdrawal mechanism
- `--check-third-party` - Check third-party cookie compliance
- `--strict` - Fail on any cookie consent violation

## Legal Requirements

### GDPR Article 4(11) - Consent Definition

> Any freely given, specific, informed and unambiguous indication of the data subject's wishes by which he or she, by a statement or by a clear affirmative action, signifies agreement to the processing of personal data relating to him or her.

### ePrivacy Directive (2002/58/EC)

**Article 5(3)**: Member states shall ensure that the storing of information, or the gaining of access to information already stored, in the user's terminal equipment, is only allowed on condition that the user concerned has given their consent, having been provided with clear and comprehensive information.

### Cookie Categories

| Category | Description | Consent Required |
|----------|-------------|------------------|
| **Strictly Necessary** | Essential for site to function (shopping cart, security) | No |
| **Performance** | Analytics, load balancing (no personal data) | Yes |
| **Functionality** | Preferences, language, regional settings | Yes |
| **Targeting** | Advertising, tracking, personalization | Yes |
| **Social Media** | Social sharing widgets, embedded content | Yes |

## What It Checks

### Cookie Banner Implementation

```html
<!-- COMPLIANT Cookie Banner -->
<div id="cookie-banner" class="cookie-banner" role="dialog" aria-labelledby="cookie-title">
  <div class="cookie-content">
    <h2 id="cookie-title">Cookie Preferences</h2>
    <p>
      We use cookies to improve your experience. You can choose which cookies
      you accept. For more information, see our
      <a href="/privacy-policy">Privacy Policy</a> and
      <a href="/cookie-policy">Cookie Policy</a>.
    </p>

    <form id="cookie-consent-form">
      <!-- Strictly Necessary - Always enabled -->
      <div class="cookie-category">
        <label>
          <input type="checkbox" name="essential" checked disabled>
          <span>Strictly Necessary</span>
          <small>Required for the site to function</small>
        </label>
      </div>

      <!-- Analytics Cookies - Opt-in -->
      <div class="cookie-category">
        <label>
          <input type="checkbox" name="analytics">
          <span>Analytics</span>
          <small>Help us improve our website</small>
        </label>
        <a href="#" class="view-more">View cookies</a>
      </div>

      <!-- Marketing Cookies - Opt-in -->
      <div class="cookie-category">
        <label>
          <input type="checkbox" name="marketing">
          <span>Marketing</span>
          <small>Used for advertising personalization</small>
        </label>
        <a href="#" class="view-more">View cookies</a>
      </div>

      <!-- Actions -->
      <div class="cookie-actions">
        <button type="button" class="btn-accept-selected">Accept Selected</button>
        <button type="button" class="btn-accept-all">Accept All</button>
        <button type="button" class="btn-reject-all">Reject All</button>
      </div>
    </form>

    <div class="cookie-footer">
      <a href="/cookie-preferences">Manage Preferences</a>
      <a href="/privacy-policy">Privacy Policy</a>
    </div>
  </div>
</div>
```

### Cookie Consent JavaScript

```javascript
// COMPLIANT Cookie Consent Manager
class CookieConsentManager {
  constructor() {
    this.consent = this.loadConsent();
    this.categories = {
      essential: {
        required: true,
        cookies: ['session_id', 'csrf_token']
      },
      analytics: {
        required: false,
        cookies: ['_ga', '_gid', '_gat'],
        scripts: ['https://www.googletagmanager.com/gtag/js']
      },
      marketing: {
        required: false,
        cookies: ['_fbp', 'fr', 'ads_id'],
        scripts: [
          'https://connect.facebook.net/en_US/fbevents.js',
          'https://www.googleadservices.com/pagead/conversion.js'
        ]
      }
    };
  }

  // Check if consent exists
  hasConsent() {
    return this.consent !== null;
  }

  // Load consent from localStorage or cookie
  loadConsent() {
    const stored = localStorage.getItem('cookie_consent');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  }

  // Save consent
  saveConsent(consentChoices) {
    const consentRecord = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      choices: consentChoices,
      policyVersion: document.querySelector('meta[name="cookie-policy-version"]')?.content
    };

    this.consent = consentRecord;
    localStorage.setItem('cookie_consent', JSON.stringify(consentRecord));

    // Set consent cookie for server-side access
    document.cookie = `cookie_consent=${encodeURIComponent(JSON.stringify(consentChoices))}; path=/; max-age=365; SameSite=Lax`;

    // Apply consent
    this.applyConsent(consentChoices);

    return consentRecord;
  }

  // Apply user's consent choices
  applyConsent(consentChoices) {
    for (const [category, enabled] of Object.entries(consentChoices)) {
      if (enabled) {
        this.enableCategory(category);
      } else {
        this.disableCategory(category);
      }
    }
  }

  // Enable a cookie category
  enableCategory(category) {
    const config = this.categories[category];
    if (!config) return;

    // Load scripts for this category
    if (config.scripts) {
      config.scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.consent = category;
        document.head.appendChild(script);
      });
    }

    // Initialize tracking
    if (category === 'analytics' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }

    if (category === 'marketing') {
      if (window.gtag) {
        window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
        });
      }
      if (window.fbq) {
        window.fbq('consent', 'grant');
      }
    }
  }

  // Disable a cookie category
  disableCategory(category) {
    const config = this.categories[category];
    if (!config || config.required) return;

    // Remove cookies
    if (config.cookies) {
      config.cookies.forEach(cookieName => {
        this.deleteCookie(cookieName);
      });
    }

    // Remove scripts
    document.querySelectorAll(`script[data-consent="${category}"]`)
      .forEach(script => script.remove());

    // Update consent
    if (category === 'analytics' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }

    if (category === 'marketing') {
      if (window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }
      if (window.fbq) {
        window.fbq('consent', 'revoke');
      }
    }
  }

  // Delete a cookie
  deleteCookie(name) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${name}=; path=/; domain=.${window.location.hostname}; max-age=0`;
  }

  // Check if category is enabled
  isCategoryEnabled(category) {
    return this.consent?.choices?.[category] === true;
  }

  // Show consent banner
  showBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.setAttribute('aria-hidden', 'false');
    }
  }

  // Hide consent banner
  hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'none';
      banner.setAttribute('aria-hidden', 'true');
    }
  }

  // Reset consent (for testing or withdrawal)
  resetConsent() {
    localStorage.removeItem('cookie_consent');
    this.deleteCookie('cookie_consent');
    this.consent = null;

    // Remove all non-essential cookies
    Object.entries(this.categories).forEach(([category, config]) => {
      if (!config.required) {
        this.disableCategory(category);
      }
    });

    this.showBanner();
  }
}

// Initialize
const cookieManager = new CookieConsentManager();

// Show banner if no consent
if (!cookieManager.hasConsent()) {
  document.addEventListener('DOMContentLoaded', () => {
    cookieManager.showBanner();
  });
}

// Setup form handlers
document.addEventListener('DOMContentLoaded', () => {
  const consentForm = document.getElementById('cookie-consent-form');

  consentForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(consentForm);
    const choices = {
      essential: true, // Always enabled
      analytics: formData.get('analytics') === 'on',
      marketing: formData.get('marketing') === 'on'
    };

    cookieManager.saveConsent(choices);
    cookieManager.hideBanner();
  });

  document.querySelector('.btn-accept-all')?.addEventListener('click', () => {
    cookieManager.saveConsent({
      essential: true,
      analytics: true,
      marketing: true
    });
    cookieManager.hideBanner();
  });

  document.querySelector('.btn-reject-all')?.addEventListener('click', () => {
    cookieManager.saveConsent({
      essential: true,
      analytics: false,
      marketing: false
    });
    cookieManager.hideBanner();
  });
});
```

### Google Analytics with Consent Mode

```html
<!-- Google Analytics with Consent Mode -->
<script>
  // Initialize with consent denied
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'wait_for_update': 500 // Wait for consent banner
  });

  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Load GA4 (will only fire after consent granted) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Server-Side Cookie Validation

```javascript
// Express middleware for cookie consent
function requireCookieConsent(req, res, next) {
  // Check for consent cookie
  const consentCookie = req.cookies.cookie_consent;

  if (!consentCookie) {
    return res.status(403).json({
      error: 'Cookie consent required',
      message: 'Please accept cookies to use this feature'
    });
  }

  try {
    const consent = JSON.parse(decodeURIComponent(consentCookie));

    // Check if specific category is consented
    const requiredCategory = req.query.cookieCategory || 'analytics';

    if (!consent[requiredCategory]) {
      return res.status(403).json({
        error: 'Cookie consent not granted',
        requiredCategory,
        message: 'Please accept cookies to use this feature'
      });
    }

    // Attach consent to request
    req.cookieConsent = consent;
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Invalid consent cookie',
      message: 'Consent cookie is malformed'
    });
  }
}

// Apply to routes that use cookies
app.get('/api/analytics/track', requireCookieConsent, (req, res) => {
  // Only executes if analytics consent is granted
  // ... tracking logic
});
```

## Examples

### Scan website for cookies
```bash
/cookie-consent-check --domain example.com --scan-cookies
```

### Validate cookie banner
```bash
/cookie-consent-check --check-banner --domain example.com
```

### Full compliance check
```bash
/cookie-consent-check --domain example.com --check-banner --check-preferences --check-withdrawal --check-third-party
```

## Output

```
Cookie Consent Compliance Report
=================================

Domain: example.com
Scan Date: 2025-01-20
Regulations: GDPR Article 7, ePrivacy Directive Article 5(3)

Overall Status: NON-COMPLIANT
Compliance Score: 61%

Critical Issues:
┌────────────────────────────────────────────────────────────────────────────┐
│ Rule: Pre-Checked Boxes                                                   │
│ Location: https://example.com (line 45)                                   │
│ Severity: CRITICAL                                                          │
│ Issue: Marketing cookies checkbox is pre-checked                          │
│ GDPR Violation: Article 7(2) - Consent must be opt-in, not opt-out       │
│ Impact: Consent is invalid, potential fines up to 20M EUR                 │
│ Fix: Ensure all non-essential checkboxes are unchecked by default         │
└────────────────────────────────────────────────────────────────────────────┘

High Priority:
┌────────────────────────────────────────────────────────────────────────────┐
│ Rule: No Easy Withdrawal                                                  │
│ Location: https://example.com                                             │
│ Severity: HIGH                                                             │
│ Issue: Users cannot change cookie preferences after initial choice       │
│ GDPR Violation: Article 7(3) - Withdrawal must be as easy as giving      │
│ Impact: Users locked into consent choices                                 │
│ Fix: Add persistent "Manage Cookies" or "Preferences" link in footer      │
└────────────────────────────────────────────────────────────────────────────┘

Cookies Detected:

Essential Cookies (3):
├── ✓ PHPSESSID (session management)
├── ✓ csrf_token (security)
└── ✓ cookie_consent (consent record)

Analytics Cookies (4):
├── _ga (Google Analytics) - Set BEFORE consent ✗
├── _gid (Google Analytics) - Set BEFORE consent ✗
├── _gat (Google Analytics) - Set BEFORE consent ✗
└── _fbp (Facebook Pixel) - Set BEFORE consent ✗

Marketing Cookies (6):
├── fr (Facebook) - Set before consent ✗
├── ads_id (Google Ads) - Set before consent ✗
├── __gads (Google Ads) - Set before consent ✗
├── __gac (Google Ads) - Set before consent ✗
├── _ym_uid (Yandex Metrica) - No consent mechanism ✗
└── tmr_lvid (Target Mail) - No consent mechanism ✗

Third-Party Scripts Loaded Without Consent:

Google Analytics (google-analytics.com):
├── Script: https://www.googletagmanager.com/gtag/js
├── Cookies: _ga, _gid, _gat
├── Loaded: Immediately on page load ✗
└── Should Load: Only after analytics consent

Facebook Pixel (connect.facebook.net):
├── Script: https://connect.facebook.net/en_US/fbevents.js
├── Cookies: _fbp, fr
├── Loaded: Immediately on page load ✗
└── Should Load: Only after marketing consent

Yandex Metrica (mc.yandex.ru):
├── Script: https://mc.yandex.ru/metrika/tag.js
├── Cookies: _ym_uid, _ym_d
├── Loaded: Immediately on page load ✗
├── No consent option ✗
└── Should: Be removed or add to consent mechanism

Cookie Banner Assessment:

✓ Visible and prominent
✓ Privacy policy link provided
✓ Cookie policy link provided
✗ Pre-checked marketing cookies (CRITICAL)
✗ No granular options for different cookie types
✗ No "Reject All" button (HIGH)
✗ No "Accept Selected" option (MEDIUM)
✗ No information about cookie purposes (MEDIUM)
✗ Not accessible (missing ARIA labels) (LOW)

Consent Implementation:

✗ Consent stored in localStorage only (not accessible server-side)
✗ No consent timestamp recorded
✗ No consent version tracking
✗ No consent withdrawal mechanism
✗ Scripts load before consent is granted
✗ No consent mode for Google Analytics

Recommendations:

1. [CRITICAL] Remove pre-checked boxes - all cookies must be opt-in
2. [HIGH] Implement granular consent checkboxes for each category
3. [HIGH] Add "Reject All" button for easy rejection
4. [HIGH] Defer loading analytics/marketing scripts until consent granted
5. [HIGH] Add persistent "Manage Cookies" link in site footer
6. [HIGH] Implement Google Analytics consent mode
7. [MEDIUM] Record consent timestamp and version
8. [MEDIUM] Store consent in HTTP cookie for server-side access
9. [MEDIUM] Implement consent withdrawal mechanism
10. [LOW] Add ARIA labels for accessibility

Best Practice Examples:

Cookie Banner with All Required Elements:
- ✓ Clear information about cookie usage
- ✓ Link to privacy and cookie policies
- ✓ Granular checkboxes for each category
- ✓ "Accept Selected" button
- ✓ "Accept All" button
- ✓ "Reject All" button
- ✓ "Manage Preferences" link in footer
- ✓ Scripts load conditionally based on consent

Implementation Priority:

Phase 1 (Critical - Complete within 1 week):
└── Stop loading tracking scripts before consent
└── Remove pre-checked checkboxes
└── Add "Reject All" button

Phase 2 (High - Complete within 2 weeks):
├── Implement granular consent checkboxes
├── Defer script loading until consent
├── Add "Manage Cookies" link in footer

Phase 3 (Medium - Complete within 1 month):
├── Implement consent withdrawal
├── Add consent timestamping
├── Store consent in HTTP cookie

Phase 4 (Low - Nice to have):
├── Improve accessibility (ARIA labels)
├── Add cookie category explanations
└── Implement consent analytics
```

## Best Practices

1. **Always Opt-In** - Never pre-check non-essential cookies
2. **Granular Options** - Separate checkboxes for each category
3. **Easy Withdrawal** - "Manage Cookies" link always accessible
4. **Clear Information** - Explain what each category does
5. **Load Conditionally** - Only load scripts after consent
6. **Record Consent** - Store timestamp, version, and choices
7. **Honor Choices** - Respect user's preferences across sessions
8. **Regular Review** - Audit cookie usage quarterly

## Testing Checklist

- [ ] Banner appears on first visit
- [ ] No non-essential cookies set before consent
- [ ] All checkboxes unchecked by default
- [ ] Granular options available
- [ ] "Reject All" button works
- [ ] "Accept Selected" works
- [ ] Consent persists across sessions
- [ ] "Manage Cookies" link accessible
- [ ] Can change preferences later
- [ ] Scripts only load after consent
- [ ] Third-party scripts respect consent
