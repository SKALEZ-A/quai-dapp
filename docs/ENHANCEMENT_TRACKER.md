# 🔧 Project Enhancement Tracker

**Created:** Nov 15, 2024  
**Status:** In Progress  
**Priority:** High

---

## 📋 Overview

This document tracks the implementation of critical UI/UX improvements and bug fixes for the Quai Superapp social platform.

---

## ✅ Enhancement Checklist

### 1. ❌ Blank Profile Image Issue
**Status:** 🔴 Not Started  
**Priority:** High  
**Issue:** Users with no profile image show broken image or incorrect fallback

**Required Changes:**
- [ ] Update default avatar fallback in `useCurrentUser.ts`
- [ ] Add proper blank/default avatar image in public assets
- [ ] Ensure all avatar displays use consistent fallback logic
- [ ] Update `EditProfileModal.tsx` to show proper placeholder

**Files to Modify:**
- `apps/web/src/hooks/useCurrentUser.ts`
- `apps/web/app/dashboard/social/page.tsx`
- `apps/web/app/dashboard/profile/page.tsx`
- `apps/web/public/assets/avatars/` (add default-avatar.png)

---

### 2. ❌ Wallet Extension Restriction (Pelagus Only)
**Status:** 🔴 Not Started  
**Priority:** High  
**Issue:** App should only prompt Pelagus wallet, blocking other extensions

**Required Changes:**
- [ ] Update `quai.ts` to enforce Pelagus detection
- [ ] Add wallet validation before connection
- [ ] Show user-friendly error for non-Pelagus wallets
- [ ] Update Web3Modal config to hide other wallets

**Files to Modify:**
- `apps/web/src/lib/quai.ts`
- `apps/web/src/lib/config.ts`
- Add new component: `apps/web/src/components/WalletGuard.tsx`

---

### 3. ❌ Transaction Sending on User Overview
**Status:** 🔴 Not Started  
**Priority:** Critical  
**Issue:** Transactions not sending properly from overview page

**Required Changes:**
- [ ] Debug transaction flow in overview page
- [ ] Verify signer connection in transaction manager
- [ ] Add proper error handling and user feedback
- [ ] Test with Pelagus wallet connection

**Files to Modify:**
- `apps/web/app/dashboard/overview/page.tsx`
- `apps/web/src/lib/transactionManager.ts`
- `apps/web/src/lib/qns.ts` (sendFundsToDomain function)

**Investigation Points:**
- Check if wallet is properly connected
- Verify gas estimation is working
- Ensure signer is attached to contract
- Check for network mismatches

---

### 4. ❌ Profile Image Upload Failures
**Status:** 🔴 Not Started  
**Priority:** High  
**Issue:** Profile images failing to upload to Pinata/IPFS

**Required Changes:**
- [ ] Add detailed error logging in upload flow
- [ ] Verify Pinata API keys in environment
- [ ] Add file size validation (max 5MB)
- [ ] Add image format validation (jpg, png, webp, gif)
- [ ] Improve error messages for users
- [ ] Add upload progress indicator

**Files to Modify:**
- `apps/api/src/services/pinata.ts`
- `apps/api/src/routes/profiles.ts`
- `apps/web/src/hooks/useProfile.ts`
- `apps/web/src/components/EditProfileModal.tsx`

**Debug Steps:**
1. Check Pinata API key validity
2. Verify file buffer creation
3. Test with different image sizes
4. Add request/response logging

---

### 5. ❌ Like Button Color (Pink on Active)
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Issue:** Like button should turn pink when user likes a post (professional social app UX)

