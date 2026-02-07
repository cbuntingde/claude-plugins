/**
 * Changelog and Migration Guide Generator
 * Generates changelogs and migration guides from git history or version information
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { ChangelogConfig, GeneratorResult } from '../types.js';

const execAsync = promisify(exec);

export async function generateChangelog(
  config: ChangelogConfig,
  gitHistory: boolean = true
): Promise<GeneratorResult> {
  const filesGenerated: string[] = [];
  const warnings: string[] = [];

  try {
    // Create output directory
    await fs.mkdir(config.outputPath, { recursive: true });

    let changelogData: ChangelogEntry[] = [];

    // Gather changelog data
    if (gitHistory) {
      try {
        changelogData = await generateFromGitHistory();
      } catch (error) {
        warnings.push(`Could not generate from git history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Also read existing changelog if it exists
    if (config.versionsPath) {
      const existingEntries = await readExistingChangelog(config.versionsPath);
      changelogData = [...changelogData, ...existingEntries];
    }

    // Generate changelog
    const changelog = generateChangelogMarkdown(changelogData);
    const changelogPath = path.join(config.outputPath, 'CHANGELOG.md');
    await fs.writeFile(changelogPath, changelog, 'utf-8');
    filesGenerated.push(changelogPath);

    // Generate migration guides
    if (config.includeMigrationGuides && changelogData.length > 1) {
      const migrationGuide = generateMigrationGuide(changelogData);
      const migrationPath = path.join(config.outputPath, 'MIGRATION.md');
      await fs.writeFile(migrationPath, migrationGuide, 'utf-8');
      filesGenerated.push(migrationPath);
    }

    // Generate HTML version
    if (config.format === 'html' || !config.format) {
      const htmlChangelog = generateChangelogHTML(changelogData);
      const htmlPath = path.join(config.outputPath, 'changelog.html');
      await fs.writeFile(htmlPath, htmlChangelog, 'utf-8');
      filesGenerated.push(htmlPath);
    }

    return {
      success: true,
      outputPath: config.outputPath,
      filesGenerated,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    return {
      success: false,
      outputPath: config.outputPath,
      filesGenerated,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

interface ChangelogEntry {
  version: string;
  date: Date;
  description?: string;
  changes: Change[];
  breaking?: boolean;
}

interface Change {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
  pr?: number;
  issue?: number;
  author?: string;
}

async function generateFromGitHistory(): Promise<ChangelogEntry[]> {
  const entries: ChangelogEntry[] = [];

  try {
    // Get git tags
    const { stdout: tagsOutput } = await execAsync('git tag --sort="-v:refname"');
    const tags = tagsOutput.trim().split('\n').filter(Boolean);

    // Get all commits
    const { stdout: logOutput } = await execAsync(
      'git log --pretty=format:"%H|%ai|%an|%s|%b" --reverse'
    );
    const commits = logOutput.trim().split('\n');

    // Group commits by version
    let currentVersion = '0.0.0';
    const changesByVersion = new Map<string, Change[]>();

    for (const commit of commits) {
      const [hash, date, author, subject, body] = commit.split('|');
      const commitData = { hash, date: new Date(date), author, subject, body };

      // Check if this commit is a tag
      const tagIndex = tags.findIndex(tag =>
        commitData.subject.includes(`Release ${tag}`) ||
        commitData.subject.includes(`v${tag}`)
      );

      if (tagIndex !== -1) {
        currentVersion = tags[tagIndex];
      }

      if (!changesByVersion.has(currentVersion)) {
        changesByVersion.set(currentVersion, []);
      }

      // Parse commit message to determine change type
      const change = parseCommitToChange(commitData);
      if (change) {
        changesByVersion.get(currentVersion)!.push(change);
      }
    }

    // Convert to changelog entries
    for (const [version, changes] of changesByVersion.entries()) {
      entries.push({
        version,
        date: new Date(), // Would need more sophisticated date tracking
        changes,
        breaking: changes.some(c => c.type === 'removed' || c.type === 'changed')
      });
    }

    return entries.reverse(); // Most recent first
  } catch (error) {
    throw new Error(`Failed to generate from git history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseCommitToChange(commit: {
  hash: string;
  date: Date;
  author: string;
  subject: string;
  body: string;
}): Change | null {
  const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\((.*)\))?: (.*)$/i;
  const match = commit.subject.match(conventionalCommitRegex);

  if (!match) {
    // Non-conventional commit, try to categorize
    const subject = commit.subject.toLowerCase();
    if (subject.startsWith('add') || subject.startsWith('new')) {
      return {
        type: 'added',
        description: commit.subject,
        author: commit.author
      };
    } else if (subject.startsWith('fix') || subject.startsWith('bugfix')) {
      return {
        type: 'fixed',
        description: commit.subject,
        author: commit.author
      };
    }
    return null;
  }

  const [, type, scope, description] = match;

  const typeMap: Record<string, Change['type']> = {
    feat: 'added',
    fix: 'fixed',
    docs: 'changed',
    style: 'changed',
    refactor: 'changed',
    perf: 'changed',
    test: 'changed',
    build: 'changed',
    ci: 'changed',
    chore: 'changed',
    revert: 'removed'
  };

  const changeType = typeMap[type.toLowerCase()] || 'changed';

  // Check for breaking change indicator
  const breaking = commit.body.toLowerCase().includes('breaking change') ||
                   description.toLowerCase().includes('breaking');

  return {
    type: breaking ? 'removed' : changeType,
    description: scope ? `${scope}: ${description}` : description,
    author: commit.author
  };
}

async function readExistingChangelog(versionsPath: string): Promise<ChangelogEntry[]> {
  const entries: ChangelogEntry[] = [];

  try {
    const content = await fs.readFile(versionsPath, 'utf-8');
    // Parse existing CHANGELOG.md
    // This is a simplified parser - would need more robust parsing in production
    const versionBlocks = content.split(/^##\s+/m).slice(1);

    for (const block of versionBlocks) {
      const lines = block.split('\n');
      const versionLine = lines[0];
      const versionMatch = versionLine.match(/\[?(\d+\.\d+\.\d+)\]?\s*-\s*(.+)/);

      if (versionMatch) {
        const [, version, dateStr] = versionMatch;
        const changes: Change[] = [];

        for (const line of lines.slice(1)) {
          const type = line.toLowerCase().startsWith('added') ? 'added' :
                      line.toLowerCase().startsWith('changed') ? 'changed' :
                      line.toLowerCase().startsWith('deprecated') ? 'deprecated' :
                      line.toLowerCase().startsWith('removed') ? 'removed' :
                      line.toLowerCase().startsWith('fixed') ? 'fixed' :
                      line.toLowerCase().startsWith('security') ? 'security' : null;

          if (type) {
            changes.push({
              type,
              description: line.replace(/^Added|Changed|Deprecated|Removed|Fixed|Security:\s*/i, '').trim()
            });
          }
        }

        entries.push({
          version,
          date: new Date(dateStr),
          changes,
          breaking: changes.some(c => c.type === 'removed')
        });
      }
    }
  } catch {
    // Ignore errors reading existing changelog
  }

  return entries;
}

