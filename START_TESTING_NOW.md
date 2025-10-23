# 🚀 START TESTING NOW - Quick Guide

## ⚡ 3-Minute Quick Start

### Step 1: Run Diagnostics (30 seconds)
```bash
cd packages/contracts
node scripts/run-all-diagnostics.js
```

**Expected:** All checks should pass ✅

---

### Step 2: Start the App (30 seconds)
```bash
cd ../..
pnpm dev
```

**Wait for:** "Ready on http://localhost:3000"

---

### Step 3: Test Registration (2 minutes)

1. **Open:** http://localhost:3000/qns/profile

2. **Connect Wallet:**
   - Click "Connect Wallet"
   - Approve in Pelagus

3. **Register Domain:**
   - Enter a domain name (e.g., "mytest123")
   - Click "Register Domain"
   - Confirm in wallet
   - Wait for confirmation

---

## ✅ What to Look For

### Good Signs ✅
- Network shows "Cyprus-1" or "Orchard Testnet"
- Balance displays correctly
- Domain availability check works
- Price shows (e.g., "0.05 QI")
- Loading spinner appears during transaction
- Success message after confirmation

### Error Handling ✅
- Clear error messages (not generic)
- Suggestions for fixing issues
- Retry button on network errors
- Faucet link on insufficient balance

---

## 🐛 If Something Goes Wrong

### Error: "Insufficient Balance"
```bash
# Get testnet QI
open https://faucet.quai.network/
```

### Error: "Wrong Network"
```
1. Open Pelagus wallet
2. Click network dropdown
3. Select "Quai Orchard Testnet"
4. Select "Cyprus-1" zone
```

### Error: "Contract interaction failed"
```bash
cd packages/contracts
node scripts/check-and-fix-permissions.js
```

### Error: "Cannot connect to RPC"
```
Check your internet connection
The RPC might be slow - wait 30 seconds and retry
```

---

## 📊 What's Been Fixed

✅ **Contract Permissions** - Registrar can now mint NFTs
✅ **Error Messages** - Clear, actionable feedback
✅ **Transaction Retry** - Automatic retry on network errors
✅ **Gas Estimation** - Smart estimation with fallback
✅ **Loading States** - Visual feedback during operations
✅ **Diagnostic Tools** - Easy troubleshooting

---

## 🎯 Test Scenarios

### Scenario 1: Happy Path ✅
1. Connect wallet with balance
2. Enter available domain
3. Register successfully
4. See confirmation

### Scenario 2: Insufficient Balance ✅
1. Connect wallet with 0 balance
2. Try to register
3. See clear error with faucet link

### Scenario 3: Domain Taken ✅
1. Try to register "test" or "admin"
2. See "domain not available" message
3. Get suggestion to try different name

### Scenario 4: Network Error ✅
1. Disconnect internet briefly
2. Try to register
3. See automatic retry
4. See retry button if all attempts fail

---

## 📝 Quick Commands

```bash
# Run all diagnostics
cd packages/contracts && node scripts/run-all-diagnostics.js

# Check permissions
cd packages/contracts && node scripts/check-and-fix-permissions.js

# Start app
pnpm dev

# View logs (in browser)
F12 → Console tab
```

---

## 🎉 You're All Set!

Everything is ready for testing. The system has been thoroughly fixed and enhanced with:

- ✅ Working contract permissions
- ✅ Clear error messages
- ✅ Automatic retry logic
- ✅ Better user experience
- ✅ Diagnostic tools

**Just run:**
```bash
pnpm dev
```

**And test at:** http://localhost:3000/qns/profile

---

## 📚 More Information

- **Full Testing Guide:** `QNS_VALIDATION_CHECKLIST.md`
- **Complete Summary:** `QNS_FIX_COMPLETE_SUMMARY.md`
- **Diagnostic Tools:** `packages/contracts/scripts/DIAGNOSTICS_README.md`

---

## 💡 Pro Tips

1. **Keep Console Open** - Press F12 to see detailed logs
2. **Check Network** - Make sure you're on Cyprus-1
3. **Get Testnet QI** - You'll need some to test
4. **Try Different Domains** - Test various lengths and names
5. **Test Error Cases** - Try with 0 balance, wrong network, etc.

---

## ✅ Success Checklist

After testing, you should have verified:

- [ ] Can connect wallet
- [ ] Can check domain availability
- [ ] Can see price calculation
- [ ] Can register domain successfully
- [ ] Error messages are clear
- [ ] Loading states work
- [ ] Retry logic works
- [ ] Transaction completes

---

**Ready? Let's go! 🚀**

```bash
pnpm dev
```
