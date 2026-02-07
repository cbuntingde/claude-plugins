# Data Retention Check

Validate data retention policies and practices against GDPR requirements, ensuring personal data is not kept longer than necessary.

## Usage

```bash
/data-retention-check [options]
```

## Options

- `--policy, -p` - Path to retention policy file (JSON or YAML)
- `--max-age` - Maximum allowed retention period (days). Default: `365`
- `--strict` - Fail on any retention policy violation
- `--databases` - Check database retention policies
- `--logs` - Check log retention policies
- `--backups` - Check backup retention policies
- `--report` - Generate detailed retention report

## GDPR Requirements

### Article 5(1)(e) - Storage Limitation
> Personal data shall be kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed.

### Key Requirements
1. **Define retention periods** for each data category
2. **Implement automatic deletion** when retention period expires
3. **Document justification** for retention periods
3. **Securely erase** expired data
4. **Maintain retention schedules**

## What It Checks

### Database Tables
```sql
-- Check for created_at / deleted_at columns
-- Verify retention triggers exist
-- Check for soft-delete implementation
-- Validate partitioning by date
```

### Application Code
```javascript
// Detects lack of cleanup jobs
// Missing TTL configurations
// No automatic deletion logic
// Incomplete data purging
```

### Configuration Files
```yaml
# database.yml
# Check for retention policies
retention:
  users: 7 years
  orders: 3 years
  logs: 90 days
  backups: 30 days
```

### Logging Systems
- Application logs
- Access logs
- Audit logs
- Error logs

### Backup Systems
- Database backups
- File system backups
- Cloud storage snapshots

## Retention Policy Format

### JSON Format
```json
{
  "version": "1.0",
  "lastUpdated": "2025-01-20",
  "dataCategories": [
    {
      "category": "user_accounts",
      "retentionPeriod": "7 years",
      "retentionPeriodDays": 2555,
      "justification": "Legal requirement for tax compliance",
      "legalBasis": "legitimate_interest",
      "deletionMethod": "secure_erase",
      "dataLocation": ["database.users", "database.user_profiles"]
    },
    {
      "category": "order_history",
      "retentionPeriod": "3 years",
      "retentionPeriodDays": 1095,
      "justification": "Commercial law requirements",
      "legalBasis": "contractual",
      "deletionMethod": "soft_delete_then_permanent",
      "dataLocation": ["database.orders", "archive.order_history"]
    },
    {
      "category": "application_logs",
      "retentionPeriod": "90 days",
      "retentionPeriodDays": 90,
      "justification": "Security incident investigation",
      "legalBasis": "legitimate_interest",
      "deletionMethod": "automatic_rotation",
      "dataLocation": ["./logs/*", "s3://app-logs/*"]
    }
  ]
}
```

## Examples

### Check default retention (1 year)
```bash
/data-retention-check
```

### Check with custom policy file
```bash
/data-retention-check --policy ./retention-policy.json
```

### Check 30-day retention for logs
```bash
/data-retention-check --max-age 30 --logs
```

### Full retention audit
```bash
/data-retention-check --databases --logs --backups --report
```

### Strict mode for CI/CD
```bash
/data-retention-check --strict --policy ./retention-policy.json
```

## Output

```
Data Retention Compliance Report
=================================

Policy File: ./retention-policy.json
Evaluation Date: 2025-01-20

Summary:
├── Data Categories Checked: 8
├── Compliant: 5
├── Non-Compliant: 3
└── Overall Status: NON-COMPLIANT

Violations:
┌────────────────────────────────────────────────────────────────────────────┐
│ Category: user_sessions                                                    │
│ Location: database.user_sessions                                          │
│ Status: NO RETENTION POLICY                                               │
│ Impact: Data stored indefinitely - GDPR violation                         │
│ Recommendation: Implement 90-day retention with auto-cleanup              │
│ GDPR Article: Article 5(1)(e) - Storage Limitation                        │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ Category: application_logs                                                 │
│ Location: ./logs/app.log                                                   │
│ Status: EXCEEDS RETENTION PERIOD                                          │
│ Current Age: 245 days                                                      │
│ Policy: 90 days                                                            │
│ Impact: Log data retained 155 days beyond policy                           │
│ Recommendation: Configure log rotation and archival deletion               │
│ GDPR Article: Article 5(1)(e) - Storage Limitation                        │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ Category: user_backup_20250120                                             │
│ Location: s3://backups/db/                                                  │
│ Status: NO DELETION SCHEDULE                                              │
│ Impact: Backups stored indefinitely - may contain deleted user data       │
│ Recommendation: Implement lifecycle policy with auto-expiration            │
│ GDPR Article: Article 17 - Right to Erasure                               │
└────────────────────────────────────────────────────────────────────────────┘

Best Practice Recommendations:
├── Implement soft-delete with cascading permanent deletion
├── Set up scheduled cleanup jobs (cron/CloudWatch Events)
├── Document legal basis for each retention period
├── Implement data retention audit logs
└── Review retention periods annually

Compliance Score: 62.5%
```

## Implementation Examples

### Database Cleanup Job
```javascript
// scripts/cleanup-expired-data.js
async function cleanupExpiredData() {
  const policies = await loadRetentionPolicies();

  for (const policy of policies.dataCategories) {
    const cutoffDate = new Date(Date.now() - policy.retentionPeriodDays * 86400000);

    await database.query(`
      UPDATE ${policy.table}
      SET deleted_at = NOW(), deleted_by = 'retention_job'
      WHERE created_at < ? AND deleted_at IS NULL
    `, [cutoffDate]);

    await database.query(`
      DELETE FROM ${policy.table}
      WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
  }
}
```

### Log Rotation Configuration
```nginx
# nginx.conf - Rotate logs daily, keep 90 days
access_log /var/log/nginx/access.log;
error_log /var/log/nginx/error.log;

# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    rotate 90
    compress
    delaycompress
    missingok
    notifempty
    create 0640 nginx adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### Cloud Storage Lifecycle
```javascript
// AWS S3 Lifecycle Policy
const lifecyclePolicy = {
  Rules: [{
    Id: 'DeleteOldLogs',
    Status: 'Enabled',
    Prefix: 'logs/',
    Expiration: { Days: 90 }
  }]
};

s3.putBucketLifecycleConfiguration({
  Bucket: 'app-logs',
  LifecycleConfiguration: lifecyclePolicy
});
```

## Best Practices

1. **Define clear policies** - Document retention periods for all data categories
2. **Implement automated cleanup** - Use scheduled jobs or database triggers
3. **Secure deletion** - Ensure data is unrecoverable after deletion
4. **Document legal basis** - Record justification for retention periods
5. **Regular audits** - Review and update retention policies annually
6. **Consider backups** - Apply retention policies to backup data too
