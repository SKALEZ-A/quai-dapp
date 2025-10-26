#!/usr/bin/env node
const hre = require('hardhat')
const quais = require('quais')
require('dotenv').config()

// Role constants
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('🚀 QNS QUAI MIGRATION DEPLOYMENT - FIXED PRICING')
    console.log('   (2/5/10 QUAI - CHEAPER than original)')
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Setup provider and wallet
    const baseRpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
    const provider = new quais.JsonRpcProvider(baseRpcUrl, undefined, { usePathing: true })
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
    const admin = process.env.ADMIN_ADDRESS || wallet.address
    
    console.log(`🌐 Network: ${hre.network.name}`)
    console.log(`💼 Deployer: ${wallet.address}`)
    console.log(`👑 Admin: ${admin}`)
    
    // Check balance
    const balance = await provider.getBalance(wallet.address)
    console.log(`💰 Balance: ${quais.formatQuai(balance)} QUAI\n`)
    
    if (balance === 0n) {
      throw new Error('❌ Insufficient balance! Please fund your wallet.')
    }

    // Compile first
    console.log('📦 Compiling contracts...')
    await hre.run('compile')
    console.log('✅ Compilation complete!\n')

    // Deploy QNSRegistrySimple
    console.log('📝 [1/4] Deploying QNSRegistrySimple...')
    const QNSRegistrySimple = await hre.ethers.getContractFactory("QNSRegistrySimple")
    const registry = await QNSRegistrySimple.deploy(admin)
    await registry.waitForDeployment()
    const registryAddress = await registry.getAddress()
    console.log(`✅ QNSRegistrySimple: ${registryAddress}`)

    // Deploy QNSReservedNamesSimple
    console.log('📝 [2/4] Deploying QNSReservedNamesSimple...')
    const QNSReservedNamesSimple = await hre.ethers.getContractFactory("QNSReservedNamesSimple")
    const reservedNames = await QNSReservedNamesSimple.deploy(admin)
    await reservedNames.waitForDeployment()
    const reservedNamesAddress = await reservedNames.getAddress()
    console.log(`✅ QNSReservedNamesSimple: ${reservedNamesAddress}`)

    // Deploy QNSNFTSimple
    console.log('📝 [3/4] Deploying QNSNFTSimple...')
    const QNSNFTSimple = await hre.ethers.getContractFactory("QNSNFTSimple")
    const nft = await QNSNFTSimple.deploy(admin, "Quai Name Service", "QNS")
    await nft.waitForDeployment()
    const nftAddress = await nft.getAddress()
    console.log(`✅ QNSNFTSimple: ${nftAddress}`)

    // Deploy QNSRegistrarSimple with FIXED pricing (2/5/10 QUAI)
    console.log('📝 [4/4] Deploying QNSRegistrarSimple...')
    const QNSRegistrarSimple = await hre.ethers.getContractFactory("QNSRegistrarSimple")
    const registrar = await QNSRegistrarSimple.deploy(
      nftAddress,
      registryAddress,
      reservedNamesAddress,
      admin // treasury
    )
    await registrar.waitForDeployment()
    const registrarAddress = await registrar.getAddress()
    console.log(`✅ QNSRegistrarSimple: ${registrarAddress}`)

    // Grant minter role to registrar
    console.log('🔐 Granting minter role to registrar...')
    const MINTER_ROLE = await nft.MINTER_ROLE()
    await nft.grantRole(MINTER_ROLE, registrarAddress)
    console.log('✅ Minter role granted')

    // Save deployment addresses
    const deployment = {
      QNS_REGISTRY: registryAddress,
      QNS_RESERVED_NAMES: reservedNamesAddress,
      QNS_NFT: nftAddress,
      QNS_REGISTRAR: registrarAddress,
      DEPLOYER: wallet.address,
      NETWORK: "cyprus1_testnet",
      TIMESTAMP: new Date().toISOString(),
      PRICING: {
        "3_chars": "10 QUAI (was 1000 QUAI)",
        "4_chars": "5 QUAI (was 500 QUAI)", 
        "5+_chars": "2 QUAI (was 200 QUAI)"
      }
    };

    const fs = require('fs')
    const path = require('path')
    const outputPath = path.join(__dirname, "../deployed-addresses-quai-fixed.json")
    fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2))
    console.log(`\n📄 Deployment addresses saved to: ${outputPath}`)

    console.log('\n🎉 DEPLOYMENT COMPLETE!')
    console.log('═══════════════════════════════════════════════════════')
    console.log('📋 Contract Addresses:')
    console.log(`   QNS_REGISTRY: ${registryAddress}`)
    console.log(`   QNS_RESERVED_NAMES: ${reservedNamesAddress}`)
    console.log(`   QNS_NFT: ${nftAddress}`)
    console.log(`   QNS_REGISTRAR: ${registrarAddress}`)
    console.log('\n💰 FIXED Pricing (CHEAPER than original):')
    console.log("   5+ chars: 2 QUAI (was 200 QUAI) - 100x cheaper!");
    console.log("   4 chars: 5 QUAI (was 500 QUAI) - 100x cheaper!");
    console.log("   3 chars: 10 QUAI (was 1000 QUAI) - 100x cheaper!");
    console.log('\n🔗 All domains will use .quai suffix')
    console.log('\n✅ Ready for testing!')

  } catch (error) {
    console.error('❌ DEPLOYMENT FAILED:')
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
