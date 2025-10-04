# ✅ Quai Contract Deployment Checklist

Use this checklist to ensure a smooth deployment to Quai Network.

---

## 🎯 Pre-Deployment Setup

### Step 1: Environment Setup
- [ ] Navigate to contracts directory:
  ```bash
  cd /Users/mac/Desktop/CODES/HACKATHON/QUAI_Rocster/QUAI/packages/contracts
  ```

- [ ] Copy environment template:
  ```bash
  cp ENV_EXAMPLE_NEW .env
  ```

- [ ] Edit `.env` file and add your private key (NO 0x prefix):
  ```bash
  nano .env
  ```

- [ ] Verify `.env` configuration:
  - [ ] `PRIVATE_KEY` set (without 0x prefix)
  - [ ] `CYPRUS1_PK` set (without 0x prefix)
  - [ ] `CHAIN_ID` correct (9=Mainnet, 15000=Testnet)
  - [ ] `RPC_URL` correct for target network
  - [ ] Contract parameters set (e.g., `HELLO_GREETING`)

### Step 2: Wallet Verification
- [ ] Verify your address matches the target zone:
  - Cyprus1: Address starts with `0x00...` or `0x10...`
  - Cyprus2: Address starts with `0x01...` or `0x11...`
  - Paxos1: Address starts with `0x02...` or `0x12...`

- [ ] Check wallet balance:
  ```bash
  node scripts/check-balance.ts
  ```

