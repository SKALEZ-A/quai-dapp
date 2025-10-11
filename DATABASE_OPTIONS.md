# 🗄️ Database Options for QUAI Social DApp

## Quick Comparison

| Feature | SQLite (Current) | PostgreSQL Local | PostgreSQL Cloud | Docker |
|---------|-----------------|------------------|------------------|---------|
| **Setup Time** | ✅ 0 min (done) | ⚠️ 10 min | ⚠️ 15 min | ⚠️ 5 min |
| **Cost** | ✅ Free | ✅ Free | ✅ Free tier | ✅ Free |
| **Production Ready** | ❌ No | ✅ Yes | ✅ Yes | ⚠️ Dev only |
| **Scalability** | ❌ Limited | ✅ Good | ✅ Excellent | ⚠️ Limited |
| **Concurrent Users** | ❌ 1 writer | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| **Real-time Features** | ❌ No | ✅ Yes (with Redis) | ✅ Yes (with Redis) | ✅ Yes |
| **Backup/Recovery** | ⚠️ Manual | ✅ Built-in | ✅ Automatic | ⚠️ Manual |
| **Best For** | Testing | Local dev | Production | Quick start |

---

## Option 1: SQLite (Current Setup) ✅

### What You Have Now
```
DATABASE_URL="file:./dev.db"
```

### Pros
- ✅ Already working
- ✅ Zero configuration
- ✅ Perfect for testing
- ✅ No external dependencies

### Cons
- ❌ Single writer only
- ❌ Not production-ready
- ❌ Limited scalability
- ❌ No real-time features

### When to Use
- ✅ Local development
- ✅ Testing features
- ✅ Prototyping
- ❌ Production deployment

### How to Use
```bash
cd apps/api
pnpm dev  # That's it!
```

---

## Option 2: PostgreSQL Local + Redis 🚀

### What You Need
```bash
# Install (one-time)
brew install postgresql@15 redis

# Start services
brew services start postgresql@15
brew services start redis
```

### Connection Details
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quai_social
REDIS_URL=redis://localhost:6379
```

### Pros
- ✅ Production-grade database
- ✅ Unlimited concurrent users
- ✅ Real-time features with Redis
- ✅ Full SQL capabilities
- ✅ Great for development

### Cons
- ⚠️ Requires local installation
- ⚠️ Need to manage services
- ⚠️ 10-15 min setup time

### When to Use
- ✅ Serious development
- ✅ Testing production features
- ✅ Team collaboration
- ✅ Before deploying

### Quick Setup
```bash
# Run the setup script
./setup-database.sh

# Choose option 2
```

---

## Option 3: PostgreSQL Cloud (Supabase) ☁️

### What You Need
1. Free Supabase account: https://supabase.com
2. Create a project
3. Copy connection string

### Connection Details
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### Pros
- ✅ Production-ready immediately
- ✅ Automatic backups
- ✅ Built-in dashboard
- ✅ Free tier: 500MB storage
- ✅ No local installation
- ✅ Global CDN

### Cons
- ⚠️ Requires internet
- ⚠️ Free tier limits
- ⚠️ 15 min setup time

### When to Use
- ✅ Production deployment
- ✅ Team collaboration
- ✅ Remote development
- ✅ No local setup wanted

### Quick Setup
1. **Sign up:** https://supabase.com
2. **Create project:**
   - Name: `quai-social`
   - Password: (save it!)
   - Region: closest to you

3. **Get connection string:**
   - Settings → Database
   - Copy "Connection string" → "URI"

4. **Update .env:**
   ```bash
   cd apps/api
   nano .env
   # Paste the connection string
   ```

5. **Run migrations:**
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

---

## Option 4: Docker 🐳

### What You Need
```bash
# Install Docker Desktop (one-time)
# Download from: https://www.docker.com/products/docker-desktop

# Start containers
docker-compose up -d postgres redis
```

### Connection Details
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quai
REDIS_URL=redis://localhost:6379
```

### Pros
- ✅ Quick setup (5 min)
- ✅ Isolated environment
- ✅ Easy to reset
- ✅ Same as production
- ✅ Includes Redis

### Cons
- ⚠️ Requires Docker
- ⚠️ Uses system resources
- ⚠️ Not for production

### When to Use
- ✅ Quick start
- ✅ Clean environment
- ✅ Testing deployment
- ✅ Team consistency

### Quick Setup
```bash
# Run the setup script
./setup-database.sh

# Choose option 3
```

---

## What Database Details You Need

### For Any Database:
```env
DATABASE_URL=<connection_string>
```

### Connection String Format:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

### Examples:

**SQLite (Current):**
```
file:./dev.db
```

**PostgreSQL Local:**
```
postgresql://postgres:postgres@localhost:5432/quai_social
```

**PostgreSQL Cloud (Supabase):**
```
postgresql://postgres:your_password@db.abc123.supabase.co:5432/postgres
```

**PostgreSQL Docker:**
```
postgresql://postgres:postgres@localhost:5432/quai
```

### Redis (For Real-time Features):
```env
REDIS_URL=redis://localhost:6379
```

**Cloud Redis (Upstash - Free):**
```
redis://default:your_password@abc-123.upstash.io:6379
```

---

## Recommended Path

### For Development (Now):
```
✅ SQLite (current) → Quick testing
↓
✅ PostgreSQL Local + Redis → Serious development
```

### For Production (Later):
```
✅ PostgreSQL Cloud (Supabase) → Main database
✅ Redis Cloud (Upstash) → Real-time features
```

---

## How to Get Each Database

### SQLite ✅
**Already have it!** No setup needed.

### PostgreSQL Local
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb quai_social

# Or use setup script
./setup-database.sh  # Choose option 2
```

### PostgreSQL Cloud (Supabase)
1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Copy connection string
5. Done!

### Redis Local
```bash
# macOS
brew install redis
brew services start redis

# Test
redis-cli ping  # Should return: PONG
```

### Redis Cloud (Upstash)
1. Go to https://upstash.com
2. Sign up (free)
3. Create Redis database
4. Copy connection string
5. Done!

### Docker (All-in-one)
```bash
# Install Docker Desktop
# Then run:
docker-compose up -d postgres redis
```

---

## Environment Variables Needed

### Minimal (SQLite):
```env
DATABASE_URL="file:./dev.db"
```

### Recommended (PostgreSQL + Redis):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quai_social
REDIS_URL=redis://localhost:6379
```

### Production (Cloud):
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
REDIS_URL=redis://default:[PASSWORD]@[HOST].upstash.io:6379
```

---

## Quick Start Commands

### Check Current Setup:
```bash
cd apps/api
cat .env | grep DATABASE_URL
```

### Test Database Connection:
```bash
cd apps/api
pnpm prisma studio
# Opens GUI at http://localhost:5555
```

### Run Migrations:
```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
```

### Start API:
```bash
cd apps/api
pnpm dev
# API runs at http://localhost:4000
```

---

## Need Help?

Run the automated setup:
```bash
./setup-database.sh
```

Or check the detailed guide:
```bash
cat DATABASE_SETUP_GUIDE.md
```

---

## Summary

**Right now:** You have SQLite working ✅

**Next step:** Choose based on your needs:
- 🏃 **Quick testing** → Keep SQLite
- 🔨 **Serious development** → PostgreSQL Local + Redis
- 🚀 **Production ready** → Supabase + Upstash
- 🐳 **Easy setup** → Docker

**My recommendation:** Start with SQLite for now, then move to PostgreSQL Local when you're ready to test real-time features and production scenarios.
