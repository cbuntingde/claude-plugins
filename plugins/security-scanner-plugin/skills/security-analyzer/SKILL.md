---
description: Automatically analyze code for security vulnerabilities, OWASP Top 10 issues, and security anti-patterns
invocation:
  triggers:
    - "scan.*security"
    - "check.*vulnerabilit"
    - "security.*audit"
    - "owasp"
  priority: high
---

# Security Analyzer Skill

Autonomously analyzes code for security vulnerabilities when security-related tasks are detected. This skill automatically activates when security concerns are mentioned or when high-risk code patterns are identified.

## When this skill activates

- User mentions security, vulnerabilities, or OWASP
- Files containing sensitive operations are modified (auth, crypto, database queries)
- High-risk functions are used (eval, exec, system, SQL queries)
- Authentication, authorization, or session code is changed
- API endpoints or routes are modified
- Configuration files with security implications are updated

## What it analyzes

### OWASP Top 10 vulnerabilities
1. **Broken Access Control**: Missing authorization checks, privilege escalation
2. **Cryptographic Failures**: Weak crypto, hardcoded keys, missing encryption
3. **Injection**: SQL, NoSQL, OS command, LDAP injection vulnerabilities
4. **Insecure Design**: Missing security controls, flawed authentication logic
5. **Security Misconfiguration**: Default credentials, unnecessary features enabled
6. **Vulnerable and Outdated Components**: Known CVEs in dependencies
7. **Identification and Authentication Failures**: Weak auth, session issues
8. **Software and Data Integrity Failures**: Insecure deserialization, code injection
9. **Security Logging and Monitoring Failures**: Insufficient logging, missing alerts
10. **Server-Side Request Forgery (SSRF)**: Unvalidated URL fetching

### Code-level security issues
- Hardcoded secrets (API keys, passwords, tokens)
- Weak cryptographic algorithms (MD5, SHA1, RC4)
- Missing input validation and sanitization
- Unsafe use of eval() or similar functions
- Path traversal vulnerabilities
- Insecure temporary file handling
- Race conditions (TOCTOU)
- Integer overflows and underflows
- Format string vulnerabilities

### API security
- Missing authentication on endpoints
- Broken authorization checks
- Exposed sensitive data in responses
- Missing rate limiting
- Insecure direct object references (IDOR)
- Mass assignment vulnerabilities

## Analysis approach

1. **Pattern matching**: Identify known vulnerability patterns
2. **Data flow analysis**: Track untrusted input through code
3. **Context understanding**: Apply language-specific security rules
4. **Severity assessment**: Assign CVSS-based scores
5. **Fix recommendations**: Provide actionable remediation steps

## Output format

```markdown
## 🔒 Security Analysis

### Critical Issues
[High-priority security vulnerabilities requiring immediate attention]

### High Severity
[Important security issues that should be addressed soon]

### Medium Severity
[Security concerns to address in next iteration]

### Low Severity
[Minor security improvements and best practices]

### Recommendations Summary
1. [Most critical fix]
2. [Second priority]
3. [Additional improvements]
```

## Example analysis

**Input**: User saves code with SQL query:
```javascript
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
db.query(query, (err, results) => { ... });
```

**Output**:
```markdown
## 🔒 Security Analysis

### CRITICAL: SQL Injection Vulnerability
**Location**: src/routes/users.js:15
**CVSS Score**: 9.8 (CRITICAL)

**Vulnerability**: User input directly concatenated into SQL query

**Impact**:
- Attackers can bypass authentication
- Extract, modify, or delete arbitrary data
- Execute administrative operations

**Fix**:
```javascript
// Use parameterized query
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [req.params.id], (err, results) => { ... });
```

**References**:
- OWASP: https://owasp.org/www-community/attacks/SQL_Injection
- CWE-89: https://cwe.mitre.org/data/definitions/89.html
```

## Language-specific patterns

### JavaScript/TypeScript
```javascript
// ❌ Vulnerable
eval(userInput);
setTimeout(userInput, 1000);
document.innerHTML = userInput;
const query = `SELECT * FROM users WHERE id = ${id}`;

// ✅ Secure
JSON.parse(jsonString);
document.textContent = userInput;
const query = "SELECT * FROM users WHERE id = ?";
```

### Python
```python
# ❌ Vulnerable
eval(user_input)
os.system(user_command)
query = f"SELECT * FROM users WHERE id = {user_id}"

# ✅ Secure
ast.literal_eval(safe_input)
subprocess.run(["command", "--arg", value], shell=False)
cursor.execute("SELECT * FROM users WHERE id = %s", [user_id])
```

### Java
```java
// ❌ Vulnerable
Runtime.getRuntime().exec(userCommand);
query = "SELECT * FROM users WHERE id = " + userId;

// ✅ Secure
ProcessBuilder pb = new ProcessBuilder("command", "--arg", value);
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
ps.setInt(1, userId);
```

## Integration

This skill autonomously activates when:
- Files are written with high-risk patterns
- User asks security-related questions
- Security commands are invoked
- PR reviews require security analysis
- Pre-deployment security validation is needed

Works seamlessly with:
- `/security-scan` command
- Vulnerability Detector agent
- Security hooks for automated checking
- CI/CD security gates
