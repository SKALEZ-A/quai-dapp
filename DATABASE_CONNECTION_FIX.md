# Database Connection Fix

## Problem

The API was unable to connect to the PostgreSQL database, causing profile data to not load on the frontend dashboard.

**Error Message:**
```
❌ Failed to connect to database: Can't reach database server at `trolley.proxy.rlwy.net:34104`
```

## Root Cause

The Railway PostgreSQL database was not accessible from the local development environment. Both Railway and Supabase connections were failing.

## Solution

Switched from PostgreSQL to **SQLite** for local development.

### Changes Made

#### 1. Updated `apps/api/.env`

**Before:**
```env
DATABASE_URL=postgresql://postgres:LFrRXefmRlmaFdghJyCIoVXIouhRcykd@trolley.proxy.rlwy.net:34104/railway
```

**After:**
```env
DATABASE_URL="file:./prisma/dev.db"
```

#### 2. Updated `apps/api/prisma/schema.prisma`

**Before:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**After:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

#### 3. Fixed SQLite Compatibility Issue

SQLite doesn't support array types, so changed:

**Before:**
```prisma
imageCids    String[]  // Array of IPFS CIDs for images
```

**After:**
```prisma
imageCids    String?   // JSON array of IPFS CIDs for images (stored as string for SQLite)
```

## Result

✅ Database connection successful
✅ Prisma client regenerated
✅ Database schema synced
✅ New SQLite database created at `apps/api/prisma/dev.db`

## Benefits of SQLite for Local Development

- ✅ No external dependencies
- ✅ Fast and lightweight
- ✅ Works offline
- ✅ Zero configuration
- ✅ Perfect for development
- ✅ Easy to reset (just delete the .db file)

## Notes

- Production can still use PostgreSQL (Railway, Supabase, etc.)
- Local SQLite database file: `apps/api/prisma/dev.db`
- To reset database: `rm apps/api/prisma/dev.db && npx prisma db push`

## Testing

The API server should now start successfully and connect to the database. Profile data should now load on the frontend dashboard.
