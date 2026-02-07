---
description: Validates data retention policies and GDPR Article 5(1)(e) storage limitation compliance
capabilities: ["retention_policy_check", "retention_implementation", "cleanup_job_detection", "backup_deletion"]
---

# Retention Policy Validator Skill

Validates data retention policy implementation and compliance with GDPR Article 5(1)(e) - storage limitation principle.

## GDPR Article 5(1)(e) Requirements

### Storage Limitation Principle
> Personal data shall be kept in a form which permits identification of data subjects for **no longer than is necessary** for the purposes for which the personal data are processed.

### Key Requirements

1. **Define retention periods** - Specify how long each data category is kept
2. **Implement automatic deletion** - Delete data when retention period expires
3. **Document justification** - Record legal or business reasons for retention
4. **Secure erasure** - Ensure deleted data cannot be recovered
5. **Apply to all storage** - Including backups, archives, and logs

## Validation Checks

### Policy Documentation
- [x] Retention policy file exists (retention-policy.json)
- [x] All data categories have defined retention periods
- [x] Retention periods are justified (legal/business reasons)
- [x] Deletion methods are specified
- [x] Policy version and last updated date recorded

### Implementation Validation
- [x] Automated cleanup jobs implemented
- [x] Cascading deletion for related records
- [x] Backup deletion or expiry configured
- [x] Log rotation and deletion implemented
- [x] Soft delete with permanent deletion

### Database Checks
- [x] Retention columns (created_at, deleted_at) present
- [x] TTL (Time To Live) indexes configured
- [x] Partitioning by date for efficient cleanup
- [x] Foreign key cascades defined
- [x] Cleanup queries optimized

## Retention Policy Structure

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
      "justification": "Tax compliance requirements (commercial law)",
      "legalBasis": "contractual",
      "deletionMethod": "soft_delete_then_permanent",
      "dataLocation": ["database.users", "database.user_profiles"]
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

## Implementation Examples

### Database Cleanup Job

```typescript
// Scheduled cleanup job for expired data
const cleanupExpiredData = async () => {
  const policies = await loadRetentionPolicies();

  for (const policy of policies.dataCategories) {
    const cutoffDate = new Date(Date.now() - policy.retentionPeriodDays * 86400000);

    // Soft delete first
    await database.query(`
      UPDATE ${policy.table}
      SET deleted_at = NOW(), deleted_by = 'retention_job'
      WHERE created_at < ? AND deleted_at IS NULL
    `, [cutoffDate]);

    // Permanent deletion after grace period
    await database.query(`
      DELETE FROM ${policy.table}
      WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    console.log(`Cleaned up ${policy.category} data older than ${policy.retentionPeriod}`);
  }
};

// Schedule to run daily
cron.schedule('0 2 * * *', cleanupExpiredData);
```

### Log Rotation

```nginx
# nginx.conf - Rotate logs daily, keep 90 days
access_log /var/log/nginx/access.log;

# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    rotate 90
    compress
    delaycompress
    missingok
    notifempty
    create 0640 nginx adm
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### Cloud Storage Lifecycle

```typescript
// AWS S3 Lifecycle Policy
const s3 = new AWS.S3();

const lifecyclePolicy = {
  Rules: [{
    Id: 'DeleteOldLogs',
    Status: 'Enabled',
    Prefix: 'logs/',
    Expiration: { Days: 90 }
  }]
};

await s3.putBucketLifecycleConfiguration({
  Bucket: 'app-logs',
  LifecycleConfiguration: lifecyclePolicy
}).promise();
```

### TTL Index (MongoDB)

```javascript
// MongoDB TTL index for automatic document expiration
db.events.createIndex(
  { "createdAt": 1 },
  {
    expireAfterSeconds: 7776000, // 90 days in seconds
    name: "ttl_index"
  }
);

// Documents will be automatically deleted after 90 days
```

## Common Violations

### Critical
1. **No retention policy** - Undefined or undocumented retention periods
2. **Infinite retention** - Data kept indefinitely without justification
3. **No cleanup jobs** - No automated deletion mechanism
4. **Backups not deleted** - Data remains in backups despite deletion

### High
5. **Soft delete only** - No permanent deletion after grace period
6. **Logs not rotated** - Indefinite log retention
7. **No cascading deletion** - Related records not deleted
8. **No legal hold checks** - Data deleted despite legal requirements

### Medium
9. **No justification** - Retention periods lack documented reasons
10. **Inconsistent implementation** - Some tables have retention, others don't
11. **Manual cleanup** - Relying on manual deletion processes
12. **No audit trail** - No logging of deletion activities

## Detection Patterns

```typescript
// Detect cleanup jobs
const cleanupJobPatterns = [
  /cron|schedule|@Scheduled/i,
  /cleanup|delete.*expired|retention.*delete/i,
  /ttl|timeToLive|expire/i
];

// Detect soft delete
const softDeletePatterns = [
  /deletedAt|deleted_at|isDeleted/i,
  /ON DELETE SET NULL/i
];

// Detect retention logic
const retentionPatterns = [
  /retention|data.*retention|keep.*for/i,
  /created_at < NOW\(\)|DATE_SUB|DATEDIFF/i
];
```

## Best Practices

1. **Define everything** - Document retention for all data categories
2. **Automate cleanup** - Never rely on manual deletion
3. **Soft then hard** - Soft delete first, permanent after grace period
4. **Handle backups** - Include backups in retention strategy
5. **Document legal basis** - Record why each retention period is necessary
6. **Review annually** - Update policies as requirements change
7. **Test deletion** - Verify cleanup jobs work correctly
8. **Monitor compliance** - Alert on retention violations
9. **Consider legal holds** - Implement holds for litigation
10. **Log everything** - Audit trail of all deletions

## Integration

The validator skill checks:

- **Database schemas** - For retention columns and indexes
- **Cron jobs** - For scheduled cleanup tasks
- **Configuration files** - For retention policies
- **Log rotation configs** - For log retention settings
- **Cloud configs** - For storage lifecycle rules
- **Application code** - For deletion logic
