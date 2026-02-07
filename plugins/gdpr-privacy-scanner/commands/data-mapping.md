# Data Mapping

Generate comprehensive data flow maps and data inventories as required by GDPR Article 30, documenting all personal data processing activities within your organization.

## Usage

```bash
/data-mapping [options]
```

## Options

- `--format` - Output format (json, yaml, csv, diagram). Default: `json`
- `--include-external` - Include third-party processors and data flows
- `--visualize` - Generate visual data flow diagram
- `--categories` - Focus on specific data categories
- ` --cross-border` - Highlight cross-border data transfers
- `--update` - Update existing data map

## GDPR Article 30 Requirements

### Records of Processing Activities

Controllers and processors must maintain a record of processing activities under their responsibility, including:

1. **Controller Details** - Name, address, and representative
2. **Purposes of Processing** - Why personal data is processed
3. **Data Categories** - Types of personal data processed
4. **Data Subjects** - Categories of individuals whose data is processed
5. **Data Recipients** - Who receives the personal data
6. **International Transfers** - Countries data is transferred to
7. **Retention Schedules** - How long data is kept
8. **Security Measures** - Technical and organizational security measures

### Record Format

```json
{
  "processingActivity": {
    "name": "Customer Relationship Management",
    "controller": "Acme Inc.",
    "purposes": ["order_processing", "customer_support", "marketing"],
    "dataCategories": ["name", "email", "address", "payment_details"],
    "dataSubjects": ["customers", "prospects"],
    "recipients": ["customer_support_team", "payment_processor", "email_platform"],
    "transfers": ["United States"],
    "retention": "7 years after last transaction",
    "security": ["encryption", "access_control", "audit_logging"]
  }
}
```

## What It Generates

### 1. Data Inventory

Complete listing of all personal data stored, processed, or transmitted:

```json
{
  "dataInventory": {
    "lastUpdated": "2025-01-20",
    "version": "1.2",
    "dataElements": [
      {
        "id": "DE-001",
        "name": "customer_email",
        "category": "contact_information",
        "sensitivity": "personal",
        "format": "string",
        "storageLocations": [
          {
            "system": "CRM Database",
            "table": "customers",
            "column": "email",
            "encryption": "AES-256",
            "accessLevel": "restricted"
          },
          {
            "system": "Email Platform",
            "type": "third_party",
            "provider": "Mailchimp",
            "dataResidency": "United States"
          }
        ],
        "processingPurposes": [
          "order_confirmation",
          "customer_communication",
          "marketing_campaigns"
        ],
        "legalBasis": "contractual",
        "dataSubjects": ["customers"],
        "retention": "7 years after account closure",
        "sharedWith": ["customer_support", "email_marketing"]
      },
      {
        "id": "DE-002",
        "name": "customer_health_data",
        "category": "special_category_data",
        "sensitivity": "special",
        "format": "text",
        "storageLocations": [
          {
            "system": "Insurance Database",
            "table": "claims",
            "column": "health_information",
            "encryption": "AES-256",
            "accessLevel": "highly_restricted"
          }
        ],
        "processingPurposes": ["claims_processing", "risk_assessment"],
        "legalBasis": "explicit_consent",
        "dataSubjects": ["policyholders"],
        "retention": "10 years after claim closure",
        "sharedWith": ["claims_team", "medical_reviewers"]
      }
    ]
  }
}
```

### 2. Data Flow Map

Visual representation of how data flows through systems:

```json
{
  "dataFlows": [
    {
      "id": "DF-001",
      "name": "User Registration Flow",
      "description": "Data flow from user registration to storage",
      "trigger": "User submits registration form",
      "steps": [
        {
          "order": 1,
          "system": "Web Application",
          "action": "Collect user input",
          "dataCollected": ["name", "email", "password", "date_of_birth"],
          "processing": "validation"
        },
        {
          "order": 2,
          "system": "API Gateway",
          "action": "Forward to backend",
          "dataTransmitted": ["name", "email", "hashed_password", "date_of_birth"],
          "encryption": "TLS 1.3"
        },
        {
          "order": 3,
          "system": "Backend Service",
          "action": "Process and store",
          "dataStored": ["name", "email", "hashed_password", "date_of_birth"],
          "database": "PostgreSQL"
        },
        {
          "order": 4,
          "system": "Email Service",
          "action": "Send verification email",
          "dataTransmitted": ["email", "verification_token"],
          "provider": "SendGrid"
        }
      ],
      "internationalTransfers": [
        {
          "destination": "United States",
          "system": "Email Service",
          "provider": "SendGrid",
          "safeguards": "Standard Contractual Clauses (SCC)",
          "dataCategories": ["email", "name"]
        }
      ]
    }
  ]
}
```

