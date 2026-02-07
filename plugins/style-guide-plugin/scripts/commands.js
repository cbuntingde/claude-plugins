#!/usr/bin/env node
/**
 * Style Guide Plugin - Automatic Fetching & Caching
 * Fetches latest style guides from official sources every 72 hours
 */

const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ============================================
// Language Detection
// ============================================

const LANGUAGE_PATTERNS = {
  typescript: /\.(ts|tsx)$/,
  javascript: /\.(js|jsx|mjs|cjs)$/,
  python: /\.py$/,
  java: /\.java$/,
  cpp: /\.(cpp|cc|cxx|hpp|h)$/,
  csharp: /\.cs$/,
  go: /\.go$/,
  rust: /\.rs$/,
  ruby: /\.rb$/,
  php: /\.php$/,
  swift: /\.swift$/,
  kotlin: /\.kt$/,
  scala: /\.scala$/,
  lua: /\.lua$/,
};

const CODE_INDICATORS = {
  python: ['def ', 'import ', 'from ', 'class ', ': '],
  go: ['package ', 'func ', 'import (', 'type ', 'interface {}'],
  rust: ['fn ', 'let ', 'impl ', 'struct ', 'trait ', '-> '],
  typescript: ['interface ', 'type ', ': string', ': number', 'export ', '=>'],
  javascript: ['function ', 'const ', 'let ', '=>', 'export ', 'import '],
  java: ['public class', 'private ', 'public ', 'import java', 'System.out'],
  cpp: ['#include', 'std::', 'using namespace', 'void ', 'int main()'],
  csharp: ['using ', 'namespace ', 'public class', 'var ', '=>'],
  ruby: ['def ', 'require ', 'class ', 'module ', 'end'],
  php: ['<?php', 'function ', 'class ', '->'],
  swift: ['func ', 'var ', 'let ', 'class ', 'import '],
  kotlin: ['fun ', 'val ', 'var ', 'class ', 'import '],
  lua: ['function ', 'local ', 'end', 'require '],
  scala: ['def ', 'val ', 'var ', 'class ', 'object ']
};

function detectFromFile(filename) {
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(filename)) return lang;
  }
  return null;
}

function detectFromCode(code) {
  const scores = {};
  for (const [lang, patterns] of Object.entries(CODE_INDICATORS)) {
    scores[lang] = patterns.filter(p => code.includes(p)).length;
  }
  const detected = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return detected && detected[1] > 0 ? detected[0] : null;
}

// ============================================
// Remote Fetching with Caching (72 hours)
// ============================================

const CACHE_DIR = path.join(__dirname, '..', 'cache');
const DB_PATH = path.join(CACHE_DIR, 'cache.db');
const CACHE_TTL = 72 * 60 * 60 * 1000;

// Style sources configuration
const STYLE_SOURCES = {
  typescript: [
    { name: 'Microsoft TypeScript Guidelines', url: 'https://github.com/microsoft/TypeScript/wiki/Coding-guidelines', type: 'markdown' },
    { name: 'Airbnb JavaScript Style Guide', url: 'https://raw.githubusercontent.com/airbnb/javascript/master/README.md', type: 'markdown' }
  ],
  javascript: [
    { name: 'Airbnb JavaScript Style Guide', url: 'https://raw.githubusercontent.com/airbnb/javascript/master/README.md', type: 'markdown' },
    { name: 'Google JavaScript Style Guide', url: 'https://google.github.io/styleguide/jsguide.html', type: 'html' }
  ],
  python: [
    { name: 'PEP 8', url: 'https://raw.githubusercontent.com/python/peps/main/pep-0008.txt', type: 'markdown' },
    { name: 'Google Python Style Guide', url: 'https://google.github.io/styleguide/pyguide.html', type: 'html' }
  ],
  java: [{ name: 'Google Java Style Guide', url: 'https://google.github.io/styleguide/javaguide.html', type: 'html' }],
  cpp: [{ name: 'Google C++ Style Guide', url: 'https://google.github.io/styleguide/cppguide.html', type: 'html' }],
  csharp: [{ name: 'Microsoft C# Conventions', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions', type: 'html' }],
  go: [
    { name: 'Effective Go', url: 'https://go.dev/doc/effective_go', type: 'html' },
    { name: 'Go Code Review Comments', url: 'https://raw.githubusercontent.com/golang/go/master/CodeReviewComments.md', type: 'markdown' }
  ],
  rust: [
    { name: 'Rust API Guidelines', url: 'https://rust-lang.github.io/api-guidelines/', type: 'html' },
    { name: 'Rust Naming Conventions', url: 'https://raw.githubusercontent.com/rust-lang/rfcs/master/text/0430-finalizing-naming-conventions.md', type: 'markdown' }
  ],
  ruby: [{ name: 'Ruby Style Guide', url: 'https://raw.githubusercontent.com/rubocop/ruby-style-guide/master/README.md', type: 'markdown' }],
  php: [{ name: 'PSR-12', url: 'https://www.php-fig.org/psr/psr-12/', type: 'html' }],
  swift: [{ name: 'Swift API Design Guidelines', url: 'https://swift.org/documentation/api-design-guidelines/', type: 'html' }],
  kotlin: [{ name: 'Kotlin Conventions', url: 'https://kotlinlang.org/docs/coding-conventions.html', type: 'html' }],
  scala: [{ name: 'Scala Style Guide', url: 'https://docs.scala-lang.org/style/', type: 'html' }],
  lua: [{ name: 'Lua Style Guide', url: 'https://raw.githubusercontent.com/Olivine-Labs/lua-style-guide/master/README.md', type: 'markdown' }]
};

const SECURITY_GUIDELINES = [
  { id: 'sql-injection', vulnerabilityType: 'SQL Injection', description: 'Occurs when untrusted data is concatenated into SQL queries.', mitigation: 'Use parameterized queries, prepared statements, or ORM frameworks. Never concatenate user input into SQL.', severity: 'Critical', cweId: 'CWE-89' },
  { id: 'xss', vulnerabilityType: 'Cross-Site Scripting (XSS)', description: 'Allows attackers to inject malicious scripts into web pages.', mitigation: 'Sanitize and escape all user input. Use CSP headers. Encode output based on context.', severity: 'High', cweId: 'CWE-79' },
  { id: 'broken-auth', vulnerabilityType: 'Broken Authentication', description: 'Weak authentication mechanisms that can be bypassed.', mitigation: 'Implement MFA. Use strong password policies. Secure session management.', severity: 'Critical', cweId: 'CWE-287' },
  { id: 'command-injection', vulnerabilityType: 'Command Injection', description: 'Occurs when untrusted input is passed to system shell commands.', mitigation: 'Avoid shell execution. Use strict allowlists. Escape all user-supplied values.', severity: 'Critical', cweId: 'CWE-78' },
  { id: 'path-traversal', vulnerabilityType: 'Path Traversal', description: 'Allows attackers to access files outside the intended directory.', mitigation: 'Validate and sanitize file paths. Use allowlists. Never use user input directly in file operations.', severity: 'High', cweId: 'CWE-22' },
  { id: 'deserialization', vulnerabilityType: 'Insecure Deserialization', description: 'Deserializing untrusted data can lead to code execution.', mitigation: 'Avoid deserialization of untrusted data. Use safe formats like JSON.', severity: 'High', cweId: 'CWE-502' },
  { id: 'sensitive-data', vulnerabilityType: 'Sensitive Data Exposure', description: 'Failure to properly protect sensitive data.', mitigation: 'Encrypt data at rest and in transit. Use HTTPS. Hash passwords with bcrypt.', severity: 'High', cweId: 'CWE-200' }
];

// Initialize SQLite database
function initDb() {
  ensureDir(CACHE_DIR);
  const exists = fs.existsSync(DB_PATH);
  const db = require('better-sqlite3')(DB_PATH);

  if (!exists) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        fetched_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_fetched_at ON cache(fetched_at);
    `);
  }
  return db;
}

let db = null;
function getDb() {
  if (!db) db = initDb();
  return db;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// HTTP fetch with retry
async function fetchUrl(url, timeout = 30000) {
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    const req = protocol.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Parse HTML to extract guidelines
function parseHtmlGuidelines(html) {
  const guidelines = [];
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);

  $('h1, h2, h3').each((i, elem) => {
    const title = $(elem).text().trim();
    let content = '';

    let sibling = $(elem).next();
    while (sibling.length && !sibling.is('h1, h2, h3')) {
      if (sibling.is('p, li, pre')) content += $(sibling).text().trim() + '\n';
      sibling = sibling.next();
    }

    if (title && content.trim()) {
      guidelines.push({ section: 'General', title, content: content.trim().slice(0, 500) });
    }
  });

  return guidelines.slice(0, 20); // Limit to 20 guidelines
}

// Parse Markdown to extract guidelines
function parseMarkdownGuidelines(md) {
  const guidelines = [];
  const lines = md.split('\n');
  let currentSection = 'General';
  let buffer = [];

  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      if (buffer.length) {
        guidelines.push({ section: currentSection, title: null, content: buffer.join('\n').slice(0, 500) });
        buffer = [];
      }
      currentSection = heading[2].trim();
    } else if (line.trim().length > 50 && !line.startsWith('```')) {
      buffer.push(line.trim());
    }
  }

  return guidelines.slice(0, 20);
}

