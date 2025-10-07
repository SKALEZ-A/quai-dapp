const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

const REGISTRAR_ADDRESS = '0x007fdc29b7a2C598D16Bcea8E52D7C350C0856de'
const QNS_NFT_ADDRESS = '0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2'
const QNS_REGISTRY_ADDRESS = '0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61'

async function main() {
  const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
  const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
  
  const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
  const QNSRegistryJson = require('../artifacts/contracts/QNSRegistry.sol/QNSRegistry.json')
  
  const QNSNFT = new quais.Contract(QNS_NFT_ADDRESS, QNSNFTJson.abi, provider)
  const Registry = new quais.Contract(QNS_REGISTRY_ADDRESS, QNSRegistryJson.abi, provider)
  
  const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
  const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))
  
  console.log('\nRegistrar Roles:')
  console.log(`  MINTER_ROLE on NFT: ${await QNSNFT.hasRole(MINTER_ROLE, REGISTRAR_ADDRESS)}`)
  console.log(`  ADMIN_ROLE on Registry: ${await Registry.hasRole(ADMIN_ROLE, REGISTRAR_ADDRESS)}\n`)
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
