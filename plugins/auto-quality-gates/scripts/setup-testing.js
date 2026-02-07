#!/usr/bin/env node
/**
 * Setup Testing Framework
 * Initializes testing framework for the project
 */

const fs = require('fs');
const path = require('path');

/**
 * Testing Framework Setup
 */
class TestingSetup {
  constructor() {
    this.frameworks = {
      jest: {
        config: {
          testEnvironment: 'node',
          collectCoverageFrom: ['**/*.js', '!**/node_modules/**'],
          coverageDirectory: 'coverage',
          coverageReporters: ['text', 'lcov'],
          testMatch: ['**/*.test.js']
        },
        devDependencies: ['jest'],
        scripts: {
          test: 'jest',
          'test:watch': 'jest --watch',
          'test:coverage': 'jest --coverage'
        }
      },
      vitest: {
        config: {
          testEnvironment: 'node',
          include: ['**/*.test.js']
        },
        devDependencies: ['vitest'],
        scripts: {
          test: 'vitest',
          'test:run': 'vitest run',
          'test:coverage': 'vitest run --coverage'
        }
      },
      mocha: {
        config: {
          spec: ['**/*.test.js'],
          recursive: true
        },
        devDependencies: ['mocha', 'chai'],
        scripts: {
          test: 'mocha',
          'test:watch': 'mocha --watch'
        }
      },
      pytest: {
        dependencies: ['pytest', 'pytest-cov'],
        scripts: {
          test: 'pytest',
          'test:coverage': 'pytest --cov'
        }
      }
    };
  }

  /**
   * Setup testing framework
   */
  async setup(framework, options = {}) {
    const config = this.frameworks[framework.toLowerCase()];

    if (!config) {
      throw new Error(`Unknown framework: ${framework}. Supported: jest, vitest, mocha, pytest`);
    }

    const projectRoot = process.cwd();
    const isPyProject = fs.existsSync('pyproject.toml') || fs.existsSync('requirements.txt');

    // Check for existing package.json or pyproject.toml
    let pkg = { scripts: {}, devDependencies: {} };

    if (fs.existsSync('package.json')) {
      pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    }

    // Add scripts
    pkg.scripts = { ...pkg.scripts, ...config.scripts };

    // Add devDependencies
    for (const dep of config.devDependencies || []) {
      pkg.devDependencies[dep] = '^0.0.1';
    }

    // Write package.json
    await fs.promises.writeFile('package.json', JSON.stringify(pkg, null, 2));

    // Generate config file
    if (config.config) {
      const configName = this.getConfigName(framework);
      await fs.promises.writeFile(configName, JSON.stringify(config.config, null, 2));
    }

    return {
      framework,
      configFile: this.getConfigName(framework),
      scriptsAdded: Object.keys(config.scripts),
      devDependenciesAdded: config.devDependencies || []
    };
  }

  /**
   * Get config file name
   */
  getConfigName(framework) {
    const names = {
      jest: 'jest.config.json',
      vitest: 'vitest.config.js',
      mocha: '.mocharc.json',
      pytest: 'pytest.ini'
    };
    return names[framework.toLowerCase()] || 'test.config.json';
  }

  /**
   * Print setup info
   */
  printSetup(result) {
    console.log('\n' + '='.repeat(60));
    console.log('TESTING FRAMEWORK SETUP');
    console.log('='.repeat(60));

    console.log(`\nFramework: ${result.framework}`);
    console.log(`Config file: ${result.configFile}`);
    console.log('\nScripts added:');
    for (const script of result.scriptsAdded) {
      console.log(`  - npm run ${script}`);
    }
    console.log('\nDependencies to install:');
    for (const dep of result.devDependenciesAdded) {
      console.log(`  - npm install --save-dev ${dep}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Next steps:');
    console.log('  1. Run: npm install');
    console.log('  2. Write tests (see your config file for patterns)');
    console.log('  3. Run: npm test');
    console.log('='.repeat(60));
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const setup = new TestingSetup();

  let framework = 'jest';
  let options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--framework' || arg === '-f') {
      framework = args[++i] || 'jest';
    }
  }

  try {
    const result = await setup.setup(framework, options);
    setup.printSetup(result);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('\nSupported frameworks: jest, vitest, mocha, pytest');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TestingSetup;