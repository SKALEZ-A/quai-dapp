"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { checkDomainAvailability, getDomainPrice, registerDomain, getUserDomains, formatDomainName, stripDomainSuffix, resolveDomainToAddress, sendFundsToDomain } from "@/lib/qns";
import { BrowserProvider } from "quais";
import { getOnchainPrice } from "@/lib/qns";

interface DomainInfo {
  name: string;
  available: boolean;
  price?: string;
  priceDisplay?: string;
  owner?: string;
  node?: string;
  onchainPriceWei?: string;
  onchainPriceDisplay?: string;
}

export default function QNSProfilePage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [ownedDomains, setOwnedDomains] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Payment-to-domain state
  const [paymentDomain, setPaymentDomain] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [sending, setSending] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  
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

  // Payment-to-domain functions
  async function resolvePaymentDomain(domain: string) {
    if (!domain.trim()) {
      setResolvedAddress(null);
      return;
    }
    
    setResolving(true);
    try {
      const result = await resolveDomainToAddress(domain);
      if (result.success && result.address) {
        setResolvedAddress(result.address);
      } else {
        setResolvedAddress(null);
      }
    } catch (error) {
      console.error('Domain resolution failed:', error);
      setResolvedAddress(null);
    } finally {
      setResolving(false);
    }
  }

  async function sendPaymentToDomain() {
    if (!paymentDomain.trim() || !paymentAmount.trim() || !resolvedAddress) {
      setPaymentStatus('❌ Please enter a valid domain and amount');
      return;
    }

    const finalAddress = address || directAddress;
    if (!finalAddress) {
      setPaymentStatus('❌ Please connect your wallet first');
      return;
    }

    setSending(true);
    setPaymentStatus('🔄 Preparing transaction...');
    
    try {
      const eth = (globalThis as any)?.ethereum;
      if (!eth) {
        throw new Error('Wallet provider not found. Please ensure Pelagus wallet is installed and unlocked.');
      }

      // Explicitly request account access so Pelagus authorizes this dapp for transactions
      setPaymentStatus('🔄 Requesting wallet authorization...');
      try {
        const accounts = await eth.request({ method: 'eth_requestAccounts' });
        if (!accounts || !accounts.length) {
          throw new Error('Wallet not authorized. Please connect and approve this site in Pelagus.');
        }
      } catch (authError: any) {
        console.error('Wallet authorization failed:', authError);
        throw new Error(authError?.message || 'Wallet authorization failed');
      }

      console.log('🔵 Creating provider and getting signer...');
      const provider = new BrowserProvider(eth);
      
      // Verify network connection
      try {
        const network = await provider.getNetwork();
        console.log('✅ Connected to network:', network.chainId.toString());
        setPaymentStatus(`🔄 Connected to network (Chain ID: ${network.chainId.toString()})`);
      } catch (netError) {
        console.warn('⚠️ Could not verify network:', netError);
      }
      
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log('✅ Signer address:', signerAddress);
      
      // Verify signer has balance
      setPaymentStatus('🔄 Checking balance...');
      const balance = await provider.getBalance(signerAddress);
      const balanceInQi = Number(balance) / 1e18;
      console.log('💰 Account balance:', balanceInQi.toFixed(4), 'QI');
      
      const amountInQi = parseFloat(paymentAmount);
      if (balanceInQi < amountInQi) {
        throw new Error(`Insufficient balance. You have ${balanceInQi.toFixed(4)} QI but need ${amountInQi} QI`);
      }
      
      setPaymentStatus(`🔄 Sending ${paymentAmount} QI to ${paymentDomain}...`);
      console.log('🔵 Calling sendFundsToDomain...');
      
      const result = await sendFundsToDomain(paymentDomain, paymentAmount, signer, {
        onProgress: (status: string) => {
          console.log('📊 Progress:', status);
          setPaymentStatus(`🔄 ${status}`);
        }
      });

      if (result.success) {
        console.log('✅ Payment successful!', result);
        setPaymentStatus(`✅ Payment sent successfully!\n\nTransaction: ${result.txHash}\nTo: ${result.resolvedAddress}`);
        
        // Clear form after 3 seconds
        setTimeout(() => {
          setPaymentDomain("");
          setPaymentAmount("");
          setResolvedAddress(null);
        }, 3000);
      } else {
        console.error('❌ Payment failed:', result.error);
        setPaymentStatus(`❌ Payment failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      const errorMsg = error?.message || error?.reason || 'Unknown error occurred';
      setPaymentStatus(`❌ Payment failed: ${errorMsg}`);
    } finally {
      setSending(false);
    }
  }

  async function searchDomainByName(name: string) {
    if (!name.trim()) return;
    setLoading(true);
    try {
      console.log('Starting search for:', name);
      const cleanName = stripDomainSuffix(name); // Strip .quai suffix for blockchain queries
      console.log('Clean name (for blockchain):', cleanName);
      
      // Check availability on blockchain
      console.log('Checking domain availability...');
      const availability = await checkDomainAvailability(cleanName);
      console.log('Availability result:', availability);
      
      // Fetch on-chain price (read-only provider via window.ethereum if available)
      let onchainPriceDisplay = undefined as string | undefined;
      let onchainPriceWei = undefined as string | undefined;
      try {
        const eth = (globalThis as any)?.ethereum;
        if (eth) {
          const provider = new BrowserProvider(eth);
          const { priceWei, priceDisplay } = await getOnchainPrice(cleanName, provider);
          onchainPriceDisplay = priceDisplay;
          onchainPriceWei = priceWei.toString();
        }
      } catch (priceError) {
        console.warn('Could not fetch on-chain price:', priceError);
      }
      
      const pricing = getDomainPrice(cleanName);
      console.log('Local pricing (fallback):', pricing);
      
      const domainInfo = { 
        name: formatDomainName(cleanName), // Display with .quai suffix
        available: availability.available, 
        price: pricing.price,
        priceDisplay: onchainPriceDisplay || pricing.display,
        owner: availability.owner,
        node: availability.node,
        onchainPriceWei,
        onchainPriceDisplay,
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

  const [registrationStatus, setRegistrationStatus] = useState<string>('');
  const [registrationError, setRegistrationError] = useState<string>('');

  async function handleRegisterDomain() {
    if (!finalAddress || !domainInfo) {
      console.log('Missing requirements:', { finalAddress, domainInfo });
      setRegistrationError("Please connect your wallet and select a domain first.");
      return;
    }

    console.log('Starting domain registration for:', domainInfo.name);
    setRegistering(true);
    setRegistrationError('');
    setRegistrationStatus('Initializing...');

    try {
      // Check if we're on the correct network first
      const eth = (globalThis as any)?.ethereum;
      if (!eth) {
        setRegistrationError("Wallet not found. Please install Pelagus wallet.");
        setRegistering(false);
        return;
      }

      // Ensure wallet is unlocked and connected
      setRegistrationStatus('Checking wallet connection...');
      try {
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
          setRegistrationError("Wallet not connected. Please connect your wallet first.");
          setRegistering(false);
          return;
        }
        console.log('Wallet accounts:', accounts);
      } catch (accountError) {
        console.error('Failed to get accounts:', accountError);
        setRegistrationError("Failed to access wallet. Please ensure your wallet is unlocked.");
        setRegistering(false);
        return;
      }

      // Check current network
      setRegistrationStatus('Checking network...');
      const chainId = await eth.request({ method: 'eth_chainId' });
      const chainIdDecimal = parseInt(chainId, 16);
      console.log('Chain ID (decimal):', chainIdDecimal);
      
      // Quai Orchard testnet zone chain IDs
      const validChainIds = [9000, 9001, 9002, 9100, 9101, 9102, 9200, 9201, 9202];
      
      if (!validChainIds.includes(chainIdDecimal)) {
        console.warn(`Unexpected chain ID: ${chainIdDecimal}. Continuing anyway...`);
      }

      // Get signer with proper error handling
      setRegistrationStatus('Connecting to wallet...');
      const provider = new BrowserProvider(eth);
      
      // Verify provider is connected
      const network = await provider.getNetwork();
      console.log('Provider network:', {
        chainId: network.chainId.toString(),
        name: network.name
      });
      
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log('Signer address:', signerAddress);
      
      // Verify signer has a provider
      if (!signer.provider) {
        setRegistrationError("Signer not properly connected to provider. Please reconnect your wallet.");
        setRegistering(false);
        return;
      }

      // Check balance
      setRegistrationStatus('Checking balance...');
      try {
        const balance = await provider.getBalance(signerAddress);
        console.log('Account balance (QI):', (Number(balance) / 1e18).toFixed(4), 'QI');
        
        if (balance === BigInt(0)) {
          setRegistrationError("Insufficient balance! You have 0 QI. Get testnet QI from: https://faucet.quai.network/");
          setRegistering(false);
          return;
        }
      } catch (balanceError) {
        console.warn('Could not check balance:', balanceError);
      }

      if (signerAddress.toLowerCase() !== finalAddress.toLowerCase()) {
        console.warn('Signer address mismatch:', { signerAddress, finalAddress });
        setRegistrationError("Wallet address mismatch. Please reconnect your wallet.");
        setRegistering(false);
        return;
      }

      // Register domain on blockchain with progress callback
      console.log('Calling registerDomain function...');
      const cleanName = stripDomainSuffix(domainInfo.name); // Strip .quai suffix for registration
      const result = await registerDomain(cleanName, signer, {
        maxRetries: 3,
        validateFirst: true,
        onProgress: (status: string) => {
          console.log('Progress:', status);
          setRegistrationStatus(status);
        }
      });

      console.log('Registration result:', result);

      if (result.success) {
        setRegistrationStatus('Success! Domain registered.');
        alert(`✅ Domain registered successfully!\n\n${domainInfo.name} is now yours!\n\nTransaction: ${result.txHash?.slice(0, 10)}...`);

        // Refresh domain info
        await searchDomainByName(domainInfo.name);

        // Refresh owned domains
        await loadUserDomains();
      } else {
        console.error('Registration failed:', result.error);
        const errorMsg = result.error || 'Unknown error';
        setRegistrationError(errorMsg);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.message || 'Please try again';
      setRegistrationError(errorMessage);
    } finally {
      setRegistering(false);
      if (!registrationError) {
        setTimeout(() => setRegistrationStatus(''), 3000);
      }
    }
  }

  return (
    <main className="py-6 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="font-space-grotesk text-4xl font-bold text-text-primary mb-2">Quai Name Service (QNS)</h1>
        <p className="font-manrope text-gray-400">Register human-readable names on Quai Network</p>
      </div>

      <div className="mb-8 bg-surface border border-border rounded-xl p-6">
        {finalConnected && finalAddress ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-text-primary font-manrope">
              <span className="text-gray-400">Connected:</span> <span className="font-mono text-primary">{finalAddress.slice(0, 10)}...{finalAddress.slice(-8)}</span>
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-medium">Your .quai domains:</span> <span className="block sm:inline">{ownedDomains.length > 0 ? ownedDomains.map(d => formatDomainName(d)).join(", ") : "None"}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-gray-400">Connect your wallet to manage and register domains</p>
            <button onClick={connect} className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-space-grotesk font-medium rounded-lg transition-all">
              Connect Wallet
            </button>
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="font-space-grotesk text-2xl font-bold text-text-primary mb-4">Search Domain</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input 
            type="text" 
            placeholder="skalez" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-gray-500 outline-none focus:border-primary transition-colors w-full"
            onKeyDown={(e) => e.key === "Enter" && searchDomain()} 
          />
          <button 
            onClick={searchDomain} 
            disabled={loading || !searchQuery.trim()}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-space-grotesk font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h3 className="font-space-grotesk text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                {domainInfo.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-gray-400">Registration Type:</span>
                    <span className="text-text-primary font-medium flex items-center gap-2">
                      <span className="text-green-400">⚡</span> Instant Purchase
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-primary font-bold text-xl sm:text-2xl">{domainInfo.onchainPriceDisplay || domainInfo.priceDisplay}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-gray-400">
                      💡 Pay once, own forever. No renewal fees on testnet.
                    </p>
                  </div>
                </div>
                
                {/* Registration Status */}
                {registrationStatus && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400 flex items-center gap-2">
                      <span className="animate-pulse">⏳</span>
                      {registrationStatus}
                    </p>
                  </div>
                )}

                {/* Registration Error */}
                {registrationError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <span>❌</span>
                      {registrationError}
                    </p>
                  </div>
                )}

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

                {finalAddress && !registering && !registrationStatus && (
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
        <h2 className="font-space-grotesk text-xl sm:text-2xl font-bold text-text-primary mb-4">⚡ Simple Pricing</h2>
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4 sm:p-6 mb-6">
          <p className="text-text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <span className="font-semibold">Instant Purchase - No Auctions, No Waiting!</span>
          </p>
          <p className="text-sm text-gray-400">
            Just like Ethereum Name Service (ENS), buy your domain instantly at fixed prices. Own it forever on Quai blockchain!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 hover:border-primary transition-colors">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">💎</div>
              <h3 className="font-space-grotesk text-lg font-bold text-primary mb-2">3 Characters</h3>
              <p className="text-3xl font-bold text-text-primary mb-1">1,000</p>
              <p className="text-sm text-gray-400">QI</p>
              <p className="text-xs text-gray-500 mt-3">Premium +</p>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 hover:border-[#00C853] transition-colors">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">💠</div>
              <h3 className="font-space-grotesk text-lg font-bold text-[#00C853] mb-2">4 Characters</h3>
              <p className="text-3xl font-bold text-text-primary mb-1">500</p>
              <p className="text-sm text-gray-400">QI</p>
              <p className="text-xs text-gray-500 mt-3">Premium</p>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 hover:border-[#2962FF] transition-colors">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">⭐</div>
              <h3 className="font-space-grotesk text-lg font-bold text-[#2962FF] mb-2">5-7 Characters</h3>
              <p className="text-3xl font-bold text-text-primary mb-1">200</p>
              <p className="text-sm text-gray-400">QI</p>
              <p className="text-xs text-gray-500 mt-3">Standard</p>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 hover:border-secondary transition-colors">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">⚡</div>
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

      {/* Payment-to-Domain Section */}
      <div className="bg-surface border border-border rounded-lg p-6 mt-6">
        <h2 className="font-space-grotesk text-2xl font-bold text-text-primary mb-4">Send QUAI to .quai Domain</h2>
        <p className="text-gray-400 mb-6">
          Send QUAI directly to any .quai domain name - just like sending to an address!
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Domain Name
            </label>
            <input
              type="text"
              placeholder="skalez.quai"
              value={paymentDomain}
              onChange={(e) => {
                setPaymentDomain(e.target.value);
                resolvePaymentDomain(e.target.value);
              }}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-gray-500 outline-none focus:border-primary transition-colors"
            />
            {resolving && (
              <p className="text-sm text-gray-400 mt-1">Resolving domain...</p>
            )}
            {resolvedAddress && (
              <p className="text-sm text-green-400 mt-1">
                ✓ Resolves to: {resolvedAddress.slice(0, 10)}...{resolvedAddress.slice(-8)}
              </p>
            )}
            {paymentDomain.trim() && !resolvedAddress && !resolving && (
              <p className="text-sm text-red-400 mt-1">
                ✗ Domain not found or not registered
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Amount (QUAI)
            </label>
            <input
              type="number"
              placeholder="1.0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-gray-500 outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <button
            onClick={sendPaymentToDomain}
            disabled={!resolvedAddress || !paymentAmount.trim() || sending}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {sending ? 'Sending...' : 'Send Payment'}
          </button>
          
          {paymentStatus && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-300">{paymentStatus}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
