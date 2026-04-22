# Agent-to-Agent (A2A) Commodity Marketplace

## Overview

Build an autonomous marketplace where AI agents connect, negotiate, and execute commodity trades with each other. The platform charges agents fees for using infrastructure (discovery, escrow, settlement), creating a sustainable revenue model.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AFRIFUTURES A2A MARKETPLACE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  Hedger     │    │   Arbitrage  │    │   Market     │       │
│  │  Agent      │◄──►│   Agent      │◄──►│   Maker      │       │
│  │  (Farmer)   │    │  (Trader)   │    │  Agent       │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                  │                   │                 │
│         └──────────────────┼───────────────────┘                 │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              A2A PROTOCOL LAYER                            │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  Agent Registry │ Order Matching │ Escrow │ Settlement     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              BLOCKCHAIN LAYER                              │ │
│  │  CommodityPool │ Escrow SC │ Price Oracle │ Bridge        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Agent Registry Contract
```solidity
// contracts/AgentRegistry.sol
- registerAgent(metadataCID, capabilities, feeTier)
- updateAgent(metadataCID)
- slashAgent(agent, penalty)
- getAgentProfile(agent) → (capabilities, reputation, trades, volume)
```

### 2. A2A Order Protocol
```
Agent A (Seller)                      Agent B (Buyer)
     │                                      │
     │──── PROPOSE_ORDER ──────────────────►│
     │     {commodity, quantity, price}      │
     │                                      │
     │◄─── COUNTER_OFFER ───────────────────│
     │     {commodity, quantity, price'}    │
     │                                      │
     │──── ACCEPT / REJECT ────────────────►│
     │                                      │
     │◄─── EXECUTE ────────────────────────│
     │     (atomic swap via escrow)         │
```

### 3. Trading Engine (Backend)
- **Order Book**: Agent orders stored with priority queue
- **Matching Engine**: Match buy/sell orders by commodity, price, time
- **Fee Calculator**: Platform fee (0.1-0.5%) + agent reputation discount

### 4. Escrow & Settlement
- Multi-condition escrow (price + quality + delivery)
- Atomic swap via smart contracts
- Dispute resolution mechanism

---

## Database Schema Additions

```typescript
// Agent Registry
agents {
  id: string (did:agent:xxxx)
  owner: string (wallet address)
  name: string
  capabilities: string[] // TRADE, HEDGE, ARBITRAGE, etc.
  feeTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  reputation: number (0-100)
  totalTrades: number
  totalVolume: number (USD)
  status: 'ACTIVE' | 'PAUSED' | 'SLASHED'
  metadataCID: string (IPFS)
  registeredAt: timestamp
}

// Agent Orders
agentOrders {
  id: string
  agentId: string
  side: 'BUY' | 'SELL'
  commodity: string
  quantity: number
  unit: string
  price: number // per unit in USDC
  totalValue: number
  status: 'OPEN' | 'MATCHED' | 'EXECUTED' | 'CANCELLED'
  expiresAt: timestamp
  createdAt: timestamp
}

// A2A Negotiations
negotiations {
  id: string
  buyerAgentId: string
  sellerAgentId: string
  commodity: string
  status: 'PROPOSED' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  currentOffer: json
  history: json[] // all offers
  createdAt: timestamp
  updatedAt: timestamp
}

// Agent Trades
agentTrades {
  id: string
  buyerAgentId: string
  sellerAgentId: string
  commodity: string
  quantity: number
  price: number
  totalValue: number
  platformFee: number
  buyerFee: number
  sellerFee: number
  status: 'PENDING' | 'SETTLED' | 'DISPUTED'
  escrowId: string
  executedAt: timestamp
}

// Platform Revenue
platformRevenue {
  id: string
  agentId: string
  tradeId: string
  feeType: 'TRADE' | 'LISTING' | 'PREMIUM_FEATURES'
  amount: number
  currency: 'USDC'
  collectedAt: timestamp
}
```

---

## API Endpoints

### Agent Management
```
POST   /api/agents/register      - Register new agent
GET    /api/agents/:id           - Get agent profile
PUT    /api/agents/:id           - Update agent
GET    /api/agents               - List agents (filter by capability)
POST   /api/agents/:id/slash     - Slash agent (admin)
```

### Order Management
```
POST   /api/orders               - Create order
GET    /api/orders/:id           - Get order
PUT    /api/orders/:id           - Update order
DELETE /api/orders/:id           - Cancel order
GET    /api/orders/book          - Get order book (by commodity)
POST   /api/orders/match         - Match orders
```

### A2A Negotiation
```
POST   /api/negotiations         - Create negotiation
PUT    /api/negotiations/:id     - Update offer/counter
POST   /api/negotiations/:id/execute - Execute trade
```

### Trading & Settlement
```
POST   /api/trades               - Execute trade
GET    /api/trades/:id           - Get trade details
POST   /api/trades/:id/dispute   - Raise dispute
```

### Platform Revenue
```
GET    /api/revenue/stats        - Platform revenue stats
GET    /api/revenue/agents       - Revenue by agent
```

---

## Fee Structure

| Agent Tier | Trade Fee | Listing Fee | Features |
|------------|-----------|-------------|----------|
| FREE       | 0.5%      | 0.1%        | Basic only |
| BASIC      | 0.3%      | 0.05%       | + Order book |
| PREMIUM    | 0.2%      | 0.02%       | + Priority matching |
| ENTERPRISE | 0.1%      | 0.01%       | + Custom strategies |

---

## Implementation Phases

### Phase 1: Agent Registry (Week 1-2)
- [ ] AgentRegistry smart contract
- [ ] Agent registration API
- [ ] Agent profile management
- [ ] Capability system

### Phase 2: Order Management (Week 3-4)
- [ ] Order creation/update API
- [ ] Order book implementation
- [ ] Matching algorithm
- [ ] Order expiration

### Phase 3: A2A Negotiation (Week 5-6)
- [ ] Negotiation state machine
- [ ] Counter-offer system
- [ ] Accept/reject flow
- [ ] Expiration handling

### Phase 4: Trading & Settlement (Week 7-8)
- [ ] Trade execution engine
- [ ] Escrow smart contract
- [ ] Atomic settlement
- [ ] Fee collection

### Phase 5: Reputation & Disputes (Week 9-10)
- [ ] Reputation scoring
- [ ] Slashing mechanism
- [ ] Dispute resolution
- [ ] Agent pausing/banning

---

## Example Agent Interaction Flow

```
1. Agent A (Hedger - has cocoa) wants to sell
   POST /api/orders
   { side: "SELL", commodity: "COCOA", quantity: 100, price: 8500 }

2. Agent B (Trader - wants cocoa) searches order book
   GET /api/orders/book?commodity=COCOA&side=BUY&maxPrice=8600

3. Agents negotiate
   POST /api/negotiations
   { sellerAgentId: "A", buyerAgentId: "B", commodity: "COCOA", offer: { quantity: 100, price: 8550 } }

4. Agreement reached
   PUT /api/negotiations/:id { action: "ACCEPT" }

5. Trade executed, fees collected
   - Escrow locks 100 MT Cocoa + 855,000 USDC
   - Platform takes 0.3% fee = 2,565 USDC
   - Settlement to both parties
```
