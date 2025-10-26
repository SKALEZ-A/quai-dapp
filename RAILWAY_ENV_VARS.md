# Railway Environment Variables Setup

## 🚨 CRITICAL: Add these environment variables to Railway

### Required Environment Variables for Railway Dashboard:

1. **DATABASE_URL** (CRITICAL - Missing!)
   ```
   DATABASE_URL=file:./prisma/prod.db
   ```

2. **Existing Variables** (Verify these are set):
   ```
   NODE_ENV=production
   PORT=4000
   ALLOWED_ORIGINS=https://synq-dapp.vercel.app,https://synq-dapp-*.vercel.app
   PINATA_API_KEY=43f3c9f36e841afc92f4
   PINATA_SECRET_KEY=463e06c0e8b6aca24b292810a16af9ce19960890101bff33f63866de12021b4e
   PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4OTVmMWI4NS0xY2FjLTQ2YTktOWE5OC1iMDk4Yzg0OTFmNWEiLCJlbWFpbCI6ImFkZXd1eWlxYUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDNmM2M5ZjM2ZTg0MWFmYzkyZjQiLCJzY29wZWRLZXlTZWNyZXQiOiI0NjNlMDZjMGU4YjZhY2EyNGIyOTI4MTBhMTZhZjljZTE5OTYwODkwMTAxYmZmMzNmNjM4NjZkZTEyMDIxYjRlIiwiZXhwIjoxNzkxNzE2NTM3fQ.gIFx1a8ksaRM1Verk2NVqke7hVNc6IM-uqvt6fCodEk
   QUAI_RPC_URL=https://orchard.rpc.quai.network/cyprus1
   ```

## 🔧 How to Add Environment Variables in Railway:

1. Go to your Railway project dashboard
2. Click on your API service
3. Go to the "Variables" tab
4. Click "New Variable"
5. Add each variable above
6. Click "Deploy" to restart the service

## ⚠️ IMPORTANT:
The `DATABASE_URL` is the critical missing variable causing the database connection errors in your logs.
