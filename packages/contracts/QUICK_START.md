# ⚡ Quick Start - Quai Contract Deployment

## 🚀 Deploy in 3 Steps

### 1️⃣ Install Dependencies
```bash
cd /Users/mac/Desktop/CODES/HACKATHON/QUAI_Rocster/QUAI/packages/contracts
pnpm install
```

### 2️⃣ Setup Environment
```bash
cp ENV_EXAMPLE_NEW .env
# Edit .env and add your PRIVATE_KEY (without 0x prefix)
```

### 3️⃣ Deploy!
```bash
# Compile first
npx hardhat compile

# Deploy to mainnet
pnpm run deploy:hello:mainnet

# Or deploy to testnet
pnpm run deploy:hello:testnet
```

## 📝 Essential Commands

```bash
# Compile contracts
npx hardhat compile

# Deploy HelloQuai
pnpm run deploy:hello               # Default network (cyprus1)
pnpm run deploy:hello:testnet       # Testnet (Orchard)
pnpm run deploy:hello:mainnet       # Mainnet

# Check balance
node scripts/check-balance.ts

# Custom network deployment
npx hardhat run scripts/deployHelloQuai.js --network cyprus1
```

## 🔧 Required .env Variables

```bash
PRIVATE_KEY="your_key_no_0x"          # Your deployer private key
CHAIN_ID="9"                          # 9=Mainnet, 15000=Testnet
RPC_URL="https://rpc.quai.network"    # Mainnet RPC
HELLO_GREETING="Hello Quai!"          # Contract greeting
```

## 🌐 Network Options

- `cyprus1` - Mainnet Cyprus Zone 1 (default)
- `cyprus1_testnet` - Testnet Orchard
- `paxos1` - Mainnet Paxos Zone 1
- `hydra1` - Mainnet Hydra Zone 1
- `local` - Local development

## ✅ What's Fixed

✅ Correct hardhat.config.js (was .ts)  
✅ Added @quai/quais-upgrades plugin  
✅ Added @quai/hardhat-deploy-metadata  
✅ Network configs with usePathing: true  
✅ Deployment scripts with retry logic  
✅ Proper quais SDK integration  

## 🔗 Resources

- [Full Guide](./DEPLOYMENT_GUIDE.md)
- [Quai Docs](https://docs.qu.ai/)
- [QuaiScan](https://quaiscan.io/)
- [Get Testnet Tokens](https://faucet.quai.network/)

---

**Need more details?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

