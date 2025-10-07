// Test the new deployment to verify everything works
import { JsonRpcProvider, Contract, Wallet, keccak256, toUtf8Bytes } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x007Ac10d01a4B540581e30194D87b455206Dcd00',
  QNS_REGISTRY: '0x007024FDAa421bd27B69F91F8f6861E1c8063458',
  QNS_RESERVED_NAMES: '0x0029DDDFE6e95414c27708AdDf4aC10e26c6b0E7',
  QNS_REGISTRAR: '0x0059Fc49817AC27165A9335967ba19d2eb115410',
};

const RPC_URL = 'https://orchard.rpc.quai.network';
const PRIVATE_KEY = '0x8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802';

// ABIs
const NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function mint(bytes32 node, address to, string calldata name) external returns (uint256)",
  "function getName(bytes32 node) external view returns (string)",
  "function totalSupply() external view returns (uint256)",
];

const REGISTRY_ABI = [
  "function setOwner(bytes32 node, address owner) external",
  "function ownerOf(bytes32 node) external view returns (address)",
];

const REGISTRAR_ABI = [
  "function register(string calldata name, bytes32 node) external payable returns (uint256)",
  "function getPrice(string calldata name) external view returns (uint256)",
  "function available(bytes32 node) external view returns (bool)",
];

const RESERVED_NAMES_ABI = [
  "function isReserved(bytes32 node) external view returns (bool)",
];

async function testNewDeployment() {
  console.log('🧪 Testing New QNS Deployment...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const wallet = new Wallet(PRIVATE_KEY, provider);
    
    console.log(`👤 Using wallet: ${wallet.address}\n`);
    
    const nft = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, wallet);
    const registry = new Contract(CONTRACTS.QNS_REGISTRY, REGISTRY_ABI, wallet);
    const registrar = new Contract(CONTRACTS.QNS_REGISTRAR, REGISTRAR_ABI, wallet);
    const reservedNames = new Contract(CONTRACTS.QNS_RESERVED_NAMES, RESERVED_NAMES_ABI, wallet);
    
    const testDomain = 'newtestdomain';
    const testNode = keccak256(toUtf8Bytes(testDomain));
    
    console.log(`📝 Testing domain: ${testDomain}`);
    console.log(`🔗 Node: ${testNode}\n`);
    
    // Test 1: Check domain availability
    console.log('1. Testing domain availability...');
    try {
      const isAvailable = await registrar.available(testNode);
      console.log(`   ✅ Domain available: ${isAvailable}`);
    } catch (error) {
      console.log(`   ❌ Availability check failed: ${error.message}`);
    }
    
    // Test 2: Check if reserved
    console.log('\n2. Testing if domain is reserved...');
    try {
      const isReserved = await reservedNames.isReserved(testNode);
      console.log(`   ✅ Domain reserved: ${isReserved}`);
    } catch (error) {
      console.log(`   ❌ Reserved check failed: ${error.message}`);
    }
    
    // Test 3: Get price
    console.log('\n3. Testing price retrieval...');
    try {
      const price = await registrar.getPrice(testDomain);
      console.log(`   ✅ Domain price: ${price.toString()} wei`);
    } catch (error) {
      console.log(`   ❌ Price check failed: ${error.message}`);
    }
    
    // Test 4: Check if domain exists
    console.log('\n4. Testing if domain exists...');
    try {
      const exists = await nft.exists(testNode);
      console.log(`   ✅ Domain exists: ${exists}`);
    } catch (error) {
      console.log(`   ❌ Exists check failed: ${error.message}`);
    }
    
    // Test 5: Test totalSupply
    console.log('\n5. Testing totalSupply...');
    try {
      const totalSupply = await nft.totalSupply();
      console.log(`   ✅ Total supply: ${totalSupply}`);
    } catch (error) {
      console.log(`   ❌ Total supply failed: ${error.message}`);
    }
    
    // Test 6: Attempt registration
    console.log('\n6. Testing domain registration...');
    try {
      const price = await registrar.getPrice(testDomain);
      console.log(`   💰 Registration price: ${price.toString()} wei`);
      
      const registerTx = await registrar.register(testDomain, testNode, {
        value: price,
        gasLimit: 500000
      });
      console.log(`   ✅ Registration transaction sent: ${registerTx.hash}`);
      console.log('   ⏳ Waiting for confirmation...');
      
      const receipt = await registerTx.wait();
      console.log(`   ✅ Registration successful! Gas used: ${receipt.gasUsed}`);
      
      // Verify registration
      console.log('\n7. Verifying registration...');
      const existsAfter = await nft.exists(testNode);
      console.log(`   ✅ Domain exists after registration: ${existsAfter}`);
      
      const domainName = await nft.getName(testNode);
      console.log(`   ✅ Domain name: "${domainName}"`);
      
      const owner = await registry.ownerOf(testNode);
      console.log(`   ✅ Domain owner: ${owner}`);
      
      if (existsAfter && domainName === testDomain && owner.toLowerCase() === wallet.address.toLowerCase()) {
        console.log('\n🎉 SUCCESS! Domain registration and verification complete!');
        console.log('   ✅ NFT minted successfully');
        console.log('   ✅ Registry updated correctly');
        console.log('   ✅ Domain name stored correctly');
        console.log('   ✅ Owner set correctly');
        
        console.log('\n📝 Next steps:');
        console.log('   1. Start frontend: cd apps/web && pnpm run dev');
        console.log('   2. Visit: http://localhost:3000/dashboard/overview');
        console.log('   3. Verify domain appears in your domains list');
        console.log('   4. Test search at: http://localhost:3000/qns/profile');
        
      } else {
        console.log('\n❌ Registration verification failed');
      }
      
    } catch (error) {
      console.log(`   ❌ Registration failed: ${error.message}`);
      
      if (error.message.includes('AccessControlUnauthorizedAccount')) {
        console.log('   💡 Error: Deployer does not have required permissions');
      } else if (error.message.includes('Name already minted')) {
        console.log('   💡 Error: Domain already exists');
      } else if (error.message.includes('insufficient funds')) {
        console.log('   💡 Error: Insufficient balance for registration');
      } else {
        console.log('   💡 Error: Unknown registration issue');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNewDeployment();