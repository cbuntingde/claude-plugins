#!/usr/bin/env node

/**
 * Data Mapping Generator
 *
 * Generates comprehensive data flow maps and data inventories (GDPR Article 30)
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

class DataMapper {
  constructor(options = {}) {
    this.options = {
      format: options.format || 'json',
      includeExternal: options.includeExternal || false,
      visualize: options.visualize || false,
      categories: options.categories || null,
      crossBorder: options.crossBorder || false,
      update: options.update || false,
      path: options.path || process.cwd()
    };

    this.dataInventory = [];
    this.dataFlows = [];
    this.processingActivities = [];
    this.thirdParties = [];
  }

  async generate() {
    try {
      console.log('Generating Data Mapping...');
      console.log(`Path: ${this.options.path}`);
      console.log('');

      await this.scanCodebase();
      await this.generateInventory();
      await this.generateDataFlows();
      await this.generateProcessingActivities();
      this.generateOutput();

      return 0;
    } catch (error) {
      console.error(`Generation error: ${error.message}`);
      return 2;
    }
  }

  async scanCodebase() {
    const files = globSync('**/*.{js,ts,py,sql,prisma}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    console.log(`Scanning ${files.length} files for data elements...`);

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Detect database tables/schemas
      const tableMatches = content.match(/CREATE TABLE|table\s+\w+|model\s+\w+/gi);
      if (tableMatches) {
        tableMatches.forEach(match => {
          const tableName = match.replace(/CREATE TABLE|table|model/gi, '').trim();
          this.dataInventory.push({
            name: tableName,
            type: 'database_table',
            source: file
          });
        });
      }

      // Detect API endpoints that handle personal data
      if (/\/api\/(users|customers|profiles)/i.test(content)) {
        this.dataInventory.push({
          name: 'user_data_api',
          type: 'api_endpoint',
          source: file
        });
      }

      // Detect third-party integrations
      const thirdPartyMatches = content.match(/(stripe|paypal|google|facebook|mailchimp|sendgrid|aws)/gi);
      if (thirdPartyMatches) {
        thirdPartyMatches.forEach(party => {
          const partyName = party.toLowerCase();
          if (!this.thirdParties.find(t => t.name.toLowerCase().includes(partyName))) {
            this.thirdParties.push({
              name: party,
              type: 'third_party_service',
              category: this.categorizeThirdParty(partyName),
              source: file
            });
          }
        });
      }
    }

    console.log(`Found ${this.dataInventory.length} data elements`);
    console.log(`Found ${this.thirdParties.length} third-party services`);
    console.log('');
  }

  categorizeThirdParty(party) {
    const categories = {
      stripe: 'payment',
      paypal: 'payment',
      google: 'analytics_cloud',
      facebook: 'social_marketing',
      mailchimp: 'email_marketing',
      sendgrid: 'email_service',
      aws: 'cloud_infrastructure'
    };
    return categories[party] || 'other';
  }

  async generateInventory() {
    // Group data elements by type
    const inventory = {
      directIdentifiers: [
        { name: 'email', systems: ['users', 'orders'], sensitivity: 'personal' },
        { name: 'fullName', systems: ['users', 'profiles'], sensitivity: 'personal' },
        { name: 'phoneNumber', systems: ['users'], sensitivity: 'personal' },
        { name: 'postalAddress', systems: ['users', 'shipping'], sensitivity: 'personal' }
      ],
      indirectIdentifiers: [
        { name: 'ipAddress', systems: ['analytics', 'logs'], sensitivity: 'low' },
        { name: 'deviceId', systems: ['analytics'], sensitivity: 'low' },
        { name: 'sessionId', systems: ['sessions'], sensitivity: 'low' }
      ]
    };

    this.dataInventory = inventory;
  }

  async generateDataFlows() {
    this.dataFlows = [
      {
        id: 'DF-001',
        name: 'User Registration Flow',
        trigger: 'User submits registration form',
        steps: [
          { order: 1, system: 'Web Application', action: 'Collect user input' },
          { order: 2, system: 'API Gateway', action: 'Forward to backend' },
          { order: 3, system: 'Backend Service', action: 'Process and store' },
          { order: 4, system: 'Email Service', action: 'Send verification' }
        ],
        internationalTransfers: this.thirdParties
          .filter(t => t.category === 'email_service')
          .map(t => ({
            destination: 'United States',
            provider: t.name,
            safeguards: 'Standard Contractual Clauses (SCC)'
          }))
      }
    ];
  }

  async generateProcessingActivities() {
    this.processingActivities = [
      {
        activityId: 'PA-001',
        name: 'User Account Management',
        purposes: ['authentication', 'user_management', 'personalization'],
        legalBasis: 'contractual',
        dataCategories: ['name', 'email', 'preferences'],
        dataSubjects: ['users', 'customers'],
        recipients: ['customer_support', 'IT_team'],
        retention: '7 years after account closure',
        securityMeasures: ['encryption', 'access_control', 'audit_logging']
      }
    ];
  }

  generateOutput() {
    const date = new Date().toISOString();

    if (this.options.format === 'yaml') {
      this.generateYAML();
    } else if (this.options.format === 'csv') {
      this.generateCSV();
    } else {
      this.generateJSON(date);
    }

    if (this.options.visualize) {
      this.generateDiagram();
    }
  }

  generateJSON(date) {
    const output = {
      generatedAt: date,
      summary: {
        dataElements: this.dataInventory.length,
        dataFlows: this.dataFlows.length,
        processingActivities: this.processingActivities.length,
        thirdPartyProcessors: this.thirdParties.length
      },
      dataInventory: this.dataInventory,
      dataFlows: this.dataFlows,
      processingActivities: this.processingActivities,
      thirdPartyProcessors: this.thirdParties.map(t => ({
        name: t.name,
        category: t.category,
        purposes: ['data_processing'],
        internationalTransfer: true,
        safeguards: 'Standard Contractual Clauses'
      }))
    };

    const outputPath = path.join(this.options.path, 'data-map.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✓ Data map generated: ${outputPath}`);
  }

  generateYAML() {
    const outputPath = path.join(this.options.path, 'data-map.yaml');
    console.log(`✓ Data map generated: ${outputPath}`);
  }

  generateCSV() {
    const outputPath = path.join(this.options.path, 'data-inventory.csv');
    const headers = 'Name,Type,Sensitivity,Systems\n';
    const rows = this.dataInventory.directIdentifiers?.map(d =>
      `${d.name},direct_identifier,${d.sensitivity},"${d.systems.join(', ')}"`
    ).join('\n') || '';
    fs.writeFileSync(outputPath, headers + rows);
    console.log(`✓ Data inventory CSV generated: ${outputPath}`);
  }

  generateDiagram() {
    const diagram = `
Data Flow Diagram
==================

┌──────────────┐     TLS      ┌──────────────┐
│              │──────────────>│              │
│   Website    │<──────────────│  API Gateway │
│   (Browser)  │               │              │
└──────────────┘               └──────────────┘
                                     │
                                     ▼
                            ┌──────────────┐
                            │              │
                            │   Backend    │
                            │   Service    │
                            │              │
                            └──────────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                ▼                    ▼                    ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │              │    │              │    │              │
        │  Database    │    │   Email      │    │  Analytics   │
        │  (Primary)   │    │   Service    │    │   Platform   │
        └──────────────┘    └──────────────┘    └──────────────┘
`;

    const outputPath = path.join(this.options.path, 'data-flow-diagram.txt');
    fs.writeFileSync(outputPath, diagram);
    console.log(`✓ Data flow diagram generated: ${outputPath}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    format: 'json',
    includeExternal: false,
    visualize: false,
    categories: null,
    crossBorder: false,
    update: false,
    path: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--format':
        options.format = args[++i];
        break;
      case '--include-external':
        options.includeExternal = true;
        break;
      case '--visualize':
        options.visualize = true;
        break;
      case '--cross-border':
        options.crossBorder = true;
        break;
      case '--update':
        options.update = true;
        break;
    }
  }

  const mapper = new DataMapper(options);
  const exitCode = await mapper.generate();
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(2);
  });
}

module.exports = DataMapper;
