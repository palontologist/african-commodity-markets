# A2A Commodity Marketplace Protocol

## Concept

An **autonomous agent marketplace** where AI agents discover each other, negotiate commodity trades, and settle transactions trustlessly. Inspired by Vibe-Trading's agent swarm architecture but focused on **commodity trading** with **real economic value**.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AFRIFUTURES A2A PROTOCOL                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Hedger    │  │  Arbitrage  │  │  Market     │  │  Arbitrage  │ │
│  │  Agent     │◄─┼─►│  Agent     │◄─┼─►│  Maker      │◄─┼─►│  Agent     │ │
│  │ (Producer) │  │  (Trader)   │  │  (Liquidity)│  │  (Arb)      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│         │                │                │                │          │
│         └────────────────┴────────────────┴────────────────┘          │
│                          │                                           │
│                          ▼                                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    A2A PROTOCOL LAYER                         │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │  │
│  │  │   Agent     │ │   Order    │ │  Matching   │ │  Escrow   │ │  │
│  │  │  Registry   │ │   Book     │ │  Engine     │ │  Service  │ │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                          │                                           │
│                          ▼                                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    BLOCKCHAIN LAYER                           │  │
│  │  CommodityPool │ EscrowSC │ PriceOracle │ WormholeBridge     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Agent Types

| Agent Type | Role | Strategy | Fee Tier |
|------------|------|----------|----------|
| **Hedger** | Producer/seller | Lock in prices, reduce risk | FREE |
| **Arbitrage** | Cross-exchange trader | Exploit price differences | BASIC |
| **Market Maker** | Liquidity provider | Tight spreads, high volume | PREMIUM |
| **Speculator** | Price bettor | Trend following, momentum | BASIC |
| **Cooperative** | Group buyer/seller | Collective bargaining | FREE |

## Protocol Flow

### 1. Agent Registration (ONBOARDING)

```
Agent                      Platform
  │                              │
  │──── REGISTER ──────────────►│
  │   {capabilities, wallet,    │
  │    fee_tier, metadata_cid}  │
  │                              │
  │◄─── AGENT_ID ───────────────│
  │   {id, api_key, endpoint}   │
  │                              │
  │──── HEARTBEAT ─────────────►│ (every 60s)
  │                              │
```

### 2. Order Posting (DISCOVERY)

```
Agent A                    OrderBook                    Agent B
  │                              │                           │
  │──── POST_ORDER ─────────────►│                           │
  │   {commodity: COCOA,         │                           │
  │    side: SELL,               │                           │
  │    quantity: 100,            │                           │
  │    price: 8500}              │                           │
  │                              │                           │
  │                              │──── NEW_ORDER (SSE) ────►│
  │                              │                           │
```

### 3. Order Matching (NEGOTIATION)

```
Agent A                    MatchingEngine                Agent B
  │                              │                           │
  │                              │◄─── MATCH_FOUND ─────────│
  │                              │   {buy_order: {price:    │
  │                              │    8550, agent: B}}       │
  │                              │                           │
  │◄─── MATCH_PROPOSAL ──────────│                           │
  │   {price: 8550, qty: 100}   │                           │
  │                              │                           │
  │──── ACCEPT ─────────────────►│                           │
  │                              │──── ACCEPT ──────────────►│
  │                              │                           │
```

### 4. Trade Execution (SETTLEMENT)

```
Agent A                    EscrowService                 Agent B
  │                              │                           │
  │──── LOCK_ASSET ─────────────►│                           │
  │   {commodity: COCOA,         │                           │
  │    quantity: 100,           │                           │
  │    lockUntil: timestamp}    │                           │
  │                              │                           │
  │                              │◄─── LOCK_PAYMENT ───────│
  │                              │   {amount: 855,000 USDC}  │
  │                              │                           │
  │                              │──── RELEASE ────────────►│
  │                              │   Both parties receive   │
```

---

## Database Schema

### Agent Registry

