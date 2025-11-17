# 🚀 Deployment Guide

## Overview

This guide covers deploying the Quai Superapp to production.

---

## Deployment Options

### 1. **Quick Deploy (Recommended for Testing)**
- **Time:** 30 minutes
- **Cost:** $0-25/month
- **Platform:** Vercel + Supabase
- **Best for:** Development, testing, MVP

### 2. **Production Deploy**
- **Time:** 2-4 hours  
- **Cost:** $50-200/month
- **Platform:** Custom hosting (DigitalOcean/Railway)
- **Best for:** Production, scaling, full control

---

## Quick Deploy (Vercel + Supabase)

### Step 1: Database Setup (10 min)

**Sign up for Supabase:**
```
1. Visit https://supabase.com
2. Create account
3. Create new project
4. Copy connection string from Settings → Database
```

### Step 2: Frontend Deploy (10 min)

**Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel

# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_QNS_REGISTRY_ADDRESS=0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61
NEXT_PUBLIC_SOCIAL_CONTRACT_ADDRESS=0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910
```

### Step 3: API Deploy (10 min)

**Deploy to Railway:**
```
1. Visit https://railway.app
2. Connect GitHub repository
3. Select apps/api folder
4. Add environment variables
5. Deploy
```

**Environment Variables:**
```env
DATABASE_URL=your-supabase-connection-string
PORT=4000
NODE_ENV=production
QUAI_RPC_URL=https://rpc.quai.network/cyprus1
QNS_REGISTRY_ADDRESS=0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61
SOCIAL_CONTRACT_ADDRESS=0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910
```

### Step 4: Database Migration

```bash
cd apps/api
DATABASE_URL=your-supabase-url pnpm prisma migrate deploy
```

---

## Production Deploy (Full Control)

### Prerequisites

- [ ] DigitalOcean/AWS account
- [ ] Domain name
- [ ] SSL certificates
- [ ] Budget allocated

### Infrastructure Setup

#### 1. PostgreSQL Database

**DigitalOcean Managed Database:**
```
1. Create → Databases → PostgreSQL
2. Choose plan: $15-60/month
3. Region: Closest to users
4. Copy connection details
```

**Configuration:**
```env
DATABASE_URL=postgresql://user:pass@host:25060/database?sslmode=require
```

#### 2. Redis Cache

**DigitalOcean Managed Redis:**
```
1. Create → Databases → Redis
2. Choose plan: $15-60/month
3. Same region as PostgreSQL
4. Copy connection string
```

#### 3. API Hosting

**Option A: DigitalOcean App Platform**
```
1. Create → Apps
2. Connect GitHub
3. Select apps/api
4. Set env variables
5. Deploy: $12/month
```

**Option B: DigitalOcean Droplet**
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install dependencies
apt update && apt install nodejs npm nginx

# Clone repo
git clone your-repo
cd quai/apps/api

# Install & build
npm install
npm run build

# Setup PM2
npm i -g pm2
pm2 start dist/index.js --name quai-api
pm2 save
pm2 startup
```

#### 4. Frontend Hosting

**Vercel (Recommended):**
- Auto-deploy from GitHub
- Edge network
- Free SSL
- $0-20/month

**Alternative - DigitalOcean:**
```bash
# Build locally
cd apps/web
npm run build

# Upload to Spaces
# Configure Nginx
# Setup SSL
```

---

## Contract Deployment

### Testnet Deploy

```bash
cd packages/contracts

# Ensure wallet has testnet QI
# Check: https://quaiscan.io/address/YOUR_ADDRESS

# Deploy all contracts
pnpm hardhat run scripts/deploy.ts --network cyprus1_testnet

# Save contract addresses to .env
```

### Mainnet Deploy

**⚠️ Pre-deployment Checklist:**
- [ ] Contracts audited
- [ ] Tests passing (100% coverage)
- [ ] Deployment script tested on testnet
- [ ] Sufficient mainnet QI for gas (5-10 QUAI)
- [ ] Backup deployer private key
- [ ] Team ready to monitor

```bash
cd packages/contracts

# Deploy to mainnet
pnpm hardhat run scripts/deploy.ts --network quai

# Verify contracts on QuaiScan
pnpm hardhat verify --network quai CONTRACT_ADDRESS

# Update all environment files with mainnet addresses
```

