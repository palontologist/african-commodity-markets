// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CommodityPriceOracle
 * @notice Oracle for reliable commodity price data on-chain
 * @dev Stores price data with confidence scores and timestamps
 */
contract CommodityPriceOracle is Ownable {
    
    // ============ Structs ============
    
    struct PriceData {
        uint256 price;            // Price in cents (e.g., $1.23 = 123)
        uint256 confidence;         // Confidence score 0-100
        uint256 timestamp;         // Last update time
        string source;             // Data source
        address updatedBy;         // Who updated the price
        uint256 volume24h;        // 24h trading volume (optional)
        bool isValid;            // Price validity flag
    }
    
    struct AuthorizedUpdater {
        address account;
        bool authorized;
        uint256 addedAt;
    }
    
    // ============ State Variables ============
    
    mapping(string => PriceData) public prices;
    mapping(address => bool) public authorizedUpdaters;
    
    string[] public supportedCommodities;
    address[] public authorizedUpdaterList;
    
    uint256 public constant STALENESS_THRESHOLD = 3600; // 1 hour in seconds
    uint256 public constant MIN_CONFIDENCE = 50;        // Minimum confidence score
    uint256 public constant PRICE_DECIMALS = 2;           // 2 decimal places for cents
    
    // ============ Events ============
    
    event PriceUpdated(
        string indexed commodity,
        uint256 price,
        uint256 confidence,
        uint256 timestamp,
        string source,
        address indexed updatedBy
    );
    
    event UpdaterAuthorized(
        address indexed account,
        uint256 timestamp,
        address indexed authorizedBy
    );
    
    event UpdaterRevoked(
        address indexed account,
        uint256 timestamp,
        address indexed revokedBy
    );
    
    event CommoditySupported(
        string indexed commodity,
        uint256 timestamp,
        address indexed addedBy
    );
    
    event PriceFlagged(
        string indexed commodity,
        uint256 price,
        uint256 timestamp,
        string reason
    );
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Authorize owner by default
        authorizedUpdaters[msg.sender] = true;
        authorizedUpdaterList.push(msg.sender);
        
        emit UpdaterAuthorized(msg.sender, block.timestamp, msg.sender);
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Update commodity price
     * @param commodity Commodity symbol (e.g., "COPPER")
     * @param price Price in cents (e.g., $123.45 = 12345)
     * @param confidence Confidence score 0-100
     * @param source Data source name
     */
    function updatePrice(
        string memory commodity,
        uint256 price,
        uint256 confidence,
        string memory source
    ) external {
        require(authorizedUpdaters[msg.sender], "Not authorized");
        require(bytes(commodity).length > 0, "Commodity cannot be empty");
        require(price > 0, "Price must be positive");
        require(confidence <= 100, "Confidence must be <= 100");
        require(bytes(source).length > 0, "Source cannot be empty");
        
        // Validate price reasonableness
        if (!_isPriceReasonable(commodity, price)) {
            emit PriceFlagged(commodity, price, block.timestamp, "Unreasonable price");
            return;
        }
        
        prices[commodity] = PriceData({
            price: price,
            confidence: confidence,
            timestamp: block.timestamp,
            source: source,
            updatedBy: msg.sender,
            volume24h: 0, // Can be added later
            isValid: confidence >= MIN_CONFIDENCE
        });
        
        // Add to supported commodities if new
        if (!_isCommoditySupported(commodity)) {
            supportedCommodities.push(commodity);
            emit CommoditySupported(commodity, block.timestamp, msg.sender);
        }
        
        emit PriceUpdated(commodity, price, confidence, block.timestamp, source, msg.sender);
    }
    
    /**
     * @notice Batch update multiple commodity prices
     * @param commodities Array of commodity symbols
     * @param prices Array of prices in cents
     * @param confidences Array of confidence scores
     * @param source Data source name
     */
    function batchUpdatePrices(
        string[] memory commodities,
        uint256[] memory prices,
        uint256[] memory confidences,
        string memory source
    ) external {
        require(authorizedUpdaters[msg.sender], "Not authorized");
        require(
            commodities.length == prices.length && 
            prices.length == confidences.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < commodities.length; i++) {
            try this.updatePrice(commodities[i], prices[i], confidences[i], source) {
                // Continue on success
            } catch {
                // Log and continue with next commodity
                continue;
            }
        }
    }
    
    /**
     * @notice Authorize address to update prices
     * @param account Address to authorize
     */
    function authorizeUpdater(address account) external onlyOwner {
        require(account != address(0), "Invalid address");
        require(!authorizedUpdaters[account], "Already authorized");
        
        authorizedUpdaters[account] = true;
        authorizedUpdaterList.push(account);
        
        emit UpdaterAuthorized(account, block.timestamp, msg.sender);
    }
    
    /**
     * @notice Revoke authorization from address
     * @param account Address to revoke
     */
    function revokeUpdater(address account) external onlyOwner {
        require(authorizedUpdaters[account], "Not authorized");
        
        authorizedUpdaters[account] = false;
        _removeFromUpdaterList(account);
        
        emit UpdaterRevoked(account, block.timestamp, msg.sender);
    }
    
    /**
     * @notice Add supported commodity (owner only)
     * @param commodity Commodity symbol
     */
    function addSupportedCommodity(string memory commodity) external onlyOwner {
        require(bytes(commodity).length > 0, "Commodity cannot be empty");
        require(!_isCommoditySupported(commodity), "Already supported");
        
        supportedCommodities.push(commodity);
        emit CommoditySupported(commodity, block.timestamp, msg.sender);
    }
    
    /**
     * @notice Update staleness threshold (owner only)
     * @param threshold New threshold in seconds
     */
    function updateStalenessThreshold(uint256 threshold) external onlyOwner {
        STALENESS_THRESHOLD = threshold;
    }
    
    /**
     * @notice Update minimum confidence (owner only)
     * @param minConfidence New minimum confidence (0-100)
     */
    function updateMinimumConfidence(uint256 minConfidence) external onlyOwner {
        require(minConfidence <= 100, "Confidence must be <= 100");
        MIN_CONFIDENCE = minConfidence;
    }
    
    /**
     * @notice Update price validity flag manually (owner only)
     * @param commodity Commodity symbol
     * @param isValid Validity flag
     */
    function updatePriceValidity(string memory commodity, bool isValid) external onlyOwner {
        require(bytes(prices[commodity].source).length > 0, "Price not found");
        prices[commodity].isValid = isValid;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get commodity price data
     * @param commodity Commodity symbol
     */
    function getPrice(string memory commodity) external view returns (PriceData memory) {
        return prices[commodity];
    }
    
    /**
     * @notice Get commodity price in USD
     * @param commodity Commodity symbol
     */
    function getPriceInUSD(string memory commodity) external view returns (uint256) {
        PriceData memory priceData = prices[commodity];
        return priceData.price;
    }
    
    /**
     * @notice Check if price is fresh
     * @param commodity Commodity symbol
     */
    function isPriceFresh(string memory commodity) external view returns (bool) {
        PriceData memory priceData = prices[commodity];
        return (block.timestamp - priceData.timestamp) <= STALENESS_THRESHOLD;
    }
    
    /**
     * @notice Check if commodity is supported
     * @param commodity Commodity symbol
     */
    function isCommoditySupported(string memory commodity) external view returns (bool) {
        return _isCommoditySupported(commodity);
    }
    
    /**
     * @notice Get all supported commodities
     */
    function getSupportedCommodities() external view returns (string[] memory) {
        return supportedCommodities;
    }
    
    /**
     * @notice Get number of supported commodities
     */
    function getSupportedCommoditiesCount() external view returns (uint256) {
        return supportedCommodities.length;
    }
    
    /**
     * @notice Get all authorized updaters
     */
    function getAuthorizedUpdaters() external view returns (address[] memory) {
        return authorizedUpdaterList;
    }
    
    /**
     * @notice Get oracle statistics
     */
    function getOracleStats() external view returns (
        uint256 totalCommodities,
        uint256 freshPrices,
        uint256 stalePrices,
        uint256 authorizedUpdaterCount
    ) {
        totalCommodities = supportedCommodities.length;
        freshPrices = 0;
        stalePrices = 0;
        
        for (uint256 i = 0; i < supportedCommodities.length; i++) {
            if (isPriceFresh(supportedCommodities[i])) {
                freshPrices++;
            } else {
                stalePrices++;
            }
        }
        
        authorizedUpdaterCount = authorizedUpdaterList.length;
    }
    
    /**
     * @notice Get prices for multiple commodities
     * @param commodities Array of commodity symbols
     */
    function getMultiplePrices(string[] memory commodities) 
        external 
        view 
        returns (PriceData[] memory) 
    {
        PriceData[] memory results = new PriceData[](commodities.length);
        
        for (uint256 i = 0; i < commodities.length; i++) {
            results[i] = prices[commodities[i]];
        }
        
        return results;
    }
    
    /**
     * @notice Get price change information
     * @param commodity Commodity symbol
     */
    function getPriceChange(string memory commodity) external view returns (
        uint256 currentPrice,
        uint256 lastUpdated,
        bool isFresh,
        uint256 confidence
    ) {
        PriceData memory priceData = prices[commodity];
        
        currentPrice = priceData.price;
        lastUpdated = priceData.timestamp;
        isFresh = (block.timestamp - priceData.timestamp) <= STALENESS_THRESHOLD;
        confidence = priceData.confidence;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Check if commodity is supported
     */
    function _isCommoditySupported(string memory commodity) internal view returns (bool) {
        for (uint256 i = 0; i < supportedCommodities.length; i++) {
            if (keccak256(abi.encodePacked(supportedCommodities[i])) == keccak256(abi.encodePacked(commodity))) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice Check if price is reasonable
     */
    function _isPriceReasonable(string memory commodity, uint256 price) internal pure returns (bool) {
        // Basic price validation logic
        bytes32 commodityHash = keccak256(abi.encodePacked(commodity));
        
        // Define reasonable price ranges (in cents)
        if (commodityHash == keccak256(abi.encodePacked("COPPER"))) {
            return price >= 10000 && price <= 500000; // $100 - $5,000
        } else if (commodityHash == keccak256(abi.encodePacked("COFFEE"))) {
            return price >= 100 && price <= 1000; // $1 - $10
        } else if (commodityHash == keccak256(abi.encodePacked("GOLD"))) {
            return price >= 50000 && price <= 10000000; // $500 - $100,000
        } else if (commodityHash == keccak256(abi.encodePacked("MAIZE"))) {
            return price >= 10 && price <= 1000; // $0.10 - $10
        } else if (commodityHash == keccak256(abi.encodePacked("WHEAT"))) {
            return price >= 100 && price <= 2000; // $1 - $20
        }
        
        // Default: allow any positive price
        return price > 0;
    }
    
    /**
     * @notice Remove address from authorized updater list
     */
    function _removeFromUpdaterList(address account) internal {
        for (uint256 i = 0; i < authorizedUpdaterList.length; i++) {
            if (authorizedUpdaterList[i] == account) {
                // Shift remaining elements
                for (uint256 j = i; j < authorizedUpdaterList.length - 1; j++) {
                    authorizedUpdaterList[j] = authorizedUpdaterList[j + 1];
                }
                authorizedUpdaterList.pop();
                break;
            }
        }
    }
}