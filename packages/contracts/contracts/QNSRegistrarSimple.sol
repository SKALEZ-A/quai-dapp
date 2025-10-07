// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IQNSNFT {
    function mint(bytes32 node, address to, string calldata name) external returns (uint256);
    function exists(bytes32 node) external view returns (bool);
}

interface IQNSRegistry {
    function setOwner(bytes32 node, address owner) external;
}

interface IQNSReservedNames {
    function isReserved(bytes32 node) external view returns (bool);
}

/**
 * @title QNSRegistrarSimple
 * @notice Simple registrar for instant domain purchases (no upgrade pattern)
 * @dev Perfect for hackathons and testing
 */
contract QNSRegistrarSimple {
    IQNSNFT public qnsNFT;
    IQNSRegistry public registry;
    IQNSReservedNames public reservedNames;
    
    address public admin;
    address public treasury;
    bool public paused;
    
    // Pricing based on name length
    mapping(uint256 => uint256) public pricing;
    
    event DomainRegistered(bytes32 indexed node, string name, address indexed owner, uint256 price);
    event PricingUpdated(uint256 nameLength, uint256 newPrice);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }
    
    constructor(
        address _qnsNFT,
        address _registry,
        address _reservedNames,
        address _treasury
    ) {
        admin = msg.sender;
        qnsNFT = IQNSNFT(_qnsNFT);
        registry = IQNSRegistry(_registry);
        reservedNames = IQNSReservedNames(_reservedNames);
        treasury = _treasury;
        
        // Set default pricing (in wei)
        pricing[3] = 1000 ether;  // 1,000 QI
        pricing[4] = 500 ether;   // 500 QI
        pricing[5] = 200 ether;   // 200 QI
        pricing[6] = 200 ether;   // 200 QI
        pricing[7] = 200 ether;   // 200 QI
    }
    
    function getPrice(string calldata name) public view returns (uint256) {
        uint256 length = bytes(name).length;
        if (pricing[length] > 0) {
            return pricing[length];
        }
        return 100 ether; // Default 100 QI for 8+ chars
    }
    
    function register(
        string calldata name,
        bytes32 node
    ) external payable whenNotPaused returns (uint256 tokenId) {
        require(bytes(name).length >= 3, "Name too short");
        require(!qnsNFT.exists(node), "Already registered");
        require(!reservedNames.isReserved(node), "Reserved");
        
        uint256 price = getPrice(name);
        require(msg.value >= price, "Insufficient payment");
        
        // Mint NFT
        tokenId = qnsNFT.mint(node, msg.sender, name);
        
        // Update registry
        registry.setOwner(node, msg.sender);
        
        // Send to treasury
        if (msg.value > 0) {
            (bool success, ) = treasury.call{value: msg.value}("");
            require(success, "Transfer failed");
        }
        
        emit DomainRegistered(node, name, msg.sender, price);
        
        // Refund excess
        if (msg.value > price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }
    }
    
    function available(bytes32 node) external view returns (bool) {
        return !qnsNFT.exists(node) && !reservedNames.isReserved(node);
    }
    
    function updatePricing(uint256 nameLength, uint256 newPrice) external onlyAdmin {
        require(nameLength >= 3, "Invalid length");
        pricing[nameLength] = newPrice;
        emit PricingUpdated(nameLength, newPrice);
    }
    
    function setPaused(bool _paused) external onlyAdmin {
        paused = _paused;
    }
    
    function updateTreasury(address newTreasury) external onlyAdmin {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
    }
}
