# Solana Deployment - Next Steps

## ✅ What You've Accomplished

- Deployed Prediction Market program to Solana Devnet
- Wallet Address: `6NFLxHeUT7LVya1Zx2NYCG6V3Fzh37W81dGqVsn924nQ`

## 📋 Next Steps

### 1. Get Your Program IDs from Solana Playground

After deploying in Solana Playground, you should see output like:

```
Program Id: ABC123...xyz
```

**Action Required:**
1. Copy the **Prediction Market Program ID** from Solana Playground
2. If you deployed an Oracle program, copy that Program ID too
3. Update your `.env.local` file with these IDs

### 2. Export Your Wallet Keypair (FOR ORACLE ONLY)

The oracle needs your private key to sign price updates.

**In Solana Playground:**
1. Click on your wallet icon (bottom left)
2. Click "Export" 
3. Copy the keypair array (looks like `[123,45,67,...]`)
4. Add to `.env.local` as `ORACLE_KEYPAIR`

**⚠️ SECURITY WARNING:**
- This keypair gives full access to your wallet
- Only use it on the server-side (API routes)
- NEVER commit it to GitHub
- Use environment variables in production
- Consider using a separate oracle-only wallet

### 3. Setup Environment Variables

Create `.env.local` in your project root:

```bash
cp .env.local.example .env.local
```

**Required Variables:**

```env
# From Solana Playground deployment
NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID=<YOUR_PROGRAM_ID>
NEXT_PUBLIC_SOLANA_ORACLE_PROGRAM_ID=<YOUR_ORACLE_ID>

# Your wallet
NEXT_PUBLIC_SOLANA_WALLET_ADDRESS=6NFLxHeUT7LVya1Zx2NYCG6V3Fzh37W81dGqVsn924nQ

# Network (already set)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Devnet USDC (already set)
NEXT_PUBLIC_SOLANA_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# For oracle updates (server-side only)
ORACLE_KEYPAIR=[your,private,key,array]
CRON_SECRET=your-random-secret-123
```

### 4. Verify Your Deployment

Check your program on Solana Explorer:

```
https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet
```

### 5. Initialize Your Program

Before using the prediction market, you need to initialize it:

**In Solana Playground:**
```typescript
// Run in the terminal
anchor run initialize
```

Or create a script to call the `initialize` instruction once.

### 6. Test Your Integration

```bash
# Start your Next.js app
pnpm dev

# Visit http://localhost:3000
# Connect Phantom wallet (set to Devnet)
# Try creating a prediction market
```

### 7. Get Devnet USDC

Your wallet needs devnet USDC to test staking:

**Option 1: SPL Token Faucet**
```bash
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
spl-token mint 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU 1000
```

**Option 2: Manual airdrop**
- Visit https://spl-token-faucet.com (if available)
- Or use Solana Playground's token tools

## 🔧 Environment Variables Reference

### Client-Side (NEXT_PUBLIC_*)
These are exposed to the browser:
- `NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID` - Your deployed program
- `NEXT_PUBLIC_SOLANA_WALLET_ADDRESS` - Your wallet (for display only)
- `NEXT_PUBLIC_SOLANA_NETWORK` - Network (devnet/mainnet)
- `NEXT_PUBLIC_SOLANA_RPC_URL` - RPC endpoint
- `NEXT_PUBLIC_SOLANA_USDC_MINT` - USDC token mint address

### Server-Side (No NEXT_PUBLIC prefix)
These are secret and only used in API routes:
- `ORACLE_KEYPAIR` - Private key array for oracle signing
- `CRON_SECRET` - Secret for authenticating cron jobs
- `DATABASE_URL` - Database connection (if using)

## 📝 Current Program Structure

```
Programs Deployed:
├── Prediction Market ✅
│   ├── Program ID: [TO BE ADDED]
│   ├── Instructions:
│   │   ├── initialize() - Setup market state
│   │   ├── create_market() - Create new prediction
│   │   ├── buy_shares() - Stake USDC
│   │   ├── resolve_market() - Oracle settlement
│   │   └── claim_winnings() - Claim rewards
│   └── Accounts:
│       ├── MarketState (global)
│       ├── PredictionMarket (per market)
│       └── UserPosition (per user per market)
│
└── Oracle (Optional) ⏳
    ├── Program ID: [TO BE ADDED]
    ├── Instructions:
    │   ├── initialize() - Setup oracle
    │   ├── update_price() - Update commodity price
    │   └── get_price() - Read price (CPI)
    └── Accounts:
        ├── OracleState (global)
        └── PriceAccount (per commodity)
```

## 🚀 Integration Checklist

- [ ] Copy Program ID from Solana Playground
- [ ] Update `.env.local` with Program ID
- [ ] Export wallet keypair for oracle
- [ ] Add keypair to `.env.local` (server-only)
- [ ] Initialize the program (call `initialize` once)
- [ ] Get devnet USDC tokens
- [ ] Test creating a market
- [ ] Test buying shares
- [ ] Update oracle price
- [ ] Test resolving market
- [ ] Test claiming winnings

## 🔗 Useful Links

- **Solana Playground**: https://beta.solpg.io
- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet
- **Your Wallet**: https://explorer.solana.com/address/6NFLxHeUT7LVya1Zx2NYCG6V3Fzh37W81dGqVsn924nQ?cluster=devnet
- **Phantom Wallet**: https://phantom.app
- **Devnet Faucet**: https://faucet.solana.com

## 🆘 Troubleshooting

**"Program not found"**
- Check Program ID is correct in `.env.local`
- Verify deployment succeeded in Solana Playground
- Check you're on devnet, not mainnet

**"Account not initialized"**
- Run the `initialize` instruction first
- Check MarketState account was created

**"Insufficient funds"**
- Get SOL from devnet faucet: https://faucet.solana.com
- Get USDC tokens using spl-token CLI

**"Transaction failed"**
- Check wallet is set to Devnet
- Verify you have enough SOL for rent
- Check program logs in explorer

## 📞 Need Help?

Share your:
1. Program ID
2. Transaction signature
3. Error message
4. Which network (devnet/mainnet)