**Required Changes:**
- [ ] Track user's like status in post state
- [ ] Update LikeIcon component to accept color prop
- [ ] Change hover color from red to pink
- [ ] Update active state to use pink (#EC4899 or similar)
- [ ] Add smooth color transition

**Files to Modify:**
- `apps/web/app/dashboard/social/page.tsx`
- `apps/web/app/dashboard/profile/page.tsx`
- `apps/web/app/dashboard/post/[postId]/page.tsx`
- `apps/web/src/hooks/useSocial.ts`

**Color Specifications:**
- Default: `text-gray-400`
- Hover: `hover:text-pink-500`
- Active: `text-pink-500` (#EC4899)
- Fill icon when liked

---

### 6. ❌ Remove Seconds from Timestamps
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Issue:** Timestamps show seconds (unprofessional) - should show relative time

**Current Format:**
```
8:44:16 PM
```

**Desired Format:**
```
2h ago
5m ago
Yesterday
Nov 12
```

**Required Changes:**
- [ ] Create `formatTimeAgo()` utility function
- [ ] Replace all `toLocaleTimeString()` calls
- [ ] Update social feed timestamp display
- [ ] Update profile page timestamp display
- [ ] Update overview page timestamp display

**Files to Modify:**
- Create: `apps/web/src/utils/timeFormat.ts`
- `apps/web/app/dashboard/social/page.tsx`
- `apps/web/app/dashboard/profile/page.tsx`
- `apps/web/app/dashboard/overview/page.tsx`
- `apps/web/app/dashboard/post/[postId]/page.tsx`

**Implementation:**
```typescript
function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const postDate = new Date(date);
  const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
```

---

### 7. ❌ Following Tab Feed Filter
**Status:** 🔴 Not Started  
**Priority:** High  
**Issue:** "Following" tab shows all posts instead of only posts from followed users

**Required Changes:**
- [ ] Add follow relationship check in API query
- [ ] Update `useSocial` hook to accept filter parameter
- [ ] Filter posts by author in followed list
- [ ] Update social page to pass activeTab to hook
- [ ] Show empty state when not following anyone
- [ ] Add "Find people to follow" CTA

**Files to Modify:**
- `apps/api/src/routes/posts.ts` (add followingOnly parameter)
- `apps/web/src/hooks/useSocial.ts`
- `apps/web/src/lib/api.ts` (add filter to getPosts)
- `apps/web/app/dashboard/social/page.tsx`

**API Changes:**
```typescript
GET /posts?followingOnly=true&currentUserAddress=0x...
```

**Implementation Logic:**
1. Get list of addresses current user follows
2. Filter posts where author.address is in following list
3. Sort by createdAt descending
4. Return filtered results

---

## 🔍 Technical Details

### Default Avatar Path
```
/assets/avatars/default-avatar.png
```

### Pelagus Detection
```typescript
const isPelagus = window.ethereum?.isPelagus || 
                  window.pelagus?.ethereum ||
                  window.ethereum?.providers?.some(p => p.isPelagus);
```

### Pink Color Theme
```css
/* Tailwind classes */
text-pink-500: #EC4899
hover:text-pink-600: #DB2777
bg-pink-500: #EC4899
```

---

## 📊 Testing Checklist

### Profile Images
- [ ] Test with no profile image set
- [ ] Test uploading JPG, PNG, GIF, WebP
- [ ] Test file size limits (< 5MB)
- [ ] Test with slow network
- [ ] Verify IPFS CID is saved correctly

### Wallet Connection
- [ ] Test with Pelagus installed
- [ ] Test without Pelagus (should show error)
- [ ] Test with MetaMask installed
- [ ] Test connection persistence

### Transactions
- [ ] Test sending from overview page
- [ ] Test with insufficient balance
- [ ] Test with invalid domain
- [ ] Test transaction confirmation

### Like Functionality
- [ ] Like a post (should turn pink)
- [ ] Unlike a post (should return to gray)
- [ ] Like count should update
- [ ] Like state persists on refresh

### Timestamps
- [ ] Recent posts (< 1 minute)
- [ ] Posts within last hour
- [ ] Posts within last day
- [ ] Posts older than a week

### Following Filter
- [ ] Following tab with no follows
- [ ] Following tab with 1+ follows
- [ ] Switch between For You and Following
- [ ] Verify only followed users' posts show

---

## 🚀 Deployment Checklist

Before deploying these changes:

1. **Environment Variables**
   - [ ] Verify PINATA_API_KEY is set
   - [ ] Verify PINATA_SECRET_KEY is set
   - [ ] Check all RPC endpoints

2. **Database**
   - [ ] Run migrations if needed
   - [ ] Test queries with production data volume

3. **Frontend Build**
   - [ ] Build without errors
   - [ ] Check bundle size
   - [ ] Test in production mode

4. **API Health**
   - [ ] Verify all endpoints respond
   - [ ] Check response times
   - [ ] Monitor error rates

---

## 📝 Implementation Order

1. ✅ Document current status (this file)
2. Profile image upload fix (critical for UX)
3. Default avatar fallback (quick win)
4. Following tab filter (improves social experience)
5. Like button pink color (polish)
6. Remove seconds from timestamps (polish)
7. Pelagus-only restriction (may affect users)
8. Transaction sending fix (requires investigation)

---

## 🐛 Known Issues

### Discovered During Investigation
1. **Profile Image URLs**: Currently using Pinata gateway, some CDN delays
2. **Timestamp Formatting**: Using native JS methods, inconsistent across locales
3. **Like State**: Not tracked client-side, requires refetch
4. **Following Relationships**: No caching, queries on every render

---

## 📚 Additional Resources

- [Pinata IPFS Documentation](https://docs.pinata.cloud/)
- [Pelagus Wallet Docs](https://pelaguswallet.io/docs)
- [Quai Network Documentation](https://docs.quai.network/)
- [Web3Modal Documentation](https://docs.walletconnect.com/web3modal/about)

---

**Last Updated:** Nov 15, 2024  
**Next Review:** After implementation completion
