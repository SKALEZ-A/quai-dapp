/**
 * Deploy ONLY QNSRegistrarSimple - Uses existing deployed contracts
 * This is the missing piece to enable domain registration!
 */

const hre = require('hardhat')
const quais = require('quais')
const { deployMetadata } = require('hardhat')
require('dotenv').config()

const RegistrarJson = require('../artifacts/contracts/QNSRegistrarSimple.sol/QNSRegistrarSimple.json')

// YOUR ALREADY DEPLOYED CONTRACTS (from apps/web/src/lib/contracts.ts)
const EXISTING_CONTRACTS = {
  QNS_NFT: '0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2',
  QNS_REGISTRY: '0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61',
  QNS_RESERVED_NAMES: '0x00289917bf2b8b83623e3Ac4Da7E43d000B008F5',
}

async function main() {
  try {
    console.log('\n═══════════════════════════════════════')
    console.log('🚀 DEPLOYING QNS REGISTRAR (Final Piece!)')
    console.log('═══════════════════════════════════════\n')
    
    // Setup (use base RPC URL, not the full path)
    const baseRpcUrl = process.env.RPC_URL || process.env.QUAI_RPC_URL || 'https://orchard.rpc.quai.network'
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
      throw new Error('Insufficient balance!')
    }

    console.log('📋 Using existing contracts:')
    console.log(`   NFT: ${EXISTING_CONTRACTS.QNS_NFT}`)
    console.log(`   Registry: ${EXISTING_CONTRACTS.QNS_REGISTRY}`)
    console.log(`   Reserved: ${EXISTING_CONTRACTS.QNS_RESERVED_NAMES}\n`)

    // Deploy Registrar
    console.log('📦 Deploying QNSRegistrarSimple...')
    const ipfsHash = await deployMetadata.pushMetadataToIPFS('QNSRegistrarSimple')
    console.log(`📌 IPFS: ${ipfsHash}`)
    
    const Registrar = new quais.ContractFactory(
      RegistrarJson.abi,
      RegistrarJson.bytecode,
      wallet,
      ipfsHash
    )
    
    console.log('🚀 Broadcasting deployment...')
    const registrar = await Registrar.deploy(
      EXISTING_CONTRACTS.QNS_NFT,
      EXISTING_CONTRACTS.QNS_REGISTRY,
      EXISTING_CONTRACTS.QNS_RESERVED_NAMES,
      admin // treasury
    )
    
    const txHash = registrar.deploymentTransaction().hash
    console.log(`✅ Tx: ${txHash}`)
    console.log('⏳ Waiting for confirmation...')
    
    await registrar.deploymentTransaction().wait()
    await registrar.waitForDeployment()
    
    const registrarAddress = await registrar.getAddress()
    console.log(`✅ Deployed to: ${registrarAddress}`)
    
    // Now grant roles
    console.log('\n🔐 Setting up permissions...')
    
    // Load ABIs
    const QNSNFTJson = require('../artifacts/contracts/QNSNFT.sol/QNSNFT.json')
    const QNSRegistryJson = require('../artifacts/contracts/QNSRegistry.sol/QNSRegistry.json')
    
    // Load existing NFT contract to grant MINTER_ROLE
    const QNSNFT = new quais.Contract(EXISTING_CONTRACTS.QNS_NFT, QNSNFTJson.abi, wallet)
    const MINTER_ROLE = quais.keccak256(quais.toUtf8Bytes('MINTER_ROLE'))
    
    console.log('   Granting MINTER_ROLE on NFT...')
    const tx1 = await QNSNFT.grantRole(MINTER_ROLE, registrarAddress)
    await tx1.wait()
    console.log('   ✅ MINTER_ROLE granted!')
    
    // Load existing Registry contract to grant ADMIN_ROLE
    const Registry = new quais.Contract(EXISTING_CONTRACTS.QNS_REGISTRY, QNSRegistryJson.abi, wallet)
    const ADMIN_ROLE = quais.keccak256(quais.toUtf8Bytes('ADMIN_ROLE'))
    
    console.log('   Granting ADMIN_ROLE on Registry...')
    const tx2 = await Registry.grantRole(ADMIN_ROLE, registrarAddress)
    await tx2.wait()
    console.log('   ✅ ADMIN_ROLE granted!')
    
    // Success!
    console.log('\n═══════════════════════════════════════')
    console.log('✅ DEPLOYMENT COMPLETE!')
    console.log('═══════════════════════════════════════')
    console.log('\n📋 Add this to your .env:\n')
    console.log(`QNS_REGISTRAR_ADDRESS=${registrarAddress}`)
    console.log(`\n📋 Add this to apps/web/.env.local:\n`)
    console.log(`NEXT_PUBLIC_QNS_REGISTRAR=${registrarAddress}`)
    console.log('\n🎉 Ready to register domains!')
    console.log('═══════════════════════════════════════\n')
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED')
    console.error('═══════════════════════════════════════')
    console.error(`Error: ${error.message}`)
    console.error('═══════════════════════════════════════\n')
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
