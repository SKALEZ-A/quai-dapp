// Direct domain registration using deployer's MINTER_ROLE and ADMIN_ROLE
import { JsonRpcProvider, Contract, Wallet, keccak256, toUtf8Bytes } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x002ADB96b4aE41c7d2Ca22A1e7f8468F55F6e57b',
  QNS_REGISTRY: '0x0000A75388737BfedDB1646346B7F5d1Abe18a24',
  QNS_RESERVED_NAMES: '0x002119beef97d4a5Ac9265f4F229a7308aD316B7',
};

const RPC_URL = 'https://orchard.rpc.quai.network';
const PRIVATE_KEY = '0x8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802';

// ABIs
const NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function mint(bytes32 node, address to, string calldata name) external returns (uint256)",
  "function getName(bytes32 node) external view returns (string)",
];

const REGISTRY_ABI = [
  "function setOwner(bytes32 node, address owner) external",
  "function ownerOf(bytes32 node) external view returns (address)",
];

const RESERVED_NAMES_ABI = [
  "function isReserved(bytes32 node) external view returns (bool)",
];

async function directDomainRegistration() {
  console.log('🚀 Direct Domain Registration Test...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const wallet = new Wallet(PRIVATE_KEY, provider);
    
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    const nft = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, wallet);
    const registry = new Contract(CONTRACTS.QNS_REGISTRY, REGISTRY_ABI, wallet);
    const reservedNames = new Contract(CONTRACTS.QNS_RESERVED_NAMES, RESERVED_NAMES_ABI, wallet);
    
    const testDomain = 'testdomain4';
    const testNode = keccak256(toUtf8Bytes(testDomain));
    
    console.log(`📝 Testing domain: ${testDomain}`);
    console.log(`🔗 Node: ${testNode}\n`);
    
    // Step 1: Check if domain already exists
    console.log('1. Checking if domain exists...');
    const exists = await nft.exists(testNode);
    console.log(`   Domain exists: ${exists}`);
    
    if (exists) {
      console.log('   ❌ Domain already exists, cannot register');
      return;
    }
    
    // Step 2: Check if domain is reserved
    console.log('\n2. Checking if domain is reserved...');
    const isReserved = await reservedNames.isReserved(testNode);
    console.log(`   Domain is reserved: ${isReserved}`);
    
    if (isReserved) {
      console.log('   ❌ Domain is reserved, cannot register');
      return;
    }
    
    // Step 3: Mint the NFT directly
    console.log('\n3. Minting NFT directly...');
    try {
      const mintTx = await nft.mint(testNode, wallet.address, testDomain);
      console.log(`   ✅ Mint transaction sent: ${mintTx.hash}`);
      console.log('   ⏳ Waiting for confirmation...');
      
      const mintReceipt = await mintTx.wait();
      console.log(`   ✅ NFT minted successfully! Gas used: ${mintReceipt.gasUsed}`);
      
      // Get the token ID from the receipt logs
      const tokenId = mintReceipt.logs[0]?.topics[3] ? parseInt(mintReceipt.logs[0].topics[3], 16) : 'unknown';
      console.log(`   🎫 Token ID: ${tokenId}`);
      
    } catch (error) {
      console.log(`   ❌ Failed to mint NFT: ${error.message}`);
      return;
    }
    
    // Step 4: Set owner in registry
    console.log('\n4. Setting owner in registry...');
    try {
      const setOwnerTx = await registry.setOwner(testNode, wallet.address);
      console.log(`   ✅ Set owner transaction sent: ${setOwnerTx.hash}`);
      console.log('   ⏳ Waiting for confirmation...');
      
      const setOwnerReceipt = await setOwnerTx.wait();
      console.log(`   ✅ Owner set successfully! Gas used: ${setOwnerReceipt.gasUsed}`);
      
    } catch (error) {
      console.log(`   ❌ Failed to set owner: ${error.message}`);
      return;
    }
    
    // Step 5: Verify registration
    console.log('\n5. Verifying registration...');
    
    try {
      const domainExists = await nft.exists(testNode);
      console.log(`   Domain exists in NFT: ${domainExists ? '✅' : '❌'}`);
      
      const domainName = await nft.getName(testNode);
      console.log(`   Domain name: "${domainName}"`);
      
      const registryOwner = await registry.ownerOf(testNode);
      console.log(`   Registry owner: ${registryOwner}`);
      
      if (domainExists && domainName === testDomain && registryOwner.toLowerCase() === wallet.address.toLowerCase()) {
        console.log('\n🎉 SUCCESS! Domain registered successfully!');
        console.log('   ✅ NFT minted');
        console.log('   ✅ Registry updated');
        console.log('   ✅ Domain should now appear on dashboard');
        
        console.log('\n📝 Next steps:');
        console.log('   1. Check dashboard at http://localhost:3003/dashboard/overview');
        console.log('   2. Search for the domain at http://localhost:3003/qns/profile');
        console.log('   3. Verify the domain shows as owned by your wallet');
        
      } else {
        console.log('\n❌ Registration verification failed');
      }
      
    } catch (error) {
      console.log(`   ❌ Verification error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
  }
}

directDomainRegistration();