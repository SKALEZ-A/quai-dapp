/**
 * CUSTOM PHOTON BRIDGE INTEGRATION (ADVANCED)
 * 
 * This file demonstrates how to build a custom bridge UI using Entangle's SDK
 * if you want more control over the UX instead of embedding the iframe.
 * 
 * To use this approach:
 * 1. Install dependencies: pnpm add @apollo/client@3.8.0-alpha.13 @wagmi/core@2.6.17 wagmi@2.5.13 viem@2.9.4 ethers@^6.11.1
 * 2. Set up environment variables (see .env.example)
 * 3. Clone the Entangle SDK: git clone https://github.com/Entangle-Protocol/uts-bridge-frontend-sdk
 * 4. Copy relevant components from the SDK to your project
 * 5. Configure tokens and networks for QUAI support
 * 
 * For production, the simple iframe embed is recommended unless you need
 * specific customizations that require full control over the bridge logic.
 */

"use client";

import React, { useState } from 'react';

// This is a MOCKUP showing what a custom implementation would look like
// Actual implementation requires the full Entangle SDK setup

interface ChainOption {
  id: number;
  name: string;
  icon: string;
  rpc: string;
}

interface TokenOption {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
}

export default function CustomBridgePage() {
  const [fromChain, setFromChain] = useState<ChainOption | null>(null);
  const [toChain, setToChain] = useState<ChainOption | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);

  // Example configuration for QUAI
  const chains: ChainOption[] = [
    {
      id: 9000,
      name: 'Quai Network',
      icon: '/assets/logo.png',
      rpc: 'https://rpc.quai.network/cyprus1'
    },
    {
      id: 1,
      name: 'Ethereum',
      icon: '/assets/eth.png',
      rpc: 'https://ethereum-rpc.publicnode.com'
    },
    {
      id: 56,
      name: 'BNB Chain',
      icon: '/assets/bnb.png',
      rpc: 'https://bsc-dataseed.binance.org'
    },
    // Add more chains...
  ];

  const tokens: TokenOption[] = [
    {
      symbol: 'QUAI',
      name: 'Quai Token',
      decimals: 18,
      address: 'NATIVE' // Or actual UTS token address
    },
    {
      symbol: 'QI',
      name: 'Qi Token',
      decimals: 18,
      address: 'NATIVE'
    }
  ];

  const handleBridge = async () => {
    // This would use Entangle's bridge SDK
    console.log('Bridge transaction:', { fromChain, toChain, amount, selectedToken });
    
    // Example of what you'd do with the SDK:
    // 1. Connect wallet (wagmi)
    // 2. Approve token spending (if ERC-20)
    // 3. Call Entangle UTS bridge contract
    // 4. Wait for confirmation
    // 5. Track via GraphQL endpoint
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">Custom Bridge Interface</h2>

        {/* From Chain */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">From Chain</label>
          <select 
            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white"
            onChange={(e) => setFromChain(chains.find(c => c.id === Number(e.target.value)) || null)}
          >
            <option value="">Select chain...</option>
            {chains.map(chain => (
              <option key={chain.id} value={chain.id}>{chain.name}</option>
            ))}
          </select>
        </div>

        {/* Token Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Token</label>
          <select 
            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white"
            onChange={(e) => setSelectedToken(tokens.find(t => t.symbol === e.target.value) || null)}
          >
            <option value="">Select token...</option>
            {tokens.map(token => (
              <option key={token.symbol} value={token.symbol}>{token.symbol} - {token.name}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white"
          />
        </div>

        {/* To Chain */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">To Chain</label>
          <select 
            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white"
            onChange={(e) => setToChain(chains.find(c => c.id === Number(e.target.value)) || null)}
          >
            <option value="">Select chain...</option>
            {chains.map(chain => (
              <option key={chain.id} value={chain.id}>{chain.name}</option>
            ))}
          </select>
        </div>

        {/* Bridge Button */}
        <button
          onClick={handleBridge}
          disabled={!fromChain || !toChain || !amount || !selectedToken}
          className="w-full bg-gradient-to-r from-[#8B1E3F] to-[#6C3B9E] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Bridge Tokens
        </button>

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400">
            ⚠️ This is a MOCKUP example. To implement a custom bridge:
          </p>
          <ul className="text-xs text-gray-400 mt-2 space-y-1 ml-4 list-disc">
            <li>Clone Entangle SDK: <code className="bg-black/50 px-1 rounded">git clone https://github.com/Entangle-Protocol/uts-bridge-frontend-sdk</code></li>
            <li>Configure wagmi with Quai Network chain</li>
            <li>Add QUAI token configuration to tokens.ts</li>
            <li>Set up GraphQL endpoint for bridge history tracking</li>
            <li>Implement bridge contract interactions</li>
          </ul>
          <p className="text-xs text-gray-400 mt-2">
            See <code className="bg-black/50 px-1 rounded">PHOTON_BRIDGE_INTEGRATION.md</code> for detailed steps.
          </p>
        </div>
      </div>
    </div>
  );
}

