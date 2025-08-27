import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { HardhatUserConfig } from "hardhat/config";

const QUAI_RPC_URL = process.env.QUAI_RPC_URL || "http://localhost:8545";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    quai: {
      url: QUAI_RPC_URL
    }
  }
};
export default config;
