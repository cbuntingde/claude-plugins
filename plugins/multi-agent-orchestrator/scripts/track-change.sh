#!/usr/bin/env bash
#
# Track Changes Script
#
# Tracks file changes for potential agent swarm analysis.
# Runs in background after Write/Edit tool use.
#
# Output: Suggests agent swarm if significant changes detected.

PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHANGES_FILE="$PLUGIN_ROOT/.changes.json"

# Initialize changes file if not exists
if [ ! -f "$CHANGES_FILE" ]; then
  echo '{"changes":[]}' > "$CHANGES_FILE"
fi

# Track change count (simple heuristic)
CHANGE_COUNT=$(node -e "
  const fs = require('fs');
  const path = '$CHANGES_FILE';
  try {
    const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
    console.log(data.changes.length);
  } catch {
    console.log(0);
  }
")

# Suggest agent swarm after 5+ changes
if [ "$CHANGE_COUNT" -ge 5 ]; then
  echo ""
  echo "🤖 Agent Swarm Suggestion"
  echo "─────────────────────────"
  echo "You've made $CHANGE_COUNT changes. Consider running:"
  echo "  /agent-swarm"
  echo ""
  echo "This will launch parallel agents to review all changes."
  echo ""
fi

exit 0
