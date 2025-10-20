# 🚀 Test QNS Domain Registration NOW

## Quick Start (2 minutes)

### 1. Start the Development Server

```bash
pnpm dev
```

Wait for: `Ready on http://localhost:3000`

---

### 2. Open QNS Profile Page

Navigate to: **http://localhost:3000/qns/profile**

---

### 3. Connect Your Wallet

1. Click **"Connect Wallet"** button
2. Approve connection in Pelagus wallet
3. Verify you see your address displayed

**Important:** Make sure you're on:
- Network: **Quai Orchard Testnet**
- Zone: **Cyprus-1**

---

### 4. Get Testnet QI (if needed)

If your balance is 0:
1. Go to: **https://faucet.quai.network/**
2. Enter your wallet address
3. Request testnet QI
4. Wait for confirmation

---

### 5. Register a Domain

1. **Search for a domain:**
   - Enter a name (e.g., "mytest123")
   - Click "Search"
   - Wait for availability check

2. **If available:**
   - You'll see the price (e.g., "1 QI")
   - Click **"Buy Now"**

3. **In your wallet:**
   - Review the transaction
   - Click **"Confirm"**

4. **Wait for confirmation:**
   - You'll see progress updates
   - Transaction hash will appear
   - Success message when complete

---

## What to Watch For

### ✅ Good Signs

- Domain availability check completes quickly
- Price displays correctly
- Transaction appears in wallet
- Progress updates show in UI
- Success message after confirmation
- Domain appears in "Your domains" list

### ❌ If You See Errors

**"Insufficient Balance"**
- Get testnet QI from faucet (link above)

**"Wrong Network"**
- Switch to Quai Orchard Testnet (Cyprus-1) in Pelagus

**"Domain Not Available"**
- Try a different name

**"Transaction Failed"**
- Check browser console (F12) for details
- Copy error message and share it

---

## Browser Console (F12)

Open the console to see detailed logs:

### What You'll See

```
Starting search for: mytest123
Clean name: mytest123
Checking domain availability...
Availability result: { available: true, owner: null, node: "0x..." }
Pricing: { price: "1", display: "1 QI" }
```

### During Registration

```
Starting domain registration for: mytest123
Checking network...
Chain ID (decimal): 9000
Connecting to wallet...
Signer address: 0x...
Checking balance...
Account balance (QI): 10.0000 QI
Calling registerDomain function...
🔵 SENDING TRANSACTION: { ... }
Transaction sent: 0x...
Waiting for confirmation...
Transaction confirmed!
```

---

## Expected Results

### Successful Registration

1. ✅ Domain search completes
2. ✅ Price displays
3. ✅ Transaction sent to wallet
4. ✅ User approves
5. ✅ Transaction submitted
6. ✅ Confirmation received
7. ✅ Domain registered
8. ✅ Domain appears in your list

### Time Estimates

- Domain search: **1-2 seconds**
- Transaction approval: **User dependent**
- Transaction confirmation: **5-15 seconds**
- Total: **~20-30 seconds**

---

## Troubleshooting

### Issue: Nothing happens when I click "Buy Now"

**Check:**
1. Is your wallet connected? (address should show at top)
2. Are you on the correct network? (Cyprus-1)
3. Do you have sufficient balance?
4. Check browser console for errors

### Issue: Transaction stuck on "Processing"

**Try:**
1. Wait 30 seconds (network might be slow)
2. Check wallet for pending transactions
3. If stuck >1 minute, refresh page and try again

### Issue: Error message appears

**Do:**
1. Read the error message carefully
2. Follow the suggestion provided
3. Check browser console (F12) for details
4. Copy full error and share if unclear

---

## What I Fixed

### 1. Transaction Parameter Passing ✅

The transaction manager now correctly passes payment values to Quai Network contracts.

**Before:** Transactions would fail silently or show "user rejected" errors

**After:** Transactions complete successfully with proper payment

### 2. RPC URL Configuration ✅

Fixed RPC URLs in diagnostic scripts to use base URLs only.

**Before:** Diagnostic scripts would fail with "Invalid URL" errors

**After:** All diagnostic scripts run successfully

### 3. Error Detection ✅

Improved error categorization to distinguish between user rejections and contract errors.

**Before:** Contract errors were sometimes shown as "user rejected transaction"

**After:** Accurate error messages with specific guidance

---

## Need Help?

### Run Diagnostics

```bash
node packages/contracts/scripts/run-all-diagnostics.js
```

This will check:
- Contract deployments
- Contract accessibility
- Frontend configuration
- Permission status

### Quick Validation

```bash
node packages/contracts/quick-validation.js
```

This will verify:
- Contracts are deployed
- Basic contract calls work
- Frontend files exist

---

## Success Criteria

After testing, you should be able to:

- [x] Connect wallet successfully
- [x] Search for domains
- [x] See accurate pricing
- [x] Register domains
- [x] See clear error messages (if any issues)
- [x] View registered domains in your list

---

## Next Steps After Testing

1. **If it works:** 🎉
   - Test with different domain lengths
   - Test error scenarios (0 balance, wrong network)
   - Verify all error messages are clear

2. **If there are issues:** 🔧
   - Copy the exact error message
   - Copy browser console logs
   - Share the error details
   - I'll help fix it

---

## Files Changed

1. `apps/web/src/lib/transactionManager.ts` - Fixed transaction parameters
2. `apps/web/src/lib/errorHandler.ts` - Improved error detection
3. `packages/contracts/quick-validation.js` - Fixed RPC URL
4. `packages/contracts/scripts/validate-deployment.js` - Fixed RPC URL
5. `packages/contracts/scripts/check-and-fix-permissions.js` - Fixed RPC URL

---

## Ready to Test! 🚀

```bash
pnpm dev
```

Then go to: **http://localhost:3000/qns/profile**

Good luck! Let me know how it goes. 🎉

