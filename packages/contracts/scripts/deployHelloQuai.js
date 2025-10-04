const hre = require('hardhat')
const quais = require('quais')
const HelloQuaiJson = require('../artifacts/contracts/HelloQuai.sol/HelloQuai.json')
const { deployMetadata } = require('hardhat')
require('dotenv').config()

// Deployment configuration with timeouts
const DEPLOYMENT_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  TX_TIMEOUT: 120000, // 120 seconds
}

/**
 * Sleep helper function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Wait for transaction with timeout
 */
async function waitForTransactionWithTimeout(tx, timeout = DEPLOYMENT_CONFIG.TX_TIMEOUT) {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Transaction timeout after ${timeout}ms. TxHash: ${tx.hash}`))
    }, timeout)

    try {
      console.log(`⏳ Waiting for transaction ${tx.hash}...`)
      const receipt = await tx.wait()
      clearTimeout(timeoutId)
      resolve(receipt)
    } catch (error) {
      clearTimeout(timeoutId)
      reject(error)
    }
  })
}

/**
 * Deploy contract with retry logic
 */
async function deployWithRetry(contractFactory, args, attempt = 1) {
  try {
    console.log(`\n🚀 Deployment attempt ${attempt}/${DEPLOYMENT_CONFIG.MAX_RETRIES}`)
    console.log(`📝 Args: ${JSON.stringify(args)}`)
    
    // Deploy contract
    console.log('📤 Broadcasting deployment transaction...')
    const contract = await contractFactory.deploy(...args)
    
    const txHash = contract.deploymentTransaction().hash
    console.log(`✅ Transaction broadcasted: ${txHash}`)
    console.log(`⏳ Waiting for deployment confirmation...`)
    
    // Wait for deployment with timeout
    await waitForTransactionWithTimeout(contract.deploymentTransaction())
    
    // Wait for contract to be deployed
    await contract.waitForDeployment()
    
    const contractAddress = await contract.getAddress()
    console.log(`✅ Contract deployed to: ${contractAddress}`)
    
    return contract
  } catch (error) {
    console.error(`❌ Deployment attempt ${attempt} failed:`, error.message)
    
    if (attempt < DEPLOYMENT_CONFIG.MAX_RETRIES) {
      console.log(`⏳ Retrying in ${DEPLOYMENT_CONFIG.RETRY_DELAY / 1000} seconds...`)
      await sleep(DEPLOYMENT_CONFIG.RETRY_DELAY)
      return deployWithRetry(contractFactory, args, attempt + 1)
    }
    
    throw error
  }
}

/**
 * Verify deployment
 */
async function verifyDeployment(contract) {
  try {
    console.log('\n🔍 Verifying deployment...')
    const address = await contract.getAddress()
    
    // Check if contract exists
    const code = await contract.runner.provider.getCode(address)
    if (code === '0x') {
      throw new Error('Contract code not found at address')
    }
    console.log('✅ Contract code verified')
    
    // Test contract function
    console.log('\n🧪 Testing contract functions...')
    const message = await contract.getMessage()
    console.log(`✅ Message: "${message}"`)
    
    return true
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  }
}

/**
 * Main deployment function
 */
async function main() {
  try {
    console.log('\n═══════════════════════════════════════')
    console.log('🌐 QUAI NETWORK - HELLO QUAI DEPLOYMENT')
    console.log('═══════════════════════════════════════\n')
    
    // Network info
    console.log('📊 Network Configuration:')
    console.log(`   Network: ${hre.network.name}`)
    console.log(`   RPC URL: ${hre.network.config.url}`)
    console.log(`   Chain ID: ${hre.network.config.chainId}`)
    
    // Configure provider and wallet
    const provider = new quais.JsonRpcProvider(hre.network.config.url, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    
    console.log(`\n💼 Deployer Wallet: ${wallet.address}`)
    
    // Check balance
    const balance = await provider.getBalance(wallet.address)
    console.log(`💰 Balance: ${quais.formatQuai(balance)} QUAI`)
    
    if (balance === 0n) {
      throw new Error('Insufficient balance. Please fund your wallet with QUAI tokens.')
    }
    
    // Get greeting from env or use default
    const greeting = process.env.HELLO_GREETING || 'Hello from Quai Network!'
    console.log(`\n📝 Contract Parameters:`)
    console.log(`   Greeting: "${greeting}"`)
    
    // Load contract with metadata
    console.log('\n📦 Loading contract artifact...')
    const ipfsHash = await deployMetadata.pushMetadataToIPFS('HelloQuai')
    console.log(`📌 Metadata IPFS Hash: ${ipfsHash}`)
    const HelloQuai = new quais.ContractFactory(HelloQuaiJson.abi, HelloQuaiJson.bytecode, wallet, ipfsHash)
    
    // Deploy
    console.log('\n🚀 Starting deployment...')
    const contract = await deployWithRetry(HelloQuai, [greeting])
    
    // Verify
    const verified = await verifyDeployment(contract)
    
    // Summary
    console.log('\n═══════════════════════════════════════')
    console.log('📋 DEPLOYMENT SUMMARY')
    console.log('═══════════════════════════════════════')
    console.log(`✅ Status: ${verified ? 'SUCCESS' : 'DEPLOYED (verification failed)'}`)
    console.log(`📍 Contract Address: ${await contract.getAddress()}`)
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`🔗 Explorer: https://quaiscan.io/address/${await contract.getAddress()}`)
    console.log('═══════════════════════════════════════\n')
    
    return contract
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED')
    console.error('═══════════════════════════════════════')
    console.error(`Error: ${error.message}`)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    console.error('═══════════════════════════════════════\n')
    process.exit(1)
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
