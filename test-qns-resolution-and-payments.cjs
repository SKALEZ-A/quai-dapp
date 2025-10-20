#!/usr/bin/env node

/**
 * Test QNS Domain Resolution and Payment Functionality
 * This script tests the core functionality for sending funds to QNS domain names
 */

const { JsonRpcProvider, Contract, Wallet, keccak256, toUtf8Bytes } = require('quais');
const fs = require('fs');
const path = require('path');

// Load contract addresses from deployment
function loadContractAddresses() {
  try {
    const deployedPath = path.join(__dirname, 'packages/contracts/deployed-addresses-simple.json');
    const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));
    
    return {
      QNS_REGISTRY: deployed.contracts.QNS_REGISTRY,
      QNS_NFT: deployed.contracts.QNS_NFT,
      QNS_REGISTRAR: deployed.contracts.QNS_REGISTRAR,
      QNS_RESERVED_NAMES: deployed.contracts.QNS_RESERVED_NAMES,
    };
  } catch (error) {
    console.error('Error loading contract addresses:', error.message);
    process.exit(1);
  }
}

// Contract ABIs
const REGISTRY_ABI = [
  "function ownerOf(bytes32 node) external view returns (address)",
  "function resolverOf(bytes32 node) external view returns (address)",
];

const RESOLVER_ABI = [
  "function resolveNode(bytes32 node) external view returns (string memory qiCode, address primaryAddress, string[] memory supportedChains, bool active)",
  "function resolveQiCode(string calldata qiCode) external view returns (bytes32 node, address primaryAddress, string[] memory supportedChains, bool active)",
];

// Helper functions
function nameToNode(name) {
  const label = name.toLowerCase();
  return keccak256(toUtf8Bytes(label));
}

