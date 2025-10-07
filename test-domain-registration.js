// Test script to verify domain registration
import { Contract, keccak256, toUtf8Bytes, parseEther, JsonRpcProvider, Wallet } from 'quais';

// Contract configuration
const CONTRACTS = {
  QNS_REGISTRY: '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_NFT: '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
  QNS_REGISTRAR: '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b',
};

const RPC_URL = 'https://orchard.rpc.quai.network';
const PRIVATE_KEY = '8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802';

// Contract ABIs
const QNS_REGISTRY_ABI = [
  "function ownerOf(bytes32 node) external view returns (address)",
];

const QNS_NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getTokenId(bytes32 node) external view returns (uint256)",
  "function getNode(uint256 tokenId) external view returns (bytes32)",
  "function getName(bytes32 node) external view returns (string)",
];

const QNS_REGISTRAR_ABI = [
  "function register(string calldata name, bytes32 node) external payable returns (uint256)",
  "function getPrice(string calldata name) external view returns (uint256)",
  "function available(bytes32 node) external view returns (bool)",
];

// Helper functions
function nameToNode(name) {
  const label = name.toLowerCase();
  return keccak256(toUtf8Bytes(label));
}

async function testDomainRegistration() {
  try {
    console.log('🔍 Testing domain registration...');
    
    // Create provider and wallet
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const wallet = new Wallet(PRIVATE_KEY, provider);
    
    console.log('📡 Connected to:', RPC_URL);
    console.log('👤 Wallet address:', wallet.address);
    
    // Create contract instances
    const nftContract = new Contract(CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    const registryContract = new Contract(CONTRACTS.QNS_REGISTRY, QNS_REGISTRY_ABI, provider);
    const registrarContract = new Contract(CONTRACTS.QNS_REGISTRAR, QNS_REGISTRAR_ABI, provider);
    
    const testDomain = 'test123';
    const node = nameToNode(testDomain);
    
    console.log(`\n🏷️  Testing domain: ${testDomain}.qns`);
    console.log('🔗 Node hash:', node);
    
    // Check if domain exists
    console.log('\n📋 Checking domain availability...');
    const exists = await nftContract.exists(node);
    console.log('Domain exists:', exists);
    
    if (exists) {
      const owner = await registryContract.ownerOf(node);
      console.log('Domain owner:', owner);
      console.log('❌ Domain is already registered');
      return;
    }
    
    // Check availability through registrar
    const available = await registrarContract.available(node);
    console.log('Domain available:', available);
    
    if (!available) {
      console.log('❌ Domain is not available or reserved');
      return;
    }
    
    // Get price
    console.log('\n💰 Getting domain price...');
    const price = await registrarContract.getPrice(testDomain);
    console.log('Price (wei):', price.toString());
    console.log('Price (QI):', (Number(price) / 1e18).toFixed(4));
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Wallet balance (QI):', (Number(balance) / 1e18).toFixed(4));
    
    if (balance < price) {
      console.log('❌ Insufficient balance for registration');
      return;
    }
    
    // Register domain
    console.log('\n🚀 Registering domain...');
    const registrarWithSigner = registrarContract.connect(wallet);
    
    const tx = await registrarWithSigner.register(testDomain, node, { value: price });
    console.log('Transaction sent:', tx.hash);
    
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    console.log('Block number:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    // Verify registration
    console.log('\n🔍 Verifying registration...');
    const newExists = await nftContract.exists(node);
    console.log('Domain now exists:', newExists);
    
    if (newExists) {
      const newOwner = await registryContract.ownerOf(node);
      console.log('New domain owner:', newOwner);
      console.log('✅ Domain successfully registered!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testDomainRegistration();
