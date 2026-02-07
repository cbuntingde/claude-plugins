/**
 * WCAG Scanner Plugin
 *
 * Scans web files for WCAG 2.2 compliance issues.
 * Security: OWASP compliant with input validation and secure file operations.
 */

import fs from 'fs';
import path from 'path';

// __dirname is available via import.meta.url resolution

/**
 * WCAG 2.2 accessibility rules
 */
const WCAG_RULES = {
  '1.1.1': {
    name: 'Non-text Content',
    pattern: /<img(?![^>]*alt=)[^>]*>/gi,
    severity: 'critical',
    message: 'Image missing alt attribute'
  },
  '1.3.1': {
    name: 'Info and Relationships',
    pattern: /<h[1-6][^>]*>(?!\s*[\w])/gi,
    severity: 'moderate',
    message: 'Heading may be empty or malformed'
  },
  '1.4.3': {
    name: 'Contrast (Minimum)',
    pattern: /(?:color|background(?:-color)?)\s*:\s*#[0-9a-fA-F]{3,6}/gi,
    severity: 'serious',
    message: 'Check color contrast ratio (minimum 4.5:1)'
  },
  '2.1.1': {
    name: 'Keyboard',
    pattern: /<a[^>]*href[^>]*>(?!\s*<)/gi,
    severity: 'moderate',
    message: 'Links should be keyboard accessible'
  },
  '2.4.1': {
    name: 'Bypass Blocks',
    pattern: /<body[^>]*>/gi,
    severity: 'moderate',
    message: 'Consider adding skip navigation link'
  },
  '2.4.2': {
    name: 'Page Titled',
    pattern: /<title>\s*<\/title>/gi,
    severity: 'serious',
    message: 'Page title is empty'
  },
  '2.4.4': {
    name: 'Link Purpose',
    pattern: /<a[^>]*>(?:\s*<img[^>]*>\s*|\s*(?:click|here|more|read more|read)\s*)<\/a>/gi,
    severity: 'serious',
    message: 'Link text is not descriptive'
  },
  '3.1.1': {
    name: 'Language of Page',
    pattern: /<html[^>]*>/gi,
    severity: 'serious',
    message: 'Check for lang attribute on html element'
  },
  '3.2.2': {
    name: 'On Input',
    pattern: /<select[^>]*onchange/gi,
    severity: 'moderate',
    message: 'onchange may cause unexpected context change'
  },
  '3.3.1': {
    name: 'Error Identification',
    pattern: /<input(?![^>]*aria-invalid)[^>]*type=(?:["']?(?:text|email|password|tel|number)["']?)/gi,
    severity: 'moderate',
    message: 'Form input should have accessible error handling'
  },
  '3.3.2': {
    name: 'Labels or Instructions',
    pattern: /<input(?![^>]*(?:id|name|aria-label|aria-labelledby)[^>]*)[^>]*type=(?:["']?(?:text|email|password|tel|number|radio|checkbox)["']?)/gi,
    severity: 'moderate',
    message: 'Form input may be missing associated label'
  },
  '4.1.1': {
    name: 'Parsing',
    pattern: /<div[^>]*><\/div[^>]*>/gi,
    severity: 'minor',
    message: 'Empty div elements may cause parsing issues'
  },
  '4.1.2': {
    name: 'Name, Role, Value',
    pattern: /<button[^>]*>(?:\s*<span[^>]*>\s*<\/span>\s*)<\/button>/gi,
    severity: 'moderate',
    message: 'Button may have empty or unclear accessible name'
  }
};

/**
 * Web file extensions to scan
 */
const WEB_EXTENSIONS = ['.html', '.htm', '.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.md'];

/**
 * Validate file path against path traversal attacks
 * @param {string} filePath - File path to validate
 * @returns {boolean} True if safe
 */
function isValidFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }

  // Prevent path traversal
  if (filePath.includes('..') || filePath.includes('//') || filePath.startsWith('/')) {
    return false;
  }

  // Check for null bytes
  if (filePath.includes('\0')) {
    return false;
  }

  return true;
}

/**
 * Check if file extension is supported
 * @param {string} filePath - File path
 * @returns {boolean} True if supported
 */
function isWebFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return WEB_EXTENSIONS.includes(ext);
}

/**
 * Scan a single file for WCAG issues
 * @param {string} filePath - Path to file
 * @param {object} options - Scan options
 * @returns {object} Scan results
 */
function scanFile(filePath, options = {}) {
  const { severity = 'moderate' } = options;

  const results = {
    file: filePath,
    issues: [],
    lines: 0,
    scanned: false
  };

  try {
    // Validate file path
    if (!isValidFilePath(filePath)) {
      results.error = 'Invalid file path';
      return results;
    }

    // Check file extension
    if (!isWebFile(filePath)) {
      return results;
    }

    // Read file content
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      return results;
    }

    results.scanned = true;
    results.lines = content.split('\n').length;

    // Scan for WCAG rules
    for (const [ruleId, rule] of Object.entries(WCAG_RULES)) {
      const matches = content.match(rule.pattern);
      if (matches) {
        matches.forEach((match) => {
          // Find line number
          const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
          const ruleSeverity = rule.severity;

          // Filter by severity level
          const severityOrder = ['critical', 'serious', 'moderate', 'minor'];
          const ruleIndex = severityOrder.indexOf(ruleSeverity);
          const filterIndex = severityOrder.indexOf(severity);

          if (ruleIndex <= filterIndex) {
            results.issues.push({
              rule: `WCAG ${ruleId}`,
              title: rule.name,
              message: rule.message,
              severity: ruleSeverity,
              line: lineNumber,
              snippet: match.substring(0, 80)
            });
          }
        });
      }
    }
  } catch {
    results.error = 'Failed to scan file';
  }

  return results;
}

/**
 * Get files to scan from glob pattern
 * @param {string} pattern - File pattern
 * @param {string[]} excludePatterns - Patterns to exclude
 * @returns {string[]} Array of file paths
 */
function getFilesFromPattern(pattern, excludePatterns = []) {
  const files = [];

  try {
    // Handle glob patterns by reading directory
    const glob = require('glob');
    const excluded = excludePatterns || [];

    const matches = glob.sync(pattern, {
      ignore: excluded,
      nodir: true
    });

    for (const file of matches) {
      if (isValidFilePath(file) && isWebFile(file)) {
        files.push(file);
      }
    }
  } catch {
    // Fallback: try as direct path
    if (isValidFilePath(pattern) && isWebFile(pattern)) {
      files.push(pattern);
    }
  }

  return files;
}

/**
 * Scan multiple files for WCAG issues
 * @param {string[]} files - Array of file paths
 * @param {object} options - Scan options
 * @returns {object} Aggregated scan results
 */
function scanFiles(files, options = {}) {
  const results = {
    filesScanned: 0,
    filesTotal: files.length,
    issues: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    },
    details: []
  };

  for (const file of files) {
    const scanResult = scanFile(file, options);
    if (scanResult.scanned) {
      results.filesScanned++;
      results.details.push(scanResult);

      for (const issue of scanResult.issues) {
        results.issues[issue.severity]++;
      }
    }
  }

  results.issuesFound = Object.values(results.issues).reduce((a, b) => a + b, 0);

  return results;
}

/**
 * Format scan results for output
 * @param {object} results - Scan results
 * @param {string} format - Output format
 * @returns {string} Formatted results
 */
