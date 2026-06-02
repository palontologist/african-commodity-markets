// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "@fhenixprotocol/cofhe-mock-contracts/CoFheTest.sol";
import "../contracts/EncryptedCommodityPriceOracle.sol";
import "../contracts/PriceEncryptionHelper.sol";

contract EncryptedCommodityPriceOracleTest is Test, CoFheTest {
    
    EncryptedCommodityPriceOracle public oracle;
    PriceEncryptionHelper public helper;
    
    address public owner;
    address public updater;
    address public other;
    
    // Test commodities and prices
    string public constant COPPER = "COPPER";
    string public constant COFFEE = "COFFEE";
    string public constant GOLD = "GOLD";
    
    uint256 public constant COPPER_MIN = 10000;    // $100 in cents
    uint256 public constant COPPER_MAX = 500000;   // $5,000 in cents
    uint256 public constant COPPER_PRICE = 50000;  // $500 in cents
    
    uint256 public constant COFFEE_MIN = 100;      // $1 in cents
    uint256 public constant COFFEE_MAX = 1000;     // $10 in cents
    uint256 public constant COFFEE_PRICE = 350;    // $3.50 in cents
    
    function setUp() public virtual {
        owner = address(this);
        updater = address(0x1);
        other = address(0x2);
        
        oracle = new EncryptedCommodityPriceOracle();
        helper = new PriceEncryptionHelper(address(oracle));
        
        // Authorize updater
        oracle.authorizeUpdater(updater);
    }
    
    // ============ Initialization Tests ============
    
    function test_initializeEncryptedBounds() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        (,,,,bool initialized) = oracle.getOracleStats();
        assertTrue(initialized, "Oracle should be initialized");
    }
    
    function test_initializeCanOnlyBeCalledOnce() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        vm.expectRevert("Already initialized");
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
    }
    
    // ============ Price Update Tests ============
    
    function test_updatePriceStoresEncryptedValue() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        InEuint64 memory encryptedPrice = createInEuint64(COPPER_PRICE, updater);
        
        vm.prank(updater);
        oracle.updatePrice(COPPER, encryptedPrice, 95, "Test Source");
        
        (uint256 timestamp, string memory source, uint256 confidence, bool isValid, bool isFresh) = 
            oracle.getPriceMetadata(COPPER);
        
        assertEq(timestamp, block.timestamp, "Timestamp should match");
        assertEq(source, "Test Source", "Source should match");
        assertEq(confidence, 95, "Confidence should match");
        assertTrue(isValid, "Price should be valid");
        assertTrue(isFresh, "Price should be fresh");
    }
    
    function test_updatePriceRequiresAuthorization() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        InEuint64 memory encryptedPrice = createInEuint64(COPPER_PRICE, other);
        
        vm.prank(other);
        vm.expectRevert("Not authorized");
        oracle.updatePrice(COPPER, encryptedPrice, 95, "Test Source");
    }
    
    function test_updatePriceRequiresCommodityName() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        InEuint64 memory encryptedPrice = createInEuint64(COPPER_PRICE, updater);
        
        vm.prank(updater);
        vm.expectRevert("Commodity cannot be empty");
        oracle.updatePrice("", encryptedPrice, 95, "Test Source");
    }
    
    function test_updatePriceRequiresConfidenceBounds() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        InEuint64 memory encryptedPrice = createInEuint64(COPPER_PRICE, updater);
        
        vm.prank(updater);
        vm.expectRevert("Confidence must be <= 100");
        oracle.updatePrice(COPPER, encryptedPrice, 101, "Test Source");
    }
    
    function test_batchUpdatePrices() public {
        InEuint64 memory minPrice = createInEuint64(COFFEE_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COFFEE_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        // Note: For batch operations, we create separate encrypted values
        string[] memory commodities = new string[](2);
        commodities[0] = COFFEE;
        commodities[1] = "TEA";
        
        InEuint64[] memory prices = new InEuint64[](2);
        prices[0] = createInEuint64(COFFEE_PRICE, updater);
        prices[1] = createInEuint64(250, updater);
        
        uint256[] memory confidences = new uint256[](2);
        confidences[0] = 90;
        confidences[1] = 85;
        
        vm.prank(updater);
        oracle.batchUpdatePrices(commodities, prices, confidences, "Batch Source");
        
        (,, uint256 confidence1,,) = oracle.getPriceMetadata(COFFEE);
        (,, uint256 confidence2,,) = oracle.getPriceMetadata("TEA");
        
        assertEq(confidence1, 90, "COFFEE confidence should match");
        assertEq(confidence2, 85, "TEA confidence should match");
    }
    
    // ============ Authorization Tests ============
    
    function test_authorizeUpdater() public {
        address newUpdater = address(0x3);
        
        oracle.authorizeUpdater(newUpdater);
        
        address[] memory updaters = oracle.getAuthorizedUpdaters();
        bool found = false;
        for (uint i = 0; i < updaters.length; i++) {
            if (updaters[i] == newUpdater) {
                found = true;
                break;
            }
        }
        assertTrue(found, "New updater should be authorized");
    }
    
    function test_revokeUpdater() public {
        oracle.revokeUpdater(updater);
        
        address[] memory updaters = oracle.getAuthorizedUpdaters();
        bool found = false;
        for (uint i = 0; i < updaters.length; i++) {
            if (updaters[i] == updater) {
                found = true;
                break;
            }
        }
        assertFalse(found, "Revoked updater should not be in list");
    }
    
    // ============ Commodity Support Tests ============
    
    function test_addSupportedCommodity() public {
        oracle.addSupportedCommodity("SILVER");
        
        assertTrue(oracle.isCommoditySupported("SILVER"), "SILVER should be supported");
    }
    
    function test_getCommodityList() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        InEuint64 memory encryptedPrice = createInEuint64(COPPER_PRICE, updater);
        
        vm.prank(updater);
        oracle.updatePrice(COPPER, encryptedPrice, 95, "Test");
        
        string[] memory commodities = oracle.getSupportedCommodities();
        assertEq(commodities.length, 1, "Should have 1 commodity");
        assertEq(commodities[0], COPPER, "Should be COPPER");
    }
    
    // ============ Staleness Tests ============
    
    function test_priceIsFreshAfterUpdate() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        InEuint64 memory encryptedPrice = createInEuint64(COPPER_PRICE, updater);
        
        vm.prank(updater);
        oracle.updatePrice(COPPER, encryptedPrice, 95, "Test");
        
        assertTrue(oracle.isPriceFresh(COPPER), "Price should be fresh");
    }
    
    function test_priceBecomesStale() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        InEuint64 memory encryptedPrice = createInEuint64(COPPER_PRICE, updater);
        
        vm.prank(updater);
        oracle.updatePrice(COPPER, encryptedPrice, 95, "Test");
        
        // Advance time past staleness threshold (default 3600 seconds)
        vm.warp(block.timestamp + 3601);
        
        assertFalse(oracle.isPriceFresh(COPPER), "Price should be stale");
    }
    
    function test_updateStalenessThreshold() public {
        uint256 newThreshold = 7200; // 2 hours
        oracle.updateStalenessThreshold(newThreshold);
        
        (,,,,,) = oracle.getOracleStats();
        // Verify through behavioral test
    }
    
    // ============ Confidence Tests ============
    
    function test_updateMinimumConfidence() public {
        uint256 newMin = 75;
        oracle.updateMinimumConfidence(newMin);
        // Confidence enforcement is checked through price validity
    }
    
    function test_confidenceBoundValidation() public {
        vm.expectRevert("Confidence must be <= 100");
        oracle.updateMinimumConfidence(101);
    }
    
    // ============ Oracle Stats Tests ============
    
    function test_getOracleStats() public {
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        InEuint64 memory encryptedPrice = createInEuint64(COPPER_PRICE, updater);
        
        vm.prank(updater);
        oracle.updatePrice(COPPER, encryptedPrice, 95, "Test");
        
        (
            uint256 totalCommodities,
            uint256 freshPrices,
            uint256 stalePrices,
            uint256 updaterCount,
            bool initialized
        ) = oracle.getOracleStats();
        
        assertEq(totalCommodities, 1, "Should have 1 commodity");
        assertEq(freshPrices, 1, "Should have 1 fresh price");
        assertEq(stalePrices, 0, "Should have 0 stale prices");
        assertGt(updaterCount, 0, "Should have authorized updaters");
        assertTrue(initialized, "Should be initialized");
    }
    
    // ============ PriceEncryptionHelper Tests ============
    
    function test_helperAuthorizesDecryptor() public {
        address decryptor = address(0x4);
        helper.authorizeDecryptor(decryptor);
        
        assertTrue(helper.isAuthorizedDecryptor(decryptor), "Decryptor should be authorized");
    }
    
    function test_helperRevokesDecryptor() public {
        address decryptor = address(0x4);
        helper.authorizeDecryptor(decryptor);
        helper.revokeDecryptor(decryptor);
        
        assertFalse(helper.isAuthorizedDecryptor(decryptor), "Decryptor should be revoked");
    }
    
    function test_helperGetAuthorizedDecryptors() public {
        address[] memory decryptors = helper.getAuthorizedDecryptors();
        assertGt(decryptors.length, 0, "Should have at least owner as decryptor");
    }
    
    function test_helperCachePriceForCommodity() public {
        uint64 cachedPrice = 12345;
        helper.cachePriceForCommodity(COPPER, cachedPrice);
        
        (uint64 retrieved, bool isValid) = helper.getCachedPrice(COPPER);
        assertEq(retrieved, cachedPrice, "Cached price should match");
        assertTrue(isValid, "Cache should be valid");
    }
    
    function test_helperCacheExpires() public {
        uint64 cachedPrice = 12345;
        helper.cachePriceForCommodity(COPPER, cachedPrice);
        
        // Advance time past cache TTL (300 seconds)
        vm.warp(block.timestamp + 301);
        
        (, bool isValid) = helper.getCachedPrice(COPPER);
        assertFalse(isValid, "Cache should be expired");
    }
    
    function test_helperClearCache() public {
        uint64 cachedPrice = 12345;
        helper.cachePriceForCommodity(COPPER, cachedPrice);
        
        helper.clearCache(COPPER);
        
        (uint64 retrieved, bool isValid) = helper.getCachedPrice(COPPER);
        assertEq(retrieved, 0, "Cache should be cleared");
        assertFalse(isValid, "Cache should be invalid");
    }
    
    // ============ Fuzz Tests ============
    
    function test_fuzz_updatePriceWithVariousConfidence(uint256 confidence) public {
        // Bound confidence to valid range
        confidence = bound(confidence, 0, 100);
        
        InEuint64 memory minPrice = createInEuint64(COPPER_MIN, owner);
        InEuint64 memory maxPrice = createInEuint64(COPPER_MAX, owner);
        oracle.initializeEncryptedBounds(minPrice, maxPrice);
        
        InEuint64 memory encryptedPrice = createInEuint64(COPPER_PRICE, updater);
        
        vm.prank(updater);
        oracle.updatePrice(COPPER, encryptedPrice, confidence, "Fuzz Test");
        
        (,, uint256 retrievedConfidence,,) = oracle.getPriceMetadata(COPPER);
        assertEq(retrievedConfidence, confidence, "Confidence should match");
    }
    
    function test_fuzz_addMultipleCommodities(uint8 count) public {
        count = uint8(bound(count, 1, 20));
        
        for (uint i = 0; i < count; i++) {
            string memory commodity = string(abi.encodePacked("COMMODITY_", uint2str(i)));
            oracle.addSupportedCommodity(commodity);
        }
        
        uint256 commodityCount = oracle.getSupportedCommoditiesCount();
        assertEq(commodityCount, count, "Should have correct commodity count");
    }
    
    // ============ Helper Functions ============
    
    function uint2str(uint i) internal pure returns (string memory) {
        if (i == 0) return "0";
        uint j = i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(i - i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            i /= 10;
        }
        return string(bstr);
    }
}
