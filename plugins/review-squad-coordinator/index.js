#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PLUGIN_VERSION = '1.0.0';
const PLUGIN_NAME = 'review-squad-coordinator';

const OWNERSHIP_FILE = 'CODEOWNERS';
const DEFAULT_CONFIG = {
  ownershipFile: OWNERSHIP_FILE,
  maxReviewersPerPR: 3,
  minReviewersPerPR: 1,
  excludeAuthorFromReview: true,
  excludeRecentlyReviewed: true,
  recentReviewThresholdDays: 7,
  expertiseWeight: 0.4,
  ownershipWeight: 0.4,
  availabilityWeight: 0.2,
  roundRobinEnabled: true,
  fallbackReviewers: []
};

function loadConfig(configPath = null) {
  const configPaths = [
    configPath,
    path.join(process.cwd(), '.review-squadrc.json'),
    path.join(process.cwd(), '.review-squadrc'),
    path.join(process.env.HOME || process.env.USERPROFILE, '.review-squadrc.json'),
    path.join(process.env.HOME || process.env.USERPROFILE, '.review-squadrc')
  ].filter(Boolean);

  let config = { ...DEFAULT_CONFIG };

  for (const configFile of configPaths) {
    if (fs.existsSync(configFile)) {
      try {
        const fileContent = fs.readFileSync(configFile, 'utf-8');
        const userConfig = JSON.parse(fileContent);
        config = { ...config, ...userConfig };
        break;
      } catch (e) {
        // Skip invalid config files
      }
    }
  }

  return config;
}

function parseCodeowners(content) {
  const owners = new Map();
  const patterns = [];

  const lines = content.split('\n');
  let currentGroup = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('#@')) {
      currentGroup = trimmed.substring(1);
      continue;
    }

    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex === -1) continue;

    const pattern = trimmed.substring(0, spaceIndex);
    const ownerList = trimmed.substring(spaceIndex + 1).trim();

    if (!pattern || !ownerList) continue;

    const ownerArray = ownerList.split(/\s+/).filter(Boolean);

    patterns.push({
      pattern,
      owners: ownerArray,
      group: currentGroup
    });

    for (const owner of ownerArray) {
      if (!owners.has(owner)) {
        owners.set(owner, {
          name: owner,
          patterns: [],
          expertise: new Set(),
          reviewCount: 0,
          lastReviewDate: null
        });
      }
      owners.get(owner).patterns.push(pattern);
    }
  }

  return { owners, patterns };
}

function analyzeGitHistory(repoPath, sinceDate = null) {
  const { execSync } = require('child_process');

  try {
    const sinceArg = sinceDate
      ? ` --since="${sinceDate.toISOString().split('T')[0]}"`
      : '';

    const logOutput = execSync(
      `git log --pretty=format:"%H|%an|%ae|%s" --name-only${sinceArg}`,
      {
        cwd: repoPath,
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024
      }
    );

    const fileAuthors = new Map();

    const lines = logOutput.split('\n');
    let currentCommit = null;

    for (const line of lines) {
      if (line.includes('|')) {
        const [hash, name, email, subject] = line.split('|');
        currentCommit = { hash, name, email, subject, files: [] };
      } else if (line.trim() && currentCommit) {
        currentCommit.files.push(line.trim());

        if (!fileAuthors.has(line.trim())) {
          fileAuthors.set(line.trim(), new Map());
        }
        const authors = fileAuthors.get(line.trim());
        const existing = authors.get(currentCommit.email) || 0;
        authors.set(currentCommit.email, existing + 1);
      }
    }

    return fileAuthors;
  } catch (e) {
    return new Map();
  }
}

function calculateExpertiseScore(owners, fileAuthors, config) {
  const expertiseScores = new Map();

  for (const [owner, ownerData] of owners) {
    let totalScore = 0;
    let fileCount = 0;

    for (const pattern of ownerData.patterns) {
      const regex = patternToRegex(pattern);

      for (const [file, authors] of fileAuthors) {
        if (regex.test(file)) {
          for (const [email, commits] of authors) {
            if (email.includes(owner.replace('@', '')) || owner.includes(email.split('@')[0])) {
              totalScore += commits;
              fileCount++;
            }
          }
        }
      }
    }

    expertiseScores.set(owner, {
      owner: ownerData,
      score: fileCount > 0 ? totalScore / fileCount : 0,
      filesTouched: fileCount
    });
  }

  return expertiseScores;
}

