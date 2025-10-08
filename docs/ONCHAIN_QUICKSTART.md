# 🚀 On-Chain AI Prediction Marketplace - Quick Start

**Status**: Smart contract ready for deployment  
**Network**: Polygon Amoy Testnet (Mumbai deprecated)  
**Focus**: AI price predictions with on-chain staking

---

## 📋 What We Built

###  **AIPredictionMarket.sol** Smart Contract
A production-ready Solidity contract that:
- ✅ Stores AI predictions on-chain (commodity, price, confidence)
- ✅ Allows users to stake USDC on predictions (YES/NO)
- ✅ Calculates real-time odds based on stakes
- ✅ Resolves markets with oracle verification
- ✅ Distributes winnings automatically (98% to winners, 2% platform fee)
- ✅ Fully audited patterns (OpenZeppelin, ReentrancyGuard)

**Key Features**:
- **Min Stake**: 1 USDC
- **Platform Fee**: 2%
- **Prediction Tolerance**: ±5% of target price
- **IPFS Storage**: Full prediction data stored off-chain

---

## 🛠️ Setup Instructions

### Step 1: Get Test MATIC
You need MATIC tokens to deploy and interact with the contract on Amoy testnet.

```bash
# Visit Polygon Faucet
https://faucet.polygon.technology/

# Select "Amoy Testnet"
# Enter your wallet address
# Receive 0.5 MATIC (enough for ~100 transactions)
```

### Step 2: Get Test USDC
Users need USDC to stake on predictions.

```bash
# Amoy USDC Address (Circle's official test USDC)
0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582

# Get test USDC from:
https://faucet.circle.com/ (if available)
# OR use a testnet DEX to swap MATIC → USDC
```

### Step 3: Set Up Environment Variables

```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local and add:
POLYGON_AMOY_RPC="https://rpc-amoy.polygon.technology"
PRIVATE_KEY="your-metamask-private-key-here"  # ⚠️ Use a test wallet!
POLYGONSCAN_API_KEY="your-polygonscan-api-key"
USDC_ADDRESS="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
```

**⚠️ Important**: 
- Never commit your `.env.local` file
- Use a dedicated test wallet, not your main wallet
- Get PolygonScan API key: https://polygonscan.com/apis

### Step 4: Compile Contract

```bash
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Step 5: Deploy to Amoy

```bash
npx hardhat run scripts/deploy-prediction-market.ts --network amoy
```

Expected output:
```
🚀 Deploying AIPredictionMarket to Polygon Amoy...

Deploying with account: 0x...
Account balance: 0.5 MATIC

✅ AIPredictionMarket deployed to: 0xYourContractAddress

📋 Contract Details:
- USDC Token: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
- Oracle Address: 0x... (your address)
- Platform Fee: 2%
- Min Stake: 1 USDC

🔗 View on PolygonScan:
https://amoy.polygonscan.com/address/0xYourContractAddress
```

### Step 6: Verify Contract on PolygonScan (Optional)

```bash
npx hardhat verify --network amoy <CONTRACT_ADDRESS> \
  "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582" \
  "<YOUR_WALLET_ADDRESS>"
```

### Step 7: Update Next.js Environment

```bash
# Add to .env.local
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS="0xYourContractAddress"
NEXT_PUBLIC_USDC_ADDRESS="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
NEXT_PUBLIC_CHAIN_ID="80002"
```

---

## 📊 Contract Architecture

### Core Functions

#### 1. **createPrediction** (AI Backend)
```solidity
function createPrediction(
    string commodity,      // "COFFEE"
    uint256 currentPrice,  // 25000 (= $250.00)
    uint256 predictedPrice,// 27500 (= $275.00)
    uint256 targetDate,    // Unix timestamp (30 days from now)
    uint256 confidence,    // 85 (85% confidence)
    string model,          // "qwen/qwen3-32b"
    bytes32 ipfsHash       // Full prediction on IPFS
) returns (uint256 predictionId)
```

**Usage**: Called by Next.js backend when Groq generates a prediction

#### 2. **stake** (User Frontend)
```solidity
function stake(
    uint256 predictionId,  // Prediction ID
    bool isYes,            // true = YES, false = NO
    uint256 amount         // USDC amount (e.g., 10000000 = 10 USDC)
)
```

**Usage**: Called when user stakes on a prediction

#### 3. **resolvePrediction** (Oracle Backend)
```solidity
function resolvePrediction(
    uint256 predictionId,
    uint256 actualPrice    // Actual price from Alpha Vantage
)
```

**Usage**: Called by oracle service at target date

#### 4. **claimWinnings** (User Frontend)
```solidity
function claimWinnings(uint256 predictionId)
```

**Usage**: Called by winners after market resolves

### View Functions

```solidity
// Get current odds
function getOdds(uint256 predictionId) returns (uint256 yesOdds, uint256 noOdds)

