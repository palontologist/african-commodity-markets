# Market Seeding Guide

## Overview
This guide explains how to populate your blockchain with realistic prediction markets for testing.

## Quick Start

### 1. Prerequisites
- ✅ Polygon Amoy testnet configured in `.env.local`
- ✅ Prediction market contract deployed
- ✅ Test MATIC in your wallet

**Get Test MATIC**: https://faucet.polygon.technology/

### 2. Seed Markets

```bash
# Seed 10 realistic prediction markets
pnpm seed:markets
```

This will create markets for:
- **COFFEE**: 2 markets (30d, 60d expiry)
- **COCOA**: 2 markets (45d, 90d expiry)
- **COTTON**: 2 markets (30d, 60d expiry)
- **GOLD**: 1 market (45d expiry)
- **CASHEW**: 1 market (60d expiry)
- **RUBBER**: 2 markets (30d, 90d expiry)

### 3. View Markets

```bash
# Start dev server
pnpm dev

# Visit homepage
open http://localhost:3000
```

## Market Templates

Each market includes:
- **Commodity**: Asset name (COFFEE, COCOA, etc.)
- **Current Price**: Today's price (in cents)
- **Target Price**: Predicted price (in cents)
- **Expiry**: Days until resolution (30-90 days)
- **Confidence**: AI confidence score (55-72%)
- **Model**: AI model used (qwen/qwen3-32b)

## Environment Variables

Required in `.env.local`:

```env
# Polygon Amoy Testnet
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x5569E5B581f3B998dD81bFa583f91693aF44C14f
NEXT_PUBLIC_POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002

# Admin wallet (for seeding)
ADMIN_PRIVATE_KEY=your_private_key_here
```

## Troubleshooting

### Insufficient Balance
```
❌ Insufficient balance. Get test MATIC from: https://faucet.polygon.technology/
```
**Solution**: Visit faucet and get test MATIC

### Transaction Failed
```
❌ Failed: execution reverted
```
**Solution**: 
- Check contract address is correct
- Ensure wallet has enough MATIC
- Wait a few seconds between transactions

### No Markets Showing
```
No active markets yet
```
**Solution**:
- Wait 30 seconds after seeding
- Refresh the page
- Check browser console for errors

## Manual Market Creation

You can also create markets via the dashboard:

```bash
# Visit dashboard
open http://localhost:3000/dashboard

# Click "Generate Prediction"
# Select commodity and date
# Submit to blockchain
```

## Current Market Data (Oct 2025)

Realistic starting prices:
- **COFFEE**: $2.50/lb (Arabica)
- **COCOA**: $85.00/lb
- **COTTON**: $0.75/lb
- **GOLD**: $2,680/oz
- **CASHEW**: $4.50/lb
- **RUBBER**: $1.80/lb

## Next Steps

After seeding:
1. ✅ Visit homepage to see markets
2. ✅ Connect wallet (MetaMask)
3. ✅ Get test USDC from faucet
4. ✅ Test staking on YES/NO
5. ✅ View positions in dashboard

## API Endpoints

Markets are accessible via:

```typescript
// Get single market
GET /api/predictions/:id

// List all markets
GET /api/predictions

// Get user positions
GET /api/positions/:address
```

## Database vs Blockchain

**Blockchain (Source of Truth)**:
- Market parameters
- User stakes/positions
- Resolution results
- USDC balances

**Database (Cached)**:
- Historical predictions
- AI insights
- User preferences
- Analytics

## Production Deployment

For mainnet deployment:

1. Update RPC to Polygon mainnet
2. Deploy contracts to mainnet
3. Use real USDC (0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174)
4. Remove test/demo data
5. Add proper access controls

---

**Need Help?** Check the docs:
- [ROADMAP_UPDATED_2025.md](../docs/ROADMAP_UPDATED_2025.md)
- [BLOCKCHAIN_INTEGRATION.md](../docs/BLOCKCHAIN_INTEGRATION.md)
- [DEPLOYMENT_SUMMARY.md](../DEPLOYMENT_SUMMARY.md)
