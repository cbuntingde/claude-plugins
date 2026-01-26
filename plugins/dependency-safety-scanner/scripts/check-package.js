#!/usr/bin/env node
/**
 * Check Package Safety Script
 *
 * Comprehensive safety check for a single package before installation.
 * This is the backend logic for the /check-package command.
 *
 * Usage:
 *   node check-package.js <package-name>[@version]
 *
 * Example:
 *   node check-package.js lodash@4.17.21
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';

// Security constants
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB max response size
const ALLOWED_TEMP_DIR = path.join(process.cwd(), '.dependency-safety-temp');

/**
 * Fetch package metadata from npm registry
 */
async function getPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

    https.get(url, (res) => {
      let data = '';
      let size = 0;

      res.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_RESPONSE_SIZE) {
          reject(new Error('Response exceeds maximum allowed size'));
          res.destroy();
          return;
        }
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Validate temp directory path to prevent path traversal
 */
function validateTempDir(requestedDir) {
  const resolved = path.resolve(ALLOWED_TEMP_DIR, requestedDir || '');
  const baseResolved = path.resolve(ALLOWED_TEMP_DIR);

  // Prevent traversal outside allowed temp directory
  if (!resolved.startsWith(baseResolved)) {
    throw new Error('Access denied: directory path is outside allowed scope');
  }

  return path.normalize(resolved);
}

/**
 * Check bundle size from Bundlephobia
 */
async function getBundleSize(packageName, version) {
  return new Promise((resolve) => {
    const url = `https://bundlephobia.com/api/size?package=${packageName}@${version}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * Get vulnerability data from npm audit
 */
async function checkVulnerabilities(packageName, version) {
  try {
    // Create temp directory for audit with path validation
    const tempDir = validateTempDir('');
    await fs.mkdir(tempDir, { recursive: true });

    // Create minimal package.json
    const packageJson = {
      dependencies: {
        [packageName]: version,
      },
    };
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Run npm audit
    const auditOutput = execSync('npm audit --json', {
      cwd: tempDir,
      encoding: 'utf-8',
    });

    const auditData = JSON.parse(auditOutput);

    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });

    return auditData;
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
 * Parse package name and version
 */
function parsePackageArg(packageArg) {
  const match = packageArg.match(/^(@?[^@]+)@?(.*)$/);
  if (!match) {
    throw new Error(`Invalid package format: ${packageArg}`);
  }

  const [, name, version] = match;
  return { name, version: version || 'latest' };
}

/**
 * Calculate safety score
 */
function calculateSafetyScore(analysis) {
  let score = 100;
  let issues = [];

  // Vulnerabilities (-30 per critical, -20 per high, -10 per moderate)
  if (analysis.vulnerabilities) {
    const critical = analysis.vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = analysis.vulnerabilities.filter(v => v.severity === 'high').length;
    const moderate = analysis.vulnerabilities.filter(v => v.severity === 'moderate').length;

    score -= (critical * 30) + (high * 20) + (moderate * 10);

    if (critical > 0) {
      issues.push(`${critical} critical vulnerabilities`);
    }
  }

  // Abandonment risk
  if (analysis.maintainer.lastPublish > 365) {
    score -= 20;
    issues.push('Package appears abandoned');
  }

  // Bloat
  if (analysis.bundle && analysis.bundle.gzip > 200000) {
    score -= 10;
    issues.push('Large bundle size');
  }

  if (analysis.bundle && analysis.bundle.dependencyCount > 50) {
    score -= 15;
    issues.push('Excessive dependencies');
  }

  // License issues
  if (analysis.license && analysis.license.risk === 'high') {
    score -= 25;
    issues.push('Problematic license');
  }

  return {
    score: Math.max(0, score),
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
    issues,
  };
}

/**
 * Main analysis function
 */
async function analyzePackage(packageArg) {
  console.log(`\n🔍 DEPENDENCY SAFETY CHECK: ${packageArg}\n`);
  console.log('━'.repeat(60));

  try {
    // Parse package name and version
    const { name, version } = parsePackageArg(packageArg);

    // Get package info from npm
    console.log('📦 Fetching package metadata...');
    const packageInfo = await getPackageInfo(name);
    const versionData = packageInfo.versions[version] || packageInfo.versions[packageInfo['dist-tags'][version]];
    const latestVersion = packageInfo['dist-tags'].latest;

    console.log(`   Package: ${name}`);
    console.log(`   Version: ${versionData.version} (latest: ${latestVersion})`);
    console.log(`   License: ${versionData.license || 'Unknown'}`);

    // Get maintainer info
    const maintainer = versionData.author || versionData.maintainers?.[0];
    console.log(`   Maintainer: ${maintainer?.name || maintainer || 'Unknown'}`);

    console.log('');
    console.log('🔒 Checking for vulnerabilities...');
    const auditData = await checkVulnerabilities(name, versionData.version);
    const vulns = auditData?.vulnerabilities?.[name] || [];

    if (vulns.length === 0) {
      console.log(`   ${'✅'.green} No known vulnerabilities`);
    } else {
      console.log(`   ${'🔴'.red} Found ${vulns.length} vulnerabilities:`);
      vulns.forEach(vuln => {
        console.log(`      - ${vuln.title} (${vuln.severity})`);
      });
    }

    console.log('');
    console.log('📦 Checking bundle size...');
    const bundleData = await getBundleSize(name, versionData.version);

    if (bundleData) {
      const size = bundleData.gzip / 1024;
      const depCount = bundleData.dependencyCount;
      console.log(`   Minified: ${(bundleData.size / 1024).toFixed(1)} KB`);
      console.log(`   Gzipped: ${size.toFixed(1)} KB`);
      console.log(`   Dependencies: ${depCount}`);

      if (size > 200) {
        console.log(`   ${'⚠️'.yellow} Large bundle size`);
      }
      if (depCount > 50) {
        console.log(`   ${'⚠️'.yellow} High dependency count`);
      }
    } else {
      console.log('   ℹ️  Bundle size data not available');
    }

    console.log('');
    console.log('👤 Checking maintainer status...');
    const lastPublish = new Date(versionData.time?.[versionData.version] || Date.now());
    const daysSincePublish = Math.floor((Date.now() - lastPublish) / (1000 * 60 * 60 * 24));

    if (daysSincePublish < 180) {
      console.log(`   ${'✅'.green} Active (${daysSincePublish} days ago)`);
    } else if (daysSincePublish < 365) {
      console.log(`   ${'⚠️'.yellow} Inactive (${daysSincePublish} days ago)`);
    } else {
      console.log(`   ${'🔴'.red} Possibly abandoned (${daysSincePublish} days ago)`);
    }

    console.log('');
    console.log('📄 Checking license...');
    const license = versionData.license;
    if (['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'].includes(license)) {
      console.log(`   ${'✅'.green} ${license} (permissive, OSI-approved)`);
    } else if (['GPL-3.0', 'AGPL-3.0'].includes(license)) {
      console.log(`   ${'⚠️'.yellow} ${license} (copyleft, check compatibility)`);
    } else {
      console.log(`   ${'🔍'.blue} ${license} (review recommended)`);
    }

    // Calculate safety score
    console.log('');
    console.log('━'.repeat(60));
    console.log('\n📊 SAFETY ASSESSMENT\n');

    const analysis = {
      vulnerabilities: vulns,
      bundle: bundleData,
      maintainer: { lastPublish: daysSincePublish },
      license: { risk: ['GPL-3.0', 'AGPL-3.0'].includes(license) ? 'high' : 'low' },
    };

    const { score, grade, issues } = calculateSafetyScore(analysis);

    const gradeEmoji = grade === 'A' ? '✅' : grade === 'B' ? '🟢' : grade === 'C' ? '🟡' : grade === 'D' ? '🟠' : '🔴';
    console.log(`   ${gradeEmoji} Grade: ${grade} (Score: ${score}/100)`);

    if (issues.length > 0) {
      console.log('\n   Issues:');
      issues.forEach(issue => {
        console.log(`      - ${issue}`);
      });
    }

    console.log('');
    if (grade === 'A' || grade === 'B') {
      console.log('   ✅ SAFE TO INSTALL');
    } else if (grade === 'C' || grade === 'D') {
      console.log('   ⚠️  PROCEED WITH CAUTION');
    } else {
      console.log('   🔴 DO NOT INSTALL');
    }

    console.log('');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const packageArg = process.argv[2];

  if (!packageArg) {
    console.error('Usage: node check-package.js <package-name>[@version]');
    console.error('Example: node check-package.js lodash@4.17.21');
    process.exit(1);
  }

  analyzePackage(packageArg);
}

export { analyzePackage };
