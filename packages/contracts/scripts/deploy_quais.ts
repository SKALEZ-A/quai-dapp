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
  const rpcUrl = requireEnv("QUAI_RPC_URL");
  const privateKey = requireEnv("PRIVATE_KEY");

  const provider = new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });
  const wallet = new Wallet(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`, provider);

  // Deploy SocialPosts (no constructor args)
  const socialArtifactPath = path.resolve(__dirname, "../artifacts/contracts/SocialPosts.sol/SocialPosts.json");
  if (!fs.existsSync(socialArtifactPath)) {
    throw new Error(`Artifact not found: ${socialArtifactPath}. Run hardhat compile first.`);
  }
  const socialArtifact = JSON.parse(fs.readFileSync(socialArtifactPath, "utf8"));
  // Quai SDK requires an IPFS CIDv0 (46 chars starting with Qm). Allow override via env, else use a well-known placeholder.
  const ipfsHash = process.env.IPFS_HASH || "QmYwAPJzv5CZsnAzt8auVTLv6F6dMNoM6aDPZ87nMrW3mY";
  const socialFactory = new ContractFactory(socialArtifact.abi, socialArtifact.bytecode, wallet, ipfsHash);
  const social = await socialFactory.deploy();
  const deployTx = social.deploymentTransaction();
  if (!deployTx) throw new Error("Deployment transaction missing");
  await deployTx.wait();
  const socialAddress = await social.getAddress();

  // Deploy QNSRegistry via UUPS is not directly doable via plain ContractFactory here for upgrades.
  // As a first step, deploy the implementation directly if needed, otherwise skip.
  // Users who need upgradeable proxies should use Hardhat upgrades or a separate deploy flow.

  // Output addresses in a simple JSON for downstream usage
  const out = { networkRpc: rpcUrl, socialPosts: socialAddress };
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


