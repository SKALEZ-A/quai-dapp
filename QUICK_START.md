# 🚀 Quick Start Guide

Get the Quai Superapp running in 5 minutes!

## Prerequisites

- Node.js 18+ and pnpm installed
- Pelagus wallet (for blockchain features)
- Testnet QI (from https://faucet.quai.network/)

---

## 1. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

---

## 2. Set Up Environment

```bash
# Copy example environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Default config uses SQLite (no setup needed)
# For PostgreSQL, see docs/DATABASE.md
```

---

## 3. Start Development

```bash
# Start all services (API + Frontend)
pnpm run dev

# Or start individually:
cd apps/api && pnpm dev      # API: http://localhost:4000
cd apps/web && pnpm dev      # Web: http://localhost:3000
```

---

## 4. Access the App

**Frontend:** http://localhost:3000
- Dashboard: `/dashboard`
- QNS: `/qns/profile`
- Bridge: `/dashboard/bridge`

**API:** http://localhost:4000
- Health: `/health`
- GraphQL: `/graphql`
- Posts: `/posts`

---

## 🎯 What You Can Do

### ✅ Without Deployment
- Browse the UI
- Connect Pelagus wallet
- View existing posts
- Check domain availability
- Test bridge interface (Wormhole)

### ⏳ After Contract Deployment
- Register QNS domains
- Create social posts
- Like & comment
- Follow users
- Transfer domains

---

## 🚀 Deploy Contracts (Optional)

If you want to test blockchain features:

```bash
# 1. Ensure wallet has testnet QI
# Check: https://quaiscan.io/address/YOUR_ADDRESS
# Get QI: https://faucet.quai.network/

# 2. Deploy contracts
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network cyprus1_testnet

# 3. Update .env files with contract addresses
# See output from deployment script
```

---

## 🎨 Key Features

### QNS (Quai Name Service)
- Register `.quai` domains (5-50 QUAI)
- Manage domain records
- Transfer ownership
- NFT-based ownership

### Social DApp
- Create posts with IPFS storage
- Like, comment, share
- Follow system
- User profiles with QNS integration

### Bridge
- Wormhole Connect integration
- 40+ supported blockchains
- Native token transfers
- Beautiful dark theme UI

---

## 📚 Next Steps

### For Development
1. **Explore the Code**
   - Frontend: `apps/web/app`
   - API: `apps/api/src`
   - Contracts: `packages/contracts/contracts`

2. **Read Documentation**
   - [Getting Started](docs/GETTING_STARTED.md) - Full setup
   - [QNS Guide](docs/QNS_GUIDE.md) - Domain system
   - [Deployment](docs/DEPLOYMENT.md) - Go to production

### For Testing
1. **Deploy Contracts** (see above)
2. **Register a Domain**
3. **Create Posts**
4. **Test Bridge**

### For Production
1. **Review** [Deployment Guide](docs/DEPLOYMENT.md)
2. **Set Up Database** (PostgreSQL)
3. **Deploy to Hosting** (Vercel/Railway)
4. **Configure Monitoring**

---

## ⚠️ Common Issues

### "Block not found" error
- **Cause:** Quai testnet RPC temporarily down
- **Solution:** Wait and retry, or check Quai Discord

### "Cannot connect to database"
- **Cause:** DATABASE_URL not set or wrong format
- **Solution:** Check .env files, default SQLite should work

### "Insufficient funds"
- **Cause:** Wallet needs testnet QI
- **Solution:** Get from https://faucet.quai.network/

### "Module not found"
- **Cause:** Dependencies not installed
- **Solution:** Run `pnpm install` in project root

---

## 📞 Support

- **Documentation:** `/docs` folder
- **Quai Discord:** https://discord.gg/quai  
- **QuaiScan:** https://quaiscan.io
- **Faucet:** https://faucet.quai.network/

---

## 🎊 You're Ready!

The app should now be running. Open http://localhost:3000 and start exploring!

**Happy building!** 🚀
