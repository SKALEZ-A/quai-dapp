# 🚀 Getting Started with Quai Superapp

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment
```bash
# Copy environment template
cp .env.example .env

# Update with your values
# - Database: SQLite (default) or PostgreSQL
# - RPC: https://orchard.rpc.quai.network/cyprus1
# - Network: testnet
```

### 3. Run Development
```bash
# Start all services
pnpm run dev

# Or start individually:
cd apps/api && pnpm dev      # API on :4000
cd apps/web && pnpm dev      # Frontend on :3000
```

### 4. Access the App
- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000
- **GraphQL:** http://localhost:4000/graphql

---

## Project Structure

```
QUAI/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Node.js API (GraphQL + REST)
├── packages/
│   ├── contracts/    # Solidity contracts (Hardhat)
│   └── shared/       # Shared types/utils
└── docs/             # Documentation
```

---

## Core Features

### ✅ Implemented
- **QNS (Quai Name Service)**: Register `.quai` domains
- **Social DApp**: Posts, likes, comments, following
- **Bridge**: Wormhole Connect integration (40+ chains)
- **Wallet Integration**: Pelagus wallet support
- **Event Indexer**: On-chain event tracking

### 🔄 In Progress
- Production deployment
- Enhanced mobile UI
- Performance optimizations

---

## Development Workflow

### Running Tests
```bash
# Smart contracts
cd packages/contracts
pnpm test

# API tests
cd apps/api
pnpm test

# Frontend tests
cd apps/web
pnpm test
```

### Deploying Contracts
```bash
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network cyprus1_testnet
```

### Database Migrations
```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma generate
```

---

## Essential Environment Variables

### Backend (apps/api/.env)
```env
DATABASE_URL=file:./dev.db
PORT=4000
QUAI_RPC_URL=https://orchard.rpc.quai.network/cyprus1
QNS_REGISTRY_ADDRESS=0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61
SOCIAL_CONTRACT_ADDRESS=0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910
```

### Frontend (apps/web/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_QUAI_NETWORK=testnet
NEXT_PUBLIC_QNS_REGISTRY_ADDRESS=0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61
NEXT_PUBLIC_SOCIAL_CONTRACT_ADDRESS=0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910
```

---

## Common Issues

### "Block not found" error
- **Cause:** Quai testnet RPC is temporarily down
- **Solution:** Wait and retry, or use alternative RPC

### "Insufficient funds" 
- **Cause:** Need testnet QI for gas
- **Solution:** Get from https://faucet.quai.network/

### Database connection issues
- **Cause:** Missing DATABASE_URL or wrong format
- **Solution:** Check .env file and Prisma schema

---

## Next Steps

1. **Explore Features:** Try QNS registration and social posting
2. **Read Documentation:** See `/docs` folder for detailed guides
3. **Deploy Contracts:** Follow deployment guide for testnet/mainnet
4. **Production Setup:** See deployment documentation

---

## Support & Resources

- **Documentation:** `/docs` folder
- **Quai Discord:** https://discord.gg/quai
- **QuaiScan:** https://quaiscan.io
- **Faucet:** https://faucet.quai.network/

---

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, GraphQL, Prisma
- **Blockchain:** Quai Network, quais.js, Pelagus wallet
- **Database:** PostgreSQL (production) / SQLite (development)
- **Storage:** IPFS via web3.storage
- **Bridge:** Wormhole Connect
