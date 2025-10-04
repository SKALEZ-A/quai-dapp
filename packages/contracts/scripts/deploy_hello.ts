import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const network = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();

  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("🚀 Deploying HelloQuai");
  console.log("📍 Chain ID:", network.chainId.toString());
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "QI");

  const HelloQuai = await ethers.getContractFactory("HelloQuai");

  // Use explicit gas settings to bypass estimateGas quirks
  const overrides = {
    gasLimit: 3_000_000n,
    maxFeePerGas: ethers.parseUnits("40", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
  } as const;

  const contract = await HelloQuai.deploy("Hello from Rocster!", overrides);
  await contract.waitForDeployment();

  console.log("✅ HelloQuai deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
