# 🧪 Testnet Testing Guide - Quai Superapp

## 📋 Deployment Summary

All contracts have been successfully deployed to **Quai Testnet (Orchard Network)** on Cyprus1 zone.

### 🎯 Deployed Contract Addresses

| Contract | Address | Purpose |
|----------|---------|---------|
| **QNS Registry** | `0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61` | Core name registry system |
| **QNS Controller** | `0x0020331A51B939f5e8286541F0C6c38530909782` | Name registration controller |
| **Auction Manager** | `0x0062f900e9E98fd3e605F886e7728791E5C4F09b` | Handles name auctions |
| **Reserved Names** | `0x00289917bf2b8b83623e3Ac4Da7E43d000B008F5` | Manages reserved names |
| **QNS NFT** | `0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2` | NFT representation of names |
| **Payment Resolver** | `0x006Ca4C000E7E642f4ac40dF011f5b693Dc2bE54` | Handles Qi code payments |
| **Reverse Registrar** | `0x00513E6e1Ab004f091B788A1FeE57f31265317fC` | Reverse name resolution |
| **Social Posts** | `0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910` | Social media posts on-chain |

### 🔗 Network Information

- **Network**: Testnet (Orchard)
- **Chain ID**: 15000
- **RPC URL**: `https://orchard.rpc.quai.network`
- **Explorer**: https://quaiscan.io
- **Deployer/Admin**: `0x003DAC94805c77d7fD485cd415F8078414d171e4`

---

## 🚀 Getting Started

### 1. Prerequisites

Before testing, ensure you have:

- [ ] **Pelagus Wallet** installed and configured for testnet
- [ ] **Testnet QUAI tokens** from the [Quai Faucet](https://faucet.quai.network/)
- [ ] Node.js 18+ and pnpm installed
- [ ] All project dependencies installed

### 2. Install Dependencies

```bash
cd /Users/mac/Desktop/CODES/HACKATHON/QUAI_Rocster/QUAI
pnpm install
```

### 3. Start the Development Services

#### Option A: Start All Services Together

```bash
# Start everything (recommended for testing)
pnpm run dev
```

#### Option B: Start Services Individually

```bash
# Terminal 1: Start the API
cd apps/api
pnpm run prisma:migrate -- --name init
pnpm run prisma:generate
pnpm run dev

# Terminal 2: Start the Indexer (background worker)
cd apps/api
pnpm run indexer

# Terminal 3: Start the Frontend
cd apps/web
pnpm run dev
```

### 4. Access the Application

Once services are running:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql

---

## 🧪 Feature Testing Guide

### A. QNS (Quai Name Service) Testing

#### 1. **Name Search & Availability**

**Location**: Navigate to `/qns` or `/qns/namesearch`

**Test Steps**:
1. Enter a name you want to register (e.g., "myname")
2. Click "Search" or "Check Availability"
3. Verify the availability status is displayed
4. Check the registration price if available

**Expected Behavior**:
- Available names show "Available" status
- Reserved names show "Reserved" status
- Registered names show owner information

#### 2. **Name Registration**

**Location**: `/qns/namesearch` → Click on available name

**Test Steps**:
1. Connect your Pelagus wallet
2. Ensure you're on Cyprus1 testnet
3. Search for an available name
4. Click "Register Name"
5. Confirm the transaction in your wallet
6. Wait for transaction confirmation

**Expected Behavior**:
- Transaction is broadcasted
- Name becomes associated with your address
- NFT is minted to represent the name
- You can see the name in your profile

**Verify On-Chain**:
```bash
# Check on QuaiScan
https://quaiscan.io/address/0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61
```

#### 3. **Reverse Name Resolution**

**Location**: `/qns/profile` or any page showing addresses

**Test Steps**:
1. Register a name (e.g., "johndoe")
2. Set reverse resolution for your address
3. Navigate to any page that displays your address
4. Verify your name appears instead of the address

**Expected Behavior**:
- Address `0x003D...` displays as "johndoe.quai"
- Hovering shows full address details

#### 4. **Subname Management**

**Location**: `/qns/subnames`

**Test Steps**:
1. Register a parent name (e.g., "company")
2. Navigate to subnames management
3. Create a subname (e.g., "team.company")
4. Assign the subname to another address
5. Verify the subname resolution

**Expected Behavior**:
- Subnames are created under parent name
- Each subname can have different owner
- Subname records are independently manageable

#### 5. **Name Records (DNS-like)**

**Location**: `/qns/records`

**Test Steps**:
1. Select one of your registered names
2. Add various records:
   - Address record (crypto address)
   - Content hash (IPFS CID)
   - Text records (email, avatar, etc.)
3. Save changes
4. Query the records via API or contract

**Expected Behavior**:
- Records are stored on-chain
- Multiple record types are supported
- Records can be updated by owner

---

### B. Social dApp Testing

#### 1. **Creating Posts**

**Location**: `/social` or `/dashboard/social`

**Test Steps**:
1. Connect wallet
2. Click "Create Post" button
3. Write post content (supports markdown)
4. Optionally add media/images
5. Select visibility (public/private)
6. Click "Post"
7. Confirm transaction

**Expected Behavior**:
- Post content is stored on IPFS
- CID is anchored on-chain via SocialPosts contract
- Post appears in your feed immediately
- Event is emitted: `PostCreated(author, cid, zone)`

**Verify On-Chain**:
```bash
# Check SocialPosts contract events
https://quaiscan.io/address/0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910
```

#### 2. **Viewing Feed**

**Location**: `/social` or `/dashboard/social`

**Test Steps**:
1. Navigate to social feed
2. Scroll through posts
3. Filter by:
   - Recent posts
   - Following only
   - Popular posts
4. Click on individual posts for details

**Expected Behavior**:
- Posts load from GraphQL API
- Indexer has processed on-chain events
- Posts show author name (if QNS registered)
- Images/media display correctly

#### 3. **Engagement (Likes, Comments, Shares)**

**Location**: Individual post pages

**Test Steps**:
1. Open a post
2. Click "Like" button
3. Add a comment
4. Share the post
5. Check engagement counters

**Expected Behavior**:
- Likes are recorded on-chain
- Comments create new on-chain events
- Shares increment counter
- Author receives notifications

#### 4. **Tipping (Qi Payments)**

**Location**: Post actions menu

**Test Steps**:
1. View a post you want to tip
2. Click "Tip" or "Send Qi" button
3. Enter Qi code (from Payment Resolver)
4. Confirm payment
5. Verify transaction

**Expected Behavior**:
- Payment is processed through QiPaymentResolver
- Author receives funds
- Tip is displayed on post
- Payment event is emitted

#### 5. **NFT Sharing**

**Location**: Post creation modal or `/dashboard/post`

**Test Steps**:
1. Create a new post
2. Select "Share NFT" option
3. Choose an NFT from your wallet
4. Attach NFT metadata to post
5. Publish post

**Expected Behavior**:
- NFT metadata displays in post
- Link to NFT on OpenSea/marketplace
- NFT image renders in feed
- Engagement with NFT post

---

### C. Profile & Dashboard Testing

#### 1. **User Profile**

**Location**: `/dashboard/profile` or `/qns/profile`

**Test Steps**:
1. Navigate to your profile
2. View registered names
3. See your social posts
4. Check engagement statistics
5. Edit profile information

**Expected Behavior**:
- All owned names are listed
- Post history is displayed
- Stats are accurate (followers, likes, etc.)
- Profile is editable

#### 2. **Edit Profile**

**Location**: `/dashboard/settings`

**Test Steps**:
1. Click "Edit Profile"
2. Update:
   - Display name
   - Bio/description
   - Avatar (IPFS)
   - Social links
3. Save changes
4. Verify updates persist

**Expected Behavior**:
- Changes save to database
- Profile updates reflect immediately
- Avatar uploads to IPFS
- Settings persist across sessions

#### 3. **Dashboard Overview**

**Location**: `/dashboard` or `/dashboard/overview`

**Test Steps**:
1. Navigate to dashboard
2. View statistics:
   - Total names owned
   - Posts created
   - Engagement metrics
3. Check recent activity feed
4. View notifications

**Expected Behavior**:
- Stats are current and accurate
- Activity feed shows recent events
- Notifications work properly
- Links navigate correctly

---

### D. Analytics Testing

**Location**: `/dashboard/analytics`

**Test Steps**:
1. Navigate to analytics page
2. View various metrics:
   - Name registration trends
   - Post engagement rates
   - User growth over time
3. Filter by date range
4. Export data if available

**Expected Behavior**:
- Charts and graphs render correctly
- Data is accurate based on on-chain events
- Filters work properly
- Export functionality works

---

## 🔍 Backend & API Testing

### 1. GraphQL API Testing

**Access GraphQL Playground**: http://localhost:4000/graphql

#### Query Posts

```graphql
query GetPosts {
  posts(limit: 10, offset: 0) {
    id
    cid
    author
    zone
    createdAt
    engagement {
      likes
      comments
      shares
    }
  }
}
```

#### Query Names

```graphql
query GetNames {
  qnsNames(limit: 10) {
    id
    name
    owner
    resolver
    registeredAt
  }
}
```

### 2. Indexer Testing

**Check Indexer Logs**:
```bash
cd apps/api
pnpm run indexer
```

**Expected Behavior**:
- Indexer connects to Quai RPC
- Polls for new blocks
- Processes contract events
- Stores data in database
- Logs activity clearly

**Verify Database**:
```bash
cd apps/api
npx prisma studio
# Opens database GUI at http://localhost:5555
```

### 3. REST API Endpoints

**Base URL**: http://localhost:4000

#### Test Engagements

```bash
# Create engagement (like)
curl -X POST http://localhost:4000/api/engagements \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "post-cid-here",
    "address": "0x003DAC94805c77d7fD485cd415F8078414d171e4",
    "type": "like"
  }'

# Get engagements for a post
curl http://localhost:4000/api/engagements/post-cid-here
```

---

## 🐛 Common Issues & Troubleshooting

### Issue 1: "Insufficient Balance"

**Solution**:
- Get testnet tokens from https://faucet.quai.network/
- Ensure you're connected to Cyprus1 zone
- Check your wallet balance in Pelagus

### Issue 2: "Transaction Failed"

**Solution**:
- Verify you're on the correct network (Testnet, Chain ID 15000)
- Check gas limits in transaction
- Ensure contract addresses are correct
- Try increasing gas price slightly

### Issue 3: "Name Already Registered"

**Solution**:
- Search for a different name
- Check if the name is reserved
- Verify spelling and format

### Issue 4: "Indexer Not Working"

**Solution**:
```bash
# Restart the indexer
cd apps/api
pnpm run indexer

# Check database connection
npx prisma studio

# Verify RPC connection
curl https://orchard.rpc.quai.network/cyprus1
```

### Issue 5: "Frontend Not Connecting to Wallet"

**Solution**:
- Ensure Pelagus wallet is installed
- Switch to Testnet in Pelagus settings
- Refresh the page
- Check browser console for errors

---

## 📊 Monitoring & Verification

### On-Chain Verification

1. **Check Transactions on QuaiScan**:
   - Visit https://quaiscan.io
   - Enter your address or transaction hash
   - Verify transaction status and events

2. **Verify Contract Events**:
   - View contract addresses listed above
   - Check "Events" tab for recent activity
   - Confirm your transactions appear

3. **Check Contract State**:
   - Use QuaiScan "Read Contract" feature
   - Query name ownership
   - Verify post anchors

### Off-Chain Verification

1. **Database**:
   ```bash
   cd apps/api
   npx prisma studio
   ```
   - Check posts table
   - Verify engagements
   - Review indexed events

2. **IPFS Content**:
   - For any CID, visit: `https://ipfs.io/ipfs/<CID>`
   - Verify content is pinned
   - Check media files load correctly

---

## ✅ Testing Checklist

### Core Functionality

- [ ] Connect wallet to testnet
- [ ] Get testnet tokens from faucet
- [ ] Search for available names
- [ ] Register a QNS name
- [ ] Set reverse resolution
- [ ] Create subnames
- [ ] Add name records
- [ ] Create a social post
- [ ] Like/comment on posts
- [ ] Tip a post with Qi
- [ ] Share NFT in post
- [ ] Edit user profile
- [ ] View dashboard analytics
- [ ] Check post in explorer
- [ ] Verify data in database

### Edge Cases

- [ ] Try registering reserved name
- [ ] Attempt to register existing name
- [ ] Test with empty wallet
- [ ] Create post with no content
- [ ] Test maximum content length
- [ ] Try invalid Qi code
- [ ] Test with wrong network
- [ ] Verify role-based access

### Performance

- [ ] Load time for feed < 2 seconds
- [ ] Transaction confirmation < 30 seconds
- [ ] Indexer processes events within 1 minute
- [ ] API response time < 500ms
- [ ] Images load efficiently

---

## 📝 Test Scenarios

### Scenario 1: New User Registration Flow

1. User visits the site
2. Connects Pelagus wallet
3. Searches for desired name
4. Registers name (first transaction)
5. Sets avatar and bio
6. Creates first post (second transaction)
7. Follows other users
8. Engages with content

### Scenario 2: Power User Activity

1. User has multiple names registered
2. Creates posts across different topics
3. Manages subnames for team
4. Receives tips from followers
5. Shares valuable NFTs
6. High engagement on posts
7. Uses analytics to track growth

### Scenario 3: Business Use Case

1. Company registers brand name
2. Creates subnames for departments
3. Team members assigned subnames
4. Company posts updates
5. Customers engage with posts
6. Uses Qi codes for payments
7. Tracks customer engagement

---

## 🔐 Security Testing

### Test for Common Vulnerabilities

- [ ] SQL injection attempts
- [ ] XSS in post content
- [ ] CSRF protection
- [ ] Access control enforcement
- [ ] Rate limiting on API
- [ ] Input validation
- [ ] Proper authentication
- [ ] Signature verification

---

## 📞 Support & Resources

### Documentation

- **Quai Docs**: https://docs.qu.ai/
- **Quais SDK**: https://docs.qu.ai/sdk/introduction
- **QuaiScan**: https://quaiscan.io

### Community

- **Discord**: https://discord.gg/quai
- **Faucet**: https://faucet.quai.network/

### Project Files

- **Deployment Guide**: `/packages/contracts/DEPLOYMENT_GUIDE.md`
- **Architecture**: `/docs/architecture.md`
- **API Docs**: `/apps/api/README.md`

---

## 🎉 Success Metrics

Your testing is successful when:

✅ All contracts are deployed and functional  
✅ Users can register and manage QNS names  
✅ Social posts are created and indexed  
✅ Engagement features work correctly  
✅ Payment system functions properly  
✅ Dashboard displays accurate data  
✅ No critical errors in console/logs  
✅ Performance meets expectations  

---

**Happy Testing! 🚀**

If you encounter any issues not covered in this guide, please check:
1. Browser console for errors
2. API logs for backend issues
3. QuaiScan for transaction details
4. Prisma Studio for database state

