# ⚡ Quick Start - Testing Your Quai Superapp

## 🎯 What Was Deployed

✅ All 8 contracts successfully deployed to **Quai Testnet (Orchard)**  
✅ Environment files updated with contract addresses  
✅ Ready for testing!

---

## 🚀 5-Minute Quick Start

### Step 1: Get Testnet Tokens (2 minutes)

1. Install **Pelagus Wallet** browser extension
2. Switch to **Testnet** in wallet settings
3. Copy your wallet address
4. Visit https://faucet.quai.network/
5. Paste address and request tokens
6. Wait ~30 seconds for tokens to arrive

### Step 2: Start the Application (2 minutes)

```bash
# In your project root
cd /Users/mac/Desktop/CODES/HACKATHON/QUAI_Rocster/QUAI

# Install dependencies (if not done)
pnpm install

# Start everything
pnpm run dev
```

### Step 3: Access & Test (1 minute)

1. Open http://localhost:3000
2. Connect your Pelagus wallet
3. Start testing features!

---

## 🧪 Quick Feature Tests

### Test 1: Register a QNS Name (30 seconds)

1. Navigate to `/qns/namesearch`
2. Search for a name (e.g., "myname")
3. Click "Register"
4. Confirm transaction in wallet
5. ✅ Success! Your name is registered

### Test 2: Create a Social Post (30 seconds)

1. Navigate to `/social`
2. Click "Create Post"
3. Write some content
4. Click "Post"
5. Confirm transaction
6. ✅ Success! Post appears in feed

### Test 3: Check Your Dashboard (15 seconds)

1. Navigate to `/dashboard`
2. View your registered names
3. See your posts
4. Check analytics
5. ✅ Success! All data displays correctly

---

## 📋 Deployed Contracts (Copy These!)

```bash
# Testnet Contract Addresses
QNS_REGISTRY=0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61
QNS_CONTROLLER=0x0020331A51B939f5e8286541F0C6c38530909782
AUCTION_MANAGER=0x0062f900e9E98fd3e605F886e7728791E5C4F09b
RESERVED_NAMES=0x00289917bf2b8b83623e3Ac4Da7E43d000B008F5
QNS_NFT=0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2
PAYMENT_RESOLVER=0x006Ca4C000E7E642f4ac40dF011f5b693Dc2bE54
REVERSE_REGISTRAR=0x00513E6e1Ab004f091B788A1FeE57f31265317fC
SOCIAL_CONTRACT=0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910
```

View on Explorer: https://quaiscan.io

---

## 🛠 Troubleshooting

### "Insufficient funds"
→ Get more tokens from https://faucet.quai.network/

### "Wrong network"
→ Switch Pelagus to Testnet (Chain ID: 15000)

### "Can't connect wallet"
→ Refresh page, ensure Pelagus is unlocked

### "Transaction stuck"
→ Check QuaiScan with your address

---

## 📚 Full Documentation

For detailed testing instructions, see:
- **Complete Guide**: `/TESTNET_TESTING_GUIDE.md`
- **Deployment Info**: `/packages/contracts/DEPLOYMENT_GUIDE.md`
- **Architecture**: `/docs/architecture.md`

---

## ✅ Testing Checklist

Quick verification that everything works:

- [ ] Got testnet tokens
- [ ] Connected wallet to app
- [ ] Registered a QNS name
- [ ] Created a social post
- [ ] Liked/commented on a post
- [ ] Checked dashboard
- [ ] Verified transaction on QuaiScan

**All checked?** 🎉 Your app is working perfectly!

---

## 🔗 Important Links

- **App**: http://localhost:3000
- **API**: http://localhost:4000
- **GraphQL**: http://localhost:4000/graphql
- **Faucet**: https://faucet.quai.network/
- **Explorer**: https://quaiscan.io
- **Docs**: https://docs.qu.ai/

---

**Need Help?**
- Check browser console (F12) for errors
- View API logs in terminal
- Search QuaiScan for your transactions
- Read full testing guide: `TESTNET_TESTING_GUIDE.md`

