# 🚀 Quai Smart Contract Deployment Guide

This guide will help you deploy smart contracts to Quai Network using the correct Hardhat configuration and deployment scripts.

## ✅ What Was Fixed

Your deployment setup has been refactored based on the [official Quai hardhat-example](https://github.com/dominant-strategies/hardhat-example/) and [Quai documentation](https://docs.qu.ai/guides/development/solidity).

### Key Changes:

1. **✅ Migrated from hardhat.config.ts to hardhat.config.js**
   - Quai Network requires JavaScript config file
   - Added proper network configurations for all zones

2. **✅ Added Required Quai Plugins**
   - `@quai/quais-upgrades` - For upgradeable contracts
   - `@quai/hardhat-deploy-metadata` - For IPFS metadata deployment
   - `@nomicfoundation/hardhat-toolbox` - Standard Hardhat tooling

3. **✅ Fixed Network Configuration**
   - Added `{ usePathing: true }` for Quai's multi-zone routing
   - Configured Cyprus1, Cyprus2, Paxos1, Hydra1 networks
   - Added testnet (Orchard) and local development configs

4. **✅ Created Proper Deployment Scripts**
   - Based on working sample from `sample_quai_contract`
   - Added retry logic with timeouts
   - Proper error handling and verification
   - Transaction confirmation with status checks

## 📋 Prerequisites

- Node.js 18+ installed
- pnpm or npm
- Quai wallet with funds (use [Pelagus Wallet](https://pelaguswallet.io/))
- Private key for deployment address

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/mac/Desktop/CODES/HACKATHON/QUAI_Rocster/QUAI/packages/contracts
pnpm install
# or
npm install
```

This will install:
- `quais` v1.0.0-alpha.52
- `@quai/quais-upgrades` v3.8.14
- `@quai/hardhat-deploy-metadata` v1.0.8
- All Hardhat and OpenZeppelin dependencies

### 2. Configure Environment Variables

```bash
# Copy the example file
cp ENV_EXAMPLE_NEW .env

# Edit .env and add your private key
nano .env
```

**Important:** Your private key should:
- Be without `0x` prefix
- Correspond to an address starting with the correct zone prefix:
  - Cyprus1: `0x00...` or `0x10...`
  - Cyprus2: `0x01...` or `0x11...`
  - Paxos1: `0x02...` or `0x12...`

Example `.env` configuration:
```bash
# Mainnet deployment
PRIVATE_KEY="your_private_key_without_0x"
CYPRUS1_PK="your_cyprus1_key_without_0x"
CHAIN_ID="9"
RPC_URL="https://rpc.quai.network"
QUAI_RPC_URL="https://rpc.quai.network"
HELLO_GREETING="Hello from Quai Mainnet!"
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 9 Solidity files successfully
```

## 🚀 Deployment

### Option 1: Deploy HelloQuai (Simple Test)

```bash
# Deploy to mainnet Cyprus1
pnpm run deploy:hello:mainnet

# Deploy to testnet
pnpm run deploy:hello:testnet

# Deploy to custom network
node scripts/deployHelloQuai.js --network cyprus1
```

### Option 2: Deploy Full QNS System

For deploying the full Quai Name Service system, you'll need to create a comprehensive deployment script. The basic structure would be:

```bash
# Create QNS deployment script (you'll need to implement this)
node scripts/deployQNS.js --network cyprus1
```

### Option 3: Deploy Social Posts Contract

```bash
node scripts/deploySocial.js --network cyprus1
```

## 📊 Network Configuration

The `hardhat.config.js` includes the following networks:

| Network | Chain ID | RPC URL | Description |
|---------|----------|---------|-------------|
| `cyprus1` | 9 | https://rpc.quai.network | Mainnet Cyprus Zone 1 |
| `cyprus2` | 9 | https://rpc.quai.network | Mainnet Cyprus Zone 2 |
| `paxos1` | 9 | https://rpc.quai.network | Mainnet Paxos Zone 1 |
| `hydra1` | 9 | https://rpc.quai.network | Mainnet Hydra Zone 1 |
| `cyprus1_testnet` | 15000 | https://orchard.rpc.quai.network/cyprus1 | Testnet Orchard |
| `local` | 1337 | http://localhost:8610 | Local development |

**Note:** The SDK automatically routes to the correct zone using `usePathing: true`.

## 🔍 Verifying Deployment

After deployment, verify your contract on [QuaiScan](https://quaiscan.io):

1. Copy the deployed contract address from the terminal output
2. Visit `https://quaiscan.io/address/<your_contract_address>`
3. View contract code, transactions, and events

## 🐛 Troubleshooting

### Issue: "Transaction timeout"

**Solution:** The deployment script includes automatic retry logic. If you see this:
- Check your internet connection
- Verify the RPC URL is correct
- Ensure your wallet has sufficient QUAI balance
- The script will automatically retry 3 times

### Issue: "Insufficient balance"

**Solution:** Fund your deployment address:
1. Get testnet tokens from [Quai Faucet](https://faucet.quai.network/)
2. For mainnet, transfer QUAI to your deployment address

### Issue: "Nonce too high/low"

**Solution:** Reset your wallet nonce or wait for pending transactions to complete.

### Issue: Contract deployment stuck

**Solution:**
- Check QuaiScan for the transaction status
- The script includes a 120-second timeout
- If it continues to fail, try deploying to testnet first

## 📝 Deployment Script Features

The new `deployHelloQuai.js` script includes:

✅ **Retry Logic:** Automatically retries failed deployments (3 attempts)  
✅ **Timeout Protection:** 120-second transaction timeout  
✅ **Balance Checking:** Verifies sufficient funds before deployment  
✅ **Deployment Verification:** Tests contract functions post-deployment  
✅ **Detailed Logging:** Clear status messages and error reporting  
✅ **Network Information:** Displays chain ID, RPC URL, and deployer address  

## 🔗 Useful Resources

- [Quai Network Documentation](https://docs.qu.ai/)
- [Quai Hardhat Example](https://github.com/dominant-strategies/hardhat-example/)
- [Quais SDK Documentation](https://docs.qu.ai/sdk/introduction)
- [QuaiScan Explorer](https://quaiscan.io/)
- [Pelagus Wallet](https://pelaguswallet.io/)

## ⚠️ Important Notes

1. **Never commit your `.env` file** with real private keys
2. **Always test on testnet** before deploying to mainnet
3. **Verify contract addresses** match expected zones
4. **Keep track of deployed addresses** for frontend integration
5. **Use separate private keys** for different zones if deploying multi-zone

## 🎯 Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ✅ Configure `.env` with your private key
3. ✅ Compile contracts: `npx hardhat compile`
4. ✅ Test deployment on testnet: `pnpm run deploy:hello:testnet`
5. ✅ Deploy to mainnet: `pnpm run deploy:hello:mainnet`
6. 📝 Update frontend with deployed contract addresses
7. 🧪 Write integration tests

---

**Need Help?** Check the [Quai Discord](https://discord.gg/quai) or open an issue on GitHub.

