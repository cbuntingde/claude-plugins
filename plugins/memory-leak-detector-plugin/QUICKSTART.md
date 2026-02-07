# Quick Start Guide

Get started with the Memory Leak Detector plugin in 3 steps!

## Step 1: Install Dependencies

```bash
cd memory-leak-detector-plugin
npm install
```

## Step 2: Configure Claude Code

Copy the example configuration to your Claude Code config directory:

**On Linux/macOS:**
```bash
mkdir -p ~/.claude-code
cat claude-code-config.example.json >> ~/.claude-code/config.json
```

**On Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude-code"
Get-Content claude-code-config.example.json | Add-Content "$env:USERPROFILE\.claude-code\config.json"
```

**Important:** Update the path in the config to match your actual installation directory.

## Step 3: Restart Claude Code and Start Detecting!

Close and restart Claude Code, then try these commands:

### Try It Out

**1. Scan a single file:**
```
Use detect_memory_leaks on path/to/your/file.js
```

**2. Scan a directory:**
```
Use detect_memory_leaks on path/to/your/src/directory
```

**3. Get fix suggestions:**
```
Get memory suggestions for "Event Listener Not Removed" in JavaScript
```

**4. Analyze code snippet:**
```
Analyze this code for memory leaks:

setInterval(() => {
  fetchData();
}, 1000);
```

## Example Session

```
You: Use detect_memory_leaks on src/dataManager.js

Claude: Scanning src/dataManager.js for memory leaks...

Found 2 potential memory leaks:

1. ⚠️ HIGH SEVERITY - Line 15
   Pattern: Uncleared Intervals/Timeouts
   The setInterval on line 15 is never cleared with clearInterval.

   Suggestion: Store the timer ID and clear it when no longer needed:

   ❌ Bad:
   setInterval(() => { updateData(); }, 1000);

   ✅ Good:
   const timerId = setInterval(() => { updateData(); }, 1000);
   // Later:
   clearInterval(timerId);

2. ⚠️ MEDIUM SEVERITY - Line 42
   Pattern: Event Listener Not Removed
   Event listener added without corresponding removeEventListener.

   Suggestion: Always remove event listeners when they're no longer needed

Would you like me to help fix these issues?
```

## Common Issues

**Issue:** Plugin not loading
- **Fix:** Make sure Node.js 18+ is installed: `node --version`
- **Fix:** Verify the path in your config file is correct

**Issue:** No issues found
- **Note:** The plugin detects common patterns. Use profiling tools for deeper analysis

**Issue:** Too many false positives
- **Tip:** Use the severity parameter to focus on high-severity issues: `only showing high severity issues`

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DETECTION_PATTERNS.md](DETECTION_PATTERNS.md) for all detected patterns
- Integrate into your CI/CD pipeline for automated detection

Happy hunting! 🕵️‍♂️
