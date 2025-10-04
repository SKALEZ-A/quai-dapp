import { ethers } from "hardhat";
import fs from "node:fs";
import path from "node:path";

async function main() {
  console.log("🚀 Deploying to Quai Orchard Testnet");
  console.log("=" .repeat(60));

  try {
    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`\n👤 Deployer: ${deployerAddress}`);

    // Check balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    const balanceQi = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceQi} QI\n`);

    if (Number(balanceQi) < 0.1) {
      console.warn("⚠️  Low balance! Get testnet tokens from https://orchard.faucet.quai.network\n");
    }

    // Manual gas parameters to bypass estimation issues
    const gasOverrides = {
      gasLimit: 5000000,
      gasPrice: ethers.parseUnits("10", "gwei")
    };

    // Deploy SocialPosts
    console.log("📝 Deploying SocialPosts...");
    const SocialPosts = await ethers.getContractFactory("SocialPosts");
    console.log("⏳ Sending transaction with manual gas params...");
    const social = await SocialPosts.deploy(gasOverrides);
    console.log("⏳ Waiting for deployment...");
    await social.waitForDeployment();
    const socialAddress = await social.getAddress();
    console.log(`✅ SocialPosts: ${socialAddress}\n`);

    // Deploy QNSController
    console.log("📝 Deploying QNSController...");
    const QNSController = await ethers.getContractFactory("QNSController");
    console.log("⏳ Sending transaction with manual gas params...");
    const controller = await QNSController.deploy(gasOverrides);
    console.log("⏳ Waiting for deployment...");
    await controller.waitForDeployment();
    const controllerAddress = await controller.getAddress();
    console.log(`✅ QNSController: ${controllerAddress}\n`);

    // Summary
    const result = {
      network: "Orchard Testnet",
      chainId: 15000,
      rpc: "https://orchard.rpc.quai.network/cyprus1",
      SOCIAL_CONTRACT_ADDRESS: socialAddress,
      QNS_CONTROLLER_ADDRESS: controllerAddress,
      DEPLOYER: deployerAddress
    };

    console.log("=".repeat(60));
    console.log("✅ DEPLOYMENT COMPLETE!\n");
    console.log(JSON.stringify(result, null, 2));

    // Save to file
    fs.writeFileSync(
      path.resolve(__dirname, "../deployed-testnet.json"),
      JSON.stringify(result, null, 2)
    );

    console.log("\n📝 Add to your .env files:");
    console.log(`NEXT_PUBLIC_SOCIAL_CONTRACT_ADDRESS=${socialAddress}`);
    console.log(`NEXT_PUBLIC_QNS_CONTROLLER_ADDRESS=${controllerAddress}`);
    console.log(`NEXT_PUBLIC_QUAI_RPC_URL=https://orchard.rpc.quai.network/cyprus1`);

  } catch (error: any) {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error.message);
    if (error.error) console.error("Details:", error.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

