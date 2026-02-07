#!/bin/bash
# Detect programming language from filename or code

cd "$(dirname "$0")/.."

# Parse arguments
filename=""
code=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --code)
      code="$2"
      shift 2
      ;;
    --code=*)
      code="${1#*=}"
      shift
      ;;
    *.py|*.js|*.ts|*.java|*.cpp|*.go|*.rs|*.rb|*.php|*.swift|*.kt|*.scala|*.lua|*.c|*.cs|*.h|*.hpp)
      filename="$1"
      shift
      ;;
    *)
      filename="$1"
      shift
      ;;
  esac
done

# Run Node.js detection with stdin (prevents shell injection)
printf '%s\n' "$filename" "$code" | node -e "
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });
let first = true;
let filename = '';
let code = '';

rl.on('line', (line) => {
  if (first) { filename = line; first = false; }
  else { code = line; }
});

rl.on('close', () => {
  const { detectLanguage } = require('./index.js');
  const result = detectLanguage(filename, code);
  console.log('Detected Language: ' + result.detected);
  if (result.fromFile) console.log('Detected from filename: ' + filename);
  if (result.fromCode) console.log('Detected from code content');
});
"