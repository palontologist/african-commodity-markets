# Deploy Oracle as Separate Program

## 🎯 Current Status

✅ **Prediction Market Deployed**: `FHjfGj18f4WSChRdvZoMd8ccWBptb3wHzhCjDFW6CLfg`  
⏳ **Oracle**: Needs separate deployment

## 📋 Steps to Deploy Oracle Separately

### 1. Create New Project in Solana Playground

1. Go to https://beta.solpg.io
2. Click **"New Project"** (top left)
3. Name it: `oracle-program`
4. Delete the default code in `lib.rs`

### 2. Copy Oracle Code

1. Open `ORACLE_PROGRAM_STANDALONE.rs` from this repo
2. Copy **ALL** the code
3. Paste into Solana Playground's `lib.rs`
4. Save (Ctrl+S or Cmd+S)

### 3. Build the Oracle Program

```bash
# In Solana Playground terminal
build
```

Wait for compilation to complete.

### 4. Deploy to Devnet

```bash
# In Solana Playground
deploy
```

Or click the **Deploy** button in the UI.

### 5. Copy the New Program ID

After deployment, you'll see:
```
Program Id: XYZ789...abc
```

**This is your Oracle Program ID!**

### 6. Update `.env.local`

```env
NEXT_PUBLIC_SOLANA_ORACLE_PROGRAM_ID="YOUR_NEW_ORACLE_ID_HERE"
```

### 7. Initialize Both Programs

**Initialize Prediction Market:**
```typescript
// In Solana Playground or your app
await program.methods.initialize().rpc();
```

**Initialize Oracle:**
```typescript
// In Solana Playground
await oracleProgram.methods.initialize().rpc();
```

## 🔗 Program Architecture

```
┌─────────────────────────────────────────┐
│  Prediction Market Program              │
│  ID: FHjfGj18f4WSChRdvZoMd8ccWBptb3wHzhCjDFW6CLfg │
│                                         │
│  Instructions:                          │
│  ├─ initialize()                        │
│  ├─ create_market()                     │
│  ├─ buy_shares()                        │
│  ├─ resolve_market() ──────────┐       │
│  └─ claim_winnings()           │       │
└────────────────────────────────┼───────┘
                                 │
                                 │ Reads price via CPI
                                 ▼
┌─────────────────────────────────────────┐
│  Oracle Program                         │
│  ID: [YOUR_NEW_ORACLE_ID]               │
│                                         │
│  Instructions:                          │
│  ├─ initialize()                        │
│  ├─ update_price() ◄─── Your wallet    │
│  └─ get_price() ◄─────── Prediction    │
│                          Market calls   │
└─────────────────────────────────────────┘
```

## 📝 Testing Flow

### 1. Initialize Oracle
```typescript
await oracleProgram.methods
  .initialize()
  .accounts({
    oracleState: oracleStatePDA,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### 2. Update Commodity Price
```typescript
const commodity = Buffer.from("COFFEE").toString('hex').padEnd(64, '0');
const commodityBytes = Buffer.from(commodity, 'hex');

await oracleProgram.methods
  .updatePrice(
    Array.from(commodityBytes), // commodity as [u8; 32]
    250, // price in cents: $2.50
    95   // 95% confidence
  )
  .accounts({
    priceAccount: priceAccountPDA,
    oracleState: oracleStatePDA,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### 3. Create Prediction Market
```typescript
await predictionProgram.methods
  .createMarket(
    marketId,
    Array.from(commodityBytes),
    250, // threshold: $2.50
    expiryTime
  )
  .rpc();
```

### 4. Resolve Market with Oracle
```typescript
await predictionProgram.methods
  .resolveMarket()
  .accounts({
    market: marketPDA,
    priceOracle: priceAccountPDA, // from oracle program
    oracleProgram: oracleProgramId,
    authority: wallet.publicKey,
  })
  .rpc();
```

## 🔐 Security Notes

**Important:** The oracle authority wallet (your wallet) can update prices. In production:

1. **Use a dedicated oracle wallet** (not your main wallet)
2. **Implement price verification** (fetch from multiple sources)
3. **Add access controls** (whitelist of authorized updaters)
4. **Log all updates** for audit trail
5. **Consider using a decentralized oracle** (Pyth, Switchboard)

## 🌐 Alternative: Use Existing Oracle

Instead of deploying your own oracle, you could integrate with:

- **Pyth Network**: Real-time price feeds
- **Switchboard**: Customizable data feeds
- **Chainlink** (if available on Solana)

This would be more secure and reliable for production.

## ✅ Deployment Checklist

- [ ] Create new Solana Playground project
- [ ] Copy oracle code to `lib.rs`
- [ ] Build successfully
- [ ] Deploy to devnet
- [ ] Copy new Program ID
- [ ] Update `.env.local` with oracle ID
- [ ] Initialize oracle state
- [ ] Test updating prices
- [ ] Test prediction market reading oracle
- [ ] Export wallet keypair for automated updates

## 🆘 Troubleshooting

**"Program ID mismatch"**
- Update `declare_id!("...")` in oracle code to match deployed ID
- Rebuild and redeploy

**"Account not found"**
- Make sure you called `initialize()` first
- Check PDAs are derived correctly

**"Unauthorized"**
- Only the oracle authority can update prices
- Check you're using the correct wallet

**"Stale price"**
- Oracle prices older than 1 hour trigger warnings
- Update the price before resolving markets
