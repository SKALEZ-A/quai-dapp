// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract QNSNFT is Initializable, UUPSUpgradeable, ERC721Upgradeable, AccessControlUpgradeable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Token ID to name node mapping
    mapping(uint256 => bytes32) public tokenNodes;
    // Name node to token ID mapping
    mapping(bytes32 => uint256) public nodeTokens;

    uint256 private _nextTokenId;

    event NameMinted(bytes32 indexed node, uint256 indexed tokenId, address indexed owner);
    event NameTransferred(bytes32 indexed node, address indexed from, address indexed to);

    function initialize(address admin, string memory name, string memory symbol) public initializer {
        __UUPSUpgradeable_init();
        __ERC721_init(name, symbol);
        __AccessControl_init();

        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function _authorizeUpgrade(address) internal override onlyRole(ADMIN_ROLE) {}

    function mint(bytes32 node, address to) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(nodeTokens[node] == 0, "Name already minted");
        require(to != address(0), "Cannot mint to zero address");

        uint256 tokenId = ++_nextTokenId;
        tokenNodes[tokenId] = node;
        nodeTokens[node] = tokenId;

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

    function transferFrom(address from, address to, uint256 tokenId) public override {
        bytes32 node = tokenNodes[tokenId];
        super.transferFrom(from, to, tokenId);
        emit NameTransferred(node, from, to);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        bytes32 node = tokenNodes[tokenId];
        super.safeTransferFrom(from, to, tokenId);
        emit NameTransferred(node, from, to);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        bytes32 node = tokenNodes[tokenId];
        super.safeTransferFrom(from, to, tokenId, data);
        emit NameTransferred(node, from, to);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

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
        return "domain.qns"; // Would need proper name resolution
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

    // Basic base64 encoding for tokenURI
    function base64Encode(bytes memory data) internal pure returns (string memory) {
        // Simplified base64 encoding - in production use a proper library
        return "eyJuYW1lIjoiZG9tYWluLnFucyJ9"; // Example encoded JSON
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
