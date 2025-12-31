const { quais } = require('quais');
const fs = require('fs');
const path = require('path');

// Load deployed addresses
const deployedAddresses = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'deployed-addresses-simple.json'), 'utf8')
);

// QNS NFT ABI - only need totalSupply function
const QNS_NFT_ABI = [
  "function totalSupply() external view returns (uint256)",
  "function getName(bytes32 node) external view returns (string)",
  "function getNode(uint256 tokenId) external view returns (bytes32)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

const RPC_URL = 'https://orchard.rpc.quai.network';
const QNS_NFT_ADDRESS = deployedAddresses.contracts.QNS_NFT;

async function checkMintedDomains() {
  console.log('🔍 Checking minted .quai domains...\n');
  console.log(`📍 QNS NFT Contract: ${QNS_NFT_ADDRESS}`);
  console.log(`🌐 RPC URL: ${RPC_URL}/cyprus1\n`);

  try {
    // Connect to provider
    const provider = new quais.JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    
    // Create contract instance
    const nftContract = new quais.Contract(QNS_NFT_ADDRESS, QNS_NFT_ABI, provider);
    
    // Get total supply
    console.log('⏳ Fetching total supply...');
    const totalSupply = await nftContract.totalSupply();
    
    console.log(`\n✅ Total .quai domains minted: ${totalSupply.toString()}`);
    
    if (totalSupply > 0n) {
      console.log('\n📋 Fetching domain details...\n');
      
      // Fetch details for each minted domain
      for (let i = 1; i <= Number(totalSupply); i++) {
        try {
          const node = await nftContract.getNode(i);
          const name = await nftContract.getName(node);
          const owner = await nftContract.ownerOf(i);
          
          console.log(`Token ID ${i}:`);
          console.log(`  Name: ${name}`);
          console.log(`  Owner: ${owner}`);
          console.log(`  Node: ${node}\n`);
        } catch (error) {
          console.log(`Token ID ${i}: Error fetching details - ${error.message}\n`);
        }
      }
    } else {
      console.log('\n⚠️  No domains have been minted yet.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

checkMintedDomains();
