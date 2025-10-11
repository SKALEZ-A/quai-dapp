# Database Setup Guide for QUAI Social DApp

## Current Status
- ✅ SQLite configured for development
- ⚠️ Need PostgreSQL for production
- ⚠️ Need Redis for real-time features

---

## Quick Start (Development)

### 1. Using SQLite (Current Setup)
Your current setup is already working with SQLite!

```bash
cd apps/api

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Start the API
pnpm dev
```

**Database Location:** `apps/api/prisma/dev.db`

---

## Production Setup

### Option 1: Local PostgreSQL + Redis

#### Step 1: Install PostgreSQL
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb quai_social

# Create user (optional)
psql postgres
CREATE USER quai_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE quai_social TO quai_admin;
\q
```

#### Step 2: Install Redis
```bash
# macOS
brew install redis
brew services start redis

# Test Redis
redis-cli ping
# Should return: PONG
```

#### Step 3: Update .env
```bash
cd apps/api
cp ENV_EXAMPLE .env
```

Edit `.env`:
```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# PostgreSQL
DATABASE_URL=postgresql://quai_admin:your_secure_password@localhost:5432/quai_social

# Redis
REDIS_URL=redis://localhost:6379

# Quai Network (already configured)
QUAI_RPC_URL=https://orchard.rpc.quai.network
QUAI_NETWORK=testnet

# Contract Addresses (already configured)
QNS_REGISTRY_ADDRESS=0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61
QNS_CONTROLLER_ADDRESS=0x0020331A51B939f5e8286541F0C6c38530909782
SOCIAL_CONTRACT_ADDRESS=0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910
```

#### Step 4: Migrate Database
```bash
cd apps/api

# Update Prisma schema to use PostgreSQL
# (Already done in schema.prisma, just uncomment)

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Start API
pnpm dev
```

---

### Option 2: Docker Setup (Recommended)

#### Step 1: Start Services
```bash
# From project root
docker-compose up -d postgres redis
```

#### Step 2: Update .env
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quai
REDIS_URL=redis://localhost:6379
```

#### Step 3: Run Migrations
```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

---

### Option 3: Cloud Database (Production)

#### Supabase (Recommended - Free Tier)

1. **Sign up:** https://supabase.com
2. **Create Project:**
   - Project name: `quai-social`
   - Database password: (save this!)
   - Region: Choose closest to you

3. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy "Connection string" → "URI"
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

4. **Update .env:**
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

5. **Run Migrations:**
   ```bash
   cd apps/api
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

#### Railway (Alternative)

1. **Sign up:** https://railway.app
2. **Create PostgreSQL Database**
3. **Copy Connection String**
4. **Update .env**

#### Neon (Alternative - Serverless)

1. **Sign up:** https://neon.tech
2. **Create Project**
3. **Copy Connection String**
4. **Update .env**

---

## Database Schema

Your current Prisma schema includes:

### Tables:
- **Profile** - User profiles with QNS names
- **Post** - Social posts with IPFS CID
- **Comment** - Comments on posts
- **Like** - Post likes
- **Follow** - Following/followers relationships

### Key Features:
- ✅ User authentication via wallet address
- ✅ QNS name integration
- ✅ IPFS content storage
- ✅ Social graph (follows)
- ✅ Engagement tracking (likes, comments)

---

## Environment Variables Checklist

### Required for API:
```env
✅ PORT=4000
✅ ALLOWED_ORIGINS=http://localhost:3000
✅ DATABASE_URL=postgresql://...
✅ REDIS_URL=redis://localhost:6379
✅ QUAI_RPC_URL=https://orchard.rpc.quai.network
✅ QUAI_NETWORK=testnet
✅ SOCIAL_CONTRACT_ADDRESS=0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910
```

### Optional:
```env
⚠️ WEB3_STORAGE_TOKEN=your_token_here (for IPFS uploads)
```

---

## Testing Your Setup

### 1. Test Database Connection
```bash
cd apps/api
pnpm prisma studio
```
This opens a GUI at http://localhost:5555

### 2. Test API
```bash
cd apps/api
pnpm dev
```
API should start at http://localhost:4000

### 3. Test Redis
```bash
redis-cli ping
# Should return: PONG
```

---

## Common Issues & Solutions

### Issue: "Can't reach database server"
**Solution:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql@15
```

### Issue: "Redis connection refused"
**Solution:**
```bash
# Check Redis is running
brew services list | grep redis

# Restart if needed
brew services restart redis
```

### Issue: "Prisma migration failed"
**Solution:**
```bash
# Reset database (CAUTION: deletes all data)
cd apps/api
pnpm prisma migrate reset

# Or create new migration
pnpm prisma migrate dev --name init
```

---

## Next Steps

1. ✅ Choose your database option (SQLite for dev, PostgreSQL for prod)
2. ✅ Set up Redis for real-time features
3. ✅ Update .env with correct connection strings
4. ✅ Run Prisma migrations
5. ✅ Test API endpoints
6. ✅ Connect frontend to backend

---

## Production Deployment

For production, you'll need:

1. **PostgreSQL Database** (Supabase/Railway/Neon)
2. **Redis** (Upstash Redis - free tier)
3. **API Hosting** (Vercel/Railway/Render)
4. **Frontend Hosting** (Vercel/Netlify)

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.
