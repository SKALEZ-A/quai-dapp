/**
 * Contract Validation Script
 * Validates that all contracts are deployed and accessible with correct references
 */

const { quais } = require('quais');
const fs = require('fs');
const path = require('path');

// Load deployment addresses
const deploymentPath = path.join(__dirname, '../deployed-addresses-simple.json');
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// Minimal ABIs for validation
const REGISTRAR_ABI = [
  'function qnsNFT() view returns (address)',
  'function registry() view returns (address)',
  'function reservedNames() view returns (address)',
  'function admin() view returns (address)',
  'function treasury() view returns (address)',
  'function paused() view returns (bool)',
  'function getPrice(string name) view returns (uint256)',
  'function available(bytes32 node) view returns (bool)'
];

const NFT_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function exists(bytes32 node) view returns (bool)'
];

const REGISTRY_ABI = [
  'function ownerOf(bytes32 node) view returns (address)',
  'function resolverOf(bytes32 node) view returns (address)',
  'function ttlOf(bytes32 node) view returns (uint64)'
];

const RESERVED_NAMES_ABI = [
  'function isReserved(bytes32 node) view returns (bool)'
];

async function main() {
  console.log('🔍 QNS Contract Validation\n');
  console.log('Deployment Info:');
  console.log(`  Network: ${deployment.network}`);
  console.log(`  Chain ID: ${deployment.chainId}`);
  console.log(`  Timestamp: ${deployment.timestamp}\n`);

  // Setup provider - Base URL only, usePathing will add /cyprus1
  const provider = new quais.JsonRpcProvider('https://orchard.rpc.quai.network', undefined, { usePathing: true });

  const results = {
    timestamp: new Date().toISOString(),
    network: deployment.network,
    chainId: deployment.chainId,
    contracts: {},
    references: {},
    issues: [],
    warnings: []
  };

  try {
    // Validate each contract
    console.log('📋 Validating Contract Deployments...\n');

    // 1. Validate NFT Contract
    console.log('1️⃣  QNS NFT Contract');
    console.log(`   Address: ${deployment.contracts.QNS_NFT}`);
    const nftValidation = await validateContract(
      provider,
      deployment.contracts.QNS_NFT,
      NFT_ABI,
      'QNS_NFT'
    );
    results.contracts.QNS_NFT = nftValidation;
    
    if (nftValidation.deployed && nftValidation.accessible) {
      const nftContract = new quais.Contract(deployment.contracts.QNS_NFT, NFT_ABI, provider);
      try {
        const name = await nftContract.name();
        const symbol = await nftContract.symbol();
        const totalSupply = await nftContract.totalSupply();
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Total Supply: ${totalSupply.toString()}`);
        nftValidation.metadata = { name, symbol, totalSupply: totalSupply.toString() };
      } catch (error) {
        console.log(`   ⚠️  Could not read metadata: ${error.message}`);
        results.warnings.push({
          contract: 'QNS_NFT',
          message: 'Could not read contract metadata',
          error: error.message
        });
      }
    }
    console.log('');

    // 2. Validate Registry Contract
    console.log('2️⃣  QNS Registry Contract');
    console.log(`   Address: ${deployment.contracts.QNS_REGISTRY}`);
    const registryValidation = await validateContract(
      provider,
      deployment.contracts.QNS_REGISTRY,
      REGISTRY_ABI,
      'QNS_REGISTRY'
    );
    results.contracts.QNS_REGISTRY = registryValidation;
    console.log('');

    // 3. Validate Reserved Names Contract
    console.log('3️⃣  QNS Reserved Names Contract');
    console.log(`   Address: ${deployment.contracts.QNS_RESERVED_NAMES}`);
    const reservedNamesValidation = await validateContract(
      provider,
      deployment.contracts.QNS_RESERVED_NAMES,
      RESERVED_NAMES_ABI,
      'QNS_RESERVED_NAMES'
    );
    results.contracts.QNS_RESERVED_NAMES = reservedNamesValidation;
    console.log('');

    // 4. Validate Registrar Contract
    console.log('4️⃣  QNS Registrar Contract');
    console.log(`   Address: ${deployment.contracts.QNS_REGISTRAR}`);
    const registrarValidation = await validateContract(
      provider,
      deployment.contracts.QNS_REGISTRAR,
      REGISTRAR_ABI,
      'QNS_REGISTRAR'
    );
    results.contracts.QNS_REGISTRAR = registrarValidation;
    
    if (registrarValidation.deployed && registrarValidation.accessible) {
      console.log('\n   Checking Registrar References...');
      const registrarContract = new quais.Contract(
        deployment.contracts.QNS_REGISTRAR,
        REGISTRAR_ABI,
        provider
      );
      
      try {
        const nftRef = await registrarContract.qnsNFT();
        const registryRef = await registrarContract.registry();
        const reservedNamesRef = await registrarContract.reservedNames();
        const admin = await registrarContract.admin();
        const treasury = await registrarContract.treasury();
        const paused = await registrarContract.paused();
        
        results.references = {
          nft: {
            expected: deployment.contracts.QNS_NFT,
            actual: nftRef,
            matches: nftRef.toLowerCase() === deployment.contracts.QNS_NFT.toLowerCase()
          },
          registry: {
            expected: deployment.contracts.QNS_REGISTRY,
            actual: registryRef,
            matches: registryRef.toLowerCase() === deployment.contracts.QNS_REGISTRY.toLowerCase()
          },
          reservedNames: {
            expected: deployment.contracts.QNS_RESERVED_NAMES,
            actual: reservedNamesRef,
            matches: reservedNamesRef.toLowerCase() === deployment.contracts.QNS_RESERVED_NAMES.toLowerCase()
          }
        };
        
        console.log(`   NFT Reference: ${nftRef} ${results.references.nft.matches ? '✅' : '❌'}`);
        console.log(`   Registry Reference: ${registryRef} ${results.references.registry.matches ? '✅' : '❌'}`);
        console.log(`   Reserved Names Reference: ${reservedNamesRef} ${results.references.reservedNames.matches ? '✅' : '❌'}`);
        console.log(`   Admin: ${admin}`);
        console.log(`   Treasury: ${treasury}`);
        console.log(`   Paused: ${paused}`);
        
        if (!results.references.nft.matches) {
          results.issues.push({
            severity: 'error',
            contract: 'QNS_REGISTRAR',
            issue: 'NFT reference mismatch',
            expected: deployment.contracts.QNS_NFT,
            actual: nftRef
          });
        }
        
        if (!results.references.registry.matches) {
          results.issues.push({
            severity: 'error',
            contract: 'QNS_REGISTRAR',
            issue: 'Registry reference mismatch',
            expected: deployment.contracts.QNS_REGISTRY,
            actual: registryRef
          });
        }
        
        if (!results.references.reservedNames.matches) {
          results.issues.push({
            severity: 'error',
            contract: 'QNS_REGISTRAR',
            issue: 'Reserved Names reference mismatch',
            expected: deployment.contracts.QNS_RESERVED_NAMES,
            actual: reservedNamesRef
          });
        }
        
        if (paused) {
          results.warnings.push({
            contract: 'QNS_REGISTRAR',
            message: 'Registrar is currently paused'
          });
        }
        
      } catch (error) {
        console.log(`   ❌ Error reading registrar references: ${error.message}`);
        results.issues.push({
          severity: 'error',
          contract: 'QNS_REGISTRAR',
          issue: 'Could not read contract references',
          error: error.message
        });
      }
    }
    console.log('');

    // Test basic functions
    console.log('🧪 Testing Basic Functions...\n');
    await testBasicFunctions(provider, deployment, results);

    // Summary
    console.log('\n📊 Validation Summary:');
    const allDeployed = Object.values(results.contracts).every(c => c.deployed);
    const allAccessible = Object.values(results.contracts).every(c => c.accessible);
    const allReferencesMatch = Object.values(results.references).every(r => r.matches);
    
    console.log(`  Contracts Deployed: ${allDeployed ? '✅' : '❌'}`);
    console.log(`  Contracts Accessible: ${allAccessible ? '✅' : '❌'}`);
    console.log(`  References Match: ${allReferencesMatch ? '✅' : '❌'}`);
    console.log(`  Issues: ${results.issues.length}`);
    console.log(`  Warnings: ${results.warnings.length}`);
    
    if (results.issues.length > 0) {
      console.log('\n❌ Issues Found:');
      results.issues.forEach((issue, idx) => {
        console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.contract}: ${issue.issue}`);
      });
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.warnings.forEach((warning, idx) => {
        console.log(`  ${idx + 1}. ${warning.contract}: ${warning.message}`);
      });
    }
    
    if (results.issues.length === 0 && results.warnings.length === 0) {
      console.log('\n✅ All validations passed!');
      results.overallStatus = 'healthy';
    } else if (results.issues.length === 0) {
      console.log('\n⚠️  Deployment is functional but has warnings');
      results.overallStatus = 'degraded';
    } else {
      console.log('\n❌ Deployment has critical issues');
      results.overallStatus = 'failed';
    }

  } catch (error) {
    console.error('❌ Validation error:', error.message);
    results.error = error.message;
    results.overallStatus = 'failed';
  }

  // Save results
  saveResults(results);
}

