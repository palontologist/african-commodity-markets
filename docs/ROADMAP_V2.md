# AfriFutures Product Roadmap

**Last Updated:** April 2026  
**Version:** 2.0

---

## Vision

AfriFutures democratizes agricultural finance in Africa through **instant price hedging**, **AI-powered trading**, and **zero-bank settlements**—starting with WhatsApp, scaling to autonomous agents.

---

## Core Pillars

1. **Simplicity First** - WhatsApp-native, zero app downloads
2. **Trustless by Default** - Smart contracts, not middlemen
3. **Agent Economy** - AI agents trade on behalf of humans
4. **Privacy Preserved** - FHE encryption for sensitive data

---

## Roadmap Phases

### Phase 0: Foundation (COMPLETED)
**Timeline:** Jan - Mar 2026  
**Goal:** Core infrastructure, MVP ready

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js app structure | ✅ | Multi-role dashboards |
| Polygon smart contracts | ✅ | Escrow, staking, bridging |
| Clerk authentication | ✅ | Multi-role system |
| Database schema | ✅ | Drizzle + SQLite |
| Basic trading flow | ✅ | Order book, matching |
| USDC settlements | ✅ | x402 payments |
| A2A marketplace | ✅ | Agent registration, orders |
| Python SDK | ✅ | Agent integration |

---

### Phase 1: WhatsApp Native (CURRENT)
**Timeline:** Q2 2026 (Apr - Jun)  
**Goal:** Farmers hedge via WhatsApp in <30 seconds

#### Milestone 1.1: WhatsApp Bot MVP (April)
| Feature | Status | Owner | Notes |
|---------|--------|-------|-------|
| Twilio WhatsApp setup | 🔄 | Backend | Sandbox mode |
| Message webhook handler | 🔄 | Backend | Parse intents |
| Natural language parser | 🔄 | ML | Hedge, check, cancel |
| User session management | 📋 | Backend | Multi-step flows |
| Basic responses | 📋 | Frontend | Help, confirm, error |

#### Milestone 1.2: WhatsApp Hedge Flow (May)
| Feature | Status | Owner | Notes |
|---------|--------|-------|-------|
| Hedge creation flow | 📋 | Backend | "Hedge X @ Y" |
| Price lookup | 📋 | API | Chainlink feeds |
| Premium calculation | 📋 | Contract | 0.5% fee |
| Position storage | 📋 | Database | Track hedges |
| Confirmation UX | 📋 | Frontend | Yes/No flows |

#### Milestone 1.3: Notifications & Alerts (June)
| Feature | Status | Owner | Notes |
|---------|--------|-------|-------|
| Price drop alerts | 📋 | Backend | Triggered by oracle |
| Payout notifications | 📋 | Backend | WhatsApp message |
| Daily price digest | 📋 | Backend | Morning summary |
| Hedge expiry notices | 📋 | Backend | 7-day warning |

---

### Phase 2: Co-op Network
**Timeline:** Q3 2026 (Jul - Sep)  
**Goal:** Cooperative verification + bulk operations

#### Milestone 2.1: Co-op Dashboard
| Feature | Status | Notes |
|---------|--------|-------|
| Member management | 📋 | Add/remove farmers |
| Verification queue | 📋 | Approve KYC |
| Bulk hedge operations | 📋 | Hedge for all members |
| Analytics | 📋 | Volume, DVC scores |
| WhatsApp bot per co-op | 📋 | Branded experience |

#### Milestone 2.2: DVC Integration
| Feature | Status | Notes |
|---------|--------|-------|
| DVC schema | 📋 | On-chain credentials |
| Co-op attestation | 📋 | Sign farmer claims |
| DVC-based discounts | 📋 | Higher DVC = lower premium |
| Cross-coop reputation | 📋 | Trust propagation |

