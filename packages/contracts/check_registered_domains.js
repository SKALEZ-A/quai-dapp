// Script to check what domains are actually registered
import { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x002ADB96b4aE41c7d2Ca22A1e7f8468F55F6e57b',
};

const RPC_URL = 'https://orchard.rpc.quai.network';

const QNS_NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getNode(uint256 tokenId) external view returns (bytes32)",
  "function getName(bytes32 node) external view returns (string)",
  "function totalSupply() external view returns (uint256)",
];

async function checkRegisteredDomains() {
  console.log('🔍 Checking registered domains...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const nft = new Contract(CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    
    // Try to get total supply with different approaches
    let totalSupply = 0;
    try {
      totalSupply = await nft.totalSupply();
      console.log(`📊 Total supply: ${totalSupply.toString()}`);
    } catch (error) {
      console.log('❌ Could not get total supply:', error.message);
      // Try checking a reasonable range
      totalSupply = 10;
    }
    
    console.log(`\n🔍 Checking first ${totalSupply} token IDs...\n`);
    
    const registeredDomains = [];
    
    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        console.log(`Checking token ${tokenId}...`);
        const owner = await nft.ownerOf(tokenId);
        const node = await nft.getNode(tokenId);
        const name = await nft.getName(node);
        
        console.log(`  ✅ Token ${tokenId}:`);
        console.log(`     Owner: ${owner}`);
        console.log(`     Node: ${node}`);
        console.log(`     Name: "${name}"`);
        
        registeredDomains.push({
          tokenId,
          owner,
          node,
          name
        });
        
      } catch (error) {
        console.log(`  ❌ Token ${tokenId}: ${error.message}`);
        // If we can't get owner, token probably doesn't exist
        if (error.message.includes('ERC721: invalid token ID')) {
          break; // No more tokens exist
        }
      }
    }
    
    console.log(`\n📋 Summary:`);
    console.log(`   Found ${registeredDomains.length} registered domains`);
    
    if (registeredDomains.length > 0) {
      console.log('\n📝 Registered domains:');
      registeredDomains.forEach(domain => {
        console.log(`   - ${domain.name} (owned by ${domain.owner})`);
      });
    } else {
      console.log('\n❌ No domains found registered');
    }
    
    // Specifically check testdomain
    console.log('\n🔍 Checking testdomain specifically...');
    const testDomainNode = keccak256(toUtf8Bytes('testdomain'));
    try {
      const exists = await nft.exists(testDomainNode);
      console.log(`   testdomain exists: ${exists}`);
      
      if (exists) {
        const tokenId = await nft.getTokenId(testDomainNode);
        const owner = await nft.ownerOf(tokenId);
        const name = await nft.getName(testDomainNode);
        console.log(`   testdomain owner: ${owner}`);
        console.log(`   testdomain name: "${name}"`);
      }
    } catch (error) {
      console.log(`   Error checking testdomain: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

checkRegisteredDomains();