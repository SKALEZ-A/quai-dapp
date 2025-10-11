// Pinata IPFS service implementation
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

function validatePinataConfig() {
  if (!PINATA_JWT) {
    console.error("❌ Pinata configuration missing:");
    console.error("   PINATA_JWT:", PINATA_JWT ? "✅ Set" : "❌ Missing");
    console.error("💡 To get Pinata JWT:");
    console.error("   1. Go to https://app.pinata.cloud/");
    console.error("   2. Sign up for free account (1GB free)");
    console.error("   3. Go to API Keys section");
    console.error("   4. Create new API key and copy JWT");
    throw new Error("Pinata JWT is required. Please configure PINATA_JWT");
  }
  console.log("✅ Pinata configuration validated successfully");
}

async function uploadToPinata(file: Buffer, fileName: string, contentType: string): Promise<string> {
  validatePinataConfig();
  
  const formData = new FormData();
  formData.append('file', new Blob([file], { type: contentType }), fileName);
  
  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      type: contentType.includes('image') ? 'image' : 'json',
      app: 'quai-social'
    }
  });
  formData.append('pinataMetadata', metadata);
  
  const options = JSON.stringify({
    cidVersion: 1
  });
  formData.append('pinataOptions', options);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.IpfsHash; // Pinata returns IpfsHash instead of CID
}

export async function uploadJson(name: string, data: unknown): Promise<string> {
  try {
    console.log(`📤 Starting Pinata upload for JSON: ${name}`);
    const buffer = Buffer.from(JSON.stringify(data));
    const cid = await uploadToPinata(buffer, name, 'application/json');
    console.log(`✅ Successfully uploaded JSON to Pinata. CID: ${cid}`);
    return cid;
  } catch (error) {
    console.error(`❌ Failed to upload JSON to Pinata:`, error);
    throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadImage(buffer: Buffer, contentType: string): Promise<string> {
  try {
    console.log(`📤 Starting Pinata upload for image. Size: ${buffer.length} bytes, Type: ${contentType}`);
    const fileName = `image_${Date.now()}.${contentType.split('/')[1]}`;
    const cid = await uploadToPinata(buffer, fileName, contentType);
    console.log(`✅ Successfully uploaded image to Pinata. CID: ${cid}, Size: ${buffer.length} bytes`);
    return cid;
  } catch (error) {
    console.error(`❌ Failed to upload image to Pinata:`, error);
    throw new Error(`Image upload to IPFS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadImages(images: Array<{ buffer: Buffer; contentType: string }>): Promise<string[]> {
  console.log(`📤 Starting batch upload of ${images.length} images to Pinata`);
  
  try {
    const uploadPromises = images.map((img, index) => {
      console.log(`📤 Uploading image ${index + 1}/${images.length}: ${img.contentType}, ${img.buffer.length} bytes`);
      return uploadImage(img.buffer, img.contentType);
    });
    
    const cids = await Promise.all(uploadPromises);
    console.log(`✅ Successfully uploaded ${cids.length} images to Pinata:`, cids);
    return cids;
  } catch (error) {
    console.error(`❌ Failed to upload images to Pinata:`, error);
    throw new Error(`Batch image upload to IPFS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Health check function to test Pinata connectivity
export async function testIPFSConnection(): Promise<{ success: boolean; error?: string; cid?: string }> {
  try {
    console.log("🔍 Testing Pinata connection...");
    validatePinataConfig();
    
    // Upload a small test file
    const testData = { test: "connection", timestamp: Date.now() };
    const cid = await uploadJson("connection-test.json", testData);
    console.log("✅ Pinata connection test successful. Test CID:", cid);
    
    return { success: true, cid };
  } catch (error) {
    console.error("❌ Pinata connection test failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}


