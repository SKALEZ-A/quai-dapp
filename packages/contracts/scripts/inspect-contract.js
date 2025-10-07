const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

const QNS_NFT_ADDRESS = '0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2'

async function main() {
  const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
  const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
  
  console.log('\nGetting contract code...')
  const code = await provider.getCode(QNS_NFT_ADDRESS)
  console.log('Contract exists:', code !== '0x')
  console.log('Code length:', code.length, 'bytes')
  
  // Try to call grantRole to see if it exists
  const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
  const QNSNFT = new quais.Contract(QNS_NFT_ADDRESS, QNSNFTJson.abi, provider)
  
  try {
    const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
    const hasRole = await QNSNFT.hasRole(ADMIN_ROLE, '0x003DAC94805c77d7fD485cd415F8078414d171e4')
    console.log('hasRole callable:', true)
    console.log('Has admin role:', hasRole)
  } catch (e) {
    console.log('hasRole error:', e.message)
  }
  
  console.log('\nAvailable functions in ABI:', 
    QNSNFTJson.abi.filter(x => x.type === 'function').map(x => x.name).slice(0, 20).join(', ')
  )
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
