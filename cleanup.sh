#!/bin/bash

# Cleanup Script for QUAI Superapp Monorepo
# This script removes redundant, duplicate, and legacy files
# 
# Usage:
#   ./cleanup.sh           # Show what would be removed (dry run)
#   ./cleanup.sh --execute # Actually remove the files

set -e

DRY_RUN=true
if [ "$1" = "--execute" ]; then
    DRY_RUN=false
    echo "🔥 EXECUTING CLEANUP - Files will be permanently removed!"
    echo ""
else
    echo "🔍 DRY RUN MODE - Showing what would be removed"
    echo "Run './cleanup.sh --execute' to actually remove files"
    echo ""
fi

# Function to remove file or directory
remove_item() {
    local item=$1
    if [ -e "$item" ]; then
        if $DRY_RUN; then
            echo "  Would remove: $item"
        else
            rm -rf "$item"
            echo "  ✓ Removed: $item"
        fi
    else
        echo "  ⊘ Not found: $item (skipping)"
    fi
}

echo "=================================================="
echo "1. Removing Redundant Documentation Files"
echo "=================================================="
remove_item "DEPLOYMENT_FIX_COMPLETE.md"
remove_item "DEPLOYMENT_FIXED.md"
remove_item "DEPLOYMENT_STATUS.md"
remove_item "DEPLOYMENT_SUMMARY.md"
remove_item "BRIDGE_FIX_SUMMARY.md"
remove_item "MAINNET_DEPLOYMENT_ANALYSIS.md"
echo ""

echo "=================================================="
echo "2. Removing Duplicate ESLint Config"
echo "=================================================="
remove_item "eslint.config.js"
echo "   (Keeping eslint.config.mjs)"
echo ""

echo "=================================================="
echo "3. Removing Backup Files"
echo "=================================================="
remove_item "apps/api/prisma/schema.prisma.backup"
remove_item "packages/contracts/prisma/schema.prisma.backup"
echo ""

echo "=================================================="
echo "4. Removing Legacy Files"
echo "=================================================="
remove_item "apps/web/app/social/page.legacy.tsx"
echo ""

echo "=================================================="
echo "5. Cleaning Up ENV Files in Contracts"
echo "=================================================="
remove_item "packages/contracts/ENV_EXAMPLE"
remove_item "packages/contracts/ENV_EXAMPLE_NEW"
remove_item "packages/contracts/ENV_MAINNET"
echo "   (Make sure you have a clear .env.example file)"
echo ""

echo "=================================================="
echo "6. Removing Redundant Deploy Scripts"
echo "=================================================="
echo "   (Keeping: deployHelloQuai.js, deploy-mainnet.ts, deploy-hardhat-testnet.ts)"
cd packages/contracts/scripts/ 2>/dev/null || cd ../../packages/contracts/scripts/ 2>/dev/null || {
    echo "   ⚠️  Could not find packages/contracts/scripts/ directory"
    cd "$OLDPWD"
}

if [ -d "$OLDPWD/packages/contracts/scripts" ] || [ -d "packages/contracts/scripts" ]; then
    remove_item "packages/contracts/scripts/deploy_hello_quais.js"
    remove_item "packages/contracts/scripts/deploy_hello.ts"
    remove_item "packages/contracts/scripts/deploy_quais.js"
    remove_item "packages/contracts/scripts/deploy_quais.ts"
    remove_item "packages/contracts/scripts/deploy_raw_tx.ts"
    remove_item "packages/contracts/scripts/deploy_raw.ts"
    remove_item "packages/contracts/scripts/deploy-now.js"
    remove_item "packages/contracts/scripts/deploy-simple.js"
    remove_item "packages/contracts/scripts/deploy-lock.ts"
    remove_item "packages/contracts/scripts/deploy-messenger.ts"
    remove_item "packages/contracts/scripts/deploy.ts"
fi
cd "$OLDPWD" 2>/dev/null || cd ../../../
echo ""

echo "=================================================="
echo "7. Removing Deployment Output File"
echo "=================================================="
remove_item "packages/contracts/deployment-output.txt"
echo ""

echo "=================================================="
echo "8. Optional: Archive Old Research/Planning Docs"
echo "=================================================="
echo "   These files might have historical value:"
echo "   - design.md"
echo "   - research-quai-tech-stack.md"
echo ""
echo "   Consider moving them to docs/archive/ instead of deleting"
if ! $DRY_RUN; then
    read -p "   Move these to docs/archive/? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p docs/archive
        [ -f "design.md" ] && mv design.md docs/archive/ && echo "  ✓ Moved design.md to docs/archive/"
        [ -f "research-quai-tech-stack.md" ] && mv research-quai-tech-stack.md docs/archive/ && echo "  ✓ Moved research-quai-tech-stack.md to docs/archive/"
    else
        echo "   Skipped archiving"
    fi
fi
echo ""

echo "=================================================="
echo "Cleanup Summary"
echo "=================================================="
if $DRY_RUN; then
    echo ""
    echo "✨ This was a DRY RUN - no files were actually removed"
    echo ""
    echo "To execute the cleanup, run:"
    echo "  ./cleanup.sh --execute"
    echo ""
    echo "⚠️  IMPORTANT: Review the list above carefully before executing!"
    echo "   Consider committing your current state first:"
    echo "   git add -A && git commit -m \"Pre-cleanup snapshot\""
else
    echo ""
    echo "✅ Cleanup completed!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Review the changes: git status"
    echo "2. Test your build: pnpm install && pnpm build"
    echo "3. Commit the cleanup: git add -A && git commit -m \"chore: cleanup redundant files\""
fi
echo ""

