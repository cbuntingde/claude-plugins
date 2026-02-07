/**
 * Secrets Detection Hook Plugin
 * Detects and blocks commands/files containing API keys, passwords, or PII
 */

import { scanObjectForSecrets, formatScanResult } from './detector.js';

export interface PreToolUseInput {
  toolName: string;
  arguments: Record<string, unknown>;
}

export interface PreToolUseOutput {
  action: 'proceed' | 'block';
  message?: string;
  details?: Record<string, unknown>;
}

interface PluginConfig {
  enabledTools: string[];
  blockedSeverity: ('critical' | 'high' | 'medium')[];
  allowPattern: string[];
}

const DEFAULT_CONFIG: PluginConfig = {
  enabledTools: [
    'Write',
    'Edit',
    'Bash',
    'WebSearch',
    'WebFetch'
  ],
  blockedSeverity: ['critical', 'high'],
  allowPattern: []
};

let config: PluginConfig = { ...DEFAULT_CONFIG };

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * Load configuration from environment variables
 */
function loadConfiguration(): void {
  // Parse enabled tools from environment
  const enabledToolsEnv = process.env.SECRETS_DETECTION_ENABLED_TOOLS;
  if (enabledToolsEnv) {
    config.enabledTools = enabledToolsEnv.split(',').map((t: string) => t.trim());
  }

  // Parse blocked severity levels
  const blockedSeverityEnv = process.env.SECRETS_DETECTION_BLOCKED_SEVERITY;
  if (blockedSeverityEnv) {
    const levels = blockedSeverityEnv.split(',').map((s: string) => s.trim().toLowerCase());
    config.blockedSeverity = levels.filter((l: string): l is 'critical' | 'high' | 'medium' =>
      l === 'critical' || l === 'high' || l === 'medium'
    );
  }

  // Parse allowed patterns (regex patterns to exclude)
  const allowPatternEnv = process.env.SECRETS_DETECTION_ALLOW_PATTERNS;
  if (allowPatternEnv) {
    config.allowPattern = allowPatternEnv.split(',').map((p: string) => p.trim());
  }
}

/**
 * Main PreToolUse hook handler
 * Detects secrets in tool arguments before execution
 */
export async function preToolUseHandler(input: PreToolUseInput): Promise<PreToolUseOutput> {
  loadConfiguration();

  const { toolName, arguments: args } = input;

  // Check if this tool should be scanned
  if (!config.enabledTools.includes(toolName)) {
    return { action: 'proceed' };
  }

  // Scan the tool arguments for secrets
  const scanResult = scanObjectForSecrets(args);

  if (!scanResult.hasSecrets) {
    return { action: 'proceed' };
  }

  // Check if the severity level should be blocked
  if (scanResult.severity === 'none' || !config.blockedSeverity.includes(scanResult.severity)) {
    return { action: 'proceed' };
  }

  // Block the operation and provide detailed feedback
  const message = formatScanResult(scanResult);

  return {
    action: 'block',
    message,
    details: {
      toolName,
      severity: scanResult.severity,
      secretCount: scanResult.secrets.length,
      secrets: scanResult.secrets.map(s => ({
        pattern: s.patternName,
        description: s.description,
        position: s.position
      }))
    }
  };
}

/**
 * Plugin metadata
 */
export const name = 'secrets-detection-hook';
export const version = '1.0.0';

// Export for testing
export { config, DEFAULT_CONFIG, loadConfiguration };
