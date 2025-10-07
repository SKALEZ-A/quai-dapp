/**
 * DEPLOY ALL QNS CONTRACTS (SIMPLE/NON-UPGRADEABLE)
 * Clean deployment with proper DEFAULT_ADMIN_ROLE setup
 * 
 * This script deploys non-upgradeable versions that:
 * - Properly grant DEFAULT_ADMIN_ROLE in constructor
 * - No initialization needed
 * - Simpler, more secure for production
 */

const hre = require('hardhat')
const quais = require('quais')
const { deployMetadata } = require('hardhat')
require('dotenv').config()

// Role constants
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('🚀 QNS SIMPLE DEPLOYMENT - QUAI TESTNET')
    console.log('   (Non-Upgradeable - Production Ready)')
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

    // Compile first
    console.log('📦 Compiling contracts...')
    await hre.run('compile')
    console.log('✅ Compilation complete!\n')

    // Load contract artifacts
    const QNSRegistrySimpleJson = require('../artifacts/contracts/QNSRegistrySimple.sol/QNSRegistrySimple.json')
    const QNSNFTSimpleJson = require('../artifacts/contracts/QNSNFTSimple.sol/QNSNFTSimple.json')
    const QNSReservedNamesSimpleJson = require('../artifacts/contracts/QNSReservedNamesSimple.sol/QNSReservedNamesSimple.json')
    const QNSRegistrarSimpleJson = require('../artifacts/contracts/QNSRegistrarSimple.sol/QNSRegistrarSimple.json')

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
    
    console.log('🚀 Broadcasting deployment...')
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
    
    console.log('🚀 Broadcasting deployment...')
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
    
    console.log('🚀 Broadcasting deployment...')
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
    
    console.log('🚀 Broadcasting deployment...')
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
    // STEP 5: Verify Admin Has DEFAULT_ADMIN_ROLE
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('🔍 VERIFYING DEFAULT_ADMIN_ROLE')
    console.log('═══════════════════════════════════════════════════════\n')
    
    const hasDefaultAdminNFT = await nft.hasRole(DEFAULT_ADMIN_ROLE, admin)
    const hasDefaultAdminRegistry = await registry.hasRole(DEFAULT_ADMIN_ROLE, admin)
    
    console.log(`Admin has DEFAULT_ADMIN_ROLE on NFT: ${hasDefaultAdminNFT ? '✅' : '❌'}`)
    console.log(`Admin has DEFAULT_ADMIN_ROLE on Registry: ${hasDefaultAdminRegistry ? '✅' : '❌'}\n`)
    
    if (!hasDefaultAdminNFT || !hasDefaultAdminRegistry) {
      throw new Error('❌ Admin does not have DEFAULT_ADMIN_ROLE!')
    }

    // ========================================
    // STEP 6: Grant Roles to Registrar
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('🔐 GRANTING ROLES TO REGISTRAR')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Connect as admin if different from deployer
    let adminSigner = wallet
    if (admin.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('⚠️  Admin address differs from deployer')
      console.log('   Attempting to use deployer wallet (should have DEFAULT_ADMIN_ROLE)...\n')
    }
    
    const nftAsAdmin = new quais.Contract(deployedContracts.QNS_NFT, QNSNFTSimpleJson.abi, adminSigner)
    const registryAsAdmin = new quais.Contract(deployedContracts.QNS_REGISTRY, QNSRegistrySimpleJson.abi, adminSigner)
    
    console.log('1. Granting MINTER_ROLE to Registrar on NFT...')
    const grantMinterTx = await nftAsAdmin.grantRole(MINTER_ROLE, deployedContracts.QNS_REGISTRAR)
    await grantMinterTx.wait()
    console.log('   ✅ MINTER_ROLE granted!')
    
    console.log('2. Granting ADMIN_ROLE to Registrar on Registry...')
    const grantAdminTx = await registryAsAdmin.grantRole(ADMIN_ROLE, deployedContracts.QNS_REGISTRAR)
    await grantAdminTx.wait()
    console.log('   ✅ ADMIN_ROLE granted!\n')

    // ========================================
    // STEP 7: Final Verification
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('✅ FINAL VERIFICATION')
    console.log('═══════════════════════════════════════════════════════\n')
    
    const hasMinterRole = await nft.hasRole(MINTER_ROLE, deployedContracts.QNS_REGISTRAR)
    const hasAdminRole = await registry.hasRole(ADMIN_ROLE, deployedContracts.QNS_REGISTRAR)
    
    console.log(`Registrar has MINTER_ROLE on NFT: ${hasMinterRole ? '✅' : '❌'}`)
    console.log(`Registrar has ADMIN_ROLE on Registry: ${hasAdminRole ? '✅' : '❌'}\n`)
    
    if (!hasMinterRole || !hasAdminRole) {
      throw new Error('❌ Role verification failed!')
    }

    // ========================================
    // SUCCESS SUMMARY
    // ========================================
    console.log('═══════════════════════════════════════════════════════')
    console.log('🎉 DEPLOYMENT SUCCESSFUL!')
    console.log('═══════════════════════════════════════════════════════\n')
    
    console.log('📋 DEPLOYED CONTRACTS (Simple/Non-Upgradeable):\n')
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
    console.log('   npx hardhat run scripts/test-registration.js --network cyprus1_testnet')
    
    console.log('\n═══════════════════════════════════════════════════════\n')
    
    // Save addresses to file
    const fs = require('fs')
    const addressesFile = './deployed-addresses-simple.json'
    fs.writeFileSync(addressesFile, JSON.stringify({
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      deployer: wallet.address,
      admin: admin,
      timestamp: new Date().toISOString(),
      version: 'simple-non-upgradeable',
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
