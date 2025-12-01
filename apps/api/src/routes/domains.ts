import express from 'express';
import { Contract, keccak256, toUtf8Bytes, parseQuai } from 'quais';
import { JsonRpcProvider } from 'quais';

const router = express.Router();

// Contract configuration - using the deployed addresses (synced with frontend contracts.ts)
// IMPORTANT: These must match the frontend contracts in apps/web/src/lib/contracts.ts
const CONTRACTS = {
  QNS_REGISTRY: process.env.QNS_REGISTRY_ADDRESS || '0x001AB937c039d0d5c0dC6760275720f89C87fCdE',
  QNS_NFT: process.env.QNS_NFT_ADDRESS || '0x00106c60fF55A0D264A481C5bB46bADF19342144',
  QNS_REGISTRAR: process.env.QNS_REGISTRAR_ADDRESS || '0x0054100a03BE551B4a39f0Fea5cC83699171BFDE',
  QNS_RESERVED_NAMES: process.env.QNS_RESERVED_NAMES_ADDRESS || '0x00629264745465e0A56A9EdAaEB0B4B9DE719aff',
};

const RPC_URL = 'https://orchard.rpc.quai.network';

// Contract ABIs
const QNS_REGISTRY_ABI = [
  "function ownerOf(bytes32 node) external view returns (address)",
] as const;

const QNS_NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getTokenId(bytes32 node) external view returns (uint256)",
  "function getNode(uint256 tokenId) external view returns (bytes32)",
  "function getName(bytes32 node) external view returns (string)",
  "function totalSupply() external view returns (uint256)",
] as const;

const QNS_REGISTRAR_ABI = [
  "function register(string calldata name, bytes32 node) external payable returns (uint256)",
  "function getPrice(string calldata name) external view returns (uint256)",
  "function available(bytes32 node) external view returns (bool)",
] as const;

// Helper function to create provider
function makeProvider(rpcUrl: string) {
  return new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });
}

// Helper function to convert name to node hash
function nameToNode(name: string): string {
  const label = name.toLowerCase();
  return keccak256(toUtf8Bytes(label));
}

// Check domain availability
router.get('/check/:name', async (req, res) => {
  try {
    const { name } = req.params;
    console.log('Checking domain availability for:', name);
    
    const provider = makeProvider(RPC_URL);
    const nftContract = new Contract(CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    const registryContract = new Contract(CONTRACTS.QNS_REGISTRY, QNS_REGISTRY_ABI, provider);
    
    const node = nameToNode(name);
    console.log('Node hash:', node);
    
    // Check if NFT exists
    const exists = await nftContract.exists(node);
    console.log('Domain exists:', exists);
    
    if (exists) {
      // Get owner from registry
      const owner = await registryContract.ownerOf(node);
      console.log('Domain owner:', owner);
      return res.json({
        available: false,
        owner,
        node,
      });
    }
    
    return res.json({
      available: true,
      node,
    });
  } catch (error: any) {
    console.error('Error checking domain availability:', error);
    res.status(500).json({ 
      error: 'Failed to check domain availability',
      details: error.message 
    });
  }
});

// Get domain price
router.get('/price/:name', async (req, res) => {
  try {
    const { name } = req.params;
    console.log('Getting price for domain:', name);
    
    const provider = makeProvider(RPC_URL);
    const registrarContract = new Contract(CONTRACTS.QNS_REGISTRAR, QNS_REGISTRAR_ABI, provider);
    
    const price = await registrarContract.getPrice(name);
    console.log('Domain price:', price.toString());
    
    res.json({
      name,
      price: price.toString(),
      priceEther: (Number(price) / 1e18).toFixed(4),
    });
  } catch (error: any) {
    console.error('Error getting domain price:', error);
    res.status(500).json({ 
      error: 'Failed to get domain price',
      details: error.message 
    });
  }
});

// Register domain (backend simulation - requires private key)
router.post('/register', async (req, res) => {
  try {
    const { name, privateKey } = req.body;
    
    if (!name || !privateKey) {
      return res.status(400).json({ 
        error: 'Name and privateKey are required' 
      });
    }
    
    console.log('Registering domain:', name);
    
    const provider = makeProvider(RPC_URL);
    const registrarContract = new Contract(CONTRACTS.QNS_REGISTRAR, QNS_REGISTRAR_ABI, provider);
    
    // Create wallet from private key
    const { Wallet } = await import('quais');
    const wallet = new Wallet(privateKey, provider);
    const registrarWithSigner = registrarContract.connect(wallet);
    
    const node = nameToNode(name);
    
    // Check availability
    const isAvailable = await registrarContract.available(node);
    if (!isAvailable) {
      return res.status(400).json({ 
        error: 'Domain not available or reserved' 
      });
    }
    
    // Get price
    const price = await registrarContract.getPrice(name);
    console.log('Registration price:', price.toString());
    
    // Register domain
    const tx = await (registrarWithSigner as any).register(name, node, { value: price });
    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
    
    res.json({
      success: true,
      txHash: receipt.hash,
      name,
      node,
      price: price.toString(),
    });
  } catch (error: any) {
    console.error('Error registering domain:', error);
    res.status(500).json({ 
      error: 'Failed to register domain',
      details: error.message 
    });
  }
});

// Get user domains
router.get('/user/:address', async (req, res) => {
  try {
    const { address } = req.params;
    console.log('Fetching domains for address:', address);
    
    const provider = makeProvider(RPC_URL);
    const nftContract = new Contract(CONTRACTS.QNS_NFT, QNS_NFT_ABI, provider);
    
    const userDomains: string[] = [];
    
    // Check a reasonable range of token IDs
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 10;
    const maxTokensToCheck = 1000;
    
    for (let tokenId = 1; tokenId <= maxTokensToCheck; tokenId++) {
      try {
        const owner = await nftContract.ownerOf(tokenId);
        
        if (owner.toLowerCase() === address.toLowerCase()) {
          const node = await nftContract.getNode(tokenId);
          const domainName = await nftContract.getName(node);
          if (domainName && domainName.length > 0) {
            userDomains.push(domainName);
          }
        }
        
        consecutiveFailures = 0;
      } catch (error) {
        consecutiveFailures++;
        
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.log(`Stopping after ${maxConsecutiveFailures} consecutive failures`);
          break;
        }
      }
    }
    
    res.json({
      address,
      domains: userDomains,
      count: userDomains.length,
    });
  } catch (error: any) {
    console.error('Error fetching user domains:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user domains',
      details: error.message 
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    contracts: CONTRACTS,
    rpcUrl: RPC_URL 
  });
});

export default router;