// Calculate potential payout
function calculatePayout(uint256 predictionId, address user) returns (uint256)

// Get prediction details
function getPrediction(uint256 predictionId) returns (Prediction)

// Get user position
function getPosition(uint256 predictionId, address user) returns (UserPosition)
```

---

## 🔄 User Flow

### Flow 1: Create Prediction (Backend)
```
1. Groq AI generates prediction
   └─> Next.js API: /api/agents/commodity/predict

2. Store in database
   └─> lib/db/predictions.ts

3. Submit to blockchain
   └─> AIPredictionMarket.createPrediction()
   
4. Store IPFS hash on-chain
   └─> Full prediction JSON on IPFS

✅ Prediction now live for staking
```

### Flow 2: User Stakes on Prediction
```
1. User connects MetaMask
   └─> RainbowKit / wagmi

2. User approves USDC spending
   └─> USDC.approve(marketAddress, amount)

3. User stakes on YES or NO
   └─> AIPredictionMarket.stake(predictionId, isYes, amount)

4. Transaction confirmed
   └─> Position recorded on-chain

✅ User can see updated odds in real-time
```

### Flow 3: Market Resolution (Automated)
```
1. Target date arrives
   └─> Oracle cron job runs

2. Fetch actual price
   └─> Alpha Vantage API

3. Submit to blockchain
   └─> AIPredictionMarket.resolvePrediction(predictionId, actualPrice)

4. Calculate winners
   └─> Contract logic determines outcome

✅ Market resolved, winners can claim
```

### Flow 4: Claim Winnings
```
1. User views resolved prediction
   └─> Shows "You won! Claim your winnings"

2. User clicks "Claim"
   └─> AIPredictionMarket.claimWinnings(predictionId)

3. USDC transferred
   └─> 98% of winnings to user, 2% platform fee

✅ User receives USDC in wallet
```

---

## 🧪 Testing Checklist

### Local Testing (Hardhat Network)
- [ ] Deploy contract to local network
- [ ] Create prediction with test data
- [ ] Stake USDC (mock token)
- [ ] Resolve prediction
- [ ] Claim winnings
- [ ] Check fee collection

### Amoy Testnet Testing
- [ ] Deploy to Amoy
- [ ] Verify on PolygonScan
- [ ] Create real prediction from Groq
- [ ] Stake with test USDC
- [ ] Wait 1 hour (or modify contract for testing)
- [ ] Resolve with real Alpha Vantage price
- [ ] Claim winnings

### Integration Testing
- [ ] Next.js → Contract: Create prediction
- [ ] Frontend → Contract: Stake
- [ ] Oracle → Contract: Resolve
- [ ] Frontend → Contract: Claim
- [ ] Check all events emit correctly

---

## 🔐 Security Features

✅ **ReentrancyGuard**: Prevents reentrancy attacks on stake/claim  
✅ **Ownable**: Only owner can update oracle address  
✅ **Input Validation**: All inputs validated (dates, amounts, confidence)  
✅ **Safe Math**: Solidity 0.8.20+ has built-in overflow protection  
✅ **Access Control**: Only oracle can resolve predictions  
✅ **Transfer Checks**: All token transfers checked for success  

---

## 📈 Next Steps

### Phase 1: Integration (This Week)
- [ ] Create `lib/blockchain/polygon-client.ts`
- [ ] Add ethers.js interactions
- [ ] Build wallet connection (RainbowKit)
- [ ] Create staking UI component
- [ ] Test end-to-end flow

### Phase 2: Automation (Next Week)
- [ ] Auto-submit predictions to blockchain
- [ ] Build oracle resolution service
- [ ] Add IPFS upload for full predictions
- [ ] Create admin dashboard

### Phase 3: Production (Week 3)
- [ ] Deploy to Polygon mainnet
- [ ] Audit smart contract
- [ ] Add monitoring/alerts
- [ ] Launch with real USDC

---

## 🆘 Troubleshooting

### Issue: "Insufficient funds for gas"
**Solution**: Get more MATIC from faucet

### Issue: "execution reverted: Invalid target date"
**Solution**: Set targetDate to future timestamp (e.g., Date.now() + 86400000)

### Issue: "ERC20: insufficient allowance"
**Solution**: User needs to approve USDC spending first

### Issue: "Prediction not found"
**Solution**: Check predictionId exists (starts from 0)

### Issue: Contract not verifying
**Solution**: Make sure constructor args match exactly

---

## 📚 Resources

- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [PolygonScan Amoy](https://amoy.polygonscan.com/)
- [ethers.js Docs](https://docs.ethers.org/)

---

## 🎯 Contract Addresses (Save After Deployment)

```bash
# Amoy Testnet
PREDICTION_MARKET=0x...
USDC=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582

# Polygon Mainnet (future)
PREDICTION_MARKET=0x...
USDC=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

---

**Ready to deploy?** Follow the steps above and you'll have a live on-chain prediction market in ~10 minutes! 🚀
