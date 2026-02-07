#!/usr/bin/env node
/**
 * Cross-Repository Knowledge Navigator Plugin
 * Search across repositories, Slack, Jira, and Confluence to find answers
 */

const path = require('path');
const fs = require('fs');

/**
 * Plugin metadata
 */
const pluginInfo = {
  name: 'cross-repo-knowledge-navigator',
  version: '1.0.0',
  description: 'AI-powered knowledge navigator that searches across repositories, Slack, Jira, and Confluence'
};

/**
 * Load configuration from .env or config file
 */
function loadConfig() {
  const configPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.cross-repo-knowledge.json'),
    path.join(process.cwd(), '.claude', 'cross-repo-knowledge.json'),
    path.join(__dirname, 'config.json')
  ];

  const config = {
    repositories: [],
    slack: { enabled: false, token: '' },
    jira: { enabled: false, baseUrl: '', token: '' },
    confluence: { enabled: false, baseUrl: '', token: '' },
    embedding: { enabled: false, provider: 'openai' }
  };

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        if (configPath.endsWith('.env')) {
          // Parse .env file
          for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              const [key, ...valueParts] = trimmed.split('=');
              if (key && valueParts.length) {
                const value = valueParts.join('=').trim();
                if (key.startsWith('REPO_')) {
                  config.repositories.push(value);
                } else if (key === 'SLACK_TOKEN') {
                  config.slack.enabled = true;
                  config.slack.token = value;
                } else if (key === 'JIRA_BASE_URL') {
                  config.jira.enabled = true;
                  config.jira.baseUrl = value;
                } else if (key === 'JIRA_TOKEN') {
                  config.jira.token = value;
                } else if (key === 'CONFLUENCE_BASE_URL') {
                  config.confluence.enabled = true;
                  config.confluence.baseUrl = value;
                } else if (key === 'CONFLUENCE_TOKEN') {
                  config.confluence.token = value;
                }
              }
            }
          }
        } else {
          // Parse JSON config
          const jsonConfig = JSON.parse(content);
          Object.assign(config, jsonConfig);
        }
      } catch (error) {
        // Skip invalid configs
      }
    }
  }

  return config;
}

/**
 * Search across repositories
 */
function searchRepositories(query, options = {}) {
  const config = loadConfig();
  const results = [];

  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.md', '.txt', '.yaml', '.yml', '.json'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build']);

  // Search in each configured repository
  for (const repoPath of config.repositories) {
    const found = searchDirectory(repoPath, query, scanExtensions, skipDirs);
    results.push(...found.map(f => ({ ...f, source: 'repository', repo: repoPath })));
  }

  // If no repos configured, search current working directory
  if (config.repositories.length === 0) {
    const found = searchDirectory(process.cwd(), query, scanExtensions, skipDirs);
    results.push(...found.map(f => ({ ...f, source: 'repository', repo: process.cwd() })));
  }

  return results;
}

/**
 * Search a directory for query matches
 */
