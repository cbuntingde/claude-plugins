#!/bin/bash
# List all configured style guide rules

cd "$(dirname "$0")/.."

# Run Node.js list-rules
node -e "
const { listRules } = require('./index.js');
const result = listRules();

if (!result.success) {
  console.log('Failed to load style rules');
  process.exit(1);
}

console.log('Style Guide Rules');
console.log('=================');
console.log('');

console.log('NAMING CONVENTIONS');
console.log('------------------');
console.log('Variables: ' + result.rules.naming.variables);
console.log('Functions: ' + result.rules.naming.functions);
console.log('Classes: ' + result.rules.naming.classes);
console.log('Constants: ' + result.rules.naming.constants);
console.log('');

console.log('FORMATTING RULES');
console.log('----------------');
console.log('Indentation: ' + result.rules.formatting.indentation + ' (' + result.rules.formatting.indentSize + ' ' + (result.rules.formatting.indentation === 'spaces' ? 'spaces' : 'tabs') + ')');
console.log('Max line length: ' + result.rules.formatting.maxLineLength + ' characters');
console.log('Trailing whitespace: ' + (result.rules.formatting.trailingWhitespace === false ? 'prohibited' : 'allowed'));
console.log('');

console.log('IMPORT RULES');
console.log('------------');
console.log('Order: ' + result.rules.imports.order.join(' -> '));
console.log('Blank line between groups: ' + (result.rules.imports.blankLineBetweenGroups ? 'yes' : 'no'));
"