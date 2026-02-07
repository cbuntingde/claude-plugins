#!/bin/bash
# Check code files against style guide conventions

cd "$(dirname "$0")/.."

# Parse file arguments
files=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --*)
      shift
      ;;
    *)
      files+=("$1")
      shift
      ;;
  esac
done

# Run Node.js check with stdin (prevents shell injection)
printf '%s\n' "${files[@]}" "" | node -e "
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });
const files = [];
let line = '';

rl.on('line', (input) => {
  if (input === '') {
    if (files.length > 0) runCheck(files);
    rl.close();
  } else {
    files.push(input);
  }
});

rl.on('close', () => {
  if (files.length > 0) runCheck(files);
});

function runCheck(fileList) {
  const { checkStyle } = require('./index.js');
  const result = checkStyle({ files: fileList });

  if (!result.success) {
    console.log(result.error);
    process.exit(1);
  }

  console.log('Style Check Results');
  console.log('==================');
  console.log('Files checked: ' + result.filesChecked);
  console.log('Total violations: ' + result.totalViolations);
  console.log('');

  for (const fileResult of result.results) {
    if (fileResult.error) {
      console.log('File: ' + fileResult.file);
      console.log('  ERROR: ' + fileResult.error);
    } else if (fileResult.clean) {
      console.log('File: ' + fileResult.file);
      console.log('  OK - No violations found');
    } else {
      console.log('File: ' + fileResult.file);
      console.log('  Violations: ' + fileResult.violationCount);
      for (const v of fileResult.violations) {
        console.log('  [' + v.severity.toUpperCase() + '] Line ' + v.line + ': ' + v.message);
      }
    }
    console.log('');
  }

  if (result.totalViolations > 0) {
    console.log('Run /fix-style to automatically fix issues');
    process.exit(1);
  }
}
"