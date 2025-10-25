# Railway Dashboard Configuration Guide

## Step-by-Step Railway Setup

Follow these steps to configure your Railway API service with the correct environment variables.

### 1. Access Railway Dashboard

1. Go to [Railway.app](https://railway.app)
2. Sign in to your account
3. Navigate to your project
4. Click on your **API service** (not the PostgreSQL service)

### 2. Configure Environment Variables

Click on the **"Variables"** tab in your API service dashboard.

#### Add/Update These Variables:

**Critical Database & Network Variables:**
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
NODE_ENV = production
PORT = 4000
ALLOWED_ORIGINS = https://synq-dapp.vercel.app,https://synq-dapp-*.vercel.app
```

**Pinata IPFS Variables:**
```
PINATA_API_KEY = 43f3c9f36e841afc92f4
PINATA_SECRET_KEY = 463e06c0e8b6aca24b292810a16af9ce19960890101bff33f63866de12021b4e
PINATA_JWT = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4OTVmMWI4NS0xY2FjLTQ2YTktOWE5OC1iMDk4Yzg0OTFmNWEiLCJlbWFpbCI6ImFkZXd1eWlxYUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDNmM2M5ZjM2ZTg0MWFmYzkyZjQiLCJzY29wZWRLZXlTZWNyZXQiOiI0NjNlMDZjMGU4YjZhY2EyNGIyOTI4MTBhMTZhZjljZTE5OTYwODkwMTAxYmZmMzNmNjM4NjZkZTEyMDIxYjRlIiwiZXhwIjoxNzkxNzE2NTM3fQ.gIFx1a8ksaRM1Verk2NVqke7hVNc6IM-uqvt6fCodEk
```

**Quai Network Variables:**
```
QUAI_RPC_URL = https://orchard.rpc.quai.network/cyprus1
```

### 3. Important Notes

**DATABASE_URL Configuration:**
- Use `${{Postgres.DATABASE_URL}}` (Railway reference variable)
- This automatically uses the private network connection
- Avoids egress fees and is faster than public URL
- Only works when API is deployed on Railway (same network as database)

**CORS Configuration:**
- `ALLOWED_ORIGINS` includes your Vercel domain
- Supports both main domain and preview deployments
- Allows your frontend to communicate with the API

### 4. Deploy the Changes

1. After adding all environment variables, click **"Deploy"**
2. Monitor the **"Deployments"** tab for build progress
3. Check the **"Logs"** tab for any errors during deployment

### 5. Verify Service Status

In the Railway dashboard:

1. **Service Status**: Should show "Running" (not "Stopped" or "Crashed")
2. **Public Domain**: Should be active (e.g., `api-production-af00.up.railway.app`)
3. **Resource Usage**: Check CPU/Memory usage isn't at limits
4. **Postgres Connection**: Ensure PostgreSQL service is linked and running

### 6. Test the Deployment

After deployment completes, test these endpoints:

1. **Health Check**: `https://api-production-af00.up.railway.app/health`
2. **Posts Endpoint**: `https://api-production-af00.up.railway.app/posts`
3. **Your Vercel App**: `https://synq-dapp.vercel.app/`

### 7. Troubleshooting

**If deployment fails:**
- Check **"Logs"** tab for specific error messages
- Verify all environment variables are set correctly
- Ensure PostgreSQL service is running and linked
- Check if service hit memory/CPU limits

**If API returns 502 errors:**
- Service might be crashed - check logs
- Database connection might be failing
- CORS might be blocking requests
- Check if all required environment variables are set

**If posts don't load:**
- Verify `ALLOWED_ORIGINS` includes your Vercel domain
- Check if `DATABASE_URL` is using the private network
- Ensure Prisma client is generated correctly

### 8. Expected Results

After successful configuration:
- ✅ API health endpoint returns `{"status":"ok"}`
- ✅ Posts endpoint returns your existing posts
- ✅ Vercel frontend can connect to the API
- ✅ All your existing data is preserved
- ✅ No egress fees for database connections

## Next Steps

Once Railway is configured and running:
1. Test your Vercel app: `https://synq-dapp.vercel.app/`
2. Connect your wallet
3. Verify posts load correctly
4. Test creating new posts
5. Confirm all social features work

Your data is safe - this only fixes the API connection, no database changes are made!
