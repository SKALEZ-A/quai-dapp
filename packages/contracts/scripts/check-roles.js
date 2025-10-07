/**
 * Check who has admin roles on deployed contracts
 */

const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

const QNS_NFT_ADDRESS = '0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2'
const QNS_REGISTRY_ADDRESS = '0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61'

async function main() {
  try {
    console.log('\n═══════════════════════════════════════')
    console.log('🔍 CHECKING ADMIN ROLES')
    console.log('═══════════════════════════════════════\n')
    
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    
    console.log(`💼 Your Wallet: ${wallet.address}\n`)
    
    // Load ABIs
    const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
    const QNSRegistryJson = require('../artifacts/contracts/QNSRegistry.sol/QNSRegistry.json')
    
    // Check NFT
    console.log('📋 QNSNFT Contract:')
    const QNSNFT = new quais.Contract(QNS_NFT_ADDRESS, QNSNFTJson.abi, provider)
    const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
    const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))
    
    const hasAdminOnNFT = await QNSNFT.hasRole(ADMIN_ROLE, wallet.address)
    const hasMinterOnNFT = await QNSNFT.hasRole(MINTER_ROLE, wallet.address)
    
    console.log(`   Your wallet has ADMIN_ROLE: ${hasAdminOnNFT}`)
    console.log(`   Your wallet has MINTER_ROLE: ${hasMinterOnNFT}\n`)
    
    // Check Registry
    console.log('📋 QNSRegistry Contract:')
    const Registry = new quais.Contract(QNS_REGISTRY_ADDRESS, QNSRegistryJson.abi, provider)
    
    const hasAdminOnRegistry = await Registry.hasRole(ADMIN_ROLE, wallet.address)
    
    console.log(`   Your wallet has ADMIN_ROLE: ${hasAdminOnRegistry}\n`)
    
    console.log('═══════════════════════════════════════\n')
    
    if (!hasAdminOnNFT || !hasAdminOnRegistry) {
      console.log('⚠️  You need ADMIN_ROLE to grant permissions!')
      console.log('   Contact the contract deployer to grant you admin access.')
      console.log('   Or redeploy the contracts with your wallet as admin.\n')
    } else {
      console.log('✅ You have all necessary permissions!')
      console.log('   You can proceed with granting roles.\n')
    }
    
  } catch (error) {
    console.error('\n❌ ERROR')
    console.error(error.message)
    console.error('\n')
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