function formatResults(results, format = 'text') {
  const severityOrder = ['critical', 'serious', 'moderate', 'minor'];

  if (format === 'json') {
    const output = {
      summary: {
        filesScanned: results.filesScanned,
        issuesFound: results.issuesFound,
        ...results.issues
      },
      issues: results.details.flatMap(d =>
        d.issues.map(i => ({
          severity: i.severity,
          rule: i.rule,
          title: i.title,
          description: i.message,
          file: d.file,
          line: i.line,
          code: i.snippet
        }))
      )
    };
    return JSON.stringify(output, null, 2);
  }

  // Text format
  let output = [];
  output.push('\n');
  output.push('WCAG 2.2 Compliance Scan Results');
  output.push('='.repeat(40));
  output.push(`Files scanned: ${results.filesScanned}`);
  output.push(`Issues found: ${results.issuesFound}`);
  output.push('');

  for (const severity of severityOrder) {
    const count = results.issues[severity];
    if (count > 0) {
      output.push(`${severity.charAt(0).toUpperCase() + severity.slice(1)} (${count}):`);
      output.push('-'.repeat(40));

      const severityIssues = results.details
        .flatMap(d => d.issues.map(i => ({ ...i, file: d.file })))
        .filter(i => i.severity === severity)
        .slice(0, 5); // Show max 5 per severity

      for (const issue of severityIssues) {
        output.push(`  [${severity.toUpperCase()}] ${issue.title}`);
        output.push(`  ${issue.file}:${issue.line}`);
        output.push(`  WCAG ${issue.rule} - ${issue.message}`);
        output.push('');
      }

      if (count > 5) {
        output.push(`  ... and ${count - 5} more ${severity} issues`);
        output.push('');
      }
    }
  }

  return output.join('\n');
}

/**
 * /scan-wcag command handler
 * @param {object} params - Command parameters
 * @returns {string} Scan results
 */
function scanWcag(params = {}) {
  const {
    files = [],
    level = 'AA',
    format = 'text',
    severity = 'moderate',
    exclude = [],
    report = null,
    watch = false
  } = params;

  // Handle watch mode
  if (watch) {
    return 'Watch mode requires continuous execution. Run with --watch flag in terminal for ongoing scanning.';
  }

  // Validate input
  if (!files || !Array.isArray(files) || files.length === 0) {
    return 'No files specified. Provide file paths, glob patterns, or directories to scan.\n\nUsage: /scan-wcag [files] --level <A|AA|AAA> --format <text|json>';
  }

  // Collect all files
  const allFiles = [];
  const excludePatterns = exclude || [];

  for (const pattern of files) {
    const patternFiles = getFilesFromPattern(pattern, excludePatterns);
    allFiles.push(...patternFiles);
  }

  if (allFiles.length === 0) {
    return 'No web files found matching the specified patterns.';
  }

  // Remove duplicates
  const uniqueFiles = [...new Set(allFiles)];

  // Scan files
  const results = scanFiles(uniqueFiles, { level, severity });

  // Format output
  let output = formatResults(results, format);

  // Save report if requested
  if (report) {
    if (!isValidFilePath(report)) {
      return `${output}\n\nError: Invalid report path: ${report}`;
    }

    try {
      const reportContent = formatResults(results, 'json');
      fs.writeFileSync(report, reportContent, 'utf-8');
      output += `\n\nReport saved to: ${report}`;
    } catch (error) {
      output += `\n\nError saving report: ${error.message}`;
    }
  }

  return output;
}

/**
 * Export command mappings
 */
export const commands = {
  'scan-wcag': {
    handler: scanWcag,
    description: 'Scan files for WCAG 2.2 compliance issues and accessibility problems',
    parameters: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'File paths, glob patterns, or directories to scan'
        },
        level: {
          type: 'string',
          enum: ['A', 'AA', 'AAA'],
          default: 'AA',
          description: 'WCAG compliance level'
        },
        format: {
          type: 'string',
          enum: ['text', 'json'],
          default: 'text',
          description: 'Output format'
        },
        severity: {
          type: 'string',
          enum: ['critical', 'serious', 'moderate', 'minor'],
          default: 'moderate',
          description: 'Minimum severity level to report'
        },
        exclude: {
          type: 'array',
          items: { type: 'string' },
          default: [],
          description: 'Patterns to exclude from scanning'
        },
        report: {
          type: 'string',
          description: 'File path to save detailed JSON report'
        },
        watch: {
          type: 'boolean',
          default: false,
          description: 'Enable watch mode for automatic rescanning'
        }
      },
      required: ['files']
    }
  }
};

export default { commands };