---

## Environment Configuration

### Production Environment Variables

**apps/api/.env.production:**
```env
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Quai Network
QUAI_RPC_URL=https://rpc.quai.network/cyprus1
QUAI_NETWORK=mainnet

# Contracts (Update after deployment)
QNS_REGISTRY_ADDRESS=0x...
QNS_REGISTRAR_ADDRESS=0x...
SOCIAL_CONTRACT_ADDRESS=0x...

# API
NODE_ENV=production
PORT=4000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional
WEB3_STORAGE_TOKEN=your_token
SENTRY_DSN=your_sentry_dsn
```

**apps/web/.env.production:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_QUAI_NETWORK=mainnet
NEXT_PUBLIC_QNS_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_SOCIAL_CONTRACT_ADDRESS=0x...
```

---

## Post-Deployment

### 1. Smoke Tests

```bash
# Health check
curl https://api.yourdomain.com/health

# Test endpoints
curl https://api.yourdomain.com/posts
curl https://api.yourdomain.com/profiles

# Frontend
open https://yourdomain.com
```

### 2. Monitoring Setup

**Sentry (Error Tracking):**
```bash
npm install @sentry/node @sentry/nextjs

# Configure in apps/api/src/index.ts
# Configure in apps/web/next.config.js
```

**Uptime Monitoring:**
- UptimeRobot: https://uptimerobot.com (Free)
- Pingdom: https://pingdom.com

### 3. Analytics

**Google Analytics:**
```bash
# Add to apps/web/app/layout.tsx
```

**Custom Analytics:**
```bash
# Track user actions
# Monitor performance
# Analyze usage patterns
```

---

## Scaling

### When to Scale

**Signs you need to scale:**
- Response times > 500ms
- Database queries slow
- High CPU usage
- Memory limits reached
- More than 1000 daily active users

### Scaling Strategy

**Database:**
- Upgrade to larger plan
- Add read replicas
- Implement caching
- Optimize queries

**API:**
- Horizontal scaling (more instances)
- Load balancer
- CDN for static assets
- Optimize code

**Frontend:**
- Use Vercel Edge Network
- Image optimization
- Code splitting
- Bundle optimization

---

## Backup & Recovery

### Database Backups

**Automated:**
```bash
# Supabase: Automatic daily backups
# DigitalOcean: Enable automatic backups
```

**Manual:**
```bash
# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore database  
psql $DATABASE_URL < backup-20250101.sql
```

### Contract Backups

- Keep deployment scripts in git
- Save contract ABIs
- Document contract addresses
- Backup deployer keys securely

---

## Security Checklist

### Pre-Launch
- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Secure headers configured
- [ ] Secrets rotated

### Post-Launch
- [ ] Monitor error logs
- [ ] Review access logs
- [ ] Check for vulnerabilities
- [ ] Update dependencies
- [ ] Audit smart contracts
- [ ] Pen testing completed

---

## Troubleshooting

### Common Issues

**"Cannot connect to database"**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL

# Verify SSL mode
# Check firewall rules
```

**"RPC not responding"**
```bash
# Try alternative RPC
# Check network status
# Verify RPC URL in .env
```

**"Contract call failed"**
```bash
# Verify contract addresses
# Check gas limits
# Ensure wallet has funds
# Validate ABI files
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates
- Check uptime
- Review logs

**Weekly:**
- Review performance metrics
- Check database size
- Update dependencies (if needed)

**Monthly:**
- Security audit
- Backup verification
- Cost optimization review

---

## Cost Optimization

### Development Stage
```
Supabase Free:    $0/month
Vercel Free:      $0/month
Total:            $0/month
```

### Production Stage (Small)
```
Supabase Pro:     $25/month
Vercel Pro:       $20/month
Monitoring:       $0/month (free tiers)
Total:            $45/month
```

### Production Stage (Medium)
```
Database:         $60/month
Redis:            $60/month
API Hosting:      $24/month
Frontend:         $20/month
Monitoring:       $10/month
Total:            $174/month
```

---

## Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **DigitalOcean Docs:** https://docs.digitalocean.com
- **Railway Docs:** https://docs.railway.app
- **Quai Docs:** https://docs.qu.ai/
