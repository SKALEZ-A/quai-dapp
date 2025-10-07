import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

async function main() {
  console.log("🚀 Deploying Simple QNSRegistrar...\n");

  const [deployer] = await ethers.getSigners();
  const admin = await deployer.getAddress();

  console.log("👤 Deployer:", admin);
  const balance = await ethers.provider.getBalance(admin);
  console.log("⛽ Balance:", ethers.formatEther(balance), "QI\n");

  // Existing deployed contracts
  const QNS_REGISTRY = "0x006ae3D235d8BC3dA5db16d82196C327e2c1dA61";
  const QNS_NFT = "0x003222F9A8a9BBfF0E8017b1265D04e0799BA5f2";
  const RESERVED_NAMES = "0x00289917bf2b8b83623e3Ac4Da7E43d000B008F5";

  console.log("📍 Connecting to existing contracts:");
  console.log("  Registry:", QNS_REGISTRY);
  console.log("  NFT:", QNS_NFT);
  console.log("  Reserved:", RESERVED_NAMES);
  console.log("");

  // Deploy Registrar
  console.log("📦 Deploying QNSRegistrarSimple...");
  const Registrar = await ethers.getContractFactory("QNSRegistrarSimple");
  const registrar = await Registrar.deploy(
    QNS_NFT,
    QNS_REGISTRY,
    RESERVED_NAMES,
    admin // treasury
  );

  await registrar.waitForDeployment();
  const registrarAddress = await registrar.getAddress();
  console.log("✅ Deployed at:", registrarAddress);
  console.log("");

  // Grant permissions
  console.log("🔐 Granting permissions...");
  
  const qnsNFT = await ethers.getContractAt("QNSNFT", QNS_NFT);
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  
  console.log("  → Granting MINTER_ROLE...");
  const tx1 = await qnsNFT.grantRole(MINTER_ROLE, registrarAddress);
  await tx1.wait();
  console.log("  ✅ MINTER_ROLE granted");

  const registry = await ethers.getContractAt("QNSRegistry", QNS_REGISTRY);
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  
  console.log("  → Granting ADMIN_ROLE...");
  const tx2 = await registry.grantRole(ADMIN_ROLE, registrarAddress);
  await tx2.wait();
  console.log("  ✅ ADMIN_ROLE granted");
  console.log("");

  // Test
  console.log("🧪 Testing...");
  const testPrice = await registrar.getPrice("testdomain");
  console.log("  Price for 'testdomain':", ethers.formatEther(testPrice), "QI");
  
  const testNode = ethers.keccak256(ethers.toUtf8Bytes("testdomain"));
  const testAvailable = await registrar.available(testNode);
  console.log("  Available:", testAvailable);
  console.log("");

  console.log("✅ DEPLOYMENT COMPLETE!\n");
  console.log("📋 Add to /apps/web/.env.local:");
  console.log(`NEXT_PUBLIC_QNS_REGISTRAR=${registrarAddress}`);
  console.log("");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
