#!/usr/bin/env node

import { quais } from 'quais';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function main() {
  log('\n🚀 QNS Quick Validation\n', 'cyan');
  
  // Load config
  const deployed = JSON.parse(fs.readFileSync(path.join(__dirname, 'deployed-addresses-simple.json'), 'utf8'));
  const config = {
    rpc: 'https://orchard.rpc.quai.network', // Base URL only - usePathing will add /cyprus1
    registrar: deployed.contracts.QNS_REGISTRAR,
    nft: deployed.contracts.QNS_NFT,
    registry: deployed.contracts.QNS_REGISTRY,
    reserved: deployed.contracts.QNS_RESERVED_NAMES
  };
  
  log('Configuration:', 'cyan');
  console.log(`  Registrar: ${config.registrar}`);
  console.log(`  NFT: ${config.nft}`);
  console.log(`  Registry: ${config.registry}`);
  console.log(`  Reserved: ${config.reserved}\n`);
  
  const provider = new quais.JsonRpcProvider(config.rpc, undefined, { usePathing: true });
  
  // Test 1: Contract Code
  log('Test 1: Contract Deployment', 'cyan');
  try {
    const code = await provider.getCode(config.registrar);
    log(code && code !== '0x' ? '✓ Registrar deployed' : '✗ Registrar not found', code && code !== '0x' ? 'green' : 'red');
  } catch (e) {
    log('✗ Error checking registrar: ' + e.message, 'red');
  }
  
  // Test 2: Load ABIs
  log('\nTest 2: ABI Files', 'cyan');
  try {
    const registrarMeta = JSON.parse(fs.readFileSync(path.join(__dirname, 'metadata/QNSRegistrarSimple_metadata.json'), 'utf8'));
    const nftMeta = JSON.parse(fs.readFileSync(path.join(__dirname, 'metadata/QNSNFTSimple_metadata.json'), 'utf8'));
    log('✓ ABI files loaded', 'green');
    
    // Test 3: Contract Interaction
    log('\nTest 3: Contract Interaction', 'cyan');
    const registrar = new quais.Contract(config.registrar, registrarMeta.output.abi, provider);
    const nft = new quais.Contract(config.nft, nftMeta.output.abi, provider);
    
    // Check availability
    const testDomain = 'test' + Date.now();
    const available = await registrar.available(testDomain);
    log(`✓ Domain "${testDomain}" is ${available ? 'available' : 'taken'}`, 'green');
    
    // Check price
    const price = await registrar.getPrice(testDomain);
    log(`✓ Price: ${quais.formatQuai(price)} QI`, 'green');
    
    // Check permissions
    log('\nTest 4: Permissions', 'cyan');
    const MINTER_ROLE = await nft.MINTER_ROLE();
    const hasMinterRole = await nft.hasRole(MINTER_ROLE, config.registrar);
    log(hasMinterRole ? '✓ Registrar has MINTER_ROLE' : '✗ Registrar missing MINTER_ROLE', hasMinterRole ? 'green' : 'red');
    
    // Check references
    const nftRef = await registrar.nftContract();
    const registryRef = await registrar.registryContract();
    log(nftRef.toLowerCase() === config.nft.toLowerCase() ? '✓ NFT reference correct' : '✗ NFT reference wrong', 
      nftRef.toLowerCase() === config.nft.toLowerCase() ? 'green' : 'red');
    log(registryRef.toLowerCase() === config.registry.toLowerCase() ? '✓ Registry reference correct' : '✗ Registry reference wrong',
      registryRef.toLowerCase() === config.registry.toLowerCase() ? 'green' : 'red');
    
  } catch (e) {
    log('✗ Error: ' + e.message, 'red');
  }
  
  // Test 5: Frontend Files
  log('\nTest 5: Frontend Implementation', 'cyan');
  const files = [
    '../../apps/web/src/lib/errorHandler.ts',
    '../../apps/web/src/lib/transactionManager.ts',
    '../../apps/web/src/lib/qns.ts'
  ];
  
  for (const file of files) {
    const exists = fs.existsSync(path.join(__dirname, file));
    const name = path.basename(file);
    log(exists ? `✓ ${name} exists` : `✗ ${name} missing`, exists ? 'green' : 'red');
  }
  
  log('\n✅ Validation complete!\n', 'green');
}

main().catch(e => {
  log('\n❌ Validation failed: ' + e.message, 'red');
  console.error(e);
  process.exit(1);
});
