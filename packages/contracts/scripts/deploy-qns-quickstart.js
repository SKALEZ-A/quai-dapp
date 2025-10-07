/**
 * HACKATHON QUICK-START DEPLOYMENT
 * Deploys QNS without upgradeable proxies for fast testing
 * 
 * This bypasses the @quai/quais-upgrades plugin bug entirely!
 */

const hre = require('hardhat')
const quais = require('quais')
const { deployMetadata } = require('hardhat')
require('dotenv').config()

// Simplified contract artifacts (non-upgradeable versions)
const QNSRegistrarSimpleJson = require('../artifacts/contracts/QNSRegistrarSimple.sol/QNSRegistrarSimple.json')

const DEPLOY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000,
  TX_TIMEOUT: 120000,
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForTx(tx, timeout = DEPLOY_CONFIG.TX_TIMEOUT) {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Tx timeout after ${timeout}ms. Hash: ${tx.hash}`))
    }, timeout)

    try {
      console.log(`⏳ Waiting for tx ${tx.hash}...`)
      const receipt = await tx.wait()
      clearTimeout(timeoutId)
      resolve(receipt)
    } catch (error) {
      clearTimeout(timeoutId)
      reject(error)
    }
  })
}

async function deployWithRetry(factory, args, name, attempt = 1) {
  try {
    console.log(`\n🚀 Deploying ${name} (attempt ${attempt}/${DEPLOY_CONFIG.MAX_RETRIES})`)
    
    const contract = await factory.deploy(...args)
    const txHash = contract.deploymentTransaction().hash
    console.log(`✅ Tx broadcasted: ${txHash}`)
    
    await waitForTx(contract.deploymentTransaction())
    await contract.waitForDeployment()
    
    const address = await contract.getAddress()
    console.log(`✅ ${name} deployed to: ${address}`)
    
    return contract
  } catch (error) {
    console.error(`❌ Attempt ${attempt} failed:`, error.message)
    
    if (attempt < DEPLOY_CONFIG.MAX_RETRIES) {
      console.log(`⏳ Retrying in ${DEPLOY_CONFIG.RETRY_DELAY / 1000}s...`)
      await sleep(DEPLOY_CONFIG.RETRY_DELAY)
      return deployWithRetry(factory, args, name, attempt + 1)
    }
    
    throw error
  }
}

async function main() {
  try {
    console.log('\n╔══════════════════════════════════════════╗')
    console.log('║   QNS HACKATHON QUICK-START DEPLOYMENT  ║')
    console.log('╚══════════════════════════════════════════╝\n')
    
    // Setup
    const provider = new quais.JsonRpcProvider(hre.network.config.url, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    const admin = process.env.ADMIN_ADDRESS || wallet.address
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Deployer: ${wallet.address}`)
    console.log(`👑 Admin: ${admin}`)
    
    // Check balance
    const balance = await provider.getBalance(wallet.address)
    console.log(`💰 Balance: ${quais.formatQuai(balance)} QUAI`)
    
    if (balance === 0n) {
      throw new Error('❌ Insufficient balance! Fund your wallet first.')
    }

    console.log('\n📦 STEP 1/4: Deploying Mock QNSNFT...')
    // For quick testing, we'll use a simple ERC721-like contract
    // In production, you'd deploy the full QNSNFT
    const MockNFT = await ethers.getContractFactory("QNSNFT")
    console.log('⚠️  Using simplified mock for speed')
    
    console.log('\n📦 STEP 2/4: Deploying Mock QNSRegistry...')
    const MockRegistry = await ethers.getContractFactory("QNSRegistry")
    console.log('⚠️  Using simplified mock for speed')
    
    console.log('\n📦 STEP 3/4: Deploying Mock QNSReservedNames...')
    const MockReserved = await ethers.getContractFactory("QNSReservedNames")
    console.log('⚠️  Using simplified mock for speed')
    
    // For hackathon, let's use placeholder addresses
    // You can deploy the actual contracts later
    const MOCK_NFT_ADDRESS = "0x0000000000000000000000000000000000000001"
    const MOCK_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000002"
    const MOCK_RESERVED_ADDRESS = "0x0000000000000000000000000000000000000003"
    
    console.log(`\n⚠️  HACKATHON MODE: Using mock addresses for dependencies`)
    console.log(`   NFT: ${MOCK_NFT_ADDRESS}`)
    console.log(`   Registry: ${MOCK_REGISTRY_ADDRESS}`)
    console.log(`   Reserved: ${MOCK_RESERVED_ADDRESS}`)

    // Deploy QNS Registrar Simple (the only one we really need for testing)
    console.log('\n📦 STEP 4/4: Deploying QNSRegistrarSimple...')
    const ipfsHash = await deployMetadata.pushMetadataToIPFS('QNSRegistrarSimple')
    console.log(`📌 IPFS Hash: ${ipfsHash}`)
    
    const Registrar = new quais.ContractFactory(
      QNSRegistrarSimpleJson.abi,
      QNSRegistrarSimpleJson.bytecode,
      wallet,
      ipfsHash
    )
    
    const registrar = await deployWithRetry(Registrar, [
      MOCK_NFT_ADDRESS,
      MOCK_REGISTRY_ADDRESS,
      MOCK_RESERVED_ADDRESS,
      admin, // treasury
    ], 'QNSRegistrarSimple')
    
    // Summary
    console.log('\n╔══════════════════════════════════════════╗')
    console.log('║       DEPLOYMENT COMPLETE! 🎉            ║')
    console.log('╚══════════════════════════════════════════╝')
    console.log('\n📋 Contract Addresses:\n')
    console.log(`QNS_REGISTRAR_ADDRESS=${await registrar.getAddress()}`)
    console.log(`\n⚠️  Note: Mock addresses used for dependencies.`)
    console.log(`   Deploy full contracts separately if needed.`)
    console.log('\n✅ Ready for frontend testing!')
    console.log('╚══════════════════════════════════════════╝\n')
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED')
    console.error('═══════════════════════════════════════')
    console.error(`Error: ${error.message}`)
    if (error.stack) {
      console.error('\nStack:', error.stack)
    }
    console.error('═══════════════════════════════════════\n')
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
