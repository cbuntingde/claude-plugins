# Quick Start Guide

Get started with the Environment Variable Detection plugin in 3 simple steps.

## Step 1: Install the Plugin

```bash
cd env-var-detect
claude plugin install . --scope project
```

## Step 2: Test It Out

Run the manual command:

```
/check-env
```

## Step 3: That's It! 🎉

The plugin will now automatically detect missing environment variables whenever you:
- Write new files
- Edit existing files

## What It Does

- ✅ Scans your code for environment variable usage
- ✅ Checks if they're defined in `.env` files
- ✅ Reports missing variables with file locations
- ✅ Suggests additions to your `.env` file

## Example

Create a file `test.js`:

```javascript
const apiKey = process.env.API_KEY;
const dbHost = process.env.DB_HOST;
```

The plugin will automatically detect that `API_KEY` and `DB_HOST` are missing!

## Next Steps

- Read the full [README.md](README.md) for detailed usage
- Check [.env.example](.env.example) for a template
- See [INSTALL.md](INSTALL.md) for troubleshooting

## Pro Tips

1. **Keep `.env.example` Updated**: Document all required variables for your team
2. **Run Before Deploying**: Use `/check-env` before production releases
3. **Review Regularly**: Check for new missing variables during development

---

Need help? Check the [README](README.md) or [open an issue](https://github.com/chris-dev/env-var-detect/issues).
