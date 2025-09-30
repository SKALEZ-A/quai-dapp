import { defineChain } from 'viem';

// Interface for a Quai chain specification
export interface QuaiChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
}

// Factory function to create a Viem chain definition
export function createQuaiChain({ name, chainId, rpcUrl, explorerUrl }: QuaiChainConfig) {
  return defineChain({
    id: chainId,
    name: name,
    nativeCurrency: {
      decimals: 18,
      name: 'Quai',
      symbol: 'QUAI',
    },
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
    blockExplorers: {
      default: { name: `${name} Explorer`, url: explorerUrl },
    },
  });
}

// Master configuration for the entire Quai Network
export const quaiNetworkConfigs: QuaiChainConfig[] = [
  // Mainnet - Cyprus-1
  {
    name: 'Quai Mainnet (Cyprus-1)',
    chainId: 9,
    rpcUrl: 'https://rpc.quai.network/cyprus1',
    explorerUrl: 'https://quaiscan.io',
  },
  // Testnet - Orchard (Cyprus-1)
  {
    name: 'Quai Testnet (Orchard)',
    chainId: 15000,
    rpcUrl: 'https://orchard.rpc.quai.network/cyprus1',
    explorerUrl: 'https://orchard.quaiscan.io',
  },
];