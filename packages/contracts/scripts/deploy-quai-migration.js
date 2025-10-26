#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying QNS to QUAI Migration Contracts");
  console.log("============================================================");
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} QUAI\n`);

  // Deploy QNSRegistrySimple
  console.log("📝 [1/4] Deploying QNSRegistrySimple...");
  const QNSRegistrySimple = await ethers.getContractFactory("QNSRegistrySimple");
  const registry = await QNSRegistrySimple.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`✅ QNSRegistrySimple: ${registryAddress}`);

  // Deploy QNSReservedNamesSimple
  console.log("📝 [2/4] Deploying QNSReservedNamesSimple...");
  const QNSReservedNamesSimple = await ethers.getContractFactory("QNSReservedNamesSimple");
  const reservedNames = await QNSReservedNamesSimple.deploy(deployer.address);
  await reservedNames.waitForDeployment();
  const reservedNamesAddress = await reservedNames.getAddress();
  console.log(`✅ QNSReservedNamesSimple: ${reservedNamesAddress}`);

  // Deploy QNSNFTSimple
  console.log("📝 [3/4] Deploying QNSNFTSimple...");
  const QNSNFTSimple = await ethers.getContractFactory("QNSNFTSimple");
  const nft = await QNSNFTSimple.deploy(deployer.address, "Quai Name Service", "QNS");
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`✅ QNSNFTSimple: ${nftAddress}`);

  // Deploy QNSRegistrarSimple with new pricing (5/20/50 QUAI)
  console.log("📝 [4/4] Deploying QNSRegistrarSimple...");
  const QNSRegistrarSimple = await ethers.getContractFactory("QNSRegistrarSimple");
  const registrar = await QNSRegistrarSimple.deploy(
    nftAddress,
    registryAddress,
    reservedNamesAddress,
    deployer.address // treasury
  );
  await registrar.waitForDeployment();
  const registrarAddress = await registrar.getAddress();
  console.log(`✅ QNSRegistrarSimple: ${registrarAddress}`);

  // Grant minter role to registrar
  console.log("🔐 Granting minter role to registrar...");
  const MINTER_ROLE = await nft.MINTER_ROLE();
  await nft.grantRole(MINTER_ROLE, registrarAddress);
  console.log("✅ Minter role granted");

  // Save deployment addresses
  const deployment = {
    QNS_REGISTRY: registryAddress,
    QNS_RESERVED_NAMES: reservedNamesAddress,
    QNS_NFT: nftAddress,
    QNS_REGISTRAR: registrarAddress,
    DEPLOYER: deployer.address,
    NETWORK: "cyprus1_testnet",
    TIMESTAMP: new Date().toISOString(),
    PRICING: {
      "3_chars": "50 QUAI",
      "4_chars": "20 QUAI", 
      "5+_chars": "5 QUAI"
    }
  };

  const outputPath = path.join(__dirname, "../deployed-addresses-quai-migration.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2));
  console.log(`\n📄 Deployment addresses saved to: ${outputPath}`);

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("============================================================");
  console.log("📋 Contract Addresses:");
  console.log(`   QNS_REGISTRY: ${registryAddress}`);
  console.log(`   QNS_RESERVED_NAMES: ${reservedNamesAddress}`);
  console.log(`   QNS_NFT: ${nftAddress}`);
  console.log(`   QNS_REGISTRAR: ${registrarAddress}`);
  console.log("\n💰 New Pricing (Option A - Testnet Friendly):");
  console.log("   5+ chars: 5 QUAI (~$0.145 USD)");
  console.log("   4 chars: 20 QUAI (~$0.58 USD)");
  console.log("   3 chars: 50 QUAI (~$1.45 USD)");
  console.log("\n🔗 All domains will use .quai suffix");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ DEPLOYMENT FAILED:");
    console.error(error);
    process.exit(1);
  });
