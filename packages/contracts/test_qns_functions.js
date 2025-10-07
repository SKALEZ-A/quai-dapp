// Test script to debug QNS functionality
import { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from 'quais';

// Contract addresses from deployed-addresses.json
const CONTRACTS = {
  QNS_REGISTRY: '0x0000A75388737BfedDB1646346B7F5d1Abe18a24',
  QNS_NFT: '0x002ADB96b4aE41c7d2Ca22A1e7f8468F55F6e57b',
  QNS_REGISTRAR: '0x003d8Cf751661432bBDFf5c68c7c910DC388Aba7',
  QNS_RESERVED_NAMES: '0x002119beef97d4a5Ac9265f4F229a7308aD316B7',
};

const RPC_URL = 'https://orchard.rpc.quai.network';

// ABIs (minimal)
const QNS_REGISTRY_ABI = [
  "function ownerOf(bytes32 node) external view returns (address)",
  "function resolverOf(bytes32 node) external view returns (address)",
];

const QNS_NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getNode(uint256 tokenId) external view returns (bytes32)",
  "function getName(bytes32 node) external view returns (string)",
  "function totalSupply() external view returns (uint256)",
];

const QNS_REGISTRAR_ABI = [
  "function register(string calldata name, bytes32 node) external payable returns (uint256)",
  "function getPrice(string calldata name) external view returns (uint256)",
  "function available(bytes32 node) external view returns (bool)",
];

async function testQNSFunctions() {
  console.log('🔍 Testing QNS Functions...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    console.log('✅ Provider connected');
    
    // Test registry contract
    const registry = new Contract(CONTRACTS.QNS_REGISTRY, QNS_REGISTRY_ABI, provider);
    console.log('✅ Registry contract loaded');
    
    // Test NFT contract
    const nft = new Contract(CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    console.log('✅ NFT contract loaded');
    
    // Test registrar contract
    const registrar = new Contract(CONTRACTS.QNS_REGISTRAR, QNS_REGISTRAR_ABI, provider);
    console.log('✅ Registrar contract loaded');
    
    // Test total supply
    try {
      const totalSupply = await nft.totalSupply();
      console.log(`📊 Total supply: ${totalSupply.toString()}`);
    } catch (error) {
      console.error('❌ Error getting total supply:', error.message);
    }
    
    // Test if testdomain exists
    const testDomainNode = keccak256(toUtf8Bytes('testdomain'));
    console.log(`🔍 Testing domain: testdomain (node: ${testDomainNode})`);
    
    try {
      const exists = await nft.exists(testDomainNode);
      console.log(`📋 Domain exists: ${exists}`);
      
      if (exists) {
        const tokenId = await nft.getTokenId(testDomainNode);
        console.log(`🎫 Token ID: ${tokenId.toString()}`);
        
        const owner = await nft.ownerOf(tokenId);
        console.log(`👤 Owner: ${owner}`);
        
        const name = await nft.getName(testDomainNode);
        console.log(`📝 Name: ${name}`);
      }
    } catch (error) {
      console.error('❌ Error checking domain:', error.message);
    }
    
    // Test registrar availability
    try {
      const available = await registrar.available(testDomainNode);
      console.log(`🟢 Domain available: ${available}`);
    } catch (error) {
      console.error('❌ Error checking availability:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testQNSFunctions();