#### Milestone 2.3: Payments
| Feature | Status | Notes |
|---------|--------|-------|
| M-Pesa integration | 📋 | Safaricom API |
| Mobile money payouts | 📋 | Farmer receives in KES |
| USDC ↔ KES conversion | 📋 | On-ramp/off-ramp |
| Bulk disbursements | 📋 | Pay all at once |

---

### Phase 3: Agent Economy
**Timeline:** Q4 2026 (Oct - Dec)  
**Goal:** Autonomous AI agents trade on AfriFutures

#### Milestone 3.1: Agent Marketplace
| Feature | Status | Notes |
|---------|--------|-------|
| Agent directory | 📋 | Browse, filter |
| Agent profiles | 📋 | Reputation, stats |
| Capability badges | 📋 | HEDGE, ARBITRAGE, etc. |
| Agent-to-agent trading | 📋 | Direct negotiation |
| Settlement API | 📋 | Programmatic payouts |

#### Milestone 3.2: ElizaOS Integration
| Feature | Status | Notes |
|---------|--------|-------|
| ElizaOS plugin | 📋 | Agent actions |
| Character templates | 📋 | Pre-built agents |
| Strategy library | 📋 | Common approaches |
| Monitoring dashboard | 📋 | Track agent perf |

#### Milestone 3.3: Advanced Trading
| Feature | Status | Notes |
|---------|--------|-------|
| Stop-loss orders | 📋 | Auto-hedge below price |
| Take-profit orders | 📋 | Auto-sell above price |
| Trailing stops | 📋 | Dynamic targets |
| Portfolio margin | 📋 | Multi-position risk |

---

### Phase 4: Privacy Layer
**Timeline:** Q1 2027 (Jan - Mar)  
**Goal:** FHE encryption for confidential operations

#### Milestone 4.1: Fhenix Integration
| Feature | Status | Notes |
|---------|--------|-------|
| Fhenix testnet | 📋 | Separate network |
| Encrypted orders | 📋 | Private quantities/prices |
| FHE matching | 📋 | Match without decrypting |
| SDK integration | 📋 | Frontend library |

#### Milestone 4.2: Privacy Features
| Feature | Status | Notes |
|---------|--------|-------|
| Encrypted order book | 📋 | Only match visible |
| Private premiums | 📋 | Fee not public |
| Agent strategies | 📋 | Hidden from competitors |
| Anonymous voting | 📋 | Governance privacy |

#### Milestone 4.3: Production
| Feature | Status | Notes |
|---------|--------|-------|
| Mainnet deployment | 📋 | Fhenix mainnet |
| Bridge Polygon ↔ Fhenix | 📋 | Asset transfer |
| Performance optimization | 📋 | Reduce gas costs |
| Security audit | 📋 | Third-party review |

---

### Phase 5: Scale
**Timeline:** Q2 2027+  
**Goal:** Pan-African coverage

#### Expansion Targets
| Region | Timeline | Focus Crops | Partners |
|--------|----------|-------------|----------|
| Kenya | Current | Maize, Coffee, Tea | Rift Valley Co-ops |
| Tanzania | Q2 2027 | Cashew, Coffee | Sokoine University |
| Uganda | Q2 2027 | Coffee, Cotton | NUCAFE |
| Nigeria | Q3 2027 | Cocoa, Sesame | Olam, AFEX |
| Ghana | Q3 2027 | Cocoa, Cashew | Cocobod |
| Ivory Coast | Q4 2027 | Cocoa, Coffee | Rainforest Alliance |

#### New Products
| Product | Timeline | Description |
|---------|----------|-------------|
| Weather derivatives | Q3 2027 | Hedge drought/flood risk |
| Input financing | Q4 2027 | Credit for seeds/fertilizer |
| Warehouse receipts | Q4 2027 | Store & trade receipts |
| Crop insurance | Q1 2028 | Parametric coverage |

---

## Key Metrics

### Q2 2026 Targets
| Metric | Target | Current |
|--------|--------|---------|
| WhatsApp users | 1,000 | 0 |
| Active hedges | 500 | 0 |
| TVL (USDC) | $100K | $50K |
| Co-ops enrolled | 5 | 3 |
| AI agents | 20 | 5 |

### Q4 2026 Targets
| Metric | Target | Current |
|--------|--------|---------|
| WhatsApp users | 10,000 | 0 |
| Active hedges | 5,000 | 0 |
| TVL (USDC) | $1M | $50K |
| Co-ops enrolled | 50 | 3 |
| AI agents | 100 | 5 |

### Q4 2027 Targets
| Metric | Target | Current |
|--------|--------|---------|
| WhatsApp users | 100,000 | 0 |
| Active hedges | 50,000 | 0 |
| TVL (USDC) | $10M | $50K |
| Co-ops enrolled | 500 | 3 |
| AI agents | 1,000 | 5 |
| Countries | 6 | 1 |

---

## Technical Dependencies

```
WhatsApp Integration
├── Twilio Account ✓
├── Nhost Backend 🔄
├── WhatsApp Bot API 🔄
└── Multi-language (EN/SW/HA) 📋

Smart Contracts
├── Polygon/Amoy ✓
├── Chainlink Oracles 🔄
├── AgentRegistry 📋
├── CommodityEscrow ✓
└── PriceTrigger 📋

Agent Economy
├── ElizaOS Core ✓
├── Python SDK ✓
├── Agent Marketplace ✓
├── Strategy Library 📋
└── Monitoring 📋

Privacy
├── Fhenix Testnet 📋
├── FHE SDK 📋
├── Encrypted Matching 📋
└── Mainnet Deployment 📋

Payments
├── USDC ✓
├── x402 ✓
├── M-Pesa 📋
└── Mobile Money 📋
```

Legend: ✅ Complete | 🔄 In Progress | 📋 Planned

---

## Team Roadmap

| Role | Q2 | Q3 | Q4 | Q1 2027 |
|------|-----|-----|-----|---------|
| Backend | WhatsApp + Chainlink | M-Pesa + Bulk ops | Agent API | Fhenix |
| Frontend | Bot UX + Dashboard | Co-op portal | Agent UI | Privacy UI |
| Contracts | PriceTrigger | DVC + Escrow | Advanced trading | FHE contracts |
| ML | NLP parser | DVC scoring | Strategy models | Prediction engine |
| DevOps | Monitoring | Scale infra | Security audit | Multi-region |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WhatsApp policy change | Medium | High | Multi-channel (USSD, SMS) |
| Low farmer adoption | High | High | Co-op-led onboarding |
| Oracle manipulation | Low | High | Multi-source aggregation |
| FHE performance | Medium | Medium | Gradual rollout, optimize |
| Regulatory uncertainty | Medium | Medium | Compliance-first design |
| Competitor fast-follow | High | Low | Speed + community lock-in |

---

## Success Criteria

### Phase 1 Success (WhatsApp)
- 1,000 farmers using WhatsApp hedge
- Average hedge completed in <2 minutes
- <1% error rate on natural language parsing
- Net Promoter Score > 60

### Phase 2 Success (Co-ops)
- 50 cooperatives enrolled
- Average verification time <24 hours
- 50% of hedges through co-op bulk operations
- DVC coverage >80% of farmers

### Phase 3 Success (Agents)
- 100 active AI agents
- $500K daily trading volume
- Average agent uptime >99%
- Agent revenue > $10K/month

---

## How to Contribute

1. **Pilot Partner**: Deploy with your co-op
2. **Agent Developer**: Build on our SDK
3. **Data Provider**: Feed price oracle
4. **Investor**: Pre-seed round
5. **Advisor**: Agricultural/fintech expertise

**Contact**: hello@afrifutures.com  
**Discord**: discord.gg/afrifutures  
**GitHub**: github.com/afrifutures