function patternToRegex(pattern) {
  let regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '___STAR_STAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___\w+___/g, '.*')
    .replace(/\?/g, '.');

  if (!regexStr.startsWith('^')) {
    regexStr = '.*' + regexStr;
  }

  return new RegExp(regexStr);
}

function findMatchingOwners(changedFiles, patterns) {
  const fileOwnership = new Map();

  for (const file of changedFiles) {
    const matchingOwners = [];

    for (const { pattern, owners } of patterns) {
      const regex = patternToRegex(pattern);
      if (regex.test(file)) {
        matchingOwners.push(...owners);
      }
    }

    fileOwnership.set(file, [...new Set(matchingOwners)]);
  }

  return fileOwnership;
}

function calculateOwnershipScore(fileOwnership, owners) {
  const ownershipScores = new Map();

  for (const [owner, ownerData] of owners) {
    ownershipScores.set(owner, 0);
  }

  for (const [, fileOwners] of fileOwnership) {
    for (const owner of fileOwners) {
      ownershipScores.set(owner, (ownershipScores.get(owner) || 0) + 1);
    }
  }

  return ownershipScores;
}

function getRoundRobinIndex(reviewHistory, owner) {
  const history = reviewHistory.get(owner) || [];
  return history.length;
}

function calculateRoundRobinScore(reviewHistory, owner) {
  const index = getRoundRobinIndex(reviewHistory, owner);
  return -index;
}

function selectReviewers(changedFiles, options = {}) {
  const config = loadConfig(options.configPath);

  const repoPath = options.repoPath || process.cwd();
  const ownershipFile = path.join(repoPath, config.ownershipFile);
  const reviewHistory = options.reviewHistory || new Map();
  const availableReviewers = options.availableReviewers || [];

  let owners = new Map();
  let patterns = [];

  if (fs.existsSync(ownershipFile)) {
    const content = fs.readFileSync(ownershipFile, 'utf-8');
    const parsed = parseCodeowners(content);
    owners = parsed.owners;
    patterns = parsed.patterns;
  }

  if (owners.size === 0 && availableReviewers.length === 0) {
    return {
      success: false,
      error: 'No CODEOWNERS file found and no fallback reviewers specified',
      reviewers: config.fallbackReviewers || []
    };
  }

  const fileAuthors = analyzeGitHistory(repoPath, options.sinceDate);
  const fileOwnership = findMatchingOwners(changedFiles, patterns);
  const ownershipScores = calculateOwnershipScore(fileOwnership, owners);
  const expertiseScores = calculateExpertiseScore(owners, fileAuthors, config);

  const candidateScores = new Map();
  const candidates = new Set([...owners.keys(), ...availableReviewers]);

  for (const candidate of candidates) {
    const ownershipScore = ownershipScores.get(candidate) || 0;
    const expertiseScore = expertiseScores.get(candidate)?.score || 0;
    const roundRobinScore = config.roundRobinEnabled
      ? calculateRoundRobinScore(reviewHistory, candidate)
      : 0;

    const totalScore =
      (ownershipScore * config.ownershipWeight) +
      (expertiseScore * config.expertiseWeight) +
      (roundRobinScore * config.availabilityWeight);

    candidateScores.set(candidate, {
      owner: candidate,
      ownershipScore,
      expertiseScore,
      roundRobinScore,
      totalScore,
      isCodeowner: owners.has(candidate),
      matchedFiles: findOwnerMatchedFiles(candidate, fileOwnership)
    });
  }

  const sortedCandidates = [...candidateScores.entries()]
    .sort((a, b) => b[1].totalScore - a[1].totalScore);

  const selectedReviewers = [];
  const usedReviewers = new Set();

  if (config.excludeAuthorFromReview && options.author) {
    usedReviewers.add(options.author);
  }

  for (const [candidate, scores] of sortedCandidates) {
    if (selectedReviewers.length >= config.maxReviewersPerPR) break;
    if (usedReviewers.has(candidate)) continue;

    const isRecentlyReviewed = config.excludeRecentlyReviewed &&
      options.sinceDate &&
      isRecentlyReviewedBy(candidate, options.sinceDate, reviewHistory);

    if (isRecentlyReviewed) continue;

    selectedReviewers.push({
      reviewer: candidate,
      ...scores,
      reason: scores.isCodeowner
        ? 'Primary codeowner for modified files'
        : 'Selected based on expertise and availability'
    });

    usedReviewers.add(candidate);
  }

  if (selectedReviewers.length < config.minReviewersPerPR) {
    const fallbackNeeded = config.minReviewersPerPR - selectedReviewers.length;
    const fallbackCandidates = availableReviewers.filter(
      r => !usedReviewers.has(r) && !selectedReviewers.find(s => s.reviewer === r)
    );

    for (const fallback of fallbackCandidates.slice(0, fallbackNeeded)) {
      selectedReviewers.push({
        reviewer: fallback,
        ownershipScore: 0,
        expertiseScore: 0,
        roundRobinScore: 0,
        totalScore: 0,
        isCodeowner: false,
        matchedFiles: [],
        reason: 'Fallback reviewer selected'
      });
    }
  }

  return {
    success: true,
    reviewers: selectedReviewers,
    summary: {
      totalCandidates: candidates.size,
      selectedCount: selectedReviewers.length,
      codeownersFound: owners.size,
      filesModified: changedFiles.length
    }
  };
}

