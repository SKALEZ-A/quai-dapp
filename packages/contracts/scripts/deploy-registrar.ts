import { ethers, upgrades } from "hardhat";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

async function main() {
  console.log("🚀 Deploying QNSRegistrar to existing QNS system...\n");

  const [deployer] = await ethers.getSigners();
  const admin = await deployer.getAddress();

  console.log("👤 Deployer:", admin);
  console.log("⛽ Balance:", ethers.formatEther(await ethers.provider.getBalance(admin)), "QI\n");

  // Existing deployed contract addresses
  const QNS_REGISTRY = "0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61";
  const QNS_NFT = "0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2";
  const RESERVED_NAMES = "0x00289917bf2b8b83623e3Ac4Da7E43d000B008F5";

  console.log("📍 Using existing contracts:");
  console.log("  QNS Registry:", QNS_REGISTRY);
  console.log("  QNS NFT:", QNS_NFT);
  console.log("  Reserved Names:", RESERVED_NAMES);
  console.log("");

  // Deploy QNS Registrar
  console.log("📦 Deploying QNSRegistrar...");
  const Registrar = await ethers.getContractFactory("QNSRegistrar");
  
  try {
    const registrar = await upgrades.deployProxy(
      Registrar,
      [
        admin,           // admin
        QNS_NFT,        // qnsNFT
        QNS_REGISTRY,   // registry
        RESERVED_NAMES, // reservedNames
        admin,          // treasury (using admin for now)
      ],
      { kind: "uups" }
    );
    
    await registrar.waitForDeployment();
    const registrarAddress = await registrar.getAddress();
    console.log("✅ QNSRegistrar deployed:", registrarAddress);
    console.log("");

    // Grant MINTER_ROLE to Registrar on QNSNFT
    console.log("🔐 Granting permissions...");
    const qnsNFT = await ethers.getContractAt("QNSNFT", QNS_NFT);
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    
    console.log("  Granting MINTER_ROLE to Registrar on QNSNFT...");
    const tx1 = await qnsNFT.grantRole(MINTER_ROLE, registrarAddress);
    await tx1.wait();
    console.log("  ✅ MINTER_ROLE granted");

    // Grant ADMIN_ROLE to Registrar on Registry
    const registry = await ethers.getContractAt("QNSRegistry", QNS_REGISTRY);
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    
    console.log("  Granting ADMIN_ROLE to Registrar on Registry...");
    const tx2 = await registry.grantRole(ADMIN_ROLE, registrarAddress);
    await tx2.wait();
    console.log("  ✅ ADMIN_ROLE granted");
    console.log("");

    // Test: Get price for a domain
    console.log("🧪 Testing Registrar...");
    const price = await registrar.getPrice("testdomain");
    console.log("  Price for 'testdomain':", ethers.formatEther(price), "QI");
    
    const node = ethers.keccak256(ethers.toUtf8Bytes("testdomain"));
    const available = await registrar.available(node);
    console.log("  'testdomain' available:", available);
    console.log("");

    console.log("✅ Deployment Complete!");
    console.log("");
    console.log("📋 Add this to your .env.local:");
    console.log(`NEXT_PUBLIC_QNS_REGISTRAR=${registrarAddress}`);
    console.log("");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
