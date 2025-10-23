// QNS blockchain interaction utilities
import { Contract, keccak256, toUtf8Bytes } from 'quais';
import { makeProvider } from './quai';
import { CONTRACTS, RPC_URL, QNS_REGISTRY_ABI, QNS_NFT_ABI, QNS_CONTROLLER_ABI, QNS_AUCTION_MANAGER_ABI, QNS_REGISTRAR_ABI, QI_PAYMENT_RESOLVER_ABI } from './contracts';
import { transactionManager, TransactionResult } from './transactionManager';
import { errorHandler, ErrorCategory } from './errorHandler';

// Helper functions for ether conversion
function parseEther(value: string): bigint {
  return BigInt(Math.floor(parseFloat(value) * 1e18));
}

function formatEther(value: bigint): string {
  return (Number(value) / 1e18).toFixed(4);
}

// Domain pricing based on length - REDUCED for testing
export const PRICING = {
  3: { price: '10', display: '10 QI' },
  4: { price: '5', display: '5 QI' },
  5: { price: '2', display: '2 QI' },
  6: { price: '2', display: '2 QI' },
  7: { price: '2', display: '2 QI' },
  default: { price: '1', display: '1 QI' },
} as const;

export function getDomainPrice(name: string): { price: string; display: string; needsAuction: boolean } {
  const length = name.length;
  
  // 3-7 chars can use auction OR instant buy
  // 8+ chars are instant buy only
  const needsAuction = length >= 3 && length <= 7 ? false : false; // We're making instant buy default
  
  if (length >= 3 && length <= 7) {
    const pricing = PRICING[length as 3 | 4 | 5 | 6 | 7];
    return { ...pricing, needsAuction };
  }
  
  return { ...PRICING.default, needsAuction };
}


// Convert domain name to node hash (namehash)
export function nameToNode(name: string): string {
  // Simple implementation - full namehash would be more complex
  const label = name.toLowerCase();
  return keccak256(toUtf8Bytes(label));
}

// Check if domain is available
export async function checkDomainAvailability(name: string): Promise<{
  available: boolean;
  owner?: string;
  node: string;
}> {
  try {
    console.log('Checking domain availability for:', name);
    console.log('RPC URL:', RPC_URL);
    console.log('NFT Contract:', CONTRACTS.QNS_NFT);
    console.log('Registry Contract:', CONTRACTS.QNS_REGISTRY);
    
    const provider = makeProvider(RPC_URL);
    const nftContract = new Contract(CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    const registryContract = new Contract(CONTRACTS.QNS_REGISTRY, QNS_REGISTRY_ABI, provider);
    const registrarContract = new Contract(CONTRACTS.QNS_REGISTRAR, QNS_REGISTRAR_ABI, provider);
    
    const node = nameToNode(name);
    console.log('Node hash:', node);
    
    // Add timeout to contract calls
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Contract call timeout')), 10000); // 10 second timeout
    });

    // Primary: use registrar.available
    let isAvailable: boolean | undefined;
    try {
      console.log('Calling available() on Registrar...');
      isAvailable = await Promise.race([
        registrarContract.available(node),
        timeoutPromise
      ]) as boolean;
    } catch (primaryErr) {
      console.warn('Registrar.available failed, falling back to NFT.exists:', (primaryErr as any)?.message);
    }

    // Fallback: use NFT.exists if registrar check failed
    if (typeof isAvailable === 'undefined') {
      console.log('Calling exists() on NFT contract as fallback...');
      const exists = await Promise.race([
        nftContract.exists(node),
        timeoutPromise
      ]) as boolean;
      isAvailable = !exists;
    }

    if (!isAvailable) {
      // Get owner from registry (best effort)
      let owner: string | undefined = undefined;
      try {
        console.log('Getting owner from registry...');
        owner = await Promise.race([
          registryContract.ownerOf(node),
          timeoutPromise
        ]) as string;
        console.log('Domain owner:', owner);
      } catch (ownerErr) {
        console.warn('Failed to fetch owner for taken domain:', (ownerErr as any)?.message);
      }

      return {
        available: false,
        owner,
        node,
      };
    }
    
    console.log('Domain appears available');
    return {
      available: true,
      node,
    };
  } catch (error: any) {
    console.error('Error checking availability:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      reason: error?.reason,
    });
    
    // Do NOT default to available=true on timeouts; surface error instead
    throw new Error(`Failed to check domain availability: ${error?.message || 'Unknown error'}`);
  }
}

