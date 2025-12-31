import { Contract, JsonRpcProvider, keccak256, toUtf8Bytes } from 'quais';

const RPC_URL = 'https://orchard.rpc.quai.network/cyprus1';
const QNS_NFT = '0x00106c60fF55A0D264A481C5bB46bADF19342144';
const QNS_REGISTRY = '0x001AB937c039d0d5c0dC6760275720f89C87fCdE';
const ADDRESS = '0x0002567655a581a53ADf543E25dD384097EA196c';

const QNS_NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function getName(bytes32 node) external view returns (string)",
  "function totalSupply() external view returns (uint256)",
];

const QNS_REGISTRY_ABI = [
  "function ownerOf(bytes32 node) external view returns (address)",
];

async function main() {
  console.log('Checking blockchain for address:', ADDRESS);
  console.log('Using contracts:', { QNS_NFT, QNS_REGISTRY });
  
  const provider = new JsonRpcProvider(RPC_URL, undefined, { usePathing: true });
  const nftContract = new Contract(QNS_NFT, QNS_NFT_ABI, provider);
  const registryContract = new Contract(QNS_REGISTRY, QNS_REGISTRY_ABI, provider);
  
  // Check domain "000256"
  const domainName = '000256';
  const node = keccak256(toUtf8Bytes(domainName));
  console.log('\nChecking domain:', domainName);
  console.log('Node hash:', node);
  
  try {
    const exists = await nftContract.exists(node);
    console.log('Domain exists:', exists);
    
    if (exists) {
      const owner = await registryContract.ownerOf(node);
      console.log('Owner:', owner);
      console.log('Expected:', ADDRESS);
      console.log('Match:', owner.toLowerCase() === ADDRESS.toLowerCase());
      
      const name = await nftContract.getName(node);
      console.log('Stored name:', name);
    }
  } catch (e) {
    console.error('Error checking domain:', e.message);
  }
  
  // Check total supply
  try {
    const totalSupply = await nftContract.totalSupply();
    console.log('\nTotal domains registered:', totalSupply.toString());
  } catch (e) {
    console.error('Error getting total supply:', e.message);
  }
}

main().catch(console.error);
