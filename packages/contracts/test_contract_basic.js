// Test basic contract functionality
import { JsonRpcProvider, Contract } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
  QNS_REGISTRY: '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_REGISTRAR: '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b',
};

const RPC_URL = 'https://orchard.rpc.quai.network';

// Basic ERC721 ABI functions
const BASIC_ERC721_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
];

// Registry ABI
const REGISTRY_ABI = [
  "function ownerOf(bytes32 node) external view returns (address)",
];

async function testBasicContractFunctionality() {
  console.log('🔍 Testing basic contract functionality...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    
    // Test NFT contract basic functions
    console.log('📋 Testing NFT Contract...');
    const nftContract = new Contract(CONTRACTS.QNS_NFT, BASIC_ERC721_ABI, provider);
    
    try {
      const name = await nftContract.name();
      console.log(`   Name: ${name}`);
    } catch (error) {
      console.log(`   ❌ Name error: ${error.message}`);
    }
    
    try {
      const symbol = await nftContract.symbol();
      console.log(`   Symbol: ${symbol}`);
    } catch (error) {
      console.log(`   ❌ Symbol error: ${error.message}`);
    }
    
    try {
      const totalSupply = await nftContract.totalSupply();
      console.log(`   Total Supply: ${totalSupply.toString()}`);
    } catch (error) {
      console.log(`   ❌ Total Supply error: ${error.message}`);
    }
    
    // Test with a known address
    const testAddress = '0x003DAC94805c77d7fD485cd415F8078414d171e4';
    try {
      const balance = await nftContract.balanceOf(testAddress);
      console.log(`   Balance of ${testAddress}: ${balance.toString()}`);
    } catch (error) {
      console.log(`   ❌ Balance error: ${error.message}`);
    }
    
    // Test Registry contract
    console.log('\n📋 Testing Registry Contract...');
    const registryContract = new Contract(CONTRACTS.QNS_REGISTRY, REGISTRY_ABI, provider);
    
    // Test with a random node
    const testNode = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    try {
      const owner = await registryContract.ownerOf(testNode);
      console.log(`   Owner of test node: ${owner}`);
    } catch (error) {
      console.log(`   ❌ Registry ownerOf error: ${error.message}`);
    }
    
    console.log('\n✅ Basic contract tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBasicContractFunctionality();