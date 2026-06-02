# FHE Pricing Protection Guide

## Overview

This guide explains how the African Commodity Markets platform protects sensitive pricing data using Fhenix's Fully Homomorphic Encryption (FHE).

## Why Encrypt Prices?

### The MEV Problem

On public blockchains, all transaction data is visible to everyone in the mempool before it's included in a block. This creates vulnerabilities:

1. **Front-Running**: Bots see pending price updates and place orders before them
2. **Sandwich Attacks**: Bots extract value by ordering transactions around legitimate trades
3. **Price Prediction**: Bots analyze historical prices on-chain to predict future movements
4. **Flash Loan Attacks**: Quick profits by manipulating visible pricing data

**African commodity markets are especially vulnerable** because:
- Prices directly affect farmer livelihoods
- High-value markets attract sophisticated MEV bots
- Traditional traders and farmers lack protection

### How FHE Solves This

With Fhenix FHE:
- **Prices stored encrypted** — Only encrypted uint256 handles visible on-chain
- **Bots see nothing** — No price values to extract or predict
- **Contract still operates** — Smart contract can compute on encrypted data (e.g., validate prices, calculate TWAP)
- **Authorized decryption** — Only authorized parties can decrypt prices in a separate transaction
- **Transparent timestamp** — Commodity name + update time still visible (not sensitive)

## Architecture

### Key Components

#### 1. `EncryptedCommodityPriceOracle.sol`
The main smart contract that:
- Stores commodity prices as encrypted `euint64` values
- Validates prices using FHE operations (without seeing the actual values)
- Manages two-transaction decryption workflow
- Enforces access control (FHE.allowThis, FHE.allowSender)

#### 2. `PriceEncryptionHelper.sol`
Utility contract for:
- Managing decryption authorization
- Caching decrypted prices (5-minute TTL)
- Coordinating multi-transaction workflows
- Bridging encrypted and plaintext data safely

#### 3. `@fhenixprotocol/cofhe-contracts`
The FHE library providing:
- Encrypted types: `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `euint256`, `ebool`, `eaddress`
- Operations: `FHE.add()`, `FHE.mul()`, `FHE.gte()`, `FHE.select()`, etc.
- Access control: `FHE.allowThis()`, `FHE.allowSender()`, `FHE.allow()`
- Decryption: `FHE.decrypt()`, `FHE.getDecryptResult()`

## Usage Guide

### Setup: Initialize Oracle

```solidity
// Deploy oracle
EncryptedCommodityPriceOracle oracle = new EncryptedCommodityPriceOracle();

// Initialize encrypted bounds (commodity price ranges)
// Min price: $100 = 10000 cents
// Max price: $5000 = 500000 cents
InEuint64 minPrice = createInEuint64(10000, owner);
InEuint64 maxPrice = createInEuint64(500000, owner);
oracle.initializeEncryptedBounds(minPrice, maxPrice);

// Authorize price updaters
oracle.authorizeUpdater(priceFeeds[0]);
oracle.authorizeUpdater(priceFeeds[1]);
```

### Single Transaction: Update Price

```solidity
// Off-chain: Encrypt price using Fhenix SDK
// Price: $5.00 = 500 cents
InEuint64 encryptedPrice = encryptionSDK.encrypt(500);

// On-chain: Send to oracle (updater calls this)
oracle.updatePrice(
    "COFFEE",
    encryptedPrice,
    95,               // Confidence: 95%
    "CoinGecko"       // Data source
);

// Result: Price is now stored encrypted
// Only encrypted handle visible on-chain
// MEV bots cannot see $5.00 price
```

### Two-Transaction Workflow: Decrypt Price

**Transaction 1: Request Decryption**

```solidity
// Authorized decryptor requests decryption
bytes32 requestId = oracle.requestDecryption("COFFEE");

// Under the hood:
// 1. Oracle triggers FHE.decrypt(encryptedPrice)
// 2. Fhenix network encrypts the plaintext
// 3. Result stored in Fhenix decryption cache (~1 block)
```

**Transaction 2: Retrieve Plaintext (next block or later)**

```solidity
// Same caller retrieves plaintext price
uint64 plainPrice = oracle.getDecryptionResult(requestId);
// plainPrice = 500 (representing $5.00)

