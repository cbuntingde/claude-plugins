/**
 * GDPR/Privacy Scanner Plugin
 *
 * Production-ready GDPR compliance scanner with PII detection,
 * data retention validation, and consent management verification.
 *
 * @version 1.0.0
 * @author Chris Bunting <cbuntingde@gmail.com>
 */

const path = require('path');

// Command handlers (implemented in scripts/)
const commands = {
  'gdpr-scan': async () => {
    const { GDPRScanner } = require('./scripts/gdpr-scan.js');
    const scanner = new GDPRScanner();
    return await scanner.scan();
  },
  'pii-audit': async () => {
    const { PIIScanner } = require('./scripts/pii-audit.js');
    const scanner = new PIIScanner();
    return await scanner.scan();
  },
  'data-retention-check': async () => {
    const { RetentionPolicyChecker } = require('./scripts/data-retention-check.js');
    const checker = new RetentionPolicyChecker();
    return await checker.check();
  },
  'consent-validate': async () => {
    const { ConsentValidator } = require('./scripts/consent-validate.js');
    const validator = new ConsentValidator();
    return await validator.validate();
  },
  'privacy-impact-assessment': async () => {
    const { DPIAGenerator } = require('./scripts/privacy-impact-assessment.js');
    const generator = new DPIAGenerator();
    return await generator.generate();
  },
  'right-to-be-forgotten': async () => {
    const { ErasureValidator } = require('./scripts/right-to-be-forgotten.js');
    const validator = new ErasureValidator();
    return await validator.validate();
  },
  'data-mapping': async () => {
    const { DataMapper } = require('./scripts/data-mapping.js');
    const mapper = new DataMapper();
    return await mapper.generate();
  },
  'cookie-consent-check': async () => {
    const { CookieConsentChecker } = require('./scripts/cookie-consent-check.js');
    const checker = new CookieConsentChecker();
    return await checker.check();
  }
};

// Plugin metadata
const plugin = {
  name: 'gdpr-privacy-scanner',
  version: '1.0.0',
  description: 'Production-ready GDPR/Privacy compliance scanner with PII detection, data retention validation, and consent management verification',
  author: {
    name: 'Chris Bunting',
    email: 'cbuntingde@gmail.com'
  },

  // Initialize plugin
  initialize: async () => {
    // No initialization required
    return true;
  },

  // Cleanup on unload
  cleanup: async () => {
    // No cleanup required
    return true;
  },

  // Export commands
  commands
};

module.exports = plugin;
