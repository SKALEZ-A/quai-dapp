const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

const REGISTRAR_ADDRESS = '0x007fdc29b7a2C598D16Bcea8E52D7C350C0856de'
const QNS_NFT_ADDRESS = '0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2'
const QNS_REGISTRY_ADDRESS = '0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61'

async function main() {
  const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
  const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
  const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
  
  const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
  const QNSRegistryJson = require('../artifacts/contracts/QNSRegistry.sol/QNSRegistry.json')
  
  const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))
  const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
  
  console.log('\n🔐 Granting roles...\n')
  
  try {
    const QNSNFT = new quais.Contract(QNS_NFT_ADDRESS, QNSNFTJson.abi, wallet)
    console.log('1. Granting MINTER_ROLE...')
    const tx1 = await QNSNFT.grantRole(MINTER_ROLE, REGISTRAR_ADDRESS, {
      gasLimit: 200000
    })
    console.log(`   Tx: ${tx1.hash}`)
    await tx1.wait()
    console.log('   ✅ Done!\n')
  } catch (e) {
    console.log('   ⚠️  Error:', e.message, '\n')
  }
  
  try {
    const Registry = new quais.Contract(QNS_REGISTRY_ADDRESS, QNSRegistryJson.abi, wallet)
    console.log('2. Granting ADMIN_ROLE...')
    const tx2 = await Registry.grantRole(ADMIN_ROLE, REGISTRAR_ADDRESS, {
      gasLimit: 200000
    })
    console.log(`   Tx: ${tx2.hash}`)
    await tx2.wait()
    console.log('   ✅ Done!\n')
  } catch (e) {
    console.log('   ⚠️  Error:', e.message, '\n')
  }
  
  console.log('✅ Complete!\n')
  console.log(`Add to .env.local:\nNEXT_PUBLIC_QNS_REGISTRAR=${REGISTRAR_ADDRESS}\n`)
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
