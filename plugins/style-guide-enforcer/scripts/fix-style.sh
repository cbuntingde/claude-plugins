#!/bin/bash
# Fix style guide violations in code files

cd "$(dirname "$0")/.."

# Parse arguments
files=()
preview=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preview)
      preview=true
      shift
      ;;
    --*)
      shift
      ;;
    *)
      files+=("$1")
      shift
      ;;
  esac
done

# Run Node.js fix with stdin (prevents shell injection)
printf '%s\n' "${files[@]}" "" | node -e "
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });
const files = [];
let line = '';

rl.on('line', (input) => {
  if (input === '') {
    if (files.length > 0) runFix(files);
    rl.close();
  } else {
    files.push(input);
  }
});

rl.on('close', () => {
  if (files.length > 0) runFix(files);
});

function runFix(fileList) {
  const { fixStyle } = require('./index.js');
  const result = fixStyle({ files: fileList, preview: $preview });

  if (!result.success) {
    console.log(result.error);
    process.exit(1);
  }

  console.log('Style Fix Results');
  console.log('==================');
  console.log('Files processed: ' + result.filesProcessed);
  console.log('Preview mode: ' + (result.preview ? 'yes' : 'no'));
  console.log('');

  let fixedCount = 0;
  let previewCount = 0;

  for (const fix of result.fixes) {
    if (fix.error) {
      console.log('File: ' + fix.file);
      console.log('  ERROR: ' + fix.error);
    } else if (fix.clean) {
      console.log('File: ' + fix.file);
      console.log('  OK - No fixes needed');
    } else if (fix.preview) {
      console.log('File: ' + fix.file);
      console.log('  PREVIEW - Changes would be made');
      previewCount++;
    } else {
      console.log('File: ' + fix.file);
      console.log('  FIXED - Issues resolved');
      fixedCount++;
    }
  }

  console.log('');
  console.log('Fixed: ' + fixedCount + ', Would fix: ' + previewCount);
}
"