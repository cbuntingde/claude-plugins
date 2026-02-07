#!/usr/bin/env node

/**
 * Privacy Impact Assessment Generator
 *
 * Generates DPIA templates as required by GDPR Article 35
 */

const fs = require('fs');
const path = require('path');

const DPIA_TEMPLATES = {
  minimal: {
    sections: ['project_info', 'processing_description', 'risk_assessment', 'mitigation']
  },
  standard: {
    sections: ['project_info', 'processing_description', 'necessity', 'risk_assessment', 'mitigation', 'consultation', 'approval']
  },
  comprehensive: {
    sections: ['project_info', 'processing_description', 'necessity', 'risk_assessment', 'mitigation', 'residual_risk', 'consultation', 'approval', 'appendices']
  }
};

class DPIAGenerator {
  constructor(options = {}) {
    this.options = {
      project: options.project || null,
      template: options.template || 'standard',
      output: options.output || 'markdown',
      stakeholders: options.stakeholders ? options.stakeholders.split(',') : [],
      update: options.update || false,
      review: options.review || false,
      path: options.path || process.cwd()
    };
  }

  async generate() {
    try {
      console.log('Generating Privacy Impact Assessment...');
      console.log('');

      if (!this.options.project) {
        console.error('Error: --project name is required');
        console.error('Usage: /privacy-impact-assessment --project "Project Name"');
        return 2;
      }

      const template = DPIA_TEMPLATES[this.options.template] || DPIA_TEMPLATES.standard;
      const content = this.generateDPIA(template);

      const filename = `dpia-${this.slugify(this.options.project)}.md`;
      const outputPath = path.join(this.options.path, filename);

      if (this.options.update && fs.existsSync(outputPath)) {
        console.log(`Updating existing DPIA: ${outputPath}`);
      } else {
        console.log(`Generating new DPIA: ${outputPath}`);
      }

      fs.writeFileSync(outputPath, content);
      console.log(`✓ DPIA generated: ${outputPath}`);
      console.log('');

      return 0;
    } catch (error) {
      console.error(`Generation error: ${error.message}`);
      return 2;
    }
  }

  slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  }

  generateDPIA(template) {
    const date = new Date().toISOString().split('T')[0];
    const project = this.options.project;

    return `# Data Protection Impact Assessment
## ${project}

**Status**: INCOMPLETE
**Generated**: ${date}
**Template**: ${this.options.template}

---

## 1. Project Information

| Field | Value |
|-------|-------|
| Project Name | ${project} |
| Project Owner | [To be completed] |
| DPIA Lead | [To be completed] |
| Start Date | [To be completed] |
| Legal Basis | [Article 6(1)(a) - Consent / Article 6(1)(b) - Contractual / Article 6(1)(f) - Legitimate Interest] |
| Special Category Data | [Yes/No] |
| Automated Decision Making | [Yes/No] |

### 1.1 Project Description

[Brief description of the project and its objectives]

### 1.2 Stakeholders

${this.options.stakeholders.length > 0 ? this.options.stakeholders.map(s => `- ${s}`).join('\n') : '- [List stakeholders]'}

---

## 2. Processing Description

### 2.1 Purpose

[Describe why the processing is necessary]

### 2.2 Data Categories

- [ ] Direct identifiers (name, email, phone)
- [ ] Indirect identifiers (IP address, device ID)
- [ ] Special category data (health, biometrics, political opinions)
- [ ] Criminal convictions data

### 2.3 Data Subjects

[Describe categories of individuals whose data will be processed]

### 2.4 Data Sources

[Where will the data come from?]

- Direct collection from data subjects
- Third-party sources
- Publicly available sources
- Other: [specify]

### 2.5 Data Flows

\`\`\`
[Create data flow diagram showing how data moves through systems]
\`\`\`

### 2.6 Third Parties

[List all third parties who will receive personal data]

| Third Party | Purpose | Country | Safeguards |
|-------------|---------|---------|------------|
| | | | |

### 2.7 Retention Period

[How long will data be kept?]

---

## 3. Necessity and Proportionality

### 3.1 Is Processing Necessary?

✅ / ⚠️ / ❌

[Justify why the processing is necessary]

### 3.2 Less Intrusive Alternatives

Consider the following alternatives:

| Alternative | Description | Why Not Chosen? |
|-------------|-------------|-----------------|
| Rule-based processing | [Describe] | [Explain] |
| Anonymised data | [Describe] | [Explain] |
| Manual processing | [Describe] | [Explain] |

### 3.3 Data Minimisation

✅ / ❌ Data is minimised to what is strictly necessary

[Describe how data minimisation is achieved]

---

## 4. Risk Assessment

### 4.1 Risk Matrix

| Risk | Likelihood | Impact | Overall Risk | Mitigation |
|------|------------|--------|--------------|------------|
| Unauthorised access | [Low/Medium/High] | [Low/Medium/High/Very High] | | |
| Data breach | | | | |
| Privacy violation | | | | |
| Algorithmic discrimination | | | | |
| Lack of transparency | | | | |

### 4.2 Identified Risks

#### Risk 1: [Risk Name]

**Description**: [Describe the risk]

**Affected Rights**:
- Article [X] - [Right name]
- Article [X] - [Right name]

**Likelihood**: [Low/Medium/High]

**Impact**: [Low/Medium/High/Very High]

**Consequences**: [What could happen if risk materialises]

---

## 5. Mitigation Measures

### 5.1 Technical Measures

- [ ] Encryption at rest and in transit
- [ ] Access control and authentication
- [ ] Pseudonymization and anonymization
- [ ] Secure development lifecycle
- [ ] Regular security testing

### 5.2 Organisational Measures

- [ ] Staff training and awareness
- [ ] Data processing agreements
- [ ] Privacy policies and notices
- [ ] Incident response procedures

### 5.3 Legal Measures

- [ ] Data processing contracts
- [ ] Standard contractual clauses
- [ ] Binding corporate rules

---

## 6. Residual Risk

**Risk Before Mitigation**: [HIGH/MEDIUM/LOW]
**Risk After Mitigation**: [HIGH/MEDIUM/LOW]
**Is residual risk acceptable?**: ✅ Yes / ❌ No

**If NO, additional measures required**:
- [Describe additional measures needed]

---

## 7. Consultation

Before proceeding, consultation required with:

- [ ] **Data Protection Officer** - Required under Article 35(9)
- [ ] **Supervisory Authority** - Required given high risk
- [ ] **Data Subjects** - Affected individuals
- [ ] **Other**: [Specify]

### 7.1 DPO Consultation

**Date**: [Date]
**Feedback**: [DPO feedback]
**Approval**: ✅ / ❌

### 7.2 Authority Consultation (if required)

**Date**: [Date]
**Outcome**: [Consultation outcome]

---

## 8. Approval and Sign-Off

This DPIA requires approval from:

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Project Sponsor | | | | ⬜ Pending |
| Data Protection Officer | | | | ⬜ Pending |
| CISO / Security Lead | | | | ⬜ Pending |
| Legal Counsel | | | | ⬜ Pending |

**Next Review Date**: [Date - typically within 6 months]

---

## 9. Appendices

### 9.1 Data Flow Diagram

[Attach data flow diagram]

### 9.2 Processed Data Inventory

[List all personal data to be processed]

### 9.3 Vendor Risk Assessment

[Assess third-party risks]

### 9.4 Security Measures Checklist

- [ ] TLS 1.2+ for data in transit
- [ ] AES-256 for data at rest
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Incident response plan
- [ ] Regular security reviews

---

**Document Information**
- **Version**: 1.0
- **Last Updated**: ${date}
- **Approved By**: [Pending]
- **Review Schedule**: Every 6 months or after significant changes

---

## Next Steps

1. ✅ Complete all sections marked with [To be completed]
2. ✅ Conduct thorough risk assessment
3. ✅ Identify and implement mitigation measures
4. ✅ Consult with DPO and relevant stakeholders
5. ✅ Obtain necessary approvals
6. ✅ Review and update DPIA periodically
`;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    project: null,
    template: 'standard',
    output: 'markdown',
    stakeholders: null,
    update: false,
    review: false,
    path: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--project':
      case '-p':
        options.project = args[++i];
        break;
      case '--template':
        options.template = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--stakeholders':
        options.stakeholders = args[++i];
        break;
      case '--update':
        options.update = true;
        break;
      case '--review':
        options.review = true;
        break;
    }
  }

  const generator = new DPIAGenerator(options);
  const exitCode = await generator.generate();
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(2);
  });
}

module.exports = DPIAGenerator;
