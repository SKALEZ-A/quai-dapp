# Quai Superapp Runbook (Local → Testnet/Mainnet)

## Prerequisites
- Node.js 18+ and pnpm
- Docker Desktop (for Postgres/Redis)
- Wallet with Quai funds (Pelagus recommended)
- web3.storage API token (or alternative IPFS pinning)

## 0) Install deps
```
pnpm i
```

## 1) Start infrastructure
```
docker compose up -d postgres redis
```

## 2) Configure environments

A) API (`apps/api/.env`) – copy from `apps/api/ENV_EXAMPLE` and set:
```
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quai
REDIS_URL=redis://localhost:6379
WEB3_STORAGE_TOKEN=your_web3_storage_token
# Quai RPC + social contract (fill address after deploy)
QUAI_RPC_URL=https://orchard.rpc.quai.network/cyprus1
SOCIAL_CONTRACT_ADDRESS=0x...
```

B) Contracts (`packages/contracts/.env`) – copy from `packages/contracts/ENV_EXAMPLE` and set:
```
# Private key WITHOUT 0x prefix (use a burner for testnets)
PRIVATE_KEY=...
# Zone RPC you will deploy to (testnet or mainnet)
QUAI_RPC_URL=https://orchard.rpc.quai.network/cyprus1
# Optional admin for QNSRegistry, else deployer is used
# ADMIN_ADDRESS=0xYourAdmin
# Optional chain id if required by your provider (verify with explorer/docs)
# CHAIN_ID=...
```

C) Web (`apps/web/.env.local`) – copy from `apps/web/ENV_EXAMPLE` and set as needed:
```
NEXT_PUBLIC_QUAI_NETWORK=testnet
# Optionally override per-zone RPCs (see ENV_EXAMPLE)
```

## 3) Prepare database (Prisma)
```
cd apps/api
pnpm run prisma:migrate -- --name init_social
pnpm run prisma:generate
```

## 4) Run services (local dev)
- API:
```
cd apps/api
pnpm run dev
```
- Indexer (separate terminal):
```
cd apps/api
pnpm run indexer
```
- Web:
```
cd apps/web
pnpm run dev
```

API endpoints:
- Health: GET http://localhost:4000/health
- Posts: GET http://localhost:4000/posts?limit=20&cursor=...&authorAddress=0x...
- Create post (EIP‑712 signed): POST http://localhost:4000/posts
- Engagements: POST http://localhost:4000/engagements/likes, POST http://localhost:4000/engagements/comments
- GraphQL: POST http://localhost:4000/graphql (query: feed)

EIP-712 (domain and types):
- Domain: `{ name: "QuaiSocial", version: "1" }`
- Types: `Post(author address, textHash bytes32, zone string, issuedAt uint256, nonce bytes32)`

## 5) Deploy contracts

Option A — Hardhat (upgradeable flow):
```
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network quai
```

Option B — Quais.js (direct deploy using SDK):
Prereqs:
- `packages/contracts/.env`: set `PRIVATE_KEY` (no 0x prefix) and `QUAI_RPC_URL`.
- Compile to generate artifacts.
```
cd packages/contracts
pnpm build
pnpm deploy:quais
```
- Output prints JSON with `socialPosts` address. Copy it into `apps/api/.env` as `SOCIAL_CONTRACT_ADDRESS`.
- Restart API/indexer after updating envs.

## 6) Testnet → Mainnet
- Switch `QUAI_RPC_URL` (and `CHAIN_ID` if required) in:
  - `packages/contracts/.env`
  - `apps/api/.env` (for indexer)
- Fund deployer and pay gas.
- Redeploy:
```
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network quai
```
- Update `SOCIAL_CONTRACT_ADDRESS` in `apps/api/.env`, restart `pnpm run indexer` and API.

## 7) Production notes
- API:
  - Build: `cd apps/api && pnpm run build`
  - Start: `node dist/index.js` (behind a reverse proxy; set `ALLOWED_ORIGINS` appropriately)
- DB/Redis: use managed services; rotate secrets; restrict network access.
- IPFS: consider `@web3-storage/w3up-client` or a gateway/pinning provider with SLAs.
- Observability: add Sentry and structured logs per `BUILD_RULES.md` when ready.

## Troubleshooting
- Docker not running: start Docker Desktop; re-run `docker compose up -d postgres redis`.
- Prisma migrate errors: verify `DATABASE_URL` and Postgres is reachable; `pnpm run prisma:generate` after changes.
- Invalid signature: check system clock, ensure the same `domain/types/message` on FE + BE.
- Missing `SOCIAL_CONTRACT_ADDRESS`: deploy contracts and set the env; restart indexer/API.
- CORS blocked: update `ALLOWED_ORIGINS` in `apps/api/.env`.

## Quick command reference
```
# Infra
docker compose up -d postgres redis

# API
cd apps/api
pnpm run prisma:migrate -- --name init_social
pnpm run prisma:generate
pnpm run dev
pnpm run indexer

# Web
cd apps/web
pnpm run dev

# Contracts
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network quai
```
