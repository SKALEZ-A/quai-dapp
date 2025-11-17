# Quai Superapp Monorepo

A comprehensive social dApp platform on Quai Network featuring QNS (Quai Name Service), social features, and cross-chain bridging.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm run dev

# Access the app
# Frontend: http://localhost:3000
# API: http://localhost:4000
```

**📚 [Getting Started Guide](docs/GETTING_STARTED.md)** - Complete setup instructions

## 📁 Project Structure

```
QUAI/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # Node.js API (port 4000)
├── packages/
│   ├── contracts/    # Solidity contracts (Hardhat)
│   └── shared/       # Shared types/utils
├── docs/             # Documentation
└── pnpm-workspace.yaml
```

## ✨ Features

- **QNS (Quai Name Service):** Human-readable blockchain addresses (.quai domains)
- **Social DApp:** Posts, likes, comments, following system
- **Bridge:** Wormhole Connect integration (40+ blockchains)
- **Wallet:** Pelagus wallet integration
- **Storage:** IPFS via web3.storage

## 📖 Documentation

### Essential Guides
- **[Getting Started](docs/GETTING_STARTED.md)** - Setup & development
- **[QNS Guide](docs/QNS_GUIDE.md)** - Domain registration & management
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment
- **[Database](docs/DATABASE.md)** - Database configuration

### Additional Resources
- **[Architecture](docs/architecture.md)** - System design
- **[Mainnet Deployment](docs/MAINNET_DEPLOYMENT.md)** - Mainnet guide
- **[Runbook](docs/RUNBOOK.md)** - Operations guide
- **[Product Requirements](prd.md)** - PRD document
- **[Design Document](design.md)** - Technical design

## 🎯 Current Status

### ✅ Completed
- QNS smart contracts deployed
- Social dApp features (posts, likes, comments, follows)
- Wormhole bridge integration
- Frontend UI & UX
- Event indexing system
- API & GraphQL endpoints

### 🔄 In Progress
- Production deployment optimization
- Performance improvements
- Mobile responsiveness

### 📊 Tech Stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express, GraphQL, Prisma  
**Blockchain:** Quai Network, quais.js, Solidity  
**Database:** PostgreSQL / SQLite  
**Storage:** IPFS (web3.storage)  
**Bridge:** Wormhole Connect

## 🤝 Contributing

See `BUILD_RULES.md` for development guidelines.

## 📞 Support

- **Documentation:** `/docs` folder
- **Quai Discord:** https://discord.gg/quai
- **Issues:** GitHub Issues

---

**Built for Quai Network** 🚀
