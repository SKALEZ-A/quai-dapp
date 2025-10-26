"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QI_PAYMENT_RESOLVER_ABI = exports.QNS_REGISTRAR_ABI = exports.QNS_AUCTION_MANAGER_ABI = exports.QNS_CONTROLLER_ABI = exports.QNS_NFT_ABI = exports.QNS_REGISTRY_ABI = exports.RPC_URL = exports.CONTRACTS = void 0;
// Contract addresses and configuration
// FRESH DEPLOYMENT - October 5, 2025 - Simple/Non-Upgradeable Versions (v2 with name storage) - UPDATED with correct pricing
exports.CONTRACTS = {
    QNS_REGISTRY: process.env.NEXT_PUBLIC_QNS_REGISTRY || '0x001AB937c039d0d5c0dC6760275720f89C87fCdE',
    QNS_RESERVED_NAMES: process.env.NEXT_PUBLIC_QNS_RESERVED_NAMES || '0x00629264745465e0A56A9EdAaEB0B4B9DE719aff',
    QNS_NFT: process.env.NEXT_PUBLIC_QNS_NFT || '0x00106c60fF55A0D264A481C5bB46bADF19342144',
    QNS_REGISTRAR: process.env.NEXT_PUBLIC_QNS_REGISTRAR || '0x0054100a03BE551B4a39f0Fea5cC83699171BFDE',
    // Legacy contracts (not yet deployed in this fresh deployment)
    QNS_CONTROLLER: process.env.NEXT_PUBLIC_QNS_CONTROLLER_ADDRESS || '',
    QNS_AUCTION_MANAGER: process.env.NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS || '',
    QI_PAYMENT_RESOLVER: process.env.NEXT_PUBLIC_PAYMENT_RESOLVER_ADDRESS || '',
    REVERSE_REGISTRAR: process.env.NEXT_PUBLIC_REVERSE_REGISTRAR_ADDRESS || '',
    SOCIAL_POSTS: process.env.NEXT_PUBLIC_SOCIAL_CONTRACT_ADDRESS || '0x004362b17499d3e7FEc9Da9eFA2bcBd2d3D1D910',
};
// RPC URL should be base URL only - usePathing will add /cyprus1 automatically
exports.RPC_URL = process.env.NEXT_PUBLIC_QUAI_TESTNET_RPC || 'https://orchard.rpc.quai.network';
// Contract ABIs - minimal interfaces for needed functions
exports.QNS_REGISTRY_ABI = [
    "function ownerOf(bytes32 node) external view returns (address)",
    "function resolverOf(bytes32 node) external view returns (address)",
    "function setOwner(bytes32 node, address owner) external",
];
exports.QNS_NFT_ABI = [
    "function exists(bytes32 node) external view returns (bool)",
    "function mint(bytes32 node, address to, string calldata name) external returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function getTokenId(bytes32 node) external view returns (uint256)",
    "function getNode(uint256 tokenId) external view returns (bytes32)",
    "function getName(bytes32 node) external view returns (string)",
    "function totalSupply() external view returns (uint256)",
    "function transferFrom(address from, address to, uint256 tokenId) external",
];
exports.QNS_CONTROLLER_ABI = [
    "function computeCommitHash(bytes32 node, address owner, bytes32 secret, uint64 expiresAt) external pure returns (bytes32)",
    "function commit(bytes32 node, address owner, bytes32 secret, uint64 expiresAt) external",
    "function reveal(bytes32 node, address owner, bytes32 secret, uint64 expiresAt) external",
    "function getPending(bytes32 commitHash) external view returns (tuple(address owner, bytes32 secret, uint64 expiresAt))",
];
exports.QNS_AUCTION_MANAGER_ABI = [
    "function startAuction(bytes32 node, string calldata name) external",
    "function placeBid(bytes32 node) external payable",
    "function getCurrentPrice(bytes32 node) external view returns (uint256)",
    "function getAuction(bytes32 node) external view returns (tuple(bytes32 node, uint64 startTime, uint64 endTime, uint256 startPrice, uint256 floorPrice, address bidder, uint256 bidAmount, bool settled))",
    "function settleAuction(bytes32 node) external",
];
exports.QNS_REGISTRAR_ABI = [
    "function register(string calldata name, bytes32 node) external payable returns (uint256)",
    "function getPrice(string calldata name) external view returns (uint256)",
    "function available(bytes32 node) external view returns (bool)",
    "function registerBatch(string[] calldata names, bytes32[] calldata nodes) external payable returns (uint256[])",
];
// QiPaymentResolver ABI - for resolving domain names to addresses
exports.QI_PAYMENT_RESOLVER_ABI = [
    "function resolveNode(bytes32 node) external view returns (string memory qiCode, address primaryAddress, string[] memory supportedChains, bool active)",
    "function resolveQiCode(string calldata qiCode) external view returns (bytes32 node, address primaryAddress, string[] memory supportedChains, bool active)",
    "function getChainAddress(bytes32 node, string calldata chain) external view returns (address)",
    "function isActive(bytes32 node) external view returns (bool)",
    "function getPaymentRecord(bytes32 node) external view returns (string memory qiCode, address primaryAddress, bool active)",
];