function findOwnerMatchedFiles(owner, fileOwnership) {
  const matched = [];

  for (const [file, owners] of fileOwnership) {
    if (owners.includes(owner)) {
      matched.push(file);
    }
  }

  return matched;
}

function isRecentlyReviewedBy(reviewer, sinceDate, reviewHistory) {
  const history = reviewHistory.get(reviewer) || [];

  for (const review of history) {
    if (review.date >= sinceDate) {
      return true;
    }
  }

  return false;
}

function generateOwnershipSuggestion(repoPath, fileOwners = null) {
  const { execSync } = require('child_process');

  const suggestions = [];
  const seenOwners = new Map();

  if (!fileOwners) {
    try {
      const diffOutput = execSync('git diff --name-only HEAD~1', {
        cwd: repoPath,
        encoding: 'utf-8'
      });
      const files = diffOutput.split('\n').filter(Boolean);

      fileOwners = new Map();

      for (const file of files) {
        try {
          const blameOutput = execSync(`git blame -e -- "${file}"`, {
            cwd: repoPath,
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024
          });

          const lines = blameOutput.split('\n');
          const fileOwnersSet = new Set();

          for (const line of lines) {
            const emailMatch = line.match(/<([^>]+)>/);
            if (emailMatch) {
              fileOwnersSet.add(emailMatch[1]);
            }
          }

          if (fileOwnersSet.size > 0) {
            fileOwners.set(file, [...fileOwnersSet]);
          }
        } catch (e) {
          // Skip files that can't be blamed
        }
      }
    } catch (e) {
      return { success: false, error: 'Unable to analyze git history' };
    }
  }

  for (const [file, owners] of fileOwners) {
    const pattern = file.includes('/')
      ? file.substring(0, file.lastIndexOf('/')) + '/*'
      : file;

    const existingOwners = seenOwners.get(pattern) || new Set();

    for (const owner of owners) {
      if (!existingOwners.has(owner)) {
        existingOwners.add(owner);
        suggestions.push({
          pattern,
          owner,
          files: [file]
        });
      } else {
      }
    }

    seenOwners.set(pattern, existingOwners);
  }

  return {
    success: true,
    suggestions,
    format: '# Suggested CODEOWNERS entries\n# Add these to your CODEOWNERS file\n'
  };
}

function generateReviewAssignmentComment(assignmentResult) {
  const lines = [
    '## Code Review Assignment',
    '',
    '### Selected Reviewers'
  ];

  for (const reviewer of assignmentResult.reviewers) {
    const badges = [];

    if (reviewer.isCodeowner) {
      badges.push(':star: Codeowner');
    }
    if (reviewer.expertiseScore > 0) {
      badges.push(`:books: ${reviewer.expertiseScore.toFixed(1)} expertise`);
    }
    if (reviewer.matchedFiles.length > 0) {
      badges.push(`:file_folder: ${reviewer.matchedFiles.length} files`);
    }

    lines.push(`- **${reviewer.reviewer}** ${badges.join(' | ')}`);
    lines.push(`  - Reason: ${reviewer.reason}`);

    if (reviewer.matchedFiles.length > 0 && reviewer.matchedFiles.length <= 3) {
      lines.push(`  - Files: \`${reviewer.matchedFiles.join('`, `')}\``);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push(`*Generated by Review Squad Coordinator v${PLUGIN_VERSION}*`);

  return lines.join('\n');
}

module.exports = {
  name: PLUGIN_NAME,
  version: PLUGIN_VERSION,
  loadConfig,
  parseCodeowners,
  analyzeGitHistory,
  calculateExpertiseScore,
  findMatchingOwners,
  selectReviewers,
  generateOwnershipSuggestion,
  generateReviewAssignmentComment,
  DEFAULT_CONFIG
};