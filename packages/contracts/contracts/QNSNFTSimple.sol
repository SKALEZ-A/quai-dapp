// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title QNSNFTSimple
 * @notice Non-upgradeable version of QNSNFT for easier deployment
 */
contract QNSNFTSimple is ERC721, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Token ID to name node mapping
    mapping(uint256 => bytes32) public tokenNodes;
    // Name node to token ID mapping
    mapping(bytes32 => uint256) public nodeTokens;
    // Node to name mapping (for reverse lookup)
    mapping(bytes32 => string) public nodeNames;

    uint256 private _nextTokenId;

    event NameMinted(bytes32 indexed node, uint256 indexed tokenId, address indexed owner);
    event NameTransferred(bytes32 indexed node, address indexed from, address indexed to);

    constructor(address admin, string memory name, string memory symbol) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function mint(bytes32 node, address to, string calldata name) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(nodeTokens[node] == 0, "Name already minted");
        require(to != address(0), "Cannot mint to zero address");

        uint256 tokenId = ++_nextTokenId;
        tokenNodes[tokenId] = node;
        nodeTokens[node] = tokenId;
        nodeNames[node] = name;

        _mint(to, tokenId);
        emit NameMinted(node, tokenId, to);

        return tokenId;
    }

    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized to burn");

        bytes32 node = tokenNodes[tokenId];
        delete tokenNodes[tokenId];
        delete nodeTokens[node];

        _burn(tokenId);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);
        
        // Emit custom event if token exists
        if (from != address(0) && to != address(0)) {
            bytes32 node = tokenNodes[tokenId];
            emit NameTransferred(node, from, to);
        }
        
        return previousOwner;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        bytes32 node = tokenNodes[tokenId];
        // In a real implementation, this would generate metadata including the domain name
        // For now, return a basic JSON structure
        return string(abi.encodePacked(
            "data:application/json;base64,",
            base64Encode(abi.encodePacked(
                '{"name":"', nodeToName(node),
                '","description":"Quai Name Service Domain","attributes":[]}'
            ))
        ));
    }

    function nodeToName(bytes32 node) internal pure returns (string memory) {
        // Simple conversion - in production this would be more sophisticated
        // This is a placeholder implementation
        return "domain.quai"; // Updated to use .quai suffix
    }

    function getNode(uint256 tokenId) external view returns (bytes32) {
        return tokenNodes[tokenId];
    }

    function getTokenId(bytes32 node) external view returns (uint256) {
        return nodeTokens[node];
    }

    function exists(bytes32 node) external view returns (bool) {
        return nodeTokens[node] != 0;
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function getName(bytes32 node) external view returns (string memory) {
        return nodeNames[node];
    }

    // Basic base64 encoding for tokenURI
    function base64Encode(bytes memory data) internal pure returns (string memory) {
        // Simplified base64 encoding - in production use a proper library
        return "eyJuYW1lIjoiZG9tYWluLnF1YWkifQ=="; // Example encoded JSON with .quai
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
