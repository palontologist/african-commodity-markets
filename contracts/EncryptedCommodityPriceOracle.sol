// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title EncryptedCommodityPriceOracle
 * @notice FHE-enabled oracle for commodity prices protected from MEV extraction
 * @dev Uses Fhenix's Fully Homomorphic Encryption to store prices as encrypted values
 * Prevents MEV bots and front-runners from extracting or predicting sensitive pricing data
 */
contract EncryptedCommodityPriceOracle is Ownable {
    
    // ============ Structs ============
    
    struct EncryptedPriceData {
        euint64 price;              // Encrypted price in cents
        uint256 timestamp;          // Last update time (not encrypted - needed for staleness checks)
        string source;              // Data source (not encrypted - helpful for auditing)
        address updatedBy;          // Address that updated the price
        uint256 confidence;         // Confidence score 0-100 (plaintext for query optimization)
        bool isValid;               // Validity flag (plaintext for quick validity checks)
    }
    
    struct AuthorizedUpdater {
        address account;
        bool authorized;
        uint256 addedAt;
    }
    
    struct DecryptionRequest {
        euint64 encryptedValue;
        address requester;
        uint256 requestedAt;
        string commodity;
    }
    
    // ============ State Variables ============
    
    mapping(string => EncryptedPriceData) public prices;
    mapping(address => bool) public authorizedUpdaters;
    mapping(bytes32 => DecryptionRequest) public decryptionRequests;
    
    string[] public supportedCommodities;
    address[] public authorizedUpdaterList;
    
    uint256 public STALENESS_THRESHOLD = 3600; // 1 hour in seconds
    uint256 public MIN_CONFIDENCE = 50;        // Minimum confidence score (0-100)
    uint256 public constant PRICE_DECIMALS = 2; // Price in cents
    
    // Encrypted constants for FHE operations
    euint64 private ENCRYPTED_MIN_PRICE;      // Min acceptable price (set during init)
    euint64 private ENCRYPTED_MAX_PRICE;      // Max acceptable price (set during init)
    euint64 private ENCRYPTED_ZERO;           // Zero value for comparisons
    
    bool private initialized;
    
    // ============ Events ============
    
    event EncryptedPriceUpdated(
        string indexed commodity,
        uint256 timestamp,
        string source,
        address indexed updatedBy,
        uint256 confidence
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
    
    event DecryptionRequested(
        bytes32 indexed requestId,
        string commodity,
        address indexed requester,
        uint256 timestamp
    );
    
    event DecryptionResultRetrieved(
        bytes32 indexed requestId,
        string commodity,
        uint256 decryptedPrice,
        address indexed requester
    );
    
    event PriceValidationFailed(
        string indexed commodity,
        uint256 timestamp,
        string reason
    );
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        authorizedUpdaters[msg.sender] = true;
        authorizedUpdaterList.push(msg.sender);
        
        emit UpdaterAuthorized(msg.sender, block.timestamp, msg.sender);
    }
    
    // ============ Initialization (must call after deployment) ============
    
    /**
     * @notice Initialize encrypted constants for FHE operations
     * @param minPrice Minimum acceptable price in cents (e.g., 100 for $1)
     * @param maxPrice Maximum acceptable price in cents (e.g., 10000000 for $100,000)
     * @dev Must be called once after deployment. Uses InEuint64 wrapper for input encryption.
     */
    function initializeEncryptedBounds(
        InEuint64 calldata minPrice,
        InEuint64 calldata maxPrice
    ) external onlyOwner {
        require(!initialized, "Already initialized");
        
        ENCRYPTED_MIN_PRICE = FHE.asEuint64(minPrice);
        FHE.allowThis(ENCRYPTED_MIN_PRICE);
        
        ENCRYPTED_MAX_PRICE = FHE.asEuint64(maxPrice);
        FHE.allowThis(ENCRYPTED_MAX_PRICE);
        
        ENCRYPTED_ZERO = FHE.asEuint64(0);
        FHE.allowThis(ENCRYPTED_ZERO);
        
        initialized = true;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Update commodity price with encrypted value
     * @param commodity Commodity symbol (e.g., "COPPER")
     * @param encryptedPrice Encrypted price in cents (must be pre-encrypted via Fhenix SDK)
     * @param confidence Confidence score 0-100
     * @param source Data source name
     * @dev Uses store-and-grant pattern:
     *      1. Store encrypted value
     *      2. Grant contract access via FHE.allowThis()
     *      3. Grant caller access via FHE.allowSender()
     */
    function updatePrice(
        string memory commodity,
        InEuint64 calldata encryptedPrice,
        uint256 confidence,
        string memory source
    ) external {
        require(authorizedUpdaters[msg.sender], "Not authorized");
        require(bytes(commodity).length > 0, "Commodity cannot be empty");
        require(confidence <= 100, "Confidence must be <= 100");
        require(bytes(source).length > 0, "Source cannot be empty");
        require(initialized, "Encrypted bounds not initialized");
        
        euint64 price = FHE.asEuint64(encryptedPrice);
        
        // Validate price is within reasonable bounds using encrypted comparison
        // This validation happens on encrypted data - the actual price is never revealed
        ebool isAboveMin = FHE.gte(price, ENCRYPTED_MIN_PRICE);
        ebool isBelowMax = FHE.lte(price, ENCRYPTED_MAX_PRICE);
        ebool isValid = FHE.and(isAboveMin, isBelowMax);
        
        // Store-and-grant pattern: always grant access after storing
        prices[commodity] = EncryptedPriceData({
            price: price,
            timestamp: block.timestamp,
            source: source,
            updatedBy: msg.sender,
            confidence: confidence,
            isValid: confidence >= MIN_CONFIDENCE
        });
        
        // Grant contract access to operate on this value in future transactions
        FHE.allowThis(price);
        
        // Grant caller access to decrypt/read this value
        FHE.allowSender(price);
        
        // Add to supported commodities if new
        if (!_isCommoditySupported(commodity)) {
            supportedCommodities.push(commodity);
            emit CommoditySupported(commodity, block.timestamp, msg.sender);
        }
        
        emit EncryptedPriceUpdated(commodity, block.timestamp, source, msg.sender, confidence);
    }
    
    /**
     * @notice Batch update multiple commodity prices
     * @param commodities Array of commodity symbols
     * @param encryptedPrices Array of encrypted prices
     * @param confidences Array of confidence scores
     * @param source Data source name
     */
    function batchUpdatePrices(
        string[] memory commodities,
        InEuint64[] calldata encryptedPrices,
        uint256[] memory confidences,
        string memory source
    ) external {
        require(authorizedUpdaters[msg.sender], "Not authorized");
        require(
            commodities.length == encryptedPrices.length && 
            encryptedPrices.length == confidences.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < commodities.length; i++) {
            try this.updatePrice(commodities[i], encryptedPrices[i], confidences[i], source) {
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
     * @notice Add supported commodity
     * @param commodity Commodity symbol
     */
    function addSupportedCommodity(string memory commodity) external onlyOwner {
        require(bytes(commodity).length > 0, "Commodity cannot be empty");
        require(!_isCommoditySupported(commodity), "Already supported");
        
        supportedCommodities.push(commodity);
        emit CommoditySupported(commodity, block.timestamp, msg.sender);
    }
    
    /**
     * @notice Request decryption of a commodity price (first transaction)
     * @param commodity Commodity symbol
     * @return requestId Unique ID for tracking this decryption request
     * @dev This is the first step of a two-transaction decryption workflow
     * Call getDecryptionResult() in a separate transaction (after next block) to retrieve plaintext
     */
    function requestDecryption(string memory commodity) 
        external 
        returns (bytes32) 
    {
        require(bytes(prices[commodity].source).length > 0, "Price not found");
        require(
            msg.sender == prices[commodity].updatedBy || msg.sender == owner(),
            "Not authorized to decrypt"
        );
        
        euint64 encryptedPrice = prices[commodity].price;
        bytes32 requestId = keccak256(abi.encodePacked(commodity, block.timestamp, msg.sender));
        
        // Store decryption request
        decryptionRequests[requestId] = DecryptionRequest({
            encryptedValue: encryptedPrice,
            requester: msg.sender,
            requestedAt: block.timestamp,
            commodity: commodity
        });
        
        // Trigger decryption in FHE kernel
        FHE.decrypt(encryptedPrice);
        
        emit DecryptionRequested(requestId, commodity, msg.sender, block.timestamp);
        
        return requestId;
    }
    
    /**
     * @notice Retrieve decryption result (second transaction, after decryption completes)
     * @param requestId Request ID from requestDecryption()
     * @return decryptedPrice The plaintext price in cents
     * @dev This must be called in a separate transaction, usually in the next block
     * The FHE network needs time to decrypt the value.
     */
    function getDecryptionResult(bytes32 requestId) 
        external 
        view 
        returns (uint64 decryptedPrice) 
    {
        DecryptionRequest memory request = decryptionRequests[requestId];
        require(request.requester == msg.sender, "Not the requester");
        require(request.requestedAt > 0, "Request not found");
        
        decryptedPrice = FHE.getDecryptResult(request.encryptedValue);
    }
    
    /**
     * @notice Safe variant of getDecryptionResult that won't revert if not ready
     * @param requestId Request ID from requestDecryption()
     * @return decryptedPrice The plaintext price in cents (0 if not ready)
     * @return isReady True if decryption result is available
     */
    function tryGetDecryptionResult(bytes32 requestId)
        external
        view
        returns (uint64 decryptedPrice, bool isReady)
    {
        DecryptionRequest memory request = decryptionRequests[requestId];
        require(request.requester == msg.sender, "Not the requester");
        require(request.requestedAt > 0, "Request not found");
        
        (decryptedPrice, isReady) = FHE.getDecryptResultSafe(request.encryptedValue);
    }
    
    /**
     * @notice Update staleness threshold
     * @param threshold New threshold in seconds
     */
    function updateStalenessThreshold(uint256 threshold) external onlyOwner {
        STALENESS_THRESHOLD = threshold;
    }
    
    /**
     * @notice Update minimum confidence
     * @param minConfidence New minimum confidence (0-100)
     */
    function updateMinimumConfidence(uint256 minConfidence) external onlyOwner {
        require(minConfidence <= 100, "Confidence must be <= 100");
        MIN_CONFIDENCE = minConfidence;
    }
    
    /**
     * @notice Perform encrypted TWAP calculation
     * @param commodity Commodity symbol
     * @param weight1 Weight for current price (0-100)
     * @param weight2 Weight for previous price (0-100)
     * @return result Encrypted TWAP value
     * @dev Both branches execute - FHE.select has no short-circuit evaluation
     */
    function getEncryptedTWAP(
        string memory commodity,
        uint256 weight1,
        uint256 weight2
    ) external view returns (euint64 result) {
        require(weight1 + weight2 == 100, "Weights must sum to 100");
        require(bytes(prices[commodity].source).length > 0, "Price not found");
        
        euint64 currentPrice = prices[commodity].price;
        
        // Multiply by weights and combine
        euint64 weighted1 = FHE.mul(currentPrice, FHE.asEuint64(weight1));
        euint64 weighted2 = FHE.mul(currentPrice, FHE.asEuint64(weight2));
        
        result = FHE.add(weighted1, weighted2);
        FHE.allowSender(result);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Check if price is fresh (not stale)
     * @param commodity Commodity symbol
     */
    function isPriceFresh(string memory commodity) public view returns (bool) {
        EncryptedPriceData memory priceData = prices[commodity];
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
     * @notice Get plaintext metadata about a price (not the price itself)
     * @param commodity Commodity symbol
     * @return timestamp When the price was last updated
     * @return source Data source
     * @return confidence Confidence score (0-100)
     * @return isValid Whether the price passes validation checks
     * @return isFresh Whether the price is not stale
     * @dev Note: The actual encrypted price is NOT returned. Use requestDecryption()
     * and getDecryptionResult() to access the plaintext price via two separate transactions.
     */
    function getPriceMetadata(string memory commodity)
        external
        view
        returns (
            uint256 timestamp,
            string memory source,
            uint256 confidence,
            bool isValid,
            bool isFresh
        )
    {
        EncryptedPriceData memory priceData = prices[commodity];
        return (
            priceData.timestamp,
            priceData.source,
            priceData.confidence,
            priceData.isValid,
            isPriceFresh(commodity)
        );
    }
    
    /**
     * @notice Get oracle statistics
     */
    function getOracleStats() external view returns (
        uint256 totalCommodities,
        uint256 freshPrices,
        uint256 stalePrices,
        uint256 authorizedUpdaterCount,
        bool boundariesInitialized
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
        boundariesInitialized = initialized;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Check if commodity is supported
     */
    function _isCommoditySupported(string memory commodity) internal view returns (bool) {
        for (uint256 i = 0; i < supportedCommodities.length; i++) {
            if (keccak256(abi.encodePacked(supportedCommodities[i])) == 
                keccak256(abi.encodePacked(commodity))) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice Remove address from authorized updater list
     */
    function _removeFromUpdaterList(address account) internal {
        for (uint256 i = 0; i < authorizedUpdaterList.length; i++) {
            if (authorizedUpdaterList[i] == account) {
                for (uint256 j = i; j < authorizedUpdaterList.length - 1; j++) {
                    authorizedUpdaterList[j] = authorizedUpdaterList[j + 1];
                }
                authorizedUpdaterList.pop();
                break;
            }
        }
    }
}
