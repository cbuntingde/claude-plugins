# Right to Be Forgotten

Validate implementation of GDPR Article 17 - Right to Erasure, ensuring data subjects can request deletion of their personal data and that deletion is properly executed across all systems.

## Usage

```bash
/right-to-be-forgotten [options]
```

## Options

- `--user-id` - Specific user ID to test erasure for
- `--check-cascades` - Verify cascading deletions across related tables
- `--check-backups` - Verify deletion from backups
- `--check-logs` - Verify deletion from logs
- `--check-third-parties` - Verify third-party notification
- `--dry-run` - Simulate deletion without executing
- `--validate` - Validate existing erasure implementation

## GDPR Article 17 Requirements

### Right to Erasure (Right to Be Forgotten)

Data subjects have the right to obtain from the controller the erasure of personal data concerning them without undue delay when:

1. **Personal data no longer necessary** - No longer needed for original purpose
2. **Consent withdrawn** - Data subject withdraws consent (if consent was lawful basis)
3. **Objects to processing** - Data subject objects to processing (no overriding grounds)
4. **Unlawful processing** - Personal data has been unlawfully processed
5. **Legal obligation** - Controller must erase to comply with legal obligation
6. **Child's data** - Personal data collected from child in relation to information society services

### Exceptions to Right to Erasure

The controller may refuse erasure when processing is necessary for:

1. **Right to freedom of expression and information**
2. **Legal obligation** - Compliance with EU or member state law
3. **Public interest** - Performance of task in public interest
4. **Public health** - Public interest in public health area
5. **Archiving purposes** - Archiving in public interest, scientific, historical research
6. **Legal claims** - Establishment, exercise, or defence of legal claims

## What It Checks

### Erasure Request Handler

```javascript
// SECURE - Complete erasure request handler
class RightToErasureHandler {
  async handleErasureRequest(userId) {
    const user = await this.findUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create erasure request record
    const requestId = await this.createErasureRequest({
      userId,
      requestedAt: new Date(),
      status: 'processing'
    });

    try {
      // Check for legal holds
      const hasLegalHold = await this.checkLegalHolds(userId);
      if (hasLegalHold) {
        await this.updateRequestStatus(requestId, 'blocked_legal_hold');
        throw new Error('Erasure blocked by legal hold');
      }

      // Check for pending transactions
      const hasPendingTransactions = await this.checkPendingTransactions(userId);
      if (hasPendingTransactions) {
        await this.updateRequestStatus(requestId, 'delayed_pending_transactions');
        throw new Error('Erasure delayed due to pending transactions');
      }

      // Perform cascading deletion
      await this.deleteUserData(userId);

      // Delete from backups
      await this.queueBackupDeletion(userId);

      // Notify third parties
      await this.notifyThirdPartiesOfErasure(userId);

      // Confirm completion
      await this.updateRequestStatus(requestId, 'completed');

      return { success: true, requestId };
    } catch (error) {
      await this.updateRequestStatus(requestId, 'failed', error.message);
      throw error;
    }
  }

  async deleteUserData(userId) {
    const deletionOperations = [
      // Primary user data
      this.database.users.delete({ id: userId }),

      // Related data (cascading)
      this.database.userProfiles.delete({ userId }),
      this.database.userAddresses.delete({ userId }),
      this.database.userPreferences.delete({ userId }),

      // Communication history
      this.database.messages.delete({ senderId: userId }),
      this.database.messages.delete({ receiverId: userId }),
      this.database.notifications.delete({ userId }),

      // Activity data
      this.database.userSessions.delete({ userId }),
      this.database.auditLogs.delete({ userId }),
      this.database.analyticsEvents.delete({ userId }),

      // Consent records (keep record of withdrawal)
      this.database.consents.update(
        { userId },
        { withdrawnAt: new Date(), retainedFor: 'legal_compliance' }
      ),

      // Anonymize orders (keep for legal/tax purposes)
      this.anonymizeUserOrders(userId),
    ];

    await Promise.all(deletionOperations);
  }

  async anonymizeUserOrders(userId) {
    const orders = await this.database.orders.find({ userId });

    for (const order of orders) {
      await this.database.orders.update(
        { id: order.id },
        {
          userId: null, // Remove reference
          customerName: 'REDACTED',
          customerEmail: 'REDACTED',
          anonymizedAt: new Date(),
          anonymizationReason: 'right_to_erasure'
        }
      );
    }
  }
}
```

