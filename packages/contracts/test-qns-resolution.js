// Test QNS Domain Resolution functionality
import { JsonRpcProvider, Contract, Wallet, keccak256, toUtf8Bytes } from 'quais';

// Contract addresses from simple deployment
const CONTRACTS = {
  QNS_REGISTRY: '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_NFT: '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
  QNS_REGISTRAR: '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b',
};

const RPC_URL = 'https://orchard.rpc.quai.network';

// ABIs
const REGISTRY_ABI = [
  "function ownerOf(bytes32 node) external view returns (address)",
  "function resolverOf(bytes32 node) external view returns (address)",
];

const NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function getName(bytes32 node) external view returns (string)",
];

// Helper function to create node hash
function nameToNode(name) {
  const label = name.toLowerCase();
  return keccak256(toUtf8Bytes(label));
}

async function testDomainResolution(domainName) {
  console.log(`🔍 Testing resolution for domain: "${domainName}"`);
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const registryContract = new Contract(CONTRACTS.QNS_REGISTRY, REGISTRY_ABI, provider);
    const nftContract = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, provider);
    
    const node = nameToNode(domainName);
    console.log(`   Node hash: ${node}`);
    
    // Check if domain exists using NFT contract
    const exists = await nftContract.exists(node);
    console.log(`   Domain exists: ${exists}`);
    
    if (!exists) {
      console.log(`   ❌ Domain "${domainName}" is not registered`);
      return { success: false, error: 'Domain not registered' };
    }
    
    // Get owner from registry
    try {
      const owner = await registryContract.ownerOf(node);
      console.log(`   Owner: ${owner}`);
      
      if (!owner || owner === '0x0000000000000000000000000000000000000000') {
        return { success: false, error: 'Domain has no owner' };
      }
      
      // Try to get resolver
      try {
        const resolverAddress = await registryContract.resolverOf(node);
        console.log(`   Resolver: ${resolverAddress}`);
        
        if (resolverAddress && resolverAddress !== '0x0000000000000000000000000000000000000000') {
          console.log(`   ✅ Domain "${domainName}" has resolver - would resolve to payment address if configured`);
        } else {
          console.log(`   ℹ️  No resolver set - would fallback to owner address`);
        }
      } catch (resolverError) {
        console.log(`   ℹ️  No resolver configured for domain`);
      }
      
      return {
        success: true,
        address: owner,
        node,
        method: 'owner'
      };
      
    } catch (ownerError) {
      console.log(`   ❌ Error getting owner: ${ownerError.message}`);
      return { success: false, error: ownerError.message };
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🧪 QNS Domain Resolution Test\n');
  console.log('📋 Using contract addresses:');
  Object.entries(CONTRACTS).forEach(([name, address]) => {
    console.log(`   ${name}: ${address}`);
  });
  
  const testDomains = [
    'testdomain',
    'admin', // This might be reserved
    'myapp',
    'quai',
    // Add your registered domains here
  ];
  
  console.log(`\n🔗 RPC: ${RPC_URL}\n`);
  
  for (const domain of testDomains) {
    console.log('─'.repeat(60));
    const result = await testDomainResolution(domain);
    
    if (result.success) {
      console.log(`✅ "${domain}" resolves to: ${result.address}`);
    } else {
      console.log(`❌ "${domain}" failed: ${result.error}`);
    }
    console.log('');
  }
  
  console.log('💡 To test with your own domain:');
  console.log('   node test-qns-resolution.js yourdomain');
}

// If domain provided as command line argument
const testDomain = process.argv[2];
if (testDomain) {
  testDomainResolution(testDomain).then(result => {
    if (result.success) {
      console.log(`✅ Domain "${testDomain}" resolves to: ${result.address}`);
    } else {
      console.log(`❌ Domain "${testDomain}" failed: ${result.error}`);
    }
  }).catch(console.error);
} else {
  main().catch(console.error);
}
