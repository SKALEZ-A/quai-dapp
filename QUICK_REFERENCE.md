# 📋 QNS Deployment Quick Reference

## 🎯 Contract Addresses (Quai Testnet - Cyprus1)

```
Registry:  0x000726DDcC49c730b18B03e6215e159d6965d1D5
NFT:       0x001C50fa210f2C93129A19BeE60e73EBcac18a01
Registrar: 0x0050d3C99FC126689d2a73c0b194079D9d0bd517
Reserved:  0x004a4298d668e61F883a548850D5a071118061B0
```

## ⚡ Quick Commands

### Test Domain Registration
```bash
cd packages/contracts
npx hardhat run scripts/test-registration.js --network cyprus1_testnet
```

### Check Role Assignments
```bash
cd packages/contracts
npx hardhat run scripts/check-admin-roles.js --network cyprus1_testnet
```

### Start Frontend
```bash
cd apps/web
pnpm run dev
# Visit: http://localhost:3000/qns/namesearch
```

## 📝 Environment Setup

Create `apps/web/.env.local`:
```bash
NEXT_PUBLIC_QUAI_NETWORK=testnet
NEXT_PUBLIC_QNS_REGISTRY=0x000726DDcC49c730b18B03e6215e159d6965d1D5
NEXT_PUBLIC_QNS_NFT=0x001C50fa210f2C93129A19BeE60e73EBcac18a01
NEXT_PUBLIC_QNS_REGISTRAR=0x0050d3C99FC126689d2a73c0b194079D9d0bd517
NEXT_PUBLIC_QNS_RESERVED_NAMES=0x004a4298d668e61F883a548850D5a071118061B0
```

## ✅ What's Working

- ✅ All contracts deployed
- ✅ Roles properly granted
- ✅ Domain registration tested and working
- ✅ NFT minting functional
- ✅ Ownership tracking operational
- ✅ Frontend code updated

## 📊 Pricing

- 3 chars: 1,000 QUAI
- 4 chars: 500 QUAI
- 5-7 chars: 200 QUAI
- 8+ chars: 100 QUAI

## 🔗 Resources

- **Full Documentation:** `QNS_FRESH_DEPLOYMENT_SUCCESS.md`
- **Deployment Record:** `packages/contracts/deployed-addresses-simple.json`
- **Testnet Faucet:** https://faucet.quai.network
- **Quai Docs:** https://docs.qu.ai

## 🎊 Status: READY FOR INTEGRATION TESTING!
