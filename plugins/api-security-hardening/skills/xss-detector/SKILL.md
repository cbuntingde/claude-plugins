---
description: Autonomous XSS vulnerability detection and prevention implementation
capabilities: ["xss-pattern-detection", "input-sanitization-check", "output-encoding-validation", "csp-analysis"]
---

# XSS Detector

Autonomous skill for detecting Cross-Site Scripting (XSS) vulnerabilities and implementing secure coding practices.

## Capabilities

### XSS Pattern Detection
- Detects dangerous innerHTML usage with user input
- Identifies document.write and eval with user data
- Finds unescaped template literals in output
- Validates React/Vue/Angular security patterns

### Input Sanitization Check
- Validates input sanitization implementation
- Detects missing input validation middleware
- Checks for sanitization library usage (DOMPurify, validator.js)
- Validates user input validation patterns

### Output Encoding Validation
- Checks for proper output encoding in different contexts
- Validates HTML entity encoding
- Ensures JavaScript encoding for dynamic code
- Validates URL encoding for links and redirects

### CSP Analysis
- Analyzes Content-Security-Policy headers
- Detects missing or weak CSP policies
- Recommends strict CSP configurations
- Validates CSP nonce implementation

## Activation Triggers

This skill automatically activates when:
- User mentions "xss", "cross-site scripting", "sanitization"
- Files with user input handling are modified
- innerHTML, document.write, or eval are used
- Template literals or string interpolation detected
- User-generated content is rendered
- CSP headers are configured

## Analysis Output

When activated, the skill provides:

1. **Vulnerability Report**
   - XSS vulnerability locations and severity
   - Dangerous code patterns identified
   - Context-specific risks (HTML, JS, CSS, URL)

2. **Prevention Guidance**
   - Input sanitization implementation
   - Context-aware output encoding
   - CSP header configuration
   - Framework-specific security patterns

3. **Code Examples**
   - Secure rendering alternatives
   - Proper sanitization library usage
   - Safe DOM manipulation patterns
   - React/Vue/Angular security best practices

## Security Checks

The skill validates:
- No innerHTML with untrusted user input
- No document.write with user data
- No eval with user-provided code
- Input sanitization on server-side
- Context-appropriate output encoding
- Content-Security-Policy headers present
- Framework built-in escaping utilized
- DOMPurify or equivalent for rich content