function generateChangelogMarkdown(entries: ChangelogEntry[]): string {
  let markdown = `# Changelog\n\n`;
  markdown += `All notable changes to this project will be documented in this file.\n\n`;
  markdown += `The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n`;
  markdown += `and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n---\n\n`;

  for (const entry of entries) {
    markdown += `## [${entry.version}] - ${formatDate(entry.date)}\n\n`;

    if (entry.description) {
      markdown += `${entry.description}\n\n`;
    }

    const changesByType = groupChangesByType(entry.changes);

    for (const [type, changes] of Object.entries(changesByType)) {
      if (changes.length > 0) {
        markdown += `### ${capitalize(type)}\n`;
        for (const change of changes) {
          markdown += `- ${change.description}`;
          if (change.pr) markdown += ` (#${change.pr})`;
          if (change.author) markdown += ` (@${change.author})`;
          markdown += '\n';
        }
        markdown += '\n';
      }
    }

    markdown += '---\n\n';
  }

  return markdown;
}

function generateChangelogHTML(entries: ChangelogEntry[]): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changelog</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    .version {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #0066cc;
    }
    .version h2 {
      color: #0066cc;
      margin-bottom: 0.5rem;
    }
    .version-date {
      color: #666;
      font-size: 0.9rem;
    }
    .change-type {
      margin: 1rem 0 0.5rem 0;
      font-size: 1.1rem;
      color: #333;
    }
    .change-list {
      list-style: none;
      padding-left: 0;
    }
    .change-list li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .added { color: #28a745; }
    .changed { color: #007bff; }
    .deprecated { color: #ffc107; }
    .removed { color: #dc3545; }
    .fixed { color: #17a2b8; }
    .security { color: #fd7e14; }
  </style>
</head>
<body>
  <h1>Changelog</h1>
  <p>All notable changes to this project will be documented in this file.</p>
  <hr>
`;

  for (const entry of entries) {
    html += `<div class="version">`;
    html += `<h2>${entry.version}</h2>`;
    html += `<span class="version-date">${formatDate(entry.date)}</span>`;

    if (entry.description) {
      html += `<p>${entry.description}</p>`;
    }

    const changesByType = groupChangesByType(entry.changes);

    for (const [type, changes] of Object.entries(changesByType)) {
      if (changes.length > 0) {
        html += `<h3 class="change-type ${type}">${capitalize(type)}</h3>`;
        html += `<ul class="change-list">`;
        for (const change of changes) {
          html += `<li>${change.description}`;
          if (change.pr) html += ` <a href="#${change.pr}">#${change.pr}</a>`;
          html += `</li>`;
        }
        html += `</ul>`;
      }
    }

    html += `</div>`;
  }

  html += `
</body>
</html>`;

  return html;
}

function generateMigrationGuide(entries: ChangelogEntry[]): string {
  let markdown = `# Migration Guide\n\n`;
  markdown += `This guide helps you migrate between major versions of the API.\n\n---\n\n`;

  // Find breaking changes
  const breakingEntries = entries.filter(e => e.breaking);

  for (let i = 0; i < breakingEntries.length - 1; i++) {
    const current = breakingEntries[i];
    const previous = breakingEntries[i + 1];

    markdown += `## Migrating from ${previous.version} to ${current.version}\n\n`;

    const breakingChanges = current.changes.filter(c =>
      c.type === 'removed' || c.type === 'changed'
    );

    if (breakingChanges.length > 0) {
      markdown += `### Breaking Changes\n\n`;
      for (const change of breakingChanges) {
        markdown += `#### ${change.description}\n\n`;
        markdown += `**Before:**\n\`\`\`\n// Old code example\n\`\`\`\n\n`;
        markdown += `**After:**\n\`\`\`\n// New code example\n\`\`\`\n\n`;
      }
    }

    const removedFeatures = current.changes.filter(c => c.type === 'removed');
    if (removedFeatures.length > 0) {
      markdown += `### Removed Features\n\n`;
      for (const change of removedFeatures) {
        markdown += `- ${change.description}\n`;
      }
      markdown += '\n';
    }

    const newFeatures = current.changes.filter(c => c.type === 'added');
    if (newFeatures.length > 0) {
      markdown += `### New Features to Adopt\n\n`;
      for (const change of newFeatures) {
        markdown += `- ${change.description}\n`;
      }
      markdown += '\n';
    }

    markdown += '---\n\n';
  }

  return markdown;
}

function groupChangesByType(changes: Change[]): Record<string, Change[]> {
  const grouped: Record<string, Change[]> = {
    added: [],
    changed: [],
    deprecated: [],
    removed: [],
    fixed: [],
    security: []
  };

  for (const change of changes) {
    grouped[change.type].push(change);
  }

  return grouped;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
