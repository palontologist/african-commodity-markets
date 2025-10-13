// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CommodityOracle
 * @notice Price oracle for commodity markets on Polygon
 * @dev Stores commodity prices with confidence scores and timestamps
 */
contract CommodityOracle is Ownable {
    struct PriceData {
        uint64 price;           // Price in cents (247 = $2.47)
        uint8 confidence;       // Confidence score 0-100
        uint256 timestamp;      // Last update timestamp
        address updater;        // Address that last updated
        uint256 updateCount;    // Number of updates
    }
    
    // commodity name => PriceData
    mapping(bytes32 => PriceData) public prices;
    
    // List of authorized oracle updaters
    mapping(address => bool) public authorizedUpdaters;
    
    // Maximum age for price to be considered fresh (1 hour)
    uint256 public constant MAX_PRICE_AGE = 1 hours;
    
    event PriceUpdated(
        bytes32 indexed commodity,
        uint64 price,
        uint8 confidence,
        uint256 timestamp,
        address indexed updater
    );
    
    event UpdaterAuthorized(address indexed updater);
    event UpdaterRevoked(address indexed updater);
    
    constructor() Ownable(msg.sender) {
        authorizedUpdaters[msg.sender] = true;
    }
    
    /**
     * @notice Update commodity price
     * @param commodity Commodity identifier (e.g., keccak256("COFFEE"))
     * @param price Price in cents
     * @param confidence Confidence score 0-100
     */
    function updatePrice(
        bytes32 commodity,
        uint64 price,
        uint8 confidence
    ) external {
        require(authorizedUpdaters[msg.sender], "Unauthorized");
        require(confidence <= 100, "Invalid confidence");
        require(price > 0, "Invalid price");
        
        PriceData storage data = prices[commodity];
        data.price = price;
        data.confidence = confidence;
        data.timestamp = block.timestamp;
        data.updater = msg.sender;
        data.updateCount++;
        
        emit PriceUpdated(commodity, price, confidence, block.timestamp, msg.sender);
    }
    
    /**
     * @notice Get current price for a commodity
     * @param commodity Commodity identifier
     * @return price Price in cents
     * @return confidence Confidence score
     * @return timestamp Last update timestamp
     */
    function getPrice(bytes32 commodity) 
        external 
        view 
        returns (uint64 price, uint8 confidence, uint256 timestamp) 
    {
        PriceData memory data = prices[commodity];
        require(data.timestamp > 0, "Price not available");
        require(!isStale(commodity), "Price is stale");
        
        return (data.price, data.confidence, data.timestamp);
    }
    
    /**
     * @notice Check if price is stale
     * @param commodity Commodity identifier
     * @return True if price is older than MAX_PRICE_AGE
     */
    function isStale(bytes32 commodity) public view returns (bool) {
        PriceData memory data = prices[commodity];
        if (data.timestamp == 0) return true;
        return block.timestamp - data.timestamp > MAX_PRICE_AGE;
    }
    
    /**
     * @notice Authorize an address to update prices
     * @param updater Address to authorize
     */
    function authorizeUpdater(address updater) external onlyOwner {
        require(updater != address(0), "Invalid address");
        authorizedUpdaters[updater] = true;
        emit UpdaterAuthorized(updater);
    }
    
    /**
     * @notice Revoke authorization from an address
     * @param updater Address to revoke
     */
    function revokeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit UpdaterRevoked(updater);
    }
}
