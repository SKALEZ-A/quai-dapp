// Check role hierarchy to understand permission structure
import { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x002ADB96b4aE41c7d2Ca22A1e7f8468F55F6e57b',
  QNS_REGISTRY: '0x0000A75388737BfedDB1646346B7F5d1Abe18a24',
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
];

const NFT_ABI = [
  ...ACCESS_CONTROL_ABI,
];

const REGISTRY_ABI = [
  ...ACCESS_CONTROL_ABI,
];

async function checkRoleHierarchy() {
  console.log('🔍 Checking Role Hierarchy and Permissions...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    
    const nft = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, provider);
    const registry = new Contract(CONTRACTS.QNS_REGISTRY, REGISTRY_ABI, provider);
    
    const deployerAddress = '0x003DAC94805c77d7fD485cd415F8078414d171e4';
    
    console.log('📋 Role Hierarchy Analysis:\n');
    
    // Check NFT contract role hierarchy
    console.log('🔐 NFT Contract Role Hierarchy:');
    
    try {
      const minterRoleAdmin = await nft.getRoleAdmin(MINTER_ROLE);
      console.log(`   MINTER_ROLE admin: ${minterRoleAdmin}`);
      
      if (minterRoleAdmin === DEFAULT_ADMIN_ROLE) {
        console.log('   → MINTER_ROLE is managed by DEFAULT_ADMIN_ROLE');
      } else if (minterRoleAdmin === ADMIN_ROLE) {
        console.log('   → MINTER_ROLE is managed by ADMIN_ROLE');
      } else {
        console.log('   → MINTER_ROLE is managed by a different role');
      }
    } catch (error) {
      console.log(`   Error getting MINTER_ROLE admin: ${error.message}`);
    }
    
    try {
      const adminRoleAdmin = await nft.getRoleAdmin(ADMIN_ROLE);
      console.log(`   ADMIN_ROLE admin: ${adminRoleAdmin}`);
      
      if (adminRoleAdmin === DEFAULT_ADMIN_ROLE) {
        console.log('   → ADMIN_ROLE is managed by DEFAULT_ADMIN_ROLE');
      } else {
        console.log('   → ADMIN_ROLE is managed by a different role');
      }
    } catch (error) {
      console.log(`   Error getting ADMIN_ROLE admin: ${error.message}`);
    }
    
    // Check Registry contract role hierarchy
    console.log('\n🔐 Registry Contract Role Hierarchy:');
    
    try {
      const registryAdminRoleAdmin = await registry.getRoleAdmin(ADMIN_ROLE);
      console.log(`   ADMIN_ROLE admin: ${registryAdminRoleAdmin}`);
      
      if (registryAdminRoleAdmin === DEFAULT_ADMIN_ROLE) {
        console.log('   → ADMIN_ROLE is managed by DEFAULT_ADMIN_ROLE');
      } else {
        console.log('   → ADMIN_ROLE is managed by a different role');
      }
    } catch (error) {
      console.log(`   Error getting Registry ADMIN_ROLE admin: ${error.message}`);
    }
    
    // Check who can grant roles
    console.log('\n👤 Deployer Permissions:');
    console.log(`   Address: ${deployerAddress}`);
    
    const deployerHasDefaultAdminNFT = await nft.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
    const deployerHasAdminNFT = await nft.hasRole(ADMIN_ROLE, deployerAddress);
    const deployerHasMinterNFT = await nft.hasRole(MINTER_ROLE, deployerAddress);
    
    console.log(`   NFT - DEFAULT_ADMIN_ROLE: ${deployerHasDefaultAdminNFT ? '✅' : '❌'}`);
    console.log(`   NFT - ADMIN_ROLE: ${deployerHasAdminNFT ? '✅' : '❌'}`);
    console.log(`   NFT - MINTER_ROLE: ${deployerHasMinterNFT ? '✅' : '❌'}`);
    
    const deployerHasDefaultAdminRegistry = await registry.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
    const deployerHasAdminRegistry = await registry.hasRole(ADMIN_ROLE, deployerAddress);
    
    console.log(`   Registry - DEFAULT_ADMIN_ROLE: ${deployerHasDefaultAdminRegistry ? '✅' : '❌'}`);
    console.log(`   Registry - ADMIN_ROLE: ${deployerHasAdminRegistry ? '✅' : '❌'}`);
    
    // Analysis
    console.log('\n💡 Analysis:');
    
    if (!deployerHasDefaultAdminNFT && !deployerHasDefaultAdminRegistry) {
      console.log('   ❌ Deployer does not have DEFAULT_ADMIN_ROLE on any contract');
      console.log('   📝 This means they cannot grant roles that require DEFAULT_ADMIN_ROLE');
    }
    
    if (deployerHasAdminNFT && deployerHasAdminRegistry) {
      console.log('   ✅ Deployer has ADMIN_ROLE on both contracts');
      console.log('   📝 They can grant roles that are managed by ADMIN_ROLE');
    }
    
    console.log('\n🔧 Solutions:');
    console.log('   1. Find who has DEFAULT_ADMIN_ROLE and use that wallet');
    console.log('   2. Redeploy contracts with proper role setup');
    console.log('   3. Use a different approach to enable domain registration');
    
    // Check if we can use the deployer's MINTER_ROLE directly
    if (deployerHasMinterNFT) {
      console.log('\n💡 Alternative Solution:');
      console.log('   ✅ Deployer has MINTER_ROLE on NFT');
      console.log('   🔧 We could potentially use deployer to mint domains directly');
      console.log('   📝 Then use deployer\'s ADMIN_ROLE to set registry owners');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkRoleHierarchy();