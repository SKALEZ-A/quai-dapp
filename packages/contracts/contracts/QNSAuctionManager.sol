// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract QNSAuctionManager is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable, OwnableUpgradeable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Auction parameters per name length
    struct AuctionParams {
        uint256 startPrice;  // Starting price in QI
        uint256 floorPrice;  // Minimum price (floor)
        uint64 duration;     // Auction duration in seconds
    }

    // Active auction data
    struct Auction {
        bytes32 node;        // Name hash
        uint64 startTime;    // Auction start timestamp
        uint64 endTime;      // Auction end timestamp
        uint256 startPrice;  // Starting price
        uint256 floorPrice;  // Floor price
        address bidder;      // Current highest bidder
        uint256 bidAmount;   // Current bid amount
        bool settled;        // Whether auction has been settled
    }

    mapping(bytes32 => Auction) public auctions; // node => auction
    mapping(uint256 => AuctionParams) public auctionParams; // nameLength => params

    event AuctionStarted(bytes32 indexed node, uint64 startTime, uint64 endTime, uint256 startPrice, uint256 floorPrice);
    event BidPlaced(bytes32 indexed node, address indexed bidder, uint256 amount);
    event AuctionSettled(bytes32 indexed node, address indexed winner, uint256 finalPrice);

    function initialize(address admin) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __Ownable_init(admin);
        _grantRole(ADMIN_ROLE, admin);

        // Set default auction parameters
        _setAuctionParams(3, 20000 ether, 1000 ether, 7 days);  // 3-char names
        _setAuctionParams(4, 10000 ether, 500 ether, 7 days);   // 4-char names
        _setAuctionParams(5, 5000 ether, 200 ether, 7 days);    // 5-char names
        _setAuctionParams(6, 5000 ether, 200 ether, 7 days);    // 6-char names
        _setAuctionParams(7, 5000 ether, 200 ether, 7 days);    // 7-char names
    }

    function _authorizeUpgrade(address) internal override onlyRole(ADMIN_ROLE) {}

    function _setAuctionParams(uint256 length, uint256 startPrice, uint256 floorPrice, uint64 duration) internal {
        auctionParams[length] = AuctionParams(startPrice, floorPrice, duration);
    }

    function setAuctionParams(uint256 length, uint256 startPrice, uint256 floorPrice, uint64 duration) external onlyRole(ADMIN_ROLE) {
        _setAuctionParams(length, startPrice, floorPrice, duration);
    }

    function getCurrentPrice(bytes32 node) public view returns (uint256) {
        Auction memory auction = auctions[node];
        if (auction.startTime == 0) return 0; // No auction

        uint256 elapsed = block.timestamp - auction.startTime;
        if (elapsed >= auction.endTime - auction.startTime) {
            return auction.floorPrice; // Auction ended, return floor price
        }

        // Linear decay from startPrice to floorPrice
        uint256 totalDuration = auction.endTime - auction.startTime;
        uint256 priceRange = auction.startPrice - auction.floorPrice;
        uint256 price = auction.startPrice - (priceRange * elapsed) / totalDuration;

        return price > auction.floorPrice ? price : auction.floorPrice;
    }

    function startAuction(bytes32 node, string calldata name) external whenNotPaused {
        require(auctions[node].startTime == 0, "Auction already exists");

        uint256 nameLength = bytes(name).length;
        require(nameLength >= 3 && nameLength <= 7, "Invalid name length for auction");

        AuctionParams memory params = auctionParams[nameLength];
        require(params.startPrice > 0, "Auction params not set");

        uint64 startTime = uint64(block.timestamp);
        uint64 endTime = startTime + params.duration;

        auctions[node] = Auction({
            node: node,
            startTime: startTime,
            endTime: endTime,
            startPrice: params.startPrice,
            floorPrice: params.floorPrice,
            bidder: address(0),
            bidAmount: 0,
            settled: false
        });

        emit AuctionStarted(node, startTime, endTime, params.startPrice, params.floorPrice);
    }

    function placeBid(bytes32 node) external payable whenNotPaused {
        Auction storage auction = auctions[node];
        require(auction.startTime > 0, "Auction does not exist");
        require(block.timestamp >= auction.startTime, "Auction not started");
        require(block.timestamp <= auction.endTime, "Auction ended");
        require(!auction.settled, "Auction already settled");

        uint256 currentPrice = getCurrentPrice(node);
        require(msg.value >= currentPrice, "Bid too low");

        // Refund previous bidder
        if (auction.bidder != address(0)) {
            payable(auction.bidder).transfer(auction.bidAmount);
        }

        auction.bidder = msg.sender;
        auction.bidAmount = msg.value;

        emit BidPlaced(node, msg.sender, msg.value);
    }

    function settleAuction(bytes32 node) external {
        Auction storage auction = auctions[node];
        require(auction.startTime > 0, "Auction does not exist");
        require(block.timestamp > auction.endTime, "Auction not ended");
        require(!auction.settled, "Auction already settled");

        auction.settled = true;

        if (auction.bidder != address(0)) {
            // Transfer funds to contract owner (or treasury)
            payable(owner()).transfer(auction.bidAmount);
            emit AuctionSettled(node, auction.bidder, auction.bidAmount);
        } else {
            emit AuctionSettled(node, address(0), 0);
        }
    }

    function getAuction(bytes32 node) external view returns (Auction memory) {
        return auctions[node];
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
