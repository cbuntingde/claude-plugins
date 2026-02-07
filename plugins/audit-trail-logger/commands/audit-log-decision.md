# Audit Log Decision

Log a decision for compliance tracking. Decisions are automatically captured in the audit trail with timestamps.

## Usage

```
/audit-log-decision "Decision description"
```

### Examples

Log an architectural decision:
```
/audit-log-decision "Chose PostgreSQL over MySQL for better JSON support"
```

Log a security decision:
```
/audit-log-decision "Implemented bcrypt with cost factor 12 for password hashing"
```

Log a deployment decision:
```
/audit-log-decision "Delayed deployment until security review completed"
```

## Notes

- Decisions are logged with the current timestamp and session ID
- Maximum decision length: 5000 characters
- Decision text is sanitized for safe JSON storage
- Use this command to document important decisions for compliance and audit purposes
