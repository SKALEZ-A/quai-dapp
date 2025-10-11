"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { checkDomainAvailability, getDomainPrice, registerDomain, getUserDomains } from "@/lib/qns";
import { BrowserProvider } from "quais";

interface DomainInfo {
  name: string;
  available: boolean;
  price?: string;
  priceDisplay?: string;
  owner?: string;
  node?: string;
}

export default function QNSProfilePage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [ownedDomains, setOwnedDomains] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Safe wallet hooks with error handling
  let address: string | null = null;
  let isConnected = false;
  let open = () => {};

  try {
    const account = useAccount();
    const modal = useWeb3Modal();

    address = account.address || null;
    isConnected = account.isConnected || false;
    open = modal.open || (() => {});
  } catch (error) {
    console.warn('Wallet hooks failed to initialize:', error);
  }

  // Direct wallet connection for Quai
  const [directAddress, setDirectAddress] = useState<string | null>(null);
  const [directConnected, setDirectConnected] = useState(false);

  useEffect(() => {
    // Try to get wallet address directly using standard methods
    const checkDirectWallet = async () => {
      try {
        const eth = (globalThis as any)?.ethereum;
        if (eth) {
          // First try to get existing accounts
          try {
            const accounts = await eth.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setDirectAddress(accounts[0]);
              setDirectConnected(true);
              return;
            }
          } catch (ethError) {
            console.log('eth_accounts failed:', ethError);
          }

          // If no accounts, try to request them
          try {
            const accounts = await eth.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
              setDirectAddress(accounts[0]);
              setDirectConnected(true);
            }
          } catch (requestError) {
            console.log('eth_requestAccounts failed:', requestError);
          }
        }
      } catch (error) {
        console.log('Direct wallet check failed:', error);
      }
    };

    checkDirectWallet();
  }, []);

  // Use direct connection if available, fallback to wagmi
  const finalAddress = directAddress || address;
  const finalConnected = directConnected || isConnected;

  useEffect(() => {
    // Check if there's a search query in URL params
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      searchDomainByName(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (finalConnected && finalAddress) {
      loadUserDomains();
    } else {
      setOwnedDomains([]);
    }
  }, [finalConnected, finalAddress]);

  async function loadUserDomains() {
    if (!finalAddress) return;
    try {
      const domains = await getUserDomains(finalAddress);
      setOwnedDomains(domains);
    } catch (err) {
      console.error("Failed to load user domains:", err);
    }
  }

  async function connect() {
    try {
      await open();
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
  }

  async function searchDomainByName(name: string) {
    if (!name.trim()) return;
    setLoading(true);
    try {
      console.log('Starting search for:', name);
      const cleanName = name.toLowerCase().trim();
      console.log('Clean name:', cleanName);
      
      // Check availability on blockchain
      console.log('Checking domain availability...');
      const availability = await checkDomainAvailability(cleanName);
      console.log('Availability result:', availability);
      
      const pricing = getDomainPrice(cleanName);
      console.log('Pricing:', pricing);
      
      const domainInfo = { 
        name: cleanName, 
        available: availability.available, 
        price: pricing.price,
        priceDisplay: pricing.display,
        owner: availability.owner,
        node: availability.node,
      };
      
      console.log('Setting domain info:', domainInfo);
      setDomainInfo(domainInfo);
    } catch (error: any) {
      console.error('Search error:', error);
      alert(`Failed to search domain: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  async function searchDomain() {
    await searchDomainByName(searchQuery);
  }

  async function handleRegisterDomain() {
    if (!finalAddress || !domainInfo) {
      console.log('Missing requirements:', { finalAddress, domainInfo });
      alert("❌ Please connect your wallet and select a domain first.");
      return;
    }

    console.log('Starting domain registration for:', domainInfo.name);
    setRegistering(true);

    try {
      // Check if we're on the correct network first
      const eth = (globalThis as any)?.ethereum;
      if (!eth) {
        alert("❌ Wallet not found. Please install Pelagus wallet.");
        return;
      }

      // Check current network
      console.log('Checking network...');
      const chainId = await eth.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId);

      // Convert hex chainId to decimal for easier comparison
      const chainIdDecimal = parseInt(chainId, 16);
      console.log('Chain ID (decimal):', chainIdDecimal);
      
      // Quai Orchard testnet zone chain IDs:
      // Cyprus-1: 9000, Cyprus-2: 9001, Cyprus-3: 9002
      // Paxos-1: 9100, Paxos-2: 9101, Paxos-3: 9102
      // Hydra-1: 9200, Hydra-2: 9201, Hydra-3: 9202
      const validChainIds = [9000, 9001, 9002, 9100, 9101, 9102, 9200, 9201, 9202];
      
      if (!validChainIds.includes(chainIdDecimal)) {
        console.warn(`Unexpected chain ID: ${chainIdDecimal}. Continuing anyway...`);
        // Don't block - just warn
      }

      console.log('Network check passed');

      // Get signer with proper error handling
      console.log('Creating provider and signer...');
      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();

      const signerAddress = await signer.getAddress();
      console.log('Signer address:', signerAddress);

      // Check balance
      try {
        const balance = await provider.getBalance(signerAddress);
        console.log('Account balance:', balance.toString(), 'wei');
        console.log('Account balance (QI):', (Number(balance) / 1e18).toFixed(4), 'QI');
        
        if (balance === BigInt(0)) {
          alert("❌ Insufficient balance!\n\nYou have 0 QI. Please get testnet QI from:\nhttps://faucet.quai.network/");
          return;
        }
      } catch (balanceError) {
        console.warn('Could not check balance:', balanceError);
      }

      if (signerAddress.toLowerCase() !== finalAddress.toLowerCase()) {
        console.warn('Signer address mismatch:', { signerAddress, finalAddress });
        alert("❌ Wallet address mismatch. Please reconnect your wallet.");
        return;
      }

      // Register domain on blockchain
      console.log('Calling registerDomain function...');
      const result = await registerDomain(domainInfo.name, signer);

      console.log('Registration result:', result);

      if (result.success) {
        alert(`✅ Domain registered successfully!\n\n${domainInfo.name}.qns is now yours!\n\nTransaction: ${result.txHash?.slice(0, 10)}...`);

        // Refresh domain info
        await searchDomainByName(domainInfo.name);

        // Refresh owned domains
        await loadUserDomains();
      } else {
        console.error('Registration failed:', result.error);

        // More specific error messages
        let errorMsg = result.error || 'Unknown error';
        if (errorMsg.includes('insufficient funds')) {
          errorMsg = 'Insufficient QI balance. Get testnet QI from https://faucet.quai.network/';
        } else if (errorMsg.includes('already registered')) {
          errorMsg = 'Domain is already registered';
        } else if (errorMsg.includes('reserved')) {
          errorMsg = 'Domain name is reserved';
        }

        alert(`❌ Registration failed\n\n${errorMsg}`);
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      let errorMessage = error?.message || 'Please try again';

      // Better error handling for common issues
      if (errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction was rejected in your wallet';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient QI balance. Get testnet QI from https://faucet.quai.network/';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMessage.includes('missing revert data')) {
        errorMessage = 'Contract interaction failed. Please check your wallet connection and try again.';
      } else if (errorMessage.includes('nonce')) {
        errorMessage = 'Transaction nonce error. Please reset your wallet or try again.';
      }

      alert(`❌ Registration failed\n\n${errorMessage}`);
    } finally {
      setRegistering(false);
    }
  }

  return (
    <main className="py-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-space-grotesk text-4xl font-bold text-text-primary mb-2">Quai Name Service (QNS)</h1>
        <p className="font-manrope text-gray-400">Register human-readable names on Quai Network</p>
      </div>

      <div className="mb-8 bg-surface border border-border rounded-xl p-6">
        {finalConnected && finalAddress ? (
          <div>
            <div className="text-text-primary font-manrope">
              <span className="text-gray-400">Connected:</span> <span className="font-mono text-primary">{finalAddress.slice(0, 10)}...{finalAddress.slice(-8)}</span>
            </div>
            <div className="mt-3 text-sm text-gray-400">
              <span className="font-medium">Your domains:</span> {ownedDomains.length > 0 ? ownedDomains.join(", ") : "None"}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-gray-400">Connect your wallet to manage and register domains</p>
            <button onClick={connect} className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-space-grotesk font-medium rounded-lg transition-all">
              Connect Wallet
            </button>
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="font-space-grotesk text-2xl font-bold text-text-primary mb-4">Search Domain</h2>
        <div className="flex gap-3 mb-6">
          <input 
            type="text" 
            placeholder="hello" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-gray-500 outline-none focus:border-primary transition-colors" 
            onKeyDown={(e) => e.key === "Enter" && searchDomain()} 
          />
          <button 
            onClick={searchDomain} 
            disabled={loading || !searchQuery.trim()}
            className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-space-grotesk font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {domainInfo && (
          <div className={`border-2 rounded-xl p-6 transition-all ${
            domainInfo.available 
              ? 'border-green-500/30 bg-green-500/5' 
              : 'border-red-500/30 bg-red-500/5'
          }`}>
            <div className="mb-4">
              <h3 className="font-space-grotesk text-3xl font-bold text-text-primary mb-2">
                {domainInfo.name}<span className="text-primary">.qns</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-medium">Status:</span>
                <span className={`font-semibold ${
                  domainInfo.available ? 'text-green-400' : 'text-red-400'
                }`}>
                  {domainInfo.available ? '✓ Available' : '✗ Taken'}
                </span>
              </div>
            </div>

            {domainInfo.available ? (
              <div>
                <div className="bg-surface/50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Registration Type:</span>
                    <span className="text-text-primary font-medium flex items-center gap-2">
                      <span className="text-green-400">⚡</span> Instant Purchase
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-primary font-bold text-2xl">{domainInfo.priceDisplay}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-gray-400">
                      💡 Pay once, own forever. No renewal fees on testnet.
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={handleRegisterDomain} 
                  disabled={!finalAddress || registering}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-space-grotesk font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {registering ? (
                    <>
                      <span className="animate-spin">⏳</span> Processing Transaction...
                    </>
                  ) : (
                    <>
                      <span>⚡</span> Buy Now for {domainInfo.priceDisplay}
                    </>
                  )}
                </button>
                
                {!finalAddress && (
                  <p className="mt-3 text-sm text-center text-gray-400">
                    🔒 Connect your Pelagus wallet to purchase domains
                  </p>
                )}

                {finalAddress && (
                  <p className="mt-3 text-xs text-center text-gray-500">
                    Transaction will be processed on Quai Testnet (Orchard)
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="bg-surface/50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Owner:</span>
                    <span className="text-text-primary font-mono text-sm">{domainInfo.owner?.slice(0, 10)}...{domainInfo.owner?.slice(-8)}</span>
                  </div>
                </div>
                
                <div className="bg-surface/30 rounded-lg p-4 border border-border">
                  <p className="text-sm text-gray-400 mb-2">💡 This domain is registered</p>
                  <p className="text-xs text-gray-500">
                    You can make an offer to the owner through our marketplace (coming soon)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="font-space-grotesk text-2xl font-bold text-text-primary mb-4">⚡ Simple Pricing</h2>
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 mb-6">
          <p className="text-text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <span className="font-semibold">Instant Purchase - No Auctions, No Waiting!</span>
          </p>
          <p className="text-sm text-gray-400">
            Just like Ethereum Name Service (ENS), buy your domain instantly at fixed prices. Own it forever on Quai blockchain!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary transition-colors">
            <div className="text-center">
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-space-grotesk text-lg font-bold text-primary mb-2">3 Characters</h3>
              <p className="text-3xl font-bold text-text-primary mb-1">1,000</p>
              <p className="text-sm text-gray-400">QI</p>
              <p className="text-xs text-gray-500 mt-3">Ultra premium</p>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary transition-colors">
            <div className="text-center">
              <div className="text-3xl mb-2">💠</div>
              <h3 className="font-space-grotesk text-lg font-bold text-primary mb-2">4 Characters</h3>
              <p className="text-3xl font-bold text-text-primary mb-1">500</p>
              <p className="text-sm text-gray-400">QI</p>
              <p className="text-xs text-gray-500 mt-3">Premium</p>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary transition-colors">
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-space-grotesk text-lg font-bold text-primary mb-2">5-7 Characters</h3>
              <p className="text-3xl font-bold text-text-primary mb-1">200</p>
              <p className="text-sm text-gray-400">QI</p>
              <p className="text-xs text-gray-500 mt-3">Standard</p>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-5 hover:border-secondary transition-colors">
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-space-grotesk text-lg font-bold text-secondary mb-2">8+ Characters</h3>
              <p className="text-3xl font-bold text-text-primary mb-1">100</p>
              <p className="text-sm text-gray-400">QI</p>
              <p className="text-xs text-gray-500 mt-3">Affordable</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-space-grotesk text-2xl font-bold text-text-primary mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors">
            <h4 className="font-space-grotesk text-xl font-bold text-text-primary mb-2">🔒 Commit/Reveal</h4>
            <p className="text-sm text-gray-400">
              Prevents front-running attacks on domain registrations
            </p>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors">
            <h4 className="font-space-grotesk text-xl font-bold text-text-primary mb-2">💰 Qi Payments</h4>
            <p className="text-sm text-gray-400">
              Resolve domains to Qi payment codes for easy transactions
            </p>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors">
            <h4 className="font-space-grotesk text-xl font-bold text-text-primary mb-2">🌐 Cross-Chain</h4>
            <p className="text-sm text-gray-400">
              Use your QNS domain across all Quai zones and networks
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
