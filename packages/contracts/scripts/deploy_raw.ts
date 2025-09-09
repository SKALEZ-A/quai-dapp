import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const admin = process.env.ADMIN_ADDRESS || deployerAddress;

  const Registry = await ethers.getContractFactory("QNSRegistry");
  const registry = await Registry.deploy({});
  await registry.waitForDeployment();
  const addr = await registry.getAddress();

  const tx = await registry.initialize(admin);
  await tx.wait();

  console.log("deployer:", deployerAddress);
  console.log("admin:", admin);
  console.log("QNSRegistry (raw):", addr);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


