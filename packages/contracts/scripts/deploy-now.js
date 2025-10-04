#!/usr/bin/env node
/* eslint-disable */
const fs = require("node:fs");
const path = require("node:path");
const { JsonRpcProvider, Wallet, ContractFactory } = require("quais");

async function main() {
  console.log("🚀 Starting Quai Mainnet Deployment");
  console.log("=" .repeat(60));
  
  // Environment variables passed via command line
  const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x8d38113c18805d41701493531b98067a767bcde2d8af88d6d4763c39eab74802";
  const QUAI_RPC_URL = process.env.QUAI_RPC_URL || "https://rpc.quai.network/cyprus1";
  const IPFS_HASH = process.env.IPFS_HASH || "QmYwAPJzv5CZsnAzt8auVTLv6F6dMNoM6aDPZ87nMrW3mY";

  console.log(`\n📍 RPC: ${QUAI_RPC_URL}`);
  console.log(`🔑 Private Key: ${PRIVATE_KEY.substring(0, 10)}...`);

  try {
    console.log("\n🔌 Connecting to Quai Network...");
    const provider = new JsonRpcProvider(QUAI_RPC_URL, undefined, { usePathing: true });
    
    console.log("👛 Creating wallet...");
    const wallet = new Wallet(PRIVATE_KEY, provider);
    const address = await wallet.getAddress();
    console.log(`✅ Deployer Address: ${address}`);

    console.log("\n💰 Checking balance...");
    const balance = await provider.getBalance(address);
    const balanceQi = Number(balance) / 1e18;
    console.log(`✅ Balance: ${balanceQi.toFixed(4)} QI`);

    if (balanceQi < 0.5) {
      throw new Error(`Insufficient balance! Need at least 0.5 QI, have ${balanceQi.toFixed(4)} QI`);
    }

    // Deploy SocialPosts
    console.log("\n📝 Deploying SocialPosts contract...");
    const socialArtifactPath = path.resolve(__dirname, "../artifacts/contracts/SocialPosts.sol/SocialPosts.json");
    
    if (!fs.existsSync(socialArtifactPath)) {
      throw new Error(`Artifact not found: ${socialArtifactPath}`);
    }

    console.log("📄 Reading contract artifact...");
    const socialArtifact = JSON.parse(fs.readFileSync(socialArtifactPath, "utf8"));
    
    console.log("🏭 Creating contract factory...");
    const socialFactory = new ContractFactory(
      socialArtifact.abi,
      socialArtifact.bytecode,
      wallet,
      IPFS_HASH
    );

    console.log("🚀 Deploying contract (this may take 1-2 minutes)...");
    const social = await socialFactory.deploy();
    
    console.log("⏳ Waiting for transaction confirmation...");
    const deployTx = social.deploymentTransaction();
    if (!deployTx) throw new Error("Deployment transaction missing");
    
    console.log(`📝 Transaction Hash: ${deployTx.hash}`);
    const receipt = await deployTx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    
    const socialAddress = await social.getAddress();
    console.log(`\n✅ SocialPosts deployed at: ${socialAddress}`);

    // Deploy QNSController
    console.log("\n📝 Deploying QNSController contract...");
    const controllerArtifactPath = path.resolve(__dirname, "../artifacts/contracts/QNSController.sol/QNSController.json");
    
    if (!fs.existsSync(controllerArtifactPath)) {
      throw new Error(`Artifact not found: ${controllerArtifactPath}`);
    }

    console.log("📄 Reading contract artifact...");
    const controllerArtifact = JSON.parse(fs.readFileSync(controllerArtifactPath, "utf8"));
    
    console.log("🏭 Creating contract factory...");
    const controllerFactory = new ContractFactory(
      controllerArtifact.abi,
      controllerArtifact.bytecode,
      wallet,
      IPFS_HASH
    );

    console.log("🚀 Deploying contract (this may take 1-2 minutes)...");
    const controller = await controllerFactory.deploy();
    
    console.log("⏳ Waiting for transaction confirmation...");
    const controllerTx = controller.deploymentTransaction();
    if (!controllerTx) throw new Error("Deployment transaction missing");
    
    console.log(`📝 Transaction Hash: ${controllerTx.hash}`);
    const controllerReceipt = await controllerTx.wait();
    console.log(`✅ Transaction confirmed in block: ${controllerReceipt.blockNumber}`);
    
    const controllerAddress = await controller.getAddress();
    console.log(`\n✅ QNSController deployed at: ${controllerAddress}`);

    // Summary
    const deployedAddresses = {
      SOCIAL_CONTRACT_ADDRESS: socialAddress,
      QNS_CONTROLLER_ADDRESS: controllerAddress,
      NETWORK_RPC: QUAI_RPC_URL,
      CHAIN_ID: "9",
      DEPLOYER_ADDRESS: address
    };

    console.log("\n" + "=".repeat(60));
    console.log("✅ DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Deployed Contract Addresses:\n");
    console.log(JSON.stringify(deployedAddresses, null, 2));

    // Save to file
    const outputPath = path.resolve(__dirname, "../deployed-addresses.json");
    fs.writeFileSync(outputPath, JSON.stringify(deployedAddresses, null, 2));
    console.log(`\n💾 Addresses saved to: ${outputPath}`);

    console.log("\n📝 Next Steps:");
    console.log("1. Copy these addresses to your .env files:");
    console.log(`   NEXT_PUBLIC_SOCIAL_CONTRACT_ADDRESS=${socialAddress}`);
    console.log(`   NEXT_PUBLIC_QNS_CONTROLLER_ADDRESS=${controllerAddress}`);
    console.log("2. Update apps/web/.env.local");
    console.log("3. Update apps/api/.env");
    console.log("\n🎉 Your contracts are now live on Quai Mainnet Cyprus-1!");

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

