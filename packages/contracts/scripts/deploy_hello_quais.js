/* eslint-disable */
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();
const { JsonRpcProvider, Wallet, ContractFactory } = require("quais");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const rpcUrl = requireEnv("QUAI_RPC_URL");
  const privateKeyRaw = requireEnv("PRIVATE_KEY");

  const provider = new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });
  const privateKey = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
  const wallet = new Wallet(privateKey, provider);

  const network = await provider.getNetwork();
  const balance = await provider.getBalance(wallet.address);
  const block = await provider.getBlockNumber();

  console.log("🚀 Deploying HelloQuai (quais)");
  console.log("📍 Chain ID:", network.chainId);
  console.log("🧱 Block:", block);
  console.log("👤 Deployer:", wallet.address);
  console.log("💰 Balance:", Number(balance) / 1e18, "QI");

  const artifactPath = path.resolve(__dirname, "../artifacts/contracts/HelloQuai.sol/HelloQuai.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}. Run hardhat compile first.`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log("⛽ Sending deploy tx...");
  const contract = await factory.deploy("Hello from Rocster!");
  const deployTx = contract.deploymentTransaction();
  if (!deployTx) throw new Error("Deployment transaction missing");
  console.log("🧾 Tx Hash:", deployTx.hash);

  console.log("⏳ Waiting for receipt...");
  const receipt = await deployTx.wait();
  console.log("📄 Receipt status:", receipt?.status, " block:", receipt?.blockNumber);

  const address = await contract.getAddress();
  console.log("✅ HelloQuai deployed at:", address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
