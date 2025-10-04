#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { JsonRpcProvider, Wallet, ContractFactory } = require("quais");

const PRIVATE_KEY = "0x8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802";
const RPC_URL = "https://rpc.quai.network/cyprus1";
const IPFS_HASH = "QmYwAPJzv5CZsnAzt8auVTLv6F6dMNoM6aDPZ87nMrW3mY";

async function main() {
  console.log("🚀 Deploying to Quai Mainnet Cyprus-1\n");
  
  try {
    // Setup
    console.log("Setting up provider and wallet...");
    const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
    const wallet = new Wallet(PRIVATE_KEY, provider);
    const address = await wallet.getAddress();
    console.log(`✅ Deployer: ${address}\n`);

    // Skip balance check - proceed directly to deployment
    console.log("📝 Deploying SocialPosts...");
    const socialPath = path.resolve(__dirname, "../artifacts/contracts/SocialPosts.sol/SocialPosts.json");
    const socialArtifact = JSON.parse(fs.readFileSync(socialPath, "utf8"));
    const socialFactory = new ContractFactory(socialArtifact.abi, socialArtifact.bytecode, wallet, IPFS_HASH);
    
    console.log("⏳ Sending deployment transaction...");
    const social = await socialFactory.deploy();
    const socialTx = social.deploymentTransaction();
    console.log(`📝 TX: ${socialTx.hash}`);
    
    console.log("⏳ Waiting for confirmation (this may take 1-2 minutes)...");
    await socialTx.wait();
    const socialAddress = await social.getAddress();
    console.log(`✅ SocialPosts: ${socialAddress}\n`);

    // Deploy QNSController
    console.log("📝 Deploying QNSController...");
    const controllerPath = path.resolve(__dirname, "../artifacts/contracts/QNSController.sol/QNSController.json");
    const controllerArtifact = JSON.parse(fs.readFileSync(controllerPath, "utf8"));
    const controllerFactory = new ContractFactory(controllerArtifact.abi, controllerArtifact.bytecode, wallet, IPFS_HASH);
    
    console.log("⏳ Sending deployment transaction...");
    const controller = await controllerFactory.deploy();
    const controllerTx = controller.deploymentTransaction();
    console.log(`📝 TX: ${controllerTx.hash}`);
    
    console.log("⏳ Waiting for confirmation...");
    await controllerTx.wait();
    const controllerAddress = await controller.getAddress();
    console.log(`✅ QNSController: ${controllerAddress}\n`);

    // Summary
    const result = {
      SOCIAL_CONTRACT_ADDRESS: socialAddress,
      QNS_CONTROLLER_ADDRESS: controllerAddress,
      RPC: RPC_URL,
      DEPLOYER: address
    };

    console.log("=".repeat(60));
    console.log("✅ DEPLOYMENT COMPLETE!\n");
    console.log(JSON.stringify(result, null, 2));
    
    fs.writeFileSync(
      path.resolve(__dirname, "../deployed-mainnet.json"),
      JSON.stringify(result, null, 2)
    );

    console.log("\n📝 Add to your .env files:");
    console.log(`NEXT_PUBLIC_SOCIAL_CONTRACT_ADDRESS=${socialAddress}`);
    console.log(`NEXT_PUBLIC_QNS_CONTROLLER_ADDRESS=${controllerAddress}`);

  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    if (error.error) console.error("Details:", error.error);
    process.exit(1);
  }
}

main();

