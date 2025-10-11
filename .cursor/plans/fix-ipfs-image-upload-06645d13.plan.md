<!-- 06645d13-0380-4e44-8070-164e77e94afe a88e56e4-8a9f-442e-96f6-67e1b6cbdf17 -->
# Fix IPFS Image Upload and Production Readiness

## Problem Analysis

The gray placeholder showing `local_img_1760092543...` confirms that:

1. Images are being uploaded from the frontend successfully
2. The backend is receiving the images via multer
3. **IPFS upload to NFT.Storage is failing** (line 134-138 in `apps/api/src/routes/posts.ts`)
4. System falls back to local CID placeholders
5. Frontend displays placeholder SVG for local_ prefixed CIDs

## Root Causes Identified

1. **No error logging in IPFS service** - Silent failures in `uploadImage()` and `uploadImages()`
2. **Potential API token issue** - Need to verify token validity and format
3. **Missing try-catch in IPFS service** - Errors bubble up without context
4. **No validation of NFT.Storage response** - Could be receiving errors disguised as success

## Implementation Steps

### 1. Add Comprehensive Error Logging to IPFS Service

**File:** `apps/api/src/services/ipfs.ts`

- Add try-catch blocks with detailed error logging
- Log token validation on service initialization
- Add request/response logging for debugging
- Validate NFT.Storage client creation

### 2. Verify and Update NFT_STORAGE_TOKEN Configuration

**Files:** `apps/api/.env`, `apps/api/ENV_EXAMPLE`

- Confirm token `72ddb578.cb4e0eb478ee4c1299429027cdf049aa` is correctly set
- Update ENV_EXAMPLE to show correct variable name
- Add token validation endpoint for testing

### 3. Add API Health Check for IPFS

**File:** `apps/api/src/routes/posts.ts` or new health route

- Create endpoint to test NFT.Storage connectivity
- Verify token validity before accepting uploads
- Return meaningful error messages to frontend

### 4. Improve Frontend Error Handling

**File:** `apps/web/src/hooks/useSocial.ts`

- Capture and display IPFS upload errors to users
- Add retry logic for failed uploads
- Show upload progress indicators

### 5. Critical Production Issues Review

Based on Farcaster patterns and production best practices:

#### **CRITICAL - Security Issues:**

- ✅ EIP-712 signature verification (already implemented)
- ⚠️ **Missing rate limiting** on post creation endpoint
- ⚠️ **No image size/type validation** beyond 10MB multer limit
- ⚠️ **CORS origins hardcoded** - needs production URLs
- ⚠️ **Private key exposed in .env** (line 20 of web/.env) - MUST remove before deployment

#### **CRITICAL - Functionality Issues:**

- ⚠️ **No image optimization** - uploading raw images to IPFS (expensive, slow)
- ⚠️ **Single IPFS gateway** - no fallback if nftstorage.link is down
- ⚠️ **No content moderation** - required for public deployment
- ⚠️ **Missing pagination** on frontend (backend has cursor support)

#### **CRITICAL - Performance Issues:**

- ⚠️ **No caching layer** - every post fetch hits database
- ⚠️ **No CDN for IPFS images** - slow load times
- ⚠️ **Synchronous IPFS uploads** - blocks post creation

### 6. Implement Critical Fixes for Production

**Priority 1 (Blocking):**

- Fix IPFS upload with proper error handling
- Remove exposed private key from repository
- Add environment-based CORS configuration
- Add rate limiting middleware

**Priority 2 (High):**

- Add multiple IPFS gateway fallbacks
- Implement image optimization before upload
- Add basic content validation (file types, sizes)
- Add loading states for image uploads

**Priority 3 (Medium):**

- Add Redis caching layer
- Implement pagination on frontend
- Add retry logic for failed uploads
- Add monitoring/alerting for IPFS failures

## Files to Modify

1. `apps/api/src/services/ipfs.ts` - Add error handling and logging
2. `apps/api/src/routes/posts.ts` - Improve error responses
3. `apps/api/.env` - Verify NFT_STORAGE_TOKEN
4. `apps/web/.env` - **REMOVE PRIVATE_KEY** before deployment
5. `apps/web/src/hooks/useSocial.ts` - Better error handling
6. `apps/web/app/dashboard/social/page.tsx` - Add multiple gateway fallbacks
7. `apps/api/src/index.ts` - Add rate limiting middleware
8. New file: `apps/api/src/middleware/rateLimiter.ts`

## Testing Plan

1. Test NFT.Storage API key validity with curl
2. Upload test image and verify IPFS CID
3. Test image display with multiple gateways
4. Verify error messages propagate to frontend
5. Test rate limiting functionality
6. Verify CORS works with production URLs

## Success Criteria

- ✅ Images upload successfully to IPFS
- ✅ Real IPFS CIDs (not local_ prefixed) in database
- ✅ Images display correctly in feed
- ✅ Meaningful error messages when upload fails
- ✅ No private keys in repository
- ✅ Rate limiting prevents abuse
- ✅ Multiple gateway fallbacks for reliability

### To-dos

- [ ] Add comprehensive error logging and validation to IPFS service
- [ ] Test and verify NFT.Storage API token validity
- [ ] Implement multiple IPFS gateway fallbacks in frontend
- [ ] Remove exposed private key from web/.env file
- [ ] Implement rate limiting middleware for API endpoints
- [ ] Add proper error handling and user feedback in frontend
- [ ] Configure environment-based CORS for production
- [ ] Test complete image upload flow end-to-end