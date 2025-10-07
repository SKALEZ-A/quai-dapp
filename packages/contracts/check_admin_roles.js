// Check who has admin roles on the contracts
import { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x002ADB96b4aE41c7d2Ca22A1e7f8468F55F6e57b',
  QNS_REGISTRY: '0x0000A75388737BfedDB1646346B7F5d1Abe18a24',
  QNS_REGISTRAR: '0x003d8Cf751661432bBDFf5c68c7c910DC388Aba7',
};

const RPC_URL = 'https://orchard.rpc.quai.network';

// Role constants
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ADMIN_ROLE = keccak256(toUtf8Bytes('ADMIN_ROLE'));
const MINTER_ROLE = keccak256(toUtf8Bytes('MINTER_ROLE'));

// ABIs
const ACCESS_CONTROL_ABI = [
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function getRoleAdmin(bytes32 role) external view returns (bytes32)",
  "function getRoleMemberCount(bytes32 role) external view returns (uint256)",
  "function getRoleMember(bytes32 role, uint256 index) external view returns (address)",
];

const NFT_ABI = [
  ...ACCESS_CONTROL_ABI,
];

const REGISTRY_ABI = [
  ...ACCESS_CONTROL_ABI,
];

async function checkAdminRoles() {
  console.log('🔍 Checking Admin Roles and Permissions...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    
    const nft = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, provider);
    const registry = new Contract(CONTRACTS.QNS_REGISTRY, REGISTRY_ABI, provider);
    
    const deployerAddress = '0x003DAC94805c77d7fD485cd415F8078414d171e4';
    
    console.log('📋 Checking roles for deployer address:', deployerAddress);
    
    // Check deployer's roles on NFT
    console.log('\n🔐 Deployer roles on NFT:');
    const deployerHasDefaultAdminNFT = await nft.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
    const deployerHasAdminNFT = await nft.hasRole(ADMIN_ROLE, deployerAddress);
    const deployerHasMinterNFT = await nft.hasRole(MINTER_ROLE, deployerAddress);
    
    console.log(`   DEFAULT_ADMIN_ROLE: ${deployerHasDefaultAdminNFT ? '✅' : '❌'}`);
    console.log(`   ADMIN_ROLE: ${deployerHasAdminNFT ? '✅' : '❌'}`);
    console.log(`   MINTER_ROLE: ${deployerHasMinterNFT ? '✅' : '❌'}`);
    
    // Check deployer's roles on Registry
    console.log('\n🔐 Deployer roles on Registry:');
    const deployerHasDefaultAdminRegistry = await registry.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
    const deployerHasAdminRegistry = await registry.hasRole(ADMIN_ROLE, deployerAddress);
    
    console.log(`   DEFAULT_ADMIN_ROLE: ${deployerHasDefaultAdminRegistry ? '✅' : '❌'}`);
    console.log(`   ADMIN_ROLE: ${deployerHasAdminRegistry ? '✅' : '❌'}`);
    
    // Check registrar's roles
    console.log('\n🔐 Registrar roles on NFT:');
    const registrarHasDefaultAdminNFT = await nft.hasRole(DEFAULT_ADMIN_ROLE, CONTRACTS.QNS_REGISTRAR);
    const registrarHasAdminNFT = await nft.hasRole(ADMIN_ROLE, CONTRACTS.QNS_REGISTRAR);
    const registrarHasMinterNFT = await nft.hasRole(MINTER_ROLE, CONTRACTS.QNS_REGISTRAR);
    
    console.log(`   DEFAULT_ADMIN_ROLE: ${registrarHasDefaultAdminNFT ? '✅' : '❌'}`);
    console.log(`   ADMIN_ROLE: ${registrarHasAdminNFT ? '✅' : '❌'}`);
    console.log(`   MINTER_ROLE: ${registrarHasMinterNFT ? '✅' : '❌'}`);
    
    console.log('\n🔐 Registrar roles on Registry:');
    const registrarHasDefaultAdminRegistry = await registry.hasRole(DEFAULT_ADMIN_ROLE, CONTRACTS.QNS_REGISTRAR);
    const registrarHasAdminRegistry = await registry.hasRole(ADMIN_ROLE, CONTRACTS.QNS_REGISTRAR);
    
    console.log(`   DEFAULT_ADMIN_ROLE: ${registrarHasDefaultAdminRegistry ? '✅' : '❌'}`);
    console.log(`   ADMIN_ROLE: ${registrarHasAdminRegistry ? '✅' : '❌'}`);
    
    // Try to find who has DEFAULT_ADMIN_ROLE
    console.log('\n🔍 Searching for DEFAULT_ADMIN_ROLE holders...');
    
    try {
      const nftAdminCount = await nft.getRoleMemberCount(DEFAULT_ADMIN_ROLE);
      console.log(`   NFT DEFAULT_ADMIN_ROLE holders: ${nftAdminCount}`);
      
      if (nftAdminCount > 0) {
        for (let i = 0; i < nftAdminCount; i++) {
          const admin = await nft.getRoleMember(DEFAULT_ADMIN_ROLE, i);
          console.log(`     Admin ${i}: ${admin}`);
        }
      }
    } catch (error) {
      console.log(`   Error getting NFT admin members: ${error.message}`);
    }
    
    try {
      const registryAdminCount = await registry.getRoleMemberCount(DEFAULT_ADMIN_ROLE);
      console.log(`   Registry DEFAULT_ADMIN_ROLE holders: ${registryAdminCount}`);
      
      if (registryAdminCount > 0) {
        for (let i = 0; i < registryAdminCount; i++) {
          const admin = await registry.getRoleMember(DEFAULT_ADMIN_ROLE, i);
          console.log(`     Admin ${i}: ${admin}`);
        }
      }
    } catch (error) {
      console.log(`   Error getting Registry admin members: ${error.message}`);
    }
    
    // Check if the contracts were deployed with a different admin
    console.log('\n💡 Analysis:');
    if (!deployerHasDefaultAdminNFT && !deployerHasDefaultAdminRegistry) {
      console.log('   ❌ Deployer does not have DEFAULT_ADMIN_ROLE on either contract');
      console.log('   📝 This suggests the contracts were deployed with a different admin address');
      console.log('   🔧 Solutions:');
      console.log('      1. Find the actual admin address and use that wallet');
      console.log('      2. Redeploy the contracts with the correct admin');
      console.log('      3. Transfer admin roles (if possible)');
    }
    
    if (!registrarHasMinterNFT || !registrarHasAdminRegistry) {
      console.log('   ❌ Registrar is missing required roles for domain registration');
      console.log('   🔧 This is why registration transactions are reverting');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkAdminRoles();