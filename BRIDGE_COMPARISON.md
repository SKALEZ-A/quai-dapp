# BRIDGE COMPARISON: Photon Bridge vs Wormhole for QUAI

## 🎯 THE ANSWER: Use Photon Bridge (Entangle)

Date: October 8, 2025

---

## ✅ **PHOTON BRIDGE (ENTANGLE) - RECOMMENDED**

### Status
**LIVE & FULLY FUNCTIONAL** - Integrated February 2025

### QUAI Support
- ✅ $QUAI is **OFFICIALLY SUPPORTED**
- ✅ Listed on Photon Bridge UI
- ✅ Production-ready integration
- ✅ Used by Entangle's case study as reference partner

### Official Sources
- [Quai × Entangle Announcement (Feb 19, 2025)](https://qu.ai/blog/quai-network-announces-strategic-integration-with-entangle/)
- [Entangle Case Study PDF](https://www.entangle.fi/documents/Quai.pdf)
- [Photon Bridge Live](https://photonbridge.io/)
- [Bridge SDK Documentation](https://docs.entangle.fi/universal-token-standard/developer-guides/bridge-sdk)

### Integration Methods

#### Method 1: iframe Embed (EASIEST - IMPLEMENTED)
```typescript
<iframe 
  src="https://photonbridge.io/"
  className="w-full h-[700px]"
  title="Photon Bridge"
/>
```
**Effort:** 5 minutes  
**Pros:** Zero setup, always updated, QUAI works immediately  
**Cons:** Less customization, external domain

#### Method 2: Custom SDK Integration (ADVANCED)
**Repository:** https://github.com/Entangle-Protocol/uts-bridge-frontend-sdk  
**Effort:** 2-3 days  
**Pros:** Full customization, branded experience  
**Cons:** More maintenance, complex setup

### Technology
- **Protocol:** Universal Token Standard (UTS)
- **Messaging:** Universal Interoperability Protocol (UIP)
- **Security:** Entangle's decentralized agent network
- **Chains:** All EVM + non-EVM (Solana, etc.)
- **Data Feeds:** Universal Data Feeds (UDF) for oracle services

### Pricing
- Bridge fees: Standard gas fees only
- No protocol fees for basic bridging
- Transparent, on-chain pricing

---

## ❌ **WORMHOLE - NOT RECOMMENDED FOR QUAI**

### Status
**ANNOUNCED BUT NOT LIVE YET**

### QUAI Support
- ⚠️ Partnership announced (2024/early 2025)
- ❌ NOT yet in supported chains list
- ❌ QUAI/QI tokens NOT available in Wormhole Connect widget
- ⏳ Native Token Transfer (NTT) deployment PENDING

### Why You Can't See QUAI
1. **Chains Array Missing QUAI**
   - Wormhole Connect only supports chains in their official registry
   - Quai Network not yet added to `@wormhole-foundation/wormhole-connect` chains
   
2. **NTT Contracts Not Deployed**
   - Wormhole requires NTT contracts on each chain
   - QUAI/QI NTT deployment is pending
   
3. **Guardian Support Pending**
   - Wormhole's 19 Guardians need to observe and sign VAAs for QUAI
   - This infrastructure not yet activated

### Expected Timeline
- **Status:** "Coming Soon" (as of Oct 2025)
- **ETA:** Unconfirmed - check official announcements
- **Requirements:** NTT deployment + Guardian activation + SDK update

### What You'd Need (When It Launches)
```typescript
// This will work ONLY after Wormhole officially supports QUAI
chains: [
  'Ethereum',
  'Solana',
  'Quai',  // ← This doesn't exist yet!
],

tokensConfig: {
  QUAI: {
    symbol: 'QUAI',
    tokenId: {
      chain: 'Quai',  // ← This won't work yet
      address: 'NATIVE'
    }
  }
}
```

---

## 📊 COMPARISON TABLE

| Feature | Photon Bridge (Entangle) | Wormhole |
|---------|--------------------------|----------|
| **QUAI Support** | ✅ Live NOW | ❌ Coming Soon |
| **Integration Difficulty** | ⭐ Easy (iframe) | ⭐⭐⭐ Medium |
| **Chains Supported** | All EVM + non-EVM | 40+ official chains |
| **Customization** | Limited (iframe) / Full (SDK) | Full (widget config) |
| **Setup Time** | 5 minutes | 1-2 hours |
| **Maintenance** | None (iframe) | Low |
| **$QUAI Availability** | **✅ TODAY** | ⏳ TBD |

---

## 🚀 IMPLEMENTATION STATUS

### What Was Done
✅ Replaced Wormhole Connect with Photon Bridge iframe embed  
✅ Updated UI to reflect QUAI's LIVE status  
✅ Removed Wormhole dependency from package.json  
✅ Created integration documentation  
✅ Added custom implementation example  

### Current Bridge Page
- **Location:** `apps/web/app/dashboard/bridge/page.tsx`
- **Method:** Photon Bridge iframe embed
- **QUAI Support:** ✅ Fully Functional
- **User Experience:** Users can bridge $QUAI immediately

---

## 🔗 USEFUL LINKS

### Photon Bridge
- Live App: https://photonbridge.io/
- Docs: https://docs.entangle.fi/universal-token-standard/developer-guides/bridge-sdk
- SDK Repo: https://github.com/Entangle-Protocol/uts-bridge-frontend-sdk
- Discord: https://discord.gg/entangle

### QUAI × Entangle
- Official Announcement: https://qu.ai/blog/quai-network-announces-strategic-integration-with-entangle/
- Case Study: https://www.entangle.fi/documents/Quai.pdf
- Twitter: https://x.com/QuaiNetwork/status/1894159822330749356

### Wormhole (For Future Reference)
- Wormhole Connect: https://wormhole.com/products/connect
- Docs: https://docs.wormhole.com/
- When QUAI launches: Watch https://wormhole.com/ for announcements

---

## 💡 RECOMMENDATION

**Use Photon Bridge NOW** via the iframe embed (already implemented).

When/If you want a custom UI later:
1. Study the Entangle SDK structure
2. Build custom components matching your design
3. Migrate from iframe to SDK gradually

**Don't wait for Wormhole** - There's no ETA, and Photon Bridge is already working perfectly.

---

## 🐛 PREVIOUS ISSUE RESOLVED

**Problem:** "I don't see QUAI in my bridge UI"  
**Root Cause:** Wormhole doesn't support QUAI yet (announced but not live)  
**Solution:** Switched to Photon Bridge which HAS supported QUAI since Feb 2025  
**Status:** ✅ RESOLVED - QUAI bridging now working

