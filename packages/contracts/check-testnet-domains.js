// Script to check what domains are registered on the TESTNET contracts (used by frontend)
import { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from 'quais';

// Testnet contract addresses from apps/web/src/lib/contracts.ts
const TESTNET_CONTRACTS = {
  QNS_REGISTRY: '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_NFT: '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
  QNS_RESERVED_NAMES: '0x0023272C07514D2D236f6c6895507DFd26442471',
  QNS_REGISTRAR: '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b',
};

const RPC_URL = 'https://orchard.rpc.quai.network'; // Testnet

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
  console.log('🔍 Checking registered domains on TESTNET contracts...\n');
  console.log(`🌐 Network: Orchard Testnet (cyprus1)`);
  console.log(`📍 QNS NFT Contract: ${TESTNET_CONTRACTS.QNS_NFT}`);
  console.log(`📍 QNS Registry Contract: ${TESTNET_CONTRACTS.QNS_REGISTRY}\n`);
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const nft = new Contract(TESTNET_CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    const registry = new Contract(TESTNET_CONTRACTS.QNS_REGISTRY, QNS_REGISTRY_ABI, provider);
    
    // Try to get total supply
    let totalSupply = 0;
    try {
      totalSupply = await nft.totalSupply();
      console.log(`📊 Total NFTs minted: ${totalSupply.toString()}\n`);
    } catch (error) {
      console.log('⚠️  Could not get total supply, will check first 100 token IDs\n');
      totalSupply = 100;
    }
    
    const registeredDomains = [];
    const checkLimit = Math.min(Number(totalSupply) || 100, 100); // Check max 100
    
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
          // Continue checking
          continue;
        }
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 SUMMARY - TESTNET CONTRACTS`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Found ${registeredDomains.length} registered domains\n`);
    
    if (registeredDomains.length > 0) {
      console.log('📝 Registered domains on TESTNET:');
      registeredDomains.forEach(domain => {
        console.log(`   🌐 ${domain.name} (Token ID: ${domain.tokenId})`);
        console.log(`      Owner: ${domain.owner}`);
        if (domain.node) console.log(`      Node: ${domain.node}`);
        console.log('');
      });
    } else {
      console.log('❌ No domains currently registered on this testnet contract\n');
    }
    
    // List out test domain names for verification
    console.log('\n🧪 Common test domains to check:');
    const testDomains = ['test', 'testdomain', 'hello', 'alice', 'bob', 'example', 'demo'];
    
    for (const domain of testDomains) {
      try {
        const node = keccak256(toUtf8Bytes(domain));
        const exists = await nft.exists(node);
        if (exists) {
          const name = await nft.getName(node);
          console.log(`   ✅ "${domain}" exists as "${name}"`);
        }
      } catch (e) {
        // Domain doesn't exist
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

checkRegisteredDomains();

