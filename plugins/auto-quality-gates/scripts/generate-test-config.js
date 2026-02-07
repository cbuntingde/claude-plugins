#!/usr/bin/env node
/**
 * Generate Test Configuration
 * Creates CI/CD configuration files for quality gates
 */

const fs = require('fs');
const path = require('path');

/**
 * Test Configuration Generator
 */
class TestConfigGenerator {
  constructor() {
    this.templates = {
      github: `name: Quality Gates

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Check coverage
        run: npm run test:coverage

      - name: Security scan
        run: npm audit --audit-level=high
`,
      gitlab: `stages:
  - test
  - quality

test:
  stage: test
  script:
    - npm test
  coverage: '/All files[^|]*\|[^|]*\\s+([\\d\\.]+)/'
  artifacts:
    reports:
      junit: junit.xml

linting:
  stage: quality
  script:
    - npm run lint
  allow_failure: false

coverage:
  stage: quality
  script:
    - npm run test:coverage
  coverage_report:
    coverage_format: cobertura
    coverage_file: coverage/cobertura-coverage.xml
`,
      jenkins: `pipeline {
  agent any

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
    }

    stage('Coverage') {
      steps {
        sh 'npm run test:coverage'
      }
    }

    stage('Security') {
      steps {
        sh 'npm audit --audit-level=high'
      }
    }
  }

  post {
    always {
      junit 'junit.xml'
      publishHTML([
        reportDir: 'coverage',
        reportFiles: 'index.html',
        reportName: 'Coverage Report'
      ])
    }
  }
}`
    };
  }

  /**
   * Generate CI/CD configuration
   */
  async generate(target, options = {}) {
    const template = this.templates[target.toLowerCase()];

    if (!template) {
      throw new Error(`Unknown CI/CD platform: ${target}. Supported: github, gitlab, jenkins`);
    }

    const fileName = this.getFileName(target);
    await fs.promises.writeFile(fileName, template);

    return { file: fileName, platform: target };
  }

  /**
   * Get configuration file name
   */
  getFileName(target) {
    const names = {
      github: '.github/workflows/quality-gates.yml',
      gitlab: '.gitlab-ci.yml',
      jenkins: 'Jenkinsfile'
    };
    return names[target.toLowerCase()] || 'ci-config.yml';
  }

  /**
   * Print generated config info
   */
  printResult(result) {
    console.log('\n' + '='.repeat(60));
    console.log('CI/CD CONFIGURATION GENERATED');
    console.log('='.repeat(60));
    console.log(`\nPlatform: ${result.platform}`);
    console.log(`File: ${result.file}`);
    console.log('\nNext steps:');
    console.log('  1. Review the generated configuration');
    console.log('  2. Customize as needed for your project');
    console.log('  3. Commit and push to trigger CI/CD');
    console.log('='.repeat(60));
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const generator = new TestConfigGenerator();

  let target = 'github';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--target' || arg === '-t') {
      target = args[++i] || 'github';
    }
  }

  try {
    const result = await generator.generate(target);
    generator.printResult(result);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('\nSupported platforms: github, gitlab, jenkins');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TestConfigGenerator;