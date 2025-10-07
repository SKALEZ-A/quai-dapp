/**
 * CHECK ADMIN ROLES
 * Check who has DEFAULT_ADMIN_ROLE on deployed contracts
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
    console.log('🔍 CHECKING ADMIN ROLES')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Setup provider and wallet
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    const admin = process.env.ADMIN_ADDRESS || wallet.address
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Your wallet: ${wallet.address}`)
    console.log(`👑 Admin address: ${admin}\n`)
    
    const { QNS_NFT, QNS_REGISTRY, QNS_REGISTRAR } = deployedAddresses.contracts
    
    console.log(`📋 Contract Addresses:`)
    console.log(`   NFT: ${QNS_NFT}`)
    console.log(`   Registry: ${QNS_REGISTRY}`)
    console.log(`   Registrar: ${QNS_REGISTRAR}\n`)
    
    // Connect to contracts
    const nft = new quais.Contract(QNS_NFT, QNSNFTJson.abi, wallet)
    const registry = new quais.Contract(QNS_REGISTRY, QNSRegistryJson.abi, wallet)
    
    // Check all roles for your wallet
    console.log('═══════════════════════════════════════════════════════')
    console.log(`Roles for YOUR WALLET: ${wallet.address}`)
    console.log('═══════════════════════════════════════════════════════\n')
    
    const walletHasDefaultAdminNFT = await nft.hasRole(DEFAULT_ADMIN_ROLE, wallet.address)
    const walletHasDefaultAdminRegistry = await registry.hasRole(DEFAULT_ADMIN_ROLE, wallet.address)
    const walletHasAdminRoleNFT = await nft.hasRole(ADMIN_ROLE, wallet.address)
    const walletHasAdminRoleRegistry = await registry.hasRole(ADMIN_ROLE, wallet.address)
    const walletHasMinterRoleNFT = await nft.hasRole(MINTER_ROLE, wallet.address)
    
    console.log('NFT Contract:')
    console.log(`   DEFAULT_ADMIN_ROLE: ${walletHasDefaultAdminNFT ? '✅ YES' : '❌ NO'}`)
    console.log(`   ADMIN_ROLE: ${walletHasAdminRoleNFT ? '✅ YES' : '❌ NO'}`)
    console.log(`   MINTER_ROLE: ${walletHasMinterRoleNFT ? '✅ YES' : '❌ NO'}\n`)
    
    console.log('Registry Contract:')
    console.log(`   DEFAULT_ADMIN_ROLE: ${walletHasDefaultAdminRegistry ? '✅ YES' : '❌ NO'}`)
    console.log(`   ADMIN_ROLE: ${walletHasAdminRoleRegistry ? '✅ YES' : '❌ NO'}\n`)
    
    // Check roles for registrar
    console.log('═══════════════════════════════════════════════════════')
    console.log(`Roles for REGISTRAR: ${QNS_REGISTRAR}`)
    console.log('═══════════════════════════════════════════════════════\n')
    
    const registrarHasMinterRoleNFT = await nft.hasRole(MINTER_ROLE, QNS_REGISTRAR)
    const registrarHasAdminRoleRegistry = await registry.hasRole(ADMIN_ROLE, QNS_REGISTRAR)
    
    console.log('NFT Contract:')
    console.log(`   MINTER_ROLE: ${registrarHasMinterRoleNFT ? '✅ YES' : '❌ NO'}\n`)
    
    console.log('Registry Contract:')
    console.log(`   ADMIN_ROLE: ${registrarHasAdminRoleRegistry ? '✅ YES' : '❌ NO'}\n`)
    
    // Get role admin for MINTER_ROLE and ADMIN_ROLE
    console.log('═══════════════════════════════════════════════════════')
    console.log('Role Hierarchy:')
    console.log('═══════════════════════════════════════════════════════\n')
    
    const minterRoleAdmin = await nft.getRoleAdmin(MINTER_ROLE)
    const adminRoleAdminNFT = await nft.getRoleAdmin(ADMIN_ROLE)
    const adminRoleAdminRegistry = await registry.getRoleAdmin(ADMIN_ROLE)
    
    console.log('NFT Contract:')
    console.log(`   MINTER_ROLE is controlled by: ${minterRoleAdmin}`)
    console.log(`   ADMIN_ROLE is controlled by: ${adminRoleAdminNFT}\n`)
    
    console.log('Registry Contract:')
    console.log(`   ADMIN_ROLE is controlled by: ${adminRoleAdminRegistry}\n`)
    
    console.log('Note: Role 0x0000...0000 is DEFAULT_ADMIN_ROLE\n')
    
    // Summary
    console.log('═══════════════════════════════════════════════════════')
    console.log('📊 SUMMARY')
    console.log('═══════════════════════════════════════════════════════\n')
    
    if (walletHasDefaultAdminNFT && walletHasDefaultAdminRegistry) {
      console.log('✅ You have DEFAULT_ADMIN_ROLE on both contracts')
      console.log('✅ You can grant roles to the registrar!')
      
      if (!registrarHasMinterRoleNFT || !registrarHasAdminRoleRegistry) {
        console.log('\n⚠️  But roles are NOT granted to registrar yet')
        console.log('   Run: npx hardhat run scripts/grant-roles-fresh.js --network cyprus1_testnet')
      } else {
        console.log('\n✅ All roles are properly granted!')
        console.log('🎉 Your QNS system is ready to use!')
      }
    } else {
      console.log('❌ You do NOT have DEFAULT_ADMIN_ROLE')
      console.log('\n💡 Solutions:')
      console.log('   1. The deployer needs to grant you DEFAULT_ADMIN_ROLE')
      console.log('   2. OR redeploy all contracts with your wallet as admin')
    }
    
    console.log('\n═══════════════════════════════════════════════════════\n')
    
  } catch (error) {
    console.error('\n❌ CHECK FAILED')
    console.error('═══════════════════════════════════════════════════════')
    console.error(`Error: ${error.message}`)
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
