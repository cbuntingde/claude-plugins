#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Analyze logs for patterns, errors, anomalies, and trends
 * This script provides structured output for the /analyze-logs command
 */

function parseArgs(args) {
  const result = {
    logSource: args[0] || process.env.LOG_SOURCE || './logs/app.log',
    analysisType: args[1] || 'all'
  };

  return result;
}

function analyzeLogFile(filePath, analysisType) {
  if (!existsSync(filePath)) {
    return {
      success: false,
      error: `Log file not found: ${filePath}`,
      suggestion: 'Check the file path or ensure the log file exists'
    };
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());

    const analysis = {
      success: true,
      logSource: filePath,
      totalLines: lines.length,
      analysisType: analysisType,
      timestamp: new Date().toISOString()
    };

    // Pattern analysis
    if (analysisType === 'all' || analysisType === 'patterns') {
      analysis.patterns = extractPatterns(lines);
    }

    // Error analysis
    if (analysisType === 'all' || analysisType === 'errors') {
      analysis.errors = extractErrors(lines);
    }

    // Anomaly detection
    if (analysisType === 'all' || analysisType === 'anomalies') {
      analysis.anomalies = detectAnomalies(lines);
    }

    // Trend analysis
    if (analysisType === 'all' || analysisType === 'trends') {
      analysis.trends = analyzeTrends(lines);
    }

    return analysis;
  } catch (error) {
    return {
      success: false,
      error: `Failed to analyze log file: ${error.message}`,
      suggestion: 'Ensure the log file is readable and properly formatted'
    };
  }
}

function extractPatterns(lines) {
  const patterns = new Map();

  for (const line of lines) {
    const normalized = line
      .replace(/\d{4}-\d{2}-\d{2}T?\s?\d{2}:\d{2}:\d{2}/g, '[TIMESTAMP]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .replace(/[\w-]+@[\w-]+\.\w+/g, '[EMAIL]')
      .replace(/"[^"]*"/g, '"[STRING]"')
      .replace(/\b\d+\b/g, '[NUMBER]');

    patterns.set(normalized, (patterns.get(normalized) || 0) + 1);
  }

  return Array.from(patterns.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([pattern, count]) => ({ pattern, count }));
}

function extractErrors(lines) {
  const errorPatterns = [
    /\berror\b/i,
    /\bexception\b/i,
    /\bfailed\b/i,
    /\bfatal\b/i,
    /\bpanic\b/i,
    /\btimeout\b/i,
    /\brefused\b/i
  ];

  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of errorPatterns) {
      if (pattern.test(line)) {
        errors.push({
          lineNumber: i + 1,
          message: line.substring(0, 200),
          severity: detectSeverity(line)
        });
        break;
      }
    }
  }

  return errors.slice(0, 50);
}

function detectSeverity(line) {
  const upper = line.toUpperCase();
  if (upper.includes('FATAL') || upper.includes('PANIC')) return 'critical';
  if (upper.includes('ERROR') || upper.includes('EXCEPTION')) return 'error';
  if (upper.includes('WARN') || upper.includes('TIMEOUT')) return 'warning';
  return 'info';
}

function detectAnomalies(lines) {
  const anomalies = [];
  const lineLengths = lines.map(line => line.length);
  const avgLength = lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length;

  // Detect unusually long lines
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > avgLength * 3) {
      anomalies.push({
        type: 'unusual_line_length',
        lineNumber: i + 1,
        details: `Length: ${lines[i].length} chars (avg: ${Math.round(avgLength)})`
      });
    }
  }

  return anomalies.slice(0, 20);
}

function analyzeTrends(lines) {
  const timeGroups = new Map();

  for (const line of lines) {
    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
    if (timeMatch) {
      const time = timeMatch[1].substring(0, 4); // Group by hour + minute
      timeGroups.set(time, (timeGroups.get(time) || 0) + 1);
    }
  }

  return {
    message: 'Time-based trend analysis',
    note: 'For detailed trend analysis, use a dedicated observability platform',
    dataPoints: Array.from(timeGroups.entries()).slice(-10)
  };
}

function main() {
  const args = process.argv.slice(2);
  const { logSource, analysisType } = parseArgs(args);

  console.log(`Analyzing logs: ${logSource}`);
  console.log(`Analysis type: ${analysisType}\n`);

  const result = analyzeLogFile(resolve(logSource), analysisType);

  if (result.success) {
    console.log('Analysis Results:');
    console.log(`Total lines analyzed: ${result.totalLines}`);
    console.log(`Timestamp: ${result.timestamp}\n`);

    if (result.patterns) {
      console.log('\n=== Top Patterns ===');
      result.patterns.slice(0, 10).forEach(({ pattern, count }) => {
        console.log(`  ${count}x: ${pattern.substring(0, 100)}...`);
      });
    }

    if (result.errors && result.errors.length > 0) {
      console.log(`\n=== Errors Found (${result.errors.length}) ===`);
      result.errors.slice(0, 10).forEach(({ lineNumber, message, severity }) => {
        console.log(`  [${severity}] Line ${lineNumber}: ${message}`);
      });
    }

    if (result.anomalies && result.anomalies.length > 0) {
      console.log(`\n=== Anomalies (${result.anomalies.length}) ===`);
      result.anomalies.forEach(({ type, lineNumber, details }) => {
        console.log(`  [${type}] Line ${lineNumber}: ${details}`);
      });
    }

    if (result.trends) {
      console.log('\n=== Trends ===');
      console.log(`  ${result.trends.note}`);
      console.log(`  Data points: ${result.trends.dataPoints.length}`);
    }
  } else {
    console.error(`Error: ${result.error}`);
    if (result.suggestion) {
      console.log(`\nSuggestion: ${result.suggestion}`);
    }
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeLogFile, parseArgs };
