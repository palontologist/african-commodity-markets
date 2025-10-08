# Data Sources Analysis & Roadmap to Real Data

## 📊 Current Data Sources for AI Insights

### 1. **How Agent Generates Insights Currently**

The AI agent (`lib/agents/agent.ts`) generates predictions using:

```typescript
// Data Flow:
generatePrediction() 
  → getLivePrice(symbol, region)           // From lib/live-prices.ts
  → getHistoricalPrices(commodityId, 30)  // From database
  → buildPredictionPrompt()                // Combines data + AI context
  → runGroqChat()                          // Groq AI (qwen/qwen3-32b)
  → Store in database                      // commodity_predictions table
```

#### **Current Data Sources:**
1. **Live Prices** (`lib/live-prices.ts`):
   - ❌ **DUMMY DATA** - Hardcoded mock prices
   - Returns random prices between ranges
   - NOT real market data

2. **Historical Prices** (`lib/db/schema.ts` - `commodity_prices` table):
   - ⚠️ **MOSTLY EMPTY** - Only seed data
   - Need real historical data ingestion

3. **AI Context** (`lib/agents/prompts.ts`):
   - ✅ **REAL** - Commodity-specific market knowledge
   - Weather patterns, demand factors, supply chain info

4. **Groq LLM**:
   - ✅ **REAL** - Actual AI model (qwen/qwen3-32b)
   - Generates predictions based on provided context

### 2. **Commodities Currently Supported**

#### **In Agent/Insights Page:**
Currently supports these 4 commodities:
```typescript
// app/insights/page.tsx
commodities = [
  { symbol: 'COFFEE', label: 'Coffee', region: 'AFRICA' },
  { symbol: 'COCOA', label: 'Cocoa', region: 'AFRICA' },
  { symbol: 'COTTON', label: 'Cotton', region: 'AFRICA' },
  { symbol: 'CASHEW', label: 'Cashew', region: 'AFRICA' },
]
```

#### **In Market Page:**
Supports these 4 different commodities:
```typescript
// app/market/page.tsx
commodities = [
  { id: "tea", name: "Tea", ... },
  { id: "coffee", name: "Coffee", ... },
  { id: "avocado", name: "Avocado", ... },
  { id: "macadamia", name: "Macadamia", ... },
]
```

#### **In Agent System (Backend):**
Full support for 6 commodities:
```typescript
// lib/agents/prompts.ts
COMMODITY_CONTEXT = {
  COCOA, COFFEE, TEA, GOLD, AVOCADO, MACADAMIA
}
```

### 3. **Data Synchronization Issues**

**PROBLEM:** Mismatch between pages!
- Insights page: COFFEE, COCOA, COTTON, CASHEW
- Market page: TEA, COFFEE, AVOCADO, MACADAMIA
- Agent system: All 6 commodities

**SOLUTION:** Standardize to 6 commodities everywhere.

---

## 🎯 Action Plan: Move to Real Data

### Phase 1: Add Missing Commodities to Insights ✅ (Immediate)

**Task:** Update insights page to include all 6 commodities:
- COFFEE ✅
- COCOA ✅
- TEA ❌ (add)
- GOLD ❌ (add)
- AVOCADO ❌ (add)
- MACADAMIA ❌ (add)

**Files to Update:**
1. `app/insights/page.tsx` - Add missing commodities
2. `app/api/cron/generate-insights/route.ts` - Update commodity list
3. Sync with market page commodities

### Phase 2: Replace Dummy Price Data 🔴 (HIGH PRIORITY)

#### **Option A: Real Market Data APIs (Recommended)**

**Free/Affordable APIs for Commodity Prices:**

1. **Alpha Vantage** (Free tier: 25 requests/day)
   - https://www.alphavantage.co/
   - Commodities: COFFEE, COCOA, GOLD
   - Format: JSON REST API
   
2. **Quandl/Nasdaq Data Link** (Free tier available)
   - https://data.nasdaq.com/
   - Agricultural commodities, metals
   - Historical data available

3. **World Bank Commodity Prices** (Free)
   - https://www.worldbank.org/en/research/commodity-markets
   - Monthly data for major commodities
   - CSV/API format

