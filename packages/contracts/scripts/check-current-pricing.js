#!/usr/bin/env node
const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('💰 CHECKING CURRENT ON-CHAIN PRICING')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Setup provider and wallet
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Your wallet: ${wallet.address}`)
    
    // Get contract instances
    const registrarAddress = "0x00204d553264Bdb39f4A6C6c1325d9B4553E427b"
    const QNSRegistrarSimple = await hre.ethers.getContractFactory("QNSRegistrarSimple")
    const registrar = QNSRegistrarSimple.attach(registrarAddress)
    
    console.log(`📋 Registrar: ${registrarAddress}\n`)
    
    // Check current pricing for different domain lengths
    const testDomains = [
      { name: "abc", length: 3 },
      { name: "test", length: 4 },
      { name: "hello", length: 5 },
      { name: "myname", length: 6 },
      { name: "example", length: 7 },
      { name: "mydomain", length: 8 }
    ]
    
    console.log('💰 CURRENT ON-CHAIN PRICING:')
    console.log('═══════════════════════════════════════════════════════')
    
    for (const domain of testDomains) {
      try {
        const priceWei = await registrar.getPrice(domain.name)
        const priceQuai = quais.formatQuai(priceWei)
        console.log(`   ${domain.name} (${domain.length} chars): ${priceQuai} QUAI`)
      } catch (error) {
        console.log(`   ❌ ERROR testing ${domain.name}: ${error.message}`)
      }
    }
    
    console.log('\n🎯 ANALYSIS:')
    console.log('═══════════════════════════════════════════════════════')
    console.log('Current pricing is still too expensive for testnet users.')
    console.log('Need to update to affordable pricing: 5/20/50 QUAI')
    console.log('\n🚀 Ready to update pricing!')

  } catch (error) {
    console.error('❌ PRICING CHECK FAILED:')
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
