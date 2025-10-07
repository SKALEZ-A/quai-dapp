const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

const QNS_NFT_ADDRESS = '0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2'
const QNS_REGISTRY_ADDRESS = '0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61'

async function main() {
  const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
  const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
  const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
  
  const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
  const QNSRegistryJson = require('../artifacts/contracts/QNSRegistry.sol/QNSRegistry.json')
  
  const QNSNFT = new quais.Contract(QNS_NFT_ADDRESS, QNSNFTJson.abi, provider)
  const Registry = new quais.Contract(QNS_REGISTRY_ADDRESS, QNSRegistryJson.abi, provider)
  
  const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
  
  console.log('\n🔍 Checking DEFAULT_ADMIN_ROLE...')
  console.log('Your wallet:', wallet.address)
  
  const hasDefaultAdminOnNFT = await QNSNFT.hasRole(DEFAULT_ADMIN_ROLE, wallet.address)
  const hasDefaultAdminOnRegistry = await Registry.hasRole(DEFAULT_ADMIN_ROLE, wallet.address)
  
  console.log('\nQNSNFT:')
  console.log(`  Has DEFAULT_ADMIN_ROLE: ${hasDefaultAdminOnNFT}`)
  
  console.log('\nQNSRegistry:')
  console.log(`  Has DEFAULT_ADMIN_ROLE: ${hasDefaultAdminOnRegistry}`)
  
  if (hasDefaultAdminOnNFT && hasDefaultAdminOnRegistry) {
    console.log('\n✅ You can grant roles!')
  } else {
    console.log('\n❌ You need DEFAULT_ADMIN_ROLE to grant permissions')
    console.log('   Ask the contract deployer to grant you this role\n')
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
