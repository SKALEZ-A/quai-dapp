# Quai Social dApp + QNS + Bridge — Technical Research & Recommendations

Date: 2025-08-27

## 1) Executive Summary

Build a unified social dApp on Quai Network with: (a) QNS (Quai Name Service) for human-readable identities, (b) integrated wallet onboarding with Pelagus, and (c) a bridge module that can integrate partner bridges or future omnichain messaging. Quai is EVM-compatible but introduces a hierarchical multi-chain architecture; prefer the official `quais` SDK and Pelagus wallet integration. Smart contracts can be authored in Solidity, with upgradeable proxies and ENS-like patterns for QNS. For cross-chain bridging, start with partner-bridge integrations (as listed by Quai docs) and design an abstraction to add LayerZero or other protocols if/when Quai becomes officially supported.

## 2) PRD Scope Synthesis

- QNS (Quai Name Service): ENS-inspired system with reverse Dutch auctions, reserved names, commit/reveal, upgradeability, and a Qi payment code resolver.
- Cross-chain bridge: Support Quai and other L1/L2s, with in-app UX; track volume/success rate.
- Social dApp: On-chain identity + social interactions (chat/posts), wallet creation/connect flow, Pelagus/MetaMask support, MAU/DAU/retention KPIs.
- Timeline: 1 month build with phased discovery → design → FE + contracts → beta.

## 3) Platform Reality Check (Quai)

