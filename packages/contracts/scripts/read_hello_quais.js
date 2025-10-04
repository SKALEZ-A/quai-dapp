/* eslint-disable */
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();
const { JsonRpcProvider, Contract } = require("quais");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const rpcUrl = requireEnv("QUAI_RPC_URL");
  const address = requireEnv("HELLO_ADDRESS");

  const provider = new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });

  const artifactPath = path.resolve(__dirname, "../artifacts/contracts/HelloQuai.sol/HelloQuai.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}. Compile first.`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const contract = new Contract(address, artifact.abi, provider);
  const msg = await contract.getMessage();
  console.log("HelloQuai.getMessage():", msg);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
