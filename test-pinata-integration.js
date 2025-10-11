#!/usr/bin/env node

/**
 * Comprehensive Pinata Integration Test
 * Tests image upload to IPFS via Pinata and verifies:
 * 1. Images get real IPFS CIDs (not local placeholders)
 * 2. Images are accessible via multiple IPFS gateways
 * 3. Posts are created with proper IPFS references
 */

const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:4000';
const TEST_WALLET = '0x003dac94805c77d7fd485cd415f8078414d171e4';

// IPFS gateways to test
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`STEP ${step}: ${message}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Validate IPFS CID format
function isValidIPFSCid(cid) {
  // IPFS CIDs typically start with 'Qm' (v0) or 'baf' (v1)
  if (!cid || typeof cid !== 'string') return false;
  
  // Check for local placeholder format
  if (cid.startsWith('local_')) {
    logError(`Found local placeholder: ${cid}`);
    return false;
  }
  
  // Valid IPFS CID patterns
  const v0Pattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const v1Pattern = /^baf[a-z0-9]{50,}$/;
  
  return v0Pattern.test(cid) || v1Pattern.test(cid);
}

// Test 1: Health Check
async function testHealthCheck() {
  logStep(1, 'Testing IPFS Health Endpoint');
  
  try {
    const response = await fetch(`${API_URL}/health/ipfs`);
    const data = await response.json();
    
    if (data.status === 'healthy') {
      logSuccess('IPFS connection is healthy');
      logInfo(`Test CID: ${data.testCid}`);
      
      if (isValidIPFSCid(data.testCid)) {
        logSuccess('Test CID is a valid IPFS hash');
        return { success: true, testCid: data.testCid };
      } else {
        logError('Test CID is not a valid IPFS hash');
        return { success: false };
      }
    } else {
      logError('IPFS connection is unhealthy');
      logError(`Error: ${data.error}`);
      return { success: false };
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return { success: false };
  }
}

// Test 2: Test IPFS Gateway Access
async function testIPFSGateways(cid) {
  logStep(2, 'Testing IPFS Gateway Access');
  
  const results = [];
  
  for (const gateway of IPFS_GATEWAYS) {
    const url = `${gateway}${cid}`;
    logInfo(`Testing: ${gateway}`);
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        timeout: 10000 
      });
      
      if (response.ok) {
        logSuccess(`✓ ${gateway} - Accessible`);
        results.push({ gateway, success: true });
      } else {
        logError(`✗ ${gateway} - Status: ${response.status}`);
        results.push({ gateway, success: false, status: response.status });
      }
    } catch (error) {
      logError(`✗ ${gateway} - ${error.message}`);
      results.push({ gateway, success: false, error: error.message });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  
  if (successCount > 0) {
    logSuccess(`${successCount}/${IPFS_GATEWAYS.length} gateways accessible`);
    return { success: true, accessibleGateways: successCount };
  } else {
    logError('No gateways accessible');
    return { success: false };
  }
}

// Test 3: Create Test Image File
function createTestImage() {
  logStep(3, 'Creating Test Image');
  
  // Create a simple test image (1x1 pixel PNG)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d,
    0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  
  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, pngBuffer);
  
  logSuccess(`Created test image: ${testImagePath}`);
  logInfo(`Size: ${pngBuffer.length} bytes`);
  
  return testImagePath;
}

// Test 4: Upload Post with Image
async function testPostCreation(imagePath) {
  logStep(4, 'Creating Post with Image via API');
  
  try {
    const formData = new FormData();
    formData.append('address', TEST_WALLET);
    formData.append('text', `Pinata Integration Test - ${new Date().toISOString()}`);
    formData.append('zone', 'cyprus-1');
    formData.append('images', fs.createReadStream(imagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    logInfo('Uploading post with image...');
    
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const data = await response.json();
    
    if (response.ok && data.post) {
      logSuccess('Post created successfully');
      logInfo(`Post ID: ${data.post.id}`);
      logInfo(`Content CID: ${data.post.cid}`);
      logInfo(`Image CIDs: ${JSON.stringify(data.post.imageCids)}`);
      
      // Validate CIDs
      const contentCidValid = isValidIPFSCid(data.post.cid);
      const imageCidsValid = data.post.imageCids.every(cid => isValidIPFSCid(cid));
      
      if (contentCidValid && imageCidsValid) {
        logSuccess('All CIDs are valid IPFS hashes (not local placeholders)');
        return { 
          success: true, 
          post: data.post,
          imageCid: data.post.imageCids[0]
        };
      } else {
        logError('CIDs are not valid IPFS hashes');
        if (!contentCidValid) logError(`Invalid content CID: ${data.post.cid}`);
        if (!imageCidsValid) logError(`Invalid image CIDs: ${JSON.stringify(data.post.imageCids)}`);
        return { success: false };
      }
    } else {
      logError(`Post creation failed: ${response.status}`);
      logError(JSON.stringify(data, null, 2));
      return { success: false };
    }
  } catch (error) {
    logError(`Post creation error: ${error.message}`);
    return { success: false };
  }
}

// Test 5: Verify Post Retrieval
async function testPostRetrieval(postId) {
  logStep(5, 'Verifying Post Retrieval');
  
  try {
    const response = await fetch(`${API_URL}/posts`);
    const data = await response.json();
    
    const post = data.posts.find(p => p.id === postId);
    
    if (post) {
      logSuccess('Post retrieved successfully');
      logInfo(`Text: ${post.textPreview}`);
      logInfo(`Image CIDs: ${JSON.stringify(post.imageCids)}`);
      return { success: true, post };
    } else {
      logError('Post not found in feed');
      return { success: false };
    }
  } catch (error) {
    logError(`Post retrieval error: ${error.message}`);
    return { success: false };
  }
}

// Test 6: Verify Image Gateway Access
async function testUploadedImageAccess(imageCid) {
  logStep(6, 'Testing Uploaded Image Gateway Access');
  
  return testIPFSGateways(imageCid);
}

// Cleanup
function cleanup(imagePath) {
  logStep(7, 'Cleanup');
  
  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      logSuccess('Cleaned up test image');
    }
  } catch (error) {
    logError(`Cleanup error: ${error.message}`);
  }
}

// Main Test Runner
async function runTests() {
  log('\n' + '█'.repeat(60), 'cyan');
  log('       PINATA IPFS INTEGRATION TEST SUITE', 'cyan');
  log('█'.repeat(60) + '\n', 'cyan');
  
  const results = {
    total: 6,
    passed: 0,
    failed: 0,
    details: []
  };
  
  let imagePath = null;
  let postId = null;
  let imageCid = null;
  
  try {
    // Test 1: Health Check
    const healthResult = await testHealthCheck();
    results.details.push({ test: 'Health Check', ...healthResult });
    if (healthResult.success) {
      results.passed++;
      
      // Test 2: Gateway Access (using health test CID)
      const gatewayResult = await testIPFSGateways(healthResult.testCid);
      results.details.push({ test: 'Gateway Access', ...gatewayResult });
      if (gatewayResult.success) results.passed++;
      else results.failed++;
    } else {
      results.failed++;
      logError('Health check failed - stopping tests');
      printSummary(results);
      return;
    }
    
    // Test 3: Create Test Image
    imagePath = createTestImage();
    results.passed++;
    
    // Test 4: Create Post with Image
    const postResult = await testPostCreation(imagePath);
    results.details.push({ test: 'Post Creation', ...postResult });
    if (postResult.success) {
      results.passed++;
      postId = postResult.post.id;
      imageCid = postResult.imageCid;
      
      // Test 5: Retrieve Post
      const retrievalResult = await testPostRetrieval(postId);
      results.details.push({ test: 'Post Retrieval', ...retrievalResult });
      if (retrievalResult.success) results.passed++;
      else results.failed++;
      
      // Test 6: Verify Image Gateway Access
      const imageAccessResult = await testUploadedImageAccess(imageCid);
      results.details.push({ test: 'Image Gateway Access', ...imageAccessResult });
      if (imageAccessResult.success) results.passed++;
      else results.failed++;
    } else {
      results.failed += 3; // Failed post creation, retrieval, and image access
    }
    
  } catch (error) {
    logError(`Test suite error: ${error.message}`);
  } finally {
    // Cleanup
    if (imagePath) cleanup(imagePath);
  }
  
  printSummary(results);
}

function printSummary(results) {
  log('\n' + '█'.repeat(60), 'cyan');
  log('                    TEST SUMMARY', 'cyan');
  log('█'.repeat(60), 'cyan');
  
  log(`\nTotal Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, results.passed === results.total ? 'green' : 'yellow');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
  
  if (results.passed === results.total) {
    log('\n🎉 ALL TESTS PASSED! Pinata integration is working perfectly!', 'green');
    log('✅ Images are uploaded to IPFS with real CIDs', 'green');
    log('✅ Images are accessible via multiple gateways', 'green');
    log('✅ No more local placeholders!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the logs above for details.', 'yellow');
  }
  
  log('\n' + '█'.repeat(60) + '\n', 'cyan');
}

// Run the tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});