### 3. Processing Activities Register

```json
{
  "processingActivities": [
    {
      "activityId": "PA-001",
      "name": "E-commerce Order Processing",
      "description": "Processing customer orders and payments",
      "controller": {
        "name": "Acme Retail Ltd",
        "address": "123 Commerce St, London, UK",
        "contact": "dpo@acme.com"
      },
      "purposes": [
        "order_fulfillment",
        "payment_processing",
        "delivery",
        "customer_support"
      ],
      "legalBasis": "contractual",
      "dataCategories": [
        "name",
        "email",
        "phone",
        "address",
        "payment_card_details",
        "purchase_history"
      ],
      "dataSubjects": ["customers"],
      "recipients": [
        "payment_processor",
        "shipping_provider",
        "customer_support_team"
      ],
      "internationalTransfers": [
        {
          "country": "United States",
          "recipient": "Stripe Inc (Payment Processor)",
          "safeguards": "Standard Contractual Clauses",
          "adequacyDecision": false
        }
      ],
      "retention": "7 years after order completion (tax requirement)",
      "securityMeasures": [
        "TLS encryption in transit",
        "AES-256 encryption at rest",
        "PCI DSS compliance",
        "Access control based on roles",
        "Audit logging of all access",
        "Regular security assessments"
      ]
    }
  ]
}
```

### 4. Third-Party Processors

```json
{
  "thirdPartyProcessors": [
    {
      "processorId": "TP-001",
      "name": "Stripe Inc",
      "category": "payment_processor",
      "address": "510 Townsend St, San Francisco, CA 94103, USA",
      "contact": "compliance@stripe.com",
      "dataProcessed": ["payment_card_details", "billing_address"],
      "dataSubjects": ["customers"],
      "purposes": ["payment_processing", "fraud_prevention"],
      "internationalTransfer": true,
      "transferDestination": "United States",
      "safeguards": "Standard Contractual Clauses (SCC) - Version 2021",
      "dataProcessingAgreement": true,
      "agreementDate": "2024-01-15",
      "agreementRenewal": "2027-01-15",
      "certifications": ["PCI DSS Level 1", "SOC 2 Type II", "ISO 27001"],
      "dataLocation": "United States with EU data region",
      "subprocessors": [
        {
          "name": "Amazon Web Services",
          "purpose": "Infrastructure hosting"
        }
      ]
    },
    {
      "processorId": "TP-002",
      "name": "Google Analytics",
      "category": "analytics",
      "address": "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA",
      "contact": "support@google.com",
      "dataProcessed": ["ip_address", "user_agent", "page_views", "session_id"],
      "dataSubjects": ["website_visitors"],
      "purposes": ["analytics", "website_optimization"],
      "internationalTransfer": true,
      "transferDestination": "United States",
      "safeguards": "EU Standard Contractual Clauses",
      "dataProcessingAgreement": true,
      "agreementDate": "2024-02-01",
      "certifications": ["ISO 27001"],
      "anonymization": {
        "method": "IP anonymization",
        "ipMasking": "last_octet",
        "retention": "14 months (anonymized after 2 months)"
      }
    }
  ]
}
```

## Examples

### Generate full data map (JSON)
```bash
/data-mapping
```

### Generate YAML output
```bash
/data-mapping --format yaml
```

### Generate visual diagram
```bash
/data-mapping --visualize
```

### Focus on cross-border transfers
```bash
/data-mapping --cross-border
```

### Export to CSV for spreadsheets
```bash
/data-mapping --format csv --include-external
```

## Output

