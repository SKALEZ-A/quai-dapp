// Simple test to verify minting permissions
import { JsonRpcProvider, Contract, Wallet, keccak256, toUtf8Bytes } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x002ADB96b4aE41c7d2Ca22A1e7f8468F55F6e57b',
};

const RPC_URL = 'https://orchard.rpc.quai.network';
const PRIVATE_KEY = '0x8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802';

// ABIs
const NFT_ABI = [
  "function mint(bytes32 node, address to, string calldata name) external returns (uint256)",
  "function exists(bytes32 node) external view returns (bool)",
];

async function testSimpleMint() {
  console.log('🧪 Simple Mint Test...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const wallet = new Wallet(PRIVATE_KEY, provider);
    
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    const nft = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, wallet);
    
    const testDomain = 'simpletest';
    const testNode = keccak256(toUtf8Bytes(testDomain));
    
    console.log(`📝 Testing domain: ${testDomain}`);
    console.log(`🔗 Node: ${testNode}\n`);
    
    // Check if domain exists
    const exists = await nft.exists(testNode);
    console.log(`Domain exists: ${exists}`);
    
    if (exists) {
      console.log('Domain already exists, trying different name...');
      const testDomain2 = 'simpletest2';
      const testNode2 = keccak256(toUtf8Bytes(testDomain2));
      console.log(`📝 Testing domain: ${testDomain2}`);
      console.log(`🔗 Node: ${testNode2}\n`);
      
      // Try to mint
      console.log('Attempting to mint...');
      try {
        const mintTx = await nft.mint(testNode2, wallet.address, testDomain2, {
          gasLimit: 500000
        });
        console.log(`✅ Mint transaction sent: ${mintTx.hash}`);
        
        const receipt = await mintTx.wait();
        console.log(`✅ Mint successful! Gas used: ${receipt.gasUsed}`);
        
      } catch (error) {
        console.log(`❌ Mint failed: ${error.message}`);
        
        // Try to get more details about the error
        if (error.message.includes('AccessControlUnauthorizedAccount')) {
          console.log('💡 Error: Deployer does not have MINTER_ROLE');
        } else if (error.message.includes('Name already minted')) {
          console.log('💡 Error: Domain already exists');
        } else if (error.message.includes('Cannot mint to zero address')) {
          console.log('💡 Error: Invalid recipient address');
        } else {
          console.log('💡 Error: Unknown issue with minting');
        }
      }
    } else {
      // Try to mint
      console.log('Attempting to mint...');
      try {
        const mintTx = await nft.mint(testNode, wallet.address, testDomain, {
          gasLimit: 500000
        });
        console.log(`✅ Mint transaction sent: ${mintTx.hash}`);
        
        const receipt = await mintTx.wait();
        console.log(`✅ Mint successful! Gas used: ${receipt.gasUsed}`);
        
      } catch (error) {
        console.log(`❌ Mint failed: ${error.message}`);
        
        // Try to get more details about the error
        if (error.message.includes('AccessControlUnauthorizedAccount')) {
          console.log('💡 Error: Deployer does not have MINTER_ROLE');
        } else if (error.message.includes('Name already minted')) {
          console.log('💡 Error: Domain already exists');
        } else if (error.message.includes('Cannot mint to zero address')) {
          console.log('💡 Error: Invalid recipient address');
        } else {
          console.log('💡 Error: Unknown issue with minting');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleMint();