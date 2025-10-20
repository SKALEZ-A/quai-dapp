// Quick test to verify QNS frontend interaction setup
const { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } = require('quais');

// Contract addresses from deployment
const CONTRACTS = {
  QNS_REGISTRAR: '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b',
  QNS_NFT: '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
  QNS_REGISTRY: '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_RESERVED_NAMES: '0x0023272C07514D2D236f6c6895507DFd26442471',
};

// RPC URL - base URL only for Quai
const RPC_URL = 'https://orchard.rpc.quai.network';

// Minimal ABIs
const REGISTRAR_ABI = [
  "function register(string calldata name, bytes32 node) external payable returns (uint256)",
  "function getPrice(string calldata name) external view returns (uint256)",
  "function available(bytes32 node) external view returns (bool)",
];

const NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
];

async function main() {
  console.log('🔍 Testing QNS Frontend Interaction Setup\n');

  try {
    // Create provider with usePathing for Quai
    console.log('1. Creating provider...');
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    console.log('✅ Provider created');

    // Get network info
    console.log('\n2. Checking network...');
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.chainId}`);

    // Create contract instances
    console.log('\n3. Creating contract instances...');
    const registrarContract = new Contract(CONTRACTS.QNS_REGISTRAR, REGISTRAR_ABI, provider);
    const nftContract = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, provider);
    console.log('✅ Contracts created');

    // Test basic contract calls
    console.log('\n4. Testing contract calls...');
    
    // Test getPrice
    const testName = 'testdomain';
    const price = await registrarContract.getPrice(testName);
    console.log(`✅ getPrice("${testName}"): ${price.toString()} wei (${Number(price) / 1e18} QI)`);

    // Test nameToNode (simple hash)
    const node = keccak256(toUtf8Bytes(testName));
    console.log(`✅ nameToNode("${testName}"): ${node}`);

    // Test exists
    const exists = await nftContract.exists(node);
    console.log(`✅ exists(${node}): ${exists}`);

    // Test available
    const available = await registrarContract.available(node);
    console.log(`✅ available(${node}): ${available}`);

    console.log('\n✅ All basic tests passed!');
    console.log('\n📋 Summary:');
    console.log('  - Provider: Working');
    console.log('  - Network: Connected');
    console.log('  - Contracts: Accessible');
    console.log('  - Contract calls: Working');
    console.log('\n💡 The frontend setup is correct. If you\'re experiencing issues:');
    console.log('  1. Make sure your wallet (Pelagus) is connected');
    console.log('  2. Make sure you\'re on the correct network (Cyprus-1)');
    console.log('  3. Make sure you have sufficient QI balance');
    console.log('  4. Check browser console for detailed error messages');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('Invalid URL')) {
      console.log('\n💡 Fix: Make sure RPC_URL is base URL only (no /cyprus1 path)');
    } else if (error.message.includes('could not detect network')) {
      console.log('\n💡 Fix: Check your internet connection and RPC endpoint');
    } else if (error.message.includes('contract')) {
      console.log('\n💡 Fix: Verify contract addresses are correct');
    }
  }
}

main().catch(console.error);
