# 📋 Smart Contracts & Registered Domains Report

**Generated:** October 11, 2025  
**Project:** QUAI Rocster - Quai Name Service (QNS)

---

## 🔗 Deployed Smart Contracts

### **Testnet Deployment (Orchard - cyprus1)**
**Chain ID:** 15000  
**Network:** `https://orchard.rpc.quai.network`  
**Deployment Date:** October 5, 2025 (08:06:20 UTC)  
**Version:** Simple/Non-Upgradeable Contracts  
**Deployer/Admin:** `0x003DAC94805c77d7fD485cd415F8078414d171e4`

#### Contract Addresses:

| Contract | Address | Status |
|----------|---------|--------|
| **QNS Registry** | `0x0047904d94645A46BA56Cf7E8c064cB823746cFf` | ✅ Active |
| **QNS NFT** | `0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12` | ✅ Active |
| **QNS Reserved Names** | `0x0023272C07514D2D236f6c6895507DFd26442471` | ✅ Active |
| **QNS Registrar** | `0x00204d553264Bdb39f4A6C6c1325d9B4553E427b` | ✅ Active |

---

### **Mainnet Deployment (cyprus1)**
**Chain ID:** 15000  
**Network:** `https://rpc.quai.network`  
**Deployment Date:** October 5, 2025 (08:53:29 UTC)  
**Deployer/Admin:** `0x003DAC94805c77d7fD485cd415F8078414d171e4`

#### Contract Addresses:

| Contract | Address | Status |
|----------|---------|--------|
| **QNS Registry** | `0x007024FDAa421bd27B69F91F8f6861E1c8063458` | ⚠️ No domains registered |
| **QNS NFT** | `0x007Ac10d01a4B540581e30194D87b455206Dcd00` | ⚠️ No domains registered |
| **QNS Reserved Names** | `0x0029DDDFE6e95414c27708AdDf4aC10e26c6b0E7` | ⚠️ No domains registered |
| **QNS Registrar** | `0x0059Fc49817AC27165A9335967ba19d2eb115410` | ⚠️ No domains registered |

---

## 🌐 Registered Domains

### **Testnet Domains** ✅
**Total Registered:** 3 domains

#### Domain List:

1. **testdomain**
   - Token ID: `1`
   - Owner: `0x003DAC94805c77d7fD485cd415F8078414d171e4`
   - Node Hash: `0x30515554e9ee6a984e930fb12c4ec10267578aadd5586e22740306df8e0f5389`
   - Status: ✅ Active

2. **test123**
   - Token ID: `2`
   - Owner: `0x003DAC94805c77d7fD485cd415F8078414d171e4`
   - Node Hash: `0xf81b517a242b218999ec8eec0ea6e2ddbef2a367a14e93f4a32a39e260f686ad`
   - Status: ✅ Active

3. **testdomain2**
   - Token ID: `3`
   - Owner: `0x003DAC94805c77d7fD485cd415F8078414d171e4`
   - Node Hash: `0xbee87e58c9dc8b73dbadafb4d8ec1697c1077723f63509c33d99c176a761e9bf`
   - Status: ✅ Active

---

### **Mainnet Domains** ❌
**Total Registered:** 0 domains

> **Note:** The mainnet contracts have been deployed but no domains have been registered yet. The contracts are ready for production use.

---

## 📊 Contract Details

### Smart Contract Types:

1. **QNSRegistrySimple.sol**
   - Purpose: Core registry for domain ownership and resolution
   - Functions: Domain ownership tracking, resolver management

2. **QNSNFTSimple.sol**
   - Purpose: ERC-721 NFT representation of domains
   - Functions: Minting, transferring, querying domains as NFTs
   - Total Supply: 3 (testnet) | 0 (mainnet)

3. **QNSReservedNamesSimple.sol**
   - Purpose: Management of reserved/premium domain names
   - Functions: Reserve name checking, premium pricing

4. **QNSRegistrarSimple.sol**
   - Purpose: Domain registration interface with pricing
   - Functions: Domain registration, pricing calculation, availability checks

---

## 🔧 Frontend Configuration

The web application currently points to the **TESTNET** contracts:

**File:** `apps/web/src/lib/contracts.ts`

```typescript
export const CONTRACTS = {
  QNS_REGISTRY: '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_NFT: '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
  QNS_REGISTRAR: '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b',
  QNS_RESERVED_NAMES: '0x0023272C07514D2D236f6c6895507DFd26442471',
};

export const RPC_URL = 'https://orchard.rpc.quai.network/cyprus1';
```

---

## 🚀 How to Register a Domain

### On Testnet:

```bash
cd packages/contracts
node scripts/test-registration.js
```

### Environment Variables Needed:

```bash
# For Testnet
CYPRUS1_PK=your_private_key_here
QUAI_RPC_URL=https://orchard.rpc.quai.network
CHAIN_ID=15000

# For Mainnet
CYPRUS1_PK=your_private_key_here
QUAI_RPC_URL=https://rpc.quai.network
CHAIN_ID=9
```

---

## 📝 Deployment Files

- **Testnet:** `packages/contracts/deployed-addresses-simple.json`
- **Mainnet:** `packages/contracts/deployed-addresses.json`

---

## ⚠️ Important Notes

1. **All testnet domains** are owned by the deployer address: `0x003DAC94805c77d7fD485cd415F8078414d171e4`

2. **Mainnet contracts are deployed** but awaiting first production domain registrations

3. **Contract version:** Simple/Non-Upgradeable (v2 with name storage)

4. **No upgradeable proxy** - these are direct contract deployments

5. **Social Posts Contract** (separate feature): `0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910`

---

## 🔍 Verification Scripts

Two verification scripts have been created:

1. **check-testnet-domains.js** - Checks testnet contract for registered domains
2. **check-current-domains.js** - Checks mainnet contract for registered domains

Run them with:
```bash
cd packages/contracts
node check-testnet-domains.js
node check-current-domains.js
```

---

**Last Updated:** October 11, 2025  
**Report Status:** ✅ Complete

