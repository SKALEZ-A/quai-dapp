# 🗄️ Database Guide

## Overview

The Quai Superapp uses Prisma ORM with PostgreSQL for production and SQLite for development.

---

## Current Setup

### Development Database (SQLite)

**Status:** ✅ Working  
**Location:** `apps/api/prisma/dev.db`  
**Connection:** `file:./dev.db`

**Pros:**
- Zero configuration
- Fast for development
- No external dependencies
- Included in repo

**Cons:**
- Not for production
- Limited concurrent connections
- No advanced features

---

## Production Database Options

### Option 1: Supabase (Recommended for Quick Start)

**Pricing:**
- Free: 500MB, 2GB bandwidth
- Pro: $25/month, 8GB, 50GB bandwidth
- **Best for:** MVP, small apps, fast launch

**Setup (15 minutes):**
```bash
# 1. Sign up at https://supabase.com
# 2. Create new project
# 3. Get connection string:
#    Settings → Database → Connection string

# 4. Update .env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# 5. Run migrations
cd apps/api
pnpm prisma migrate deploy
```

**Features:**
- Auto backups
- Built-in dashboard
- Row-level security
- Realtime subscriptions
- Storage included
- Auth included

### Option 2: DigitalOcean (Recommended for Production)

**Pricing:**
- Basic: $15/month, 1GB RAM, 10GB storage
- Standard: $60/month, 4GB RAM, 80GB storage
- **Best for:** Production, scaling, full control

**Setup (30 minutes):**
```bash
# 1. Create PostgreSQL cluster in DigitalOcean
# 2. Configure:
#    - Version: 14+
#    - Region: Closest to users
#    - Plan: Based on needs

# 3. Add trusted sources (your IP/servers)
# 4. Get connection details

# 5. Update .env
DATABASE_URL="postgresql://user:pass@host:25060/defaultdb?sslmode=require"

# 6. Run migrations
pnpm prisma migrate deploy
```

**Features:**
- Automatic backups (daily)
- Point-in-time recovery
- Vertical scaling
- Read replicas
- Connection pooling
- Monitoring included

### Option 3: Railway

**Pricing:**
- Free: $5 credit/month
- Pro: Pay as you go
- **Best for:** Hobby projects, startups

**Setup:**
```bash
# 1. Visit https://railway.app
# 2. New Project → PostgreSQL
# 3. Copy DATABASE_URL from variables
# 4. Update .env and deploy
```

### Option 4: Neon.tech

**Pricing:**
- Free: 3GB storage
- Pro: $19/month, 200GB
- **Best for:** Serverless, auto-scaling

**Features:**
- Serverless PostgreSQL
- Automatic scaling
- Branching (git-like)
- Free tier generous

---

## Database Schema

### Tables

```sql
-- User profiles
CREATE TABLE Profile (
  id SERIAL PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  qnsName TEXT,
  displayName TEXT,
  avatarUrl TEXT,
  bio TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Social posts
CREATE TABLE Post (
  id SERIAL PRIMARY KEY,
  authorId INTEGER REFERENCES Profile(id),
  cid TEXT NOT NULL,           -- IPFS hash
  textPreview TEXT,
  zone TEXT,
  txHash TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Comments
CREATE TABLE Comment (
  id SERIAL PRIMARY KEY,
  postId INTEGER REFERENCES Post(id),
  authorId INTEGER REFERENCES Profile(id),
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Likes
CREATE TABLE Like (
  id SERIAL PRIMARY KEY,
  postId INTEGER REFERENCES Post(id),
  profileId INTEGER REFERENCES Profile(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(postId, profileId)
);

-- Follows
CREATE TABLE Follow (
  id SERIAL PRIMARY KEY,
  followerId INTEGER REFERENCES Profile(id),
  followingId INTEGER REFERENCES Profile(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(followerId, followingId)
);
```

---

## Prisma Configuration

### Schema File

`apps/api/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // or "sqlite" for dev
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Profile {
  id          Int       @id @default(autoincrement())
  address     String    @unique
  qnsName     String?
  displayName String?
  avatarUrl   String?
  bio         String?
  createdAt   DateTime  @default(now())
  
  posts       Post[]
  comments    Comment[]
  likes       Like[]
  followers   Follow[]  @relation("Following")
  following   Follow[]  @relation("Follower")
}

// ... other models
```

---

## Common Operations

### Migrations

**Create new migration:**
```bash
cd apps/api
pnpm prisma migrate dev --name add_new_feature
```

**Apply migrations to production:**
```bash
pnpm prisma migrate deploy
```

**Reset database (⚠️ deletes all data):**
```bash
pnpm prisma migrate reset
```

### Generate Prisma Client

```bash
pnpm prisma generate
```

### Database Studio (GUI)

```bash
pnpm prisma studio
# Opens at http://localhost:5555
```

---

## Connection Pooling

### Why It's Important

- PostgreSQL has limited connections (100-500)
- Each API instance uses connections
- Pooling prevents exhaustion
- Improves performance

