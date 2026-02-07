#!/bin/bash
# Get security guidelines

cd "$(dirname "$0")/.."

vulnerability=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --vulnerability)
      vulnerability="$2"
      shift 2
      ;;
    --vulnerability=*)
      vulnerability="${1#*=}"
      shift
      ;;
    *)
      vulnerability="$1"
      shift
      ;;
  esac
done

# Run Node.js to get security guidelines with stdin (prevents shell injection)
printf '%s\n' "$vulnerability" | node -e "
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });
let vulnerability = '';

rl.on('line', (line) => {
  vulnerability = line;
});

rl.on('close', () => {
  const { getSecurityGuidelinesForPlugin } = require('./index.js');
  const guidelines = getSecurityGuidelinesForPlugin(vulnerability);
  console.log('# Security Guidelines');
  console.log('');
  if (vulnerability) {
    guidelines.forEach(g => {
      console.log('## ' + g.vulnerabilityType);
      console.log('Severity: ' + g.severity);
      console.log('CWE: ' + g.cweId);
      console.log('');
      console.log('Description:');
      console.log(g.description);
      console.log('');
      console.log('Mitigation:');
      console.log(g.mitigation);
      console.log('');
    });
  } else {
    guidelines.forEach(g => {
      console.log('- **' + g.vulnerabilityType + '** (' + g.severity + ') - ' + g.cweId);
      console.log('  ' + g.description);
    });
  }
});
"