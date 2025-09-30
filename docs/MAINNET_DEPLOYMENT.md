# 🚀 Mainnet Deployment Guide

## Prerequisites

- ✅ All contracts tested on testnet
- ✅ All frontend features working
- ✅ API and indexer functional
- ✅ Mainnet wallet with sufficient QI (minimum 2 QI recommended)
- ✅ Production infrastructure ready (database, Redis, monitoring)

## 📋 Pre-Deployment Checklist

### Security & Infrastructure
- [ ] Multi-sig wallet set up for contract admin
- [ ] Production database provisioned (PostgreSQL)
- [ ] Redis instance configured
- [ ] Domain purchased and DNS configured
- [ ] SSL certificates ready
- [ ] Monitoring tools configured (Sentry, analytics)

### Code Quality
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Gas optimization reviewed
- [ ] Emergency pause functions tested

### Content & Legal
- [ ] Terms of service drafted
- [ ] Privacy policy prepared
- [ ] Content moderation policies defined
- [ ] Reserved QNS names decided

## 🌐 Environment Setup

### 1. Contract Deployment

```bash
# Switch to mainnet RPC
export QUAI_RPC_URL=https://rpc.quai.network

# Set admin to multi-sig wallet
export ADMIN_ADDRESS=0xYourMultiSigAddress

# Deploy contracts
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network quai
```

**Expected Output:**
```
🚀 Deploying to Quai Network (MAINNET)
📍 Chain ID: 9000
👤 Deployer: 0xYourAddress
👑 Admin: 0xYourMultiSigAddress

⚠️  DEPLOYING TO MAINNET - ENSURE YOU HAVE SUFFICIENT FUNDS!
💰 Deployment will cost approximately 0.5-1 QI

⏳ Waiting 5 seconds for confirmation...
QNSRegistry: 0x...
QNSController: 0x...
[etc...]
```

### 2. Update Environment Variables

Copy `mainnet.env.example` to your production environment and fill in the deployed contract addresses.

### 3. Database Setup

```bash
# Create production database
createdb quai_social_prod

# Run migrations
cd apps/api
pnpm run prisma:migrate -- --name init_social_prod
pnpm run prisma:generate
```

### 4. API Deployment

```bash
# Build for production
cd apps/api
pnpm run build

# Start production server (use PM2 or similar)
NODE_ENV=production node dist/index.js
```

### 5. Web App Deployment

```bash
# Build for production
cd apps/web
pnpm run build

# Deploy to Vercel/Netlify/CDN
# Set NEXT_PUBLIC_QUAI_NETWORK=mainnet
```

## 🔍 Post-Deployment Verification

### Contract Verification
```bash
# Verify contracts on QuaiScan
pnpm hardhat verify --network quai CONTRACT_ADDRESS "ConstructorArgs"
```

### API Health Checks
```bash
# Health endpoint
curl https://your-api-domain.com/health

# Posts endpoint
curl https://your-api-domain.com/posts?limit=1
```

### Frontend Testing
- [ ] Wallet connection works
- [ ] QNS search functional
- [ ] Social posting works
- [ ] Contract interactions succeed

## 📊 Monitoring Setup

### Essential Monitoring
1. **Error Tracking**: Sentry integration
2. **Performance**: Response times, error rates
3. **Blockchain**: Contract event monitoring
4. **User Analytics**: PostHog/Mixpanel setup

### Key Metrics to Monitor
- Transaction success rates
- API response times
- User wallet connection rates
- Contract gas usage
- Error rates by feature

## 🚨 Emergency Procedures

### Contract Issues
- Use timelock for upgrades (2-day delay)
- Emergency pause functions available
- Multi-sig governance for critical changes

### API Issues
- Blue-green deployment capability
- Rollback procedures documented
- Database backup verification

### Scaling Considerations
- API rate limiting configured
- Database connection pooling
- CDN for static assets
- Load balancer ready

## 🎯 Go-Live Checklist

- [ ] All contracts deployed and verified
- [ ] API responding correctly
- [ ] Frontend deployed and functional
- [ ] DNS propagation complete
- [ ] SSL certificates valid
- [ ] Monitoring dashboards active
- [ ] Team notified of launch
- [ ] Emergency contacts available
- [ ] Backup procedures tested

## 📞 Support Contacts

- **Technical Issues**: your-email@domain.com
- **User Support**: support@yourdomain.com
- **Security Issues**: security@yourdomain.com

## 🔄 Post-Launch Activities

1. **Monitor for 24 hours** continuously
2. **User feedback collection** begins immediately
3. **Performance optimization** based on real usage
4. **Community building** activities
5. **Grant applications** and partnerships pursued

---

**Remember**: Mainnet deployment is permanent. Triple-check all configurations and test thoroughly before going live!
