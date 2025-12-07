// Contract addresses and configuration
// FRESH DEPLOYMENT - October 5, 2025 - Simple/Non-Upgradeable Versions (v2 with name storage) - UPDATED with correct pricing
export const CONTRACTS = {
  QNS_REGISTRY: process.env.NEXT_PUBLIC_QNS_REGISTRY || '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_RESERVED_NAMES: process.env.NEXT_PUBLIC_QNS_RESERVED_NAMES || '0x0023272C07514D2D236f6c6895507DFd26442471',
  QNS_NFT: process.env.NEXT_PUBLIC_QNS_NFT || '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
  QNS_REGISTRAR: process.env.NEXT_PUBLIC_QNS_REGISTRAR || '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b',
  // Legacy contracts (not yet deployed in this fresh deployment)
  QNS_CONTROLLER: process.env.NEXT_PUBLIC_QNS_CONTROLLER_ADDRESS || '',
  QNS_AUCTION_MANAGER: process.env.NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS || '',
  QI_PAYMENT_RESOLVER: process.env.NEXT_PUBLIC_PAYMENT_RESOLVER_ADDRESS || '',
  REVERSE_REGISTRAR: process.env.NEXT_PUBLIC_REVERSE_REGISTRAR_ADDRESS || '',
  SOCIAL_POSTS: process.env.NEXT_PUBLIC_SOCIAL_CONTRACT_ADDRESS || '0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910',
} as const;

// RPC URL should be base URL only - usePathing will add /cyprus1 automatically
export const RPC_URL = process.env.NEXT_PUBLIC_QUAI_TESTNET_RPC || 'https://orchard.rpc.quai.network';

// Contract ABIs - minimal interfaces for needed functions
export const QNS_REGISTRY_ABI = [
  "function ownerOf(bytes32 node) external view returns (address)",
  "function resolverOf(bytes32 node) external view returns (address)",
  "function setOwner(bytes32 node, address owner) external",
] as const;

export const QNS_NFT_ABI = [
  "function exists(bytes32 node) external view returns (bool)",
  "function mint(bytes32 node, address to, string calldata name) external returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getTokenId(bytes32 node) external view returns (uint256)",
  "function getNode(uint256 tokenId) external view returns (bytes32)",
  "function getName(bytes32 node) external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
] as const;

export const QNS_CONTROLLER_ABI = [
  "function computeCommitHash(bytes32 node, address owner, bytes32 secret, uint64 expiresAt) external pure returns (bytes32)",
  "function commit(bytes32 node, address owner, bytes32 secret, uint64 expiresAt) external",
  "function reveal(bytes32 node, address owner, bytes32 secret, uint64 expiresAt) external",
  "function getPending(bytes32 commitHash) external view returns (tuple(address owner, bytes32 secret, uint64 expiresAt))",
] as const;

export const QNS_AUCTION_MANAGER_ABI = [
  "function startAuction(bytes32 node, string calldata name) external",
  "function placeBid(bytes32 node) external payable",
  "function getCurrentPrice(bytes32 node) external view returns (uint256)",
  "function getAuction(bytes32 node) external view returns (tuple(bytes32 node, uint64 startTime, uint64 endTime, uint256 startPrice, uint256 floorPrice, address bidder, uint256 bidAmount, bool settled))",
  "function settleAuction(bytes32 node) external",
] as const;

export const QNS_REGISTRAR_ABI = [
  "function register(string calldata name, bytes32 node) external payable returns (uint256)",
  "function getPrice(string calldata name) external view returns (uint256)",
  "function available(bytes32 node) external view returns (bool)",
  "function registerBatch(string[] calldata names, bytes32[] calldata nodes) external payable returns (uint256[])",
] as const;

// QiPaymentResolver ABI - for resolving domain names to addresses
export const QI_PAYMENT_RESOLVER_ABI = [
  "function resolveNode(bytes32 node) external view returns (string memory qiCode, address primaryAddress, string[] memory supportedChains, bool active)",
  "function resolveQiCode(string calldata qiCode) external view returns (bytes32 node, address primaryAddress, string[] memory supportedChains, bool active)",
  "function getChainAddress(bytes32 node, string calldata chain) external view returns (address)",
  "function isActive(bytes32 node) external view returns (bool)",
  "function getPaymentRecord(bytes32 node) external view returns (string memory qiCode, address primaryAddress, bool active)",
] as const;