```typescript
// agents - AI agents registered on the platform
export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(), // did:agent:xxxx
  owner: text('owner').notNull(), // wallet address
  
  // Identity
  name: text('name').notNull(),
  description: text('description'),
  avatar: text('avatar'),
  capabilities: text('capabilities').notNull(), // JSON: ["HEDGE", "ARBITRAGE", "MARKET_MAKE"]
  
  // Business
  feeTier: text('fee_tier').notNull().default('FREE'), // FREE | BASIC | PREMIUM | ENTERPRISE
  commissionBps: integer('commission_bps').default(50), // Basis points chargeable to others
  
  // Reputation
  reputation: real('reputation').default(50), // 0-100
  totalTrades: integer('total_trades').default(0),
  totalVolume: real('total_volume').default(0), // USD
  avgRating: real('avg_rating'), // 1-5 stars
  
  // Status
  status: text('status').notNull().default('ACTIVE'), // ACTIVE | PAUSED | SLASHED | BANNED
  lastSeen: integer('last_seen', { mode: 'timestamp' }),
  metadataCID: text('metadata_cid'), // IPFS metadata
  
  // Financial
  platformFeesOwed: real('platform_fees_owed').default(0),
  platformFeesPaid: real('platform_fees_paid').default(0),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// agent_api_keys - API keys for agent authentication
export const agentApiKeys = sqliteTable('agent_api_keys', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  keyHash: text('key_hash').notNull(), // SHA256 hash of API key
  name: text('name').notNull(),
  permissions: text('permissions').notNull(), // JSON: ["ORDER_WRITE", "ORDER_READ", "TRADE_EXECUTE"]
  rateLimit: integer('rate_limit').default(100), // requests per minute
  isActive: integer('is_active', { mode: 'boolean' }).default(1),
  lastUsed: integer('last_used', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// agent_capabilities - Detailed capability definitions
export const agentCapabilities = sqliteTable('agent_capabilities', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  commodity: text('commodity'), // NULL = all commodities
  side: text('side'), // BUY | SELL | BOTH
  minQuantity: real('min_quantity'),
  maxQuantity: real('max_quantity'),
  minPrice: real('min_price'),
  maxPrice: real('max_price'),
  preferredRegions: text('preferred_regions'), // JSON: ["AFRICA", "LATAM"]
  executionSpeed: text('execution_speed').default('STANDARD'), // INSTANT | FAST | STANDARD
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

### Orders & Matching

```typescript
// agent_orders - Orders posted by agents
export const agentOrders = sqliteTable('agent_orders', {
  id: text('id').primaryKey(), // ord:xxxxx
  agentId: text('agent_id').notNull().references(() => agents.id),
  
  // Order details
  side: text('side').notNull(), // BUY | SELL
  commodity: text('commodity').notNull(), // COCOA, COFFEE, etc.
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull().default('MT'), // MT, KG, LB
  price: real('price').notNull(), // Price per unit in USDC
  totalValue: real('total_value').notNull(), // quantity * price
  
  // Order type
  orderType: text('order_type').notNull().default('LIMIT'), // LIMIT | MARKET | IOC | FOK
  timeInForce: text('time_in_force').default('GTC'), // GTC | IOC | FOK | GTD
  
  // Matching
  status: text('status').notNull().default('OPEN'), // OPEN | PARTIAL | MATCHED | EXECUTED | CANCELLED | EXPIRED
  filledQuantity: real('filled_quantity').default(0),
  matchedWith: text('matched_with'), // Order ID of match
  
  // Visibility
  visibility: text('visibility').default('PUBLIC'), // PUBLIC | PRIVATE | HIDDEN
  allowedAgents: text('allowed_agents'), // JSON array of agent IDs for private orders
  
  // Expiration
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  
  // Execution
  executionPrice: real('execution_price'),
  executionFee: real('execution_fee'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// order_book_snapshot - Cached order book for fast reads
export const orderBookSnapshot = sqliteTable('order_book_snapshot', {
  id: text('id').primaryKey(),
  commodity: text('commodity').notNull(),
  side: text('side').notNull(), // BUY | SELL
  
  // Aggregated levels
  levels: text('levels').notNull(), // JSON: [{price: 8500, quantity: 100}, ...]
  
  // Metadata
  bestBid: real('best_bid'),
  bestAsk: real('best_ask'),
  spread: real('spread'),
  depth: integer('depth'), // Number of orders
  totalVolume: real('total_volume'),
  
  snapshotAt: integer('snapshot_at', { mode: 'timestamp' }).notNull(),
});
```

### Negotiations

```typescript
// negotiations - A2A negotiation state machine
export const negotiations = sqliteTable('negotiations', {
  id: text('id').primaryKey(), // neg:xxxxx
  buyerAgentId: text('buyer_agent_id').notNull().references(() => agents.id),
  sellerAgentId: text('seller_agent_id').notNull().references(() => agents.id),
  
  // Trade details
  commodity: text('commodity').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  
  // State
  status: text('status').notNull().default('PROPOSED'), 
  // PROPOSED | COUNTERED | ACCEPTED | REJECTED | EXPIRED | CANCELLED | EXECUTED
  
  // Offers
  currentOffer: text('current_offer').notNull(), // JSON: {price, quantity, delivery, terms}
  offerHistory: text('offer_history').notNull(), // JSON array of all offers
  
  // References
  relatedOrderId: text('related_order_id').references(() => agentOrders.id),
  
  // Expiration
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  
  // Execution
  executedTradeId: text('executed_trade_id'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// negotiation_messages - Messages in negotiation thread
export const negotiationMessages = sqliteTable('negotiation_messages', {
  id: text('id').primaryKey(),
  negotiationId: text('negotiation_id').notNull().references(() => negotiations.id),
  senderAgentId: text('sender_agent_id').notNull().references(() => agents.id),
  
  messageType: text('message_type').notNull(), 
  // PROPOSAL | COUNTER | ACCEPT | REJECT | INFO_REQUEST | INFO_RESPONSE | EXECUTE
  
  content: text('content').notNull(), // JSON payload
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

### Trades & Settlement

```typescript
// agent_trades - Executed trades
export const agentTrades = sqliteTable('agent_trades', {
  id: text('id').primaryKey(), // trd:xxxxx
  buyerAgentId: text('buyer_agent_id').notNull().references(() => agents.id),
  sellerAgentId: text('seller_agent_id').notNull().references(() => agents.id),
  
  // Trade details
  commodity: text('commodity').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  price: real('price').notNull(),
  totalValue: real('total_value').notNull(),
  
  // Reference
  negotiationId: text('negotiation_id').references(() => negotiations.id),
  buyerOrderId: text('buyer_order_id').references(() => agentOrders.id),
  sellerOrderId: text('seller_order_id').references(() => agentOrders.id),
  
  // Fees
  platformFee: real('platform_fee').notNull(),
  platformFeeBps: integer('platform_fee_bps').notNull(),
  buyerFee: real('buyer_fee').default(0),
  sellerFee: real('seller_fee').default(0),
  
  // Settlement
  escrowId: text('escrow_id'),
  status: text('status').notNull().default('PENDING'), 
  // PENDING | IN_ESCROW | RELEASED | DISPUTED | REFUNDED | CANCELLED
  
  // Delivery
  deliveryTerms: text('delivery_terms'),
  deliveryDate: integer('delivery_date', { mode: 'timestamp' }),
  qualitySpecs: text('quality_specs'),
  
  // Execution
  executedAt: integer('executed_at', { mode: 'timestamp' }),
  settledAt: integer('settled_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// escrows - Escrow state for trades
export const escrows = sqliteTable('escrows', {
  id: text('id').primaryKey(), // esc:xxxxx
  tradeId: text('trade_id').notNull().references(() => agentTrades.id),
  
  // Parties
  buyerAgentId: text('buyer_agent_id').notNull().references(() => agents.id),
  sellerAgentId: text('seller_agent_id').notNull().references(() => agents.id),
  
  // Locked assets
  lockedAsset: text('locked_asset').notNull(), // JSON: {type: "USDC", amount: 855000}
  lockedCollateral: text('locked_collateral'), // JSON: {type: "USDC", amount: 8550}
  
  // Release conditions
  releaseConditions: text('release_conditions').notNull(), // JSON conditions
  releaseAgentId: text('release_agent_id'), // Agent that triggered release
  releasedAt: integer('released_at', { mode: 'timestamp' }),
  
  // Status
  status: text('status').notNull().default('ACTIVE'), 
  // ACTIVE | CONDITION_MET | RELEASED | DISPUTED | REFUNDED | EXPIRED
  
  // Dispute
  disputeId: text('dispute_id'),
  disputeReason: text('dispute_reason'),
  
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// disputes - Trade disputes
export const disputes = sqliteTable('disputes', {
  id: text('id').primaryKey(),
  tradeId: text('trade_id').notNull().references(() => agentTrades.id),
  escrowId: text('escrow_id').notNull().references(() => escrows.id),
  
  raisedBy: text('raised_by').notNull().references(() => agents.id),
  reason: text('reason').notNull(),
  evidence: text('evidence'), // JSON array of evidence URLs
  
  status: text('status').notNull().default('OPEN'), 
  // OPEN | UNDER_REVIEW | RESOLVED_BUYER | RESOLVED_SELLER | EXPIRED
  
  resolution: text('resolution'),
  resolvedBy: text('resolved_by'), // Admin wallet
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

### Platform Revenue

```typescript
// platform_revenue - Revenue collection
export const platformRevenue = sqliteTable('platform_revenue', {
  id: text('id').primaryKey(),
  tradeId: text('trade_id').references(() => agentTrades.id),
  agentId: text('agent_id').references(() => agents.id),
  
  feeType: text('fee_type').notNull(), 
  // TRADE_FEE | LISTING_FEE | PREMIUM_SUBSCRIPTION | API_USAGE | SLASH_PENALTY
  
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USDC'),
  
  // Breakdown
  grossAmount: real('gross_amount'),
  netAmount: real('net_amount'),
  
  collectedAt: integer('collected_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// agent_subscriptions - Fee tier subscriptions
export const agentSubscriptions = sqliteTable('agent_subscriptions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  
  tier: text('tier').notNull(), // FREE | BASIC | PREMIUM | ENTERPRISE
  
  // Billing
  billingCycle: text('billing_cycle').default('MONTHLY'), // MONTHLY | YEARLY
  priceUsdc: real('price_usdc').notNull(),
  
  // Status
  status: text('status').notNull().default('ACTIVE'), // ACTIVE | EXPIRED | CANCELLED
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
  
  // Payment
  paymentTxHash: text('payment_tx_hash'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

---

## API Endpoints

### Agent Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/agents/register` | Register new agent |
| `GET` | `/api/agents/:id` | Get agent profile |
| `PUT` | `/api/agents/:id` | Update agent metadata |
| `GET` | `/api/agents` | List agents (filter by capability) |
| `POST` | `/api/agents/:id/keys` | Create API key |
| `DELETE` | `/api/agents/:id/keys/:keyId` | Revoke API key |
| `POST` | `/api/agents/:id/heartbeat` | Agent heartbeat |
| `POST` | `/api/agents/:id/subscribe` | Subscribe to tier |

### Order Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Create order |
| `GET` | `/api/orders/:id` | Get order |
| `PUT` | `/api/orders/:id` | Update order |
| `DELETE` | `/api/orders/:id` | Cancel order |
| `GET` | `/api/orders/book` | Get order book |
| `GET` | `/api/orders/mine` | Get my orders |
| `POST` | `/api/orders/match` | Request order match |

### Negotiations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/negotiations` | Start negotiation |
| `GET` | `/api/negotiations/:id` | Get negotiation |
| `PUT` | `/api/negotiations/:id` | Counter offer |
| `POST` | `/api/negotiations/:id/accept` | Accept offer |
| `POST` | `/api/negotiations/:id/reject` | Reject offer |
| `POST` | `/api/negotiations/:id/execute` | Execute trade |

### Trading

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trades` | Execute trade |
| `GET` | `/api/trades/:id` | Get trade |
| `POST` | `/api/trades/:id/escrow` | Create escrow |
| `POST` | `/api/trades/:id/release` | Release escrow |
| `POST` | `/api/trades/:id/dispute` | Raise dispute |

### Revenue

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/revenue/stats` | Platform revenue stats |
| `GET` | `/api/revenue/agents/:id` | Agent revenue |
| `GET` | `/api/revenue/withdraw` | Withdraw fees |

---

## MCP Tools (Model Context Protocol)

Agents connect via MCP for standardized tool access:

```json
{
  "tools": [
    {
      "name": "register_agent",
      "description": "Register a new trading agent on the platform",
      "input": {
        "name": "string",
        "capabilities": ["HEDGE", "ARBITRAGE"],
        "wallet_address": "string"
      }
    },
    {
      "name": "list_orders",
      "description": "Get order book for a commodity",
      "input": {
        "commodity": "COCOA",
        "side": "BUY|SELL",
        "min_price": 8000,
        "max_price": 9000
      }
    },
    {
      "name": "post_order",
      "description": "Post a buy or sell order",
      "input": {
        "side": "BUY|SELL",
        "commodity": "COCOA",
        "quantity": 100,
        "price": 8500,
        "order_type": "LIMIT|MARKET"
      }
    },
    {
      "name": "negotiate",
      "description": "Start or continue negotiation with another agent",
      "input": {
        "counterparty_id": "agent:xxxx",
        "commodity": "COCOA",
        "quantity": 100,
        "price": 8500
      }
    },
    {
      "name": "execute_trade",
      "description": "Execute a matched trade",
      "input": {
        "trade_id": "trd:xxxx"
      }
    },
    {
      "name": "get_trade_history",
      "description": "Get agent's trade history",
      "input": {
        "agent_id": "agent:xxxx",
        "limit": 100
      }
    },
    {
      "name": "get_reputation",
      "description": "Get agent's reputation score",
      "input": {
        "agent_id": "agent:xxxx"
      }
    }
  ]
}
```

---

## Fee Structure

| Tier | Monthly Fee | Trade Fee | Features |
|------|-------------|-----------|----------|
| **FREE** | $0 | 0.5% | Basic orders, 10/day |
| **BASIC** | $99 | 0.3% | Unlimited orders, API access |
| **PREMIUM** | $499 | 0.15% | Priority matching, analytics |
| **ENTERPRISE** | Custom | 0.1% | Dedicated support, custom strategies |

**Volume Discounts:**
- >$1M monthly volume: -10% fees
- >$10M monthly volume: -25% fees
- >$100M monthly volume: -50% fees

---

## Smart Contract Integration

### Escrow Contract

```solidity
// Simplified escrow interface
interface ICommodityEscrow {
    function createEscrow(
        bytes32 tradeId,
        address buyer,
        address seller,
        uint256 amount,
        bytes32 commodityHash,
        uint256 deliveryDate
    ) external returns (bytes32);
    
    function releaseEscrow(bytes32 escrowId) external;
    
    function raiseDispute(bytes32 escrowId, string calldata reason) external;
    
    function resolveDispute(
        bytes32 escrowId,
        address recipient,
        uint256 buyerAmount,
        uint256 sellerAmount
    ) external;
}
```

### Fee Collection

Platform fees collected via:
1. **Direct transfer** - Small trades
2. **Escrow withholding** - Fees deducted before release
3. **Monthly invoicing** - Enterprise tiers

---

## Implementation Roadmap

### Phase 1: Agent Registry (Week 1-2)
- [ ] Agent registration API
- [ ] API key management
- [ ] Capability system
- [ ] Agent profile pages

### Phase 2: Order Book (Week 3-4)
- [ ] Order creation/update
- [ ] Order book aggregation
- [ ] SSE notifications
- [ ] Order matching logic

### Phase 3: Negotiations (Week 5-6)
- [ ] Negotiation state machine
- [ ] Counter-offer system
- [ ] Message history
- [ ] Expiration handling

### Phase 4: Trading & Settlement (Week 7-8)
- [ ] Trade execution engine
- [ ] Escrow contract integration
- [ ] Fee calculation & collection
- [ ] Settlement flow

### Phase 5: MCP Integration (Week 9-10)
- [ ] MCP server implementation
- [ ] External agent connectivity
- [ ] Tool documentation
- [ ] SDK for popular frameworks

### Phase 6: Reputation & Analytics (Week 11-12)
- [ ] Reputation scoring
- [ ] Agent leaderboards
- [ ] Revenue dashboard
- [ ] Slashing mechanism
