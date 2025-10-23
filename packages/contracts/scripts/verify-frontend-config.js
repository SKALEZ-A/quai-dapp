/**
 * Frontend Configuration Verification Script
 * Compares deployed contract addresses with frontend configuration
 */

const fs = require('fs');
const path = require('path');

// Load deployment addresses
const deploymentPath = path.join(__dirname, '../deployed-addresses-simple.json');
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// Load frontend contracts config
const frontendContractsPath = path.join(__dirname, '../../web/src/lib/contracts.ts');
let frontendConfig = null;

try {
  const frontendContractsContent = fs.readFileSync(frontendContractsPath, 'utf8');
  
  // Extract addresses from the TypeScript file
  const registrarMatch = frontendContractsContent.match(/QNS_REGISTRAR_ADDRESS\s*=\s*['"]([^'"]+)['"]/);
  const nftMatch = frontendContractsContent.match(/QNS_NFT_ADDRESS\s*=\s*['"]([^'"]+)['"]/);
  const registryMatch = frontendContractsContent.match(/QNS_REGISTRY_ADDRESS\s*=\s*['"]([^'"]+)['"]/);
  const reservedNamesMatch = frontendContractsContent.match(/QNS_RESERVED_NAMES_ADDRESS\s*=\s*['"]([^'"]+)['"]/);
  
  frontendConfig = {
    QNS_REGISTRAR: registrarMatch ? registrarMatch[1] : null,
    QNS_NFT: nftMatch ? nftMatch[1] : null,
    QNS_REGISTRY: registryMatch ? registryMatch[1] : null,
    QNS_RESERVED_NAMES: reservedNamesMatch ? reservedNamesMatch[1] : null
  };
} catch (error) {
  console.error('⚠️  Could not read frontend contracts config:', error.message);
}

// Load environment file
const envPath = path.join(__dirname, '../../web/.env');
let envConfig = null;

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const registrarMatch = envContent.match(/NEXT_PUBLIC_QNS_REGISTRAR_ADDRESS\s*=\s*(.+)/);
  const nftMatch = envContent.match(/NEXT_PUBLIC_QNS_NFT_ADDRESS\s*=\s*(.+)/);
  const registryMatch = envContent.match(/NEXT_PUBLIC_QNS_REGISTRY_ADDRESS\s*=\s*(.+)/);
  const reservedNamesMatch = envContent.match(/NEXT_PUBLIC_QNS_RESERVED_NAMES_ADDRESS\s*=\s*(.+)/);
  
  envConfig = {
    QNS_REGISTRAR: registrarMatch ? registrarMatch[1].trim() : null,
    QNS_NFT: nftMatch ? nftMatch[1].trim() : null,
    QNS_REGISTRY: registryMatch ? registryMatch[1].trim() : null,
    QNS_RESERVED_NAMES: reservedNamesMatch ? reservedNamesMatch[1].trim() : null
  };
} catch (error) {
  console.error('⚠️  Could not read .env file:', error.message);
}

