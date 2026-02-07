#!/usr/bin/env node

/**
 * Bundle Size Analyzer - Tree Shake Script
 * 
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * Bundle size analysis and tree-shaking detection plugin
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Finds and reports tree-shaking opportunities.
 * @param {string[]} args - Command line arguments
 */
async function treeShake(args) {
  const parsedArgs = parseArgs(args);
  const sourcePath = parsedArgs._[0] || 'src';
  const fix = parsedArgs.fix || false;
  const sideEffects = parsedArgs['side-effects'] || false;
  const severity = parsedArgs.severity || 'low';
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Source path "${sourcePath}" does not exist.`);
    process.exit(1);
  }
  
  try {
    const results = await analyzeTreeShaking(sourcePath, { sideEffects, severity });
    
    console.log('\n=== Tree-Shaking Analysis ===\n');
    console.log(`Source Path: ${sourcePath}`);
    console.log(`Total Files: ${results.totalFiles}`);
    console.log(`Unused Exports Found: ${results.unusedExports.length}`);
    console.log(`Potential Savings: ${formatBytes(results.potentialSavings)}\n`);
    
    if (results.unusedExports.length > 0) {
      console.log('--- Unused Export Details ---\n');
      
      for (const item of results.unusedExports) {
        const severityIcon = item.severity === 'high' ? '🔴' : item.severity === 'medium' ? '🟡' : '🟢';
        console.log(`${severityIcon} ${item.file}:${item.line}`);
        console.log(`   Unused export: ${item.export}`);
        console.log(`   Potential savings: ${formatBytes(item.estimatedSize)}\n`);
      }
      
      if (fix) {
        console.log('\nApplying fixes...\n');
        await applyFixes(results.unusedExports);
      }
    }
    
    if (results.recommendations.length > 0) {
      console.log('--- Recommendations ---\n');
      for (const rec of results.recommendations) {
        console.log(`• ${rec}`);
      }
    }
    
  } catch (error) {
    console.error(`Error performing tree-shake analysis: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Parses command line arguments.
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs(args) {
  const parsed = { _: [] };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('-')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    } else {
      parsed._.push(arg);
    }
  }
  
  return parsed;
}

/**
 * Analyzes source code for tree-shaking opportunities.
 * @param {string} sourcePath - Path to source directory
 * @param {Object} options - Analysis options
 * @returns {Object} Analysis results
 */
async function analyzeTreeShaking(sourcePath, options) {
  const results = {
    totalFiles: 0,
    unusedExports: [],
    potentialSavings: 0,
    recommendations: []
  };
  
  const files = findJavaScriptFiles(sourcePath);
  results.totalFiles = files.length;
  
  for (const file of files) {
    const unused = await analyzeFile(file, options);
    results.unusedExports.push(...unused);
    
    for (const item of unused) {
      results.potentialSavings += item.estimatedSize;
    }
  }
  
  // Generate recommendations
  if (results.unusedExports.length > 0) {
    results.recommendations.push('Set "sideEffects": false in package.json to enable aggressive tree-shaking.');
    results.recommendations.push('Use named exports instead of default exports for better tree-shaking.');
    results.recommendations.push('Consider marking pure functions with /* #__PURE__ */ annotation.');
  }
  
  if (options.sideEffects) {
    results.recommendations.push('Review package.json for sideEffects configuration.');
    results.recommendations.push('Identify and refactor files with side effects that prevent tree-shaking.');
  }
  
  return results;
}

/**
 * Recursively finds all JavaScript/TypeScript files.
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of file paths
 */
function findJavaScriptFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        files.push(...findJavaScriptFiles(fullPath));
      }
    } else if (entry.isFile() && /\.(js|ts|jsx|tsx|mjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analyzes a single file for unused exports.
 * @param {string} filePath - Path to file
 * @param {Object} options - Analysis options
 * @returns {Object[]} Array of unused export findings
 */
async function analyzeFile(filePath, options) {
  const unused = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Extract exports
  const exports = extractExports(content);
  const imports = extractImports(content);
  
  // Find unused exports
  for (const exp of exports) {
    if (!isUsed(exp.name, imports, content)) {
      const estimatedSize = estimateExportSize(content, exp);
      const severity = calculateSeverity(estimatedSize, options.severity);
      
      unused.push({
        file: relativePath,
        line: exp.line,
        export: exp.name,
        estimatedSize,
        severity
      });
    }
  }
  
  // Check for side effects if enabled
  if (options.sideEffects) {
    const sideEffectImports = imports.filter(imp => 
      !imp.specifiers.some(s => exports.some(e => e.name === s.name))
    );
    
    if (sideEffectImports.length > 0) {
      unused.push({
        file: relativePath,
        line: 1,
        export: `Side-effect import: ${sideEffectImports.map(i => i.source).join(', ')}`,
        estimatedSize: 0,
        severity: 'low'
      });
    }
  }
  
  return unused;
}

/**
 * Extracts export statements from source code.
 * @param {string} content - Source code content
 * @returns {Object[]} Array of export objects
 */
function extractExports(content) {
  const exports = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Match named exports: export const/function/class Name
    const namedExportMatch = line.match(/export\s+(?:const|function|class|let|var)\s+(\w+)/);
    if (namedExportMatch) {
      exports.push({ name: namedExportMatch[1], line: lineNum, type: 'named' });
      continue;
    }
    
    // Match export { Name1, Name2 }
    const bracketExportMatch = line.match(/export\s*\{\s*([^}]+)\s*\}/);
    if (bracketExportMatch) {
      const names = bracketExportMatch[1].split(',').map(n => n.trim());
      for (const name of names) {
        exports.push({ name, line: lineNum, type: 'named' });
      }
      continue;
    }
    
    // Match export default
    if (line.includes('export default')) {
      exports.push({ name: 'default', line: lineNum, type: 'default' });
    }
  }
  
  return exports;
}

/**
 * Extracts import statements from source code.
 * @param {string} content - Source code content
 * @returns {Object[]} Array of import objects
 */
function extractImports(content) {
  const imports = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match import statements
    const importMatch = line.match(/import\s+(?:\{([^}]*)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const specifiers = importMatch[1] 
        ? importMatch[1].split(',').map(s => s.trim())
        : [importMatch[2]].filter(Boolean);
      
      imports.push({
        source: importMatch[3],
        specifiers
      });
    }
  }
  
  return imports;
}

/**
 * Checks if an export is used in the codebase.
 * @param {string} exportName - Name of the export
 * @param {Object[]} imports - Array of import objects
 * @param {string} content - Source code content
 * @returns {boolean} True if export is used
 */
function isUsed(exportName, imports, content) {
  // Check if imported elsewhere in the file
  for (const imp of imports) {
    if (imp.specifiers.some(s => s === exportName)) {
      return true;
    }
  }
  
  // Check if used in the same file (for re-exports)
  const usagePattern = new RegExp(`\\b${exportName}\\b`);
  return usagePattern.test(content);
}

/**
 * Estimates the size impact of removing an export.
 * @param {string} content - Source code content
 * @param {Object} exp - Export object
 * @returns {number} Estimated size in bytes
 */
function estimateExportSize(content, exp) {
  // Simple heuristic: estimate based on export type and context
  const baseEstimate = 50; // Base bytes per export
  
  switch (exp.type) {
    case 'function':
      return baseEstimate + 100;
    case 'class':
      return baseEstimate + 200;
    default:
      return baseEstimate;
  }
}

/**
 * Calculates severity based on estimated size.
 * @param {number} size - Estimated size in bytes
 * @param {string} defaultSeverity - Default severity level
 * @returns {string} Severity level
 */
function calculateSeverity(size, defaultSeverity) {
  if (size > 500) return 'high';
  if (size > 200) return 'medium';
  return defaultSeverity || 'low';
}

/**
 * Applies fixes by removing unused exports.
 * @param {Object[]} unused - Array of unused export findings
 */
async function applyFixes(unused) {
  for (const item of unused) {
    const filePath = path.join(process.cwd(), item.file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File not found: ${item.file}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // For safety, we don't actually remove exports in fix mode
    // Instead, we provide guidance
    console.log(`Would remove unused export from ${item.file}:${item.line}`);
  }
  
  console.log('\nFix mode is informational only. Manual review required before making changes.');
}

/**
 * Formats bytes to human readable string.
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main execution
const args = process.argv.slice(2);
treeShake(args).catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});