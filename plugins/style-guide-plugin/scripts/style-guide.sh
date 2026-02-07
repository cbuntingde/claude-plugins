#!/bin/bash
# Get style guide for a programming language

cd "$(dirname "$0")/.."

language="${1:-}"
format="text"

if [ -z "$language" ]; then
  echo "Usage: /style-guide <language> [--section <section>] [--format <text|json>]"
  echo ""
  echo "Supported languages: typescript, javascript, python, go, rust, java, cpp, csharp, ruby, php, swift, kotlin, scala, lua"
  exit 1
fi

# Parse options
shift
while [[ $# -gt 0 ]]; do
  case $1 in
    --section)
      section="$2"
      shift 2
      ;;
    --format)
      format="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Run Node.js to get style guide with stdin (prevents shell injection)
printf '%s\n' "$language" "$section" "$format" | node -e "
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });
let first = true;
let language = '';
let section = '';
let format = 'text';

rl.on('line', (line) => {
  if (first) { language = line; first = false; }
  else if (!section) { section = line; }
  else { format = line; }
});

rl.on('close', async () => {
  const { getStyleGuideForLanguage } = require('./index.js');
  const guide = await getStyleGuideForLanguage(language);
  if (guide.error) {
    console.log(guide.error);
    return;
  }
  console.log('# ' + guide.language.charAt(0).toUpperCase() + guide.language.slice(1) + ' Style Guide');
  console.log('');
  guide.guidelines.forEach(g => {
    console.log('## ' + (g.title || g.section));
    console.log(g.content);
    console.log('');
  });
});
" 2>/dev/null