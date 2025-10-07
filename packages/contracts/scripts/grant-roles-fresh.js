/**
 * GRANT ROLES SCRIPT
 * Grant necessary roles to the QNS Registrar
 * 
 * Run this after deploying contracts if role grants failed
 */

const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

// Load contract artifacts
const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
const QNSRegistryJson = require('../artifacts/contracts/QNSRegistry.sol/QNSRegistry.json')

// Load deployed addresses
const deployedAddresses = require('../deployed-addresses.json')

// Role constants
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('🔐 GRANTING ROLES TO QNS REGISTRAR')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Setup provider and wallet
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Granter: ${wallet.address}\n`)
    
    const { QNS_NFT, QNS_REGISTRY, QNS_REGISTRAR } = deployedAddresses.contracts
    
    console.log(`📋 Contract Addresses:`)
    console.log(`   NFT: ${QNS_NFT}`)
    console.log(`   Registry: ${QNS_REGISTRY}`)
    console.log(`   Registrar: ${QNS_REGISTRAR}\n`)
    
    // Connect to contracts
    const nft = new quais.Contract(QNS_NFT, QNSNFTJson.abi, wallet)
    const registry = new quais.Contract(QNS_REGISTRY, QNSRegistryJson.abi, wallet)
    
    // Check current roles
    console.log('🔍 Checking current roles...\n')
    
    const hasDefaultAdminNFT = await nft.hasRole(DEFAULT_ADMIN_ROLE, wallet.address)
    const hasDefaultAdminRegistry = await registry.hasRole(DEFAULT_ADMIN_ROLE, wallet.address)
    const hasAdminRoleNFT = await nft.hasRole(ADMIN_ROLE, wallet.address)
    const hasAdminRoleRegistry = await registry.hasRole(ADMIN_ROLE, wallet.address)
    
    console.log(`Your wallet (${wallet.address}):`)
    console.log(`   DEFAULT_ADMIN_ROLE on NFT: ${hasDefaultAdminNFT ? '✅' : '❌'}`)
    console.log(`   DEFAULT_ADMIN_ROLE on Registry: ${hasDefaultAdminRegistry ? '✅' : '❌'}`)
    console.log(`   ADMIN_ROLE on NFT: ${hasAdminRoleNFT ? '✅' : '❌'}`)
    console.log(`   ADMIN_ROLE on Registry: ${hasAdminRoleRegistry ? '✅' : '❌'}\n`)
    
    // Grant DEFAULT_ADMIN_ROLE if needed
    if (!hasDefaultAdminNFT) {
      console.log('⚠️  You do not have DEFAULT_ADMIN_ROLE on NFT')
      console.log('   Checking who has it...')
      
      // Try to grant DEFAULT_ADMIN_ROLE to yourself
      try {
        console.log('   Attempting to grant DEFAULT_ADMIN_ROLE to yourself...')
        const tx = await nft.grantRole(DEFAULT_ADMIN_ROLE, wallet.address)
        await tx.wait()
        console.log('   ✅ DEFAULT_ADMIN_ROLE granted on NFT!')
      } catch (error) {
        console.log('   ❌ Failed to grant DEFAULT_ADMIN_ROLE on NFT')
        console.log(`   Error: ${error.message}\n`)
        console.log('   The original deployer must grant you DEFAULT_ADMIN_ROLE first.')
        console.log('   Or redeploy all contracts with your wallet as admin.\n')
      }
    } else {
      console.log('✅ You already have DEFAULT_ADMIN_ROLE on NFT\n')
    }
    
    if (!hasDefaultAdminRegistry) {
      console.log('⚠️  You do not have DEFAULT_ADMIN_ROLE on Registry')
      console.log('   Checking who has it...')
      
      try {
        console.log('   Attempting to grant DEFAULT_ADMIN_ROLE to yourself...')
        const tx = await registry.grantRole(DEFAULT_ADMIN_ROLE, wallet.address)
        await tx.wait()
        console.log('   ✅ DEFAULT_ADMIN_ROLE granted on Registry!')
      } catch (error) {
        console.log('   ❌ Failed to grant DEFAULT_ADMIN_ROLE on Registry')
        console.log(`   Error: ${error.message}\n`)
        console.log('   The original deployer must grant you DEFAULT_ADMIN_ROLE first.')
        console.log('   Or redeploy all contracts with your wallet as admin.\n')
      }
    } else {
      console.log('✅ You already have DEFAULT_ADMIN_ROLE on Registry\n')
    }
    
    // Recheck after attempting to grant DEFAULT_ADMIN_ROLE
    const hasDefaultAdminNFTNow = await nft.hasRole(DEFAULT_ADMIN_ROLE, wallet.address)
    const hasDefaultAdminRegistryNow = await registry.hasRole(DEFAULT_ADMIN_ROLE, wallet.address)
    
    if (!hasDefaultAdminNFTNow || !hasDefaultAdminRegistryNow) {
      throw new Error('Cannot proceed without DEFAULT_ADMIN_ROLE. Please redeploy contracts or contact original deployer.')
    }
    
    // Now grant roles to registrar
    console.log('═══════════════════════════════════════════════════════')
    console.log('🔐 Granting roles to Registrar...\n')
    
    // Check if registrar already has roles
    const registrarHasMinter = await nft.hasRole(MINTER_ROLE, QNS_REGISTRAR)
    const registrarHasAdmin = await registry.hasRole(ADMIN_ROLE, QNS_REGISTRAR)
    
    if (!registrarHasMinter) {
      console.log('1. Granting MINTER_ROLE to Registrar on NFT...')
      const grantMinterTx = await nft.grantRole(MINTER_ROLE, QNS_REGISTRAR)
      await grantMinterTx.wait()
      console.log('   ✅ MINTER_ROLE granted!')
    } else {
      console.log('1. ✅ Registrar already has MINTER_ROLE on NFT')
    }
    
    if (!registrarHasAdmin) {
      console.log('2. Granting ADMIN_ROLE to Registrar on Registry...')
      const grantAdminTx = await registry.grantRole(ADMIN_ROLE, QNS_REGISTRAR)
      await grantAdminTx.wait()
      console.log('   ✅ ADMIN_ROLE granted!')
    } else {
      console.log('2. ✅ Registrar already has ADMIN_ROLE on Registry')
    }
    
    // Final verification
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('✅ VERIFYING FINAL ROLES')
    console.log('═══════════════════════════════════════════════════════\n')
    
    const finalMinterRole = await nft.hasRole(MINTER_ROLE, QNS_REGISTRAR)
    const finalAdminRole = await registry.hasRole(ADMIN_ROLE, QNS_REGISTRAR)
    
    console.log(`Registrar has MINTER_ROLE on NFT: ${finalMinterRole ? '✅' : '❌'}`)
    console.log(`Registrar has ADMIN_ROLE on Registry: ${finalAdminRole ? '✅' : '❌'}\n`)
    
    if (finalMinterRole && finalAdminRole) {
      console.log('═══════════════════════════════════════════════════════')
      console.log('🎉 SUCCESS! All roles granted!')
      console.log('═══════════════════════════════════════════════════════\n')
      console.log('🚀 You can now register domains!\n')
    } else {
      throw new Error('Role verification failed')
    }
    
  } catch (error) {
    console.error('\n❌ ROLE GRANTING FAILED')
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
