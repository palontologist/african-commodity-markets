# FHE Pricing Protection - Deployment Guide

## Overview

This guide covers deploying the Fhenix Fully Homomorphic Encryption (FHE) pricing infrastructure for the African Commodity Markets platform.

## Prerequisites

### Environment Setup

1. **Node.js & npm**
   ```bash
   node --version  # v18+ recommended
   npm --version   # v9+
   ```

2. **Foundry** (for testing)
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   ~/.foundry/bin/foundryup
   ```

3. **Git**
   ```bash
   git --version  # v2.30+
   ```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/palontologist/african-commodity-markets.git
cd african-commodity-markets

# 2. Install dependencies (includes Fhenix packages)
npm install
# or
pnpm install

# 3. Verify Fhenix packages installed
npm list @fhenixprotocol/cofhe-contracts @fhenixprotocol/cofhe-mock-contracts
```

## Contracts Overview

### EncryptedCommodityPriceOracle
- **File**: `contracts/EncryptedCommodityPriceOracle.sol`
- **Purpose**: Main smart contract storing prices as encrypted values
- **Key Features**:
  - Stores prices as `euint64` (encrypted)
  - Validates prices using FHE operations
  - Manages two-transaction decryption workflow
  - Enforces access control

### PriceEncryptionHelper
- **File**: `contracts/PriceEncryptionHelper.sol`
- **Purpose**: Utility for coordinating encryption workflows
- **Key Features**:
  - Manages decryptor authorization
  - Caches decrypted prices (5-minute TTL)
  - Bridges encrypted/plaintext data

## Deployment Steps

### Step 1: Deploy EncryptedCommodityPriceOracle

```solidity
// Example deployment script (scripts/deploy-fhe-oracle.ts)

import { ethers } from "hardhat";

async function main() {
  console.log("Deploying EncryptedCommodityPriceOracle...");
  
  const EncryptedOracle = await ethers.getContractFactory(
    "EncryptedCommodityPriceOracle"
  );
  
  const oracle = await EncryptedOracle.deploy();
  await oracle.deployed();
  
  console.log(`Oracle deployed to: ${oracle.address}`);
  
  // Save address for later use
  const deploymentData = {
    network: hre.network.name,
    oracle: oracle.address,
    deployer: await ethers.getSigners().then(s => s[0].address),
    timestamp: new Date().toISOString(),
  };
  
  console.log(JSON.stringify(deploymentData, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Step 2: Initialize Encrypted Bounds

```solidity
// After deployment, initialize acceptable price ranges

// Example: COPPER prices between $100 - $5,000
const minPriceCopper = 10000;   // $100 in cents
const maxPriceCopper = 500000;  // $5,000 in cents

// Encrypt using Fhenix SDK
const { Fhenix } = require("@fhenixprotocol/fhenix-sdk");
const encryptedMin = await Fhenix.encrypt(minPriceCopper);
const encryptedMax = await Fhenix.encrypt(maxPriceCopper);

// Send to contract
const initTx = await oracle.initializeEncryptedBounds(
  encryptedMin,
  encryptedMax
);
await initTx.wait();

console.log("Encrypted bounds initialized");
```

### Step 3: Deploy PriceEncryptionHelper

```solidity
// Deploy helper contract with oracle reference

const PriceHelper = await ethers.getContractFactory(
  "PriceEncryptionHelper"
);

const helper = await PriceHelper.deploy(oracle.address);
await helper.deployed();

console.log(`Helper deployed to: ${helper.address}`);

// Authorize decryptors
const decryptors = [
  "0x...",  // Trader 1
  "0x...",  // Farmer 2
  "0x...",  // Coop 3
];

for (const decryptor of decryptors) {
  const tx = await helper.authorizeDecryptor(decryptor);
  await tx.wait();
  console.log(`Authorized ${decryptor}`);
}
```

### Step 4: Authorize Price Updaters

```solidity
// Authorize addresses that can update prices

const updaters = [
  "0x...",  // CoinGecko API endpoint
  "0x...",  // Local data provider
  "0x...",  // Exchange API endpoint
];

for (const updater of updaters) {
  const tx = await oracle.authorizeUpdater(updater);
  await tx.wait();
  console.log(`Authorized updater: ${updater}`);
}
```

### Step 5: Add Supported Commodities

```solidity
// Define supported commodities

const commodities = [
  "COPPER",
  "COFFEE",
  "GOLD",
  "MAIZE",
  "WHEAT",
  "COCOA",
];

for (const commodity of commodities) {
  const tx = await oracle.addSupportedCommodity(commodity);
  await tx.wait();
  console.log(`Added commodity: ${commodity}`);
}
```

### Step 6: Configure Price Ranges per Commodity

```solidity
// Different commodities have different price ranges
// This validation is done at updatePrice time

const priceRanges = {
  COPPER: { min: 10000, max: 500000 },    // $100 - $5,000
  COFFEE: { min: 100, max: 1000 },        // $1 - $10
  GOLD: { min: 50000, max: 10000000 },    // $500 - $100,000
  MAIZE: { min: 10, max: 1000 },          // $0.10 - $10
  WHEAT: { min: 100, max: 2000 },         // $1 - $20
};

// Store these for reference (could be stored in contract if needed)
console.log("Price ranges configured:", priceRanges);
```

## Testing Deployment

### Unit Tests

```bash
# Run Foundry tests
forge test --match EncryptedCommodityPriceOracleTest -vvv

# Run specific test
forge test --match "test_updatePriceStoresEncryptedValue" -vvv

# Run with coverage
forge coverage --match EncryptedCommodityPriceOracleTest
```

### Integration Tests

```bash
# Test with local network
npx hardhat test test/integration/fhe-oracle.test.ts --network localhost