function main() {
  console.log('🔍 Frontend Configuration Verification\n');
  console.log('Deployment Info:');
  console.log(`  Network: ${deployment.network}`);
  console.log(`  Chain ID: ${deployment.chainId}`);
  console.log(`  Timestamp: ${deployment.timestamp}\n`);

  const results = {
    timestamp: new Date().toISOString(),
    deployment: deployment.contracts,
    frontend: frontendConfig,
    env: envConfig,
    mismatches: [],
    recommendations: []
  };

  // Compare addresses
  console.log('📋 Comparing Contract Addresses:\n');

  const contracts = ['QNS_REGISTRAR', 'QNS_NFT', 'QNS_REGISTRY', 'QNS_RESERVED_NAMES'];

  contracts.forEach(contractName => {
    const deployedAddress = deployment.contracts[contractName];
    const frontendAddress = frontendConfig ? frontendConfig[contractName] : null;
    const envAddress = envConfig ? envConfig[contractName] : null;

    console.log(`${contractName}:`);
    console.log(`  Deployed:  ${deployedAddress}`);
    console.log(`  Frontend:  ${frontendAddress || 'NOT FOUND'}`);
    console.log(`  Env:       ${envAddress || 'NOT FOUND'}`);

    const frontendMatches = frontendAddress && 
      frontendAddress.toLowerCase() === deployedAddress.toLowerCase();
    const envMatches = envAddress && 
      envAddress.toLowerCase() === deployedAddress.toLowerCase();

    console.log(`  Frontend Match: ${frontendMatches ? '✅' : '❌'}`);
    console.log(`  Env Match: ${envMatches ? '✅' : '❌'}`);
    console.log('');

    if (!frontendMatches) {
      results.mismatches.push({
        contract: contractName,
        location: 'frontend',
        expected: deployedAddress,
        actual: frontendAddress
      });
    }

    if (!envMatches) {
      results.mismatches.push({
        contract: contractName,
        location: 'env',
        expected: deployedAddress,
        actual: envAddress
      });
    }
  });

  // Summary
  console.log('📊 Summary:');
  console.log(`  Total Mismatches: ${results.mismatches.length}`);

  if (results.mismatches.length === 0) {
    console.log('  ✅ All addresses match!\n');
  } else {
    console.log('  ❌ Mismatches found:\n');
    results.mismatches.forEach((mismatch, idx) => {
      console.log(`  ${idx + 1}. ${mismatch.contract} in ${mismatch.location}`);
      console.log(`     Expected: ${mismatch.expected}`);
      console.log(`     Actual:   ${mismatch.actual || 'NOT SET'}`);
    });
    console.log('');

    // Generate recommendations
    console.log('💡 Recommendations:\n');

    if (results.mismatches.some(m => m.location === 'env')) {
      console.log('1. Update .env file with correct addresses:');
      console.log('   Run: node scripts/update-env-addresses.js\n');
      results.recommendations.push('Update .env file with deployed addresses');
    }

    if (results.mismatches.some(m => m.location === 'frontend')) {
      console.log('2. Update frontend contracts.ts with correct addresses:');
      console.log('   Edit: apps/web/src/lib/contracts.ts\n');
      results.recommendations.push('Update contracts.ts with deployed addresses');
    }

    console.log('3. After updating, restart the development server');
    results.recommendations.push('Restart development server');
  }

  // Save results
  saveResults(results);

  // Generate update script if needed
  if (results.mismatches.length > 0) {
    generateUpdateScript(deployment.contracts);
  }
}

function saveResults(results) {
  const outputPath = path.join(__dirname, '../frontend-config-verification.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`📄 Results saved to: ${outputPath}\n`);
}

function generateUpdateScript(contracts) {
  const envUpdateScript = `#!/bin/bash
# Auto-generated script to update .env with deployed addresses

ENV_FILE="apps/web/.env"

echo "Updating $ENV_FILE with deployed contract addresses..."

# Backup existing .env
cp $ENV_FILE $ENV_FILE.backup

# Update addresses
sed -i '' 's|NEXT_PUBLIC_QNS_REGISTRAR_ADDRESS=.*|NEXT_PUBLIC_QNS_REGISTRAR_ADDRESS=${contracts.QNS_REGISTRAR}|' $ENV_FILE
sed -i '' 's|NEXT_PUBLIC_QNS_NFT_ADDRESS=.*|NEXT_PUBLIC_QNS_NFT_ADDRESS=${contracts.QNS_NFT}|' $ENV_FILE
sed -i '' 's|NEXT_PUBLIC_QNS_REGISTRY_ADDRESS=.*|NEXT_PUBLIC_QNS_REGISTRY_ADDRESS=${contracts.QNS_REGISTRY}|' $ENV_FILE
sed -i '' 's|NEXT_PUBLIC_QNS_RESERVED_NAMES_ADDRESS=.*|NEXT_PUBLIC_QNS_RESERVED_NAMES_ADDRESS=${contracts.QNS_RESERVED_NAMES}|' $ENV_FILE

echo "✅ Addresses updated!"
echo "Backup saved to $ENV_FILE.backup"
`;

  const scriptPath = path.join(__dirname, '../update-env-addresses.sh');
  fs.writeFileSync(scriptPath, envUpdateScript);
  fs.chmodSync(scriptPath, '755');
  console.log(`📝 Update script generated: ${scriptPath}`);
  console.log('   Run: cd packages/contracts && ./update-env-addresses.sh\n');
}

// Run the script
main();
