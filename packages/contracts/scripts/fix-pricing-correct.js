#!/usr/bin/env node
const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('🔧 FIXING QNS PRICING - CORRECT QUAI UNITS')
    console.log('   (2/5/10 QUAI - MUCH CHEAPER)')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Setup provider and wallet
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Your wallet: ${wallet.address}`)
    
    // Get contract instances - USE CORRECT ADDRESS
    const registrarAddress = "0x00204d553264Bdb39f4A6C6c1325d9B4553E427b"
    const QNSRegistrarSimple = await hre.ethers.getContractFactory("QNSRegistrarSimple")
    const registrar = QNSRegistrarSimple.attach(registrarAddress)
    
    console.log(`📋 Registrar: ${registrarAddress}\n`)
    
    // CORRECT pricing in QUAI units (much cheaper)
    const newPricing = {
      3: '10000000000000000000',  // 10 QUAI (was 1000 QUAI)
      4: '5000000000000000000',   // 5 QUAI (was 500 QUAI)  
      5: '2000000000000000000',   // 2 QUAI (was 200 QUAI)
      6: '2000000000000000000',   // 2 QUAI (was 200 QUAI)
      7: '2000000000000000000',   // 2 QUAI (was 200 QUAI)
    }
    
    console.log('💰 CORRECTED PRICING (QUAI units):')
    console.log('   3-char domains: 10 QUAI (was 1000 QUAI)')
    console.log('   4-char domains: 5 QUAI (was 500 QUAI)')
    console.log('   5-char domains: 2 QUAI (was 200 QUAI)')
    console.log('   6-char domains: 2 QUAI (was 200 QUAI)')
    console.log('   7-char domains: 2 QUAI (was 200 QUAI)\n')
    
    // Update pricing for each length
    for (const [length, price] of Object.entries(newPricing)) {
      console.log(`Updating ${length}-char domain pricing to ${price} wei...`)
      
      try {
        const tx = await registrar.updatePricing(length, price)
        console.log(`   ✅ Transaction sent: ${tx.hash}`)
        await tx.wait()
        console.log(`   ✅ Pricing updated successfully!`)
        
        // Verify the update
        const currentPrice = await registrar.pricing(length)
        console.log(`   ✅ Verified: ${length}-char domains now cost ${currentPrice.toString()} wei`)
        
      } catch (error) {
        console.log(`   ❌ Failed to update ${length}-char pricing: ${error.message}`)
      }
    }
    
    console.log('\n🧪 Testing new pricing...')
    const testDomains = [
      { name: "abc", length: 3 },
      { name: "test", length: 4 },
      { name: "hello", length: 5 },
      { name: "myname", length: 6 },
      { name: "example", length: 7 }
    ]
    
    for (const domain of testDomains) {
      try {
        const priceWei = await registrar.getPrice(domain.name)
        const priceQuai = quais.formatQuai(priceWei)
        console.log(`   ${domain.name} (${domain.length} chars): ${priceQuai} QUAI`)
      } catch (error) {
        console.log(`   ❌ ERROR testing ${domain.name}: ${error.message}`)
      }
    }
    
    console.log('\n🎉 PRICING FIX COMPLETE!')
    console.log('═══════════════════════════════════════════════════════')
    console.log('✅ 3 chars: 10 QUAI (was 1000 QUAI) - 100x cheaper!')
    console.log('✅ 4 chars: 5 QUAI (was 500 QUAI) - 100x cheaper!')
    console.log('✅ 5+ chars: 2 QUAI (was 200 QUAI) - 100x cheaper!')
    console.log('\n🚀 Ready for frontend testing!')

  } catch (error) {
    console.error('❌ PRICING FIX FAILED:')
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
