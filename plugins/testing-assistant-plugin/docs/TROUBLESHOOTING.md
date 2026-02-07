# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Testing Assistant plugin.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Command Issues](#command-issues)
- [Skill Invocation Issues](#skill-invocation-issues)
- [Hook Issues](#hook-issues)
- [Performance Issues](#performance-issues)
- [Generated Test Issues](#generated-test-issues)
- [Getting Help](#getting-help)

## Installation Issues

### Plugin Not Loading

**Symptoms**: Commands not available, skills not invoking

**Solutions**:

1. **Check plugin installation**:
   ```bash
   claude plugin list
   ```
   Look for `testing-assistant` in the output.

2. **Verify plugin.json syntax**:
   ```bash
   claude plugin validate testing-assistant
   ```

3. **Check file permissions**:
   - Ensure all files are readable
   - On Unix: `chmod -R +r testing-assistant/`

4. **Reinstall the plugin**:
   ```bash
   claude plugin uninstall testing-assistant
   claude plugin install ./testing-assistant
   ```

### Wrong Scope Installation

**Symptoms**: Plugin not available in specific project

**Solutions**:

1. **Check current scope**:
   ```bash
   claude plugin list --scope user
   claude plugin list --scope project
   claude plugin list --scope local
   ```

2. **Reinstall to correct scope**:
   ```bash
   # For project-specific installation
   claude plugin install ./testing-assistant --scope project

   # For local-only (gitignored) installation
   claude plugin install ./testing-assistant --scope local
   ```

## Command Issues

### Command Not Found

**Symptoms**: `/generate-tests` or other commands not recognized

**Solutions**:

1. **Verify plugin is loaded**:
   ```bash
   claude plugin list
   ```

2. **Check command files exist**:
   ```bash
   ls testing-assistant/commands/
   ```
   Should see: `generate-tests.md`, `find-edge-cases.md`, `improve-tests.md`

3. **Restart Claude Code** to reload plugins

4. **Check for typos**: Use exact command names with hyphens

### Command Produces No Output

**Symptoms**: Command executes but nothing happens

**Solutions**:

1. **Provide required arguments**:
   ```bash
   # Correct
   /generate-tests src/utils/Auth.js

   # Incorrect
   /generate-tests
   ```

2. **Check file path exists**:
   ```bash
   ls src/utils/Auth.js
   ```

3. **Provide more context**:
   ```bash
   /generate-tests src/utils/Auth.js
   Generate comprehensive tests for user authentication
   ```

## Skill Invocation Issues

### Skills Not Activating Automatically

**Symptoms**: Skills don't invoke when expected

**Solutions**:

1. **Check skill files exist**:
   ```bash
   ls testing-assistant/skills/
   ```
   Should see: `test-generator/`, `edge-case-finder/`, `test-improver/`

2. **Verify SKILL.md frontmatter**:
   Each skill directory must contain `SKILL.md` with proper frontmatter

3. **Use explicit commands**:
   ```bash
   /generate-tests file.js
   ```

4. **Be more specific in requests**:
   ```
   "Generate unit tests for the PaymentProcessor class"
   "Find edge cases in the validation logic"
   ```

### Inconsistent Skill Behavior

**Symptoms**: Skills produce different results for similar requests

**Solutions**:

1. **Provide more context**:
   - Specify programming language
   - Mention testing framework
   - Describe expected coverage level

2. **Use consistent terminology**:
   ```
   "Generate Jest tests for authentication"
   "Find security edge cases"
   ```

3. **Break down complex requests**:
   ```
   "First, analyze the code structure"
   "Then, generate tests for the main functions"
   ```

## Hook Issues

### Too Many Suggestions

**Symptoms**: Hooks fire constantly, causing annoyance

**Solutions**:

1. **Adjust settings in plugin.json**:
   ```json
   {
     "settings": {
       "maxSuggestionsPerSession": 3,
       "enableAutoSuggestions": true
     }
   }
   ```

2. **Disable specific hooks**:
   Edit `hooks/hooks.json` and remove unwanted hooks

3. **Use `.claude-ignore`**:
   Add patterns for files you don't want suggestions for

### No Suggestions Appearing

**Symptoms**: Hooks never fire

**Solutions**:

1. **Verify hooks.json syntax**:
   ```bash
   cat testing-assistant/hooks/hooks.json
   ```
   Should be valid JSON

2. **Check hooks are referenced in plugin.json**:
   ```json
   {
     "hooks": "./hooks/hooks.json"
   }
   ```

3. **Verify hooks configuration**:
   - Check `matcher` patterns are correct
   - Ensure `type` is valid (`prompt`, `command`, `agent`)

4. **Reload plugin**:
   ```bash
   claude plugin reload testing-assistant
   ```

### Suggestions Not Relevant

**Symptoms**: Hooks suggest tests for inappropriate files

**Solutions**:

1. **Improve decision framework in hooks.json**:
   Add more specific filtering logic in the prompt

2. **Add file type filters**:
   Modify the `matcher` pattern to exclude certain files

3. **Adjust `.claude-ignore`**:
   Add patterns for files to ignore

## Performance Issues

### Slow Test Generation

**Symptoms**: Commands take a long time to execute

**Solutions**:

1. **Reduce scope**:
   ```bash
   # Instead of entire directory
   /generate-tests src/

   # Focus on specific file
   /generate-tests src/services/Auth.js
   ```

2. **Simplify requirements**:
   ```
   "Generate basic unit tests" instead of
   "Generate comprehensive tests with 100% coverage"
   ```

3. **Check file size**:
   Very large files may take longer. Consider splitting.

### High Memory Usage

**Symptoms**: System slows down when plugin is active

**Solutions**:

1. **Reduce suggestion frequency** in settings
2. **Disable automated hooks** if not needed
3. **Limit concurrent operations**

## Generated Test Issues

### Tests Don't Compile

**Symptoms**: Generated code has syntax errors

**Solutions**:

1. **Specify the correct language**:
   ```bash
   /generate-tests Auth.py --framework=pytest
   ```

2. **Check the source code**:
   - Ensure source code is valid
   - Fix any syntax errors in source

3. **Review imports**:
   Generated tests may need import path adjustments

4. **Run language validator**:
   ```bash
   # Python
   python -m py_compile tests/test_auth.py

   # JavaScript
   npx eslint tests/auth.test.js
   ```

### Tests Fail When Run

**Symptoms**: Generated tests don't pass

**Solutions**:

1. **Review test assertions**:
   - Adjust expected values based on actual behavior
   - Update mock data to match real data structures

2. **Check external dependencies**:
   - Verify mocks are correct
   - Ensure test environment is configured

3. **Run tests in verbose mode**:
   ```bash
   # Jest
   npm test -- --verbose

   # pytest
   pytest -v tests/
   ```

4. **Compare with working tests**:
   Use existing tests as a reference

### Insufficient Coverage

**Symptoms**: Generated tests miss important scenarios

**Solutions**:

1. **Request higher coverage**:
   ```bash
   /generate-tests Auth.js --coverage=95
   ```

2. **Use edge case finder**:
   ```bash
   /edge-cases Auth.js
   ```

3. **Manually add missing tests**:
   - Focus on business logic
   - Test error conditions
   - Cover integration points

4. **Iterate on test generation**:
   ```
   "Generate tests for error handling"
   "Add tests for edge cases"
   ```

## Framework-Specific Issues

### Jest/JavaScript

**Common issues**:
- Import path resolution: Use relative imports
- Async tests: Ensure `async/await` is used correctly
- Mocking: Check jest.mock() syntax

### pytest/Python

**Common issues**:
- Import errors: Ensure `PYTHONPATH` includes project root
- Fixture issues: Check conftest.py configuration
- Async tests: Use pytest-asyncio for async functions

### JUnit/Java

**Common issues**:
- Package structure: Mirror source package structure
- Annotations: Ensure @Test, @Before, etc. are imported
- Classpath: Verify dependencies are available

## Debug Mode

Enable debug mode to see detailed information:

```bash
claude --debug
```

Look for:
- Plugin loading messages
- Hook execution logs
- Skill invocation details
- Error messages and stack traces

## Getting Help

If you can't resolve your issue:

### 1. Check Documentation
- README.md: Overview and quick start
- This file: Troubleshooting guide
- CONTRIBUTING.md: Development guidelines

### 2. Search Issues
```bash
# Check if your issue has been reported
https://github.com/claude-code-plugins/testing-assistant/issues
```

### 3. Create a Bug Report

Include:
- Claude Code version
- Plugin version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages or logs
- Screenshots (if applicable)

### 4. Ask for Help

- GitHub Discussions: For questions and ideas
- GitHub Issues: For bugs and problems

## Common Error Messages

### "Plugin not found"
**Cause**: Plugin not installed or wrong scope
**Fix**: Check installation scope and reinstall

### "Invalid plugin manifest"
**Cause**: Malformed plugin.json
**Fix**: Validate JSON syntax

### "Command not recognized"
**Cause**: Plugin not loaded or command doesn't exist
**Fix**: Verify installation and restart Claude Code

### "Skill failed to execute"
**Cause**: Error in skill logic or missing dependencies
**Fix**: Check debug output and verify environment

## Prevention

### Best Practices

1. **Keep plugin updated**:
   ```bash
   claude plugin update testing-assistant
   ```

2. **Validate before committing**:
   ```bash
   claude plugin validate testing-assistant
   ```

3. **Test in safe environment first**:
   Use `--scope local` for testing

4. **Read changelog** before updating:
   Check for breaking changes

5. **Report issues promptly**:
   Help improve the plugin for everyone
