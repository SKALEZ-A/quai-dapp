# 📊 Database Summary - QUAI Social DApp

## ✅ What You Already Have

Your database is **already configured and working**! Here's what's set up:

### Current Database: SQLite
```
Location: apps/api/prisma/dev.db
Connection: DATABASE_URL="file:./dev.db"
Status: ✅ Working
```

### Database Schema (Already Created):

```
┌─────────────┐
│   Profile   │ ← User accounts with wallet addresses
├─────────────┤
│ id          │
│ address     │ (unique, wallet address)
│ qnsName     │ (optional QNS domain)
│ displayName │
│ avatarUrl   │
│ bio         │
└─────────────┘
       │
       │ 1:N relationships
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│    Post     │  │   Follow    │
├─────────────┤  ├─────────────┤
│ id          │  │ followerId  │
│ authorId    │  │ followingId │
│ cid (IPFS)  │  └─────────────┘
│ textPreview │
│ zone        │
│ txHash      │
└─────────────┘
       │
       │ 1:N relationships
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│   Comment   │  │    Like     │
├─────────────┤  ├─────────────┤
│ id          │  │ profileId   │
│ authorId    │  │ postId      │
│ postId      │  └─────────────┘
│ cid (IPFS)  │
│ textPreview │
└─────────────┘
```

---

## 🎯 What Database Details You Need

### For Development (Current Setup):
**Nothing!** You're already configured. Just use:
```env
DATABASE_URL="file:./dev.db"
```

### For Production (When Ready):

#### Option 1: PostgreSQL Local
```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
REDIS_URL=redis://localhost:6379
```

**Example:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quai_social
REDIS_URL=redis://localhost:6379
```

**How to get it:**
```bash
# Install
brew install postgresql@15 redis

# Start
brew services start postgresql@15
brew services start redis

# Create database
createdb quai_social
```

#### Option 2: Cloud Database (Supabase)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

**How to get it:**
1. Sign up at https://supabase.com (free)
2. Create new project
3. Go to Settings → Database
4. Copy "Connection string" → "URI"
5. Paste into your `.env` file

**Free Tier Includes:**
- 500MB database storage
- Automatic backups
- Built-in dashboard
- No credit card required

---

## 🚀 How to Get Started Right Now

### Step 1: Verify Database is Working
```bash
cd apps/api
pnpm prisma studio
```
This opens a GUI at http://localhost:5555 where you can see your database tables.

### Step 2: Start the API
```bash
cd apps/api
pnpm dev
```
API will run at http://localhost:4000

### Step 3: Test API Endpoints
```bash
# Get all posts
curl http://localhost:4000/posts

# Health check
curl http://localhost:4000/health
```

---

## 📝 Database Details Breakdown

### What is DATABASE_URL?
The connection string that tells your app how to connect to the database.

**Format:**
```
[database_type]://[username]:[password]@[host]:[port]/[database_name]
```

**Examples:**

**SQLite (Current):**
```
file:./dev.db
```
- No username/password needed
- File-based database
- Perfect for development

**PostgreSQL:**
```
postgresql://postgres:mypassword@localhost:5432/quai_social
```
- `postgres` = username
- `mypassword` = password
- `localhost` = host (your computer)
- `5432` = port (PostgreSQL default)
- `quai_social` = database name

**Cloud PostgreSQL (Supabase):**
```
postgresql://postgres:abc123xyz@db.xyzproject.supabase.co:5432/postgres
```
- Hosted on Supabase servers
- Accessible from anywhere
- Automatic backups

### What is REDIS_URL?
Connection string for Redis (used for real-time features, caching, sessions).

**Format:**
```
redis://[host]:[port]
```

**Examples:**

**Local Redis:**
```
redis://localhost:6379
```

**Cloud Redis (Upstash):**
```
redis://default:password@abc-123.upstash.io:6379
```

---

## 🔄 Migration Path

### Current → Production

```
┌─────────────────┐
│ SQLite (Now)    │ ✅ Working
│ Development     │
└────────┬────────┘
         │
         │ When ready for production
         ▼
┌─────────────────┐
│ PostgreSQL      │ 🚀 Production
│ + Redis         │
└─────────────────┘
```

**When to migrate:**
- ✅ Ready to deploy
- ✅ Need multiple users
- ✅ Want real-time features
- ✅ Need better performance

**How to migrate:**
1. Set up PostgreSQL (local or cloud)
2. Update `DATABASE_URL` in `.env`
3. Run `pnpm prisma:migrate`
4. Done! Your data structure stays the same

---

## 🛠️ Tools & Commands

### View Database:
```bash
cd apps/api
pnpm prisma studio
```
Opens GUI at http://localhost:5555

### Generate Prisma Client:
```bash
cd apps/api
pnpm prisma:generate
```
Creates TypeScript types for your database

### Run Migrations:
```bash
cd apps/api
pnpm prisma:migrate
```
Updates database schema

### Reset Database:
```bash
cd apps/api
pnpm prisma migrate reset
```
⚠️ **CAUTION:** Deletes all data!

---

## 📚 Additional Resources

### Detailed Guides:
- `DATABASE_SETUP_GUIDE.md` - Complete setup instructions
- `DATABASE_OPTIONS.md` - Compare all database options
- `QUICK_DATABASE_REFERENCE.md` - Quick command reference

### Automated Setup:
```bash
./setup-database.sh
```
Interactive script that sets up everything for you.

### Online Resources:
- **Prisma Docs:** https://www.prisma.io/docs
- **Supabase:** https://supabase.com
- **PostgreSQL:** https://www.postgresql.org

---

## ❓ FAQ

### Q: Do I need to change anything now?
**A:** No! Your current SQLite setup works perfectly for development.

### Q: When should I upgrade to PostgreSQL?
**A:** When you're ready to deploy to production or need real-time features.

### Q: Will I lose my data when upgrading?
**A:** No, but you'll need to migrate it. The schema stays the same.

### Q: Do I need Redis?
**A:** Only for real-time features (notifications, live updates, chat).

### Q: How much does it cost?
**A:** 
- SQLite: Free ✅
- PostgreSQL Local: Free ✅
- Supabase: Free tier available ✅
- Redis Local: Free ✅
- Upstash Redis: Free tier available ✅

### Q: Can I use multiple databases?
**A:** Yes! Use SQLite for dev, PostgreSQL for production.

---

## 🎉 Summary

### You're All Set!

**Current Status:**
- ✅ Database configured (SQLite)
- ✅ Schema created (5 tables)
- ✅ API ready to use
- ✅ Can start developing immediately

**Database Details You Have:**
```env
DATABASE_URL="file:./dev.db"
```

**No additional setup needed for development!**

### Next Steps:
1. ✅ Start API: `cd apps/api && pnpm dev`
2. ✅ View database: `cd apps/api && pnpm prisma studio`
3. ✅ Start building features
4. ⏭️ Upgrade to PostgreSQL when ready for production

---

## 🆘 Need Help?

### Quick Test:
```bash
cd apps/api
pnpm prisma studio
```
If this opens a GUI, your database is working! ✅

### Automated Setup:
```bash
./setup-database.sh
```

### Check Current Config:
```bash
cd apps/api
cat .env | grep DATABASE_URL
```

---

**You're ready to build! 🚀**

Your database is configured and working. Start developing your social dApp features now!
