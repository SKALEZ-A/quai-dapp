# 🌊 DigitalOcean Setup Guide for QUAI Social DApp

## ✅ Yes! You Can Use DigitalOcean Instead of Supabase

DigitalOcean is actually a **great choice** for hosting your production database and infrastructure. Here's everything you need to know.

---

## 🎯 What You'll Set Up on DigitalOcean

### Required Services:
1. **Managed PostgreSQL Database** - Main database
2. **Managed Redis** - Real-time features, caching, sessions
3. **Droplet or App Platform** - API hosting
4. **Spaces (Optional)** - File storage for images/media

### Cost Estimate:
- PostgreSQL: Starting at $15/month (1GB RAM, 10GB storage)
- Redis: Starting at $15/month (1GB RAM)
- Droplet: Starting at $6/month (1GB RAM)
- **Total: ~$36/month** (vs Supabase free tier)

---

## 📋 Step-by-Step Setup

### Part 1: Create Managed PostgreSQL Database

#### Step 1: Create Database Cluster
1. Log into DigitalOcean: https://cloud.digitalocean.com
2. Click **"Create"** → **"Databases"**
3. Choose **PostgreSQL** (latest version, e.g., 16)
4. Select datacenter region (choose closest to your users)
5. Choose plan:
   - **Development:** Basic - $15/month (1GB RAM, 10GB storage)
   - **Production:** Professional - $60/month (4GB RAM, 38GB storage)
6. Name your database: `quai-social-db`
7. Click **"Create Database Cluster"**

#### Step 2: Configure Database
1. Wait 3-5 minutes for provisioning
2. Go to **"Users & Databases"** tab
3. Create database: `quai_social`
4. Create user (optional): `quai_admin` with strong password

#### Step 3: Get Connection Details
1. Go to **"Connection Details"** tab
2. Select **"Connection String"**
3. Copy the connection string:
   ```
   postgresql://doadmin:[PASSWORD]@[HOST]:25060/quai_social?sslmode=require
   ```

#### Step 4: Configure Trusted Sources
1. Go to **"Settings"** tab
2. Under **"Trusted Sources"**, add:
   - Your local IP (for development)
   - Your API server IP (for production)
   - Or select **"Allow all"** (less secure, but easier for testing)

---

### Part 2: Create Managed Redis

#### Step 1: Create Redis Cluster
1. Click **"Create"** → **"Databases"**
2. Choose **Redis** (latest version)
3. Select same datacenter as PostgreSQL
4. Choose plan:
   - **Development:** Basic - $15/month (1GB RAM)
   - **Production:** Professional - $60/month (4GB RAM)
5. Name: `quai-social-redis`
6. Click **"Create Database Cluster"**

#### Step 2: Get Redis Connection String
1. Wait for provisioning
2. Go to **"Connection Details"**
3. Copy the connection string:
   ```
   rediss://default:[PASSWORD]@[HOST]:25061
   ```

---

### Part 3: Update Your Environment Variables

#### Update `apps/api/.env`:
```env
# API Configuration
PORT=4000
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:3000

# DigitalOcean PostgreSQL
DATABASE_URL=postgresql://doadmin:[PASSWORD]@[HOST]:25060/quai_social?sslmode=require

# DigitalOcean Redis
REDIS_URL=rediss://default:[PASSWORD]@[HOST]:25061

# Quai Network Configuration
QUAI_RPC_URL=https://orchard.rpc.quai.network
QUAI_NETWORK=testnet

# Contract Addresses (already configured)
QNS_REGISTRY_ADDRESS=0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61
QNS_CONTROLLER_ADDRESS=0x0020331A51B939f5e8286541F0C6c38530909782
SOCIAL_CONTRACT_ADDRESS=0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910

# IPFS/Web3 Storage (optional)
WEB3_STORAGE_TOKEN=your_token_here
```

---

### Part 4: Run Database Migrations

```bash
cd apps/api

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run migrations to DigitalOcean database
pnpm prisma:migrate

# Verify with Prisma Studio
pnpm prisma studio
```

---

### Part 5: Deploy Your API

#### Option A: DigitalOcean App Platform (Recommended)

1. **Prepare Your Code:**
   ```bash
   # Make sure your code is pushed to GitHub/GitLab
   git add .
   git commit -m "Prepare for DigitalOcean deployment"
   git push origin main
   ```

2. **Create App:**
   - Go to **"Create"** → **"Apps"**
   - Connect your GitHub/GitLab repository
   - Select repository: `QUAI_Rocster/QUAI`
   - Select branch: `main`

3. **Configure Build Settings:**
   - **Source Directory:** `apps/api`
   - **Build Command:** `pnpm install && pnpm build`
   - **Run Command:** `pnpm start`
   - **HTTP Port:** `4000`

