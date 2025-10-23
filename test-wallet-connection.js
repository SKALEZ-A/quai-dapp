#!/usr/bin/env node

/**
 * Test script to verify wallet connection and transaction parameters
 * Run this in the browser console to debug wallet issues
 */

async function testWalletConnection() {
  console.log('🔍 Testing Wallet Connection...\n');

  // Check if ethereum object exists
  const eth = window.ethereum;
  if (!eth) {
    console.error('❌ No ethereum object found. Is Pelagus wallet installed?');
    return;
  }
  console.log('✅ Ethereum object found');

  // Check accounts
  try {
    const accounts = await eth.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      console.error('❌ No accounts found. Wallet may be locked or not connected.');
      return;
    }
    console.log('✅ Accounts found:', accounts);
  } catch (error) {
    console.error('❌ Failed to get accounts:', error);
    return;
  }

  // Check network
  try {
    const chainId = await eth.request({ method: 'eth_chainId' });
    const chainIdDecimal = parseInt(chainId, 16);
    console.log('✅ Chain ID:', chainIdDecimal, `(0x${chainId.slice(2)})`);
    
    const validChainIds = [9000, 9001, 9002, 9100, 9101, 9102, 9200, 9201, 9202];
    if (validChainIds.includes(chainIdDecimal)) {
      console.log('✅ On Quai Testnet (Orchard)');
    } else {
      console.warn('⚠️  Not on expected Quai Testnet chain');
    }
  } catch (error) {
    console.error('❌ Failed to get chain ID:', error);
    return;
  }

  // Check balance
  try {
    const { BrowserProvider } = await import('quais');
    const provider = new BrowserProvider(eth);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const balanceInQI = (Number(balance) / 1e18).toFixed(4);
    
    console.log('✅ Address:', address);
    console.log('✅ Balance:', balanceInQI, 'QI');
    
    if (balance === BigInt(0)) {
      console.warn('⚠️  Zero balance! Get testnet QI from: https://faucet.quai.network/');
    }
  } catch (error) {
    console.error('❌ Failed to get balance:', error);
    return;
  }

  // Test contract connection
  try {
    const { Contract } = await import('quais');
    const { BrowserProvider } = await import('quais');
    
    const provider = new BrowserProvider(eth);
    const signer = await provider.getSigner();
    
    // Use the registrar contract address
    const registrarAddress = '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b';
    const registrarABI = [
      "function register(string calldata name, bytes32 node) external payable returns (uint256)",
      "function getPrice(string calldata name) external view returns (uint256)",
      "function available(bytes32 node) external view returns (bool)"
    ];
    
    const contract = new Contract(registrarAddress, registrarABI, signer);
    
    console.log('✅ Contract created');
    console.log('  - Address:', contract.target);
    console.log('  - Has runner:', !!contract.runner);
    
    if (contract.runner) {
      const runnerAddress = await contract.runner.getAddress();
      console.log('  - Runner address:', runnerAddress);
    }
    
    // Test a read function
    try {
      const testNode = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const isAvailable = await contract.available(testNode);
      console.log('✅ Contract read function works. Test node available:', isAvailable);
    } catch (readError) {
      console.warn('⚠️  Contract read function failed:', readError.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to test contract:', error);
    return;
  }

  console.log('\n✅ All checks passed! Wallet is ready for transactions.');
}

// Run the test
testWalletConnection().catch(console.error);
