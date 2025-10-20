# QNS Transaction Wallet Rejection Fix

## Problem
Users were experiencing "quais-user-denied: The user rejected the request" error (code 4001) when attempting to register domains, even though they weren't explicitly rejecting the transaction in their wallet.

## Root Cause Analysis
The error was caused by several issues in how transactions were being formatted and sent to the Pelagus wallet:

1. **Gas Limit Format**: Quai Network expects gas limits as Numbers, not BigInts
2. **Insufficient Wallet Validation**: Not checking if wallet was properly unlocked before sending transactions
3. **Missing Signer Verification**: Not verifying the signer was properly connected to the provider
4. **Gas Estimation**: Using too high gas limits (1M) which might trigger wallet rejection

## Changes Made

### 1. Transaction Manager (`apps/web/src/lib/transactionManager.ts`)

#### Gas Limit Formatting
- **Before**: Passed `gasLimit` as BigInt
- **After**: Convert to Number for Quai compatibility: `gasLimit: Number(txOptions.gasLimit)`

#### Gas Estimation Improvements
- Increased multiplier from 1.2x to 1.5x for better Quai Network compatibility
- Reduced fallback gas limits:
  - `register`: 1,000,000 → 500,000
  - `default`: 800,000 → 400,000
- These lower limits are more reasonable and less likely to be rejected by the wallet

#### Enhanced Logging
- Added detailed logging of transaction parameters before sending
- Log signer address, gas limit type, value type
- Log transaction object after creation
- Verify contract has proper signer before attempting transaction

#### Signer Verification
- Check that `contract.runner` exists and has `sendTransaction` method
- Throw clear error if signer is not properly configured

### 2. QNS Library (`apps/web/src/lib/qns.ts`)

#### Contract Runner Verification
- Added check to ensure `registrarContract.runner` is not null
- Return clear error message if contract not connected to signer

#### Enhanced Debugging
- Added detailed logging before calling `transactionManager.executeTransaction`
- Log all parameters being passed to the transaction manager

#### Gas Limit Multiplier
- Explicitly pass `gasLimitMultiplier: 1.5` to transaction manager for Quai Network

### 3. Frontend (`apps/web/app/qns/profile/page.tsx`)

#### Wallet Connection Validation
- **New**: Check `eth_accounts` before attempting transaction
- Verify wallet is unlocked and has accessible accounts
- Return clear error if wallet not connected

#### Provider Verification
- Get and log network information from provider
- Verify signer has a connected provider
- Return clear error if provider not properly connected

#### Better Error Messages
- "Wallet not connected. Please connect your wallet first."
- "Failed to access wallet. Please ensure your wallet is unlocked."
- "Signer not properly connected to provider. Please reconnect your wallet."

## Testing Instructions

### 1. Test with Locked Wallet
1. Lock your Pelagus wallet
2. Try to register a domain
3. **Expected**: Clear error message about wallet being locked

### 2. Test with Unlocked Wallet
1. Unlock your Pelagus wallet
2. Ensure you're on Quai Testnet (Orchard)
3. Try to register a domain (e.g., "testdomain123")
4. **Expected**: Wallet popup should appear with transaction details
5. **Expected**: Transaction should show reasonable gas limit (around 500,000 or less)
6. Approve the transaction
7. **Expected**: Transaction should succeed and domain should be registered

### 3. Test with Insufficient Balance
1. Use an account with 0 or very low QI balance
2. Try to register a domain
3. **Expected**: Clear error about insufficient balance with faucet link

### 4. Test with Already Registered Domain
1. Try to register a domain that's already taken
2. **Expected**: Clear error that domain is not available

## Debugging

If you still see the error, check the browser console for these logs:

### Before Transaction
```
🔵 About to call transactionManager.executeTransaction with: {
  contract: "0x...",
  method: "register",
  args: ["domainname", "0x..."],
  value: "2000000000000000000",
  maxRetries: 3
}
```

### During Transaction
```
🔵 SENDING TRANSACTION: {
  contract: "0x...",
  method: "register",
  args: [...],
  txOptions: {
    gasLimit: "500000",
    gasLimitType: "number",  // Should be "number", not "bigint"
    value: "2000000000000000000",
    valueType: "bigint",
    hasValue: true
  },
  attempt: 1,
  signerAddress: "0x..."
}
```

### Final Overrides
```
🔵 FINAL OVERRIDES: {
  gasLimit: 500000,           // Should be a number
  gasLimitType: "number",     // Should be "number"
  value: "2000000000000000000",
  valueType: "bigint",
  hasValue: true
}
```

### Transaction Created
```
🔵 Transaction object received: {
  hash: "0x...",
  from: "0x...",
  to: "0x...",
  value: "2000000000000000000",
  gasLimit: "500000"
}
```

## Common Issues and Solutions

### Issue: "Contract signer is not properly configured"
**Solution**: Reconnect your wallet. The signer lost connection to the provider.

### Issue: "Wallet not connected"
**Solution**: Unlock your Pelagus wallet and ensure it's connected to the dApp.

### Issue: Still getting code 4001 error
**Possible causes**:
1. Wallet is rejecting the transaction format (check console logs for parameter types)
2. Gas limit is still too high (should be around 500,000)
3. Network mismatch (ensure you're on Quai Testnet Orchard)
4. Insufficient balance (check balance in wallet)

**Debug steps**:
1. Open browser console (F12)
2. Look for the "🔵 FINAL OVERRIDES" log
3. Verify `gasLimitType` is "number" (not "bigint")
4. Verify `gasLimit` is a reasonable number (< 1,000,000)
5. Check that `signerAddress` matches your wallet address
6. Ensure `hasValue` is true and value is correct

## Next Steps

1. Test the registration flow with the changes
2. Monitor console logs for any unexpected errors
3. If issues persist, check:
   - Pelagus wallet version (ensure it's up to date)
   - Network connection (try switching networks and back)
   - Browser console for any additional error details

## Technical Details

### Quai Network Transaction Format
Quai Network uses a modified EVM that requires:
- Gas limits as Numbers (not BigInts)
- Proper signer connection to provider
- Reasonable gas limits (not excessive)

### Transaction Flow
1. User clicks "Buy Now"
2. Frontend validates wallet connection
3. Frontend creates BrowserProvider and gets Signer
4. Frontend verifies signer has provider
5. QNS library creates contract with signer
6. QNS library verifies contract.runner exists
7. Transaction manager estimates gas
8. Transaction manager converts gas limit to Number
9. Transaction manager calls contract method with overrides
10. Wallet popup appears for user approval
11. User approves transaction
12. Transaction is sent to blockchain
13. Frontend waits for confirmation

Each step now has proper validation and error handling to catch issues early.
