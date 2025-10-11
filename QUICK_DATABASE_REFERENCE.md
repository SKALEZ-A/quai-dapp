# 🚀 Quick Database Reference Card

## Current Status
✅ **SQLite** is configured and working!
- Location: `apps/api/prisma/dev.db`
- Connection: `DATABASE_URL="file:./dev.db"`

---

## What You Have

### Database Tables (Already Created):
- ✅ **Profile** - User accounts with wallet addresses
- ✅ **Post** - Social posts with IPFS storage
- ✅ **Comment** - Post comments
- ✅ **Like** - Post likes
- ✅ **Follow** - Following/followers relationships

### Features Ready:
- ✅ User authentication via wallet
- ✅ QNS name integration
- ✅ Social posts with IPFS
- ✅ Likes and comments
- ✅ Following system

---

## How to Use Right Now

### 1. View Your Database:
```bash
cd apps/api
pnpm prisma studio
```
Opens GUI at: http://localhost:5555

### 2. Start API:
```bash
cd apps/api
pnpm dev
```
API runs at: http://localhost:4000

### 3. Test API Endpoints:
```bash
# Get posts
curl http://localhost:4000/posts

# Get user posts
curl http://localhost:4000/posts?authorAddress=0xYourAddress
```

---

## When to Upgrade

### Keep SQLite if:
- ✅ Just testing features
- ✅ Solo development
- ✅ Learning the system
- ✅ Building prototypes

### Upgrade to PostgreSQL when:
- ⚠️ Ready for production
- ⚠️ Need multiple users
- ⚠️ Want real-time features
- ⚠️ Team collaboration
- ⚠️ Deploying to cloud

---

## Upgrade Options

### Option 1: Local PostgreSQL (10 min)
```bash
./setup-database.sh
# Choose option 2
```

**Gets you:**
- PostgreSQL database
- Redis for real-time
- Production-ready setup

### Option 2: Cloud Database (15 min)
1. Sign up: https://supabase.com
2. Create project
3. Copy connection string
4. Update `.env`
5. Run migrations

**Gets you:**
- Cloud database
- Automatic backups
- Production-ready
- No local setup

### Option 3: Docker (5 min)
```bash
docker-compose up -d postgres redis
cd apps/api
pnpm prisma:migrate
```

**Gets you:**
- Quick setup
- Isolated environment
- Easy to reset

---

## Environment Variables

### Current (SQLite):
```env
DATABASE_URL="file:./dev.db"
```

### PostgreSQL Local:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quai_social
REDIS_URL=redis://localhost:6379
```

### PostgreSQL Cloud (Supabase):
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
REDIS_URL=redis://default:[PASSWORD]@[HOST].upstash.io:6379
```

---

## Common Commands

### Database Management:
```bash
cd apps/api

# View database
pnpm prisma studio

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Reset database (CAUTION: deletes data)
pnpm prisma migrate reset
```

### Service Management:
```bash
# PostgreSQL
brew services start postgresql@15
brew services stop postgresql@15
brew services restart postgresql@15

# Redis
brew services start redis
brew services stop redis
brew services restart redis

# Docker
docker-compose up -d
docker-compose down
docker-compose restart
```

---

## Troubleshooting

### "Can't connect to database"
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql@15
```

### "Prisma migration failed"
```bash
cd apps/api

# Option 1: Reset and retry
pnpm prisma migrate reset
pnpm prisma:migrate

# Option 2: Create new migration
pnpm prisma migrate dev --name fix_migration
```

### "Redis connection refused"
```bash
# Check if Redis is running
brew services list | grep redis

# Start if needed
brew services start redis

# Test connection
redis-cli ping  # Should return: PONG
```

---

## Database Schema Quick Reference

### Profile Table:
```typescript
{
  id: string (cuid)
  address: string (unique) // Wallet address
  qnsName: string? // Optional QNS name
  displayName: string?
  avatarUrl: string?
  bio: string?
  posts: Post[]
  likes: Like[]
  comments: Comment[]
  following: Follow[]
  followers: Follow[]
}
```

### Post Table:
```typescript
{
  id: string (cuid)
  authorId: string
  cid: string // IPFS content ID
  textPreview: string? // Cached preview
  zone: string? // Quai zone
  txHash: string? // On-chain tx
  comments: Comment[]
  likes: Like[]
}
```

### Follow Table:
```typescript
{
  id: string (cuid)
  followerId: string
  followingId: string
}
```

---

## API Endpoints Available

### Posts:
```bash
GET  /posts                    # Get all posts
GET  /posts?authorAddress=0x.. # Get user posts
POST /posts                    # Create post
```

### Engagements:
```bash
POST /engagements/like         # Like a post
POST /engagements/comment      # Comment on post
```

### Domains (QNS):
```bash
GET  /domains/:name            # Get domain info
POST /domains/register         # Register domain
```

---

## Next Steps

1. ✅ **Current:** SQLite working
2. ⏭️ **Next:** Test API endpoints
3. ⏭️ **Then:** Connect frontend to API
4. ⏭️ **Later:** Upgrade to PostgreSQL for production

---

## Need Help?

### Automated Setup:
```bash
./setup-database.sh
```

### Detailed Guides:
- `DATABASE_SETUP_GUIDE.md` - Complete setup instructions
- `DATABASE_OPTIONS.md` - Compare all options
- `DEPLOYMENT_GUIDE.md` - Production deployment

### Quick Test:
```bash
cd apps/api
pnpm prisma studio
# If this opens, your database is working! ✅
```

---

## Summary

**You're ready to go!** 🎉

Your SQLite database is configured and working. You can:
- ✅ Start developing immediately
- ✅ Test all features
- ✅ Upgrade to PostgreSQL later when needed

**Start the API:**
```bash
cd apps/api
pnpm dev
```

**View the database:**
```bash
cd apps/api
pnpm prisma studio
```
