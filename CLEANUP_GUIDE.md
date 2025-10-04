# 🧹 Cleanup Guide for QUAI Superapp Monorepo

## What This Cleanup Addresses

This cleanup removes **redundant, duplicate, and legacy files** that clutter your monorepo while following industry best practices for Turborepo + pnpm + Hardhat projects.

## Files to Be Removed

### ✅ Safe to Remove:

1. **Redundant Documentation** (6 files)
   - Multiple deployment status/summary files that duplicate information
   - Keep: `DEPLOYMENT_CHECKLIST.md` and `docs/MAINNET_DEPLOYMENT.md`

2. **Duplicate ESLint Config** (1 file)
   - `eslint.config.js` (keeping `.mjs` version)

3. **Backup Files** (1 file)
   - `apps/api/prisma/schema.prisma.backup`
   - These should be in version control history

4. **Legacy Files** (1 file)
   - `apps/web/app/social/page.legacy.tsx`

5. **Environment File Variations** (3 files)
   - Multiple ENV example files in contracts package
   - Consolidate into one clear `.env.example`

6. **Deployment Artifacts** (1 file)
   - `packages/contracts/deployment-output.txt`
   - Should be gitignored, not committed

### 📦 Optional to Archive:

- `design.md` - Initial design document
- `research-quai-tech-stack.md` - Research notes

These can be moved to `docs/archive/` for historical reference.

## How to Execute the Cleanup

### Step 1: Create a Safety Snapshot

```bash
# Save your current state
git add -A
git commit -m "Pre-cleanup snapshot"
```

### Step 2: Review the Dry Run

```bash
# See what would be removed (already done above)
./cleanup.sh
```

### Step 3: Execute the Cleanup

```bash
# Actually remove the files
./cleanup.sh --execute
```

The script will:
- Remove all redundant files
- Ask if you want to archive research docs
- Show a summary of changes

### Step 4: Verify Everything Still Works

```bash
# Install dependencies
pnpm install

# Run build to ensure nothing broke
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Step 5: Update .gitignore

```bash
# Review recommended additions
cat RECOMMENDED_GITIGNORE_ADDITIONS.md

# Edit your .gitignore
# Add the recommended entries to prevent future clutter
```

### Step 6: Commit the Cleanup

```bash
# Check what changed
git status

# Stage all changes
git add -A

# Commit with a descriptive message
git commit -m "chore: cleanup redundant files and improve project structure

- Remove duplicate documentation files
- Remove backup and legacy files
- Consolidate ENV examples
- Remove deployment artifacts
- Update .gitignore to prevent future clutter

Ref: CLEANUP_GUIDE.md"
```

## What's Being Kept

### ✅ Important Files Preserved:

**Deployment:**
- `packages/contracts/scripts/deployHelloQuai.js` ← **Your main test file**
- `packages/contracts/scripts/deploy-mainnet.ts`
- `packages/contracts/scripts/deploy-hardhat-testnet.ts`

**Documentation:**
- `README.md` - Main entry point
- `prd.md` - Product requirements
- `BUILD_RULES.md` - Development guidelines
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `docs/MAINNET_DEPLOYMENT.md` - Mainnet documentation

**Configuration:**
- `eslint.config.mjs` - ESLint configuration
- `turbo.json` - Turborepo configuration
- `pnpm-workspace.yaml` - Workspace configuration
- All `package.json` files

## Best Practices Implemented

### ✅ Monorepo Structure
- Clean separation of apps and packages
- Proper workspace configuration
- Efficient dependency management

### ✅ Smart Contract Development
- Hardhat configuration for Quai Network
- Comprehensive test structure
- Proper deployment scripts

### ✅ Version Control
- Gitignore for build artifacts
- No backup files in repo
- Clean documentation structure

## Next Steps After Cleanup

1. **Review Deployment Scripts**
   - Ensure `deployHelloQuai.js` has all the logic you need
   - Consider consolidating deployment logic if needed

2. **Update Documentation**
   - Update README if needed
   - Ensure DEPLOYMENT_CHECKLIST is current

3. **Test Thoroughly**
   - Run full test suite
   - Test contract deployment on testnet
   - Verify all build processes work

4. **Consider Adding**
   - Shared TypeScript config (`packages/tsconfig`)
   - Husky for git hooks
   - Conventional commits
   - Automated changelog generation

## Troubleshooting

### If something breaks after cleanup:

```bash
# Revert to pre-cleanup state
git reset --hard HEAD~1

# Or restore specific files
git checkout HEAD~1 -- path/to/file
```

### If you need a removed file:

```bash
# View file from previous commit
git show HEAD~1:path/to/file

# Restore it
git checkout HEAD~1 -- path/to/file
```

## Questions or Issues?

If you encounter any issues or have questions about the cleanup:

1. Check the dry-run output above
2. Review this guide
3. Check your git history for removed content
4. Verify your build and tests still pass

## Summary

**Total files to remove:** ~13 files
**Estimated disk space saved:** Minimal, but significant clutter reduction
**Risk level:** ✅ **Low** - All removed files are redundant or generated
**Time to execute:** < 1 minute
**Benefits:** Cleaner repo, better navigation, follows best practices

---

**Ready to clean up?** Run `./cleanup.sh --execute` when you're ready! 🚀

