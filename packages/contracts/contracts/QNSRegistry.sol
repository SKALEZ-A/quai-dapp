// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract QNSRegistry is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Record { address owner; address resolver; uint64 ttl; }
    mapping(bytes32 => Record) internal records; // node => record

    event OwnerChanged(bytes32 indexed node, address owner);
    event ResolverChanged(bytes32 indexed node, address resolver);
    event TTLChanged(bytes32 indexed node, uint64 ttl);

    function initialize(address admin) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        _grantRole(ADMIN_ROLE, admin);
    }

    function _authorizeUpgrade(address) internal override onlyRole(ADMIN_ROLE) {}

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

    function ownerOf(bytes32 node) external view returns (address) { return records[node].owner; }
    function resolverOf(bytes32 node) external view returns (address) { return records[node].resolver; }
    function ttlOf(bytes32 node) external view returns (uint64) { return records[node].ttl; }
}