4. **UNCTAD Commodity Price Statistics** (Free)
   - https://unctadstat.unctad.org/
   - African commodity focus
   - Monthly data

5. **ICO Coffee Prices** (Free)
   - https://www.ico.org/prices/po-production.pdf
   - Official coffee organization data
   - African coffee specific

6. **ICCO Cocoa Prices** (Free)
   - https://www.icco.org/
   - Official cocoa organization
   - Daily cocoa prices

**Implementation:**
```typescript
// lib/live-prices.ts - Replace with real API
export async function getLivePrice(
  symbol: CommoditySymbol,
  region: Region
): Promise<LivePriceResponse> {
  // Call real API (Alpha Vantage, World Bank, etc.)
  const response = await fetch(
    `https://www.alphavantage.co/query?function=COMMODITY&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
  )
  
  const data = await response.json()
  return {
    symbol,
    price: data.price,
    currency: 'USD',
    source: 'Alpha Vantage',
    timestamp: new Date()
  }
}
```

#### **Option B: On-Chain Oracle Integration**

**Use Chainlink Price Feeds:**
- https://docs.chain.link/data-feeds/price-feeds
- Real-time commodity prices on-chain
- Gold, Silver, Oil available
- Can aggregate with Polygon

**Implementation:**
```solidity
// contracts/CommodityPriceOracle.sol
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract CommodityPriceOracle {
    AggregatorV3Interface internal goldPriceFeed;
    
    function getLatestGoldPrice() public view returns (int) {
        (, int price, , ,) = goldPriceFeed.latestRoundData();
        return price;
    }
}
```

#### **Option C: Hybrid Approach (Best)**

Combine multiple sources for reliability:
1. **Primary:** Real API (Alpha Vantage, World Bank)
2. **Fallback:** Chainlink oracles for metals
3. **Cache:** Store in database for offline access

### Phase 3: Implement Real Market Settlement 🔴 (HIGH PRIORITY)

**Current Problem:**
- Market page has dummy YES/NO prices
- No real settlement mechanism
- Users can't actually trade

**Solution: Build Real Prediction Market System**

#### **Architecture:**

```
┌─────────────────────────────────────────────┐
│          Prediction Market Flow             │
└─────────────────────────────────────────────┘

1. Market Creation
   ↓
2. Users Buy YES/NO shares
   ↓
3. Event occurs (price reaches X by date Y)
   ↓
4. Oracle verifies outcome
   ↓
5. Settlement: Winners get paid
```

#### **Database Schema Updates:**

```typescript
// Add to lib/db/schema.ts

export const marketEvents = pgTable('market_events', {
  id: serial('id').primaryKey(),
  marketId: integer('market_id').references(() => markets.id),
  eventType: text('event_type'), // 'CREATED', 'TRADED', 'SETTLED'
  userId: integer('user_id').references(() => users.id),
  data: jsonb('data'), // Trade details, settlement data
  timestamp: timestamp('timestamp').defaultNow()
})

export const userPositions = pgTable('user_positions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  marketId: integer('market_id').references(() => markets.id),
  side: text('side'), // 'YES' or 'NO'
  shares: integer('shares'),
  avgPrice: numeric('avg_price'),
  pnl: numeric('pnl'), // Profit/Loss
  settled: boolean('settled').default(false)
})

export const settlements = pgTable('settlements', {
  id: serial('id').primaryKey(),
  marketId: integer('market_id').references(() => markets.id),
  outcome: boolean('outcome'), // true = YES wins, false = NO wins
  settledPrice: numeric('settled_price'),
  oracleSource: text('oracle_source'),
  settledAt: timestamp('settled_at').defaultNow()
})
```

#### **Settlement Logic:**

```typescript
// lib/settlement.ts

