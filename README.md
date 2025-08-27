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