# Test with Sepolia testnet
npx hardhat test test/integration/fhe-oracle.test.ts --network sepolia
```

### Verification Checklist

- [ ] Oracle deployed and address recorded
- [ ] Encrypted bounds initialized
- [ ] Helper contract deployed
- [ ] Price updaters authorized
- [ ] Decryptors authorized
- [ ] Commodities added
- [ ] At least one test price update succeeds
- [ ] Test decryption workflow (two transactions)
- [ ] All unit tests pass
- [ ] Integration tests pass

## Production Deployment

### Testnet Deployment (Sepolia)

```bash
# Set environment variables
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="0x..."

# Deploy to Sepolia
npx hardhat run scripts/deploy-fhe-oracle.ts --network sepolia

# Verify on block explorer
npx hardhat verify --network sepolia \
  0xContractAddress "constructor args if any"
```

### Mainnet Deployment (Polygon/Base)

```bash
# Use production environment variables
export POLYGON_RPC_URL="https://polygon-rpc.com"
export MAINNET_PRIVATE_KEY="0x..."

# Deploy
npx hardhat run scripts/deploy-fhe-oracle.ts --network polygon

# Verify
npx hardhat verify --network polygon 0xContractAddress
```

## Configuration Management

### Environment Variables (.env.local)

```env
# RPC Endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BASE_RPC_URL=https://mainnet.base.org

# Private Keys (never commit these!)
DEPLOYER_PRIVATE_KEY=0x...
UPDATER_PRIVATE_KEY=0x...

# Fhenix Configuration
FHENIX_NETWORK=sepolia  # or mainnet when available
FHENIX_SDK_KEY=your_sdk_key

# Addresses (set after deployment)
ENCRYPTED_ORACLE_ADDRESS=0x...
PRICE_HELPER_ADDRESS=0x...
```

### Deployed Addresses Registry

Create `deployments/addresses.json`:

```json
{
  "sepolia": {
    "EncryptedCommodityPriceOracle": "0x...",
    "PriceEncryptionHelper": "0x...",
    "deployer": "0x...",
    "deployedAt": "2025-06-02T10:30:00Z"
  },
  "polygon": {
    "EncryptedCommodityPriceOracle": "0x...",
    "PriceEncryptionHelper": "0x...",
    "deployer": "0x...",
    "deployedAt": "2025-06-02T11:00:00Z"
  }
}
```

## Upgrading Contracts

### Adding New Commodities

```bash
# Call via script
npx hardhat run scripts/add-commodity.ts --network sepolia

# Or directly from CLI if contract is verified
cast send 0xOracleAddress "addSupportedCommodity(string)" '"SILVER"' \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL
```

### Updating Price Ranges

If price ranges need adjustment, create new oracle instance or add new version:

```solidity
// Option 1: Update bounds (requires new oracle)
// Option 2: Add bounds adjustment function (breaking change)
// Option 3: Use versioned oracles: EncryptedOracleV2

// Recommended: Gradual migration path
// Keep old oracle running, new one accepts new prices
```

## Monitoring & Maintenance

### Key Metrics to Track

1. **Update Frequency**
   ```bash
   # Monitor PriceUpdated events
   cast events 0xOracleAddress --topics 0x... --from-block 1
   ```

2. **Staleness**
   ```solidity
   (totalCommodities, freshPrices, stalePrices, updaterCount, initialized) = 
     oracle.getOracleStats();
   // Alert if stalePrices > 0
   ```

3. **Gas Costs**
   ```bash
   # Calculate average gas per update
   # Sum all updatePrice tx costs / number of updates
   ```

### Regular Maintenance

```bash
# Weekly: Check oracle health
npx hardhat run scripts/health-check.ts --network sepolia

# Monthly: Verify authorized updaters are still valid
cast call 0xOracleAddress "getAuthorizedUpdaters()" \
  --rpc-url $RPC_URL

# Quarterly: Review and update price ranges if needed
# Annually: Plan for contract upgrades/improvements
```

## Troubleshooting

### Common Deployment Issues

**Issue**: `@fhenixprotocol/cofhe-contracts not found`
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Solidity version mismatch
```bash
# Check hardhat.config.ts - ensure solc version 0.8.19
# Or update foundry.toml solc version
```

**Issue**: Encrypted bounds initialization fails
```bash
# Ensure prices are encrypted using Fhenix SDK
# Check that minPrice < maxPrice
# Verify both prices fit in uint64 range
```

## Security Considerations

### Pre-Deployment Checklist

- [ ] Private keys never hardcoded or committed
- [ ] Contracts audited by security firm
- [ ] All authorized addresses verified (typo check)
- [ ] Price ranges validated for all commodities
- [ ] Emergency pause functionality considered
- [ ] Access control properly set (not all functions public)

### Ongoing Security

- [ ] Monitor for unauthorized access attempts
- [ ] Keep FHE library updated
- [ ] Regular code audit for new features
- [ ] Access control reviews quarterly
- [ ] Decryption logs maintained

## Support & Resources

- **Fhenix Docs**: https://docs.fhenixprotocol.com
- **Foundry Book**: https://book.getfoundry.sh
- **Hardhat Docs**: https://hardhat.org/docs
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com

## Next Steps

1. ✅ Deploy oracle to testnet
2. ✅ Run comprehensive tests
3. ✅ Set up monitoring
4. ✅ Integrate with price feeds
5. ✅ Deploy to mainnet
6. ✅ Monitor production metrics
7. ✅ Plan for upgrades/improvements

---

**Deployment Date**: [To be filled on deployment]  
**Network**: Sepolia (testnet) / Polygon (mainnet)  
**Contact**: Commodity Markets Team
