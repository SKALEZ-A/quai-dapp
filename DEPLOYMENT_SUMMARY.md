# HelloQuai Deployment Quickstart (Quai Network)

This repo now uses Hardhat only for build/artifacts and the Quai SDK (`quais`) for sending transactions. This avoids Ethers/Hardhat RLP + checksum issues on Quai.

## Prereqs
- Node: `nvm use 20` (or any Hardhat-supported LTS)
- Install deps and compile:

```bash
cd packages/contracts
pnpm install
pnpm hardhat compile
```

## Testnet (Orchard / Cyprus-1)
- Ensure env:

```bash
cat > packages/contracts/.env << 'EOF'
PRIVATE_KEY=8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802
QUAI_RPC_URL=https://orchard.rpc.quai.network/cyprus1
CHAIN_ID=15000
EOF
```

- Deploy HelloQuai with SDK:

```bash
cd packages/contracts
pnpm run deploy:hello:orchard
```

Expected: prints chainId 15000, deployer, balance, and deployed address.

## Mainnet (Cyprus-1)
- Switch env:

```bash
cat > packages/contracts/.env << 'EOF'
PRIVATE_KEY=8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802
QUAI_RPC_URL=https://rpc.quai.network/cyprus1
CHAIN_ID=9
EOF
```

- Deploy HelloQuai with SDK:

```bash
cd packages/contracts
pnpm run deploy:hello:mainnet
```

## Why SDK deploy (not hardhat-ethers)?
- Quai requires Protobuf-encoded tx for send/sign; Ethers uses RLP. The Quai SDK signs/sends correctly and handles chain-aware checksum and pathing.

## References
- Quai networks, RPCs and chain IDs: https://docs.qu.ai/build/networks
- JSON-RPC overview and Protobuf tx encoding: https://docs.qu.ai/build/playground/overview
- Hardhat example patterns: https://github.com/dominant-strategies/hardhat-example/
- Hardhat Node.js support: https://hardhat.org/docs/reference/nodejs-support