export async function getOnchainPrice(
  name: string,
  providerOrSigner: any
): Promise<{ priceWei: bigint; priceDisplay: string }> {
  const registrar = new Contract(CONTRACTS.QNS_REGISTRAR, QNS_REGISTRAR_ABI, providerOrSigner);
  const priceWei: bigint = await registrar.getPrice(name);
  const priceDisplay = formatEther(priceWei) + ' QI';
  return { priceWei, priceDisplay };
}

/**
 * Validate registration before attempting transaction
 */
export async function validateRegistration(
  name: string,
  userAddress: string,
  signer: any
): Promise<{
  canRegister: boolean;
  issues: string[];
  estimatedGas?: bigint;
  estimatedCost?: string;
}> {
  const issues: string[] = [];

  try {
    if (!CONTRACTS.QNS_REGISTRAR) {
      issues.push('QNS Registrar not deployed');
      return { canRegister: false, issues };
    }

    const node = nameToNode(name);
    const registrarContract = new Contract(CONTRACTS.QNS_REGISTRAR, QNS_REGISTRAR_ABI, signer);

    // Get on-chain price
    const priceWei: bigint = await registrarContract.getPrice(name);

    // Check balance
    const balance = await signer.provider.getBalance(userAddress);
    if (balance < priceWei) {
      issues.push(`Insufficient balance. Need ${formatEther(priceWei)} QI but have ${formatEther(balance)} QI`);
    }

    // Check availability
    const isAvailable = await registrarContract.available(node);
    if (!isAvailable) {
      issues.push('Domain not available or reserved');
    }

    // Try to estimate gas
    let estimatedGas: bigint | undefined;
    try {
      estimatedGas = await registrarContract.register.estimateGas(name, node, { value: priceWei });
    } catch (gasError: any) {
      console.warn('Gas estimation failed during validation:', gasError?.message);
    }

    return {
      canRegister: issues.length === 0,
      issues,
      estimatedGas,
      estimatedCost: formatEther(priceWei) + ' QI'
    };

  } catch (error: any) {
    errorHandler.logError(error, {
      operation: 'validateRegistration',
      domainName: name,
      userAddress
    }, 'warn');

    issues.push(`Validation error: ${error?.message || 'Unknown error'}`);
    return { canRegister: false, issues };
  }
}

// Register domain directly (instant purchase) - Enhanced version
export async function registerDomain(
  name: string,
  signer: any,
  options?: {
    maxRetries?: number;
    validateFirst?: boolean;
    onProgress?: (status: string) => void;
  }
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const opts = {
    maxRetries: 3,
    validateFirst: true,
    onProgress: (status: string) => console.log(status),
    ...options
  };

  try {
    opts.onProgress('Starting domain registration...');

    if (!CONTRACTS.QNS_REGISTRAR) {
      const error = 'QNS Registrar not deployed yet. Please redeploy contracts.';
      errorHandler.logError(new Error(error), {
        operation: 'registerDomain',
        domainName: name
      }, 'error');
      return { success: false, error };
    }

    const userAddress = await signer.getAddress();
    const node = nameToNode(name);

    const registrarContract = new Contract(CONTRACTS.QNS_REGISTRAR, QNS_REGISTRAR_ABI, signer);

    // Fetch on-chain price and use it for tx value
    const priceWei: bigint = await registrarContract.getPrice(name);

    try {
      const network = await signer.provider?.getNetwork();
      console.log('Network info:', {
        chainId: network?.chainId?.toString(),
        name: network?.name
      });
    } catch (netError) {
      console.warn('Could not get network info:', netError);
    }

    console.log('Domain registration details:', {
      name,
      node,
      price: priceWei.toString(),
      priceDisplay: formatEther(priceWei) + ' QI',
      userAddress,
      contractAddress: CONTRACTS.QNS_REGISTRAR
    });

    if (!registrarContract.runner) {
      const error = 'Contract not connected to signer';
      console.error('❌ Contract runner is null');
      return { success: false, error };
    }

    if (opts.validateFirst) {
      opts.onProgress('Validating registration...');
      const validation = await validateRegistration(name, userAddress, signer);

      if (!validation.canRegister) {
        const error = validation.issues.join('; ');
        errorHandler.logError(new Error(error), {
          operation: 'registerDomain',
          domainName: name,
          userAddress,
          validationIssues: validation.issues
        }, 'warn');
        return { success: false, error };
      }

      console.log('Pre-flight validation passed');
    }

    // Execute transaction with on-chain price
    opts.onProgress('Preparing transaction...');

    console.log('🔵 About to call transactionManager.executeTransaction with:', {
      contract: CONTRACTS.QNS_REGISTRAR,
      method: 'register',
      args: [name, node],
      value: priceWei.toString(),
      maxRetries: opts.maxRetries
    });

    const result = await transactionManager.executeTransaction(
      registrarContract,
      'register',
      [name, node],
      {
        maxRetries: opts.maxRetries,
        onProgress: opts.onProgress,
        value: priceWei,
        gasLimitMultiplier: 1.5
      }
    );

    if (result.success) {
      console.log('Domain registered successfully:', result.txHash);
      return {
        success: true,
        txHash: result.txHash
      };
    } else {
      const errorMsg = result.error?.userMessage || 'Registration failed';
      const suggestion = result.error?.suggestion;
      const fullError = suggestion ? `${errorMsg} ${suggestion}` : errorMsg;

      return {
        success: false,
        error: fullError
      };
    }

  } catch (error: any) {
    const parsed = errorHandler.parseError(error, {
      operation: 'registerDomain',
      domainName: name,
      contractAddress: CONTRACTS.QNS_REGISTRAR
    });

    errorHandler.logError(error, {
      operation: 'registerDomain',
      domainName: name
    }, 'error');

    const errorMsg = parsed.userMessage;
    const suggestion = parsed.suggestion;
    const fullError = suggestion ? `${errorMsg} ${suggestion}` : errorMsg;

    return {
      success: false,
      error: fullError
    };
  }
}