// Alternative: Safe variant that won't revert if not ready
(uint64 price, bool isReady) = oracle.tryGetDecryptionResult(requestId);
if (isReady) {
    // Use price
} else {
    // Not ready yet, try again in next block
}
```

**Why Two Transactions?**
- Fhenix network needs time to decrypt (happens off-chain, results posted next block)
- Cannot retrieve plaintext in same transaction (reverts or returns stale data)
- Forced separation prevents MEV (bots can't sandwich both steps into single block)

### Batch Operations

```solidity
// Update multiple prices in one transaction
string[] memory commodities = ["COFFEE", "COPPER", "GOLD"];
InEuint64[] memory prices = [
    encryptionSDK.encrypt(500),   // COFFEE: $5.00
    encryptionSDK.encrypt(50000), // COPPER: $500.00
    encryptionSDK.encrypt(2000000) // GOLD: $20,000.00
];
uint256[] memory confidences = [95, 98, 96];

oracle.batchUpdatePrices(commodities, prices, confidences, "MultiSource");
```

### Using Helper Contract

```solidity
// Initialize helper
PriceEncryptionHelper helper = new PriceEncryptionHelper(address(oracle));

// Authorize decryptors (besides owner)
helper.authorizeDecryptor(trader1);
helper.authorizeDecryptor(farmer2);

// Request decryption
bytes32 requestId = helper.requestPriceDecryption("COFFEE");

// Get result (in next transaction)
uint64 plainPrice = helper.getDecryptedPrice(requestId);

// Cache for quick access (5-minute TTL)
helper.cachePriceForCommodity("COFFEE", plainPrice);

// Later, check cache
(uint64 cached, bool isFresh) = helper.getCachedPrice("COFFEE");
if (isFresh) {
    // Use cached price (no decryption needed)
} else {
    // Cache expired, re-decrypt
}
```

## Encrypted Operations

### Price Validation (Without Revealing Price)

```solidity
// Oracle automatically validates prices using FHE
// In updatePrice():

ebool isAboveMin = FHE.gte(price, ENCRYPTED_MIN_PRICE);
ebool isBelowMax = FHE.lte(price, ENCRYPTED_MAX_PRICE);
ebool isValid = FHE.and(isAboveMin, isBelowMax);

// If validation fails:
// - Price still stored (encrypted)
// - But marked invalid
// - Actual value never exposed to contract or MEV bots
```

### Encrypted TWAP Calculation

```solidity
// Calculate time-weighted average price on encrypted data
euint64 twap = oracle.getEncryptedTWAP("COFFEE", 60, 40);
// 60% current price + 40% previous price
// Result is encrypted - decryption needed to see plaintext
```

## Access Control Model

### Authorization Levels

| Level | Can Do | Cannot Do |
|-------|--------|-----------|
| Owner | Update prices, authorize/revoke updaters, set parameters, decrypt prices, manage boundaries | None |
| Authorized Updater | Update prices for their assigned commodity | Decrypt prices, manage other updaters |
| Authorized Decryptor | Request decryption, retrieve plaintext prices | Update prices, change oracle settings |
| Public | Read encrypted metadata (timestamp, confidence, freshness) | Access plaintext prices, update prices |

### Store-and-Grant Pattern (Critical)

Every write to encrypted state requires **mandatory** access control:

```solidity
// CORRECT: Store-and-grant pattern
euint64 newPrice = FHE.asEuint64(input);
prices[commodity] = newPrice;
FHE.allowThis(newPrice);    // ✓ Contract can use later
FHE.allowSender(newPrice);  // ✓ Caller can decrypt