4. **Add Environment Variables:**
   - Add all variables from your `.env` file
   - Use the DigitalOcean database connection strings

5. **Deploy:**
   - Click **"Create Resources"**
   - Wait for deployment (5-10 minutes)
   - Your API will be available at: `https://your-app-name.ondigitalocean.app`

#### Option B: DigitalOcean Droplet (More Control)

1. **Create Droplet:**
   - Click **"Create"** → **"Droplets"**
   - Choose Ubuntu 22.04 LTS
   - Select plan: Basic - $6/month (1GB RAM)
   - Select same datacenter as databases
   - Add SSH key
   - Name: `quai-api-server`

2. **SSH into Droplet:**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Dependencies:**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   
   # Install pnpm
   npm install -g pnpm
   
   # Install PM2 (process manager)
   npm install -g pm2
   ```

4. **Deploy Your Code:**
   ```bash
   # Clone your repository
   git clone https://github.com/your-username/QUAI_Rocster.git
   cd QUAI_Rocster/apps/api
   
   # Install dependencies
   pnpm install
   
   # Create .env file
   nano .env
   # Paste your environment variables
   
   # Build
   pnpm build
   
   # Generate Prisma client
   pnpm prisma:generate
   
   # Run migrations
   pnpm prisma:migrate
   
   # Start with PM2
   pm2 start dist/index.js --name quai-api
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx (Reverse Proxy):**
   ```bash
   # Install Nginx
   apt install -y nginx
   
   # Create config
   nano /etc/nginx/sites-available/quai-api
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Enable site
   ln -s /etc/nginx/sites-available/quai-api /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

6. **Setup SSL (HTTPS):**
   ```bash
   # Install Certbot
   apt install -y certbot python3-certbot-nginx
   
   # Get SSL certificate
   certbot --nginx -d your-domain.com
   ```

---

### Part 6: Deploy Frontend (Next.js)

#### Option A: Vercel (Recommended for Next.js)
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - **Root Directory:** `apps/web`
   - **Framework:** Next.js
4. Add environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   NEXT_PUBLIC_QUAI_NETWORK=testnet
   ```
5. Deploy!

#### Option B: DigitalOcean App Platform
1. Create new app from same repository
2. Configure:
   - **Source Directory:** `apps/web`
   - **Build Command:** `pnpm install && pnpm build`
   - **Run Command:** `pnpm start`
   - **HTTP Port:** `3000`
3. Add environment variables
4. Deploy!

---

## 🔒 Security Checklist

### Database Security:
- ✅ Use SSL/TLS connections (sslmode=require)
- ✅ Configure trusted sources (whitelist IPs)
- ✅ Use strong passwords
- ✅ Enable automated backups
- ✅ Regularly update database

### API Security:
- ✅ Use HTTPS (SSL certificate)
- ✅ Configure CORS properly
- ✅ Implement rate limiting
- ✅ Use environment variables (never commit secrets)
- ✅ Enable firewall on Droplet

