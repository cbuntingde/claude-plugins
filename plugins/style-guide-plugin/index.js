/**
 * Style Guide Plugin - Main Entry Point
 * Registers commands and exports functions for Claude Code
 */

const {
  detectFromFile,
  detectFromCode,
  getStyleGuide,
  getSecurityGuidelines
} = require('./scripts/commands');

/**
 * Detect programming language from filename or code
 * @param {string} filename - File to detect language from
 * @param {string} code - Code content to detect language from
 * @returns {object} Detection result
 */
function detectLanguage(filename, code) {
  const result = {
    detected: null,
    fromFile: false,
    fromCode: false,
    filename: filename || null
  };

  if (filename) {
    const lang = detectFromFile(filename);
    if (lang) {
      result.detected = lang;
      result.fromFile = true;
    }
  }

  if (!result.detected && code) {
    const lang = detectFromCode(code);
    if (lang) {
      result.detected = lang;
      result.fromCode = true;
    }
  }

  if (!result.detected) {
    result.detected = 'unknown';
  }

  return result;
}

/**
 * Get style guide for a programming language
 * @param {string} language - Programming language
 * @param {object} options - Options (section, format)
 * @returns {object} Style guide content
 */
async function getStyleGuideForLanguage(language, options = {}) {
  const guide = await getStyleGuide(language);
  if (!guide) {
    return { error: `No style guide found for language: ${language}` };
  }

  if (!Array.isArray(guide.guidelines)) {
    return { error: `Invalid style guide for language: ${language}` };
  }

  return {
    language: guide.language,
    sources: guide.sources,
    guidelines: guide.guidelines.slice(0, options.limit || 20)
  };
}

/**
 * Get security guidelines
 * @param {string} vulnerability - Optional vulnerability type to filter
 * @returns {array} Security guidelines
 */
function getSecurityGuidelinesForPlugin(vulnerability = null) {
  return getSecurityGuidelines(vulnerability);
}

module.exports = {
  detectLanguage,
  getStyleGuideForLanguage,
  getSecurityGuidelinesForPlugin
};