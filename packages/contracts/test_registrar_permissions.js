// Test registrar permissions and identify registration revert issue
import { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from 'quais';

const CONTRACTS = {
  QNS_NFT: '0x002ADB96b4aE41c7d2Ca22A1e7f8468F55F6e57b',
  QNS_REGISTRY: '0x0000A75388737BfedDB1646346B7F5d1Abe18a24',
  QNS_REGISTRAR: '0x003d8Cf751661432bBDFf5c68c7c910DC388Aba7',
  QNS_RESERVED_NAMES: '0x002119beef97d4a5Ac9265f4F229a7308aD316B7',
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
  "function exists(bytes32 node) external view returns (bool)",
  "function mint(bytes32 node, address to, string calldata name) external returns (uint256)",
  ...ACCESS_CONTROL_ABI,
];

const REGISTRY_ABI = [
  "function setOwner(bytes32 node, address owner) external",
  ...ACCESS_CONTROL_ABI,
];

const REGISTRAR_ABI = [
  "function register(string calldata name, bytes32 node) external payable returns (uint256)",
  "function getPrice(string calldata name) external view returns (uint256)",
  "function available(bytes32 node) external view returns (bool)",
  "function paused() external view returns (bool)",
];

const RESERVED_NAMES_ABI = [
  "function isReserved(bytes32 node) external view returns (bool)",
];

async function testRegistrarPermissions() {
  console.log('🔍 Testing Registrar Permissions and Registration Process...\n');
  
  try {
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    
    const nft = new Contract(CONTRACTS.QNS_NFT, NFT_ABI, provider);
    const registry = new Contract(CONTRACTS.QNS_REGISTRY, REGISTRY_ABI, provider);
    const registrar = new Contract(CONTRACTS.QNS_REGISTRAR, REGISTRAR_ABI, provider);
    const reservedNames = new Contract(CONTRACTS.QNS_RESERVED_NAMES, RESERVED_NAMES_ABI, provider);
    
    console.log('📋 Contract Addresses:');
    console.log(`   NFT: ${CONTRACTS.QNS_NFT}`);
    console.log(`   Registry: ${CONTRACTS.QNS_REGISTRY}`);
    console.log(`   Registrar: ${CONTRACTS.QNS_REGISTRAR}`);
    console.log(`   Reserved Names: ${CONTRACTS.QNS_RESERVED_NAMES}\n`);
    
    // ========================================
    // STEP 1: Check Registrar Permissions
    // ========================================
    console.log('🔐 Checking Registrar Permissions...\n');
    
    // Check if registrar has MINTER_ROLE on NFT
    const hasMinterRole = await nft.hasRole(MINTER_ROLE, CONTRACTS.QNS_REGISTRAR);
    console.log(`   Registrar has MINTER_ROLE on NFT: ${hasMinterRole ? '✅' : '❌'}`);
    
    // Check if registrar has ADMIN_ROLE on Registry
    const hasAdminRole = await registry.hasRole(ADMIN_ROLE, CONTRACTS.QNS_REGISTRAR);
    console.log(`   Registrar has ADMIN_ROLE on Registry: ${hasAdminRole ? '✅' : '❌'}\n`);
    
    if (!hasMinterRole || !hasAdminRole) {
      console.log('❌ MISSING PERMISSIONS - This is likely the cause of registration reverts!\n');
      
      // Check who has these roles
      console.log('🔍 Checking role holders...');
      
      // Check who has MINTER_ROLE on NFT
      console.log('   MINTER_ROLE holders on NFT:');
      try {
        const minterRoleAdmin = await nft.getRoleAdmin(MINTER_ROLE);
        console.log(`     Role Admin: ${minterRoleAdmin}`);
      } catch (error) {
        console.log(`     Error getting MINTER_ROLE admin: ${error.message}`);
      }
      
      // Check who has ADMIN_ROLE on Registry
      console.log('   ADMIN_ROLE holders on Registry:');
      try {
        const adminRoleAdmin = await registry.getRoleAdmin(ADMIN_ROLE);
        console.log(`     Role Admin: ${adminRoleAdmin}`);
      } catch (error) {
        console.log(`     Error getting ADMIN_ROLE admin: ${error.message}`);
      }
      
      console.log('\n💡 SOLUTION: Grant the missing roles to the registrar contract\n');
      return;
    }
    
    // ========================================
    // STEP 2: Test Registration Process Step by Step
    // ========================================
    console.log('🧪 Testing Registration Process Step by Step...\n');
    
    const testDomain = 'testdomain3';
    const testNode = keccak256(toUtf8Bytes(testDomain));
    const deployerAddress = '0x003DAC94805c77d7fD485cd415F8078414d171e4';
    
    console.log(`   Testing domain: ${testDomain}`);
    console.log(`   Node: ${testNode}`);
    console.log(`   Deployer: ${deployerAddress}\n`);
    
    // Step 1: Check if domain exists in NFT
    console.log('1. Checking if domain exists in NFT...');
    const exists = await nft.exists(testNode);
    console.log(`   Domain exists: ${exists}`);
    
    if (exists) {
      console.log('   ❌ Domain already exists, cannot register');
      return;
    }
    
    // Step 2: Check if domain is reserved
    console.log('\n2. Checking if domain is reserved...');
    const isReserved = await reservedNames.isReserved(testNode);
    console.log(`   Domain is reserved: ${isReserved}`);
    
    if (isReserved) {
      console.log('   ❌ Domain is reserved, cannot register');
      return;
    }
    
    // Step 3: Check registrar availability
    console.log('\n3. Checking registrar availability...');
    const available = await registrar.available(testNode);
    console.log(`   Domain available: ${available}`);
    
    if (!available) {
      console.log('   ❌ Domain not available according to registrar');
      return;
    }
    
    // Step 4: Check if registrar is paused
    console.log('\n4. Checking if registrar is paused...');
    const paused = await registrar.paused();
    console.log(`   Registrar paused: ${paused}`);
    
    if (paused) {
      console.log('   ❌ Registrar is paused, cannot register');
      return;
    }
    
    // Step 5: Get price
    console.log('\n5. Getting registration price...');
    const price = await registrar.getPrice(testDomain);
    console.log(`   Price: ${price.toString()} wei`);
    
    // Step 6: Try to mint directly (simulate what registrar does)
    console.log('\n6. Testing direct mint (simulating registrar behavior)...');
    console.log('   ⚠️  This will fail because we don\'t have MINTER_ROLE, but it helps debug');
    
    try {
      // This will fail, but we can see the error
      await nft.mint(testNode, deployerAddress, testDomain);
      console.log('   ✅ Direct mint succeeded (unexpected!)');
    } catch (error) {
      console.log(`   ❌ Direct mint failed (expected): ${error.message}`);
      
      if (error.message.includes('AccessControlUnauthorizedAccount')) {
        console.log('   💡 This confirms MINTER_ROLE is required and properly enforced');
      }
    }
    
    // Step 7: Try to set owner directly (simulate what registrar does)
    console.log('\n7. Testing direct setOwner (simulating registrar behavior)...');
    console.log('   ⚠️  This will fail because we don\'t have ADMIN_ROLE, but it helps debug');
    
    try {
      // This will fail, but we can see the error
      await registry.setOwner(testNode, deployerAddress);
      console.log('   ✅ Direct setOwner succeeded (unexpected!)');
    } catch (error) {
      console.log(`   ❌ Direct setOwner failed (expected): ${error.message}`);
      
      if (error.message.includes('AccessControlUnauthorizedAccount')) {
        console.log('   💡 This confirms ADMIN_ROLE is required and properly enforced');
      }
    }
    
    console.log('\n✅ Permission and process testing complete!');
    
    if (hasMinterRole && hasAdminRole) {
      console.log('\n🎉 Registrar has all required permissions!');
      console.log('   The registration revert might be due to other issues:');
      console.log('   - Insufficient funds');
      console.log('   - Gas limit issues');
      console.log('   - Network congestion');
      console.log('   - Contract logic errors');
    } else {
      console.log('\n❌ Registrar is missing required permissions!');
      console.log('   This is definitely the cause of registration reverts.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRegistrarPermissions();