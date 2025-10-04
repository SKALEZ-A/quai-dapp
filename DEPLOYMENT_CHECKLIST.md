# 🚀 Quai Mainnet Deployment Checklist

**Target Launch Date:** _____________  
**Budget Allocated:** $_____________

---

## Week 1: Infrastructure Setup

### Day 1: Database & Cache Setup
- [ ] Create Neon.tech account (FREE tier)
  - URL: https://neon.tech
  - Create new PostgreSQL database
  - Copy connection string
- [ ] Create Upstash account (FREE tier)
  - URL: https://upstash.com
  - Create Redis database
  - Copy connection string
- [ ] Test local connection to both services

### Day 2: Hosting Setup
- [ ] Create Vercel account (FREE)
  - URL: https://vercel.com
  - Connect GitHub repository
  - Configure build settings
- [ ] Create Railway account
  - URL: https://railway.app
  - Or use Render.com as alternative
  - Prepare for API deployment
- [ ] Create web3.storage account (FREE)
  - URL: https://web3.storage
  - Get API token for IPFS pinning

### Day 3: Environment Configuration
- [ ] Update `apps/api/.env` with production values:
  ```env
  DATABASE_URL=postgresql://...from neon.tech...
  REDIS_URL=redis://...from upstash...
  WEB3_STORAGE_TOKEN=...from web3.storage...
  NODE_ENV=production
  PORT=4000
  ```
- [ ] Update `apps/web/.env.local` with production values:
  ```env
  NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
  NEXT_PUBLIC_QUAI_RPC_URL=https://rpc.quai.network/cyprus1
  NEXT_PUBLIC_CHAIN_ID=9000
  ```
- [ ] Test API locally with production database
- [ ] Run database migrations:
  ```bash
  cd apps/api
  pnpm run prisma:migrate deploy
  ```

### Day 4-5: Security Scanning
- [ ] Install Slither
  ```bash
  pip3 install slither-analyzer
  ```
- [ ] Run Slither on all contracts:
  ```bash
  cd packages/contracts
  slither . --exclude-dependencies
  ```
- [ ] Review and fix any HIGH or MEDIUM issues
- [ ] Install MythX CLI (optional)
  ```bash
  npm install -g mythxcli
  ```
- [ ] Run MythX scan (optional)
- [ ] Document all findings and fixes

### Day 6-7: Bridge Integration
- [ ] Choose bridge approach:
  - [ ] **Option A:** Deep-link to existing bridge (FASTEST)
  - [ ] **Option B:** Wormhole SDK integration (BETTER UX)
  - [ ] **Option C:** Multi-bridge aggregator (BEST LONG-TERM)

**For Option A (Deep-Link):**
- [ ] Update `apps/web/app/dashboard/bridge/page.tsx`
- [ ] Add external link to partner bridge
- [ ] Pass user address and amount via URL params
- [ ] Test on testnet

**For Option B (Wormhole SDK):**
- [ ] Install Wormhole SDK:
  ```bash
  cd apps/web
  pnpm add @wormhole-foundation/sdk
  ```
- [ ] Create `src/lib/bridge/wormhole.ts`
- [ ] Implement quote and transfer functions
- [ ] Update bridge UI to use real provider
- [ ] Test on testnet

---

## Week 2: Testing & Deployment Prep

### Day 8: Testnet Deployment
- [ ] Get testnet tokens from Quai faucet
  - URL: https://faucet.qu.ai (check Discord if not available)
- [ ] Set testnet environment variables:
  ```env
  QUAI_RPC_URL=https://orchard.rpc.quai.network/cyprus1
  CHAIN_ID=9000
  ```
- [ ] Deploy all contracts to Orchard testnet:
  ```bash
  cd packages/contracts
  cp ENV_EXAMPLE .env
  # Fill in your testnet private key
  pnpm hardhat run scripts/deploy.ts --network quai
  ```
- [ ] Save all deployed contract addresses
- [ ] Verify contracts on testnet explorer

### Day 9: End-to-End Testing
- [ ] Test wallet connection (Pelagus)
- [ ] Test QNS features:
  - [ ] Search for name availability
  - [ ] Register a name (8+ chars, fixed price)
  - [ ] View registered name
  - [ ] Update resolver records
- [ ] Test Social features:
  - [ ] Create a post
  - [ ] View post feed
  - [ ] Like/engage with posts
  - [ ] Tip a user
- [ ] Test Bridge:
  - [ ] Get quote for transfer
  - [ ] Execute test transfer
  - [ ] Verify status tracking
- [ ] Document any bugs or issues

### Day 10: Multi-Sig Setup
- [ ] Create Gnosis Safe wallet
  - URL: https://app.safe.global/
  - Choose Quai Network (if available) or use multi-sig contract
- [ ] Add 2-3 trusted signers
- [ ] Set 2-of-3 threshold
- [ ] Document recovery procedures
- [ ] Set this address as `ADMIN_ADDRESS` for mainnet

### Day 11: Production Deployment Prep
- [ ] Create mainnet private key (SECURE!)
  - Use hardware wallet if possible
  - Or generate new key with strong security
- [ ] Fund mainnet deployer wallet
  - Need ~2-3 QI for deployment
  - Purchase on exchange or request from team
- [ ] Update mainnet environment variables
- [ ] Create deployment runbook (step-by-step)
- [ ] Set up monitoring:
  - [ ] Create Sentry account (FREE tier)
  - [ ] Add Sentry DSN to .env
  - [ ] Test error reporting

### Day 12: Deploy API & Frontend
- [ ] Deploy API to Railway:
  ```bash
  cd apps/api
  # Push to GitHub
  # Connect Railway to repository
  # Add environment variables in Railway dashboard
  # Deploy
  ```
- [ ] Test API endpoints:
  ```bash
  curl https://your-api.railway.app/health
  curl https://your-api.railway.app/posts?limit=5
  ```
- [ ] Deploy Frontend to Vercel:
  ```bash
  cd apps/web
  # Push to GitHub
  # Connect Vercel to repository
  # Add environment variables in Vercel dashboard
  # Deploy
  ```
- [ ] Test frontend deployment
- [ ] Configure custom domain (optional)

### Day 13-14: Final Pre-Launch

- [ ] Review all environment variables
- [ ] Test API + Frontend integration
- [ ] Set up database backups
- [ ] Create emergency procedures document
- [ ] Prepare launch announcement
- [ ] Set up monitoring dashboards
- [ ] Final security review

---

## Week 3: MAINNET LAUNCH 🚀

### Day 15: CONTRACT DEPLOYMENT

**Morning (9-11 AM):**
- [ ] **Final Checklist:**
  - [ ] Multi-sig wallet ready ✓
  - [ ] Deployer wallet funded (2-3 QI) ✓
  - [ ] All environment variables set ✓
  - [ ] Team on standby ✓
  - [ ] Monitoring active ✓

- [ ] **Deploy Contracts:**
  ```bash
  cd packages/contracts
  cp mainnet.env.example .env
  # Fill in mainnet values:
  # PRIVATE_KEY=your_secure_private_key
  # ADMIN_ADDRESS=your_multisig_address
  # QUAI_RPC_URL=https://rpc.quai.network/cyprus1
  # CHAIN_ID=9000
  
  pnpm hardhat run scripts/deploy.ts --network quai
  ```

- [ ] **Record Deployment:**
  - [ ] QNSRegistry: _________________
  - [ ] QNSController: _________________
  - [ ] QNSAuctionManager: _________________
  - [ ] QNSReservedNames: _________________
  - [ ] QNSNFT: _________________
  - [ ] QiPaymentResolver: _________________
  - [ ] ReverseRegistrar: _________________
  - [ ] SocialPosts: _________________

**Afternoon (12-3 PM):**
- [ ] Verify all contracts on QuaiScan:
  ```bash
  pnpm hardhat verify --network quai <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
  ```
- [ ] Test contract interactions:
  - [ ] Call view functions
  - [ ] Execute test transaction
  - [ ] Verify events emitted

**Evening (4-6 PM):**
- [ ] Update frontend with contract addresses
- [ ] Update API with contract addresses
- [ ] Restart indexer with mainnet contracts
- [ ] Deploy updated frontend
- [ ] Full system test on mainnet

### Day 16: SOFT LAUNCH

- [ ] Invite 10-20 beta testers
- [ ] Provide test instructions
- [ ] Monitor for errors:
  - [ ] Check Sentry for exceptions
  - [ ] Monitor API logs
  - [ ] Watch blockchain transactions
  - [ ] Check database for issues

- [ ] Gather feedback:
  - [ ] Create feedback form
  - [ ] Set up Discord channel
  - [ ] Monitor Twitter mentions

- [ ] Quick fixes:
  - [ ] Address critical bugs immediately
  - [ ] Document non-critical issues
  - [ ] Plan patches

### Day 17-18: PUBLIC LAUNCH

**Pre-Launch:**
- [ ] Prepare announcement content:
  - [ ] Twitter thread
  - [ ] Blog post
  - [ ] Discord announcement
  - [ ] Product Hunt submission
  - [ ] Reddit post (r/QuaiNetwork)

**Launch (Day 17):**
- [ ] 🐦 Post Twitter announcement
- [ ] 📱 Share on Discord (Quai community)
- [ ] 🌐 Submit to Product Hunt
- [ ] 📧 Email beta testers
- [ ] 💬 Engage with comments

**Post-Launch (Day 18+):**
- [ ] Monitor usage metrics:
  - [ ] Unique users
  - [ ] Transactions
  - [ ] QNS registrations
  - [ ] Social posts
  - [ ] Bridge volume
- [ ] Respond to community
- [ ] Address issues quickly
- [ ] Celebrate wins! 🎉

---

## Week 4: Post-Launch Operations

### Day 19-21: Stabilization
- [ ] Monitor error rates
- [ ] Optimize performance bottlenecks
- [ ] Implement user feedback
- [ ] Update documentation
- [ ] Create user guides

### Day 22-25: Growth Initiatives
- [ ] Apply for Quai Builder Sprint
- [ ] Engage with Quai ecosystem
- [ ] Content creation (tutorials, demos)
- [ ] Community building
- [ ] Partnership outreach

### Day 26-30: Grant Application Prep
- [ ] Collect metrics:
  - [ ] Total users: _______
  - [ ] QNS registrations: _______
  - [ ] Daily active users: _______
  - [ ] Total transactions: _______
  - [ ] Community size: _______

- [ ] Prepare grant application:
  - [ ] Project description
  - [ ] Impact metrics
  - [ ] Roadmap
  - [ ] Budget request
  - [ ] Team information

- [ ] Submit Quai Genesis Grant application
  - URL: https://chrononetwork.io/genesis.html

---

## Emergency Contacts

### Critical Issues
- **Smart Contract Emergency:** Pause via multi-sig
- **API Down:** Check Railway status, restart service
- **Database Issues:** Check Neon.tech dashboard
- **Frontend Down:** Check Vercel deployment logs

### Team Contacts
- **Tech Lead:** _________________
- **Smart Contract Dev:** _________________
- **Frontend Dev:** _________________
- **Operations:** _________________

### External Support
- **Quai Discord:** https://discord.gg/quai
- **Emergency Channel:** #developer-support
- **Hosting Support:** Railway/Vercel support channels

---

## Success Criteria

### Week 1 (Launch Week)
- [ ] 50+ unique wallet connections
- [ ] 10+ QNS registrations
- [ ] 25+ social posts created
- [ ] 0 critical bugs
- [ ] <1% error rate

### Month 1
- [ ] 500+ unique users
- [ ] 100+ QNS registrations
- [ ] 1,000+ social interactions
- [ ] 10+ successful bridge transactions
- [ ] 50+ daily active users

### Month 3 (Grant Application)
- [ ] 2,500+ unique users
- [ ] 500+ QNS domains
- [ ] 10,000+ social interactions
- [ ] 100+ daily active users
- [ ] Active Discord community (200+ members)
- [ ] Partnership with 2+ projects

---

## Budget Tracker

### Infrastructure (Monthly)
- [ ] Database (Neon.tech): $______/month
- [ ] Redis (Upstash): $______/month
- [ ] API Hosting (Railway): $______/month
- [ ] IPFS (web3.storage): $______/month
- [ ] Domain: $______/year
- **Total Monthly:** $______

### One-Time Costs
- [ ] Smart contract deployment: $______
- [ ] Security audit: $______
- [ ] Development work: $______
- [ ] Marketing: $______
- **Total One-Time:** $______

### Grant Funding Target
- [ ] Applied: Yes / No
- [ ] Target Amount: $______
- [ ] Status: _________________

---

## Notes & Learnings

### What Went Well
- 
- 
- 

### Challenges Faced
- 
- 
- 

### Improvements for Next Time
- 
- 
- 

---

**Last Updated:** _______________  
**Status:** _______________  
**Next Review:** _______________