// Get user's domains
export async function getUserDomains(address: string): Promise<string[]> {
  try {
    console.log('Fetching domains for address:', address);
    const provider = makeProvider(RPC_URL);
    const nftContract = new Contract(CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    const registryContract = new Contract(CONTRACTS.QNS_REGISTRY, QNS_REGISTRY_ABI, provider);

    const userDomains: string[] = [];

    // First attempt: query NameMinted events filtered by owner
    try {
      // Event signature: NameMinted(bytes32 indexed node, uint256 indexed tokenId, address indexed owner)
      const eventSig = 'NameMinted(bytes32,uint256,address)';
      const topic0 = keccak256(toUtf8Bytes(eventSig));
      const ownerTopic = '0x' + '0'.repeat(24) + address.toLowerCase().replace(/^0x/, '');

      const fromBlock = 0; // full history on testnet; adjust if needed
      const toBlock: any = 'latest';

      console.log('Querying logs for NameMinted events...', { topic0, ownerTopic, fromBlock, toBlock });
      const logs = await provider.getLogs({
        address: CONTRACTS.QNS_NFT,
        topics: [topic0, null, null, ownerTopic],
        fromBlock,
        toBlock
      } as any);

      console.log('Found logs:', logs.length);

      const seenNodes = new Set<string>();
      for (const log of logs) {
        try {
          const node = log.topics?.[1];
          if (!node || seenNodes.has(node)) continue;
          seenNodes.add(node);

          // Verify current owner still matches (in case of transfer)
          let currentOwner: string | undefined;
          try {
            currentOwner = await registryContract.ownerOf(node);
          } catch (e) {
            console.warn('ownerOf(node) failed, skipping owner verification');
          }
          if (currentOwner && currentOwner.toLowerCase() !== address.toLowerCase()) {
            continue;
          }

          // Fetch display name
          let domainName: string | undefined;
          try {
            domainName = await nftContract.getName(node);
          } catch (e) {
            console.warn('getName(node) failed for', node);
          }
          if (domainName && domainName.length > 0 && !userDomains.includes(domainName)) {
            userDomains.push(domainName);
          }
        } catch (inner) {
          console.warn('Error processing log:', (inner as any)?.message);
        }
      }

      if (userDomains.length > 0) {
        console.log('Domains from logs:', userDomains);
        return userDomains;
      }
    } catch (logsError) {
    }

    // Fallback: scan token IDs (best-effort, may be slow/inaccurate)
    console.log('Falling back to token scan...');
    
    // Add timeout to contract calls
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Contract call timeout')), 15000); // 15 second timeout
    });

    // Try to get total supply first
    let totalSupply = 0n;
    try {
      const ts = await Promise.race([
        nftContract.totalSupply(),
        timeoutPromise
      ]) as bigint;
      totalSupply = ts;
      console.log('Total supply:', totalSupply.toString());
    } catch (error) {
      console.log('totalSupply() failed, using range approach:', error);
      totalSupply = 0n;
    }

    console.log('Checking token IDs...');

    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 20;
    const supplyNum = Number(totalSupply);
    const maxTokensToCheck = Math.min(supplyNum + 200, 3000); // widen slightly

    // Include tokenId 0 as some ERC721 start at 0
    for (let tokenId = 0; tokenId <= maxTokensToCheck; tokenId++) {
      try {
        // Try to get owner from NFT contract first
        let owner;
        try {
          owner = await Promise.race([
            nftContract.ownerOf(tokenId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
          ]) as string;
        } catch (nftError) {
          // If NFT contract fails, try registry contract via node
          try {
            const node = await Promise.race([
              nftContract.getNode(tokenId),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]) as string;
            owner = await Promise.race([
              registryContract.ownerOf(node),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]) as string;
          } catch (registryError) {
            throw nftError; // Use original error
          }
        }

        if (owner && owner.toLowerCase() === address.toLowerCase()) {
          // Get the node for this token
          let node;
          try {
            node = await Promise.race([
              nftContract.getNode(tokenId),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]) as string;
          } catch (nodeError) {
            console.log(`Could not get node for token ${tokenId}:`, nodeError);
            continue;
          }

          // Get the actual domain name
          let domainName;
          try {
            domainName = await Promise.race([
              nftContract.getName(node),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]) as string;
          } catch (nameError) {
            console.log(`Could not get name for node ${node}:`, nameError);
            continue;
          }

          if (domainName && domainName.length > 0 && !userDomains.includes(domainName)) {
            userDomains.push(domainName);
          }
        }

        // Reset consecutive failures counter on success
        consecutiveFailures = 0;

      } catch (error: any) {
        consecutiveFailures++;
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.log(`Stopping after ${maxConsecutiveFailures} consecutive failures`);
          break;
        }
      }
    }

    console.log('Found user domains (fallback):', userDomains);
    return userDomains;
  } catch (error) {
    console.error('Error fetching user domains:', error);
    return [];
  }
}

