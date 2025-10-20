// Script to check what domains are registered on the currently deployed contracts
import { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from 'quais';
import fs from 'fs';

// Load deployed addresses
const deployedAddresses = JSON.parse(fs.readFileSync('./deployed-addresses.json', 'utf8'));

const RPC_URL = 'https://rpc.quai.network';

const QNS_NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getNode(uint256 tokenId) external view returns (bytes32)",
  "function getName(bytes32 node) external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function tokenByIndex(uint256 index) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
];

const QNS_REGISTRY_ABI = [
  "function owner(bytes32 node) external view returns (address)",
  "function resolver(bytes32 node) external view returns (address)",
  "function recordExists(bytes32 node) external view returns (bool)",
];

async function checkRegisteredDomains() {
  console.log('🔍 Checking registered domains on deployed contracts...\n');
  console.log(`📋 Network: ${deployedAddresses.network}`);
  console.log(`🔗 Chain ID: ${deployedAddresses.chainId}`);
  console.log(`📍 QNS NFT Contract: ${deployedAddresses.contracts.QNS_NFT}`);
  console.log(`📍 QNS Registry Contract: ${deployedAddresses.contracts.QNS_REGISTRY}\n`);
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const nft = new Contract(deployedAddresses.contracts.QNS_NFT, QNS_NFT_ABI, provider);
    const registry = new Contract(deployedAddresses.contracts.QNS_REGISTRY, QNS_REGISTRY_ABI, provider);
    
    // Try to get total supply
    let totalSupply = 0;
    try {
      totalSupply = await nft.totalSupply();
      console.log(`📊 Total NFTs minted: ${totalSupply.toString()}\n`);
    } catch (error) {
      console.log('⚠️  Could not get total supply, will check first 50 token IDs\n');
      totalSupply = 50;
    }
    
    const registeredDomains = [];
    const checkLimit = Math.min(Number(totalSupply) || 50, 100); // Check max 100
    
    console.log(`🔍 Checking token IDs 0-${checkLimit}...\n`);
    
    for (let tokenId = 0; tokenId <= checkLimit; tokenId++) {
      try {
        const owner = await nft.ownerOf(tokenId);
        
        // Try to get additional info
        let node = null;
        let name = null;
        
        try {
          node = await nft.getNode(tokenId);
          name = await nft.getName(node);
        } catch (e) {
          // Some contracts may not have these functions
        }
        
        console.log(`  ✅ Token ${tokenId}:`);
        console.log(`     Owner: ${owner}`);
        if (node) console.log(`     Node: ${node}`);
        if (name) console.log(`     Name: "${name}"`);
        console.log('');
        
        registeredDomains.push({
          tokenId,
          owner,
          node,
          name: name || 'Unknown'
        });
        
      } catch (error) {
        // Token doesn't exist, skip silently
        if (error.message.includes('nonexistent') || error.message.includes('invalid token')) {
          // Stop checking if we hit too many non-existent tokens in a row
          continue;
        }
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Found ${registeredDomains.length} registered domains\n`);
    
    if (registeredDomains.length > 0) {
      console.log('📝 Registered domains:');
      registeredDomains.forEach(domain => {
        console.log(`   🌐 ${domain.name} (Token ID: ${domain.tokenId})`);
        console.log(`      Owner: ${domain.owner}`);
        if (domain.node) console.log(`      Node: ${domain.node}`);
        console.log('');
      });
    } else {
      console.log('❌ No domains currently registered on this contract\n');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

checkRegisteredDomains();