export async function settleMarket(marketId: number) {
  // 1. Fetch market question and deadline
  const market = await getMarket(marketId)
  
  // 2. Check if deadline passed
  if (new Date() < market.deadline) {
    throw new Error('Market not yet expired')
  }
  
  // 3. Fetch outcome from oracle (real price data)
  const outcome = await verifyOutcome(market)
  
  // 4. Calculate payouts
  const positions = await getUserPositions(marketId)
  
  for (const position of positions) {
    const payout = calculatePayout(position, outcome)
    await creditUser(position.userId, payout)
  }
  
  // 5. Mark market as settled
  await db.insert(settlements).values({
    marketId,
    outcome,
    settledPrice: outcome.price,
    oracleSource: 'Alpha Vantage'
  })
}

function calculatePayout(
  position: UserPosition, 
  outcome: boolean
): number {
  // If user bet YES and outcome is YES, payout $1 per share
  // If user bet NO and outcome is NO, payout $1 per share
  // Otherwise, payout is 0
  
  const won = (position.side === 'YES' && outcome) || 
              (position.side === 'NO' && !outcome)
  
  return won ? position.shares * 1.0 : 0
}
```

### Phase 4: Integrate with Whitepaper Vision 📄 (Alignment)

**Review whitepaper for:**
1. ✅ DeFi-native commodity markets - Building now
2. ✅ AI-powered predictions - Already implemented
3. ⚠️ Tokenized commodities - Need ERC-20 contracts
4. ⚠️ Liquidity pools - Need AMM implementation
5. ⚠️ Cross-border payments - Need Polygon integration

**Whitepaper Alignment Checklist:**
- [ ] Read full whitepaper
- [ ] Extract technical requirements
- [ ] Map to current features
- [ ] Identify gaps
- [ ] Create implementation roadmap

### Phase 5: ML Models on Polygon 🔮 (Next Feature)

**Goal:** Run ML price prediction models on Polygon blockchain

#### **Architecture Options:**

**Option A: Off-Chain ML + On-Chain Results**
```
ML Model (Python/TensorFlow)
  ↓ (train off-chain)
Predictions Generated
  ↓ (submit to blockchain)
Smart Contract Stores Results
  ↓
Users Access Predictions
```

**Option B: Fully On-Chain ML (Advanced)**
```
Upload Model to IPFS/Arweave
  ↓
Smart Contract with Inference Logic
  ↓
Execute Predictions On-Chain
```

#### **Recommended Approach:**

**Use Polygon for:**
1. **Storing Predictions:** Write predictions to smart contract
2. **Oracles:** Chainlink for price feeds
3. **Settlements:** Execute market settlements on-chain
4. **Payments:** Handle winning payouts via smart contracts

**Keep Off-Chain:**
1. **ML Training:** Python/TensorFlow in cloud
2. **Heavy Computation:** Groq AI for text generation
3. **Database:** Turso for historical data

#### **Implementation Plan:**

**Step 1: Deploy Contracts to Polygon**
```solidity
// contracts/CommodityPredictions.sol
pragma solidity ^0.8.0;

contract CommodityPredictions {
    struct Prediction {
        string commodity;
        uint256 predictedPrice;
        uint256 confidence;
        uint256 timestamp;
        address predictor;
    }
    
    mapping(bytes32 => Prediction) public predictions;
    
    function submitPrediction(
        string memory commodity,
        uint256 predictedPrice,
        uint256 confidence
    ) external {
        bytes32 id = keccak256(
            abi.encodePacked(commodity, block.timestamp)
        );
        
        predictions[id] = Prediction({
            commodity: commodity,
            predictedPrice: predictedPrice,
            confidence: confidence,
            timestamp: block.timestamp,
            predictor: msg.sender
        });
    }
    
    function getPrediction(bytes32 id) 
        external view returns (Prediction memory) {
        return predictions[id];
    }
}
```

**Step 2: Connect Next.js to Polygon**
```typescript
// lib/blockchain/polygon.ts
import { ethers } from 'ethers'

const POLYGON_RPC = 'https://polygon-rpc.com'
const PREDICTIONS_CONTRACT = '0x...'