// Auction-related functions (keep as optional advanced feature)
export async function startDomainAuction(
  name: string,
  signer: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const node = nameToNode(name);
    const auctionContract = new Contract(CONTRACTS.QNS_AUCTION_MANAGER, QNS_AUCTION_MANAGER_ABI, signer);
    
    const tx = await auctionContract.startAuction(node, name);
    await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error: any) {
    console.error('Error starting auction:', error);
    return {
      success: false,
      error: error?.message || 'Failed to start auction',
    };
  }
}

export async function getAuctionInfo(name: string): Promise<{
  exists: boolean;
  currentPrice?: string;
  endTime?: number;
  highestBidder?: string;
}> {
  try {
    const provider = makeProvider(RPC_URL);
    const auctionContract = new Contract(CONTRACTS.QNS_AUCTION_MANAGER, QNS_AUCTION_MANAGER_ABI, provider);
    
    const node = nameToNode(name);
    const auction = await auctionContract.getAuction(node);
    
    if (auction.startTime === 0) {
      return { exists: false };
    }
    
    const currentPrice = await auctionContract.getCurrentPrice(node);
    
    return {
      exists: true,
      currentPrice: formatEther(currentPrice),
      endTime: Number(auction.endTime),
      highestBidder: auction.bidder,
    };
  } catch (error) {
    console.error('Error fetching auction info:', error);
    return { exists: false };
  }
}

export async function placeBid(
  name: string,
  bidAmount: string,
  signer: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const node = nameToNode(name);
    const auctionContract = new Contract(CONTRACTS.QNS_AUCTION_MANAGER, QNS_AUCTION_MANAGER_ABI, signer);
    
    const value = parseEther(bidAmount);
    const tx = await auctionContract.placeBid(node, { value });
    await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error: any) {
    console.error('Error placing bid:', error);
    return {
      success: false,
      error: error?.message || 'Failed to place bid',
    };
  }
}

