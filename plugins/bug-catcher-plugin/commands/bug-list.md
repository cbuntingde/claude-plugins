---
name: bug-list
description: Display captured tool errors in a formatted table
---

# Bug List

Lists all tool failures that have been automatically captured during this session.

## Usage

```
/bug-list
```

## Description

The bug catcher plugin automatically captures tool execution failures using the `PostToolUseFailure` hook. This command displays the captured errors in a formatted table showing:

- **#**: Bug index number
- **Timestamp**: When the error occurred
- **Tool**: The tool that failed
- **Error Message**: Description of the failure

## Examples

```
/bug-list
```

Output will show a table like:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                           CAPTURED BUGS                                  ║
╠══════════════════════════════════════════════════════════════════════════╣
║  #   │ Timestamp           │ Tool      │ Error Message                  ║
╠══════╪═════════════════════╪═══════════╪════════════════════════════════╣
║  1   │ 2025-01-18 10:30:15 │ Read      │ File not found: missing.txt    ║
║  2   │ 2025-01-18 10:32:42 │ Bash      │ Command failed: npm run build  ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/bug-clear` - Clear the captured bugs log