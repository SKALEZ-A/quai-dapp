# Quai Superapp Monorepo

This monorepo follows the rules in `BUILD_RULES.md` to deliver a social dApp, QNS (Quai Name Service), and a bridge module on Quai Network.

## 🎯 **NEW: Getting Started with Production Deployment**

**📚 [START_HERE.md](START_HERE.md)** - Complete guide to databases, deployment, and production setup

**Quick links:**
- [YOUR_QUESTIONS_ANSWERED.md](YOUR_QUESTIONS_ANSWERED.md) - Database & deployment guide
- [QUICK_START_PRODUCTION.md](QUICK_START_PRODUCTION.md) - 15-minute production setup
- [DIGITALOCEAN_SETUP_GUIDE.md](DIGITALOCEAN_SETUP_GUIDE.md) - DigitalOcean configuration
- [setup-database.sh](setup-database.sh) - Automated database setup

## Workspaces
- `apps/web` – Next.js frontend
- `apps/api` – Node.js API (GraphQL reads, REST writes)
- `packages/contracts` – Solidity contracts (Hardhat)
- `packages/shared` – Shared types/utils

## Scripts
Use `pnpm` with workspaces and Turborepo.

```bash
pnpm i
pnpm run build
pnpm run dev
```

## 🚀 Deployment

### 📚 **NEW: Comprehensive Deployment Documentation**

**Start here:** [YOUR_QUESTIONS_ANSWERED.md](YOUR_QUESTIONS_ANSWERED.md) - Complete guide to databases and deployment

**Quick guides:**
- [QUICK_START_PRODUCTION.md](QUICK_START_PRODUCTION.md) - Fastest path to production (15 min)
- [DATABASE_SUMMARY.md](DATABASE_SUMMARY.md) - Current database status
- [DIGITALOCEAN_SETUP_GUIDE.md](DIGITALOCEAN_SETUP_GUIDE.md) - DigitalOcean setup (60 min)
- [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md) - Pre-launch checklist

**All guides:** See [README_DEPLOYMENT.md](README_DEPLOYMENT.md) for complete index

### Local Development
```bash
# Option 1: Use current SQLite setup (Already working!)
cd apps/api
pnpm dev

# Option 2: Set up PostgreSQL + Redis
./setup-database.sh  # Interactive setup script

# Option 3: Docker
docker compose up -d postgres redis

# API setup
cd apps/api
cp ENV_EXAMPLE .env
pnpm run prisma:migrate
pnpm run prisma:generate

# Start services
pnpm run dev    # API
pnpm run indexer # Background indexer
cd ../web && pnpm run dev # Frontend
```

### Production Deployment
See `docs/MAINNET_DEPLOYMENT.md` for complete mainnet deployment guide.

**Database Options:**
- **Supabase** (Recommended for quick start): 15 min setup, free tier
- **DigitalOcean** (Recommended for production): 60 min setup, full control

**Quick Production Setup:**
```bash
# Deploy contracts to mainnet
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network quai

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Deploy frontend (Vercel/Netlify)
cd apps/web
pnpm run build && # deploy build/ folder
```

## 📋 Project Status

✅ **Completed:**
- QNS contracts (Registry, Controller, Auction Manager, Reserved Names, NFT, Payment Resolver)
- Social dApp with posts, NFT sharing, tipping UI
- Event indexer for all contracts
- Complete frontend for QNS and Social features

🔄 **In Progress:**
- Mainnet deployment setup
- Production infrastructure configuration

⏳ **Remaining:**
- Bridge integration (deferred)
- Encrypted DMs (XMTP integration)
- Analytics and monitoring
- Security audit

See `BUILD_RULES.md` for detailed implementation roadmap.

# quai-frontend
# Trigger Railway redeploy
