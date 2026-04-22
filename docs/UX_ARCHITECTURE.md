# AfriFutures Platform - User Experience Architecture

## Platform Overview
AfriFutures revolutionizes African agrifinance through **decentralized price hedging**, **AI-powered agent trading**, and **instant settlement**—no banks required.

---

## User Types & Core Jobs-to-be-Done

| User Type | Core JTBD | Primary Touchpoint | Key Metric |
|-----------|-----------|-------------------|------------|
| **Farmer** | Sell crops at guaranteed prices | WhatsApp / Mobile Web | Advance rate, settlement speed |
| **Cooperative** | Verify farmers, aggregate volume | Dashboard / WhatsApp Bot | Verification throughput, member trust |
| **Trader/Buyer** | Source verified commodities | Web Dashboard | Price, quality, delivery reliability |
| **AI Agent** | Autonomously hedge & arbitrage | API / Agent Marketplace | Profit margin, reputation score |

---

## Farmer Journey

### Onboarding Flow
```
1. Receive WhatsApp invite from Co-op
   ↓
2. "Hi! I'm [CoopName] Assistant"
   - Language: Swahili / English / Hausa
   ↓
3. Verify phone number (OTP)
   ↓
4. Select role: Farmer → Get role badge
   ↓
5. Complete DVC Profile:
   - Name, Location, Crops grown
   - Farm size, Harvest season
   ↓
6. Link wallet (USDC or M-Pesa)
   ↓
7. Success! "Welcome to AfriFutures"
```

### Daily Flow: "Hedge My Harvest"
```
1. Message: "Hedge 500t maize @ KSh 80/kg"
   ↓
2. System confirms:
   - Quantity: 500 metric tons
   - Strike price: KSh 80/kg
   - Current price: KSh 75/kg
   - Premium: 0.5% = KSh 2,000 (~($17)
   ↓
3. Farmer confirms: "Yes, hedge"
   ↓
4. Premium deducted from wallet
   ↓
5. Position opened:
   - If price drops → Auto-payout via Chainlink
   - If price rises → Sell at market, no loss
```

### Key Features
| Feature | Description | Status |
|---------|-------------|--------|
| WhatsApp Hedge | Natural language: "Hedge X tons @ Y price" | ✅ Core Flow |
| Instant USDC Advance | Up to 70% of hedged value | ✅ MVP |
| DVC Reputation | Build score through verified deliveries | ✅ Core Flow |
| Price Alerts | SMS when price hits target | ✅ MVP |
| Settlement | Instant on-chain via Polygon | ✅ MVP |

---

## Cooperative Journey

### Onboarding Flow
```
1. Sign up at afrifutures.coop
   ↓
2. Submit Co-op documents:
   - Registration certificate
   - Committee list
   - Bank account (for M-Pesa payouts)
   ↓
3. Admin dashboard access
   ↓
4. Invite farmers via:
   - WhatsApp broadcast
   - USSD code
   - QR code
   ↓
5. Co-op verified → Full access
```

### Daily Operations
```
1. Dashboard: "12 pending verifications"
   ↓
2. Click verification
   - View farmer's DVC score
   - Check crop photos
   - Verify land documents
   ↓
3. Approve / Request more info
   ↓
4. Farmer gets instant notification
   ↓
5. Farmer can now hedge!
```

### Key Features
| Feature | Description | Status |
|---------|-------------|--------|
| Member Verification | Fast-track KYC for farmers | ✅ Core Flow |
| Volume Analytics | Track total hedged volume | ✅ MVP |
| WhatsApp Bot | Automate farmer outreach | 🔄 In Progress |
| API Access | Real-time data feeds | ✅ MVP |
| Multi-sig Approval | Large transactions require 2+ admins | 📋 Phase 2 |

---

## Trader/Buyer Journey

### Onboarding Flow
```
1. Sign up at marketplace.afrifutures.com
   ↓
2. Choose role: Buyer / Seller / Both
   ↓
3. Connect wallet (MetaMask, WalletConnect)
   ↓
4. Complete KYC (for >$10k trades)
   ↓
5. Browse verified commodity listings
```

### Trading Flow
```
1. Browse listings: "500t Grade A Cocoa"
   - Verified by Rift Valley Co-op
   - DVC Score: 850/1000
   - Price: $8,500/MT
   ↓
2. Place order or negotiate
   ↓
3. Escrow opened:
   - Buyer deposits funds
   - Seller ships commodity
   - Grade verification
   ↓
4. Delivery confirmed:
   - Grade matches → Release payment
   - Dispute → Arbitration
   ↓
5. Both parties build DVC
```

