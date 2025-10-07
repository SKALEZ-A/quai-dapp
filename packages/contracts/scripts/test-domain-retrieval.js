/**
 * TEST DOMAIN RETRIEVAL
 * Test that we can retrieve domain names from the NFT contract
 */

const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

// Load deployed addresses
const deployedAddresses = require('../deployed-addresses-simple.json')

// Load contract artifacts
const QNSNFTSimpleJson = require('../artifacts/contracts/QNSNFTSimple.sol/QNSNFTSimple.json')

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('🧪 TESTING DOMAIN RETRIEVAL')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Setup provider and wallet
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Your wallet: ${wallet.address}\n`)
    
    const { QNS_NFT } = deployedAddresses.contracts
    
    console.log(`📋 Contract Addresses:`)
    console.log(`   NFT: ${QNS_NFT}\n`)
    
    // Connect to NFT contract
    const nft = new quais.Contract(QNS_NFT, QNSNFTSimpleJson.abi, wallet)
    
    // Get total supply
    console.log('1️⃣ Getting total supply...')
    const totalSupply = await nft.totalSupply()
    console.log(`   Total NFTs minted: ${totalSupply}\n`)
    
    if (totalSupply === 0n) {
      console.log('❌ No domains found. Please register a domain first.')
      return
    }
    
    // Check each token
    console.log('2️⃣ Checking each token...')
    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        console.log(`\n   Token ID: ${tokenId}`)
        
        // Get owner
        const owner = await nft.ownerOf(tokenId)
        console.log(`   Owner: ${owner}`)
        
        // Get node
        const node = await nft.getNode(tokenId)
        console.log(`   Node: ${node}`)
        
        // Get name
        const name = await nft.getName(node)
        console.log(`   Name: "${name}"`)
        
        // Check if owned by our wallet
        if (owner.toLowerCase() === wallet.address.toLowerCase()) {
          console.log(`   ✅ Owned by you!`)
        } else {
          console.log(`   ❌ Owned by someone else`)
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('✅ DOMAIN RETRIEVAL TEST COMPLETE')
    console.log('═══════════════════════════════════════════════════════\n')
    
  } catch (error) {
    console.error('\n❌ TEST FAILED')
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
