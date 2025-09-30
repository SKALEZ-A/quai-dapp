// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract ReverseRegistrar is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Reverse record: address/chain -> node
    mapping(address => mapping(string => bytes32)) internal _reverseRecords;
    // Node -> list of addresses that point to it
    mapping(bytes32 => address[]) internal _nodeAddresses;

    event ReverseRecordSet(address indexed addr, string chain, bytes32 indexed node);
    event ReverseRecordCleared(address indexed addr, string chain);

    function initialize(address admin) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        _grantRole(ADMIN_ROLE, admin);
    }

    function _authorizeUpgrade(address) internal override onlyRole(ADMIN_ROLE) {}

    function setReverseRecord(bytes32 node, address addr, string calldata chain) external onlyRole(ADMIN_ROLE) {
        require(addr != address(0), "Invalid address");
        require(node != bytes32(0), "Invalid node");

        // Clear old reverse record if it exists
        bytes32 oldNode = _reverseRecords[addr][chain];
        if (oldNode != bytes32(0)) {
            _removeAddressFromNode(oldNode, addr);
        }

        _reverseRecords[addr][chain] = node;
        _nodeAddresses[node].push(addr);

        emit ReverseRecordSet(addr, chain, node);
    }

    function clearReverseRecord(address addr, string calldata chain) external onlyRole(ADMIN_ROLE) {
        bytes32 node = _reverseRecords[addr][chain];
        if (node != bytes32(0)) {
            delete _reverseRecords[addr][chain];
            _removeAddressFromNode(node, addr);
            emit ReverseRecordCleared(addr, chain);
        }
    }

    function _removeAddressFromNode(bytes32 node, address addr) internal {
        address[] storage addresses = _nodeAddresses[node];
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == addr) {
                addresses[i] = addresses[addresses.length - 1];
                addresses.pop();
                break;
            }
        }
    }

    function resolveAddress(address addr, string calldata chain) external view returns (bytes32) {
        return _reverseRecords[addr][chain];
    }

    function getAddressesForNode(bytes32 node) external view returns (address[] memory) {
        return _nodeAddresses[node];
    }

    function hasReverseRecord(address addr, string calldata chain) external view returns (bool) {
        return _reverseRecords[addr][chain] != bytes32(0);
    }

    function getReverseRecord(address addr, string calldata chain) external view returns (bytes32) {
        return _reverseRecords[addr][chain];
    }
}
