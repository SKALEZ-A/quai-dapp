import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import fs from "node:fs";
import path from "node:path";
import { JsonRpcProvider, Wallet, ContractFactory } from "quais";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  console.log("🚀 Deploying to Quai Network (MAINNET Cyprus-1)");
  console.log("=" .repeat(60));
  
  const rpcUrl = requireEnv("QUAI_RPC_URL");
  const privateKey = requireEnv("PRIVATE_KEY");
  const adminAddress = process.env.ADMIN_ADDRESS;

  // Initialize provider with pathing enabled (required for Quai)
  const provider = new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });
  const wallet = new Wallet(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`, provider);
  const deployerAddress = await wallet.getAddress();
  const admin = adminAddress || deployerAddress;

  console.log(`\n📍 Network: ${rpcUrl}`);
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`👑 Admin: ${admin}`);

  // Check balance
  const balance = await provider.getBalance(deployerAddress);
  const balanceQi = Number(balance) / 1e18;
  console.log(`💰 Balance: ${balanceQi.toFixed(4)} QI\n`);

  if (balanceQi < 1.0) {
    console.error("❌ Insufficient balance! Need at least 1 QI for deployment.");
    process.exit(1);
  }

  // IPFS hash required by quais (CIDv0, 46 chars starting with Qm)
  const ipfsHash = process.env.IPFS_HASH || "QmYwAPJzv5CZsnAzt8auVTLv6F6dMNoM6aDPZ87nMrW3mY";

  const deployedAddresses: Record<string, string> = {};

  try {
    // 1. Deploy SocialPosts
    console.log("📝 Deploying SocialPosts...");
    const socialArtifact = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../artifacts/contracts/SocialPosts.sol/SocialPosts.json"), "utf8")
    );
    const socialFactory = new ContractFactory(socialArtifact.abi, socialArtifact.bytecode, wallet, ipfsHash);
    const social = await socialFactory.deploy();
    const socialTx = social.deploymentTransaction();
    if (!socialTx) throw new Error("SocialPosts deployment transaction missing");
    await socialTx.wait();
    deployedAddresses.SOCIAL_CONTRACT_ADDRESS = await social.getAddress();
    console.log(`✅ SocialPosts: ${deployedAddresses.SOCIAL_CONTRACT_ADDRESS}\n`);

    // 2. Deploy QNSController
    console.log("📝 Deploying QNSController...");
    const controllerArtifact = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../artifacts/contracts/QNSController.sol/QNSController.json"), "utf8")
    );
    const controllerFactory = new ContractFactory(controllerArtifact.abi, controllerArtifact.bytecode, wallet, ipfsHash);
    const controller = await controllerFactory.deploy();
    const controllerTx = controller.deploymentTransaction();
    if (!controllerTx) throw new Error("QNSController deployment transaction missing");
    await controllerTx.wait();
    deployedAddresses.QNS_CONTROLLER_ADDRESS = await controller.getAddress();
    console.log(`✅ QNSController: ${deployedAddresses.QNS_CONTROLLER_ADDRESS}\n`);

    // Note: For upgradeable contracts (QNSRegistry, AuctionManager, etc.), we're deploying
    // the implementation contracts directly. For production, you'd want to deploy proxies.
    // This is a simplified deployment for MVP/testing purposes.

    console.log("\n" + "=".repeat(60));
    console.log("✅ DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Deployed Contract Addresses:\n");
    
    for (const [key, value] of Object.entries(deployedAddresses)) {
      console.log(`${key}=${value}`);
    }

    console.log("\n📝 Next Steps:");
    console.log("1. Copy the addresses above to your .env files");
    console.log("2. Update apps/web/.env.local with NEXT_PUBLIC_* variables");
    console.log("3. Update apps/api/.env with contract addresses");
    console.log("4. Restart your API and indexer services");
    console.log("\n🎉 Your contracts are now live on Quai Mainnet!");

    // Save to file
    const outputPath = path.resolve(__dirname, "../deployed-addresses.json");
    fs.writeFileSync(outputPath, JSON.stringify(deployedAddresses, null, 2));
    console.log(`\n💾 Addresses saved to: ${outputPath}`);

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