### Redis Security:
- ✅ Use SSL/TLS (rediss://)
- ✅ Configure trusted sources
- ✅ Use strong password
- ✅ Limit memory usage

---

## 📊 Monitoring & Maintenance

### DigitalOcean Monitoring:
1. Enable monitoring in database settings
2. Set up alerts for:
   - High CPU usage
   - Low disk space
   - Connection errors
   - High memory usage

### Application Monitoring:
```bash
# On Droplet, check logs
pm2 logs quai-api

# Check status
pm2 status

# Restart if needed
pm2 restart quai-api
```

### Database Backups:
1. Go to database → **"Backups"** tab
2. Backups are automatic (daily)
3. Can restore from any backup point
4. Download backups for local storage

---

## 🚀 Performance Optimization

### Database Optimization:
1. **Indexes:** Ensure proper indexes on frequently queried fields
   ```sql
   CREATE INDEX idx_posts_author ON posts(authorId);
   CREATE INDEX idx_posts_created ON posts(createdAt DESC);
   ```

2. **Connection Pooling:** Already configured in Prisma
   ```typescript
   // In your Prisma client config
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Query Optimization:** Use Prisma's query optimization
   ```typescript
   // Include only what you need
   const posts = await prisma.post.findMany({
     select: {
       id: true,
       textPreview: true,
       author: {
         select: { qnsName: true, avatarUrl: true }
       }
     }
   });
   ```

### Redis Caching:
```typescript
// Example caching strategy
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

// Cache frequently accessed data
async function getCachedPosts() {
  const cached = await redis.get('posts:recent');
  if (cached) return JSON.parse(cached);
  
  const posts = await prisma.post.findMany();
  await redis.setEx('posts:recent', 300, JSON.stringify(posts)); // 5 min cache
  return posts;
}
```

### CDN for Static Assets:
1. Use DigitalOcean Spaces with CDN
2. Store images, videos, avatars
3. Faster content delivery globally

---

## 💰 Cost Breakdown

### Development Setup:
- PostgreSQL: $15/month (1GB)
- Redis: $15/month (1GB)
- Droplet: $6/month (1GB)
- **Total: $36/month**

### Production Setup (Recommended):
- PostgreSQL: $60/month (4GB, high availability)
- Redis: $60/month (4GB)
- Droplet: $24/month (4GB) or App Platform $12/month
- Spaces: $5/month (250GB storage + CDN)
- Load Balancer: $12/month (optional)
- **Total: $149-161/month**

### Scaling Options:
- Can resize databases without downtime
- Add read replicas for PostgreSQL
- Horizontal scaling with multiple Droplets
- Load balancer for high availability

---

## 🔄 Migration from SQLite to DigitalOcean

```bash
# 1. Backup current SQLite data
cd apps/api
pnpm prisma studio
# Export data manually if needed

# 2. Update .env with DigitalOcean connection strings
nano .env

# 3. Run migrations
pnpm prisma:generate
pnpm prisma:migrate

# 4. Test connection
pnpm prisma studio
# Should now show DigitalOcean database

# 5. Start API
pnpm dev
```

---

## 📚 Additional DigitalOcean Services

### Spaces (Object Storage):
Perfect for storing user uploads, images, videos.

**Setup:**
1. Create → Spaces
2. Choose region
3. Name: `quai-social-media`
4. Enable CDN
5. Get access keys

**Usage:**
```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  endpoint: 'nyc3.digitaloceanspaces.com',
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET
});

// Upload file
await s3.upload({
  Bucket: 'quai-social-media',
  Key: `avatars/${userId}.jpg`,
  Body: fileBuffer,
  ACL: 'public-read'
}).promise();
```

### Load Balancer:
For high availability and traffic distribution.

**When to use:**
- Multiple API servers
- High traffic (1000+ concurrent users)
- Zero-downtime deployments

---

## 🆘 Troubleshooting

### "Can't connect to database"
```bash
# Check connection string format
echo $DATABASE_URL

# Test connection
psql "$DATABASE_URL"

# Check trusted sources in DigitalOcean dashboard
```

### "SSL connection error"
```bash
# Ensure sslmode=require in connection string
DATABASE_URL=postgresql://user:pass@host:25060/db?sslmode=require
```

### "Redis connection timeout"
```bash
# Test Redis connection
redis-cli -u "$REDIS_URL" ping

# Should return: PONG
```

### "Migration failed"
```bash
# Reset and retry
pnpm prisma migrate reset
pnpm prisma:migrate

# Or create new migration
pnpm prisma migrate dev --name fix_migration
```

---

## ✅ Pre-Launch Checklist

Before going live:

### Database:
- [ ] PostgreSQL cluster created
- [ ] Redis cluster created
- [ ] Backups enabled
- [ ] Trusted sources configured
- [ ] SSL/TLS enabled
- [ ] Migrations run successfully

### API:
- [ ] Deployed to Droplet or App Platform
- [ ] Environment variables configured
- [ ] HTTPS/SSL enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Monitoring enabled

### Frontend:
- [ ] Deployed to Vercel or App Platform
- [ ] Environment variables configured
- [ ] API URL configured
- [ ] HTTPS enabled
- [ ] Domain configured

### Testing:
- [ ] Database connection works
- [ ] API endpoints respond
- [ ] Frontend connects to API
- [ ] User registration works
- [ ] Post creation works
- [ ] Real-time features work

---

## 📖 Next Steps

1. **Create DigitalOcean databases** (PostgreSQL + Redis)
2. **Update environment variables** with connection strings
3. **Run migrations** to set up schema
4. **Deploy API** to Droplet or App Platform
5. **Deploy frontend** to Vercel
6. **Test everything** end-to-end
7. **Monitor and optimize** performance

---

## 🎉 Summary

**DigitalOcean vs Supabase:**

| Feature | DigitalOcean | Supabase |
|---------|-------------|----------|
| **Cost** | $36+/month | Free tier available |
| **Control** | Full control | Managed service |
| **Scalability** | Excellent | Good |
| **Setup Time** | 30-60 min | 15 min |
| **Best For** | Production, custom needs | Quick start, prototypes |

**Your DigitalOcean subscription is perfect for:**
- ✅ Production deployment
- ✅ Full control over infrastructure
- ✅ Better performance at scale
- ✅ Custom configurations
- ✅ Professional hosting

**You're ready to deploy!** 🚀