- [ ] Ensure sufficient QUAI tokens:
  - Testnet: Get from [Quai Faucet](https://faucet.quai.network/)
  - Mainnet: Transfer QUAI to deployment address

### Step 3: Compilation
- [ ] Compile contracts:
  ```bash
  npx hardhat compile
  ```

- [ ] Verify compilation success:
  - [ ] No errors in output
  - [ ] `artifacts/` directory created
  - [ ] Contract JSON files present

---

## 🧪 Testnet Deployment (Recommended First)

### Step 1: Configure for Testnet
- [ ] Update `.env` for testnet:
  ```bash
  CHAIN_ID="15000"
  RPC_URL="https://orchard.rpc.quai.network/cyprus1"
  QUAI_RPC_URL="https://orchard.rpc.quai.network/cyprus1"
  ```

### Step 2: Deploy HelloQuai
- [ ] Run testnet deployment:
  ```bash
  pnpm run deploy:hello:testnet
  ```

- [ ] Verify output shows:
  - [ ] ✅ Network configuration displayed
  - [ ] ✅ Deployer address shown
  - [ ] ✅ Balance checked
  - [ ] ✅ Transaction broadcasted
  - [ ] ✅ Contract deployed
  - [ ] ✅ Contract address received
  - [ ] ✅ Verification passed

- [ ] Save deployment information:
  - [ ] Contract address: `____________________`
  - [ ] Transaction hash: `____________________`
  - [ ] Block number: `____________________`
  - [ ] Gas used: `____________________`

### Step 3: Verify on QuaiScan
- [ ] Open [QuaiScan](https://quaiscan.io)
- [ ] Search for contract address
- [ ] Verify contract code is present
- [ ] Check transaction status
- [ ] Confirm contract is on correct network (testnet)

### Step 4: Test Contract Functions
- [ ] Interact with deployed contract:
  ```bash
  # Create a test script or use Hardhat console
  npx hardhat console --network cyprus1_testnet
  ```

- [ ] Test basic functions:
  - [ ] Read greeting
  - [ ] Call contract methods
  - [ ] Verify expected behavior

---

## 🚀 Mainnet Deployment

### Step 1: Final Pre-Deployment Checks
- [ ] ⚠️ Testnet deployment successful
- [ ] ⚠️ All contract functions tested
- [ ] ⚠️ Sufficient mainnet QUAI balance
- [ ] ⚠️ Private key is correct mainnet address
- [ ] ⚠️ Backup wallet private key securely
- [ ] ⚠️ Double-check all contract parameters

### Step 2: Configure for Mainnet
- [ ] Update `.env` for mainnet:
  ```bash
  CHAIN_ID="9"
  RPC_URL="https://rpc.quai.network"
  QUAI_RPC_URL="https://rpc.quai.network"
  ```

- [ ] Verify deployment parameters:
  - [ ] Contract parameters are production-ready
  - [ ] No test/debug values in code
  - [ ] All addresses are correct

### Step 3: Deploy to Mainnet
- [ ] Deploy HelloQuai:
  ```bash
  pnpm run deploy:hello:mainnet
  ```

- [ ] Monitor deployment:
  - [ ] Watch for transaction broadcast
  - [ ] Note transaction hash immediately
  - [ ] Wait for confirmation (may take 1-2 minutes)
  - [ ] Verify success message

- [ ] Record deployment details:
  - [ ] Contract address: `____________________`
  - [ ] Transaction hash: `____________________`
  - [ ] Block number: `____________________`
  - [ ] Gas used: `____________________`
  - [ ] Deployment timestamp: `____________________`

### Step 4: Verify Mainnet Deployment
- [ ] Check on [QuaiScan Mainnet](https://quaiscan.io)
- [ ] Verify contract is on Cyprus1 (or target zone)
- [ ] Check transaction status is "Success"
- [ ] Confirm contract code matches expected

### Step 5: Post-Deployment Testing
- [ ] Test contract on mainnet:
  ```bash
  npx hardhat console --network cyprus1
  ```

- [ ] Verify contract functions:
  - [ ] Read operations work
  - [ ] Write operations work (if applicable)
  - [ ] Events are emitted correctly

---

## 📝 Full System Deployment (QNS + Social)

If deploying your full system (QNS + SocialPosts):

### QNS Contracts Deployment Order
- [ ] 1. Deploy QNSRegistry
- [ ] 2. Deploy QNSController
- [ ] 3. Deploy QNSAuctionManager
- [ ] 4. Deploy QNSReservedNames
- [ ] 5. Deploy QNSNFT
- [ ] 6. Deploy QiPaymentResolver
- [ ] 7. Deploy ReverseRegistrar
- [ ] 8. Initialize all contracts with correct addresses
- [ ] 9. Test QNS registration flow

### Social Contracts
- [ ] 1. Deploy SocialPosts
- [ ] 2. Configure permissions
- [ ] 3. Test post creation

### Integration
- [ ] Update frontend with deployed addresses
- [ ] Update API with contract addresses
- [ ] Test full user flow

---

## 🔧 Troubleshooting

### If Deployment Fails

#### Transaction Timeout
- [ ] Check QuaiScan for transaction status
- [ ] Script will auto-retry (3 attempts)
- [ ] If still failing, check:
  - [ ] RPC URL is correct
  - [ ] Internet connection stable
  - [ ] Wallet has sufficient balance

#### Insufficient Balance
- [ ] Check wallet balance:
  ```bash
  node scripts/check-balance.ts
  ```
- [ ] Fund wallet and retry

#### Nonce Issues
- [ ] Wait for pending transactions to complete
- [ ] Check QuaiScan for pending transactions
- [ ] Clear any stuck transactions

#### Wrong Network/Zone
- [ ] Verify `.env` settings:
  - [ ] `CHAIN_ID` is correct
  - [ ] `RPC_URL` points to correct network
  - [ ] Private key corresponds to correct zone

---

## 📋 Post-Deployment Tasks

### Documentation
- [ ] Save all deployment addresses to a file:
  ```bash
  # Create deployment-addresses.json
  {
    "helloQuai": "0x...",
    "qnsRegistry": "0x...",
    "socialPosts": "0x...",
    ...
  }
  ```

- [ ] Update project documentation
- [ ] Create deployment summary document
- [ ] Record gas costs for future reference

### Frontend Integration
- [ ] Update contract addresses in frontend config
- [ ] Update ABI files if changed
- [ ] Test frontend interactions with contracts
- [ ] Deploy updated frontend

### API Integration
- [ ] Update contract addresses in API config
- [ ] Restart indexer with new addresses
- [ ] Test API endpoints
- [ ] Verify event listening works

### Monitoring
- [ ] Set up contract monitoring (QuaiScan alerts)
- [ ] Monitor transaction activity
- [ ] Watch for errors/reverts
- [ ] Set up uptime monitoring

---

## 🎯 Success Criteria

Your deployment is successful when:

- [x] ✅ All contracts compiled without errors
- [ ] ✅ Testnet deployment successful
- [ ] ✅ Mainnet deployment successful
- [ ] ✅ All contracts verified on QuaiScan
- [ ] ✅ Contract functions tested and working
- [ ] ✅ Frontend connected to contracts
- [ ] ✅ API integrated with contracts
- [ ] ✅ Full user flow tested end-to-end

---

## 📞 Resources

### Documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full guide
- [QUICK_START.md](./QUICK_START.md) - Quick reference
- [BEFORE_VS_AFTER.md](./BEFORE_VS_AFTER.md) - What changed

### External Links
- [Quai Docs](https://docs.qu.ai/)
- [QuaiScan](https://quaiscan.io/)
- [Testnet Faucet](https://faucet.quai.network/)
- [Quai Discord](https://discord.gg/quai)

---

## ⚠️ Important Reminders

### Security
- [ ] ⚠️ Never commit `.env` file with real private keys
- [ ] ⚠️ Use separate wallets for testnet and mainnet
- [ ] ⚠️ Backup private keys securely
- [ ] ⚠️ Use hardware wallet for large amounts

### Best Practices
- [ ] ✅ Always test on testnet first
- [ ] ✅ Verify all addresses match expected zones
- [ ] ✅ Double-check all contract parameters
- [ ] ✅ Monitor gas costs
- [ ] ✅ Keep deployment logs

### Emergency Contacts
- Quai Discord: https://discord.gg/quai
- GitHub Issues: https://github.com/dominant-strategies/quai-docs
- Documentation: https://docs.qu.ai/

---

## 🎊 Congratulations!

Once you've completed this checklist, your contracts are successfully deployed to Quai Network! 🚀

**Next Steps:**
1. Monitor contract activity
2. Integrate with frontend/API
3. Test full user flows
4. Launch to users!

---

**shoyee...** Use this checklist to ensure every deployment goes smoothly! Would you like me to help you work through any specific step? 🚀