### Setup with PgBouncer (DigitalOcean)

```bash
# Use connection pool URL instead of direct
DATABASE_URL="postgresql://user:pass@host:25060/db?pgbouncer=true"
```

### Setup with Prisma Data Proxy

```bash
# For serverless deployments
# https://www.prisma.io/docs/data-platform/data-proxy
```

---

## Performance Optimization

### Indexing

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_profile_address ON Profile(address);
CREATE INDEX idx_post_author ON Post(authorId);
CREATE INDEX idx_post_created ON Post(createdAt DESC);
CREATE INDEX idx_comment_post ON Comment(postId);
CREATE INDEX idx_like_post ON Like(postId);
CREATE INDEX idx_follow_follower ON Follow(followerId);
CREATE INDEX idx_follow_following ON Follow(followingId);
```

### Query Optimization

```typescript
// Bad: N+1 queries
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.profile.findUnique({
    where: { id: post.authorId }
  });
}

// Good: Single query with includes
const posts = await prisma.post.findMany({
  include: {
    author: true,
    comments: {
      include: { author: true }
    },
    likes: true
  }
});
```

### Caching with Redis

```typescript
// Check cache first
const cached = await redis.get(`post:${postId}`);
if (cached) return JSON.parse(cached);

// Query database
const post = await prisma.post.findUnique({
  where: { id: postId }
});

// Cache result
await redis.setex(`post:${postId}`, 3600, JSON.stringify(post));
```

---

## Backup & Recovery

### Automated Backups

**Supabase:**
- Automatic daily backups (retained 7 days)
- Point-in-time recovery (Pro plan)

**DigitalOcean:**
- Daily automated backups
- Manual backups anytime
- Retention: 7-30 days

### Manual Backup

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Compress
gzip backup-20250101.sql

# Store securely (S3, DigitalOcean Spaces, etc.)
```

### Restore

```bash
# Decompress
gunzip backup-20250101.sql.gz

# Restore
psql $DATABASE_URL < backup-20250101.sql
```

---

## Monitoring

### Key Metrics

- Query response time
- Active connections
- Database size
- Slow queries
- Error rates
- Cache hit rate

### Tools

**Supabase Dashboard:**
- Built-in monitoring
- Query performance
- Connection stats

**DigitalOcean Monitoring:**
- CPU usage
- Memory usage
- Disk I/O
- Connection pool

**Prisma Metrics:**
```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

---

## Security

### Best Practices

1. **Use SSL/TLS**
   ```
   DATABASE_URL="...?sslmode=require"
   ```

2. **Secure Credentials**
   - Use environment variables
   - Never commit credentials
   - Rotate passwords regularly

3. **Least Privilege**
   - Create app-specific database user
   - Grant only needed permissions

4. **Input Validation**
   - Use Prisma (prevents SQL injection)
   - Validate all user input
   - Sanitize data

5. **Backup Encryption**
   - Encrypt backups at rest
   - Use secure transfer methods

---

## Troubleshooting

### Cannot Connect

```bash
# Test connection
psql $DATABASE_URL

# Common issues:
# 1. Wrong credentials
# 2. Firewall blocking
# 3. SSL mode mismatch
# 4. Wrong host/port
```

### Slow Queries

```sql
-- Find slow queries (PostgreSQL)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Connection Pool Exhausted

```bash
# Increase pool size in Prisma
# datasource db {
#   url = env("DATABASE_URL")
#   connection_limit = 20
# }
```

### Migration Conflicts

```bash
# Reset and reapply (⚠️ development only)
pnpm prisma migrate reset

# Or resolve manually
pnpm prisma migrate resolve --applied "migration_name"
```

---

## Switching Databases

### SQLite → PostgreSQL

```bash
# 1. Update schema.prisma
# provider = "postgresql"

# 2. Update DATABASE_URL

# 3. Create migration
pnpm prisma migrate dev

# 4. Optional: Copy data
# Export from SQLite, import to PostgreSQL
```

### PostgreSQL → Different PostgreSQL

```bash
# 1. Backup old database
pg_dump $OLD_DB_URL > migration.sql

# 2. Restore to new database  
psql $NEW_DB_URL < migration.sql

# 3. Update DATABASE_URL

# 4. Test application
```

---

## Cost Comparison

### Monthly Costs

| Provider | Free Tier | Starter | Production |
|----------|-----------|---------|------------|
| **SQLite** | $0 | $0 | N/A (dev only) |
| **Supabase** | $0 (500MB) | $25 (8GB) | $100+ |
| **DigitalOcean** | N/A | $15 (1GB) | $60+ (4GB) |
| **Railway** | $5 credit | ~$10 | $50+ |
| **Neon** | $0 (3GB) | $19 | $70+ |

---

## Recommendations

### For Development
✅ Use SQLite (already configured)

### For MVP/Testing
✅ Use Supabase Free tier

### For Production
✅ Use DigitalOcean or Supabase Pro

### For Enterprise
✅ DigitalOcean with read replicas
