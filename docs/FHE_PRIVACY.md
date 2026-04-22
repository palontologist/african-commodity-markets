# Fhenix FHE Privacy Architecture

## Overview

**Fhenix Fully Homomorphic Encryption (FHE)** enables confidential smart contracts on blockchain. For AfriFutures, FHE provides privacy for:
- **Quote matching**: Hidden bid/ask prices until match
- **Order book**: Encrypted order quantities
- **Agent strategies**: Confidential trading algorithms
- **Premium calculations**: Private fee computation

---

## Why FHE for AfriFutures?

### Traditional Problem
```
Farmer: "I want to hedge 500t at KSh 80/kg"
Agent:  Can see ALL orders in book
        Can front-run (buy before farmer)
        Extracts maximum value from farmer
```

### With FHE
```
Farmer: Submit encrypted order
        Enc(quantity=500, price=80)
        
System: Match orders WITHOUT decrypting
        No one sees price until match
        
Result: Fair execution, no front-running
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Fhenix FHNetwork                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  Encrypted  │───▶│   FHE       │───▶│  Encrypted  │ │
│  │    Order    │    │   Match     │    │   Result    │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                 │                   │        │
│         ▼                 ▼                   ▼        │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Confidential Computing Layer            │   │
│  │  • Order matching (encrypted)                  │   │
│  │  • Price averaging                             │   │
│  │  • Premium calculation                         │   │
│  │  • Settlement proof                            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Use Cases

### 1. Encrypted Quote Matching

```solidity
// contracts/FHEQuoteMatching.sol
import "fhe lib";

contract FHEQuoteMatching {
    struct EncryptedQuote {
        euint64 quantity;
        euint64 price;
        bytes32 agentId;
        uint8 side; // 0=BUY, 1=SELL
    }
    
    EncryptedQuote[] public buyOrders;
    EncryptedQuote[] public sellOrders;
    
    function submitEncryptedBuyOrder(
        bytes calldata encryptedQuantity,
        bytes calldata encryptedPrice
    ) external returns (uint256 orderId) {
        orderId = buyOrders.length;
        buyOrders.push(EncryptedQuote({
            quantity: FHE.asEuint64(encryptedQuantity),
            price: FHE.asEuint64(encryptedPrice),
            agentId: keccak256(abi.encodePacked(msg.sender, block.timestamp)),
            side: 0
        }));
    }
    
    function matchOrders() internal {
        // Iterate through all orders
        for (uint i = 0; i < buyOrders.length; i++) {
            for (uint j = 0; j < sellOrders.length; j++) {
                // DECRYPTION HAPPENS HERE - inside TEE
                euint64 buyPrice = buyOrders[i].price;
                euint64 sellPrice = sellOrders[j].price;
                
                // Check if match (buy >= sell)
                ebool canMatch = FHE.lte(sellPrice, buyPrice);
                
                if (FHE.decrypt(canMatch)) {
                    // Execute trade (still encrypted)
                    _executeTrade(i, j);
                }
            }
        }
    }
}
```

### 2. Private Order Book

```solidity
// contracts/EncryptedOrderBook.sol
contract EncryptedOrderBook {
    // Only aggregate statistics are public
    uint256 public totalBuyVolume;
    uint256 public totalSellVolume;
    uint256 public orderCount;
    
    // Individual orders are encrypted
    mapping(bytes32 => EncryptedOrder) private orders;
    
    struct EncryptedOrder {
        euint64 quantity;
        euint64 price;
        uint256 timestamp;
        bool isActive;
    }
    
    function getOrderBookSnapshot() 
        external 
        returns (
            uint256 buyVolume,
            uint256 sellVolume,
            uint256 bestBid,
            uint256 bestAsk
        ) 
    {
        // Only reveal aggregate data
        return (
            FHE.decrypt(totalBuyVolume),
            FHE.decrypt(totalSellVolume),
            getBestBid(),
            getBestAsk()
        );
    }
    
    function getBestBid() internal view returns (uint256) {
        // Return only the highest bid, not all orders
        return FHE.decrypt(highestBid);
    }
}
```

### 3. Confidential Premium Calculation

```solidity
// contracts/FHEPremiumCalculator.sol
contract FHEPremiumCalculator {
    // Risk parameters (public for transparency)
    uint256 public basePremiumRate = 50; // 0.5% = 50 basis points
    
    function calculatePremium(
        bytes calldata encryptedQuantity,
        bytes calldata encryptedStrikePrice,
        bytes calldata encryptedCurrentPrice
    ) external returns (bytes calldata encryptedPremium) {
        
        euint64 quantity = FHE.asEuint64(encryptedQuantity);
        euint64 strikePrice = FHE.asEuint64(encryptedStrikePrice);
        euint64 currentPrice = FHE.asEuint64(encryptedCurrentPrice);
        
        // Calculate notional value (all encrypted)
        euint64 notional = quantity * strikePrice;
        
        // Calculate premium: notional * rate
        euint64 rate = FHE.asEuint64(basePremiumRate);
        euint64 premium = notional * rate / 10000;
        
        // Apply farmer discount based on DVC score
        euint64 dvcDiscount = getDVCScoreDiscount(msg.sender);
        premium = premium * (1000 - dvcDiscount) / 1000;
        
        return FHE.sealData(FHE.asBytes(premium), getEncryptionKey());
    }
    
    function getDVCScoreDiscount(address farmer) internal view returns (euint64) {
        // DVC score affects premium (encrypted comparison)
        uint256 dvcScore = farmerDVC[farmer];
        
        if (dvcScore >= 800) return FHE.asEuint64(20); // 20% discount
        if (dvcScore >= 600) return FHE.asEuint64(10); // 10% discount
        if (dvcScore >= 400) return FHE.asEuint64(5);  // 5% discount
        return FHE.asEuint64(0);
    }
}
```

---

## Privacy Levels

| Data | Public | FHE Private | Fully Private |
|------|--------|-------------|---------------|
| Order book total volume | ✅ | | |
| Best bid/ask | ✅ | | |
| Individual orders | | ✅ | |
| Trade execution | | ✅ | |
| Agent strategies | | | ✅ |
| Premium calculations | | | ✅ |
| Farmer DVC scores | | | ✅ |

---

## Integration Flow

```
1. Farmer submits order
   ↓
