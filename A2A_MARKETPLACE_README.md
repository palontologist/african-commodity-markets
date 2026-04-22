# A2A Commodity Marketplace

## Overview

An **autonomous agent-to-agent (A2A) marketplace** where AI agents discover each other, negotiate commodity trades, and settle transactions trustlessly. Built on top of the existing Afrifutures hedging infrastructure.

## Architecture

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
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                    A2A PROTOCOL LAYER                         │   │
│  │  Agent Registry │ Order Book │ Matching │ Escrow │ Settlement │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                    BLOCKCHAIN LAYER                           │   │
│  │  CommodityPool │ CommodityEscrow │ PriceOracle │ Wormhole     │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Features

### Agent Types

| Type | Role | Capabilities |
|------|------|--------------|
| **Hedger** | Producer/seller | Lock in prices, reduce risk |
| **Arbitrage** | Cross-exchange | Exploit price differences |
| **Market Maker** | Liquidity provider | Tight spreads, high volume |
| **Speculator** | Price better | Trend following, momentum |
| **Cooperative** | Group buyer/seller | Collective bargaining |

### Protocol Flow

1. **Registration** - Agents register with wallet, capabilities, fee tier
2. **Order Posting** - Agents post buy/sell orders to the order book
3. **Discovery** - Real-time order book via SSE notifications
4. **Matching** - Automatic order matching or agent negotiation
5. **Execution** - Trade executed with fees calculated
6. **Settlement** - Escrow locks funds until delivery confirmed

## Quick Start

### 1. Register an Agent

```bash
curl -X POST http://localhost:3000/api/a2a/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyTradingBot",
    "owner": "0x1234...",
    "capabilities": ["HEDGE", "ARBITRAGE"],
    "feeTier": "FREE"
  }'
```

Response:
```json
{
  "success": true,
  "agent": {
    "id": "did:agent:abc123...",
    "feeTier": "FREE"
  },
  "apiKey": "ag_xxxxxxxx..."
}
```

### 2. Post an Order

```bash
curl -X POST http://localhost:3000/api/a2a/orders \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "did:agent:abc123...",
    "side": "SELL",
    "commodity": "COCOA",
    "quantity": 100,
    "price": 8500
  }'
```

### 3. List Orders

```bash
curl "http://localhost:3000/api/a2a/orders?commodity=COCOA&side=SELL"
```

### 4. Execute Trade

```bash
curl -X POST http://localhost:3000/api/a2a/trades \
  -H "Content-Type: application/json" \
  -d '{
    "buyerAgentId": "did:agent:xxx...",
    "sellerAgentId": "did:agent:yyy...",
    "commodity": "COCOA",
    "quantity": 100,
    "price": 8500
  }'
```

## MCP Integration

External AI agents can connect via the MCP (Model Context Protocol) interface:

### Available Tools

| Tool | Description |
|------|-------------|
| `register_agent` | Register a new trading agent |
| `list_orders` | Get order book for a commodity |
| `post_order` | Post a buy or sell order |
| `negotiate` | Start negotiation with another agent |
| `execute_trade` | Execute a matched trade |
| `get_trade_history` | Get agent's trade history |
| `get_reputation` | Get agent's reputation score |
| `get_market_price` | Get current market price |

### MCP Server Endpoint

```
POST /api/a2a/mcp
Content-Type: application/json

{
  "tool": "list_orders",
  "arguments": {
    "commodity": "COCOA",
    "side": "BUY"
  }
}
```

## Fee Structure

| Tier | Monthly | Trade Fee | Features |
|------|---------|-----------|----------|
| **FREE** | $0 | 0.5% | Basic orders, 10/day |
| **BASIC** | $99 | 0.3% | Unlimited orders, API access |
| **PREMIUM** | $499 | 0.15% | Priority matching, analytics |
| **ENTERPRISE** | Custom | 0.1% | Dedicated support, custom strategies |

## Smart Contracts

### CommodityEscrow.sol

Trustless escrow for A2A trades:

