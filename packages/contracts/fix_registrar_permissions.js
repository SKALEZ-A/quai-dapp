// Fix registrar permissions by granting required roles
import { JsonRpcProvider, Contract, Wallet, keccak256, toUtf8Bytes } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x002ADB96b4aE41c7d2Ca22A1e7f8468F55F6e57b',
  QNS_REGISTRY: '0x0000A75388737BfedDB1646346B7F5d1Abe18a24',
  QNS_REGISTRAR: '0x003d8Cf751661432bBDFf5c68c7c910DC388Aba7',
};

const RPC_URL = 'https://orchard.rpc.quai.network';
const PRIVATE_KEY = '0x8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802';

// Role constants
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ADMIN_ROLE = keccak256(toUtf8Bytes('ADMIN_ROLE'));
const MINTER_ROLE = keccak256(toUtf8Bytes('MINTER_ROLE'));

// ABIs
const ACCESS_CONTROL_ABI = [
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function grantRole(bytes32 role, address account) external",
  "function getRoleAdmin(bytes32 role) external view returns (bytes32)",
];

const NFT_ABI = [
  ...ACCESS_CONTROL_ABI,
];

const REGISTRY_ABI = [
  ...ACCESS_CONTROL_ABI,
];

async function fixRegistrarPermissions() {
  console.log('🔧 Fixing Registrar Permissions...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const wallet = new Wallet(PRIVATE_KEY, provider);
    
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    const nft = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, wallet);
    const registry = new Contract(CONTRACTS.QNS_REGISTRY, REGISTRY_ABI, wallet);
    
    console.log('\n🔍 Checking current permissions...');
    
    // Check if deployer has DEFAULT_ADMIN_ROLE
    const hasDefaultAdminNFT = await nft.hasRole(DEFAULT_ADMIN_ROLE, wallet.address);
    const hasDefaultAdminRegistry = await registry.hasRole(DEFAULT_ADMIN_ROLE, wallet.address);
    
    console.log(`   Deployer has DEFAULT_ADMIN_ROLE on NFT: ${hasDefaultAdminNFT ? '✅' : '❌'}`);
    console.log(`   Deployer has DEFAULT_ADMIN_ROLE on Registry: ${hasDefaultAdminRegistry ? '✅' : '❌'}`);
    
    if (!hasDefaultAdminNFT || !hasDefaultAdminRegistry) {
      console.log('\n❌ Deployer does not have DEFAULT_ADMIN_ROLE!');
      console.log('   Cannot grant roles without admin permissions.');
      console.log('   The contracts may need to be redeployed or the admin role needs to be transferred.');
      return;
    }
    
    // Check current registrar permissions
    const hasMinterRole = await nft.hasRole(MINTER_ROLE, CONTRACTS.QNS_REGISTRAR);
    const hasAdminRole = await registry.hasRole(ADMIN_ROLE, CONTRACTS.QNS_REGISTRAR);
    
    console.log(`\n📋 Current Registrar Permissions:`);
    console.log(`   Registrar has MINTER_ROLE on NFT: ${hasMinterRole ? '✅' : '❌'}`);
    console.log(`   Registrar has ADMIN_ROLE on Registry: ${hasAdminRole ? '✅' : '❌'}`);
    
    if (hasMinterRole && hasAdminRole) {
      console.log('\n✅ Registrar already has all required permissions!');
      return;
    }
    
    console.log('\n🔧 Granting missing permissions...');
    
    // Grant MINTER_ROLE to registrar on NFT
    if (!hasMinterRole) {
      console.log('\n1. Granting MINTER_ROLE to registrar on NFT...');
      try {
        const grantMinterTx = await nft.grantRole(MINTER_ROLE, CONTRACTS.QNS_REGISTRAR);
        console.log(`   ✅ Transaction sent: ${grantMinterTx.hash}`);
        console.log('   ⏳ Waiting for confirmation...');
        
        await grantMinterTx.wait();
        console.log('   ✅ MINTER_ROLE granted successfully!');
      } catch (error) {
        console.log(`   ❌ Failed to grant MINTER_ROLE: ${error.message}`);
        return;
      }
    }
    
    // Grant ADMIN_ROLE to registrar on Registry
    if (!hasAdminRole) {
      console.log('\n2. Granting ADMIN_ROLE to registrar on Registry...');
      try {
        const grantAdminTx = await registry.grantRole(ADMIN_ROLE, CONTRACTS.QNS_REGISTRAR);
        console.log(`   ✅ Transaction sent: ${grantAdminTx.hash}`);
        console.log('   ⏳ Waiting for confirmation...');
        
        await grantAdminTx.wait();
        console.log('   ✅ ADMIN_ROLE granted successfully!');
      } catch (error) {
        console.log(`   ❌ Failed to grant ADMIN_ROLE: ${error.message}`);
        return;
      }
    }
    
    // Verify permissions were granted
    console.log('\n🔍 Verifying permissions...');
    
    const finalHasMinterRole = await nft.hasRole(MINTER_ROLE, CONTRACTS.QNS_REGISTRAR);
    const finalHasAdminRole = await registry.hasRole(ADMIN_ROLE, CONTRACTS.QNS_REGISTRAR);
    
    console.log(`   Registrar has MINTER_ROLE on NFT: ${finalHasMinterRole ? '✅' : '❌'}`);
    console.log(`   Registrar has ADMIN_ROLE on Registry: ${finalHasAdminRole ? '✅' : '❌'}`);
    
    if (finalHasMinterRole && finalHasAdminRole) {
      console.log('\n🎉 SUCCESS! Registrar now has all required permissions!');
      console.log('   Domain registration should now work properly.');
    } else {
      console.log('\n❌ FAILED! Some permissions are still missing.');
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixRegistrarPermissions();