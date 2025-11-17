# 🌐 QNS (Quai Name Service) Guide

## Overview

QNS provides human-readable names for Quai Network addresses, similar to ENS on Ethereum.

**Example:** `alice.quai` → `0x003DAC...171e4`

---

## Features

### ✅ Domain Registration
- Register `.quai` domains
- Pricing based on length (5-50 QUAI)
- Instant registration (no auction)
- NFT ownership

### ✅ Domain Management
- Transfer domains
- Update resolver records
- Set reverse resolution
- Manage subdomains

### ✅ Reserved Names
- Protected brand names
- Verified entity claims
- Governance-managed list

---

## Contract Addresses (Testnet)

```
Registry:         0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61
NFT:              0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2
Registrar:        0x0054100a03BE551B4a39f0Fea5cC83699171BFDE
Reserved Names:   0x00629264745465e0A56A9EdAaEB0B4B9DE719aff
```

---

## Pricing Structure

| Length | Price (QUAI) | Example |
|--------|--------------|---------|
| 3 chars | 50 QUAI | `bob.quai` |
| 4 chars | 20 QUAI | `alice.quai` |
| 5+ chars | 5 QUAI | `myname.quai` |

---

## How to Register a Domain

### Via Frontend

1. **Connect Wallet**
   - Go to http://localhost:3000/qns/profile
   - Click "Connect Wallet"
   - Approve in Pelagus

2. **Search Domain**
   - Enter desired name
   - Check availability
   - View pricing

3. **Register**
   - Click "Register Domain"
   - Approve transaction
   - Wait for confirmation

### Via Smart Contract

```javascript
import { QNSRegistrar } from './contracts';

// Register domain
const tx = await registrar.register(
  'myname',
  { value: ethers.utils.parseEther('5.0') }
);
await tx.wait();
```

---

## Domain Management

### View Your Domains

Navigate to `/dashboard/overview` to see all your registered domains with options to:
- Copy domain name
- Transfer ownership
- Configure settings

### Set Resolver

```javascript
// Set resolver for domain
await registry.setResolver(
  ethers.utils.namehash('myname.quai'),
  resolverAddress
);
```

### Transfer Domain

```javascript
// Transfer domain ownership
await nft.transferFrom(
  fromAddress,
  toAddress,
  tokenId
);
```

---

## Technical Implementation

### Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Registrar  │────→│   Registry   │
└─────────────┘     └──────┬───────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌──────────────┐
│   QNS NFT   │     │   Resolver   │
└─────────────┘     └──────────────┘
```

### Key Functions

**QNSRegistrar:**
- `register(name)` - Register new domain
- `available(name)` - Check availability
- `getPrice(name)` - Get registration price

**QNSRegistry:**
- `owner(node)` - Get domain owner
- `resolver(node)` - Get domain resolver
- `setResolver(node, resolver)` - Update resolver

**QNSNFT:**
- `mint(to, tokenId)` - Mint domain NFT
- `ownerOf(tokenId)` - Get NFT owner

---

## Frontend Integration

### Check Domain Availability

```typescript
import { checkDomainAvailability } from '@/lib/qns';

const isAvailable = await checkDomainAvailability('myname');
```

### Register Domain

```typescript
import { registerDomain } from '@/lib/qns';

const tx = await registerDomain('myname');
await tx.wait();
```

### Get User Domains

```typescript
import { getUserDomains } from '@/lib/qns';

const domains = await getUserDomains(userAddress);
```

---

## Error Handling

### Common Errors

**"Domain already registered"**
- Someone else owns this domain
- Try a different name

**"Insufficient funds"**
- Need more QUAI for registration
- Get testnet QUAI from faucet

**"Invalid domain name"**
- Names must be 3+ characters
- Only letters and numbers
- No special characters

**"Transaction failed"**
- Check gas limits
- Verify contract addresses
- Ensure wallet has QUAI

---

## Testing

### Test Registration Flow

```bash
# Run test script
cd packages/contracts
npx hardhat run scripts/test-registration.js --network cyprus1_testnet
```

### Test Contract Permissions

```bash
# Check admin roles
npx hardhat run scripts/check-admin-roles.js --network cyprus1_testnet
```

### Validate Deployment

```bash
# Run validation
node scripts/validate-deployment.js
```

---

## Best Practices

### For Users
1. Choose memorable domain names
2. Keep domains short for lower gas costs
3. Transfer domains securely
4. Back up your wallet

### For Developers
1. Always check availability before registration
2. Handle transaction errors gracefully
3. Show clear pricing to users
4. Implement proper loading states
5. Use correct contract addresses

---

## Security Considerations

- **Wallet Security:** Never share private keys
- **Domain Transfers:** Verify recipient address
- **Reserved Names:** Some names are protected
- **Gas Limits:** Set appropriate limits
- **Contract Verification:** Use verified contracts only

---

## Troubleshooting

### Registration Not Working

1. **Check Wallet Balance**
   ```bash
   # Visit QuaiScan
   https://quaiscan.io/address/YOUR_ADDRESS
   ```

2. **Verify Contract Addresses**
   - Ensure .env has correct addresses
   - Match with deployment output

3. **Check Network**
   - Connected to Cyprus-1 testnet
   - RPC is responding

### Domains Not Displaying

1. **Refresh Browser**
2. **Clear Cache**
3. **Check API Connection**
4. **Verify Contract Events**

---

## Future Enhancements

- Subdomain support
- Batch registration
- Domain marketplace
- Reverse resolution UI
- Mobile app integration
- Domain analytics

---

## Resources

- **QuaiScan:** https://quaiscan.io
- **Faucet:** https://faucet.quai.network/
- **Quai Docs:** https://docs.qu.ai/
- **Quai Discord:** https://discord.gg/quai