### API Endpoint

```javascript
// API endpoint for erasure requests
app.post('/api/users/erasure-request', async (req, res) => {
  const { userId, identityVerified } = req.body;

  // Verify identity before processing
  if (!identityVerified) {
    return res.status(403).json({
      error: 'Identity must be verified before processing erasure request'
    });
  }

  try {
    const handler = new RightToErasureHandler();
    const result = await handler.handleErasureRequest(userId);

    res.json({
      message: 'Erasure request processed successfully',
      requestId: result.requestId,
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      information: 'You will receive confirmation when deletion is complete'
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      requestId: error.requestId
    });
  }
});
```

### Database Schema for Erasure Tracking

```sql
CREATE TABLE erasure_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL, -- processing, completed, failed, blocked, delayed
  completed_at TIMESTAMPTZ,
  blocked_reason TEXT,
  delay_reason TEXT,
  error_message TEXT,
  verified_identity BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(100),
  created_tables TEXT[], -- Tables that were affected
  third_parties_notified TEXT[], -- External parties notified
  backup_deletion_queued BOOLEAN DEFAULT FALSE,
  backup_deletion_completed_at TIMESTAMPTZ,
  INDEX idx_erasure_user (user_id),
  INDEX idx_erasure_status (status),
  INDEX idx_erasure_dates (requested_at, completed_at)
);

CREATE TABLE erasure_exceptions (
  id UUID PRIMARY KEY,
  erasure_request_id UUID REFERENCES erasure_requests(id),
  table_name VARCHAR(255) NOT NULL,
  record_id UUID,
  reason VARCHAR(100) NOT NULL, -- legal_hold, pending_transaction, tax_requirement
  legal_basis TEXT,
  exception_until TIMESTAMPTZ,
  INDEX idx_exception_request (erasure_request_id),
  INDEX idx_exception_table (table_name)
);
```

## Examples

### Validate erasure implementation
```bash
/right-to-be-forgotten --validate
```

### Test erasure for specific user (dry-run)
```bash
/right-to-be-forgotten --user-id "user-123" --dry-run
```

### Full erasure validation with checks
```bash
/right-to-be-forgotten --check-cascades --check-backups --check-logs --check-third-parties
```

### Simulate erasure request
```bash
/right-to-be-forgotten --user-id "user-123" --dry-run --check-cascades
```

## Output

