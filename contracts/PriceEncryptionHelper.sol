// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import "./EncryptedCommodityPriceOracle.sol";

/**
 * @title PriceEncryptionHelper
 * @notice Utility contract for managing price encryption workflows
 * @dev Bridges encrypted and plaintext data with proper access control delegation
 */
contract PriceEncryptionHelper is Ownable {
    
    // Reference to the encrypted oracle
    EncryptedCommodityPriceOracle public encryptedOracle;
    
    // Track authorized decryptors (besides owners)
    mapping(address => bool) public authorizedDecryptors;
    address[] public decryptorList;
    
    // Price cache for authorized parties
    mapping(bytes32 => uint64) public decryptedPriceCache;
    mapping(bytes32 => uint256) public cacheTTL;
    
    uint256 public constant CACHE_VALIDITY = 300; // 5 minutes
    
    // ============ Events ============
    
    event DecryptorAuthorized(address indexed decryptor, uint256 timestamp);
    event DecryptorRevoked(address indexed decryptor, uint256 timestamp);
    event PriceCached(string indexed commodity, uint64 price, uint256 timestamp);
    
    // ============ Constructor ============
    
    constructor(address _encryptedOracle) Ownable(msg.sender) {
        require(_encryptedOracle != address(0), "Invalid oracle address");
        encryptedOracle = EncryptedCommodityPriceOracle(_encryptedOracle);
        
        authorizedDecryptors[msg.sender] = true;
        decryptorList.push(msg.sender);
    }
    
    // ============ Access Control ============
    
    /**
     * @notice Authorize address to decrypt prices
     * @param decryptor Address to authorize
     */
    function authorizeDecryptor(address decryptor) external onlyOwner {
        require(decryptor != address(0), "Invalid address");
        require(!authorizedDecryptors[decryptor], "Already authorized");
        
        authorizedDecryptors[decryptor] = true;
        decryptorList.push(decryptor);
        
        emit DecryptorAuthorized(decryptor, block.timestamp);
    }
    
    /**
     * @notice Revoke decryption authorization
     * @param decryptor Address to revoke
     */
    function revokeDecryptor(address decryptor) external onlyOwner {
        require(authorizedDecryptors[decryptor], "Not authorized");
        
        authorizedDecryptors[decryptor] = false;
        _removeFromList(decryptor);
        
        emit DecryptorRevoked(decryptor, block.timestamp);
    }
    
    /**
     * @notice Check if address is authorized to decrypt
     * @param account Address to check
     */
    function isAuthorizedDecryptor(address account) external view returns (bool) {
        return authorizedDecryptors[account] || owner() == account;
    }
    
    // ============ Decryption Workflow ============
    
    /**
     * @notice Request decryption from the oracle (first transaction)
     * @param commodity Commodity symbol
     * @return requestId Unique ID for tracking
     */
    function requestPriceDecryption(string memory commodity)
        external
        returns (bytes32)
    {
        require(authorizedDecryptors[msg.sender] || msg.sender == owner(), 
                "Not authorized to decrypt");
        
        return encryptedOracle.requestDecryption(commodity);
    }
    
    /**
     * @notice Get decrypted price (second transaction)
     * @param requestId Request ID from requestPriceDecryption()
     * @return decryptedPrice The plaintext price
     */
    function getDecryptedPrice(bytes32 requestId)
        external
        view
        returns (uint64 decryptedPrice)
    {
        require(authorizedDecryptors[msg.sender] || msg.sender == owner(),
                "Not authorized to decrypt");
        
        return encryptedOracle.getDecryptionResult(requestId);
    }
    
    /**
     * @notice Safe variant that won't revert if not ready
     * @param requestId Request ID from requestPriceDecryption()
     * @return decryptedPrice The plaintext price (0 if not ready)
     * @return isReady True if decryption is complete
     */
    function tryGetDecryptedPrice(bytes32 requestId)
        external
        view
        returns (uint64 decryptedPrice, bool isReady)
    {
        require(authorizedDecryptors[msg.sender] || msg.sender == owner(),
                "Not authorized to decrypt");
        
        return encryptedOracle.tryGetDecryptionResult(requestId);
    }
    
    // ============ Price Caching ============
    
    /**
     * @notice Cache a decrypted price for quick access
     * @param commodity Commodity symbol
     * @param price Plaintext price to cache
     * @dev Only authorized decryptors and owner can cache
     */
    function cachePriceForCommodity(string memory commodity, uint64 price)
        external
    {
        require(authorizedDecryptors[msg.sender] || msg.sender == owner(),
                "Not authorized");
        
        bytes32 key = keccak256(abi.encodePacked(commodity));
        decryptedPriceCache[key] = price;
        cacheTTL[key] = block.timestamp + CACHE_VALIDITY;
        
        emit PriceCached(commodity, price, block.timestamp);
    }
    
    /**
     * @notice Get cached price if valid and fresh
     * @param commodity Commodity symbol
     * @return price Cached price (0 if not available or expired)
     * @return isValid True if cache hit and not expired
     */
    function getCachedPrice(string memory commodity)
        external
        view
        returns (uint64 price, bool isValid)
    {
        bytes32 key = keccak256(abi.encodePacked(commodity));
        
        if (cacheTTL[key] > block.timestamp) {
            return (decryptedPriceCache[key], true);
        }
        
        return (0, false);
    }
    
    /**
     * @notice Clear cache for a commodity
     * @param commodity Commodity symbol
     */
    function clearCache(string memory commodity) external onlyOwner {
        bytes32 key = keccak256(abi.encodePacked(commodity));
        delete decryptedPriceCache[key];
        delete cacheTTL[key];
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get all authorized decryptors
     */
    function getAuthorizedDecryptors() external view returns (address[] memory) {
        return decryptorList;
    }
    
    /**
     * @notice Get metadata about encryption setup
     */
    function getEncryptionStats() external view returns (
        uint256 authorizedDecryptorCount,
        uint256 cacheValidity,
        bool oracleInitialized
    ) {
        return (
            decryptorList.length,
            CACHE_VALIDITY,
            true // Oracle validity check could be added if needed
        );
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Remove address from decryptor list
     */
    function _removeFromList(address account) internal {
        for (uint256 i = 0; i < decryptorList.length; i++) {
            if (decryptorList[i] == account) {
                for (uint256 j = i; j < decryptorList.length - 1; j++) {
                    decryptorList[j] = decryptorList[j + 1];
                }
                decryptorList.pop();
                break;
            }
        }
    }
}
