# ARIA Improver Plugin

A Claude Code plugin that automatically suggests ARIA labels and semantic HTML improvements for better accessibility and SEO.

## Features

- **Semantic HTML Recommendations**: Automatically suggests proper semantic elements over non-semantic `<div>` soup
- **ARIA Label Suggestions**: Provides appropriate ARIA labels, roles, and attributes
- **Form Accessibility**: Ensures all form inputs have proper labels and error handling
- **Landmark Identification**: Adds proper ARIA landmarks for screen reader navigation
- **Interactive Element Enhancement**: Improves buttons, links, and custom components
- **Screen Reader Optimization**: Optimizes content for better screen reader experience
- **WCAG Compliance**: Helps meet Web Content Accessibility Guidelines

## How It Works

This plugin provides an **Agent Skill** that Claude autonomously invokes when:

- Writing or modifying HTML components
- Creating forms, navigation, or interactive elements
- Reviewing code for accessibility issues
- Working with dynamic content or single-page applications
- Optimizing for SEO

## Installation

### Method 1: User Installation (Recommended for Personal Use)

```bash
claude plugin install ./aria-improver
```

### Method 2: Project Installation (Team Sharing)

```bash
claude plugin install ./aria-improver --scope project
```

This will add the plugin to `.claude/settings.json` which can be committed to version control.

## Usage

Once installed, the skill activates automatically. Claude will suggest improvements when working with HTML:

```
You: Help me create a navigation bar
Claude: [Analyzes HTML and automatically suggests semantic <nav> with ARIA labels]
```

### Manual Invocation

You can also explicitly invoke the skill:

```
You: /aria-accessibility Review my HTML for accessibility
```

## Example Improvements

### Before
```html
<div class="header">
  <div class="nav">
    <a href="/">Home</a>
    <a href="/about">About</a>
  </div>
</div>
```

### After
```html
<header role="banner">
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
```

## Plugin Structure

```
aria-improver/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── skills/
│   └── aria-accessibility/
│       └── SKILL.md         # Skill definition
└── README.md                # This file
```

## Configuration

The plugin uses the following configuration in `plugin.json`:

```json
{
  "name": "aria-improver",
  "version": "1.0.0",
  "description": "Suggests ARIA labels and semantic HTML improvements",
  "keywords": ["accessibility", "aria", "semantic-html", "a11y", "seo"],
  "skills": "./skills/"
}
```

## Development

To extend or modify this plugin:

1. Edit `skills/aria-accessibility/SKILL.md` to add new patterns
2. Update `plugin.json` for version changes
3. Test with: `claude --debug` to see skill loading

## Contributing

Contributions welcome! Areas for enhancement:

- Additional ARIA patterns
- Framework-specific suggestions (React, Vue, etc.)
- Automated testing integration
- Accessibility audit reports

## License

MIT

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Semantic HTML Guide](https://developer.mozilla.org/en-US/docs/Glossary/Semantic_HTML)

---

**Plugin Author**: cbuntingde
**Version**: 1.0.0
**Homepage**: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/aria-improver
