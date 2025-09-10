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
  const ipfsHash = process.env.IPFS_HASH || "QmYwAPJzv5CZsnAzt8auVTLv6F6dMNoM6aDPZ87nMrW3mY";

  const provider = new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });
  const privateKey = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
  const wallet = new Wallet(privateKey, provider);

  // Deploy SocialPosts (no constructor args)
  const socialArtifactPath = path.resolve(__dirname, "../artifacts/contracts/SocialPosts.sol/SocialPosts.json");
  if (!fs.existsSync(socialArtifactPath)) {
    throw new Error(`Artifact not found: ${socialArtifactPath}. Run hardhat compile first.`);
  }
  const socialArtifact = JSON.parse(fs.readFileSync(socialArtifactPath, "utf8"));
  const socialFactory = new ContractFactory(socialArtifact.abi, socialArtifact.bytecode, wallet, ipfsHash);
  const social = await socialFactory.deploy();
  const deployTx = social.deploymentTransaction();
  if (!deployTx) throw new Error("Deployment transaction missing");
  await deployTx.wait();
  const socialAddress = await social.getAddress();

  const out = { networkRpc: rpcUrl, socialPosts: socialAddress };
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


