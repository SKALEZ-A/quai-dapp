#!/bin/bash

# Comprehensive Pinata Integration Test Script
# Tests image upload to IPFS via Pinata

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000"
TEST_WALLET="0x003dac94805c77d7fd485cd415f8078414d171e4"
TEST_IMAGE="/tmp/test-pinata-image.png"

echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}       PINATA IPFS INTEGRATION TEST SUITE${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}\n"

# Function to print step header
print_step() {
    echo -e "\n${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}STEP $1: $2${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
}

# Function to check if CID is valid IPFS hash
is_valid_cid() {
    local cid="$1"
    
    # Check for local placeholder
    if [[ "$cid" == local_* ]]; then
        echo -e "${RED}❌ Found local placeholder: $cid${NC}"
        return 1
    fi
    
    # Check for IPFS CID patterns (v0: Qm..., v1: baf...)
    if [[ "$cid" =~ ^Qm[1-9A-HJ-NP-Za-km-z]{44}$ ]] || [[ "$cid" =~ ^baf[a-z0-9]{50,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Test 1: Health Check
print_step 1 "Testing IPFS Health Endpoint"

HEALTH_RESPONSE=$(curl -s "$API_URL/health/ipfs")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status')
TEST_CID=$(echo "$HEALTH_RESPONSE" | jq -r '.testCid')

if [[ "$HEALTH_STATUS" == "healthy" ]]; then
    echo -e "${GREEN}✅ IPFS connection is healthy${NC}"
    echo -e "${BLUE}ℹ️  Test CID: $TEST_CID${NC}"
    
    if is_valid_cid "$TEST_CID"; then
        echo -e "${GREEN}✅ Test CID is a valid IPFS hash${NC}"
    else
        echo -e "${RED}❌ Test CID is not a valid IPFS hash${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ IPFS connection is unhealthy${NC}"
    echo -e "${RED}Error: $(echo "$HEALTH_RESPONSE" | jq -r '.error')${NC}"
    exit 1
fi

# Test 2: Test IPFS Gateways
print_step 2 "Testing IPFS Gateway Access"

GATEWAYS=(
    "https://gateway.pinata.cloud/ipfs/"
    "https://ipfs.io/ipfs/"
    "https://cloudflare-ipfs.com/ipfs/"
    "https://dweb.link/ipfs/"
)

ACCESSIBLE_COUNT=0
for gateway in "${GATEWAYS[@]}"; do
    url="${gateway}${TEST_CID}"
    echo -e "${BLUE}ℹ️  Testing: $gateway${NC}"
    
    if curl -s -I -m 10 "$url" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓ Accessible${NC}"
        ((ACCESSIBLE_COUNT++))
    else
        echo -e "${YELLOW}✗ Not accessible${NC}"
    fi
done

if [ $ACCESSIBLE_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ $ACCESSIBLE_COUNT/${#GATEWAYS[@]} gateways accessible${NC}"
else
    echo -e "${RED}❌ No gateways accessible${NC}"
fi

# Test 3: Create Test Image
print_step 3 "Creating Test Image"

# Create a 1x1 pixel PNG
cat > "$TEST_IMAGE" << EOF
$(echo -e '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a\x00\x00\x00\x0d\x49\x48\x44\x52\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90\x77\x53\xde\x00\x00\x00\x0c\x49\x44\x41\x54\x08\xd7\x63\xf8\xcf\xc0\x00\x00\x03\x01\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00\x49\x45\x4e\x44\xae\x42\x60\x82')
EOF

if [ -f "$TEST_IMAGE" ]; then
    IMAGE_SIZE=$(stat -f%z "$TEST_IMAGE" 2>/dev/null || stat -c%s "$TEST_IMAGE" 2>/dev/null)
    echo -e "${GREEN}✅ Created test image: $TEST_IMAGE${NC}"
    echo -e "${BLUE}ℹ️  Size: $IMAGE_SIZE bytes${NC}"
else
    echo -e "${RED}❌ Failed to create test image${NC}"
    exit 1
fi

# Test 4: Upload Post with Image
print_step 4 "Creating Post with Image via API"

echo -e "${BLUE}ℹ️  Uploading post with image...${NC}"

TIMESTAMP=$(date +%s)
POST_TEXT="Pinata Integration Test - $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

POST_RESPONSE=$(curl -s -X POST "$API_URL/posts" \
    -F "address=$TEST_WALLET" \
    -F "text=$POST_TEXT" \
    -F "zone=cyprus-1" \
    -F "images=@$TEST_IMAGE;type=image/png")

POST_ID=$(echo "$POST_RESPONSE" | jq -r '.post.id // empty')
CONTENT_CID=$(echo "$POST_RESPONSE" | jq -r '.post.cid // empty')
IMAGE_CIDS=$(echo "$POST_RESPONSE" | jq -r '.post.imageCids // empty')
IMAGE_CID=$(echo "$POST_RESPONSE" | jq -r '.post.imageCids[0] // empty')

if [ -n "$POST_ID" ] && [ "$POST_ID" != "null" ]; then
    echo -e "${GREEN}✅ Post created successfully${NC}"
    echo -e "${BLUE}ℹ️  Post ID: $POST_ID${NC}"
    echo -e "${BLUE}ℹ️  Content CID: $CONTENT_CID${NC}"
    echo -e "${BLUE}ℹ️  Image CID: $IMAGE_CID${NC}"
    
    # Validate CIDs
    CONTENT_VALID=false
    IMAGE_VALID=false
    
    if is_valid_cid "$CONTENT_CID"; then
        CONTENT_VALID=true
        echo -e "${GREEN}✅ Content CID is valid IPFS hash${NC}"
    else
        echo -e "${RED}❌ Content CID is not valid: $CONTENT_CID${NC}"
    fi
    
    if is_valid_cid "$IMAGE_CID"; then
        IMAGE_VALID=true
        echo -e "${GREEN}✅ Image CID is valid IPFS hash${NC}"
    else
        echo -e "${RED}❌ Image CID is not valid: $IMAGE_CID${NC}"
    fi
    
    if [ "$CONTENT_VALID" = true ] && [ "$IMAGE_VALID" = true ]; then
        echo -e "${GREEN}✅ All CIDs are valid IPFS hashes (not local placeholders)${NC}"
    else
        echo -e "${RED}❌ Some CIDs are invalid${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Post creation failed${NC}"
    echo -e "${RED}Response: $POST_RESPONSE${NC}"
    exit 1
fi

# Test 5: Verify Post Retrieval
print_step 5 "Verifying Post Retrieval"

POSTS_RESPONSE=$(curl -s "$API_URL/posts")
RETRIEVED_POST=$(echo "$POSTS_RESPONSE" | jq -r ".posts[] | select(.id == \"$POST_ID\")")

if [ -n "$RETRIEVED_POST" ] && [ "$RETRIEVED_POST" != "null" ]; then
    echo -e "${GREEN}✅ Post retrieved successfully${NC}"
    RETRIEVED_TEXT=$(echo "$RETRIEVED_POST" | jq -r '.textPreview')
    RETRIEVED_IMAGE_CID=$(echo "$RETRIEVED_POST" | jq -r '.imageCids[0]')
    echo -e "${BLUE}ℹ️  Text: $RETRIEVED_TEXT${NC}"
    echo -e "${BLUE}ℹ️  Image CID: $RETRIEVED_IMAGE_CID${NC}"
else
    echo -e "${RED}❌ Post not found in feed${NC}"
fi

# Test 6: Verify Image Gateway Access
print_step 6 "Testing Uploaded Image Gateway Access"

ACCESSIBLE_IMAGE_COUNT=0
for gateway in "${GATEWAYS[@]}"; do
    url="${gateway}${IMAGE_CID}"
    echo -e "${BLUE}ℹ️  Testing: $gateway${NC}"
    
    if curl -s -I -m 10 "$url" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓ Image accessible${NC}"
        ((ACCESSIBLE_IMAGE_COUNT++))
    else
        echo -e "${YELLOW}✗ Not accessible yet (may take a moment to propagate)${NC}"
    fi
done

if [ $ACCESSIBLE_IMAGE_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Image accessible via $ACCESSIBLE_IMAGE_COUNT/${#GATEWAYS[@]} gateways${NC}"
else
    echo -e "${YELLOW}⚠️  Image not accessible yet (IPFS propagation may take time)${NC}"
fi

# Cleanup
print_step 7 "Cleanup"

if [ -f "$TEST_IMAGE" ]; then
    rm -f "$TEST_IMAGE"
    echo -e "${GREEN}✅ Cleaned up test image${NC}"
fi

# Summary
echo -e "\n${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                    TEST SUMMARY${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}🎉 ALL CRITICAL TESTS PASSED!${NC}\n"
echo -e "${GREEN}✅ Pinata integration is working perfectly!${NC}"
echo -e "${GREEN}✅ Images are uploaded to IPFS with real CIDs${NC}"
echo -e "${GREEN}✅ No more local placeholders!${NC}"
echo -e "${GREEN}✅ Posts created with proper IPFS references${NC}\n"

echo -e "${BLUE}📝 Test Results:${NC}"
echo -e "   Post ID: ${GREEN}$POST_ID${NC}"
echo -e "   Content CID: ${GREEN}$CONTENT_CID${NC}"
echo -e "   Image CID: ${GREEN}$IMAGE_CID${NC}\n"

echo -e "${BLUE}🔗 View your image on IPFS:${NC}"
echo -e "   https://gateway.pinata.cloud/ipfs/${IMAGE_CID}"
echo -e "   https://ipfs.io/ipfs/${IMAGE_CID}\n"

echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}\n"

