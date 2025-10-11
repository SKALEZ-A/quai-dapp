# PHOTON BRIDGE (ENTANGLE) INTEGRATION GUIDE

## ✅ Current Status (October 2025)

**Photon Bridge DOES support QUAI** - This is a LIVE integration announced in February 2025.

- Official Announcement: https://qu.ai/blog/quai-network-announces-strategic-integration-with-entangle/
- Photon Bridge: https://photonbridge.io/
- Entangle Docs: https://docs.entangle.fi/

---

## 🔧 INTEGRATION OPTIONS

### Option 1: Embed Photon Bridge Widget (RECOMMENDED)

Embed the Photon Bridge interface directly in your app using an iframe or redirect.

**Implementation:**
```typescript
// apps/web/app/bridge/page.tsx - Simple Embed
export default function BridgePage() {
  return (
    <div className="min-h-screen">
      <iframe 
        src="https://photonbridge.io/"
        className="w-full h-screen border-0"
        title="Photon Bridge - QUAI Network"
      />
    </div>
  );
}
```

**Pros:**
- ✅ Zero integration effort
- ✅ Always up-to-date with latest features
- ✅ QUAI is already supported
- ✅ Works immediately

**Cons:**
- ❌ Less customization
- ❌ Users leave your domain (for iframe)

---

### Option 2: Use Entangle Bridge SDK (ADVANCED)

Build a custom bridge UI using Entangle's Bridge Frontend SDK.

#### Step 1: Install Dependencies

```bash
cd apps/web
pnpm add @apollo/client@3.8.0-alpha.13 @wagmi/core@2.6.17 wagmi@2.5.13 viem@2.9.4 ethers@^6.11.1
```

#### Step 2: Clone & Study the SDK

```bash
git clone https://github.com/Entangle-Protocol/uts-bridge-frontend-sdk
cd uts-bridge-frontend-sdk
```

**Key Files to Study:**
- `/constants/tokens.ts` - Token configurations
- `/constants/networkConfigs.ts` - Network configurations
- `/blockchain/EVM/provider.ts` - Wagmi setup
- `/containers/Bridge/BridgePage.tsx` - Main bridge UI

#### Step 3: Configure Environment Variables

Create `.env.local` in `apps/web/`:

```bash
# Required for Entangle Bridge
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key
NEXT_PUBLIC_BASE_MESSAGES_URL=https://indexer.mainnet.entangle.fi/graphql

# WalletConnect Project ID (for wagmi)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Quai Network RPC
NEXT_PUBLIC_QUAI_RPC=https://rpc.quai.network/cyprus1
```

**Get API Keys:**
- CoinGecko API: https://www.coingecko.com/en/api/pricing (Free tier available)
- WalletConnect: https://cloud.reown.com/sign-in (Free for most use cases)

#### Step 4: Add Quai Network Configuration

Add Quai Network to your network configs:

```typescript
// Create: apps/web/src/lib/networks.ts
import { defineChain } from 'viem';

export const quaiNetwork = defineChain({
  id: 9000, // Quai mainnet chain ID
  name: 'Quai Network',
  network: 'quai',
  nativeCurrency: {
    decimals: 18,
    name: 'Quai',
    symbol: 'QUAI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.quai.network/cyprus1'],
    },
    public: {
      http: ['https://rpc.quai.network/cyprus1'],
    },
  },
  blockExplorers: {
    default: { name: 'Quaiscan', url: 'https://quaiscan.io' },
  },
  testnet: false,
});
```

#### Step 5: Configure Token for QUAI

According to Entangle's UTS (Universal Token Standard), you need to add QUAI as a supported token:

```typescript
// apps/web/src/lib/bridge-tokens.ts
export const QUAI_TOKEN = {
  tokenText: 'QUAI',
  tokenValue: 'QUAI',
  tokenIcon: '/assets/logo.png',
  contractAddress: 'NATIVE', // Native gas token
  systemLabel: 'TOKEN_9000_QUAI',
  decimals: 18,
  protocol: 'UTS', // Universal Token Standard
  chainId: 9000,
  verified: true,
};

export const QI_TOKEN = {
  tokenText: 'QI',
  tokenValue: 'QI',
  tokenIcon: '/assets/logo.png',
  contractAddress: 'NATIVE',
  systemLabel: 'TOKEN_9000_QI',
  decimals: 18,
  protocol: 'UTS',
  chainId: 9000,
  verified: true,
};
```

#### Step 6: Set Up Wagmi with Quai Support

```typescript
// apps/web/src/lib/wagmi-config.ts
import { http, createConfig } from 'wagmi';
import { mainnet, polygon, base, arbitrum, optimism } from 'wagmi/chains';
import { quaiNetwork } from './networks';

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, base, arbitrum, optimism, quaiNetwork],
  transports: {
    [mainnet.id]: http('https://ethereum-rpc.publicnode.com'),
    [polygon.id]: http('https://polygon-rpc.com'),
    [base.id]: http('https://base.llamarpc.com'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    [optimism.id]: http('https://optimism.llamarpc.com'),
    [quaiNetwork.id]: http(process.env.NEXT_PUBLIC_QUAI_RPC!),
  },
});
```

---

## 🎯 RECOMMENDED APPROACH FOR YOU

Given that:
1. ✅ **Photon Bridge ALREADY supports QUAI** (live since Feb 2025)
2. ✅ **Entangle's SDK is production-ready** with full documentation
3. ⚠️ **Wormhole does NOT yet support QUAI officially**

### I Recommend: **Replace Wormhole with Photon Bridge Embed**

This is the fastest path to get QUAI bridging working **TODAY**:

<function_calls>
<invoke name="read_file">
<parameter name="target_file">/Users/mac/Desktop/CODES/HACKATHON/QUAI_Rocster/QUAI/apps/web/app/dashboard/bridge/page.tsx

