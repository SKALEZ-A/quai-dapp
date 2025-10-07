/**
 * Grant necessary roles to the deployed QNSRegistrarSimple
 */

const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

// Deployed addresses
const REGISTRAR_ADDRESS = '0x007fdc29b7a2C598D16Bcea8E52D7C350C0856de'
const QNS_NFT_ADDRESS = '0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2'
const QNS_REGISTRY_ADDRESS = '0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61'

async function main() {
  try {
    console.log('\n═══════════════════════════════════════')
    console.log('🔐 GRANTING ROLES TO REGISTRAR')
    console.log('═══════════════════════════════════════\n')
    
    // Setup
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    
    console.log(`💼 Admin Wallet: ${wallet.address}`)
    console.log(`🎯 Registrar: ${REGISTRAR_ADDRESS}\n`)
    
    // Load ABIs
    const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
    const QNSRegistryJson = require('../artifacts/contracts/QNSRegistry.sol/QNSRegistry.json')
    
    // Grant MINTER_ROLE on NFT
    console.log('1️⃣  Granting MINTER_ROLE on NFT...')
    const QNSNFT = new quais.Contract(QNS_NFT_ADDRESS, QNSNFTJson.abi, wallet)
    const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))
    
    const tx1 = await QNSNFT.grantRole(MINTER_ROLE, REGISTRAR_ADDRESS)
    console.log(`   Tx: ${tx1.hash}`)
    await tx1.wait()
    console.log('   ✅ MINTER_ROLE granted!\n')
    
    // Grant ADMIN_ROLE on Registry
    console.log('2️⃣  Granting ADMIN_ROLE on Registry...')
    const Registry = new quais.Contract(QNS_REGISTRY_ADDRESS, QNSRegistryJson.abi, wallet)
    const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
    
    const tx2 = await Registry.grantRole(ADMIN_ROLE, REGISTRAR_ADDRESS)
    console.log(`   Tx: ${tx2.hash}`)
    await tx2.wait()
    console.log('   ✅ ADMIN_ROLE granted!\n')
    
    // Success!
    console.log('═══════════════════════════════════════')
    console.log('✅ ROLES GRANTED SUCCESSFULLY!')
    console.log('═══════════════════════════════════════\n')
    console.log('📋 Add to apps/web/.env.local:\n')
    console.log(`NEXT_PUBLIC_QNS_REGISTRAR=${REGISTRAR_ADDRESS}`)
    console.log('\n🎉 Ready to register domains!')
    console.log('═══════════════════════════════════════\n')
    
  } catch (error) {
    console.error('\n❌ FAILED')
    console.error('═══════════════════════════════════════')
    console.error(`Error: ${error.message}`)
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
