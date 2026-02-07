# Privacy Impact Assessment

Generate comprehensive Data Protection Impact Assessments (DPIA) as required by GDPR Article 35 for high-risk processing operations.

## Usage

```bash
/privacy-impact-assessment [options]
```

## Options

- `--project, -p` - Project or feature name to assess
- `--template` - DPIA template to use (minimal, standard, comprehensive). Default: `standard`
- `--output, -o` - Output format (markdown, pdf, html). Default: `markdown`
- `-- stakeholders` - Comma-separated list of stakeholders to include
- `--update` - Update existing DPIA
- `--review` - Review DPIA for completeness

## GDPR Article 35 Requirements

### When DPIA is Required

A DPIA is mandatory when processing is **likely to result in a high risk** to individuals, including:

1. **Systematic and extensive evaluation** - Profiling and scoring individuals
2. **Large-scale processing** - Processing sensitive data on many individuals
3. **Sensitive data** - Special category data (health, biometrics, criminal records)
4. **Public monitoring** - Systematic monitoring of publicly accessible areas
5. **Innovative technology** - Using new technologies for processing
6. **Data matching** - Combining datasets from multiple sources
7. **Vulnerable individuals** - Processing data of children, elderly, or other vulnerable groups
8. **Exclusion** - Processing that could significantly affect individuals (e.g., credit scoring)

### DPIA Must Include

1. **Description of processing** - Systematic description of processing operations
2. **Assessment of necessity** - Evaluation of whether processing is necessary and proportionate
3. **Risk assessment** - Assessment of risks to individuals' rights and freedoms
4. **Mitigation measures** - Measures to address identified risks
5. **Consultation** - Views of data subjects or their representatives
6. **Safeguards** - Security measures to protect personal data
7. **Monitoring** - Mechanisms to ensure compliance and detect breaches

## DPIA Template Structure

```markdown
# Data Protection Impact Assessment

## 1. Project Information
- **Project Name**: [Name]
- **Project Owner**: [Owner]
- **DPIA Lead**: [Lead]
- **Date**: [Date]
- **Version**: [Version]

## 2. Processing Description
- **Purpose**: [Why processing is needed]
- **Data Categories**: [Types of personal data]
- **Data Subjects**: [Individuals affected]
- **Data Sources**: [Where data comes from]
- **Data Flows**: [How data moves through system]
- **Third Parties**: [External parties involved]
- **Retention Period**: [How long data is kept]
- **Legal Basis**: [GDPR Article 6 basis]

## 3. Necessity and Proportionality
- **Why is processing necessary?** [Justification]
- **Are there less intrusive alternatives?** [Analysis]
- **Why were alternatives not chosen?** [Reasoning]
- **Is the data minimised?** [Minimization assessment]

## 4. Risk Assessment

### 4.1 Likelihood × Impact Matrix

| Risk | Likelihood | Impact | Overall Risk |
|------|------------|--------|--------------|
| Unauthorised access | Medium | High | HIGH |
| Data breach | Low | Very High | MEDIUM |
| Privacy violation | Medium | High | HIGH |

### 4.2 Identified Risks

1. **Risk Name**: [Description]
   - **Affected Rights**: [Which GDPR rights]
   - **Likelihood**: [Low/Medium/High]
   - **Impact**: [Low/Medium/High/Very High]
   - **Consequences**: [What could happen]

## 5. Mitigation Measures

### 5.1 Technical Measures
- Encryption at rest and in transit
- Access control and authentication
- Pseudonymization and anonymization
- Secure development lifecycle

### 5.2 Organisational Measures
- Staff training and awareness
- Data processing agreements
- Privacy policies and notices
- Incident response procedures

### 5.3 Legal Measures
- Data processing contracts
- Standard contractual clauses
- Binding corporate rules
- Regulatory consultation

## 6. Residual Risk
- **Risk Before Mitigation**: [HIGH/MEDIUM/LOW]
- **Risk After Mitigation**: [HIGH/MEDIUM/LOW]
- **Is residual risk acceptable?** [Yes/No]
- **Additional measures needed?** [Description]

## 7. Consultation
- **Data subjects consulted**: [Details]
- **DPO consulted**: [Date and feedback]
- **Regulator consulted**: [Date and outcome]
- **Other stakeholders**: [Details]

## 8. Approval
- **DPIA Approved By**: [Name and role]
- **Approval Date**: [Date]
- **Review Schedule**: [When to review]
- **Next Review Date**: [Date]
```

## Examples

### Generate standard DPIA
```bash
/privacy-impact-assessment --project "Customer Analytics Platform"
```

### Generate comprehensive DPIA
```bash/privacy-impact-assessment --project "Health Monitoring App" --template comprehensive
```

### Update existing DPIA
```bash
/privacy-impact-assessment --project "Customer Analytics Platform" --update
```

### Specify stakeholders
```bash
/privacy-impact-assessment --project "AI Recruitment Tool" --stakeholders "hr-team,legal,dpo,candidates"
```

### Generate HTML report
```bash
/privacy-impact-assessment --project "User Profiling System" --output html
```

### Review DPIA completeness
```bash
/privacy-impact-assessment --project "Payment Processing" --review
```

## Output Example

```markdown
# Data Protection Impact Assessment
## AI-Powered Recruitment Screening Tool

**Status**: INCOMPLETE - Requires Consultation
**Risk Level**: HIGH
**Generated**: 2025-01-20

---

### Executive Summary
This DPIA assesses the privacy risks of an AI recruitment tool that screens
candidate profiles using machine learning. The tool processes special category
data (health, disability information) and makes automated decisions affecting
employment opportunities. This triggers mandatory DPIA under GDPR Article 35.

**Recommendation**: Do NOT proceed without DPO and regulatory consultation.

---

### 1. Project Information

| Field | Value |
|-------|-------|
| Project Name | AI Recruitment Screening Tool |
| Project Owner | HR Technology Team |
| DPIA Lead | Jane Smith (Data Protection Officer) |
| Start Date | 2025-02-01 |
| Legal Basis | Article 6(1)(f) - Legitimate Interest |
| Special Category Data | Yes - Health and disability information |
| Automated Decision Making | Yes - Article 22 triggered |

### 2. Processing Description

**Purpose**: Automatically screen and rank job candidates using AI analysis
of CVs, cover letters, and online profiles.

**Data Categories**:
- Name and contact information
- Employment history
- Education and qualifications
- Health information (from CVs)
- Disability status (from CVs)
- Social media profiles
- Professional network data

**Data Subjects**: Job applicants (estimated 50,000/year)

**Data Sources**:
- Direct applications (CVs, cover letters)
- LinkedIn profiles
- Professional portfolios
- Public social media

**Processing Operations**:
1. Data collection from multiple sources
2. AI analysis and scoring (NLP, machine learning)
3. Automated ranking and filtering
4. Human review of top candidates
5. Storage for 7 years (legal requirement)

### 3. Necessity and Proportionality

**Is processing necessary?** ✅ Partially
- HR automation provides legitimate business benefit
- Reduces time-to-hire by 40%
- BUT: May be discriminatory and invasive

**Less intrusive alternatives**: ⚠️ Not fully evaluated
- Rule-based screening (no AI)
- Anonymised CVs (blind recruitment)
- Manual review only
- **Why rejected?** Not adequately documented

**Data minimisation**: ❌ Not achieved
- Collects more data than needed
- Social media scraping excessive
- Historical data kept indefinitely

### 4. Risk Assessment

#### Identified High-Risk Issues

| # | Risk | Likelihood | Impact | Risk Level | GDPR Article |
|---|------|------------|--------|------------|--------------|
| 1 | Algorithmic discrimination | High | Very High | **CRITICAL** | Art. 5(1)(a) - Fairness |
| 2 | Unauthorised data access | Medium | High | HIGH | Art. 32 - Security |
| 3 | Excessive data collection | High | High | HIGH | Art. 5(1)(c) - Minimisation |
| 4 | Lack of transparency | High | High | HIGH | Art. 12-14 - Transparency |
| 5 | Automated decisions without review | Medium | Very High | HIGH | Art. 22 - Automated decisions |
| 6 | Special category data processing | High | High | HIGH | Art. 9 - Special data |
| 7 | Cross-border data transfers | Medium | Medium | MEDIUM | Art. 44-50 - Transfers |
| 8 | Data subject rights limitations | Medium | High | MEDIUM | Art. 15-20 - Rights |

#### Critical Risk: Algorithmic Discrimination

**Description**: AI models may learn and perpetuate biases based on gender,
race, age, or disability from training data, leading to discriminatory
hiring practices.

**Affected Rights**:
- Article 5(1)(a) - Fair and transparent processing
- Article 21 - Non-discrimination
- Article 22(3) - Right to human intervention
- Article 9 - Processing special category data

**Consequences**:
- Discriminatory hiring practices
- Regulatory fines up to 20M EUR or 4% revenue
- Reputational damage
- Legal action from candidates
- Exclusion from public contracts

**Likelihood**: High - AI bias is well-documented in recruitment tools

**Impact**: Very High - Affects livelihoods, violates fundamental rights

### 5. Mitigation Measures

#### Proposed Technical Safeguards

✅ **Implemented**:
- TLS 1.3 encryption for all data in transit
- AES-256 encryption for data at rest
- Role-based access control (RBAC)
- Audit logging for all data access

⚠️ **Partially Implemented**:
- Pseudonymisation of candidate data (only for storage, not processing)
- Model fairness testing (limited to one demographic dimension)

❌ **Not Implemented**:
- Data minimisation controls
- Automated bias detection in models
- Explainability of AI decisions
- Data subject access request portal
- Right to human intervention mechanism

#### Required Additional Measures

1. **Algorithmic Transparency** ⚠️ CRITICAL
   - Implement explainable AI (XAI) techniques
   - Provide candidates with decision explanations
   - Document feature importance and model logic
   - Annual algorithmic audit

2. **Bias Mitigation** ⚠️ CRITICAL
   - Training data audit for representation
   - Fairness constraints in model training
   - Regular bias testing across all protected characteristics
   - Human review for all automated decisions

3. **Data Minimisation** ⚠️ CRITICAL
   - Remove social media scraping
   - Implement just-in-time data collection
   - Delete data immediately after hiring decision
   - Anonymise data for model training

4. **DPIA Consultation** ⚠️ CRITICAL
   - Consult with Data Protection Officer
   - Consult with supervisory authority (ICO)
   - Consult with employee representatives
   - Public consultation with candidates

5. **Data Subject Rights** ⚠️ HIGH
   - Implement DSAR portal for candidates
   - Provide right to object to profiling
   - Enable human intervention pathway
   - Grant right to data portability

### 6. Residual Risk Assessment

| Risk Category | Before Mitigation | After Mitigation | Acceptable? |
|---------------|-------------------|------------------|-------------|
| Discrimination | CRITICAL | HIGH | ❌ No |
| Security | HIGH | MEDIUM | ✅ Yes |
| Transparency | HIGH | MEDIUM | ✅ Yes |
| Data Minimisation | HIGH | HIGH | ❌ No |
| Rights Violations | HIGH | MEDIUM | ⚠️ Conditionally |

**Overall Residual Risk**: **HIGH**

**Is the project acceptable in current form?** ❌ **NO**

**Conditions for proceeding**:
1. Complete algorithmic audit with external bias testing
2. Implement all critical mitigation measures
3. Obtain DPO approval
4. Consult with supervisory authority
5. Implement human review for all decisions
6. Provide clear explanations to candidates

### 7. Consultation Required

Before proceeding, you MUST consult with:

- [ ] **Data Protection Officer** - Required under Article 35(9)
- [ ] **Supervisory Authority** - Required given high risk
- [ ] **Employee Representatives** - For workplace surveillance
- [ ] **Affected Data Subjects** - Candidates and applicants
- [ ] **External Expert** - AI ethics specialist

### 8. Approval and Sign-Off

This DPIA requires approval from:

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Project Sponsor | | | | ⬜ Pending |
| Data Protection Officer | | | | ⬜ Pending |
| CISO / Security Lead | | | | ⬜ Pending |
| Legal Counsel | | | | ⬜ Pending |
| HR Director | | | | ⬜ Pending |

**Next Review Date**: 2025-08-01 (6 months)

---

**Document Information**
- **Version**: 1.0
- **Last Updated**: 2025-01-20
- **Approved By**: [Pending]
- **Review Schedule**: Every 6 months or after significant changes

**Attachments**:
1. Data Flow Diagram
2. Processed Data Inventory
3. Vendor Risk Assessment
4. Security Measures Checklist
5. Data Breach Response Plan
```

## DPIA Best Practices

1. **Start Early** - Conduct DPIA before processing begins
2. **Be Thorough** - Don't underestimate risks or overstate mitigations
3. **Document Everything** - Keep detailed records of decisions and rationale
4. **Consult Widely** - Include DPO, legal, security, and affected parties
5. **Review Regularly** - Update DPIA when processing or risks change
6. **Be Transparent** - Publish summary of DPIA where appropriate
7. **Monitor Compliance** - Track whether mitigations are effective
