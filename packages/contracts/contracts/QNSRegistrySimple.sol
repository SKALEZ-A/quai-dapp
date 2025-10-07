// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title QNSRegistrySimple
 * @notice Non-upgradeable version of QNSRegistry for easier deployment
 */
contract QNSRegistrySimple is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Record { address owner; address resolver; uint64 ttl; }
    mapping(bytes32 => Record) internal records; // node => record

    event OwnerChanged(bytes32 indexed node, address owner);
    event ResolverChanged(bytes32 indexed node, address resolver);
    event TTLChanged(bytes32 indexed node, uint64 ttl);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function setOwner(bytes32 node, address owner) external onlyRole(ADMIN_ROLE) {
        records[node].owner = owner;
        emit OwnerChanged(node, owner);
    }

    function setResolver(bytes32 node, address resolver) external onlyRole(ADMIN_ROLE) {
        records[node].resolver = resolver;
        emit ResolverChanged(node, resolver);
    }

    function setTTL(bytes32 node, uint64 ttl) external onlyRole(ADMIN_ROLE) {
        records[node].ttl = ttl;
        emit TTLChanged(node, ttl);
    }

    // Owner-controlled functions (allows domain owners to manage their domains)
    modifier onlyOwner(bytes32 node) {
        require(records[node].owner == msg.sender, "Not the owner");
        _;
    }

    function setResolverByOwner(bytes32 node, address resolver) external onlyOwner(node) {
        records[node].resolver = resolver;
        emit ResolverChanged(node, resolver);
    }

    function setTTLByOwner(bytes32 node, uint64 ttl) external onlyOwner(node) {
        records[node].ttl = ttl;
        emit TTLChanged(node, ttl);
    }

    function transferOwnership(bytes32 node, address newOwner) external onlyOwner(node) {
        require(newOwner != address(0), "Invalid new owner");
        records[node].owner = newOwner;
        emit OwnerChanged(node, newOwner);
    }

    function ownerOf(bytes32 node) external view returns (address) { return records[node].owner; }
    function resolverOf(bytes32 node) external view returns (address) { return records[node].resolver; }
    function ttlOf(bytes32 node) external view returns (uint64) { return records[node].ttl; }
}
