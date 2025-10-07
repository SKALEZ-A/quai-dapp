// Test frontend QNS functions directly
import { Contract, keccak256, toUtf8Bytes, JsonRpcProvider } from 'quais';

// Use the same configuration as the frontend
const CONTRACTS = {
  QNS_REGISTRY: '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_NFT: '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
};

const RPC_URL = 'https://orchard.rpc.quai.network';

const QNS_REGISTRY_ABI = [
  "function ownerOf(bytes32 node) external view returns (address)",
];

const QNS_NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getNode(uint256 tokenId) external view returns (bytes32)",
  "function getName(bytes32 node) external view returns (string)",
];

function makeProvider(rpcUrl) {
  return new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });
}

function nameToNode(name) {
  const label = name.toLowerCase();
  return keccak256(toUtf8Bytes(label));
}

// Test checkDomainAvailability function
async function testCheckDomainAvailability(name) {
  try {
    console.log('Testing checkDomainAvailability for:', name);
    console.log('RPC URL:', RPC_URL);
    console.log('NFT Contract:', CONTRACTS.QNS_NFT);
    console.log('Registry Contract:', CONTRACTS.QNS_REGISTRY);
    
    const provider = makeProvider(RPC_URL);
    const nftContract = new Contract(CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    const registryContract = new Contract(CONTRACTS.QNS_REGISTRY, QNS_REGISTRY_ABI, provider);
    
    const node = nameToNode(name);
    console.log('Node hash:', node);
    
    // Check if NFT exists
    console.log('Calling exists() on NFT contract...');
    const exists = await nftContract.exists(node);
    console.log('Domain exists:', exists);
    
    if (exists) {
      // Get owner from registry
      console.log('Getting owner from registry...');
      const owner = await registryContract.ownerOf(node);
      console.log('Domain owner:', owner);
      return {
        available: false,
        owner,
        node,
      };
    }
    
    console.log('Domain is available');
    return {
      available: true,
      node,
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    throw new Error(`Failed to check domain availability: ${error.message}`);
  }
}

// Test getUserDomains function
async function testGetUserDomains(address) {
  try {
    console.log('Testing getUserDomains for address:', address);
    const provider = makeProvider(RPC_URL);
    const nftContract = new Contract(CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    
    const userDomains = [];
    
    // Check a reasonable range of token IDs
    console.log('Checking token IDs...');
    
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 10;
    const maxTokensToCheck = 1000;
    
    for (let tokenId = 1; tokenId <= maxTokensToCheck; tokenId++) {
      try {
        const owner = await nftContract.ownerOf(tokenId);
        console.log(`Token ${tokenId} owner:`, owner);
        
        if (owner.toLowerCase() === address.toLowerCase()) {
          console.log(`Token ${tokenId} belongs to user!`);
          const node = await nftContract.getNode(tokenId);
          console.log(`Token ${tokenId} node:`, node);
          
          const domainName = await nftContract.getName(node);
          console.log(`Token ${tokenId} name:`, domainName);
          
          if (domainName && domainName.length > 0) {
            userDomains.push(domainName);
          }
        }
        
        consecutiveFailures = 0;
        
      } catch (error) {
        consecutiveFailures++;
        console.log(`Token ${tokenId} error:`, error.message);
        
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.log(`Stopping after ${maxConsecutiveFailures} consecutive failures`);
          break;
        }
      }
    }
    
    console.log('Found user domains:', userDomains);
    return userDomains;
  } catch (error) {
    console.error('Error fetching user domains:', error);
    return [];
  }
}

async function runTests() {
  try {
    const userAddress = '0x003DAC94805c77d7fD485cd415F8078414d171e4';
    
    console.log('=== Testing checkDomainAvailability ===');
    const availabilityResult = await testCheckDomainAvailability('test123');
    console.log('Availability result:', availabilityResult);
    
    console.log('\n=== Testing getUserDomains ===');
    const userDomains = await testGetUserDomains(userAddress);
    console.log('User domains result:', userDomains);
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

runTests();