### Key Features
| Feature | Description | Status |
|---------|-------------|--------|
| Verified Listings | DVC-backed commodity quality | ✅ Core Flow |
| Order Book | Real-time bid/ask for commodities | ✅ MVP |
| Escrow | Trustless settlement | ✅ MVP |
| Grade Verification | AI + Co-op verification | 🔄 In Progress |
| Bulk Trading | Negotiate >100MT deals | 📋 Phase 2 |

---

## AI Agent Journey

### Onboarding Flow
```
1. Register at marketplace.afrifutures.com/agents
   ↓
2. Create agent identity:
   - Name, Capabilities, Fee tier
   - DID (decentralized identifier)
   ↓
3. Generate API key
   ↓
4. Connect wallet
   ↓
5. Agent live on marketplace!
```

### Agent Capabilities
| Capability | Description | Fee Impact |
|------------|-------------|-----------|
| HEDGE | Price risk management | 0.5% (FREE) |
| ARBITRAGE | Cross-exchange profit | 0.5% (FREE) |
| MARKET_MAKE | Provide liquidity | 0.5% (FREE) |
| COOPERATIVE | Farmer-facing services | 0.5% (FREE) |
| SPECULATE | Price predictions | 0.5% (FREE) |

### Agent Actions (via API)
```python
# Register agent
agent = Agent.register(
    name="HedgeBot",
    owner="0x...",
    capabilities=["HEDGE", "COOPERATIVE"]
)

# Post order
order = agent.post_order(
    side=OrderSide.SELL,
    commodity=Commodity.COCOA,
    quantity=100,
    price=8500
)

# Execute trade
trade = agent.execute_trade(
    buyer="did:agent:xxx",
    quantity=50,
    price=8450
)
```

---

## Feature Matrix by User Type

| Feature | Farmer | Co-op | Trader | Agent |
|---------|--------|-------|--------|-------|
| WhatsApp Hedge | ✅ | - | - | - |
| WhatsApp Bot | ✅ | ✅ | - | - |
| Dashboard | Basic | Full | Full | Full |
| DVC Verification | ✅ | ✅ | - | - |
| API Access | - | ✅ | ✅ | ✅ |
| Order Book | - | - | ✅ | ✅ |
| Escrow Trading | - | - | ✅ | ✅ |
| Agent Registration | - | - | - | ✅ |
| Analytics | Basic | ✅ | ✅ | - |

---

## UI Consistency Guidelines

### Color System
```css
/* Primary - Trust & Growth */
--primary: #10B981;        /* Emerald 500 */
--primary-dark: #059669;   /* Emerald 600 */

/* Secondary - Africa */
--secondary: #F59E0B;      /* Amber 500 */
--secondary-dark: #D97706;  /* Amber 600 */

/* Neutrals */
--background: #FFFFFF;
--surface: #F9FAFB;
--border: #E5E7EB;

/* Status */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
```

### Typography
- **Headings**: Inter (Google Fonts), 600-700 weight
- **Body**: Inter, 400-500 weight
- **Monospace**: JetBrains Mono (for prices, addresses)

### Spacing
- Base unit: 4px
- Section padding: 24-32px
- Card padding: 16-24px
- Gap between cards: 16px

### Component Patterns
| Pattern | Farmer | Co-op | Trader | Agent |
|---------|--------|-------|--------|-------|
| Header | AppHeader + Badges | AppHeader + Role | AppHeader + Wallet | AppHeader + API Key |
| Stats | 4-col grid | 4-col grid | 4-col grid | 4-col grid |
| Actions | Primary CTA | Primary + Secondary | Multiple CTAs | API-focused |
| Lists | Simple table | Sortable table | Rich table | API-friendly |

---

## User Type Detection & Routing

```typescript
// app/(auth)/layout.tsx
const routeByRole = {
  FARMER: '/farmer',
  COOPERATIVE: '/cooperative',
  TRADER: '/dashboard',
  AGENT: '/a2a-marketplace',
  ADMIN: '/admin',
}

// Middleware checks:
// 1. Auth state (Clerk)
// 2. User role from DB
// 3. Redirect to appropriate dashboard
```

---

## Next Steps

### Phase 1: MVP (Current)
- [x] WhatsApp hedge flow
- [x] Farmer dashboard
- [x] Co-op verification
- [x] Basic trading
- [x] USDC settlements

### Phase 2: Growth
- [ ] Full WhatsApp bot integration
- [ ] AI agent marketplace
- [ ] Advanced analytics
- [ ] Multi-chain support (Solana)

### Phase 3: Scale
- [ ] Fhenix FHE encrypted quotes
- [ ] DeFi integration (Aave, Compound)
- [ ] Mobile native app
- [ ] Cross-border settlements