export async function submitPredictionToChain(
  commodity: string,
  predictedPrice: number,
  confidence: number
) {
  const provider = new ethers.JsonRpcProvider(POLYGON_RPC)
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY!,
    provider
  )
  
  const contract = new ethers.Contract(
    PREDICTIONS_CONTRACT,
    ABI,
    wallet
  )
  
  const tx = await contract.submitPrediction(
    commodity,
    ethers.parseUnits(predictedPrice.toString(), 8),
    Math.floor(confidence * 100)
  )
  
  await tx.wait()
  return tx.hash
}
```

**Step 3: Train ML Models**
```python
# ml/train_model.py
import tensorflow as tf
import pandas as pd

def train_commodity_model(commodity: str):
    # Load historical data
    data = pd.read_csv(f'data/{commodity}_prices.csv')
    
    # Feature engineering
    X = prepare_features(data)
    y = data['price'].shift(-1)  # Next day price
    
    # Build model
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(50, return_sequences=True),
        tf.keras.layers.LSTM(50),
        tf.keras.layers.Dense(25),
        tf.keras.layers.Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=100, batch_size=32)
    
    # Save model
    model.save(f'models/{commodity}_predictor.h5')
```

**Step 4: Integrate ML + Blockchain**
```typescript
// app/api/ml/predict/route.ts
export async function POST(request: Request) {
  const { commodity, historicalData } = await request.json()
  
  // 1. Run ML prediction (call Python microservice)
  const mlPrediction = await fetch('http://ml-service/predict', {
    method: 'POST',
    body: JSON.stringify({ commodity, data: historicalData })
  })
  
  const { predictedPrice, confidence } = await mlPrediction.json()
  
  // 2. Submit to Polygon blockchain
  const txHash = await submitPredictionToChain(
    commodity,
    predictedPrice,
    confidence
  )
  
  // 3. Store in database
  await db.insert(mlPredictions).values({
    commodity,
    predictedPrice,
    confidence,
    blockchainTxHash: txHash,
    timestamp: new Date()
  })
  
  return Response.json({ success: true, txHash })
}
```

---

## 📋 Priority Task List

### 🔥 Immediate (This Week)
1. ✅ Add TEA, AVOCADO, MACADAMIA, GOLD to insights page
2. ✅ Sync commodities across all pages
3. 🔴 Replace dummy live price data with real API
4. 🔴 Set up Alpha Vantage or World Bank API

### 📊 Short Term (2 Weeks)
1. Build real market settlement system
2. Add user positions tracking
3. Implement oracle-based outcome verification
4. Add historical price data ingestion
5. Review whitepaper and create alignment doc

### 🚀 Medium Term (1 Month)
1. Deploy smart contracts to Polygon testnet
2. Build ML model training pipeline
3. Create ML prediction microservice
4. Integrate blockchain storage for predictions
5. Add liquidity pool features

### 🎯 Long Term (2-3 Months)
1. Launch on Polygon mainnet
2. Full ML model deployment
3. Tokenized commodity assets
4. Cross-border payment integration
5. Mobile app development

---

## 🛠️ Technical Stack Needed

### For Real Data:
- [ ] Alpha Vantage API key
- [ ] World Bank data scraper
- [ ] Chainlink oracle integration
- [ ] Cron jobs for data refresh

### For Settlement:
- [ ] Market settlement engine
- [ ] Outcome verification system
- [ ] Payout calculation logic
- [ ] User balance management

### For ML on Polygon:
- [ ] TensorFlow/PyTorch setup
- [ ] Python microservice (FastAPI)
- [ ] Polygon RPC connection
- [ ] Ethers.js integration
- [ ] Smart contract deployment

### For Liquidity Pools:
- [ ] AMM smart contracts
- [ ] LP token contracts
- [ ] Swap interface
- [ ] Liquidity analytics

---

## 📝 Next Steps

1. **Read whitepaper thoroughly** - Extract all technical requirements
2. **Sign up for data APIs** - Alpha Vantage, World Bank accounts
3. **Update insights page** - Add missing commodities (immediate fix)
4. **Replace dummy data** - Integrate real price APIs
5. **Design settlement system** - Database schema + logic
6. **Set up Polygon testnet** - Wallet, RPC, test MATIC
7. **Plan ML infrastructure** - Python service architecture

Would you like me to start with any of these tasks immediately?
