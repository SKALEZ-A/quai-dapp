// Test domain registration functionality
import { JsonRpcProvider, Contract, Wallet, keccak256, toUtf8Bytes } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
  QNS_REGISTRY: '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_REGISTRAR: '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b',
};

const RPC_URL = 'https://orchard.rpc.quai.network';

// Use the private key from the deployment
const PRIVATE_KEY = '0x8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802';

const REGISTRAR_ABI = [
  "function register(string calldata name, bytes32 node) external payable returns (uint256)",
  "function getPrice(string calldata name) external view returns (uint256)",
  "function available(bytes32 node) external view returns (bool)",
];

const NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function getName(bytes32 node) external view returns (string)",
];

async function testDomainRegistration() {
  console.log('🔍 Testing domain registration...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const wallet = new Wallet(PRIVATE_KEY, provider);
    
    console.log('Wallet address:', wallet.address);
    
    const registrar = new Contract(CONTRACTS.QNS_REGISTRAR, REGISTRAR_ABI, wallet);
    const nft = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, provider);
    
    const testDomain = 'testdomain2';
    const testNode = keccak256(toUtf8Bytes(testDomain));
    
    console.log(`Testing domain: ${testDomain}`);
    console.log(`Node: ${testNode}`);
    
    // Check if domain is available
    console.log('\n1. Checking availability...');
    try {
      const available = await registrar.available(testNode);
      console.log(`   Available: ${available}`);
      
      if (!available) {
        console.log('   Domain not available, skipping registration test');
        return;
      }
    } catch (error) {
      console.log(`   ❌ Availability check error: ${error.message}`);
      return;
    }
    
    // Get price
    console.log('\n2. Getting price...');
    try {
      const price = await registrar.getPrice(testDomain);
      console.log(`   Price: ${price.toString()} wei`);
    } catch (error) {
      console.log(`   ❌ Price check error: ${error.message}`);
      return;
    }
    
    // Try to register (this would require actual QI tokens)
    console.log('\n3. Attempting registration...');
    console.log('   ⚠️  This will fail if no QI tokens are available');
    
    try {
      const price = await registrar.getPrice(testDomain);
      const tx = await registrar.register(testDomain, testNode, { 
        value: price,
        gasLimit: 500000 
      });
      
      console.log(`   ✅ Registration transaction sent: ${tx.hash}`);
      console.log('   Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log(`   ✅ Registration confirmed in block ${receipt.blockNumber}`);
      
      // Verify the domain was registered
      console.log('\n4. Verifying registration...');
      const exists = await nft.exists(testNode);
      console.log(`   Domain exists: ${exists}`);
      
      if (exists) {
        const name = await nft.getName(testNode);
        console.log(`   Domain name: "${name}"`);
      }
      
    } catch (error) {
      console.log(`   ❌ Registration error: ${error.message}`);
      
      if (error.message.includes('insufficient funds')) {
        console.log('   💡 This is expected - you need QI tokens to register domains');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDomainRegistration();