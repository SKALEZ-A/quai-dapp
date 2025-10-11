# 🚀 Pinata IPFS Setup Guide

## Why Pinata?
- ✅ **FREE 1GB storage** (perfect for your social DApp)
- ✅ **Reliable and fast** IPFS gateway
- ✅ **Better documentation** than NFT.Storage
- ✅ **No deprecated APIs** - actively maintained
- ✅ **Multiple gateway fallbacks** built-in

## Quick Setup (2 minutes)

### 1. Create Pinata Account
1. Go to https://app.pinata.cloud/
2. Click "Sign Up" (free)
3. Verify your email

### 2. Get API Keys
1. After logging in, go to **"API Keys"** in the sidebar
2. Click **"Create New Key"**
3. Give it a name like "Quai Social DApp"
4. Copy both:
   - **API Key** (starts with letters/numbers)
   - **Secret** (longer string)

### 3. Update Your Environment
Edit `apps/api/.env` and replace:

```bash
PINATA_API_KEY=your_actual_api_key_here
PINATA_SECRET_KEY=your_actual_secret_here
```

### 4. Test the Setup
```bash
cd apps/api
npm run dev
```

Then visit: http://localhost:4000/health/ipfs

You should see:
```json
{
  "status": "healthy",
  "message": "IPFS connection successful",
  "testCid": "Qm...",
  "timestamp": "2025-..."
}
```

## ✅ That's It!

Your images will now upload to Pinata's IPFS network and display perfectly in your social feed. No more gray placeholder boxes!

## Alternative: Web3.Storage
If you prefer Web3.Storage (also free), I can switch the implementation. Just let me know!

## Benefits of This Setup
- **Real IPFS CIDs** instead of `local_img_` placeholders
- **Fast image loading** with multiple gateway fallbacks
- **Reliable storage** with 99.9% uptime
- **Free tier** covers thousands of posts with images
- **Production ready** for immediate deployment
