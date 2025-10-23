/**
 * Permission Checker and Fixer Script
 * Verifies and fixes contract permissions for QNS system
 */

const { quais } = require('quais');
const fs = require('fs');
const path = require('path');

// Load deployment addresses
const deploymentPath = path.join(__dirname, '../deployed-addresses-simple.json');
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// Contract ABIs (minimal interface for permission checks)
const NFT_ABI = [
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function grantRole(bytes32 role, address account)',
  'function getRoleAdmin(bytes32 role) view returns (bytes32)',
  'function MINTER_ROLE() view returns (bytes32)',
  'function ADMIN_ROLE() view returns (bytes32)',
  'function DEFAULT_ADMIN_ROLE() view returns (bytes32)'
];

const REGISTRY_ABI = [
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function grantRole(bytes32 role, address account)',
  'function ADMIN_ROLE() view returns (bytes32)',
  'function DEFAULT_ADMIN_ROLE() view returns (bytes32)'
];

const REGISTRAR_ABI = [
  'function qnsNFT() view returns (address)',
  'function registry() view returns (address)',
  'function reservedNames() view returns (address)',
  'function admin() view returns (address)'
];

async function main() {
  console.log('🔍 QNS Permission Checker and Fixer\n');
  console.log('Deployment Info:');
  console.log(`  Network: ${deployment.network}`);
  console.log(`  Chain ID: ${deployment.chainId}`);
  console.log(`  Deployer: ${deployment.deployer}\n`);

  // Setup provider and signer - Base URL only, usePathing will add /cyprus1
  const provider = new quais.JsonRpcProvider('https://orchard.rpc.quai.network', undefined, { usePathing: true });
  const privateKey = process.env.PRIVATE_KEY || process.env.CYPRUS1_PK;
  
  if (!privateKey) {
    console.error('❌ Error: PRIVATE_KEY or CYPRUS1_PK not found in environment');
    process.exit(1);
  }

  const signer = new quais.Wallet(privateKey, provider);
  console.log(`Using signer: ${signer.address}\n`);

  // Load contracts
  const nftContract = new quais.Contract(deployment.contracts.QNS_NFT, NFT_ABI, signer);
  const registryContract = new quais.Contract(deployment.contracts.QNS_REGISTRY, REGISTRY_ABI, signer);
  const registrarContract = new quais.Contract(deployment.contracts.QNS_REGISTRAR, REGISTRAR_ABI, provider);

  const results = {
    timestamp: new Date().toISOString(),
    network: deployment.network,
    contracts: deployment.contracts,
    permissions: {},
    issues: [],
    fixes: []
  };

  try {
    // Check registrar references
    console.log('📋 Checking Registrar Configuration...');
    const nftAddress = await registrarContract.qnsNFT();
    const registryAddress = await registrarContract.registry();
    const reservedNamesAddress = await registrarContract.reservedNames();
    
    console.log(`  NFT Reference: ${nftAddress}`);
    console.log(`  Registry Reference: ${registryAddress}`);
    console.log(`  Reserved Names Reference: ${reservedNamesAddress}`);
    
    if (nftAddress.toLowerCase() !== deployment.contracts.QNS_NFT.toLowerCase()) {
      results.issues.push({
        severity: 'error',
        contract: 'Registrar',
        issue: 'NFT address mismatch',
        expected: deployment.contracts.QNS_NFT,
        actual: nftAddress
      });
    }
    
    if (registryAddress.toLowerCase() !== deployment.contracts.QNS_REGISTRY.toLowerCase()) {
      results.issues.push({
        severity: 'error',
        contract: 'Registrar',
        issue: 'Registry address mismatch',
        expected: deployment.contracts.QNS_REGISTRY,
        actual: registryAddress
      });
    }
    console.log('');

    // Check NFT permissions
    console.log('🔐 Checking NFT Contract Permissions...');
    const minterRole = await nftContract.MINTER_ROLE();
    const nftAdminRole = await nftContract.ADMIN_ROLE();
    const nftDefaultAdminRole = await nftContract.DEFAULT_ADMIN_ROLE();
    
    console.log(`  MINTER_ROLE: ${minterRole}`);
    console.log(`  ADMIN_ROLE: ${nftAdminRole}`);
    console.log(`  DEFAULT_ADMIN_ROLE: ${nftDefaultAdminRole}`);
    
    const hasMinterRole = await nftContract.hasRole(minterRole, deployment.contracts.QNS_REGISTRAR);
    const hasNftAdminRole = await nftContract.hasRole(nftAdminRole, signer.address);
    const hasNftDefaultAdminRole = await nftContract.hasRole(nftDefaultAdminRole, signer.address);
    
    results.permissions.nft = {
      registrarHasMinterRole: hasMinterRole,
      signerHasAdminRole: hasNftAdminRole,
      signerHasDefaultAdminRole: hasNftDefaultAdminRole
    };
    
    console.log(`  Registrar has MINTER_ROLE: ${hasMinterRole ? '✅' : '❌'}`);
    console.log(`  Signer has ADMIN_ROLE: ${hasNftAdminRole ? '✅' : '❌'}`);
    console.log(`  Signer has DEFAULT_ADMIN_ROLE: ${hasNftDefaultAdminRole ? '✅' : '❌'}`);
    
    if (!hasMinterRole) {
      results.issues.push({
        severity: 'error',
        contract: 'QNS_NFT',
        issue: 'Registrar missing MINTER_ROLE',
        fix: 'grantRole(MINTER_ROLE, registrar)'
      });
    }
    console.log('');

    // Check Registry permissions
    console.log('🔐 Checking Registry Contract Permissions...');
    const registryAdminRole = await registryContract.ADMIN_ROLE();
    const registryDefaultAdminRole = await registryContract.DEFAULT_ADMIN_ROLE();
    
    console.log(`  ADMIN_ROLE: ${registryAdminRole}`);
    console.log(`  DEFAULT_ADMIN_ROLE: ${registryDefaultAdminRole}`);
    
    const registrarHasRegistryAdminRole = await registryContract.hasRole(registryAdminRole, deployment.contracts.QNS_REGISTRAR);
    const signerHasRegistryAdminRole = await registryContract.hasRole(registryAdminRole, signer.address);
    const signerHasRegistryDefaultAdminRole = await registryContract.hasRole(registryDefaultAdminRole, signer.address);
    
    results.permissions.registry = {
      registrarHasAdminRole: registrarHasRegistryAdminRole,
      signerHasAdminRole: signerHasRegistryAdminRole,
      signerHasDefaultAdminRole: signerHasRegistryDefaultAdminRole
    };
    
    console.log(`  Registrar has ADMIN_ROLE: ${registrarHasRegistryAdminRole ? '✅' : '❌'}`);
    console.log(`  Signer has ADMIN_ROLE: ${signerHasRegistryAdminRole ? '✅' : '❌'}`);
    console.log(`  Signer has DEFAULT_ADMIN_ROLE: ${signerHasRegistryDefaultAdminRole ? '✅' : '❌'}`);
    
    if (!registrarHasRegistryAdminRole) {
      results.issues.push({
        severity: 'error',
        contract: 'QNS_REGISTRY',
        issue: 'Registrar missing ADMIN_ROLE',
        fix: 'grantRole(ADMIN_ROLE, registrar)'
      });
    }
    console.log('');

    // Summary
    console.log('📊 Summary:');
    console.log(`  Total Issues: ${results.issues.length}`);
    
    if (results.issues.length === 0) {
      console.log('  ✅ All permissions are correctly configured!');
    } else {
      console.log('  ❌ Issues found:\n');
      results.issues.forEach((issue, idx) => {
        console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.contract}: ${issue.issue}`);
        if (issue.fix) {
          console.log(`     Fix: ${issue.fix}`);
        }
      });
      
      // Ask if user wants to fix
      console.log('\n🔧 Would you like to fix these issues? (y/n)');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('', async (answer) => {
        readline.close();
        
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          await fixPermissions(signer, nftContract, registryContract, results);
        } else {
          console.log('\nSkipping fixes. Run this script again to fix permissions.');
        }
        
        // Save results
        saveResults(results);
      });
    }

  } catch (error) {
    console.error('❌ Error checking permissions:', error.message);
    results.error = error.message;
    saveResults(results);
    process.exit(1);
  }
}

async function fixPermissions(signer, nftContract, registryContract, results) {
  console.log('\n🔧 Fixing Permissions...\n');
  
  try {
    const minterRole = await nftContract.MINTER_ROLE();
    const registryAdminRole = await registryContract.ADMIN_ROLE();
    
    // Fix NFT MINTER_ROLE
    const needsMinterRole = results.issues.find(
      i => i.contract === 'QNS_NFT' && i.issue.includes('MINTER_ROLE')
    );
    
    if (needsMinterRole) {
      console.log('Granting MINTER_ROLE to Registrar on NFT contract...');
      const tx1 = await nftContract.grantRole(minterRole, deployment.contracts.QNS_REGISTRAR);
      console.log(`  Transaction sent: ${tx1.hash}`);
      await tx1.wait();
      console.log('  ✅ MINTER_ROLE granted\n');
      results.fixes.push({
        contract: 'QNS_NFT',
        action: 'grantRole(MINTER_ROLE, registrar)',
        txHash: tx1.hash
      });
    }
    
    // Fix Registry ADMIN_ROLE
    const needsRegistryAdminRole = results.issues.find(
      i => i.contract === 'QNS_REGISTRY' && i.issue.includes('ADMIN_ROLE')
    );
    
    if (needsRegistryAdminRole) {
      console.log('Granting ADMIN_ROLE to Registrar on Registry contract...');
      const tx2 = await registryContract.grantRole(registryAdminRole, deployment.contracts.QNS_REGISTRAR);
      console.log(`  Transaction sent: ${tx2.hash}`);
      await tx2.wait();
      console.log('  ✅ ADMIN_ROLE granted\n');
      results.fixes.push({
        contract: 'QNS_REGISTRY',
        action: 'grantRole(ADMIN_ROLE, registrar)',
        txHash: tx2.hash
      });
    }
    
    console.log('✅ All permissions fixed successfully!\n');
    console.log('Run this script again to verify the fixes.');
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error.message);
    results.fixError = error.message;
  }
  
  saveResults(results);
}

function saveResults(results) {
  const outputPath = path.join(__dirname, '../permission-check-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results saved to: ${outputPath}`);
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