async function resolveDomainToAddress(domainName, provider, contracts) {
  console.log(`\n🔍 Resolving domain: "${domainName}"`);
  
  try {
    const registryContract = new Contract(contracts.QNS_REGISTRY, REGISTRY_ABI, provider);
    const node = nameToNode(domainName);
    
    console.log(`   Node hash: ${node}`);
    
    // Check if domain exists and get owner
    let owner;
    try {
      owner = await registryContract.ownerOf(node);
      console.log(`   Owner: ${owner}`);
      
      if (!owner || owner === '0x0000000000000000000000000000000000000000') {
        return {
          success: false,
          error: `Domain "${domainName}" is not registered or has no owner`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Domain "${domainName}" not found or not registered`
      };
    }
    
    // Try to get resolver
    let resolverAddress;
    try {
      resolverAddress = await registryContract.resolverOf(node);
      console.log(`   Resolver: ${resolverAddress}`);
    } catch (error) {
      console.log('   No resolver set, using owner address as fallback');
      return {
        success: true,
        address: owner,
        method: 'owner'
      };
    }
    
    // If we have a payment resolver, try to use it
    if (resolverAddress && resolverAddress !== '0x0000000000000000000000000000000000000000') {
      try {
        const resolverContract = new Contract(resolverAddress, RESOLVER_ABI, provider);
        const result = await resolverContract.resolveNode(node);
        const [qiCode, primaryAddress, , active] = result;
        
        if (active && primaryAddress && primaryAddress !== '0x0000000000000000000000000000000000000000') {
          console.log(`   Payment address: ${primaryAddress}`);
          console.log(`   Qi Code: ${qiCode}`);
          return {
            success: true,
            address: primaryAddress,
            qiCode,
            active,
            method: 'resolver'
          };
        }
      } catch (resolverError) {
        console.log('   Resolver failed, falling back to owner');
      }
    }
    
    // Fallback to owner
    return {
      success: true,
      address: owner,
      method: 'owner_fallback'
    };
    
  } catch (error) {
    console.error('   Error resolving domain:', error.message);
    return {
      success: false,
      error: `Failed to resolve domain: ${error.message}`
    };
  }
}

async function testSendFunds(domainName, amount, signer, provider, contracts) {
  console.log(`\n💰 Testing send funds to "${domainName}"`);
  
  try {
    // First resolve the domain
    const resolution = await resolveDomainToAddress(domainName, provider, contracts);
    
    if (!resolution.success) {
      console.log(`   ❌ Resolution failed: ${resolution.error}`);
      return { success: false, error: resolution.error };
    }
    
    console.log(`   ✅ Resolved to: ${resolution.address}`);
    console.log(`   Method: ${resolution.method}`);
    
    // Check sender balance first
    const senderAddress = await signer.getAddress();
    const balance = await provider.getBalance(senderAddress);
    console.log(`   Sender balance: ${(Number(balance) / 1e18).toFixed(4)} QI`);
    
    const amountWei = BigInt(parseFloat(amount) * 1e18);
    
    if (balance < amountWei) {
      console.log(`   ❌ Insufficient balance. Need ${amount} QI but have ${(Number(balance) / 1e18).toFixed(4)} QI`);
      return { success: false, error: 'Insufficient balance' };
    }
    
    // Estimate gas first
    try {
      const gasEstimate = await provider.estimateGas({
        to: resolution.address,
        value: amountWei,
        from: senderAddress
      });
      console.log(`   Gas estimate: ${gasEstimate.toString()}`);
    } catch (gasError) {
      console.log(`   ⚠️  Gas estimation failed: ${gasError.message}`);
    }
    
    console.log(`   🚀 Sending ${amount} QI to ${resolution.address}...`);
    
    // Send the transaction
    const tx = await signer.sendTransaction({
      to: resolution.address,
      value: amountWei
    });
    
    console.log(`   📝 Transaction hash: ${tx.hash}`);
    console.log(`   ⏳ Waiting for confirmation...`);
    
    const receipt = await tx.wait();
    console.log(`   ✅ Transaction confirmed in block ${receipt.blockNumber}`);
    
    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      resolvedAddress: resolution.address
    };
    
  } catch (error) {
    console.log(`   ❌ Send failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🧪 QNS Resolution and Payment Test\n');
  
  // Check for required environment variables
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY environment variable is required');
    console.log('   Set PRIVATE_KEY=your_private_key_here');
    process.exit(1);
  }
  
  const contracts = loadContractAddresses();
  console.log('📋 Contract addresses:');
  Object.entries(contracts).forEach(([name, address]) => {
    console.log(`   ${name}: ${address}`);
  });
  
  // Setup provider and wallet
  const RPC_URL = 'https://orchard.rpc.quai.network';
  const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
  const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log(`\n🔗 Connected to: ${RPC_URL}`);
  console.log(`👤 Wallet address: ${wallet.address}`);
  
  // Get network info
  try {
    const network = await provider.getNetwork();
    console.log(`🌐 Network chain ID: ${network.chainId}`);
  } catch (error) {
    console.log(`⚠️  Could not get network info: ${error.message}`);
  }
  
  // Test balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Wallet balance: ${(Number(balance) / 1e18).toFixed(4)} QI`);
  
  if (balance === 0n) {
    console.log('\n⚠️  Wallet has zero balance. Please get testnet QI from:');
    console.log('   https://faucet.quai.network/');
    return;
  }
  
  // Get domain name from command line argument or use default
  const domainName = process.argv[2] || 'testdomain'; // User can provide domain as argument
  const amount = process.argv[3] || '0.001'; // Default to very small amount for testing
  
  console.log(`\n🎯 Testing with domain: "${domainName}"`);
  console.log(`💸 Amount to send: ${amount} QI`);
  
  // Test 1: Domain Resolution
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Domain Resolution');
  console.log('='.repeat(60));
  
  const resolution = await resolveDomainToAddress(domainName, provider, contracts);
  
  if (resolution.success) {
    console.log(`\n✅ Domain resolution successful!`);
    console.log(`   Domain: ${domainName}`);
    console.log(`   Address: ${resolution.address}`);
    console.log(`   Method: ${resolution.method}`);
    if (resolution.qiCode) {
      console.log(`   Qi Code: ${resolution.qiCode}`);
    }
    if (resolution.active !== undefined) {
      console.log(`   Active: ${resolution.active}`);
    }
  } else {
    console.log(`\n❌ Domain resolution failed: ${resolution.error}`);
    console.log('\n💡 This could be because:');
    console.log('   - The domain is not registered');
    console.log('   - The domain has no owner');
    console.log('   - There\'s a network connectivity issue');
    
    if (balance > 0n) {
      console.log('\n🔄 Trying to continue with other tests anyway...');
    } else {
      return;
    }
  }
  
  // Test 2: Send Funds (only if resolution worked and we have balance)
  if (resolution.success && balance > 0n) {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Send Funds to Domain');
    console.log('='.repeat(60));
    
    const sendResult = await testSendFunds(domainName, amount, wallet, provider, contracts);
    
    if (sendResult.success) {
      console.log(`\n🎉 Fund sending successful!`);
      console.log(`   Transaction: ${sendResult.txHash}`);
      console.log(`   Block: ${sendResult.blockNumber}`);
      console.log(`   Sent to: ${sendResult.resolvedAddress}`);
    } else {
      console.log(`\n❌ Fund sending failed: ${sendResult.error}`);
    }
  } else {
    console.log('\n⏭️  Skipping fund sending test (resolution failed or no balance)');
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`   Domain resolution: ${resolution.success ? '✅ PASS' : '❌ FAIL'}`);
  if (resolution.success && balance > 0n) {
    // We would show send test results here if we ran it
    console.log(`   Fund sending: See test results above`);
  } else {
    console.log(`   Fund sending: ⏭️  SKIPPED`);
  }
  
  console.log('\n💡 To test with your own domain:');
  console.log(`   node test-qns-resolution-and-payments.cjs "yourdomain" 0.001`);
}

// Handle command line usage
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node test-qns-resolution-and-payments.cjs [domain] [amount]

Arguments:
  domain    QNS domain name to test (default: "testdomain")
  amount    Amount in QI to send (default: 0.001)

Environment:
  PRIVATE_KEY   Required. Your wallet private key for testing

Examples:
  node test-qns-resolution-and-payments.cjs
  node test-qns-resolution-and-payments.cjs "mydomain" 0.01
  PRIVATE_KEY=0x... node test-qns-resolution-and-payments.cjs "yourdomain" 0.001
`);
  process.exit(0);
}

main().catch(error => {
  console.error('\n💥 Test execution failed:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
});