function searchDirectory(dir, query, extensions, skipDirs) {
  const results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      let shouldSkip = false;

      for (const skipDir of skipDirs) {
        if (item === skipDir || fullPath.includes('/' + skipDir + '/')) {
          shouldSkip = true;
          break;
        }
      }

      if (shouldSkip) continue;

      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          results.push(...searchDirectory(fullPath, query, extensions, skipDirs));
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
              if (lines[i].toLowerCase().includes(query.toLowerCase())) {
                const relevanceScore = calculateRelevance(lines[i], query);
                if (relevanceScore > 0) {
                  results.push({
                    file: fullPath,
                    line: i + 1,
                    content: lines[i].trim().substring(0, 200),
                    score: relevanceScore
                  });
                }
              }
            }
          }
        }
      } catch {
        // Skip inaccessible files
      }
    }
  } catch {
    // Skip inaccessible directories
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Calculate relevance score for a match
 */
function calculateRelevance(line, query) {
  const lowerLine = line.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let score = 1;

  // Exact match gets highest score
  if (lowerLine.includes(lowerQuery)) {
    score += 10;
  }

  // Word boundary match
  const queryWords = lowerQuery.split(/\s+/);
  for (const word of queryWords) {
    if (new RegExp(`\\b${word}\\b`).test(lowerLine)) {
      score += 5;
    }
  }

  // Code patterns and decision keywords get bonus
  const decisionKeywords = ['decid', 'choos', 'select', 'adopt', 'implement', 'use '];
  for (const keyword of decisionKeywords) {
    if (lowerLine.includes(keyword)) {
      score += 3;
    }
  }

  return score;
}

/**
 * Knowledge search command handler
 */
function knowledgeSearch(params = {}) {
  const query = params.query || params._?.[0] || '';
  const sources = params.sources || 'all';
  const team = params.team || null;
  const days = params.days || null;

  if (!query) {
    return {
      success: false,
      text: 'Error: Query is required. Usage: /knowledge-search <query>',
      error: 'MISSING_QUERY'
    };
  }

  const config = loadConfig();
  const results = [];

  // Search repositories
  if (sources === 'all' || sources.includes('repos')) {
    const repoResults = searchRepositories(query, { team, days });
    results.push(...repoResults.map(r => ({ ...r, type: 'repository' })));
  }

  // Simulate Slack results (placeholder for actual integration)
  if ((sources === 'all' || sources.includes('slack')) && config.slack.enabled) {
    // Placeholder - would integrate with actual Slack API
    results.push({
      source: 'slack',
      type: 'discussion',
      content: '[Slack integration would show relevant discussions here]',
      score: 5,
      url: '#'
    });
  }

  // Simulate Jira results (placeholder for actual integration)
  if ((sources === 'all' || sources.includes('jira')) && config.jira.enabled) {
    // Placeholder - would integrate with actual Jira API
    results.push({
      source: 'jira',
      type: 'ticket',
      content: '[Jira integration would show relevant tickets here]',
      score: 4,
      url: '#'
    });
  }

  // Simulate Confluence results (placeholder for actual integration)
  if ((sources === 'all' || sources.includes('confluence')) && config.confluence.enabled) {
    // Placeholder - would integrate with actual Confluence API
    results.push({
      source: 'confluence',
      type: 'documentation',
      content: '[Confluence integration would show relevant docs here]',
      score: 6,
      url: '#'
    });
  }

  // Format output
  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    KNOWLEDGE SEARCH RESULTS\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Query: "${query}"\n`;
  outputText += `Found ${results.length} results\n\n`;

  // Group by source
  const bySource = {};
  for (const result of results) {
    const source = result.source || result.type;
    if (!bySource[source]) {
      bySource[source] = [];
    }
    bySource[source].push(result);
  }

  for (const [source, items] of Object.entries(bySource)) {
    outputText += `--- ${source.toUpperCase()} ---\n\n`;
    for (const item of items.slice(0, 10)) {
      outputText += `  📄 ${item.file || item.content}\n`;
      if (item.line) {
        outputText += `     Line: ${item.line}\n`;
      }
      outputText += `     Score: ${item.score}\n\n`;
    }
  }

  if (results.length === 0) {
    outputText += 'No results found. Try:\n';
    outputText += '  - Different search terms\n';
    outputText += '  - Fewer constraints\n';
    outputText += '  - Configuring additional sources in .env\n';
  }

  outputText += '═════════════════════════════════════════════\n';

  return {
    success: true,
    text: outputText,
    results: results,
    summary: {
      query,
      totalResults: results.length,
      sources: Object.keys(bySource)
    }
  };
}

/**
 * Find technical decisions
 */
function decisionTracker(params = {}) {
  const query = params.query || params._?.[0] || '';
  const format = params.format || 'summary';
  const status = params.status || 'all';

  if (!query) {
    return {
      success: false,
      text: 'Error: Query is required. Usage: /decision-tracker <topic>',
      error: 'MISSING_QUERY'
    };
  }

  // Search for decision-related files
  const decisionResults = searchRepositories(query);
  const adrFiles = decisionResults.filter(r =>
    r.file.includes('adr') ||
    r.file.includes('decision') ||
    r.file.includes('ARCHITECTURE') ||
    r.file.includes('DECISION')
  );

  // Find related decisions in documentation
  const config = loadConfig();
  const docsDir = path.join(process.cwd(), 'docs');
  let allDecisions = [];

  if (fs.existsSync(docsDir)) {
    allDecisions = findDecisionRecords(docsDir, query);
  }

  // Format output
  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    DECISION TRACKER RESULTS\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Query: "${query}"\n`;
  outputText += `Status filter: ${status}\n\n`;

  const totalCount = adrFiles.length + allDecisions.length;

  if (totalCount === 0) {
    outputText += `No decisions found for "${query}".\n\n`;
    outputText += 'Tips:\n';
    outputText += '  - Check ADR directories (docs/adr/, decisions/)\n';
    outputText += '  - Look in team-specific documentation\n';
    outputText += '  - Search for technology names directly\n';
  } else {
    outputText += `Found ${totalCount} decision(s):\n\n`;

    // Show ADR files
    for (const adr of adrFiles.slice(0, 5)) {
      outputText += `📋 ${adr.file}\n`;
      outputText += `   Line ${adr.line}: ${adr.content.substring(0, 100)}\n`;
      outputText += `   Relevance: ${adr.score}\n\n`;
    }

    // Show decision records
    for (const decision of allDecisions.slice(0, 5)) {
      outputText += `📋 ${decision.title}\n`;
      outputText += `   Status: ${decision.status}\n`;
      outputText += `   Team: ${decision.team || 'Unknown'}\n`;
      outputText += `   Date: ${decision.date || 'Unknown'}\n`;
      if (decision.rationale) {
        outputText += `   Rationale: ${decision.rationale.substring(0, 100)}...\n`;
      }
      outputText += '\n';
    }
  }

  outputText += '═════════════════════════════════════════════\n';
  outputText += '\nRelated Commands:\n';
  outputText += '  /knowledge-search <topic> - Search all sources\n';
  outputText += '  /team-practices <area> - Compare team practices\n';

  return {
    success: true,
    text: outputText,
    decisions: [...adrFiles, ...allDecisions],
    summary: {
      query,
      totalFound: totalCount,
      format,
      status
    }
  };
}

/**
 * Find decision records in documentation
 */
function findDecisionRecords(dir, query) {
  const decisions = [];
  const scanExtensions = ['.md', '.txt', '.adoc'];

  if (!fs.existsSync(dir)) {
    return decisions;
  }

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        decisions.push(...findDecisionRecords(fullPath, query));
      } else if (scanExtensions.includes(path.extname(item))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.toLowerCase().includes(query.toLowerCase())) {
            // Extract decision info from common ADR formats
            const titleMatch = content.match(/#+\s*(.+?)(?:\n|$)/);
            const statusMatch = content.match(/status[:\s]+(\w+)/i);
            const dateMatch = content.match(/date[:\s]+(\d{4}-\d{2}-\d{2})/i);
            const teamMatch = content.match(/team[:\s]+(\w+)/i);
            const rationaleMatch = content.match(/rationale[:\s]+([^\n]+)/i);

            decisions.push({
              file: fullPath,
              title: titleMatch ? titleMatch[1].trim() : item,
              status: statusMatch ? statusMatch[1] : 'unknown',
              date: dateMatch ? dateMatch[1] : null,
              team: teamMatch ? teamMatch[1] : null,
              rationale: rationaleMatch ? rationaleMatch[1].trim() : null,
              score: calculateRelevance(content, query)
            });
          }
        } catch {
          // Skip unreadable files
        }
      }
    }
  } catch {
    // Skip inaccessible directories
  }

  return decisions.sort((a, b) => b.score - a.score);
}

