/**
 * Mock API Server Plugin for Claude Code
 *
 * Create, configure, and manage mock API servers for testing and development.
 */

const { name, version } = require('./package.json');

/**
 * Plugin name
 */
exports.name = name.replace('-plugin', '');

/**
 * Plugin version
 */
exports.version = version;

/**
 * Commands provided by this plugin
 */
exports.commands = {
  'mock-api': {
    name: 'mock-api',
    description: 'Start and manage mock API servers for testing',
    handler: async (args) => {
      const { spawn } = require('child_process');
      const subcommand = args[0];
      const scriptPath = require('path').resolve(__dirname, 'scripts/mock-api-cli.js');

      return new Promise((resolve, reject) => {
        const child = spawn('node', [scriptPath, ...args], {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: __dirname
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve({ content: [{ type: 'text', text: stdout }] });
          } else {
            reject(new Error(stderr || `Command failed with exit code ${code}`));
          }
        });

        child.on('error', (err) => {
          reject(err);
        });
      });
    }
  }
};