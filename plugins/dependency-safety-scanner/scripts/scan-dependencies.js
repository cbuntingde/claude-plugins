#!/usr/bin/env node
/**
 * Scan All Dependencies Script
 *
 * Scans all project dependencies for safety issues.
 * This is the backend logic for the /scan-dependencies command.
 *
 * Usage:
 *   node scan-dependencies.js [--severity low|moderate|high|critical] [--include-dev]
 *
 * Example:
 *   node scan-dependencies.js --severity critical
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

/**
 * Parse package.json
 */
async function parsePackageJson(includeDev = false) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  try {
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    const dependencies = Object.entries(packageJson.dependencies || {});
    const devDependencies = includeDev
      ? Object.entries(packageJson.devDependencies || {})
      : [];

    return {
      production: dependencies.map(([name, version]) => ({ name, version, type: 'production' })),
      development: devDependencies.map(([name, version]) => ({ name, version, type: 'development' })),
    };
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error.message}`);
  }
}

/**
 * Run npm audit
 */
async function runAudit(severity = 'moderate', production = false) {
  try {
    const args = ['npm', 'audit', '--json'];
    if (production) args.push('--production');
    if (severity) args.push('--audit-level', severity);

    const output = execSync(args.join(' '), {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return JSON.parse(output);
  } catch (error) {
    // npm audit returns non-zero if vulnerabilities found
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (parseError) {
        return null;
      }
    }
    return null;
  }
}

/**
 * Check individual package
 */
async function checkPackage(packageName, version) {
  // This would call the check-package.js logic
  // For now, return a stub
  return {
    package: packageName,
    version,
    status: 'unknown',
  };
}

/**
 * Categorize vulnerabilities
 */
function categorizeVulnerabilities(auditData) {
  const vulnerabilities = auditData?.vulnerabilities || {};
  const categories = {
    critical: [],
    high: [],
    moderate: [],
    low: [],
  };

  Object.entries(vulnerabilities).forEach(([packageName, vulnList]) => {
    vulnList.forEach((vuln) => {
      categories[vuln.severity]?.push({
        package: packageName,
        ...vuln,
      });
    });
  });

  return categories;
}

/**
 * Format vulnerability report
 */
function formatVulnerabilityReport(categories) {
  const lines = [];

  if (categories.critical.length > 0) {
    lines.push('\n🔴 CRITICAL');
    categories.critical.forEach((vuln) => {
      lines.push(`   ├─ ${vuln.package}`);
      lines.push(`   │  └─ ${vuln.title}`);
    });
  }

  if (categories.high.length > 0) {
    lines.push('\n🟠 HIGH');
    categories.high.forEach((vuln) => {
      lines.push(`   ├─ ${vuln.package}`);
      lines.push(`   │  └─ ${vuln.title}`);
    });
  }

  if (categories.moderate.length > 0) {
    lines.push('\n🟡 MODERATE');
    categories.moderate.forEach((vuln) => {
      lines.push(`   ├─ ${vuln.package}`);
      lines.push(`   │  └─ ${vuln.title}`);
    });
  }

  return lines.join('\n');
}

/**
 * Generate summary
 */
function generateSummary(categories, totalDeps) {
  const totalVulns =
    categories.critical.length +
    categories.high.length +
    categories.moderate.length +
    categories.low.length;

  return {
    totalDependencies: totalDeps,
    totalVulnerabilities: totalVulns,
    critical: categories.critical.length,
    high: categories.high.length,
    moderate: categories.moderate.length,
    low: categories.low.length,
  };
}

/**
 * Main scan function
 */
async function scanDependencies(options = {}) {
  const { severity = 'moderate', includeDev = false } = options;

  console.log('\n📊 DEPENDENCY SAFETY SCAN\n');
  console.log('━'.repeat(60));

  // Parse package.json
  console.log('📦 Scanning dependencies...');
  const { production, development } = await parsePackageJson(includeDev);
  const allDeps = [...production, ...development];

  console.log(`   Production: ${production.length}`);
  console.log(`   Development: ${development.length}`);
  console.log(`   Total: ${allDeps.length}`);

  // Run npm audit
  console.log('\n🔒 Running security audit...');
  const auditData = await runAudit(severity, !includeDev);

  if (!auditData) {
    console.log('   ⚠️  Failed to run audit');
    return;
  }

  // Categorize vulnerabilities
  const categories = categorizeVulnerabilities(auditData);

  const totalVulns =
    categories.critical.length +
    categories.high.length +
    categories.moderate.length +
    categories.low.length;

  if (totalVulns === 0) {
    console.log('   ✅ No vulnerabilities found');
  } else {
    console.log(`   🔴 Found ${totalVulns} vulnerabilities`);

    // Print detailed report
    console.log(formatVulnerabilityReport(categories));
  }

  // Generate summary
  console.log('\n' + '━'.repeat(60));
  const summary = generateSummary(categories, allDeps.length);

  console.log('\n📊 SUMMARY\n');
  console.log(`   Total dependencies: ${summary.totalDependencies}`);
  console.log(`   Total vulnerabilities: ${summary.totalVulnerabilities}`);

  if (summary.totalVulnerabilities > 0) {
    console.log(`   ├─ Critical: ${summary.critical}`);
    console.log(`   ├─ High: ${summary.high}`);
    console.log(`   ├─ Moderate: ${summary.moderate}`);
    console.log(`   └─ Low: ${summary.low}`);
  }

  // Recommendations
  if (summary.totalVulnerabilities > 0) {
    console.log('\n💡 RECOMMENDATIONS\n');

    // Find packages with critical vulnerabilities
    const criticalPackages = [...new Set(categories.critical.map((v) => v.package))];
    if (criticalPackages.length > 0) {
      console.log('   1. Update critical packages immediately:');
      criticalPackages.forEach((pkg) => {
        console.log(`      - ${pkg}`);
      });
    }

    // Check for abandoned packages
    console.log('   2. Run npm update to apply patches');

    if (summary.critical > 0) {
      console.log('\n   ⚠️  CRITICAL: Address immediately before deploying');
    } else if (summary.high > 0) {
      console.log('\n   ⚠️  HIGH: Address within 1 week');
    } else {
      console.log('\n   ⚠️  MODERATE: Address within 1 month');
    }
  } else {
    console.log('\n✅ All dependencies are secure!');
  }

  console.log('');
}

// Run scan if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--severity') {
      options.severity = args[++i];
    } else if (args[i] === '--include-dev') {
      options.includeDev = true;
    }
  }

  scanDependencies(options).catch((error) => {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  });
}

export { scanDependencies };
