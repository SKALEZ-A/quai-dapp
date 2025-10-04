# Recommended .gitignore Additions

These entries should be added to your `.gitignore` file to prevent build artifacts, temporary files, and deployment outputs from being committed.

## Add to Root `.gitignore`:

```gitignore
# Deployment output files
deployment-output.txt
**/deployment-output.txt

# Backup files
*.backup
**/*.backup

# Temporary documentation files
DEPLOYMENT_FIX_*.md
DEPLOYMENT_FIXED.md
DEPLOYMENT_STATUS.md
*_SUMMARY.md

# Legacy files
*.legacy.*

# Environment file variations (keep only .env.example)
ENV_EXAMPLE
ENV_EXAMPLE_*
ENV_MAINNET
ENV_TESTNET
.env.local
.env.*.local

# Hardhat artifacts (if not already covered)
artifacts/
cache/
typechain-types/
coverage/
coverage.json

# Testing
.nyc_output
test-results/
junit.xml

# Build directories
dist/
build/
out/
.next/
.turbo/

# IDE
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Lock files (optional - some teams commit these)
# Uncomment if your team doesn't commit lock files:
# package-lock.json
# yarn.lock
```

## Current .gitignore Status:

✅ Already properly ignoring:
- `node_modules/`
- `.env` files
- Basic build outputs

⚠️ Consider adding the above entries to prevent future clutter.

## Next Steps:

1. Review your current `.gitignore` file
2. Add relevant entries from above
3. Run `git status` to see if any currently-tracked files should be removed
4. Use `git rm --cached <file>` to untrack files without deleting them
5. Commit the updated `.gitignore`

## Example Commands:

```bash
# After updating .gitignore, remove tracked files that should be ignored:
git rm --cached deployment-output.txt
git rm --cached *.backup

# Then commit:
git add .gitignore
git commit -m "chore: update .gitignore to prevent artifact commits"
```

