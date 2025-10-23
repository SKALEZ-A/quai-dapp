# QNS Diagnostic Scripts

This directory contains diagnostic and troubleshooting scripts for the QNS (Quai Name Service) system.

## Available Scripts

### 1. Comprehensive Diagnostics Runner
**File:** `run-all-diagnostics.js`

Runs all diagnostic scripts and generates a comprehensive report.

```bash
cd packages/contracts
node scripts/run-all-diagnostics.js
```

**What it does:**
- Validates all contract deployments
- Checks contract permissions
- Verifies frontend configuration
- Generates action plan for any issues found

**Output:**
- Console output with detailed results
- `diagnostic-report.json` - Comprehensive report

---

### 2. Contract Validation
**File:** `validate-deployment.js`

Validates that all contracts are properly deployed and accessible.

```bash
cd packages/contracts
node scripts/validate-deployment.js
```

**What it checks:**
- Contract deployment status
- Contract accessibility
- Contract references (registrar → NFT, registry, reserved names)
- Basic function calls (getPrice, available)

**Output:**
- Console output with validation results
- `validation-results.json` - Detailed validation data

---

### 3. Permission Checker and Fixer
**File:** `check-and-fix-permissions.js`

Checks and optionally fixes contract role permissions.

```bash
cd packages/contracts
node scripts/check-and-fix-permissions.js
```

**What it checks:**
- Registrar has MINTER_ROLE on NFT contract
- Registrar has ADMIN_ROLE on Registry contract
- Signer has necessary admin roles

**Interactive:**
- Prompts to fix issues if found
- Grants missing roles automatically

**Output:**
- Console output with permission status
- `permission-check-results.json` - Permission audit log

**Requirements:**
- `PRIVATE_KEY` or `CYPRUS1_PK` environment variable
- Signer must have DEFAULT_ADMIN_ROLE on contracts

---

### 4. Frontend Configuration Verification
**File:** `verify-frontend-config.js`

Compares deployed contract addresses with frontend configuration.

```bash
cd packages/contracts
node scripts/verify-frontend-config.js
```

**What it checks:**
- Contract addresses in `deployed-addresses-simple.json`
- Contract addresses in `apps/web/src/lib/contracts.ts`
- Contract addresses in `apps/web/.env`

**Output:**
- Console output with comparison results
- `frontend-config-verification.json` - Detailed comparison
- `update-env-addresses.sh` - Auto-generated update script (if mismatches found)

**Auto-fix:**
If mismatches are found, run the generated script:
```bash
cd packages/contracts
./update-env-addresses.sh
```

---

## Common Issues and Solutions

### Issue: "Contract interaction failed"

**Diagnosis:**
```bash
node scripts/run-all-diagnostics.js
```

**Common causes:**
1. **Missing permissions** - Registrar doesn't have MINTER_ROLE or ADMIN_ROLE
   - Fix: Run `node scripts/check-and-fix-permissions.js` and follow prompts

2. **Wrong contract addresses** - Frontend using old/incorrect addresses
   - Fix: Run `node scripts/verify-frontend-config.js` and update addresses

3. **Contract not deployed** - Contract address points to non-existent contract
   - Fix: Redeploy contracts or update addresses

### Issue: "Registrar missing MINTER_ROLE"

**Fix:**
```bash
node scripts/check-and-fix-permissions.js
# Answer 'y' when prompted to fix
```

### Issue: "Frontend address mismatch"

**Fix:**
```bash
node scripts/verify-frontend-config.js
./update-env-addresses.sh  # If script is generated
# Restart dev server
```

---

## Environment Variables

All scripts require:
- `PRIVATE_KEY` or `CYPRUS1_PK` - Private key for signing transactions

Set in `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
```

Or in `packages/contracts/.env`:
```bash
CYPRUS1_PK=your_private_key_here
```

---

## Workflow

### Initial Setup / After Deployment
1. Run comprehensive diagnostics:
   ```bash
   node scripts/run-all-diagnostics.js
   ```

2. Fix any issues found:
   ```bash
   # If permission issues
   node scripts/check-and-fix-permissions.js
   
   # If config issues
   node scripts/verify-frontend-config.js
   ./update-env-addresses.sh
   ```

3. Restart development server:
   ```bash
   pnpm dev
   ```

4. Verify fixes:
   ```bash
   node scripts/run-all-diagnostics.js
   ```

### Troubleshooting Registration Issues
1. Check permissions:
   ```bash
   node scripts/check-and-fix-permissions.js
   ```

2. Validate deployment:
   ```bash
   node scripts/validate-deployment.js
   ```

3. Check frontend config:
   ```bash
   node scripts/verify-frontend-config.js
   ```

---

## Output Files

All scripts generate JSON output files for programmatic access:

- `diagnostic-report.json` - Comprehensive diagnostic results
- `validation-results.json` - Contract validation details
- `permission-check-results.json` - Permission audit log
- `frontend-config-verification.json` - Configuration comparison

These files are useful for:
- CI/CD integration
- Automated monitoring
- Historical tracking
- Debugging

---

## Notes

- All scripts are safe to run multiple times
- Scripts are read-only except `check-and-fix-permissions.js` (which prompts before making changes)
- Scripts connect to Orchard testnet by default
- No gas fees for read-only operations
- Permission fixes require gas (small amount)

---

## Support

If you encounter issues:
1. Check the output JSON files for detailed error information
2. Verify your private key has sufficient balance
3. Ensure you're connected to the correct network
4. Check that your signer has admin roles on the contracts
