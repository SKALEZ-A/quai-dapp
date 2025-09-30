# Quai Superapp Monorepo

This monorepo follows the rules in `BUILD_RULES.md` to deliver a social dApp, QNS (Quai Name Service), and a bridge module on Quai Network.

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

### Local Development
```bash
# Start infrastructure
docker compose up -d postgres redis

# API setup
cd apps/api
cp ENV_EXAMPLE .env
pnpm run prisma:migrate -- --name init_social
pnpm run prisma:generate

# Start services
pnpm run dev    # API
pnpm run indexer # Background indexer
cd ../web && pnpm run dev # Frontend
```

### Production Deployment
See `docs/MAINNET_DEPLOYMENT.md` for complete mainnet deployment guide.

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