```
Right to Erasure Validation Report
===================================

Evaluation Date: 2025-01-20
GDPR Article: Article 17 - Right to Erasure

Overall Status: NON-COMPLIANT
Compliance Score: 54%

Critical Issues:
┌────────────────────────────────────────────────────────────────────────────┐
│ Rule: Cascading Deletion                                                   │
│ Location: src/services/DeleteService.ts:89                                │
│ Severity: CRITICAL                                                          │
│ Issue: User deletion does not cascade to related tables                   │
│ Impact: Personal data remains in orders, messages, and logs after erasure │
│ GDPR Violation: Article 17(1) - Complete erasure not achieved             │
│ Fix: Implement foreign key cascades or manual deletion of related records │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ Rule: No Identity Verification                                             │
│ Location: src/api/erasure.ts:42                                            │
│ Severity: CRITICAL                                                          │
│ Issue: Erasure requests processed without identity verification            │
│ Impact: Unauthorized deletion requests could be processed                 │
│ GDPR Violation: Article 12 - Identity verification required               │
│ Fix: Implement robust identity verification before processing             │
└────────────────────────────────────────────────────────────────────────────┘

High Priority:
┌────────────────────────────────────────────────────────────────────────────┐
│ Rule: Backup Deletion                                                      │
│ Location: src/services/BackupService.ts:156                               │
│ Severity: HIGH                                                             │
│ Issue: No mechanism to delete user data from backups                      │
│ Impact: Data remains in backups despite user erasure                      │
│ GDPR Violation: Article 17(1) - Data must be erased from all storage      │
│ Fix: Queue deletion from backups or implement immutable logs with expiry  │
└────────────────────────────────────────────────────────────────────────────┘

Medium Priority:
┌────────────────────────────────────────────────────────────────────────────┐
│ Rule: Third-Party Notification                                            │
│ Location: src/services/DataProcessorService.ts:234                        │
│ Severity: MEDIUM                                                           │
│ Issue: No notification to third parties when data is erased               │
│ Impact: Third parties continue processing erased data                     │
│ GDPR Violation: Article 17(2) - Controller must inform third parties      │
│ Fix: Implement notification system to all data processors                 │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────/columns────────────────────────────┐
│ Rule: No Legal Hold Checks                                                │
│ Location: src/services/LegalHoldService.ts:12                             │
│ Severity: MEDIUM                                                           │
│ Issue: Erasure does not check for legal holds before deletion            │
│ Impact: Data may be deleted despite legal requirement to retain           │
│ Recommendation: Implement legal hold tracking system                      │
└────────────────────────────────────────────────────────────────────────────┘

Data Flow Analysis (user-id: user-123):

Tables Affected by Deletion:
├── users (primary) ✓
├── user_profiles ✓
├── user_addresses ✓
├── user_sessions ✗ NOT INCLUDED IN DELETION
├── messages (sent) ✗ NOT INCLUDED IN DELETION
├── messages (received) ✗ NOT INCLUDED IN DELETION
├── orders ✗ ANONYMIZED (PENDING VERIFICATION)
├── audit_logs ✗ RETAINED FOR LEGAL PURPOSES
└── consent_records ⚠ MARKED AS WITHDRAWN (NOT DELETED)

External Systems:
├── Analytics (Google Analytics) ✗ NO DELETION
├── CRM (Salesforce) ✗ NO DELETION
├── Email Marketing (Mailchimp) ✗ NO DELETION
├── Support (Zendesk) ✗ NO DELETION
└── Backup Storage (S3) ✗ NO DELETION

Recommended Action Plan:

1. [CRITICAL] Implement cascading deletion for all user-related tables
2. [CRITICAL] Add identity verification step before processing requests
3. [HIGH] Implement backup deletion queue or implement immutable logs
4. [HIGH] Add third-party notification system
5. [MEDIUM] Implement legal hold checking
6. [MEDIUM] Create erasure request tracking system
7. [MEDIUM] Provide erasure status dashboard for users
8. [LOW] Send confirmation email when erasure is complete

Best Practice Examples:
├── ✓ DELETE request endpoint accepts user ID
├── ✓ Response includes request ID for tracking
├── ✓ 30-day maximum processing time communicated
├── ✓ Clear reason provided if request is refused
✗ Missing: Identity verification mechanism
✗ Missing: Third-party notification integration
✗ Missing: Backup deletion process
```

## Implementation Checklist

### Required Components

- [ ] **Erasure Request API** - Endpoint to submit erasure requests
- [ ] **Identity Verification** - Robust verification before processing
- [ ] **Cascading Deletion** - Delete from all related tables
- [ ] **Backup Handling** - Queue deletion from backups or implement WORM logs
- [ ] **Third-Party Notification** - Inform all data processors
- [ ] **Legal Hold Checks** - Verify no legal obligation to retain
- [ ] **Request Tracking** - Audit trail of all erasure requests
- [ ] **Exception Handling** - Document reasons for refusal/delay
- [ ] **User Confirmation** - Notify user when erasure is complete
- [ ] **Status Endpoint** - Allow users to check erasure status

### Response Time Requirements

- **Ackowledgement**: Within 1 business day
- **Processing**: Within 30 days (extendable by 2 months for complex requests)
- **Notification**: Immediately upon completion

### Refusal Scenarios

You must refuse erasure (with reasons) when:

1. Data is needed for **legal claims** (defence or exercise)
2. Data is needed for **public interest** purposes
3. Data is needed for **public health** purposes
4. Data is needed for **archiving** purposes (scientific/historical research)
5. Data is needed for **freedom of expression** purposes

### Example Refusal Response

```javascript
{
  "status": "refused",
  "reason": "legal_obligation",
  "explanation": "Your data cannot be deleted at this time because it is required for tax compliance purposes for 7 years from the transaction date. We will delete your data on 2032-01-20.",
  "deleteDate": "2032-01-20",
  "legalBasis": "Article 17(3)(b) - Legal obligation",
  "appealProcess": "If you believe this decision is incorrect, you may appeal to: legal@example.com or your national data protection authority."
}
```
