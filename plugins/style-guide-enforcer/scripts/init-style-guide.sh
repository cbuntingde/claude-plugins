#!/bin/bash
# Initialize or update style guide configuration

cd "$(dirname "$0")/.."

preset="custom"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --preset=*)
      preset="${1#*=}"
      shift
      ;;
    --preset)
      preset="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Run Node.js init-style-guide
node -e "
const { initStyleGuide } = require('./index.js');
const result = initStyleGuide({ preset: '$preset' });

if (!result.success) {
  console.log('Failed to initialize style guide: ' + result.error);
  process.exit(1);
}

console.log('Style Guide Initialized');
console.log('=======================');
console.log('');
console.log('Preset: ' + result.preset);
console.log('Config file: ' + result.configPath);
console.log('');
console.log(result.message);
console.log('');
console.log('Run /check-style to validate your code against these rules.');
"