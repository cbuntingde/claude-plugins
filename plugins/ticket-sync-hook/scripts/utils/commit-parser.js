/**
 * Commit Parser Utility
 * Parses git commit messages to extract ticket IDs and metadata
 */

class CommitParser {
  constructor() {
    // Jira pattern: PROJECT-123 (uppercase letters, hyphen, numbers)
    this.jiraPattern = /\b([A-Z]{2,10}-\d+)\b/g;

    // Linear pattern: Team-prefix (e.g., ENG-123, PROD-456)
    this.linearPattern = /\b([A-Z]{2,10}-[A-Z0-9]+)\b/g;

    // Commit type patterns for status mapping
    this.commitTypePatterns = {
      fix: /fix(es|ed)?\s*(.+)?:/i,
      feat: /feat(ure)?\s*(.+)?:/i,
      chore: /chore\s*(.+)?:/i,
      docs: /doc(s)?\s*(.+)?:/i,
      refactor: /refactor\s*(.+)?:/i,
      test: /test(s|ing)?\s*(.+)?:/i,
      build: /build\s*(.+)?:/i,
      ci: /ci\s*(.+)?:/i,
      perf: /perf\s*(.+)?:/i,
      style: /style\s*(.+)?:/i
    };
  }

  /**
   * Parse commit message and extract ticket information
   * @param {string} commitMessage - The git commit message
   * @returns {Object} Parsed commit data with ticket IDs and type
   */
  parseCommit(commitMessage) {
    if (!commitMessage || typeof commitMessage !== 'string') {
      return {
        jiraTickets: [],
        linearTickets: [],
        commitType: null,
        commitScope: null,
        rawMessage: commitMessage || ''
      };
    }

    const result = {
      jiraTickets: [],
      linearTickets: [],
      commitType: this._extractCommitType(commitMessage),
      commitScope: this._extractCommitScope(commitMessage),
      rawMessage: commitMessage.trim()
    };

    // Extract Jira tickets
    const jiraMatches = commitMessage.match(this.jiraPattern);
    if (jiraMatches) {
      result.jiraTickets = [...new Set(jiraMatches)];
    }

    // Extract Linear tickets (excluding Jira-style to avoid duplicates)
    const linearMatches = commitMessage.match(this.linearPattern);
    if (linearMatches) {
      result.linearTickets = linearMatches.filter(
        ticket => !result.jiraTickets.includes(ticket)
      );
      // Dedupe while preserving order
      result.linearTickets = [...new Set(result.linearTickets)];
    }

    return result;
  }

  /**
   * Extract commit type (fix, feat, etc.) from commit message
   * @param {string} commitMessage - The git commit message
   * @returns {string|null} The commit type or null
   * @private
   */
  _extractCommitType(commitMessage) {
    const firstLine = commitMessage.split('\n')[0];

    for (const [type, pattern] of Object.entries(this.commitTypePatterns)) {
      if (pattern.test(firstLine)) {
        return type;
      }
    }

    return null;
  }

  /**
   * Extract commit scope from conventional commit format
   * @param {string} commitMessage - The git commit message
   * @returns {string|null} The commit scope or null
   * @private
   */
  _extractCommitScope(commitMessage) {
    const firstLine = commitMessage.split('\n')[0];
    const scopeMatch = firstLine.match(/^\w+?\(([^)]+)\):/);

    return scopeMatch ? scopeMatch[1] : null;
  }

  /**
   * Map commit type to suggested ticket status
   * @param {string} commitType - The commit type
   * @returns {string} Suggested status for the ticket
   */
  mapCommitTypeToStatus(commitType) {
    const statusMap = {
      fix: 'Done',
      feat: 'Done',
      chore: 'Done',
      docs: 'Done',
      refactor: 'In Review',
      test: 'In Review',
      build: 'Done',
      ci: 'Done',
      perf: 'In Review',
      style: 'Done'
    };

    return statusMap[commitType] || 'In Progress';
  }
}

module.exports = CommitParser;
