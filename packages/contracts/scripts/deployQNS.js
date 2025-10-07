const hre = require('hardhat')
const quais = require('quais')
const { deployMetadata } = require('hardhat')
require('dotenv').config()

// Import all contract artifacts
const QNSRegistryJson = require('../artifacts/contracts/QNSRegistry.sol/QNSRegistry.json')
const QNSControllerJson = require('../artifacts/contracts/QNSController.sol/QNSController.json')
const QNSAuctionManagerJson = require('../artifacts/contracts/QNSAuctionManager.sol/QNSAuctionManager.json')
const QNSReservedNamesJson = require('../artifacts/contracts/QNSReservedNames.sol/QNSReservedNames.json')
const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
const QiPaymentResolverJson = require('../artifacts/contracts/QiPaymentResolver.sol/QiPaymentResolver.json')
const ReverseRegistrarJson = require('../artifacts/contracts/ReverseRegistrar.sol/ReverseRegistrar.json')
const SocialPostsJson = require('../artifacts/contracts/SocialPosts.sol/SocialPosts.json')

// Deployment configuration
const DEPLOYMENT_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000,
  TX_TIMEOUT: 120000,
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

async function deployContract(name, contractFactory, args = [], attempt = 1) {
  try {
    console.log(`\n🚀 Deploying ${name} (attempt ${attempt}/${DEPLOYMENT_CONFIG.MAX_RETRIES})`)
    console.log(`📝 Args: ${JSON.stringify(args)}`)
    
    console.log('📤 Broadcasting deployment transaction...')
    const contract = await contractFactory.deploy(...args)
    
    const txHash = contract.deploymentTransaction().hash
    console.log(`✅ Transaction broadcasted: ${txHash}`)
    console.log(`⏳ Waiting for deployment confirmation...`)
    
    await waitForTransactionWithTimeout(contract.deploymentTransaction())
    await contract.waitForDeployment()
    
    const contractAddress = await contract.getAddress()
    console.log(`✅ ${name} deployed to: ${contractAddress}`)
    
    return contract
  } catch (error) {
    console.error(`❌ ${name} deployment attempt ${attempt} failed:`, error.message)
    
    if (attempt < DEPLOYMENT_CONFIG.MAX_RETRIES) {
      console.log(`⏳ Retrying in ${DEPLOYMENT_CONFIG.RETRY_DELAY / 1000} seconds...`)
      await sleep(DEPLOYMENT_CONFIG.RETRY_DELAY)
      return deployContract(name, contractFactory, args, attempt + 1)
    }
    
    throw error
  }
}

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════')
    console.log('🌐 QUAI NETWORK - QNS SYSTEM TESTNET DEPLOYMENT')
    console.log('═══════════════════════════════════════════════════\n')
    
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
      throw new Error('Insufficient balance. Please fund your wallet with testnet QUAI tokens from https://faucet.quai.network/')
    }
    
    // Get admin address (use deployer if not set)
    const admin = process.env.ADMIN_ADDRESS || wallet.address
    console.log(`👑 Admin Address: ${admin}`)
    
    const deployedContracts = {}
    
    // 1. Deploy QNS Registry (UUPS Proxy)
    console.log('\n\n📦 [1/8] Deploying QNS Registry...')
    const registryIpfsHash = await deployMetadata.pushMetadataToIPFS('QNSRegistry')
    console.log(`📌 Registry Metadata IPFS: ${registryIpfsHash}`)
    const QNSRegistry = new quais.ContractFactory(
      QNSRegistryJson.abi,
      QNSRegistryJson.bytecode,
      wallet,
      registryIpfsHash
    )
    // Note: For simplicity, we're deploying without UUPS proxy in this script
    // In production, you'd want to use upgradeable proxy pattern
    const registry = await deployContract('QNSRegistry', QNSRegistry, [])
    await registry.initialize(admin)
    deployedContracts.registry = await registry.getAddress()
    
    // 2. Deploy QNS Controller
    console.log('\n\n📦 [2/8] Deploying QNS Controller...')
    const controllerIpfsHash = await deployMetadata.pushMetadataToIPFS('QNSController')
    console.log(`📌 Controller Metadata IPFS: ${controllerIpfsHash}`)
    const QNSController = new quais.ContractFactory(
      QNSControllerJson.abi,
      QNSControllerJson.bytecode,
      wallet,
      controllerIpfsHash
    )
    const controller = await deployContract('QNSController', QNSController, [])
    deployedContracts.controller = await controller.getAddress()
    
    // 3. Deploy Auction Manager
    console.log('\n\n📦 [3/8] Deploying QNS Auction Manager...')
    const auctionIpfsHash = await deployMetadata.pushMetadataToIPFS('QNSAuctionManager')
    console.log(`📌 Auction Manager Metadata IPFS: ${auctionIpfsHash}`)
    const QNSAuctionManager = new quais.ContractFactory(
      QNSAuctionManagerJson.abi,
      QNSAuctionManagerJson.bytecode,
      wallet,
      auctionIpfsHash
    )
    const auctionManager = await deployContract('QNSAuctionManager', QNSAuctionManager, [])
    await auctionManager.initialize(admin)
    deployedContracts.auctionManager = await auctionManager.getAddress()
    
    // 4. Deploy Reserved Names
    console.log('\n\n📦 [4/8] Deploying QNS Reserved Names...')
    const reservedIpfsHash = await deployMetadata.pushMetadataToIPFS('QNSReservedNames')
    console.log(`📌 Reserved Names Metadata IPFS: ${reservedIpfsHash}`)
    const QNSReservedNames = new quais.ContractFactory(
      QNSReservedNamesJson.abi,
      QNSReservedNamesJson.bytecode,
      wallet,
      reservedIpfsHash
    )
    const reservedNames = await deployContract('QNSReservedNames', QNSReservedNames, [])
    await reservedNames.initialize(admin)
    deployedContracts.reservedNames = await reservedNames.getAddress()
    
    // 5. Deploy QNS NFT
    console.log('\n\n📦 [5/8] Deploying QNS NFT...')
    const nftIpfsHash = await deployMetadata.pushMetadataToIPFS('QNSNFT')
    console.log(`📌 NFT Metadata IPFS: ${nftIpfsHash}`)
    const QNSNFT = new quais.ContractFactory(
      QNSNFTJson.abi,
      QNSNFTJson.bytecode,
      wallet,
      nftIpfsHash
    )
    const qnsNft = await deployContract('QNSNFT', QNSNFT, [])
    await qnsNft.initialize(admin, "Quai Name Service", "QNS")
    deployedContracts.qnsNft = await qnsNft.getAddress()
    
    // 6. Deploy Payment Resolver
    console.log('\n\n📦 [6/8] Deploying Qi Payment Resolver...')
    const paymentIpfsHash = await deployMetadata.pushMetadataToIPFS('QiPaymentResolver')
    console.log(`📌 Payment Resolver Metadata IPFS: ${paymentIpfsHash}`)
    const QiPaymentResolver = new quais.ContractFactory(
      QiPaymentResolverJson.abi,
      QiPaymentResolverJson.bytecode,
      wallet,
      paymentIpfsHash
    )
    const paymentResolver = await deployContract('QiPaymentResolver', QiPaymentResolver, [])
    await paymentResolver.initialize(admin)
    deployedContracts.paymentResolver = await paymentResolver.getAddress()
    
    // 7. Deploy Reverse Registrar
    console.log('\n\n📦 [7/8] Deploying Reverse Registrar...')
    const reverseIpfsHash = await deployMetadata.pushMetadataToIPFS('ReverseRegistrar')
    console.log(`📌 Reverse Registrar Metadata IPFS: ${reverseIpfsHash}`)
    const ReverseRegistrar = new quais.ContractFactory(
      ReverseRegistrarJson.abi,
      ReverseRegistrarJson.bytecode,
      wallet,
      reverseIpfsHash
    )
    const reverseRegistrar = await deployContract('ReverseRegistrar', ReverseRegistrar, [])
    await reverseRegistrar.initialize(admin)
    deployedContracts.reverseRegistrar = await reverseRegistrar.getAddress()
    
    // 8. Deploy Social Posts
    console.log('\n\n📦 [8/8] Deploying Social Posts...')
    const socialIpfsHash = await deployMetadata.pushMetadataToIPFS('SocialPosts')
    console.log(`📌 Social Posts Metadata IPFS: ${socialIpfsHash}`)
    const SocialPosts = new quais.ContractFactory(
      SocialPostsJson.abi,
      SocialPostsJson.bytecode,
      wallet,
      socialIpfsHash
    )
    const social = await deployContract('SocialPosts', SocialPosts, [])
    deployedContracts.social = await social.getAddress()
    
    // Summary
    console.log('\n\n═══════════════════════════════════════════════════')
    console.log('🎉 DEPLOYMENT COMPLETE!')
    console.log('═══════════════════════════════════════════════════')
    console.log('\n📋 Deployed Contract Addresses:')
    console.log('─────────────────────────────────────────────────')
    console.log(`QNS_REGISTRY_ADDRESS=${deployedContracts.registry}`)
    console.log(`QNS_CONTROLLER_ADDRESS=${deployedContracts.controller}`)
    console.log(`AUCTION_MANAGER_ADDRESS=${deployedContracts.auctionManager}`)
    console.log(`RESERVED_NAMES_ADDRESS=${deployedContracts.reservedNames}`)
    console.log(`QNS_NFT_ADDRESS=${deployedContracts.qnsNft}`)
    console.log(`PAYMENT_RESOLVER_ADDRESS=${deployedContracts.paymentResolver}`)
    console.log(`REVERSE_REGISTRAR_ADDRESS=${deployedContracts.reverseRegistrar}`)
    console.log(`SOCIAL_CONTRACT_ADDRESS=${deployedContracts.social}`)
    console.log('─────────────────────────────────────────────────')
    console.log(`\n🌐 Network: ${hre.network.name}`)
    console.log(`⛓️  Chain ID: ${hre.network.config.chainId}`)
    console.log(`👤 Deployer: ${wallet.address}`)
    console.log(`👑 Admin: ${admin}`)
    console.log('\n🔗 View on QuaiScan:')
    console.log(`   https://quaiscan.io/address/${deployedContracts.registry}`)
    console.log('\n💡 Next Steps:')
    console.log('   1. Copy the addresses above to your .env files')
    console.log('   2. Update apps/web/.env with these contract addresses')
    console.log('   3. Update apps/api/.env with these contract addresses')
    console.log('   4. Restart your frontend and API services')
    console.log('═══════════════════════════════════════════════════\n')
    
    return deployedContracts
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED')
    console.error('═══════════════════════════════════════════════════')
    console.error(`Error: ${error.message}`)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    console.error('═══════════════════════════════════════════════════\n')
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

