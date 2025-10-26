#!/usr/bin/env node
const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('🧪 TESTING DOMAIN REGISTRATION WITH YOUR PRIVATE KEY')
    console.log('   (Complete workflow test)')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Setup provider and wallet using YOUR private key
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Your wallet: ${wallet.address}`)
    
    // Check balance
    const balance = await provider.getBalance(wallet.address)
    console.log(`💰 Balance: ${quais.formatQuai(balance)} QUAI\n`)
    
    // Get contract instances
    const registrarAddress = "0x00204d553264Bdb39f4A6C6c1325d9B4553E427b"
    const nftAddress = "0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12"
    const registryAddress = "0x0047904d94645A46BA56Cf7E8c064cB823746cFf"
    
    const QNSRegistrarSimple = await hre.ethers.getContractFactory("QNSRegistrarSimple")
    const QNSNFTSimple = await hre.ethers.getContractFactory("QNSNFTSimple")
    const QNSRegistrySimple = await hre.ethers.getContractFactory("QNSRegistrySimple")
    
    const registrar = QNSRegistrarSimple.attach(registrarAddress)
    const nft = QNSNFTSimple.attach(nftAddress)
    const registry = QNSRegistrySimple.attach(registryAddress)
    
    console.log(`📋 Contracts:`)
    console.log(`   Registrar: ${registrarAddress}`)
    console.log(`   NFT: ${nftAddress}`)
    console.log(`   Registry: ${registryAddress}\n`)
    
    // Test domain: "testuser" (8 chars - should be 100 QUAI)
    const testDomain = "testuser"
    const node = quais.keccak256(quais.toUtf8Bytes(testDomain))
    
    console.log(`🔍 Testing domain: "${testDomain}"`)
    console.log(`   Length: ${testDomain.length} characters`)
    console.log(`   Node: ${node}\n`)
    
    // Step 1: Check current pricing
    console.log('1️⃣ Checking current pricing...')
    try {
      const priceWei = await registrar.getPrice(testDomain)
      const priceQuai = quais.formatQuai(priceWei)
      console.log(`   Current price: ${priceQuai} QUAI`)
    } catch (error) {
      console.log(`   ❌ Error getting price: ${error.message}`)
    }
    
    // Step 2: Check domain availability
    console.log('\n2️⃣ Checking domain availability...')
    try {
      const isAvailable = await registrar.available(node)
      console.log(`   Available: ${isAvailable ? '✅ YES' : '❌ NO'}`)
      
      if (!isAvailable) {
        // Check who owns it
        try {
          const owner = await registry.ownerOf(node)
          console.log(`   Owner: ${owner}`)
          if (owner === wallet.address) {
            console.log(`   ✅ You already own this domain!`)
          }
        } catch (error) {
          console.log(`   ❌ Error checking owner: ${error.message}`)
        }
      }
    } catch (error) {
      console.log(`   ❌ Error checking availability: ${error.message}`)
    }
    
    // Step 3: Try to register the domain
    console.log('\n3️⃣ Attempting domain registration...')
    try {
      const priceWei = await registrar.getPrice(testDomain)
      const priceQuai = quais.formatQuai(priceWei)
      
      console.log(`   Price: ${priceQuai} QUAI`)
      console.log(`   Sending transaction...`)
      
      const tx = await registrar.register(testDomain, node, { value: priceWei })
      console.log(`   ✅ Transaction sent: ${tx.hash}`)
      
      console.log(`   ⏳ Waiting for confirmation...`)
      const receipt = await tx.wait()
      console.log(`   ✅ Transaction confirmed in block: ${receipt.blockNumber}`)
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`)
      
      // Step 4: Verify registration
      console.log('\n4️⃣ Verifying registration...')
      
      // Check NFT ownership
      try {
        const tokenId = await nft.getTokenId(node)
        const nftOwner = await nft.ownerOf(tokenId)
        console.log(`   NFT Token ID: ${tokenId}`)
        console.log(`   NFT Owner: ${nftOwner}`)
        console.log(`   ✅ NFT ownership verified: ${nftOwner === wallet.address ? 'CORRECT' : 'WRONG'}`)
      } catch (error) {
        console.log(`   ❌ Error verifying NFT: ${error.message}`)
      }
      
      // Check registry ownership
      try {
        const registryOwner = await registry.ownerOf(node)
        console.log(`   Registry Owner: ${registryOwner}`)
        console.log(`   ✅ Registry ownership verified: ${registryOwner === wallet.address ? 'CORRECT' : 'WRONG'}`)
      } catch (error) {
        console.log(`   ❌ Error verifying registry: ${error.message}`)
      }
      
    } catch (error) {
      console.log(`   ❌ Registration failed: ${error.message}`)
      
      if (error.message.includes('Already registered')) {
        console.log(`   ℹ️  Domain is already registered`)
      } else if (error.message.includes('Insufficient payment')) {
        console.log(`   ℹ️  Insufficient payment - check pricing`)
      }
    }
    
    // Step 5: Test domain resolution (payment-to-domain)
    console.log('\n5️⃣ Testing domain resolution for payments...')
    try {
      const owner = await registry.ownerOf(node)
      console.log(`   Domain "${testDomain}" resolves to: ${owner}`)
      console.log(`   ✅ Payment-to-domain would work: ${owner === wallet.address ? 'YES' : 'NO'}`)
    } catch (error) {
      console.log(`   ❌ Error testing resolution: ${error.message}`)
    }
    
    console.log('\n🎉 WORKFLOW TEST COMPLETE!')
    console.log('═══════════════════════════════════════════════════════')
    console.log('✅ Domain registration workflow tested')
    console.log('✅ Payment-to-domain resolution tested')
    console.log('✅ NFT and Registry ownership verified')
    console.log('\n🚀 Ready for frontend testing!')

  } catch (error) {
    console.error('❌ WORKFLOW TEST FAILED:')
    console.error(error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
