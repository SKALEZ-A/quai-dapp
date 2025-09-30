import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { defineChain } from 'viem';
import { quaiNetworkConfigs, createQuaiChain } from './quaiChains';

// 1. Create Viem chain definitions from quaiNetworkConfigs
const chains = quaiNetworkConfigs.map(createQuaiChain) as any;

// 2. Your WalletConnect projectId
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '0e5376d27efba595b9c6f53802fcad58';

// 3. DApp metadata
const metadata = {
  name: 'Quai Superapp',
  description: 'Social + QNS + Bridge on Quai',
  url: 'https://app.quai.network', // must match your domain
  icons: ['https://app.quai.network/icon.png'],
};

// 4. Create wagmiConfig supporting injected wallets and WalletConnect v2
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableInjected: true,
  enableWalletConnect: true,
  enableEIP6963: true,
  enableCoinbase: false,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  // 5. Configure the modal to ONLY show wallet options
  featuredWalletIds: ['metaMask', 'pelagus'], // Optional: Show specific wallets first. Empty means default order.
  allWallets: 'HIDE', // Hides the "All Wallets" button which is a gateway to email/social
  enableAnalytics: true,
  enableOnramp: false, // Assuming you don't want on-ramp functionality either
  // 6. Explicitly list the wallet connectors you want to allow
  // 'injected' refers to browser extension wallets like MetaMask, Frame, etc.
  connectorImages: {
    // You can provide custom logos for your connectors here if needed
    // injected: '/images/metamask-logo.png',
  },
  // This is a crucial setting to hide the email/social options
  // It ensures only extension and mobile linking is available
})