- EVM compatibility: Quai provides an SDK (`quais`) and JSON-RPC with pathing for zone-aware access. See: [Quai SDK Introduction](https://docs.qu.ai/sdk/introduction), [Contracts usage](https://docs.qu.ai/sdk/static/contract), [JSON-RPC Overview](https://docs.qu.ai/build/playground/overview).
- Wallets: Pelagus is the primary wallet for Quai and injects an EIP-1193-like provider (detectable via `isPelagus`). See: [Pelagus Docs](https://pelaguswallet.io/docs/wallet/intro/), [Quai Development Intro](https://docs.v2.qu.ai/docs/develop/development-intro/).
- Tooling: Quai offers a modified Hardhat and full SDK for TS/JS; migration of EVM apps emphasized. See: [Quai Tooling Announcement](https://qu.ai/blog/quai-network-unveils-new-mainnet-compatible-devnet-and-tooling/).
- Explorer/API: QuaiScan (Blockscout-based) per zone. See: [Chain Explorer](https://support.qu.ai/en/articles/9482447-chain-explorer).

## 4) Recommended Tech Stack

- Frontend
  - Framework: Next.js 14+ (App Router), React 18+, TypeScript.
  - State/Data: React Query (TanStack), Zustand/Recoil for local state.
  - Styling: Tailwind CSS + shadcn/ui; Radix primitives.
  - Wallet: Pelagus injection first-class; custom `quais`-based hooks. Optionally add MetaMask fallback where applicable.
  - Web3: Prefer `quais` SDK for providers/signers over generic ethers/viem due to pathing. Wrap with thin adapters if reusing familiar hooks.
  - Messaging/Push: Evaluate XMTP/Push Protocol/Waku for off-chain encrypted messaging; choose provider that works with wallet signatures independent of specific L1 support.
  - Storage: IPFS via web3.storage or Pinata; optional Arweave for permanence; optional Lit Protocol for message-level encryption.

- Backend/Indexing
  - API: Node.js (NestJS/Express) with TypeScript. GraphQL for social reads; REST for transactional flows.
  - DB/Cache: PostgreSQL for durable data; Redis for sessions/queues.
  - Indexing: Custom event indexer using `quais` per-zone RPC (recommended initially). Monitor The Graph/ Subsquid support; fallback to explorer APIs.
  - Queue/Jobs: BullMQ/Cloud Tasks for background processing (name auctions, commit windows, notifications).

- Smart Contracts (Solidity)
  - Language: Solidity ^0.8.20.
  - Framework: Quai-modified Hardhat (or Foundry if/when supported), OpenZeppelin libs.
  - Patterns: UUPS/Transparent proxies, RBAC (AccessControl), Pausable/Timelock.
  - Testing: Hardhat + Foundry-style fuzz (if available) + Echidna/Slither for security analysis.

## 5) QNS Architecture (ENS-Inspired)

- Core Components
  - `QNSRegistry` (Upgradeable): owner, resolver, TTL; global identifiers to sync across zones.
  - `QNSController` (Upgradeable): user flows for registration/renewal/transfer; enforces commit/reveal.
  - `ReverseRegistrar` + `QiPaymentResolver`: forward (name → Qi code/addresses) and reverse (Qi code → name) resolution.
  - `AuctionManager` (Upgradeable): reverse Dutch auctions for 3–7 char names; fixed-price for ≥8 chars.
  - `ReservedNames` (Governed): allowlists high-profile entities; claim with authorization.
  - `QNSNFT` (ERC-721): tokenized ownership; transfers preserve resolver state.

- Mechanics
  - Commit/Reveal: protect against mempool sniping; enforce commit delay and reveal windows.
  - Auction Curves: per PRD defaults; configurable via governance with timelock.
  - Economics: optional lock-based collateral; slashing hooks for abuse (phishing).
  - Upgradeability: timelocked upgrades; emergency pause on controller/auction.

- Suggested Defaults (from PRD)
  - Auction duration: 7 days. Price curves: 3-char 20,000→1,000 QI; 4-char 10,000→500 QI; 5–7 char 5,000→200 QI.
  - Commit delays: 5 min–24 hr; Renewal grace: 28 days; Premium redemption: 21 days.

References: [ENS Registry Docs](https://docs.ens.domains/registry/ens/)

## 6) Bridging Strategy

- Phase 1: Integrate Official/Partner Bridges
  - Quai docs: "Transfer your assets securely to and from Quai Network using our trusted bridge partners" (see [Use Quai](https://docs.qu.ai/learn/use-quai)). The specific partners may change; implement an abstraction that can:
    - Deep-link or SDK-integrate external bridges in-app.
    - Track transfers via webhooks/polling to reflect statuses in UI.
  - Until explicit Quai support is confirmed for protocols like LayerZero, avoid building on assumptions.

- Phase 2: Omnichain Messaging (Optional/Future)
  - If/when Quai is supported by LayerZero v2 or similar, add OFT/ONFT patterns for fungible/NFT mobility. See: [LayerZero Docs](https://docs.layerzero.network/v2).
  - Modularize UI and backend to swap bridge backends without UX changes.

- Phase 3: Cross-Zone UX
  - Within Quai, ensure RPC `usePathing: true` and address/contract pathing are correctly handled in multi-zone flows.

## 7) Social dApp Architecture

- Identity & Profiles
  - Use QNS names as primary identity; map to addresses and Qi payment codes via resolver.
  - Optional: ENS-style text records for profile metadata stored off-chain (IPFS) with hash anchored in resolver.

- Messaging & Feeds
  - Hybrid approach: store message bodies off-chain (IPFS/Arweave), anchor minimal on-chain events (e.g., casts/posts references) for verifiable feeds and tipping.
  - Encrypted DMs: wallet-based encryption (Lit/Waku/XMTP), with symmetric keys per thread.

- Social Graph
  - On-chain minimal edges (follow/subscribe) or off-chain index plus periodic anchoring. Favor gas-light design.
  - Index via backend worker consuming zone RPC logs.

- Payments/Tips/NFT Sharing
  - Simple ERC-20/ERC-721 interactions using `quais` with Pelagus signer.
  - Add in-app tipping with batched transactions where feasible.

## 8) Environment & DevEx

- Environments: local (containerized nodes if provided), devnet, testnet, mainnet.
- Secrets/Env: `.env.local` for RPC endpoints, explorer URLs, storage keys, bridge API keys.
- CI/CD: GitHub Actions for build/test/lint/contract checks; deploy frontend (Vercel) and backend (Fly.io/Render/Heroku).
- Observability: Sentry + OpenTelemetry; structured logs.

## 9) Security & Compliance

- Contracts
  - AccessControl role separation; Timelock for upgrades; Pausable on controllers/auction; reentrancy guards; checks-effects-interactions.
  - Commit/Reveal windows guarded; predictable randomness avoided; price curve math audited.
  - Use OZ Upgradeable + UUPS/Transparent proxies with beacons where needed.

- App
  - Wallet signature verification for auth; CSRF for admin API; rate limits; message size caps.
  - Content moderation queues; phishing detection for QNS names (slashing policy governance-bound).

- Audits & Testing
  - Unit + integration + invariant tests; fuzzing; static analysis (Slither); third-party security review prior to mainnet.

## 10) Phased Delivery (Aligned to PRD)

- Phase 1 — Discovery (Aug 21–25)
  - Confirm partner bridge list and SDKs; finalize QNS specs; select messaging provider.

- Phase 2 — Product UI (Aug 25–Sep 10)
  - Next.js UI, wallet connect (Pelagus), QNS/Bridge/Social entry points; wireflows.

- Phase 3 — FE + Contracts (Sep 10–30)
  - Implement QNS core (registry/controller/auction/resolver) on testnet.
  - Bridge integration (provider abstraction + one partner); social feed MVP with off-chain storage.

- Phase 4 — Beta (Oct 1–5)
  - Internal + small community testing; load/perf; security pass; analytics wiring (MAU/DAU, bridge volume, QNS mints).

## 11) Open Questions (from PRD + Research)

1) One super-app vs three modules? Recommendation: a single app shell with three modules (QNS, Bridge, Social) under a shared identity/wallet context. Allows phased rollout and shared analytics.
2) Exact list of official bridge partners for Quai? Action: confirm current partners from Quai’s latest docs/announcements and integrate the most reliable first.
3) Messaging provider: XMTP/Push/Waku support for Quai identities? Likely works via wallet signatures regardless of L1, but confirm SDK compatibility.
4) QNS governance: who holds timelock admin and how are reserved names curated/claimed?

## 12) Initial KPI Instrumentation

- Wallet activations, QNS registrations, MAU/DAU, 30-day retention, average session duration.
- Bridge volume, success rate, mean/median time, unique destination chains.
- Social interactions per user, content creation rate, graph growth (connections/groups).

## 13) Implementation Notes & Code Pointers

- Provider setup with pathing (example from docs):

```ts
const provider = new quais.JsonRpcProvider("https://rpc.quai.network", undefined, { usePathing: true });
const contract = new quais.Contract(contractAddress, contractABI, provider);
```

- Pelagus detection preference:

```ts
const injected = (window as any).ethereum;
const isPelagus = injected && injected.isPelagus;
```

## 14) References

- Quai SDK: [Introduction](https://docs.qu.ai/sdk/introduction), [Contracts](https://docs.qu.ai/sdk/static/contract), [JSON-RPC](https://docs.qu.ai/build/playground/overview)
- Pelagus Wallet: [Docs](https://pelaguswallet.io/docs/wallet/intro/), [Site](https://pelaguswallet.io/), [Dev Intro](https://docs.v2.qu.ai/docs/develop/development-intro/)
- Tooling: [Quai Tooling Announcement](https://qu.ai/blog/quai-network-unveils-new-mainnet-compatible-devnet-and-tooling/)
- Explorer: [Quai Chain Explorer](https://support.qu.ai/en/articles/9482447-chain-explorer)
- QNS Site: [qns.club](https://www.qns.club/)
- ENS Reference: [ENS Registry](https://docs.ens.domains/registry/ens/)
- LayerZero Docs (future option): [LayerZero v2](https://docs.layerzero.network/v2)
- Use Quai (bridging partners): [Use Quai](https://docs.qu.ai/learn/use-quai)


