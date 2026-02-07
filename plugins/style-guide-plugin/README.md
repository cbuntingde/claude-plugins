# Style Guide Plugin

A Claude Code plugin for accessing programming style guides and best practices with automatic fetching.

## Features

- **Language Detection**: Automatically detect language from file or code
- **Auto-fetch Latest**: Fetches official style guides from authoritative sources
- **72-Hour Cache**: Guidelines cached locally, auto-refreshes every 72 hours
- **15+ Languages**: TypeScript, JavaScript, Python, Go, Rust, Java, C/C++, C#, Ruby, PHP, Swift, Kotlin, Scala, Lua
- **Security Guidelines**: OWASP-aligned best practices with CWE references
- **Commands**: `/style-guide`, `/detect-language`, `/security-guidelines`

## Supported Languages

TypeScript, JavaScript, Python, Go, Rust, Java, C/C++, C#, Ruby, PHP, Swift, Kotlin, Scala, Lua

## Usage

### Get style guide for a language

```bash
/style-guide python
/style-guide typescript --section naming
/style-guide go --format json
```

### Detect programming language

```bash
/detect-language src/main.py
/detect-language --code "def hello(): pass"
```

### Security guidelines

```bash
/security-guidelines
/security-guidelines sql-injection
```

## Commands

- `/style-guide [language]` - Get style guide
- `/detect-language [filename|--code <text>]` - Detect language
- `/security-guidelines [vulnerability]` - Get security guidelines

## Installation

1. Navigate to the plugin directory:
   ```bash
   cd plugins/style-guide-plugin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The plugin is ready to use with the available commands.

## Configuration

No additional configuration is required. Style guides are automatically fetched from official sources and cached locally.

### Cache Settings

- Cache duration: 72 hours
- Cache location: `./cache/cache.db`
- To force refresh, delete the cache database

## Cache

Style guides are cached locally and refresh every 72 hours.