```
Data Mapping Report
===================

Generated: 2025-01-20
GDPR Article: Article 30 - Records of Processing Activities

Summary:
├── Processing Activities: 12
├── Data Elements: 47
├── Data Flows: 23
├── Third-Party Processors: 8
├── International Transfers: 6
└── Special Category Data: 3

Critical Findings:
┌────────────────────────────────────────────────────────────────────────────┐
│ Issue: Undocumented Data Transfer                                          │
│ Flow: User Registration → Marketing Platform                              │
│ Destination: United States                                                 │
│ Risk: No Standard Contractual Clauses in place                            │
│ GDPR Article: Article 44, 46 - Transfer legal basis required              │
│ Action: Execute SCCs with provider before transfer                        │
└────────────────────────────────────────────────────────────────────────────┘

Data Inventory Summary:

Direct Identifiers (18):
├── Full Name (4 systems)
├── Email Address (8 systems)
├── Phone Number (3 systems)
├── Postal Address (5 systems)
├── IP Address (2 systems)
└── Account ID (all systems)

Special Category Data (3):
├── Health Information (insurance system)
├── Biometric Data (authentication system)
└── Political Opinions (user surveys - with consent)

Processing Activities:

1. Customer Account Management
   - Purposes: account_management, authentication, customer_support
   - Legal Basis: contractual
   - Data: name, email, phone, address, password_hash
   - Retention: 7 years after account closure
   - Security: encryption, access_control, audit_logging

2. E-commerce Transaction Processing
   - Purposes: order_fulfillment, payment_processing, delivery
   - Legal Basis: contractual
   - Data: name, email, address, payment_details, purchase_history
   - Retention: 7 years (tax requirement)
   - International Transfer: United States (Stripe) - SCC in place ✓

3. Marketing Communications
   - Purposes: email_marketing, personalization, analytics
   - Legal Basis: consent
   - Data: email, name, interests, browsing_behavior
   - Retention: 3 years after last interaction
   - International Transfer: United States (Mailchimp) - SCC in place ✓

Third-Party Processors Requiring Attention:

1. Analytics Provider (Google Analytics)
   Location: United States
   Safeguards: SCC signed ✓
   Anonymization: IP masking enabled ✓
   Data Residency: EU-US Data Privacy Framework compliant ✓

2. Customer Support Platform (Zendesk)
   Location: United States
   Safeguards: SCC signed ✓
   Data Access: Restricted access controls ✓
   ⚠ Review: Data retention period (currently indefinite)

3. Email Marketing (Mailchimp)
   Location: United States
   Safeguards: SCC signed ✓
   Consent Management: Double opt-in ✓
   Unsubscribe: Functional ✓

Cross-Border Data Transfers:

International Transfers Summary:
├── United States: 6 transfers
│   ├── Stripe (payment processing) - SCC ✓
│   ├── Google Analytics (analytics) - SCC + Anonymization ✓
│   ├── Zendesk (support) - SCC ⚠ review retention
│   ├── Mailchimp (marketing) - SCC ✓
│   ├── AWS (hosting) - SCC + EU data regions ✓
│   └── SendGrid (email) - SCC ✓
├── United Kingdom: 2 transfers
│   └── Office 365 (productivity) - UK adequacy ✓
└── India: 1 transfer
    └── Development Team (access) - BGDs ⚠ need SCC

Recommendations:

1. [HIGH] Execute SCCs with Indian development team
2. [HIGH] Set data retention period for Zendesk (currently indefinite)
3. [MEDIUM] Implement data flow monitoring for cross-border transfers
4. [MEDIUM] Create data processing agreement register
5. [LOW] Review necessity of all special category data processing
6. [LOW] Implement data mapping automation for real-time updates

Visual Data Flow Diagram:
[See: data-flow-diagram.png]

Export Files Generated:
├── data-inventory.json
├── data-flows.json
├── processing-activities.json
├── third-party-processors.json
├── cross-border-transfers.json
└── data-flow-diagram.png
```

## Data Flow Diagram Example

```
┌──────────────┐     TLS      ┌──────────────┐
│              │──────────────>│              │
│   Website    │              │  API Gateway │
│   (Browser)  │<──────────────│              │
└──────────────┘               └──────────────┘
                                     │
                                     │ TLS
                                     ▼
                            ┌──────────────┐
                            │              │
                            │   Backend    │
                            │   Service    │
                            │              │
                            └──────────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
                ▼                    ▼                    ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │              │    │              │    │              │
        │  PostgreSQL  │    │    Stripe    │    │  SendGrid    │
        │  (Primary)   │    │  (Payments)  │    │   (Email)    │
        │              │    │  (US - SCC)  │    │  (US - SCC)  │
        └──────────────┘    └──────────────┘    └──────────────┘
              │
              │ Replication
              ▼
        ┌──────────────┐
        │              │
        │    Backup    │
        │   (AWS S3)   │
        │  (US - SCC)  │
        └──────────────┘
```

## Best Practices

1. **Keep it current** - Update data map when processing changes
2. **Be comprehensive** - Include all data processing, even minor
3. **Document exceptions** - Note why certain data is exempt
4. **Review regularly** - Audit data map quarterly
5. **Make it accessible** - Available to DPO and regulators
6. **Use visual aids** - Diagrams help understand complex flows
7. **Track transfers** - Monitor all cross-border data movements
