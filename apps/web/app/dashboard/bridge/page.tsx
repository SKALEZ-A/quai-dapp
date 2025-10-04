"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import type { config, WormholeConnectTheme } from '@wormhole-foundation/wormhole-connect';

// Import Wormhole Connect dynamically to avoid SSR issues
const WormholeConnect = dynamic(
  () => import('@wormhole-foundation/wormhole-connect'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }
);

export default function DashboardBridgePage() {
  // Wormhole Connect configuration for Quai Network
  const wormholeConfig: config.WormholeConnectConfig = {
    network: 'Mainnet',
    
    // Configure supported chains including major networks
    chains: [
      'Ethereum',
      'Solana', 
      'Polygon',
      'Bsc',
      'Avalanche',
      'Base',
      'Arbitrum',
      'Optimism',
      'Sui',
      'Aptos'
    ],
    
    // UI customization
    ui: {
      title: 'Quai Network Bridge',
      defaultInputs: {
        source: { chain: 'Ethereum' },
        destination: { chain: 'Solana' }
      }
    },
    
    // Custom RPC endpoints (optional - add for better performance)
    rpcs: {
      // Ethereum: process.env.NEXT_PUBLIC_ETHEREUM_RPC,
      // Solana: process.env.NEXT_PUBLIC_SOLANA_RPC,
    },
    
    // Custom tokens configuration for $QUAI and $QI
    tokensConfig: {
      QUAI: {
        symbol: 'QUAI',
        name: 'Quai Token',
        decimals: 18,
        icon: '/assets/logo.png',
        tokenId: {
          chain: 'Ethereum',
          address: '0x0000000000000000000000000000000000000000', // Update after NTT deployment
        },
      },
      QI: {
        symbol: 'QI',
        name: 'Qi Token',
        decimals: 18,
        icon: '/assets/logo.png',
        tokenId: {
          chain: 'Ethereum',
          address: '0x0000000000000000000000000000000000000000', // Update after NTT deployment
        },
      }
    }
  };

  // Custom theme matching your design - using correct Wormhole Connect theme structure
  const wormholeTheme: WormholeConnectTheme = {
    mode: 'dark',
    primary: '#8B1E3F', // Your primary color - simple hex string
    secondary: '#6C3B9E', // Your secondary color - simple hex string
    background: 'dark', // PaletteMode type
    text: '#EDEDED',
    textSecondary: '#A0A0A0',
    error: '#ef4444',
    success: '#22c55e',
    font: 'Space Grotesk, sans-serif'
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-left mb-2">
        <h1 className="text-4xl font-extrabold font-space-grotesk mb-2 text-white">
          Bridge & Multi-Chain Assets
        </h1>
        <p className="text-md text-gray-400">
          Seamlessly transfer your assets across 40+ blockchains powered by Wormhole
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-[#8B1E3F]/10 to-[#6C3B9E]/10 border border-[#8B1E3F]/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8B1E3F]/20 flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-[#8B1E3F]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              Powered by Wormhole NTT
            </h3>
            <p className="text-xs text-gray-400">
              Wormhole's Native Token Transfer (NTT) standard enables seamless, secure cross-chain transfers 
              without wrapped assets. Your tokens ($QUAI & $QI) maintain their native properties across all supported chains.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="flex flex-col gap-2 bg-black/50 rounded-md p-4 border border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-900/30 text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Supported Chains</span>
          </div>
          <p className="text-2xl font-bold font-space-grotesk text-white">40+</p>
        </div>

        <div className="flex flex-col gap-2 bg-black/50 rounded-md p-4 border border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-900/30 text-purple-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Total Volume</span>
          </div>
          <p className="text-2xl font-bold font-space-grotesk text-white">$60B+</p>
        </div>

        <div className="flex flex-col gap-2 bg-black/50 rounded-md p-4 border border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-900/30 text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Messages Relayed</span>
          </div>
          <p className="text-2xl font-bold font-space-grotesk text-white">1B+</p>
        </div>
      </div>

      {/* Wormhole Connect Widget */}
      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 min-h-[600px]">
        <WormholeConnect 
          config={wormholeConfig}
          theme={wormholeTheme}
        />
      </div>

      {/* Token Info Section */}
      <div className="bg-gradient-to-r from-[#8B1E3F]/5 to-[#6C3B9E]/5 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Bridge $QUAI & $QI</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-[#8B1E3F]/20 flex items-center justify-center">
              <span className="text-xl font-bold text-[#8B1E3F]">Q</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">$QUAI</p>
              <p className="text-xs text-gray-400">Programmable store of value</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-[#6C3B9E]/20 flex items-center justify-center">
              <span className="text-xl font-bold text-[#6C3B9E]">Qi</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">$QI</p>
              <p className="text-xs text-gray-400">Decentralized energy dollar</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          ⚠️ Note: Custom token support will be enabled after NTT deployment. Currently bridging standard tokens.
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="bg-black/30 rounded-lg p-5 border border-gray-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#8B1E3F]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#8B1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Secure & Trustless</h3>
              <p className="text-sm text-gray-400">
                Protected by Wormhole's Guardian network with 19+ validators ensuring maximum security
              </p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-5 border border-gray-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#6C3B9E]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#6C3B9E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Fast Transfers</h3>
              <p className="text-sm text-gray-400">
                Native token transfers with automatic relaying for the best user experience
              </p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-5 border border-gray-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Low Fees</h3>
              <p className="text-sm text-gray-400">
                Competitive fees with no hidden costs - only pay network gas fees
              </p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-5 border border-gray-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Native Tokens</h3>
              <p className="text-sm text-gray-400">
                No wrapped tokens - your assets maintain their native properties across chains
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-[#8B1E3F]/5 to-[#6C3B9E]/5 rounded-lg p-6 border border-gray-800 mt-2">
        <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="https://wormhole.com/docs/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Wormhole Documentation
          </a>
          <a 
            href="https://discord.gg/wormholecrypto" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Discord Support
          </a>
          <a 
            href="https://qu.ai/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quai Docs
          </a>
        </div>
      </div>
    </div>
  );
}
