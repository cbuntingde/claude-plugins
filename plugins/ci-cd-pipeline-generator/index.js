/**
 * CI/CD Pipeline Generator Plugin
 * Generates production-ready CI/CD pipelines for GitHub Actions, GitLab CI, and Jenkins
 */

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load command handlers
 */
async function loadCommands() {
  const commandsDir = resolve(__dirname, 'scripts');
  const commands = {};

  const commandFiles = [
    { name: 'github-actions', file: 'github-actions.js' },
    { name: 'gitlab-ci', file: 'gitlab-ci.js' },
    { name: 'jenkins-pipeline', file: 'jenkins-pipeline.js' }
  ];

  for (const cmd of commandFiles) {
    const modulePath = resolve(commandsDir, cmd.file);
    const commandModule = await import(`file://${modulePath}`);
    commands[cmd.name] = commandModule.default || commandModule;
  }

  return commands;
}

const commands = await loadCommands();

export default {
  name: 'ci-cd-pipeline-generator',
  version: '1.0.0',
  commands
};