# Quai Superapp Monorepo

This monorepo follows the rules in `BUILD_RULES.md` to deliver a social dApp, QNS (Quai Name Service), and a bridge module on Quai Network.

## Workspaces
- `apps/web` – Next.js frontend
- `apps/api` – Node.js API (GraphQL reads, REST writes)
- `packages/contracts` – Solidity contracts (Hardhat)
- `packages/shared` – Shared types/utils

## Scripts
Use `pnpm` with workspaces and Turborepo.

```
pnpm i
pnpm run build
pnpm run dev
```

See `BUILD_RULES.md` for step-by-step delivery. Kickoff tasks: A (Wallet & Provider), B (QNS skeleton), C (Bridge interface + mock).
# quai-dapp

## Social API — Local Setup

1) Start infrastructure (Docker Desktop must be running):

```
docker compose up -d postgres redis
```

2) API env setup:

Create `apps/api/.env` (you can copy from `apps/api/ENV_EXAMPLE`) and set:

```
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quai
REDIS_URL=redis://localhost:6379
# IPFS
WEB3_STORAGE_TOKEN=your_web3_storage_token
```

3) Apply DB schema and generate client:

```
cd apps/api
pnpm run prisma:migrate -- --name init_social
pnpm run prisma:generate
```

4) Run the API:

```
pnpm run dev
# Endpoints
# GET  http://localhost:4000/health
# GET  http://localhost:4000/posts?limit=20
# POST http://localhost:4000/posts { authorAddress, text, zone? }
```

Notes:
- The IPFS helper currently uses `web3.storage` SDK. You need an API token.
- In production, rotate secrets and avoid storing DB passwords in plain env when possible.

See also: `docs/RUNBOOK.md` for end-to-end setup and deployment steps.

