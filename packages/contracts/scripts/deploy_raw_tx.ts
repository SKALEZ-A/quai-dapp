import { ethers, artifacts } from "hardhat";
import { Interface } from "ethers";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const admin = process.env.ADMIN_ADDRESS || deployerAddress;

  const art = await artifacts.readArtifact("QNSRegistry");
  const provider = ethers.provider;

  // Try to get gas price; fallback to 1 gwei
  let gasPrice;
  try {
    gasPrice = await provider.getGasPrice();
  } catch {
    gasPrice = ethers.parseUnits("1", "gwei");
  }

  const gasLimit = 6_000_000n;

  const deployTx = await deployer.sendTransaction({
    data: art.bytecode,
    gasPrice,
    gasLimit,
  });
  const receipt = await deployTx.wait();
  if (!receipt?.contractAddress) throw new Error("No contractAddress in receipt");
  const addr = receipt.contractAddress;

  const iface = new Interface(art.abi);
  const data = iface.encodeFunctionData("initialize", [admin]);
  const initTx = await deployer.sendTransaction({
    to: addr,
    data,
    gasPrice,
    gasLimit: 1_000_000n,
  });
  await initTx.wait();

  console.log("deployer:", deployerAddress);
  console.log("admin:", admin);
  console.log("QNSRegistry (raw-tx):", addr);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