/**
 * Resolve a QNS domain name to its associated address
 * This is the core function for enabling payments to domain names
 */
export async function resolveDomainToAddress(
  domainName: string,
  providerOrSigner?: any
): Promise<{
  success: boolean;
  address?: string;
  error?: string;
  qiCode?: string;
  active?: boolean;
}> {
  try {
    console.log('Resolving QNS domain:', domainName);
    
    const provider = providerOrSigner?.provider || providerOrSigner || makeProvider(RPC_URL);
    const registryContract = new Contract(CONTRACTS.QNS_REGISTRY, QNS_REGISTRY_ABI, provider);
    const node = nameToNode(domainName);
    
    // First check if the domain exists and get its owner
    let owner: string;
    try {
      owner = await registryContract.ownerOf(node);
      if (!owner || owner === '0x0000000000000000000000000000000000000000') {
        return {
          success: false,
          error: `Domain "${domainName}" is not registered or has no owner`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Domain "${domainName}" not found or not registered`
      };
    }
    
    // Try to get the resolver address for this domain
    let resolverAddress: string;
    try {
      resolverAddress = await registryContract.resolverOf(node);
    } catch (error: any) {
      // If no resolver is set, return the owner address as fallback
      console.log('No resolver set, using owner address:', owner);
      return {
        success: true,
        address: owner
      };
    }
    
    // If we have a payment resolver, try to resolve to the payment address
    if (CONTRACTS.QI_PAYMENT_RESOLVER && resolverAddress === CONTRACTS.QI_PAYMENT_RESOLVER) {
      try {
        const paymentResolver = new Contract(CONTRACTS.QI_PAYMENT_RESOLVER, QI_PAYMENT_RESOLVER_ABI, provider);
        
        // Try to resolve the payment record
        const result = await paymentResolver.resolveNode(node);
        const [qiCode, primaryAddress, , active] = result;
        
        if (active && primaryAddress && primaryAddress !== '0x0000000000000000000000000000000000000000') {
          console.log('Resolved to payment address:', primaryAddress);
          return {
            success: true,
            address: primaryAddress,
            qiCode: qiCode || undefined,
            active
          };
        }
      } catch (resolverError) {
        console.warn('Payment resolver failed, falling back to owner:', resolverError);
      }
    }
    
    // Fallback to owner address if resolver fails or is not set
    console.log('Using owner address as fallback:', owner);
    return {
      success: true,
      address: owner
    };
    
  } catch (error: any) {
    console.error('Error resolving domain:', error);
    return {
      success: false,
      error: `Failed to resolve domain "${domainName}": ${error?.message || 'Unknown error'}`
    };
  }
}

/**
 * Send funds to a QNS domain name
 * This resolves the domain to an address first, then sends the transaction
 */
export async function sendFundsToDomain(
  domainName: string,
  amountInQi: string,
  signer: any,
  options?: {
    onProgress?: (status: string) => void;
    maxRetries?: number;
  }
): Promise<{
  success: boolean;
  txHash?: string;
  resolvedAddress?: string;
  error?: string;
}> {
  const opts = {
    onProgress: (status: string) => console.log(status),
    maxRetries: 3,
    ...options
  };
  
  try {
    opts.onProgress('Resolving domain name...');
    
    // First resolve the domain to an address
    const resolution = await resolveDomainToAddress(domainName, signer);
    
    if (!resolution.success) {
      return {
        success: false,
        error: resolution.error
      };
    }
    
    if (!resolution.address) {
      return {
        success: false,
        error: `Could not resolve address for domain "${domainName}"`
      };
    }
    
    opts.onProgress(`Resolved "${domainName}" to ${resolution.address}`);
    
    // Now send the transaction to the resolved address
    const amountWei = parseEther(amountInQi);
    
    opts.onProgress('Sending transaction...');
    
    const tx = await signer.sendTransaction({
      to: resolution.address,
      value: amountWei
    });
    
    opts.onProgress('Waiting for confirmation...');
    await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      resolvedAddress: resolution.address
    };
    
  } catch (error: any) {
    console.error('Error sending funds to domain:', error);
    
    const parsed = errorHandler.parseError(error, {
      operation: 'sendFundsToDomain',
      domainName,
      amountInQi
    });
    
    return {
      success: false,
      error: parsed.userMessage
    };
  }
}
