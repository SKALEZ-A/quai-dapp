/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomicfoundation/hardhat-toolbox')
require('@quai/quais-upgrades');
require("@quai/hardhat-deploy-metadata");

const dotenv = require('dotenv')
dotenv.config() // Load from current directory

// Get environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const CYPRUS1_PK = process.env.CYPRUS1_PK || PRIVATE_KEY;
const CYPRUS2_PK = process.env.CYPRUS2_PK || PRIVATE_KEY;
const PAXOS1_PK = process.env.PAXOS1_PK || PRIVATE_KEY;
const HYDRA1_PK = process.env.HYDRA1_PK || PRIVATE_KEY;
const RPC_URL = process.env.QUAI_RPC_URL || process.env.RPC_URL || "https://rpc.quai.network";
const CHAIN_ID = Number(process.env.CHAIN_ID || 9);

module.exports = {
  defaultNetwork: 'cyprus1',
  networks: {
    // Mainnet networks (Chain ID: 9)
    cyprus1: {
      url: RPC_URL,
      accounts: [CYPRUS1_PK],
      chainId: CHAIN_ID,
    },
    cyprus2: {
      url: RPC_URL,
      accounts: [CYPRUS2_PK],
      chainId: CHAIN_ID,
    },
    paxos1: {
      url: RPC_URL,
      accounts: [PAXOS1_PK],
      chainId: CHAIN_ID,
    },
    hydra1: {
      url: RPC_URL,
      accounts: [HYDRA1_PK],
      chainId: CHAIN_ID,
    },
    // Alternative: specify zone in URL (not recommended, use RPC_URL with usePathing instead)
    // cyprus1_fullpath: {
    //   url: "https://rpc.quai.network/cyprus1",
    //   accounts: [CYPRUS1_PK],
    //   chainId: CHAIN_ID,
    // },
    // Testnet Orchard (Chain ID: 15000)
    cyprus1_testnet: {
      url: "https://orchard.rpc.quai.network",
      accounts: [CYPRUS1_PK],
      chainId: 15000,
    },
    // Local development (Chain ID: 1337)
    local: {
      url: "http://localhost:8610",
      accounts: [CYPRUS1_PK],
      chainId: 1337,
    },
  },

  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
          metadata: {
            bytecodeHash: 'ipfs',
            useLiteralContent: true, // Include the source code in the metadata
          },
          evmVersion: 'london',
        },
      },
      {
        version: '0.8.23',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          metadata: {
            bytecodeHash: 'ipfs',
            useLiteralContent: true,
          },
          evmVersion: 'london',
        },
      },
    ]
  },

  paths: {
    sources: './contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
  
  mocha: {
    timeout: 60000, // Increase timeout for Quai Network
  },
}

