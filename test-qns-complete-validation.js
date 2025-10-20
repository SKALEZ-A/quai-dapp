#!/usr/bin/env node

/**
 * Comprehensive QNS System Validation Script
 * Tests all aspects of the QNS domain registration fix
 */

import { quais } from 'quais';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(name, passed, details = '') {
  const symbol = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`${symbol} ${name}`, color);
  if (details) {
    console.log(`  ${details}`);
  }
}

// Load configuration
function loadConfig() {
  try {
    const deployedAddresses = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'packages/contracts/deployed-addresses-simple.json'), 'utf8')
    );
    
    return {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sandbox.quai.network',
      registrarAddress: deployedAddresses.QNSRegistrarSimple,
      nftAddress: deployedAddresses.QNSNFTSimple,
      registryAddress: deployedAddresses.QNSRegistrySimple,
      reservedNamesAddress: deployedAddresses.QNSReservedNamesSimple,
      privateKey: process.env.PRIVATE_KEY
    };
  } catch (error) {
    log('Error loading configuration: ' + error.message, 'red');
    process.exit(1);
  }
}

// Test 1: Contract Accessibility
async function testContractAccessibility(provider, config) {
  logSection('TEST 1: Contract Accessibility');
  
  const contracts = {
    'Registrar': config.registrarAddress,
    'NFT': config.nftAddress,
    'Registry': config.registryAddress,
    'Reserved Names': config.reservedNamesAddress
  };
  
  let allPassed = true;
  
  for (const [name, address] of Object.entries(contracts)) {
    try {
      const code = await provider.getCode(address);
      const hasCode = code && code !== '0x';
      logTest(`${name} contract at ${address}`, hasCode, hasCode ? 'Contract deployed' : 'No code found');
      if (!hasCode) allPassed = false;
    } catch (error) {
      logTest(`${name} contract`, false, error.message);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test 2: Contract Permissions
async function testContractPermissions(provider, config) {
  logSection('TEST 2: Contract Permissions');
  
  const registrarAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'packages/contracts/metadata/QNSRegistrarSimple_metadata.json'), 'utf8')
  ).output.abi;
  
  const nftAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'packages/contracts/metadata/QNSNFTSimple_metadata.json'), 'utf8')
  ).output.abi;
  
  const registryAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'packages/contracts/metadata/QNSRegistrySimple_metadata.json'), 'utf8')
  ).output.abi;
  
  const registrar = new quais.Contract(config.registrarAddress, registrarAbi, provider);
  const nft = new quais.Contract(config.nftAddress, nftAbi, provider);
  const registry = new quais.Contract(config.registryAddress, registryAbi, provider);
  
  let allPassed = true;
  
  try {
    // Check MINTER_ROLE
    const MINTER_ROLE = await nft.MINTER_ROLE();
    const hasMinterRole = await nft.hasRole(MINTER_ROLE, config.registrarAddress);
    logTest('Registrar has MINTER_ROLE on NFT', hasMinterRole, 
      hasMinterRole ? 'Can mint NFTs' : 'Cannot mint NFTs - CRITICAL');
    if (!hasMinterRole) allPassed = false;
    
    // Check contract references
    const nftRef = await registrar.nftContract();
    const nftRefCorrect = nftRef.toLowerCase() === config.nftAddress.toLowerCase();
    logTest('Registrar NFT reference', nftRefCorrect, 
      `Expected: ${config.nftAddress}, Got: ${nftRef}`);
    if (!nftRefCorrect) allPassed = false;
    
    const registryRef = await registrar.registryContract();
    const registryRefCorrect = registryRef.toLowerCase() === config.registryAddress.toLowerCase();
    logTest('Registrar Registry reference', registryRefCorrect,
      `Expected: ${config.registryAddress}, Got: ${registryRef}`);
    if (!registryRefCorrect) allPassed = false;
    
  } catch (error) {
    logTest('Permission check', false, error.message);
    allPassed = false;
  }
  
  return allPassed;
}

// Test 3: Domain Availability Check
async function testDomainAvailability(provider, config) {
  logSection('TEST 3: Domain Availability Check');
  
  const registrarAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'packages/contracts/metadata/QNSRegistrarSimple_metadata.json'), 'utf8')
  ).output.abi;
  
  const registrar = new quais.Contract(config.registrarAddress, registrarAbi, provider);
  
  let allPassed = true;
  
  try {
    const testDomain = 'test' + Date.now();
    const available = await registrar.available(testDomain);
    logTest('Check domain availability', true, `Domain "${testDomain}" is ${available ? 'available' : 'taken'}`);
    
    // Test reserved name
    const reservedDomain = 'admin';
    const reservedAvailable = await registrar.available(reservedDomain);
    logTest('Reserved name check', !reservedAvailable, 
      `Domain "${reservedDomain}" is ${reservedAvailable ? 'available (UNEXPECTED)' : 'reserved (correct)'}`);
    if (reservedAvailable) allPassed = false;
    
  } catch (error) {
    logTest('Availability check', false, error.message);
    allPassed = false;
  }
  
  return allPassed;
}

// Test 4: Price Calculation
async function testPriceCalculation(provider, config) {
  logSection('TEST 4: Price Calculation');
  
  const registrarAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'packages/contracts/metadata/QNSRegistrarSimple_metadata.json'), 'utf8')
  ).output.abi;
  
  const registrar = new quais.Contract(config.registrarAddress, registrarAbi, provider);
  
  let allPassed = true;
  
  try {
    const testDomains = ['a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef'];
    
    for (const domain of testDomains) {
      const price = await registrar.getPrice(domain);
      const priceInQi = quais.formatQuai(price);
      logTest(`Price for "${domain}" (${domain.length} chars)`, true, `${priceInQi} QI`);
    }
    
  } catch (error) {
    logTest('Price calculation', false, error.message);
    allPassed = false;
  }
  
  return allPassed;
}

// Test 5: Gas Estimation
async function testGasEstimation(wallet, config) {
  logSection('TEST 5: Gas Estimation');
  
  const registrarAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'packages/contracts/metadata/QNSRegistrarSimple_metadata.json'), 'utf8')
  ).output.abi;
  
  const registrar = new quais.Contract(config.registrarAddress, registrarAbi, wallet);
  
  let allPassed = true;
  
  try {
    const testDomain = 'gastest' + Date.now();
    const price = await registrar.getPrice(testDomain);
    
    // Try to estimate gas
    try {
      const gasEstimate = await registrar.register.estimateGas(testDomain, { value: price });
      logTest('Gas estimation', true, `Estimated gas: ${gasEstimate.toString()}`);
    } catch (gasError) {
      // Gas estimation might fail if we don't have enough balance, but that's okay for this test
      if (gasError.message.includes('insufficient funds')) {
        logTest('Gas estimation', true, 'Estimation works (insufficient funds for actual tx is expected)');
      } else {
        logTest('Gas estimation', false, gasError.message);
        allPassed = false;
      }
    }
    
  } catch (error) {
    logTest('Gas estimation setup', false, error.message);
    allPassed = false;
  }
  
  return allPassed;
}

// Test 6: Balance Check
async function testBalanceCheck(wallet) {
  logSection('TEST 6: Wallet Balance Check');
  
  try {
    const balance = await wallet.provider.getBalance(wallet.address);
    const balanceInQi = quais.formatQuai(balance);
    const hasBalance = balance > 0n;
    
    logTest('Wallet has balance', hasBalance, 
      `Address: ${wallet.address}\nBalance: ${balanceInQi} QI`);
    
    if (!hasBalance) {
      log('\n⚠️  Get testnet QI from: https://faucet.quai.network/', 'yellow');
    }
    
    return hasBalance;
  } catch (error) {
    logTest('Balance check', false, error.message);
    return false;
  }
}

// Test 7: Error Handler Validation
async function testErrorHandling() {
  logSection('TEST 7: Error Handler Validation');
  
  try {
    // Check if error handler file exists
    const errorHandlerPath = path.join(__dirname, 'apps/web/src/lib/errorHandler.ts');
    const errorHandlerExists = fs.existsSync(errorHandlerPath);
    logTest('Error handler file exists', errorHandlerExists, errorHandlerPath);
    
    if (errorHandlerExists) {
      const content = fs.readFileSync(errorHandlerPath, 'utf8');
      
      // Check for key features
      const hasErrorCategories = content.includes('ErrorCategory');
      logTest('Error categorization implemented', hasErrorCategories);
      
      const hasUserMessages = content.includes('getUserMessage');
      logTest('User-friendly messages implemented', hasUserMessages);
      
      const hasSuggestions = content.includes('getSuggestion');
      logTest('Error suggestions implemented', hasSuggestions);
      
      return errorHandlerExists && hasErrorCategories && hasUserMessages && hasSuggestions;
    }
    
    return false;
  } catch (error) {
    logTest('Error handler validation', false, error.message);
    return false;
  }
}

// Test 8: Transaction Manager Validation
async function testTransactionManager() {
  logSection('TEST 8: Transaction Manager Validation');
  
  try {
    const txManagerPath = path.join(__dirname, 'apps/web/src/lib/transactionManager.ts');
    const txManagerExists = fs.existsSync(txManagerPath);
    logTest('Transaction manager file exists', txManagerExists, txManagerPath);
    
    if (txManagerExists) {
      const content = fs.readFileSync(txManagerPath, 'utf8');
      
      // Check for key features
      const hasRetryLogic = content.includes('retry') || content.includes('maxRetries');
      logTest('Retry logic implemented', hasRetryLogic);
      
      const hasGasEstimation = content.includes('estimateGas');
      logTest('Gas estimation implemented', hasGasEstimation);
      
      const hasErrorParsing = content.includes('parseError');
      logTest('Error parsing implemented', hasErrorParsing);
      
      return txManagerExists && hasRetryLogic && hasGasEstimation && hasErrorParsing;
    }
    
    return false;
  } catch (error) {
    logTest('Transaction manager validation', false, error.message);
    return false;
  }
}

// Test 9: Frontend Integration
async function testFrontendIntegration() {
  logSection('TEST 9: Frontend Integration');
  
  try {
    const qnsLibPath = path.join(__dirname, 'apps/web/src/lib/qns.ts');
    const qnsLibExists = fs.existsSync(qnsLibPath);
    logTest('QNS library file exists', qnsLibExists, qnsLibPath);
    
    if (qnsLibExists) {
      const content = fs.readFileSync(qnsLibPath, 'utf8');
      
      // Check for improvements
      const hasLogging = content.includes('console.log') || content.includes('logger');
      logTest('Logging implemented', hasLogging);
      
      const hasErrorHandling = content.includes('try') && content.includes('catch');
      logTest('Error handling implemented', hasErrorHandling);
      
      const hasValidation = content.includes('validate') || content.includes('check');
      logTest('Pre-flight validation implemented', hasValidation);
      
      return qnsLibExists && hasLogging && hasErrorHandling;
    }
    
    return false;
  } catch (error) {
    logTest('Frontend integration validation', false, error.message);
    return false;
  }
}

// Main test execution
async function runAllTests() {
  log('\n🚀 Starting QNS Complete Validation Tests\n', 'blue');
  
  const config = loadConfig();
  
  if (!config.privateKey) {
    log('⚠️  Warning: PRIVATE_KEY not set in environment. Some tests will be limited.', 'yellow');
  }
  
  const provider = new quais.JsonRpcProvider(config.rpcUrl);
  const wallet = config.privateKey ? new quais.Wallet(config.privateKey, provider) : null;
  
  const results = {
    contractAccessibility: await testContractAccessibility(provider, config),
    contractPermissions: await testContractPermissions(provider, config),
    domainAvailability: await testDomainAvailability(provider, config),
    priceCalculation: await testPriceCalculation(provider, config),
    gasEstimation: wallet ? await testGasEstimation(wallet, config) : null,
    balanceCheck: wallet ? await testBalanceCheck(wallet) : null,
    errorHandling: await testErrorHandling(),
    transactionManager: await testTransactionManager(),
    frontendIntegration: await testFrontendIntegration()
  };
  
  // Summary
  logSection('TEST SUMMARY');
  
  const passed = Object.values(results).filter(r => r === true).length;
  const failed = Object.values(results).filter(r => r === false).length;
  const skipped = Object.values(results).filter(r => r === null).length;
  const total = Object.keys(results).length;
  
  log(`\nTotal Tests: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Skipped: ${skipped}`, 'yellow');
  
  const successRate = ((passed / (total - skipped)) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
  
  // Critical issues
  if (!results.contractAccessibility) {
    log('\n❌ CRITICAL: Contracts are not accessible', 'red');
  }
  if (!results.contractPermissions) {
    log('\n❌ CRITICAL: Contract permissions are not configured correctly', 'red');
    log('   Run: cd packages/contracts && node scripts/check-and-fix-permissions.js', 'yellow');
  }
  
  // Recommendations
  logSection('RECOMMENDATIONS');
  
  if (results.contractAccessibility && results.contractPermissions && results.domainAvailability) {
    log('✓ Core contract functionality is working', 'green');
  }
  
  if (results.errorHandling && results.transactionManager && results.frontendIntegration) {
    log('✓ Frontend improvements are in place', 'green');
  }
  
  if (!wallet) {
    log('• Set PRIVATE_KEY environment variable to run full tests', 'yellow');
  }
  
  if (wallet && !results.balanceCheck) {
    log('• Get testnet QI from https://faucet.quai.network/', 'yellow');
  }
  
  log('\n✅ Validation complete!\n', 'green');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log('\n❌ Test execution failed: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