/**
 * Discover team practices
 */
function teamPractices(params = {}) {
  const practiceArea = params.practiceArea || params._?.[0] || '';
  const compare = params.compare || null;
  const format = params.format || 'table';

  if (!practiceArea) {
    return {
      success: false,
      text: 'Error: Practice area is required. Usage: /team-practices <area>',
      error: 'MISSING_AREA'
    };
  }

  // Search for practice-related configurations and docs
  const practiceResults = searchRepositories(practiceArea);

  // Analyze configurations for patterns
  const practices = analyzePractices(practiceArea, compare);

  // Format output
  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    TEAM PRACTICES ANALYSIS\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Practice Area: ${practiceArea}\n`;

  if (compare) {
    outputText += `Comparing: ${compare}\n`;
  }
  outputText += '\n';

  if (practices.length === 0) {
    outputText += `No practices found for "${practiceArea}".\n\n`;
    outputText += 'Common practice areas:\n';
    outputText += '  - testing          - CI/CD and test configurations\n';
    outputText += '  - deployment       - Deployment strategies and pipelines\n';
    outputText += '  - code-review      - Review processes and checklists\n';
    outputText += '  - monitoring       - Observability and alerting\n';
    outputText += '  - api-design       - API patterns and conventions\n';
  } else if (format === 'table') {
    // Table format
    outputText += '| Team      | Practice | Details |\n';
    outputText += '|-----------|----------|---------|\n';
    for (const practice of practices) {
      outputText += `| ${practice.team || 'Unknown'} | ${practiceArea} | ${practice.details || 'See docs'} |\n`;
    }
  } else {
    // Detailed format
    for (const practice of practices) {
      outputText += `## ${practice.team || 'Unknown'} - ${practiceArea}\n\n`;
      outputText += `**Approach:** ${practice.approach || 'Not documented'}\n\n`;
      outputText += `**Tools:** ${practice.tools?.join(', ') || 'Not specified'}\n\n`;
      outputText += `**Configuration:** ${practice.config || 'See repo'}\n\n`;
      if (practice.examples && practice.examples.length > 0) {
        outputText += '**Examples:**\n';
        for (const example of practice.examples) {
          outputText += `- ${example}\n`;
        }
        outputText += '\n';
      }
    }
  }

  outputText += '═════════════════════════════════════════════\n';
  outputText += '\nRelated Commands:\n';
  outputText += '  /decision-tracker <technology> - Find decisions about tools\n';
  outputText += '  /knowledge-search <question> - Search for specific patterns\n';

  return {
    success: true,
    text: outputText,
    practices: practices,
    summary: {
      area: practiceArea,
      teamCount: practices.length,
      format
    }
  };
}

