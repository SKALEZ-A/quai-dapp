const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

const REGISTRAR_ADDRESS = '0x007fdc29b7a2C598D16Bcea8E52D7C350C0856de'
const QNS_NFT_ADDRESS = '0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2'

async function main() {
  const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
  const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
  const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
  
  const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
  const QNSNFT = new quais.Contract(QNS_NFT_ADDRESS, QNSNFTJson.abi, wallet)
  const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))
  
  console.log('\nTesting grantRole call...')
  console.log(`Granting MINTER_ROLE to ${REGISTRAR_ADDRESS}`)
  
  try {
    // Try to estimate gas first
    const gasEst = await QNSNFT.grantRole.estimateGas(MINTER_ROLE, REGISTRAR_ADDRESS)
    console.log('Gas estimate succeeded:', gasEst.toString())
  } catch (e) {
    console.log('Gas estimate FAILED:')
    console.log('Error:', e.shortMessage || e.message)
    
    // Try to get more details
    if (e.data) {
      console.log('Error data:', e.data)
    }
  }
  
  // Check if registrar already has the role
  const already = await QNSNFT.hasRole(MINTER_ROLE, REGISTRAR_ADDRESS)
  console.log('\nRegistrar already has MINTER_ROLE:', already)
  
  // If it already has the role, we're done!
  if (already) {
    console.log('\n✅ Registrar already has MINTER_ROLE! Skipping...')
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
