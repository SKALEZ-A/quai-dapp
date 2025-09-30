// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract QiPaymentResolver is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Payment record structure
    struct PaymentRecord {
        string qiCode;           // Qi payment code (e.g., "qi123456")
        address primaryAddress;  // Primary receiving address
        mapping(string => address) addresses; // Chain-specific addresses
        string[] supportedChains; // List of supported chains
        bool active;             // Whether this payment record is active
    }

    // Node hash to payment record
    mapping(bytes32 => PaymentRecord) internal _paymentRecords;
    // Qi code to node hash (for reverse lookup)
    mapping(string => bytes32) internal _qiCodeToNode;

    event PaymentRecordSet(bytes32 indexed node, string qiCode, address primaryAddress);
    event PaymentRecordUpdated(bytes32 indexed node, string qiCode);
    event AddressAdded(bytes32 indexed node, string chain, address addr);
    event PaymentRecordDeactivated(bytes32 indexed node);

    function initialize(address admin) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        _grantRole(ADMIN_ROLE, admin);
    }

    function _authorizeUpgrade(address) internal override onlyRole(ADMIN_ROLE) {}

    function setPaymentRecord(
        bytes32 node,
        string calldata qiCode,
        address primaryAddress
    ) external onlyRole(ADMIN_ROLE) {
        require(primaryAddress != address(0), "Invalid primary address");
        require(bytes(qiCode).length > 0, "Qi code cannot be empty");
        require(_qiCodeToNode[qiCode] == bytes32(0), "Qi code already in use");

        // Clean up old record if it exists
        PaymentRecord storage oldRecord = _paymentRecords[node];
        if (bytes(oldRecord.qiCode).length > 0) {
            delete _qiCodeToNode[oldRecord.qiCode];
        }

        PaymentRecord storage record = _paymentRecords[node];
        record.qiCode = qiCode;
        record.primaryAddress = primaryAddress;
        record.active = true;

        _qiCodeToNode[qiCode] = node;

        emit PaymentRecordSet(node, qiCode, primaryAddress);
    }

    function addChainAddress(bytes32 node, string calldata chain, address addr) external onlyRole(ADMIN_ROLE) {
        require(_paymentRecords[node].active, "Payment record not active");
        require(addr != address(0), "Invalid address");
        require(bytes(chain).length > 0, "Chain cannot be empty");

        PaymentRecord storage record = _paymentRecords[node];
        if (record.addresses[chain] == address(0)) {
            record.supportedChains.push(chain);
        }
        record.addresses[chain] = addr;

        emit AddressAdded(node, chain, addr);
    }

    function deactivatePaymentRecord(bytes32 node) external onlyRole(ADMIN_ROLE) {
        require(_paymentRecords[node].active, "Payment record not active");

        PaymentRecord storage record = _paymentRecords[node];
        delete _qiCodeToNode[record.qiCode];
        record.active = false;

        emit PaymentRecordDeactivated(node);
    }

    function resolveQiCode(string calldata qiCode) external view returns (
        bytes32 node,
        address primaryAddress,
        string[] memory supportedChains,
        bool active
    ) {
        node = _qiCodeToNode[qiCode];
        if (node == bytes32(0)) {
            return (bytes32(0), address(0), new string[](0), false);
        }

        PaymentRecord storage record = _paymentRecords[node];
        return (node, record.primaryAddress, record.supportedChains, record.active);
    }

    function resolveNode(bytes32 node) external view returns (
        string memory qiCode,
        address primaryAddress,
        string[] memory supportedChains,
        bool active
    ) {
        PaymentRecord storage record = _paymentRecords[node];
        return (record.qiCode, record.primaryAddress, record.supportedChains, record.active);
    }

    function getChainAddress(bytes32 node, string calldata chain) external view returns (address) {
        return _paymentRecords[node].addresses[chain];
    }

    function isActive(bytes32 node) external view returns (bool) {
        return _paymentRecords[node].active;
    }

    function qiCodeExists(string calldata qiCode) external view returns (bool) {
        return _qiCodeToNode[qiCode] != bytes32(0);
    }

    function getPaymentRecord(bytes32 node) external view returns (
        string memory qiCode,
        address primaryAddress,
        bool active
    ) {
        PaymentRecord storage record = _paymentRecords[node];
        return (record.qiCode, record.primaryAddress, record.active);
    }
}
