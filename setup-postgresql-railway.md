# 🐘 PostgreSQL Setup for Railway (Recommended)

## Why PostgreSQL over SQLite?
- **Better for production**: More robust, handles concurrent connections
- **Railway native support**: Built-in PostgreSQL service
- **Better performance**: Optimized for web applications
- **Data persistence**: Won't lose data on container restarts

## Step 1: Add PostgreSQL Service to Railway

1. **Go to your Railway project dashboard**
2. **Click "New Service"**
3. **Select "Database" → "PostgreSQL"**
4. **Railway will automatically create a PostgreSQL database**
5. **Copy the `DATABASE_URL` from the PostgreSQL service**

## Step 2: Update Environment Variables

Add this to your API service environment variables:
```
DATABASE_URL=[PostgreSQL connection string from Railway]
```

## Step 3: Update Prisma Schema

Replace your current `schema.prisma` with the PostgreSQL version:

```bash
# In your local terminal
cd apps/api
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

## Step 4: Generate and Deploy

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database (creates tables)
pnpm prisma db push

# Build and deploy
pnpm build
```

## Step 5: Verify Connection

Your API should now connect to PostgreSQL successfully!

## 🔄 Migration from SQLite to PostgreSQL

If you have existing data in SQLite, you can migrate it:

1. **Export SQLite data**:
   ```bash
   pnpm prisma db pull --schema=./prisma/schema.sqlite.prisma
   ```

2. **Import to PostgreSQL**:
   ```bash
   pnpm prisma db push --schema=./prisma/schema.prisma
   ```

## 🚀 Quick Start (Recommended)

**Just add the PostgreSQL service in Railway and update the DATABASE_URL - that's it!**
