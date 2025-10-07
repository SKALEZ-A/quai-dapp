import { ethers, upgrades } from "hardhat";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

async function main() {
  // Requires: PRIVATE_KEY (via hardhat.config), QUAI_RPC_URL; ADMIN_ADDRESS optional (falls back to deployer)
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const admin = process.env.ADMIN_ADDRESS || deployerAddress;

  // Check network
  const network = await ethers.provider.getNetwork();
  const isMainnet = network.chainId === 9000n; // Cyprus-1 mainnet
  const networkName = isMainnet ? "MAINNET" : "TESTNET";

  console.log(`🚀 Deploying to Quai Network (${networkName})`);
  console.log(`📍 Chain ID: ${network.chainId}`);
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`👑 Admin: ${admin}`);
  console.log("");

  if (isMainnet) {
    console.log("⚠️  DEPLOYING TO MAINNET - ENSURE YOU HAVE SUFFICIENT FUNDS!");
    console.log("💰 Deployment will cost approximately 0.5-1 QI");
    console.log("");

    // Add a delay for mainnet confirmation
    console.log("⏳ Waiting 5 seconds for confirmation...");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log("Deploying QNS contracts...");
  console.log("deployer:", deployerAddress);
  console.log("admin:", admin);

  // Deploy QNS Registry
  const Registry = await ethers.getContractFactory("QNSRegistry");
  const registry = await upgrades.deployProxy(Registry, [admin], { kind: "uups" });
  await registry.waitForDeployment();
  console.log("QNSRegistry:", await registry.getAddress());

  // Deploy QNS Controller
  const Controller = await ethers.getContractFactory("QNSController");
  const controller = await Controller.deploy();
  await controller.waitForDeployment();
  console.log("QNSController:", await controller.getAddress());

  // Deploy Auction Manager
  const AuctionManager = await ethers.getContractFactory("QNSAuctionManager");
  const auctionManager = await upgrades.deployProxy(AuctionManager, [admin], { kind: "uups" });
  await auctionManager.waitForDeployment();
  console.log("QNSAuctionManager:", await auctionManager.getAddress());

  // Deploy Reserved Names
  const ReservedNames = await ethers.getContractFactory("QNSReservedNames");
  const reservedNames = await upgrades.deployProxy(ReservedNames, [admin], { kind: "uups" });
  await reservedNames.waitForDeployment();
  console.log("QNSReservedNames:", await reservedNames.getAddress());

  // Deploy QNS NFT
  const QNSNFT = await ethers.getContractFactory("QNSNFT");
  const qnsNft = await upgrades.deployProxy(QNSNFT, [admin, "Quai Name Service", "QNS"], { kind: "uups" });
  await qnsNft.waitForDeployment();
  console.log("QNSNFT:", await qnsNft.getAddress());

  // Deploy Payment Resolver
  const PaymentResolver = await ethers.getContractFactory("QiPaymentResolver");
  const paymentResolver = await upgrades.deployProxy(PaymentResolver, [admin], { kind: "uups" });
  await paymentResolver.waitForDeployment();
  console.log("QiPaymentResolver:", await paymentResolver.getAddress());

  // Deploy Reverse Registrar
  const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
  const reverseRegistrar = await upgrades.deployProxy(ReverseRegistrar, [admin], { kind: "uups" });
  await reverseRegistrar.waitForDeployment();
  console.log("ReverseRegistrar:", await reverseRegistrar.getAddress());

  // Deploy Social Posts
  const Social = await ethers.getContractFactory("SocialPosts");
  const social = await Social.deploy();
  await social.waitForDeployment();
  console.log("SocialPosts:", await social.getAddress());

  // Deploy QNS Registrar (the bridge between users and minting)
  console.log("\nDeploying QNS Registrar...");
  const Registrar = await ethers.getContractFactory("QNSRegistrar");
  const registrar = await upgrades.deployProxy(
    Registrar,
    [
      admin,
      await qnsNft.getAddress(),
      await registry.getAddress(),
      await reservedNames.getAddress(),
      admin, // treasury (using admin wallet for now)
    ],
    { kind: "uups" }
  );
  await registrar.waitForDeployment();
  console.log("QNSRegistrar:", await registrar.getAddress());

  // Grant MINTER_ROLE to Registrar on QNSNFT
  console.log("\n🔐 Setting up permissions...");
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const tx1 = await qnsNft.grantRole(MINTER_ROLE, await registrar.getAddress());
  await tx1.wait();
  console.log("✅ MINTER_ROLE granted to Registrar");

  // Grant ADMIN_ROLE to Registrar on Registry (so it can setOwner)
  const ADMIN_ROLE_HASH = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const tx2 = await registry.grantRole(ADMIN_ROLE_HASH, await registrar.getAddress());
  await tx2.wait();
  console.log("✅ ADMIN_ROLE granted to Registrar on Registry");

  console.log("\n✅ Deployment complete!");
  console.log("Copy these addresses to your .env files:");
  console.log(`QNS_REGISTRY_ADDRESS=${await registry.getAddress()}`);
  console.log(`QNS_CONTROLLER_ADDRESS=${await controller.getAddress()}`);
  console.log(`AUCTION_MANAGER_ADDRESS=${await auctionManager.getAddress()}`);
  console.log(`RESERVED_NAMES_ADDRESS=${await reservedNames.getAddress()}`);
  console.log(`QNS_NFT_ADDRESS=${await qnsNft.getAddress()}`);
  console.log(`PAYMENT_RESOLVER_ADDRESS=${await paymentResolver.getAddress()}`);
  console.log(`REVERSE_REGISTRAR_ADDRESS=${await reverseRegistrar.getAddress()}`);
  console.log(`SOCIAL_CONTRACT_ADDRESS=${await social.getAddress()}`);
  console.log(`QNS_REGISTRAR_ADDRESS=${await registrar.getAddress()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
