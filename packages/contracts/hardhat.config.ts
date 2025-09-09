import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { HardhatUserConfig } from "hardhat/config";

const QUAI_RPC_URL = process.env.QUAI_RPC_URL || "http://localhost:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const CHAIN_ID = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 15000;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    quai: {
      url: QUAI_RPC_URL,
      chainId: CHAIN_ID,
      accounts: PRIVATE_KEY ? ["0x" + PRIVATE_KEY.replace(/^0x/, "")] : undefined
    }
  }
};
export default config;
