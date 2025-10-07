/**
 * QNS SIMPLE CONTRACTS FRESH DEPLOYMENT
 * Deploy all QNS Simple contracts with proper permissions
 * 
 * This script:
 * 1. Deploys all Simple contracts in correct order
 * 2. Grants all necessary roles properly
 * 3. Verifies role assignments
 * 4. Tests basic functionality
 */

const hre = require('hardhat')
const quais = require('quais')
const { deployMetadata } = require('hardhat')
require('dotenv').config()

// Load contract artifacts for Simple contracts
const QNSRegistrySimpleJson = require('../artifacts/contracts/QNSRegistrySimple.sol/QNSRegistrySimple.json')
const QNSNFTSimpleJson = require('../artifacts/contracts/QNSNFTSimple.sol/QNSNFTSimple.json')
const QNSReservedNamesSimpleJson = require('../artifacts/contracts/QNSReservedNamesSimple.sol/QNSReservedNamesSimple.json')
const QNSRegistrarSimpleJson = require('../artifacts/contracts/QNSRegistrarSimple.sol/QNSRegistrarSimple.json')

// Role constants
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('🚀 QNS SIMPLE CONTRACTS FRESH DEPLOYMENT')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Setup provider and wallet
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    const admin = process.env.ADMIN_ADDRESS || wallet.address
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Deployer: ${wallet.address}`)
    console.log(`👑 Admin: ${admin}`)
    
    // Check balance
    const balance = await provider.getBalance(wallet.address)
    console.log(`💰 Balance: ${quais.formatQuai(balance)} QUAI\n`)
    
    if (balance === 0n) {
      throw new Error('❌ Insufficient balance! Please fund your wallet.')
    }

    const deployedContracts = {}

    // ========================================
    // STEP 1: Deploy QNSRegistrySimple
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('📦 [1/4] Deploying QNSRegistrySimple...')
    console.log('═══════════════════════════════════════════════════════')
    
    const registryIpfs = await deployMetadata.pushMetadataToIPFS('QNSRegistrySimple')
    console.log(`📌 IPFS: ${registryIpfs}`)
    
    const RegistryFactory = new quais.ContractFactory(
      QNSRegistrySimpleJson.abi,
      QNSRegistrySimpleJson.bytecode,
      wallet,
      registryIpfs
    )
    
    const registry = await RegistryFactory.deploy(admin)
    console.log(`✅ Tx: ${registry.deploymentTransaction().hash}`)
    console.log('⏳ Waiting for confirmation...')
    
    await registry.deploymentTransaction().wait()
    await registry.waitForDeployment()
    
    deployedContracts.QNS_REGISTRY = await registry.getAddress()
    console.log(`✅ QNSRegistrySimple deployed: ${deployedContracts.QNS_REGISTRY}\n`)

    // ========================================
    // STEP 2: Deploy QNSNFTSimple
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('📦 [2/4] Deploying QNSNFTSimple...')
    console.log('═══════════════════════════════════════════════════════')
    
    const nftIpfs = await deployMetadata.pushMetadataToIPFS('QNSNFTSimple')
    console.log(`📌 IPFS: ${nftIpfs}`)
    
    const NFTFactory = new quais.ContractFactory(
      QNSNFTSimpleJson.abi,
      QNSNFTSimpleJson.bytecode,
      wallet,
      nftIpfs
    )
    
    const nft = await NFTFactory.deploy(admin, 'Quai Name Service', 'QNS')
    console.log(`✅ Tx: ${nft.deploymentTransaction().hash}`)
    console.log('⏳ Waiting for confirmation...')
    
    await nft.deploymentTransaction().wait()
    await nft.waitForDeployment()
    
    deployedContracts.QNS_NFT = await nft.getAddress()
    console.log(`✅ QNSNFTSimple deployed: ${deployedContracts.QNS_NFT}\n`)

    // ========================================
    // STEP 3: Deploy QNSReservedNamesSimple
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('📦 [3/4] Deploying QNSReservedNamesSimple...')
    console.log('═══════════════════════════════════════════════════════')
    
    const reservedIpfs = await deployMetadata.pushMetadataToIPFS('QNSReservedNamesSimple')
    console.log(`📌 IPFS: ${reservedIpfs}`)
    
    const ReservedFactory = new quais.ContractFactory(
      QNSReservedNamesSimpleJson.abi,
      QNSReservedNamesSimpleJson.bytecode,
      wallet,
      reservedIpfs
    )
    
    const reserved = await ReservedFactory.deploy(admin)
    console.log(`✅ Tx: ${reserved.deploymentTransaction().hash}`)
    console.log('⏳ Waiting for confirmation...')
    
    await reserved.deploymentTransaction().wait()
    await reserved.waitForDeployment()
    
    deployedContracts.QNS_RESERVED_NAMES = await reserved.getAddress()
    console.log(`✅ QNSReservedNamesSimple deployed: ${deployedContracts.QNS_RESERVED_NAMES}\n`)

    // ========================================
    // STEP 4: Deploy QNSRegistrarSimple
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('📦 [4/4] Deploying QNSRegistrarSimple...')
    console.log('═══════════════════════════════════════════════════════')
    
    const registrarIpfs = await deployMetadata.pushMetadataToIPFS('QNSRegistrarSimple')
    console.log(`📌 IPFS: ${registrarIpfs}`)
    
    const RegistrarFactory = new quais.ContractFactory(
      QNSRegistrarSimpleJson.abi,
      QNSRegistrarSimpleJson.bytecode,
      wallet,
      registrarIpfs
    )
    
    const registrar = await RegistrarFactory.deploy(
      deployedContracts.QNS_NFT,
      deployedContracts.QNS_REGISTRY,
      deployedContracts.QNS_RESERVED_NAMES,
      admin // treasury address
    )
    console.log(`✅ Tx: ${registrar.deploymentTransaction().hash}`)
    console.log('⏳ Waiting for confirmation...')
    
    await registrar.deploymentTransaction().wait()
    await registrar.waitForDeployment()
    
    deployedContracts.QNS_REGISTRAR = await registrar.getAddress()
    console.log(`✅ QNSRegistrarSimple deployed: ${deployedContracts.QNS_REGISTRAR}\n`)

    // ========================================
    // STEP 5: Grant Roles
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('🔐 GRANTING ROLES')
    console.log('═══════════════════════════════════════════════════════\n')
    
    console.log('1. Granting MINTER_ROLE to Registrar on NFT...')
    const grantMinterTx = await nft.grantRole(MINTER_ROLE, deployedContracts.QNS_REGISTRAR)
    await grantMinterTx.wait()
    console.log('   ✅ MINTER_ROLE granted!')
    
    console.log('2. Granting ADMIN_ROLE to Registrar on Registry...')
    const grantAdminTx = await registry.grantRole(ADMIN_ROLE, deployedContracts.QNS_REGISTRAR)
    await grantAdminTx.wait()
    console.log('   ✅ ADMIN_ROLE granted!\n')

    // ========================================
    // STEP 6: Verify Roles
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('✅ VERIFYING ROLES')
    console.log('═══════════════════════════════════════════════════════\n')
    
    const hasMinterRole = await nft.hasRole(MINTER_ROLE, deployedContracts.QNS_REGISTRAR)
    const hasAdminRole = await registry.hasRole(ADMIN_ROLE, deployedContracts.QNS_REGISTRAR)
    const hasDefaultAdmin = await registry.hasRole(DEFAULT_ADMIN_ROLE, admin)
    
    console.log(`Registrar has MINTER_ROLE on NFT: ${hasMinterRole ? '✅' : '❌'}`)
    console.log(`Registrar has ADMIN_ROLE on Registry: ${hasAdminRole ? '✅' : '❌'}`)
    console.log(`Admin has DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin ? '✅' : '❌'}\n`)
    
    if (!hasMinterRole || !hasAdminRole) {
      throw new Error('❌ Role verification failed!')
    }

    // ========================================
    // STEP 7: Test Basic Functionality
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('🧪 TESTING BASIC FUNCTIONALITY')
    console.log('═══════════════════════════════════════════════════════\n')
    
    console.log('Testing domain availability check...')
    const testDomain = 'testdomain'
    const testNode = quais.keccak256(quais.toUtf8Bytes(testDomain))
    
    try {
      const isAvailable = await registrar.available(testNode)
      console.log(`✅ Domain '${testDomain}' available: ${isAvailable}`)
      
      const price = await registrar.getPrice(testDomain)
      console.log(`✅ Price for '${testDomain}': ${quais.formatEther(price)} QUAI`)
      
    } catch (error) {
      console.log(`⚠️  Basic functionality test failed: ${error.message}`)
    }

    // ========================================
    // SUCCESS SUMMARY
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('🎉 DEPLOYMENT SUCCESSFUL!')
    console.log('═══════════════════════════════════════════════════════\n')
    
    console.log('📋 DEPLOYED CONTRACTS:\n')
    console.log(`QNS Registry:       ${deployedContracts.QNS_REGISTRY}`)
    console.log(`QNS NFT:            ${deployedContracts.QNS_NFT}`)
    console.log(`QNS Reserved Names: ${deployedContracts.QNS_RESERVED_NAMES}`)
    console.log(`QNS Registrar:      ${deployedContracts.QNS_REGISTRAR}`)
    
    console.log('\n📝 NEXT STEPS:\n')
    console.log('1. Update apps/web/.env.local with these addresses:')
    console.log(`   NEXT_PUBLIC_QNS_REGISTRY=${deployedContracts.QNS_REGISTRY}`)
    console.log(`   NEXT_PUBLIC_QNS_NFT=${deployedContracts.QNS_NFT}`)
    console.log(`   NEXT_PUBLIC_QNS_REGISTRAR=${deployedContracts.QNS_REGISTRAR}`)
    console.log(`   NEXT_PUBLIC_QNS_RESERVED_NAMES=${deployedContracts.QNS_RESERVED_NAMES}`)
    
    console.log('\n2. Update apps/web/src/lib/contracts.ts with these addresses')
    
    console.log('\n3. Test domain registration:')
    console.log('   - Start frontend: cd apps/web && pnpm run dev')
    console.log('   - Visit: http://localhost:3000/qns/profile')
    console.log('   - Register a test domain')
    
    console.log('\n═══════════════════════════════════════════════════════\n')
    
    // Save addresses to file
    const fs = require('fs')
    const addressesFile = './deployed-addresses.json'
    fs.writeFileSync(addressesFile, JSON.stringify({
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      deployer: wallet.address,
      admin: admin,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts
    }, null, 2))
    
    console.log(`💾 Addresses saved to: ${addressesFile}\n`)
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED')
    console.error('═══════════════════════════════════════════════════════')
    console.error(`Error: ${error.message}`)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    console.error('═══════════════════════════════════════════════════════\n')
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })