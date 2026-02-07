#!/usr/bin/env node
/**
 * Configure Quality Gates
 * Sets up quality gate thresholds and rules
 */

const fs = require('fs');
const path = require('path');

/**
 * Quality Gates Configurator
 */
class QualityGatesConfigurator {
  constructor() {
    this.defaultGates = {
      coverage: {
        threshold: 80,
        branches: true,
        functions: true,
        lines: true,
        statements: true
      },
      linting: {
        rules: 'standard',
        autoFix: true,
        failOnErrors: true
      },
      security: {
        enabled: true,
        scanDependencies: true,
        failOnVulnerabilities: true
      },
      testing: {
        framework: 'jest',
        coverageThreshold: 80
      }
    };
  }

  /**
   * Configure quality gates
   */
  async configure(options = {}) {
    const config = {
      version: '1.0.0',
      updated: new Date().toISOString(),
      coverage: {
        threshold: options.coverageThreshold || this.defaultGates.coverage.threshold,
        branches: true,
        functions: true,
        lines: true,
        statements: true
      },
      linting: {
        rules: options.lintRules || this.defaultGates.linting.rules,
        autoFix: options.autoFix !== false,
        failOnErrors: true
      },
      security: {
        enabled: options.securityChecks !== false,
        scanDependencies: true,
        failOnVulnerabilities: true
      },
      testing: {
        framework: options.framework || this.defaultGates.testing.framework,
        coverageThreshold: options.coverageThreshold || this.defaultGates.testing.coverageThreshold
      }
    };

    const configPath = '.quality-gates.json';
    await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));

    return { configPath, config };
  }

  /**
   * Print configuration
   */
  printConfig(config) {
    console.log('\n' + '='.repeat(60));
    console.log('QUALITY GATES CONFIGURATION');
    console.log('='.repeat(60));

    console.log(`\nCoverage Threshold: ${config.coverage.threshold}%`);
    console.log(`Linting Rules: ${config.linting.rules}`);
    console.log(`Auto-fix: ${config.linting.autoFix ? 'Enabled' : 'Disabled'}`);
    console.log(`Security Scanning: ${config.security.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`Testing Framework: ${config.testing.framework}`);

    console.log('\n' + '='.repeat(60));
    console.log(`Configuration saved to: .quality-gates.json`);
    console.log('='.repeat(60));
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const configurator = new QualityGatesConfigurator();

  let options = {
    coverageThreshold: 80,
    lintRules: 'standard',
    securityChecks: true,
    framework: 'jest',
    autoFix: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--coverage-threshold' || arg === '-c') {
      options.coverageThreshold = parseInt(args[++i]) || 80;
    } else if (arg === '--lint-rules' || arg === '-l') {
      options.lintRules = args[++i] || 'standard';
    } else if (arg === '--security-checks' || arg === '-s') {
      options.securityChecks = args[++i] !== 'false';
    } else if (arg === '--framework' || arg === '-f') {
      options.framework = args[++i] || 'jest';
    } else if (arg === '--no-auto-fix') {
      options.autoFix = false;
    }
  }

  try {
    const result = await configurator.configure(options);
    configurator.printConfig(result.config);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = QualityGatesConfigurator;