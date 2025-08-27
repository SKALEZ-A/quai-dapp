import { ethers, upgrades } from "hardhat";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

async function main() {
  const admin = process.env.ADMIN_ADDRESS;
  if (!admin) throw new Error("ADMIN_ADDRESS is required");

  const Registry = await ethers.getContractFactory("QNSRegistry");
  const registry = await upgrades.deployProxy(Registry, [admin], { kind: "uups" });
  await registry.waitForDeployment();
  console.log("QNSRegistry:", await registry.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