// INCORRECT: Forget to grant access
euint64 newPrice = FHE.asEuint64(input);
prices[commodity] = newPrice;
// ✗ Contract later can't operate, caller gets "Access denied"
```

## Gas Costs

### Typical Operations

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| updatePrice() | ~120,000 | Includes FHE operations |
| requestDecryption() | ~80,000 | Tx 1 of decryption |
| getDecryptionResult() | ~45,000 | Tx 2, usually in next block |
| getEncryptedTWAP() | ~95,000 | Encrypted computation |
| Batch update (10 prices) | ~800,000 | ~80k per price |

### Cost Analysis
- **Encrypted operations**: 2-3x more expensive than plaintext
- **Worth it for**: High-value markets where MEV losses exceed gas costs
- **Rule of thumb**: Breakeven at ~$1M daily volume

## MEV Protection Guarantees

### What's Protected

✅ **Price values** — Completely encrypted, never visible on-chain
✅ **Front-running** — Bots can't see prices before block inclusion
✅ **Sandwich attacks** — No price data to sandwich
✅ **Flash loans** — Can't use prices for flash loan attacks

### What's Not Protected

❌ **Timestamp** — Update times are public (helps with staleness)
❌ **Commodity names** — "COFFEE" not secret (needed for identification)
❌ **Confidence scores** — Reliability visible (okay - not sensitive)
❌ **Update frequency** — How often prices change is observable

## Deployment Checklist

- [ ] Deploy `EncryptedCommodityPriceOracle`
- [ ] Call `initializeEncryptedBounds()` with min/max prices
- [ ] Authorize price updaters with `authorizeUpdater()`
- [ ] Deploy `PriceEncryptionHelper`
- [ ] Authorize decryptors with helper
- [ ] Add commodities with `addSupportedCommodity()`
- [ ] Set staleness threshold if needed (default: 1 hour)
- [ ] Set minimum confidence if needed (default: 50%)
- [ ] Monitor `PriceUpdated` events to confirm prices updating
- [ ] Test decryption workflow (two separate transactions)

## Troubleshooting

### "Not authorized" Error

**Problem**: `requestDecryption()` reverts with "Not authorized"

**Solution**: Only the price updater or owner can decrypt. Ensure caller is one of these.

### "Access denied" Error

**Problem**: Can't operate on encrypted value

**Solution**: Missing `FHE.allowThis()` or `FHE.allowSender()`. Check store-and-grant pattern.

### Decryption Returns 0

**Problem**: `getDecryptionResult()` returns 0 instead of price

**Causes**:
1. Calling in same transaction as `requestDecryption()` (need next block)
2. Calling with wrong requestId
3. Decryption not ready yet (use `tryGetDecryptionResult()` for safe check)

### Transaction Reverts with No Message

**Problem**: updatePrice() reverts silently

**Causes**:
1. Encrypted bounds not initialized (call `initializeEncryptedBounds()` first)
2. Arrays length mismatch in batch operations
3. Caller not authorized

## Integration Example

```solidity
pragma solidity ^0.8.19;

import "./EncryptedCommodityPriceOracle.sol";
import "./PriceEncryptionHelper.sol";

contract CommodityTradingDApp {
    
    EncryptedCommodityPriceOracle public oracle;
    PriceEncryptionHelper public helper;
    
    constructor(address _oracle) {
        oracle = EncryptedCommodityPriceOracle(_oracle);
        helper = new PriceEncryptionHelper(_oracle);
        helper.authorizeDecryptor(msg.sender);
    }
    
    // Example: User wants to check encrypted price freshness
    function isPriceFresh(string memory commodity) external view returns (bool) {
        return oracle.isPriceFresh(commodity);
    }
    
    // Example: Authorized trader decrypts price for trading decision
    function getPriceForTrading(string memory commodity)
        external
        returns (bytes32 requestId)
    {
        // Tx 1: Request decryption
        return helper.requestPriceDecryption(commodity);
    }
    
    // Example: Retrieve plaintext price (next transaction)
    function executeTrade(bytes32 priceRequestId, string memory commodity)
        external
    {
        // Tx 2: Get decrypted price
        uint64 plainPrice = helper.getDecryptedPrice(priceRequestId);
        
        // Use plainPrice for trading logic
        require(plainPrice > 0, "Price not ready");
        
        // Execute trade...
    }
}
```

## References

- **Fhenix Documentation**: https://docs.fhenixprotocol.com
- **CoFHE Contracts**: https://github.com/FhenixProtocol/cofhe-contracts
- **FHE Basics**: https://blog.fhenixprotocol.com/fhe-101

## Questions?

For issues or questions:
1. Check the troubleshooting section above
2. Review `EncryptedCommodityPriceOracle.sol` inline comments
3. Run integration tests: `forge test --match EncryptedCommodityPriceOracleTest`
4. Consult Fhenix documentation
