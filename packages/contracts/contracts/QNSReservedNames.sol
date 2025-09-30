// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract QNSReservedNames is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");

    struct ReservedEntry {
        address claimant;     // Address authorized to claim this name
        bool claimed;         // Whether the name has been claimed
        uint64 claimDeadline; // Deadline for claiming (optional)
    }

    mapping(bytes32 => ReservedEntry) public reservedNames; // node => reservation data
    mapping(address => uint256) public claimCount; // claimant => number of claims

    event NameReserved(bytes32 indexed node, address indexed claimant, uint64 claimDeadline);
    event NameClaimed(bytes32 indexed node, address indexed claimant);
    event ReservationRevoked(bytes32 indexed node);

    function initialize(address admin) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(CURATOR_ROLE, admin);
    }

    function _authorizeUpgrade(address) internal override onlyRole(ADMIN_ROLE) {}

    function reserveName(bytes32 node, address claimant, uint64 claimDeadline) external onlyRole(CURATOR_ROLE) {
        require(reservedNames[node].claimant == address(0), "Name already reserved");
        require(claimant != address(0), "Invalid claimant address");

        reservedNames[node] = ReservedEntry({
            claimant: claimant,
            claimed: false,
            claimDeadline: claimDeadline
        });

        emit NameReserved(node, claimant, claimDeadline);
    }

    function claimReservedName(bytes32 node) external {
        ReservedEntry storage entry = reservedNames[node];
        require(entry.claimant == msg.sender, "Not authorized to claim this name");
        require(!entry.claimed, "Name already claimed");

        if (entry.claimDeadline > 0) {
            require(block.timestamp <= entry.claimDeadline, "Claim deadline expired");
        }

        entry.claimed = true;
        claimCount[msg.sender]++;

        emit NameClaimed(node, msg.sender);
    }

    function revokeReservation(bytes32 node) external onlyRole(CURATOR_ROLE) {
        delete reservedNames[node];
        emit ReservationRevoked(node);
    }

    function isReserved(bytes32 node) external view returns (bool) {
        return reservedNames[node].claimant != address(0);
    }

    function isClaimed(bytes32 node) external view returns (bool) {
        return reservedNames[node].claimed;
    }

    function canClaim(bytes32 node, address claimant) external view returns (bool) {
        ReservedEntry memory entry = reservedNames[node];
        if (entry.claimant != claimant || entry.claimed) return false;
        if (entry.claimDeadline > 0 && block.timestamp > entry.claimDeadline) return false;
        return true;
    }

    function getReservation(bytes32 node) external view returns (ReservedEntry memory) {
        return reservedNames[node];
    }
}