// Check if cache is valid
function isCacheValid(key) {
  try {
    const row = getDb().prepare('SELECT fetched_at FROM cache WHERE key = ?').get(key);
    if (!row) return false;
    return (Date.now() - row.fetched_at) < CACHE_TTL;
  } catch (e) { return false; }
}

// Get from cache or fetch
async function getCachedOrFetch(key, fetchFn) {
  if (isCacheValid(key)) {
    const row = getDb().prepare('SELECT data FROM cache WHERE key = ?').get(key);
    return JSON.parse(row.data);
  }

  const data = await fetchFn();
  getDb().prepare('INSERT OR REPLACE INTO cache (key, data, fetched_at) VALUES (?, ?, ?)').run(key, JSON.stringify(data), Date.now());
  return data;
}

// Fetch style guide for a language
async function fetchStyleGuide(language) {
  const sources = STYLE_SOURCES[language.toLowerCase()];
  if (!sources) return null;

  const allGuidelines = [];

  for (const source of sources) {
    try {
      const html = await fetchUrl(source.url);
      const guidelines = source.type === 'html'
        ? parseHtmlGuidelines(html)
        : parseMarkdownGuidelines(html);

      allGuidelines.push(...guidelines.map(g => ({ ...g, source: source.name })));
    } catch (e) {
      console.error(`Failed to fetch ${source.name}: ${e.message}`);
    }
  }

  return { language, guidelines: allGuidelines.slice(0, 30), sources };
}

// Main fetch function with automatic 72-hour refresh
async function getStyleGuide(language, forceRefresh = false) {
  const lang = language.toLowerCase();
  const cacheKey = `guide:${lang}`;

  // Try cache first (72-hour TTL)
  if (!forceRefresh) {
    try {
      const row = getDb().prepare('SELECT data, fetched_at FROM cache WHERE key = ?').get(cacheKey);
      if (row && (Date.now() - row.fetched_at) < CACHE_TTL) {
        console.log(`Using cached style guide for ${lang} (${Math.round((CACHE_TTL - (Date.now() - row.fetched_at)) / 3600000)}h remaining)`);
        return JSON.parse(row.data);
      }
    } catch (e) {}
  }

  // Fetch from remote
  console.log(`Fetching latest style guide for ${lang}...`);
  const guide = await fetchStyleGuide(lang);

  if (guide) {
    getDb().prepare('INSERT OR REPLACE INTO cache (key, data, fetched_at) VALUES (?, ?, ?)').run(cacheKey, JSON.stringify(guide), Date.now());
    return guide;
  }

  return null;
}

// Get security guidelines (always available)
function getSecurityGuidelines(vulnerability = null) {
  if (vulnerability) {
    const vuln = SECURITY_GUIDELINES.find(v =>
      v.id === vulnerability || v.vulnerabilityType.toLowerCase().includes(vulnerability.toLowerCase())
    );
    return vuln ? [vuln] : [];
  }
  return SECURITY_GUIDELINES;
}

// Export for commands
module.exports = {
  detectFromFile,
  detectFromCode,
  getStyleGuide,
  getSecurityGuidelines,
  STYLE_SOURCES,
  SECURITY_GUIDELINES
};