2. Frontend encrypts with Fhenix public key
   ↓
3. Encrypted order submitted to blockchain
   ↓
4. Fhenix FHE coprocessor:
   - Validates order
   - Matches with counterparty
   - Calculates premium
   ↓
5. Encrypted result returned
   ↓
6. Farmer decrypts with private key
   ↓
7. Settlement on Polygon
```

---

## SDK Integration

```typescript
// lib/fhe/client.ts
import { FhenixClient, EncryptedNumber } from '@fhenix/sdk';

const fhenix = new FhenixClient();

export async function submitEncryptedOrder(
  side: 'BUY' | 'SELL',
  quantity: number,
  price: number
) {
  // Encrypt sensitive data
  const encryptedQuantity = fhenix.encrypt(quantity);
  const encryptedPrice = fhenix.encrypt(price);
  
  // Submit to smart contract
  const tx = await contract.submitEncryptedOrder(
    encryptedQuantity,
    encryptedPrice,
    side === 'BUY' ? 0 : 1
  );
  
  // Wait for FHE processing
  const receipt = await tx.wait();
  
  // Get encrypted result
  const encryptedResult = await contract.getOrderResult(receipt.transactionHash);
  
  // Decrypt result (only client can do this)
  const result = fhenix.decrypt(encryptedResult);
  
  return result;
}
```

---

## Comparison: Traditional vs FHE

| Aspect | Traditional | FHE |
|--------|-------------|-----|
| Front-running | Possible | Impossible |
| Order visibility | Full transparency | Encrypted until match |
| Price discovery | Immediate | Delayed (match time) |
| Gas cost | Low | Higher (FHE computation) |
| Complexity | Simple | Complex |
| Trust model | Blockchain only | FHE + Blockchain |

---

## Performance Considerations

| Operation | Traditional Gas | FHE Gas | Overhead |
|-----------|----------------|---------|----------|
| Submit order | 50,000 | 150,000 | 3x |
| Match orders | 100,000 | 500,000 | 5x |
| Calculate premium | 20,000 | 80,000 | 4x |
| Settle trade | 80,000 | 120,000 | 1.5x |

**Note**: FHE gas costs will decrease as Fhenix network matures.

---

## Roadmap

### Phase 1: Basic FHE (Q4 2025)
- [ ] Fhenix testnet integration
- [ ] Encrypted order submission
- [ ] Basic quote matching

### Phase 2: Advanced FHE (Q1 2026)
- [ ] Full order book encryption
- [ ] Private premium calculations
- [ ] Agent strategy protection

### Phase 3: Production (Q2 2026)
- [ ] Mainnet deployment
- [ ] Performance optimization
- [ ] Multi-chain support (Fhenix → Polygon bridge)

---

## Security Properties

1. **Confidentiality**: Order prices/quantities never revealed publicly
2. **Integrity**: Orders cannot be tampered with before matching
3. **Fairness**: No front-running or information leakage
4. **Verifiability**: All operations provable on-chain

---

## References

- [Fhenix Documentation](https://docs.fhenix.io)
- [ fhEVM Library](https://github.com/zama-ai/fhevm)
- [Zama TFHE-rs](https://github.com/zama-ai/tfhe-rs)
