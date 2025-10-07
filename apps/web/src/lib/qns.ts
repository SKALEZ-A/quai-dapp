// QNS blockchain interaction utilities
import { Contract, keccak256, toUtf8Bytes } from 'quais';
import { makeProvider } from './quai';
import { CONTRACTS, RPC_URL, QNS_REGISTRY_ABI, QNS_NFT_ABI, QNS_CONTROLLER_ABI, QNS_AUCTION_MANAGER_ABI, QNS_REGISTRAR_ABI } from './contracts';

// Helper functions for ether conversion
function parseEther(value: string): bigint {
  return BigInt(Math.floor(parseFloat(value) * 1e18));
}

function formatEther(value: bigint): string {
  return (Number(value) / 1e18).toFixed(4);
}

// Domain pricing based on length - Updated to match contract pricing
export const PRICING = {
  3: { price: '0.1', display: '0.1 QI' },
  4: { price: '0.05', display: '0.05 QI' },
  5: { price: '0.02', display: '0.02 QI' },
  6: { price: '0.02', display: '0.02 QI' },
  7: { price: '0.02', display: '0.02 QI' },
  default: { price: '0.01', display: '0.01 QI' },
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
    
    const node = nameToNode(name);
    console.log('Node hash:', node);
    
    // Add timeout to contract calls
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Contract call timeout')), 10000); // 10 second timeout
    });
    
    // Check if NFT exists
    console.log('Calling exists() on NFT contract...');
    const exists = await Promise.race([
      nftContract.exists(node),
      timeoutPromise
    ]) as boolean;
    console.log('Domain exists:', exists);
    
    if (exists) {
      // Get owner from registry
      console.log('Getting owner from registry...');
      const owner = await Promise.race([
        registryContract.ownerOf(node),
        timeoutPromise
      ]) as string;
      console.log('Domain owner:', owner);
      return {
        available: false,
        owner,
        node,
      };
    }
    
    console.log('Domain is available');
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
    
    // Return a default response instead of throwing to prevent UI from getting stuck
    if (error?.message?.includes('timeout')) {
      console.log('Contract call timed out, returning default response');
      return {
        available: true,
        node: nameToNode(name),
      };
    }
    
    throw new Error(`Failed to check domain availability: ${error?.message || 'Unknown error'}`);
  }
}

// Register domain directly (instant purchase)
export async function registerDomain(
  name: string,
  signer: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Check if registrar is configured
    if (!CONTRACTS.QNS_REGISTRAR) {
      return {
        success: false,
        error: 'QNS Registrar not deployed yet. Please redeploy contracts with: cd packages/contracts && npx hardhat run scripts/deploy.ts --network testnet',
      };
    }

    const node = nameToNode(name);
    const registrarContract = new Contract(CONTRACTS.QNS_REGISTRAR, QNS_REGISTRAR_ABI, signer);
    
    console.log('Getting price for domain:', name);
    // Get price from contract
    const price = await registrarContract.getPrice(name);
    console.log('Domain price:', price.toString());
    
    console.log('Checking availability for node:', node);
    // Check availability
    const isAvailable = await registrarContract.available(node);
    console.log('Domain available:', isAvailable);
    
    if (!isAvailable) {
      return { success: false, error: 'Domain not available or reserved' };
    }
    
    console.log('Estimating gas for registration...');
    // Estimate gas first to avoid "missing revert data" error
    let gasEstimate;
    try {
      gasEstimate = await registrarContract.register.estimateGas(name, node, { value: price });
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError: any) {
      console.error('Gas estimation failed:', gasError);
      // If gas estimation fails, try with a higher gas limit
      gasEstimate = BigInt(500000); // Fallback gas limit
      console.log('Using fallback gas limit:', gasEstimate.toString());
    }
    
    console.log('Sending registration transaction...');
    // Register domain through registrar with explicit gas parameters for Quai Network
    const tx = await registrarContract.register(name, node, {
      value: price,
      gasLimit: gasEstimate + BigInt(100000), // Increased buffer for Quai Network
      gasPrice: BigInt(2000000000), // 2 gwei - Quai Network gas price
    });
    
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
    
    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error registering domain:', error);
    
    // Better error messages
    let errorMsg = error?.message || 'Failed to register domain';
    if (errorMsg.includes('user rejected')) {
      errorMsg = 'Transaction rejected by user';
    } else if (errorMsg.includes('insufficient funds')) {
      errorMsg = 'Insufficient QI balance for registration';
    } else if (errorMsg.includes('already registered')) {
      errorMsg = 'Domain already registered';
    } else if (errorMsg.includes('missing revert data')) {
      errorMsg = 'Contract interaction failed. Please check your wallet connection and try again.';
    } else if (errorMsg.includes('estimateGas')) {
      errorMsg = 'Unable to estimate gas. Please ensure you have sufficient QI balance and try again.';
    }
    
    return {
      success: false,
      error: errorMsg,
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

    // Add timeout to contract calls
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Contract call timeout')), 15000); // 15 second timeout
    });

    // Try to get total supply first
    let totalSupply = 0;
    try {
      totalSupply = await Promise.race([
        nftContract.totalSupply(),
        timeoutPromise
      ]) as number;
      console.log('Total supply:', totalSupply.toString());
    } catch (error) {
      console.log('totalSupply() failed, using range approach:', error);
      totalSupply = 1000; // Fallback to checking first 1000 tokens
    }

    console.log('Checking token IDs...');

    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 20; // Increased tolerance
    const maxTokensToCheck = Math.min(Number(totalSupply) + 100, 2000); // Check more tokens

    for (let tokenId = 1; tokenId <= maxTokensToCheck; tokenId++) {
      try {
        // Try to get owner from NFT contract first
        let owner;
        try {
          owner = await Promise.race([
            nftContract.ownerOf(tokenId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
          ]) as string;
        } catch (nftError) {
          // If NFT contract fails, try registry contract
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

        console.log(`Token ${tokenId} owner:`, owner);

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

          console.log(`Token ${tokenId} node:`, node);

          // Get the actual domain name
          let domainName;
          try {
            domainName = await Promise.race([
              nftContract.getName(node),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]) as string;
          } catch (nameError) {
            console.log(`Could not get name for node ${node}:`, nameError);
            // Try alternative method - construct name from node if possible
            continue;
          }

          console.log(`Token ${tokenId} name:`, domainName);
          if (domainName && domainName.length > 0 && !userDomains.includes(domainName)) {
            userDomains.push(domainName);
          }
        }

        // Reset consecutive failures counter on success
        consecutiveFailures = 0;

      } catch (error: any) {
        consecutiveFailures++;
        console.log(`Token ${tokenId} error:`, error?.message || 'Unknown error');

        // If we hit too many consecutive failures, stop checking
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.log(`Stopping after ${maxConsecutiveFailures} consecutive failures`);
          break;
        }
      }
    }

    console.log('Found user domains:', userDomains);
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