/**
 * Analyze practices from repositories
 */
function analyzePractices(area, compareTeams) {
  const practices = [];
  const config = loadConfig();

  // Analyze CI/CD configurations
  if (area.toLowerCase().includes('deploy') || area.toLowerCase().includes('ci')) {
    for (const repoPath of config.repositories.length > 0 ? config.repositories : [process.cwd()]) {
      const ciFiles = findFiles(repoPath, ['.yml', '.yaml', '.json'], ['.github/workflows', '.gitlab-ci.yml', 'Jenkinsfile', 'azure-pipelines']);

      for (const ciFile of ciFiles.slice(0, 3)) {
        practices.push({
          team: path.basename(path.dirname(path.dirname(ciFile))) || 'Unknown',
          area: 'deployment',
          approach: 'CI/CD Pipeline',
          tools: ['GitHub Actions', 'GitLab CI', 'Jenkins'],
          config: path.basename(ciFile)
        });
      }
    }
  }

  // Analyze testing configurations
  if (area.toLowerCase().includes('test')) {
    const testConfigs = ['jest.config', 'pytest.ini', 'go.mod', 'package.json', 'pom.xml'];
    for (const repoPath of config.repositories.length > 0 ? config.repositories : [process.cwd()]) {
      for (const testConfig of testConfigs) {
        const found = findFiles(repoPath, ['.js', '.json', '.ini'], [testConfig]);
        for (const file of found.slice(0, 2)) {
          practices.push({
            team: path.basename(path.dirname(path.dirname(file))) || 'Unknown',
            area: 'testing',
            approach: 'Test Configuration',
            details: 'See ' + path.basename(file)
          });
        }
      }
    }
  }

  // General pattern matching for monitoring, api-design, etc.
  const patternKeywords = {
    'monitoring': ['prometheus', 'grafana', 'datadog', 'newrelic', 'cloudwatch'],
    'api-design': ['openapi', 'swagger', 'graphql', 'rest', 'grpc'],
    'code-review': ['.eslintrc', '.prettierrc', 'reviewdog', 'lint']
  };

  for (const [patternArea, keywords] of Object.entries(patternKeywords)) {
    if (area.toLowerCase().includes(patternArea)) {
      for (const keyword of keywords) {
        const keywordResults = searchRepositories(keyword);
        for (const result of keywordResults.slice(0, 3)) {
          if (result.file) {
            const team = path.basename(path.dirname(result.file)) || 'Unknown';
            if (!compareTeams || compareTeams.includes(team)) {
              practices.push({
                team,
                area: patternArea,
                approach: 'Using ' + keyword,
                details: `Found in ${path.basename(result.file)}`
              });
            }
          }
        }
      }
    }
  }

  return practices;
}

/**
 * Find files matching patterns
 */
function findFiles(dir, extensions, names) {
  const results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        results.push(...findFiles(fullPath, extensions, names));
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        const baseName = path.basename(item);

        if (extensions.includes(ext) || names.some(n => baseName.includes(n))) {
          results.push(fullPath);
        }
      }
    }
  } catch {
    // Skip inaccessible directories
  }

  return results;
}

module.exports = {
  // Plugin metadata
  ...pluginInfo,

  // Configuration
  loadConfig,

  // Command handlers
  knowledgeSearch,
  decisionTracker,
  teamPractices,

  // Utility functions
  searchRepositories,
  findDecisionRecords,
  analyzePractices
};