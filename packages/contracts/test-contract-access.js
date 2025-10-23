// Quick test to verify contract accessibility and permissions
import { Contract, JsonRpcProvider } from 'quais';
import fs from 'fs';

// Load deployed addresses
const deployedAddresses = JSON.parse(fs.readFileSync('packages/contracts/deployed-addresses-simple.json', 'utf8'));

// RPC URL - base URL without path (path will be added by usePathing)
const RPC_URL = 'https://orchard.rpc.quai.network';

// Minimal ABIs for testing
const REGISTRAR_ABI = [
  'function available(bytes32 node) view returns (bool)',
  'function getPrice(string name) view returns (uint256)',
  'function register(string name, bytes32 node) payable',
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function MINTER_ROLE() view returns (bytes32)'
];

const NFT_ABI = [
  'function exists(bytes32 node) view returns (bool)',
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function MINTER_ROLE() view returns (bytes32)'
];

const REGISTRY_ABI = [
  'function ownerOf(bytes32 node) view returns (address)',
  'function hasRole(bytes32 role, address account) view returns (bool)'
];

async function main() {
  console.log('🔍 Testing Contract Access and Permissions\n');
  console.log('Network:', deployedAddresses.network);
  console.log('Chain ID:', deployedAddresses.chainId);
  console.log('RPC URL:', RPC_URL);
  console.log('');

  try {
    // Create provider with usePathing enabled (required for Quai)
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    console.log('✅ Provider created');

    // Test network connection
    const network = await provider.getNetwork();
    console.log('✅ Connected to network:', network.chainId.toString());
    console.log('');

    // Create contract instances
    const registrar = new Contract(deployedAddresses.contracts.QNS_REGISTRAR, REGISTRAR_ABI, provider);
    const nft = new Contract(deployedAddresses.contracts.QNS_NFT, NFT_ABI, provider);
    const registry = new Contract(deployedAddresses.contracts.QNS_REGISTRY, REGISTRY_ABI, provider);

    console.log('📋 Contract Addresses:');
    console.log('  Registrar:', deployedAddresses.contracts.QNS_REGISTRAR);
    console.log('  NFT:', deployedAddresses.contracts.QNS_NFT);
    console.log('  Registry:', deployedAddresses.contracts.QNS_REGISTRY);
    console.log('');

    // Check if contracts have code
    console.log('🔍 Checking contract code...');
    const registrarCode = await provider.getCode(deployedAddresses.contracts.QNS_REGISTRAR);
    const nftCode = await provider.getCode(deployedAddresses.contracts.QNS_NFT);
    const registryCode = await provider.getCode(deployedAddresses.contracts.QNS_REGISTRY);

    console.log('  Registrar has code:', registrarCode !== '0x' && registrarCode.length > 2);
    console.log('  NFT has code:', nftCode !== '0x' && nftCode.length > 2);
    console.log('  Registry has code:', registryCode !== '0x' && registryCode.length > 2);
    console.log('');

    // Test basic contract calls
    console.log('🔍 Testing basic contract calls...');
    
    try {
      const testNode = '0x' + '1'.repeat(64); // Test node hash
      const isAvailable = await registrar.available(testNode);
      console.log('  ✅ Registrar.available() works:', isAvailable);
    } catch (error) {
      console.log('  ❌ Registrar.available() failed:', error.message);
    }

    try {
      const price = await registrar.getPrice('test');
      console.log('  ✅ Registrar.getPrice() works:', price.toString());
    } catch (error) {
      console.log('  ❌ Registrar.getPrice() failed:', error.message);
    }

    try {
      const testNode = '0x' + '1'.repeat(64);
      const exists = await nft.exists(testNode);
      console.log('  ✅ NFT.exists() works:', exists);
    } catch (error) {
      console.log('  ❌ NFT.exists() failed:', error.message);
    }

    console.log('');

    // Check permissions
    console.log('🔍 Checking permissions...');
    
    try {
      const minterRole = await nft.MINTER_ROLE();
      console.log('  MINTER_ROLE:', minterRole);
      
      const registrarHasMinterRole = await nft.hasRole(minterRole, deployedAddresses.contracts.QNS_REGISTRAR);
      console.log('  Registrar has MINTER_ROLE on NFT:', registrarHasMinterRole);
      
      if (!registrarHasMinterRole) {
        console.log('  ⚠️  WARNING: Registrar does NOT have MINTER_ROLE on NFT contract!');
        console.log('  This will cause registration to fail.');
        console.log('  Run: node scripts/grant-roles-fresh.js');
      }
    } catch (error) {
      console.log('  ❌ Permission check failed:', error.message);
    }

    console.log('');
    console.log('✅ Contract access test complete');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
