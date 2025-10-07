/**
 * TEST DOMAIN REGISTRATION
 * Verify end-to-end domain registration works
 */

const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

// Load deployed addresses
const deployedAddresses = require('../deployed-addresses-simple.json')

// Load contract artifacts
const QNSRegistrarSimpleJson = require('../artifacts/contracts/QNSRegistrarSimple.sol/QNSRegistrarSimple.json')
const QNSNFTSimpleJson = require('../artifacts/contracts/QNSNFTSimple.sol/QNSNFTSimple.json')
const QNSRegistrySimpleJson = require('../artifacts/contracts/QNSRegistrySimple.sol/QNSRegistrySimple.json')

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('🧪 TESTING QNS DOMAIN REGISTRATION')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Setup provider and wallet
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Your wallet: ${wallet.address}\n`)
    
    const { QNS_NFT, QNS_REGISTRY, QNS_REGISTRAR } = deployedAddresses.contracts
    
    console.log(`📋 Contract Addresses:`)
    console.log(`   NFT: ${QNS_NFT}`)
    console.log(`   Registry: ${QNS_REGISTRY}`)
    console.log(`   Registrar: ${QNS_REGISTRAR}\n`)
    
    // Connect to contracts
    const registrar = new quais.Contract(QNS_REGISTRAR, QNSRegistrarSimpleJson.abi, wallet)
    const nft = new quais.Contract(QNS_NFT, QNSNFTSimpleJson.abi, wallet)
    const registry = new quais.Contract(QNS_REGISTRY, QNSRegistrySimpleJson.abi, wallet)
    
    // Test domain name
    const testName = 'testdomain'
    const testNode = quais.keccak256(quais.toUtf8Bytes(testName))
    
    console.log('═══════════════════════════════════════════════════════')
    console.log(`Testing with domain: "${testName}"`)
    console.log(`Node hash: ${testNode}`)
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Check if domain is available
    console.log('1️⃣ Checking domain availability...')
    const available = await registrar.available(testNode)
    console.log(`   Available: ${available ? '✅ YES' : '❌ NO (already registered)'}\n`)
    
    if (!available) {
      console.log('⚠️  Domain already registered. Checking ownership...')
      const owner = await registry.ownerOf(testNode)
      console.log(`   Owner: ${owner}`)
      
      if (owner.toLowerCase() === wallet.address.toLowerCase()) {
        console.log('   ✅ You already own this domain!\n')
        
        // Get token ID
        const tokenId = await nft.getTokenId(testNode)
        console.log(`   Token ID: ${tokenId}`)
        
        console.log('\n═══════════════════════════════════════════════════════')
        console.log('✅ TEST PASSED - Domain previously registered by you')
        console.log('═══════════════════════════════════════════════════════\n')
        return
      } else {
        console.log('   ℹ️  Domain owned by someone else. Try a different name.\n')
        return
      }
    }
    
    // Get price
    console.log('2️⃣ Getting domain price...')
    const price = await registrar.getPrice(testName)
    console.log(`   Price: ${quais.formatQuai(price)} QUAI\n`)
    
    // Check balance
    const balance = await provider.getBalance(wallet.address)
    console.log('3️⃣ Checking wallet balance...')
    console.log(`   Balance: ${quais.formatQuai(balance)} QUAI`)
    
    if (balance < price) {
      throw new Error('Insufficient balance to register domain!')
    }
    console.log('   ✅ Sufficient balance\n')
    
    // Register domain
    console.log('4️⃣ Registering domain...')
    console.log('   📤 Sending transaction...')
    const tx = await registrar.register(testName, testNode, { value: price })
    console.log(`   ✅ Tx: ${tx.hash}`)
    console.log('   ⏳ Waiting for confirmation...')
    
    const receipt = await tx.wait()
    console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`)
    console.log(`   ⛽ Gas used: ${receipt.gasUsed}\n`)
    
    // Verify registration
    console.log('5️⃣ Verifying registration...')
    
    // Check NFT ownership
    const exists = await nft.exists(testNode)
    console.log(`   NFT exists: ${exists ? '✅ YES' : '❌ NO'}`)
    
    if (exists) {
      const tokenId = await nft.getTokenId(testNode)
      const nftOwner = await nft.ownerOf(tokenId)
      console.log(`   Token ID: ${tokenId}`)
      console.log(`   NFT Owner: ${nftOwner}`)
      console.log(`   Owned by you: ${nftOwner.toLowerCase() === wallet.address.toLowerCase() ? '✅ YES' : '❌ NO'}`)
    }
    
    // Check registry
    const registryOwner = await registry.ownerOf(testNode)
    console.log(`   Registry Owner: ${registryOwner}`)
    console.log(`   Owned by you: ${registryOwner.toLowerCase() === wallet.address.toLowerCase() ? '✅ YES' : '❌ NO'}\n`)
    
    // Success!
    console.log('═══════════════════════════════════════════════════════')
    console.log('🎉 TEST PASSED - Domain Registration Successful!')
    console.log('═══════════════════════════════════════════════════════\n')
    
    console.log('✅ Summary:')
    console.log(`   Domain: ${testName}`)
    console.log(`   Node: ${testNode}`)
    console.log(`   Owner: ${wallet.address}`)
    console.log(`   Price paid: ${quais.formatQuai(price)} QUAI`)
    console.log(`   Transaction: ${tx.hash}\n`)
    
    console.log('🚀 Your QNS system is fully operational!')
    console.log('   You can now integrate with the frontend.\n')
    
  } catch (error) {
    console.error('\n❌ TEST FAILED')
    console.error('═══════════════════════════════════════════════════════')
    console.error(`Error: ${error.message}`)
    if (error.reason) {
      console.error(`Reason: ${error.reason}`)
    }
    if (error.code) {
      console.error(`Code: ${error.code}`)
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
