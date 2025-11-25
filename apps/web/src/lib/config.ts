import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { defineChain } from 'viem';
import { quaiNetworkConfigs, createQuaiChain } from './quaiChains';

// 1. Create Viem chain definitions from quaiNetworkConfigs
const chainsList = quaiNetworkConfigs.map(createQuaiChain);
const chains = [chainsList[0], ...chainsList.slice(1)] as const;

// 2. Your WalletConnect projectId
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '0e5376d27efba595b9c6f53802fcad58';

// 3. DApp metadata
const metadata = {
  name: "Synq - Social DApp on Quai",
  description: "Social DApp + QNS + Bridge on Quai",
  url: "http://localhost:3001", // Use localhost for development
  icons: ["/favicon-16x16.png"],
};

// 4. Create wagmiConfig - focus on injected wallets (Pelagus)
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableInjected: true,  // Enable injected wallets (Pelagus)
  enableWalletConnect: false, // Disable WalletConnect for now to avoid conflicts
  enableEIP6963: true,  // Enable EIP-6963 for better wallet detection
  enableCoinbase: false,
});

// 5. Create Web3Modal with Pelagus-focused configuration
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  // Focus on injected wallets for Pelagus compatibility
  allWallets: 'HIDE', // Hide WalletConnect wallets to avoid confusion
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#111928',
    '--w3m-color-mix-strength': 50,
  },
  // Custom wallet configuration for Pelagus
  featuredWalletIds: [], // Don't feature any wallets
});