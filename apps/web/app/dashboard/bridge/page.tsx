"use client";

import React from 'react';

export default function DashboardBridgePage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-left mb-2">
        <h1 className="text-4xl font-extrabold font-space-grotesk mb-2 text-white">
          Bridge QUAI & Multi-Chain Assets
        </h1>
        <p className="text-md text-gray-400">
          Seamlessly transfer $QUAI across all blockchains - powered by Entangle Photon Bridge
        </p>
      </div>

      {/* LIVE Status Banner */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-400 mb-1">
              ✅ QUAI Bridging is LIVE!
            </h3>
            <p className="text-xs text-gray-400">
              $QUAI is now bridgeable across all major chains via Entangle's Photon Bridge (Feb 2025 Integration).
              Connect your Pelagus wallet to start bridging.
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
          <p className="text-2xl font-bold font-space-grotesk text-white">All Chains</p>
        </div>

        <div className="flex flex-col gap-2 bg-black/50 rounded-md p-4 border border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-900/30 text-purple-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Bridge Protocol</span>
          </div>
          <p className="text-xl font-bold font-space-grotesk text-white">Entangle UTS</p>
        </div>

        <div className="flex flex-col gap-2 bg-black/50 rounded-md p-4 border border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-900/30 text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Security</span>
          </div>
          <p className="text-xl font-bold font-space-grotesk text-white">Trustless</p>
        </div>
      </div>

      {/* Photon Bridge Embed - QUAI SUPPORTED! */}
      <div className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
        <div className="bg-gradient-to-r from-[#8B1E3F] to-[#6C3B9E] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Photon Bridge</h2>
            <a 
              href="https://photonbridge.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-white/70 hover:text-white transition flex items-center gap-1"
            >
              Open in new tab
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        
        <iframe 
          src="https://photonbridge.io/"
          className="w-full h-[700px] border-0"
          title="Photon Bridge - QUAI Network Cross-Chain Bridge"
          allow="clipboard-write"
          style={{
            colorScheme: 'dark'
          }}
        />
      </div>

      {/* Token Info Section */}
      <div className="bg-gradient-to-r from-[#8B1E3F]/5 to-[#6C3B9E]/5 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Supported Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg border border-green-500/20">
            <div className="w-12 h-12 rounded-full bg-[#8B1E3F]/20 flex items-center justify-center">
              <span className="text-xl font-bold text-[#8B1E3F]">Q</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">$QUAI</p>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-medium rounded-full">LIVE</span>
              </div>
              <p className="text-xs text-gray-400">Programmable store of value - Bridge across all chains</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-[#6C3B9E]/20 flex items-center justify-center">
              <span className="text-xl font-bold text-[#6C3B9E]">Qi</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">$QI</p>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-medium rounded-full">COMING SOON</span>
              </div>
              <p className="text-xs text-gray-400">Decentralized energy dollar</p>
            </div>
          </div>
        </div>
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
                Protected by Entangle's decentralized infrastructure with omnichain messaging
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
              <h3 className="text-lg font-semibold text-white mb-1">Universal Token Standard</h3>
              <p className="text-sm text-gray-400">
                Built on Entangle UTS for seamless token transfers across all virtual machines
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
                Cost-efficient bridging with minimal gas fees across all chains
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
              <h3 className="text-lg font-semibold text-white mb-1">Full Ownership</h3>
              <p className="text-sm text-gray-400">
                Maintain complete control over your tokens and smart contracts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-[#8B1E3F]/5 to-[#6C3B9E]/5 rounded-lg p-6 border border-gray-800 mt-2">
        <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a 
            href="https://docs.entangle.fi/universal-token-standard/developer-guides/bridge-sdk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Entangle Docs
          </a>
          <a 
            href="https://qu.ai/blog/quai-network-announces-strategic-integration-with-entangle/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Integration Announcement
          </a>
          <a 
            href="https://discord.gg/entangle" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Entangle Discord
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

      {/* How It Works */}
      <div className="bg-black/30 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">How Photon Bridge Works</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8B1E3F]/20 flex items-center justify-center text-xs font-bold text-[#8B1E3F]">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-white">Connect Your Wallet</p>
              <p className="text-xs text-gray-400">Use Pelagus Wallet or any compatible Web3 wallet</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8B1E3F]/20 flex items-center justify-center text-xs font-bold text-[#8B1E3F]">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-white">Select Source & Destination Chains</p>
              <p className="text-xs text-gray-400">Choose from all EVM and non-EVM chains supported by Entangle</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8B1E3F]/20 flex items-center justify-center text-xs font-bold text-[#8B1E3F]">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-white">Enter Amount & Confirm</p>
              <p className="text-xs text-gray-400">Your $QUAI will be bridged securely via Entangle's Universal Interoperability Protocol</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