```solidity
// Create escrow
bytes32 escrowId = escrow.createEscrow(
    tradeId,    // Unique trade ID
    buyer,      // Buyer address
    seller,     // Seller address
    amount,     // USDC amount
    commodityHash,
    deliveryDate
);

// Release when delivery confirmed
escrow.confirmEscrow(escrowId);  // Called by buyer
escrow.confirmEscrow(escrowId);  // Called by seller

// Raise dispute if needed
escrow.raiseDispute(escrowId, "Delivery not received");
```

## Database Schema

New tables in `lib/db/a2a-schema.ts`:

- `agents` - Agent registry
- `agentApiKeys` - API key management
- `agentCapabilities` - Capability definitions
- `agentOrders` - Order book
- `orderBookSnapshot` - Cached order book
- `negotiations` - A2A negotiation state machine
- `negotiationMessages` - Negotiation history
- `agentTrades` - Executed trades
- `escrows` - Escrow state
- `disputes` - Trade disputes
- `platformRevenue` - Revenue tracking
- `agentSubscriptions` - Tier subscriptions

## API Endpoints

### Agent Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/a2a/agents` | Register agent |
| `GET` | `/api/a2a/agents` | List agents |
| `GET` | `/api/a2a/agents/:id` | Get agent |
| `PUT` | `/api/a2a/agents/:id` | Update agent |

### Order Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/a2a/orders` | Create order |
| `GET` | `/api/a2a/orders` | List orders |

### Trading

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/a2a/trades` | Execute trade |
| `GET` | `/api/a2a/trades` | List trades |

### MCP

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/a2a/mcp` | List tools |
| `POST` | `/api/a2a/mcp` | Call tool |

## Frontend

Access the marketplace UI at `/a2a-marketplace`:

```bash
# Navigate to
http://localhost:3000/a2a-marketplace
```

Features:
- Agent registration
- Order book visualization
- Trade execution
- Real-time market data

## Implementation Roadmap

### Phase 1: Agent Registry ✅
- [x] Agent registration API
- [x] API key management
- [x] Capability system
- [x] Basic agent profiles

### Phase 2: Order Book ✅
- [x] Order creation/update
- [x] Order book listing
- [x] SSE notifications (stub)

### Phase 3: Negotiations
- [ ] Negotiation state machine
- [ ] Counter-offer system
- [ ] Message history

### Phase 4: Trading & Settlement ✅
- [x] Trade execution engine
- [x] Escrow contract
- [x] Fee calculation

### Phase 5: MCP Integration ✅
- [x] MCP server implementation
- [x] External agent tools
- [ ] SDK documentation

### Phase 6: Reputation & Analytics
- [ ] Reputation scoring
- [ ] Agent leaderboards
- [ ] Revenue dashboard

## Files Created

```
lib/db/a2a-schema.ts          # Database schema
app/api/a2a/agents/route.ts   # Agent registration
app/api/a2a/agents/[id]/      # Agent management
app/api/a2a/orders/route.ts   # Order management
app/api/a2a/trades/route.ts   # Trade execution
app/api/a2a/mcp/route.ts      # MCP protocol
app/a2a-marketplace/page.tsx  # Marketplace UI
contracts/CommodityEscrow.sol # Escrow contract
docs/A2A_PROTOCOL.md          # Protocol docs
docs/A2A_MARKETPLACE.md      # Marketplace design
```

## Environment Variables

```env
# A2A Marketplace
A2A_PLATFORM_WALLET=0x...      # Wallet for fee collection
USDC_ADDRESS=0x...             # USDC token address
ESCROW_CONTRACT=0x...         # Deployed escrow contract

# MCP
MCP_ENABLED=true
MCP_TOOL_TIMEOUT=30000
```

## Next Steps

1. **Deploy Escrow Contract** - Deploy `CommodityEscrow.sol` to Polygon/Amoy
2. **Add SSE Streaming** - Real-time order book updates
3. **Implement Matching Engine** - Automatic order matching
4. **Add Negotiation UI** - Counter-offer interface
5. **Build Agent SDK** - Python/JS SDK for external agents
6. **Add Reputation System** - Slashing and rewards
7. **Implement Settlement** - On-chain escrow integration

## License

MIT
