---
description: Autonomous WCAG 2.2 compliance scanning for web files with intelligent issue detection and remediation guidance
invocation:
  trigger_keywords:
    - wcag
    - accessibility
    - a11y
    - compliance
    - screen reader
    - keyboard navigation
    - alt text
    - aria
    - contrast
    - semantic html
    - accessibile
  file_patterns:
    - "**/*.html"
    - "**/*.htm"
    - "**/*.css"
    - "**/*.js"
    - "**/*.jsx"
    - "**/*.ts"
    - "**/*.tsx"
    - "**/*.vue"
    - "**/*.svelte"
    - "**/*.astro"
---

# WCAG Scan Skill

The WCAG Scan skill automatically detects WCAG 2.2 accessibility issues in web files and provides intelligent, actionable remediation guidance.

## When This Skill Activates

Claude will automatically invoke this skill when:

- You explicitly request accessibility, WCAG, or a11y checks
- Files matching web patterns (HTML, CSS, JS, JSX, TS, TSX, Vue, Svelte, Astro) are being reviewed or modified
- Accessibility-related keywords are mentioned (aria, alt text, contrast, screen reader, keyboard navigation)
- Questions about semantic HTML, form accessibility, or ARIA are asked
- UI components, forms, or navigation structures are being created or modified

## What This Skill Does

When activated, this skill performs:

### 1. Intelligent File Analysis
- Identifies file types and appropriate scanning strategies
- Parses HTML, CSS, JavaScript/TypeScript, and framework components
- Extracts relevant accessibility-relevant code patterns

### 2. WCAG 2.2 Compliance Checks
Automatically checks for violations of WCAG 2.2 success criteria:

**Perceivable**
- Images without alt text or with empty alt text
- Proper heading hierarchy (h1-h6 in logical order)
- Form inputs with missing or improper labels
- Tables without proper headers
- Color used as the only means of conveying information
- Low contrast ratios (text, non-text, UI components)
- Missing form field descriptions or instructions

**Operable**
- Elements missing keyboard accessibility
- Missing skip navigation links
- Empty or generic link text
- Missing focus indicators
- Focus order issues
- Keyboard traps in custom components
- Touch targets smaller than 44x44px

**Understandable**
- Missing lang attribute on html element
- Language changes not indicated with lang attribute
- Focus events that cause context changes
- Form errors without clear identification
- Missing input instructions
- Forms without error prevention (for financial/legal/medical data)

**Robust**
- Invalid HTML structure
- Duplicate IDs
- Missing or incorrect ARIA attributes
- Interactive elements without semantic markup
- Elements with incorrect ARIA roles

### 3. Framework-Specific Analysis
- **React**: Props, JSX, component accessibility patterns
- **Vue**: Template syntax, v-model, ARIA integration
- **Angular**: Templates, FormControl, ARIA directives
- **Svelte**: Reactive accessibility, ARIA patterns

### 4. Intelligent Issue Categorization
Issues are classified by severity:

- **Critical**: Complete accessibility barrier (blocks access for users)
- **Serious**: Significant accessibility issue (major barrier)
- **Moderate**: Partial accessibility barrier (some users affected)
- **Minor**: Minor accessibility improvement opportunity

### 5. Actionable Remediation
For each issue found:
- Clear description of the problem
- Specific WCAG success criterion violated
- Code example showing the issue
- Corrected code example
- Explanation of why the fix matters
- Alternative approaches when applicable

## Output Format

```
## WCAG 2.2 Accessibility Scan

Scanned: src/components/Header.jsx
WCAG Level: AA
Issues Found: 4

### [CRITICAL] Missing alt text on decorative image
**WCAG 1.1.1** - Non-text Content

**Location:** Line 23
```jsx
<img src={logo} />
```

**Issue:** Images must have alt text to be accessible to screen reader users.

**Fix:**
```jsx
// For informative images:
<img src={logo} alt="Company Logo" />

// For decorative images:
<img src={logo} alt="" role="presentation" />
```

### [SERIOUS] Button missing accessible name
**WCAG 4.1.2** - Name, Role, Value

**Location:** Line 45
```jsx
<button onClick={handleMenu}>
  <Icon name="menu" />
</button>
```

**Issue:** Icon-only buttons need aria-label to provide accessible name.

**Fix:**
```jsx
<button onClick={handleMenu} aria-label="Open menu">
  <Icon name="menu" />
</button>
```

### [MODERATE] Low contrast ratio
**WCAG 1.4.3** - Contrast (Minimum)

**Location:** src/styles/Header.css:12
```css
.nav-link {
  color: #888;
  background: #fff;
}
```

**Issue:** Contrast ratio is 2.8:1, below 4.5:1 minimum for normal text.

**Fix:**
```css
.nav-link {
  color: #333;  /* Meets 7.5:1 ratio */
  background: #fff;
}
```

### [MINOR] Heading level skipped
**WCAG 1.3.1** - Info and Relationships

**Location:** Line 67
```jsx
<h2>About Us</h2>
...
<h4>Our History</h4>  {/* Missing h3 */}
```

**Issue:** Heading levels should not be skipped for proper document outline.

**Fix:**
```jsx
<h2>About Us</h2>
<h3>Our History</h3>
```

## Summary
- Critical: 1
- Serious: 1
- Moderate: 1
- Minor: 1

## Recommendations
1. Add alt text to all images (both informative and decorative)
2. Provide aria-label for icon-only interactive elements
3. Increase color contrast to meet WCAG AA standards
4. Maintain proper heading hierarchy throughout the component
```

## Contextual Awareness

This skill adapts its scanning based on:

- **File Type**: Different checks for HTML vs CSS vs JavaScript
- **Framework**: Framework-specific patterns and best practices
- **Component Type**: Different standards for forms, navigation, modals, etc.
- **User Intent**: More detailed analysis for code review vs quick scan
- **Existing Patterns**: Recognizes common accessibility patterns and libraries

## Best Practices

When this skill is invoked, it will:

1. **Scan Thoroughly**: Check all applicable WCAG success criteria
2. **Prioritize Issues**: Present critical and serious issues first
3. **Provide Context**: Explain why each issue matters for users
4. **Show Solutions**: Include code examples for every issue
5. **Reference Standards**: Cite specific WCAG success criteria
6. **Suggest Tools**: Recommend complementary testing methods
7. **Educate**: Share accessibility knowledge along with fixes

## Integration with Development

This skill works seamlessly with:

- **File Creation**: Scan new files for accessibility issues
- **Code Review**: Check pull requests and proposed changes
- **Refactoring**: Ensure accessibility is maintained during changes
- **Debugging**: Identify accessibility causes of user issues
- **Documentation**: Generate accessibility documentation for components

## Complementary Activities

While this skill provides comprehensive automated scanning, also consider:

- Manual keyboard navigation testing
- Screen reader testing (JAWS, NVDA, VoiceOver, TalkBack)
- Testing with browser accessibility tools
- User testing with people who use assistive technology
- Color contrast validation for dynamic content
- Accessibility regression testing in CI/CD

## Resources Referenced

This skill uses knowledge from:

- WCAG 2.2 specification and techniques
- WAI-ARIA Authoring Practices 1.2
- axe-core rules engine
- WebAIM accessibility guidelines
- Common accessibility issues and solutions
- Framework-specific accessibility documentation
- Real-world accessibility bug patterns

## Continuous Improvement

This skill stays updated with:

- Latest WCAG 2.2 requirements and techniques
- Emerging accessibility best practices
- Common accessibility bug patterns
- Framework accessibility improvements
- Browser accessibility API changes
- Screen reader behavior updates