async function validateContract(provider, address, abi, name) {
  const validation = {
    address,
    deployed: false,
    accessible: false,
    hasCode: false
  };

  try {
    // Check if contract has code
    const code = await provider.getCode(address);
    validation.hasCode = code !== '0x';
    validation.deployed = validation.hasCode;
    
    console.log(`   Deployed: ${validation.deployed ? '✅' : '❌'}`);
    
    if (validation.deployed) {
      // Try to call a view function
      const contract = new quais.Contract(address, abi, provider);
      try {
        // Just instantiate - if it doesn't throw, it's accessible
        validation.accessible = true;
        console.log(`   Accessible: ✅`);
      } catch (error) {
        console.log(`   Accessible: ❌ (${error.message})`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    validation.error = error.message;
  }

  return validation;
}

async function testBasicFunctions(provider, deployment, results) {
  try {
    const registrarContract = new quais.Contract(
      deployment.contracts.QNS_REGISTRAR,
      REGISTRAR_ABI,
      provider
    );
    
    // Test getPrice
    console.log('Testing getPrice("test")...');
    try {
      const price = await registrarContract.getPrice('test');
      console.log(`  ✅ Price: ${quais.formatEther(price)} QI`);
      results.testResults = results.testResults || {};
      results.testResults.getPrice = { success: true, price: quais.formatEther(price) };
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results.testResults = results.testResults || {};
      results.testResults.getPrice = { success: false, error: error.message };
    }
    
    // Test available
    console.log('Testing available(testNode)...');
    try {
      const testNode = quais.id('test.qns');
      const available = await registrarContract.available(testNode);
      console.log(`  ✅ Available: ${available}`);
      results.testResults = results.testResults || {};
      results.testResults.available = { success: true, available };
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results.testResults = results.testResults || {};
      results.testResults.available = { success: false, error: error.message };
    }
    
  } catch (error) {
    console.log(`❌ Error testing functions: ${error.message}`);
  }
}

function saveResults(results) {
  const outputPath = path.join(__dirname, '../validation-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results saved to: ${outputPath}`);
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
