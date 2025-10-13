# 🎯 IMMEDIATE ACTION REQUIRED

**Date**: October 12, 2025  
**Time to Working Prototype**: 2-3 hours (after funding)

---

## 🔴 BLOCKER: Need Testnet MATIC

**Wallet**: `0x95432C47b65A381B2bC43779Fd97e5017f39aB82`  
**Current Balance**: `0.000955 MATIC` (~$0.0008)  
**Required**: `0.15 MATIC` (~$0.13)

### 🚀 GET MATIC NOW:

#### Option 1: Polygon Official Faucet (Recommended)
1. Go to: https://faucet.polygon.technology/
2. Click "Polygon Amoy" network
3. Paste wallet: `0x95432C47b65A381B2bC43779Fd97e5017f39aB82`
4. Complete CAPTCHA
5. Click "Send Me MATIC"
6. Wait 1-2 minutes

#### Option 2: Alchemy Faucet
1. Go to: https://www.alchemy.com/faucets/polygon-amoy
2. Sign in with email/GitHub
3. Paste wallet: `0x95432C47b65A381B2bC43779Fd97e5017f39aB82`
4. Complete verification
5. Receive 0.5 MATIC instantly

#### Option 3: QuickNode Faucet
1. Go to: https://faucet.quicknode.com/polygon/amoy
2. Enter wallet: `0x95432C47b65A381B2bC43779Fd97e5017f39aB82`
3. Complete CAPTCHA
4. Receive MATIC

---

## ✅ AFTER RECEIVING MATIC (5 minutes):

### Step 1: Verify Balance
```bash
npx hardhat run scripts/check-balance.js --network polygon-amoy
```

Should show: `✅ Sufficient balance for deployment`

### Step 2: Deploy Contracts
```bash
npx hardhat run scripts/deploy-bridge.js --network polygon-amoy
```

This will:
- ✅ Deploy AFF Token (ERC-20 governance token)
- ✅ Deploy AfrifuturesBridge (Wormhole cross-chain bridge)
- ✅ Set up roles and permissions
- ✅ Save addresses to `deployments/bridge-deployment.json`
- ✅ Display verification commands

Expected output:
```
🚀 Deploying Afrifutures Contracts to Polygon...
📝 Deploying with account: 0x95432C47b65A381B2bC43779Fd97e5017f39aB82
💰 Account balance: 0.5 MATIC

📦 Deploying AFF Token...
✅ AFF Token deployed to: 0x...
   Initial supply: 1,000,000,000 AFF

📦 Deploying AfrifuturesBridge...
✅ AfrifuturesBridge deployed to: 0x...

🔐 Setting up roles...
✅ Granted RELAYER_ROLE to: 0x95432C47b65A381B2bC43779Fd97e5017f39aB82

💵 Setting initial fees...
✅ Bridge fee set to: 0.01 MATIC
✅ Relayer fee set to: 0.005 MATIC

============================================================
🎉 Deployment Complete!
============================================================

📋 Contract Addresses:
  Bridge: 0x...
  Wormhole Core: 0x0CBE91CF822c73C2315FB05100C2F714765d5c20
  USDC: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
  $AFF Token: 0x...

📝 Add to .env.local:
NEXT_PUBLIC_AFF_TOKEN_POLYGON=0x...
NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT=0x...
```

### Step 3: Update Environment Variables
```bash
# Open .env.local and add the addresses from Step 2 output:
nano .env.local

# Add these lines (with your actual addresses):
NEXT_PUBLIC_AFF_TOKEN_POLYGON=0x...
NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT=0x...
```

### Step 4: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
pnpm dev
```

### Step 5: Test Staking Flow
```bash
# Open browser: http://localhost:3000/market/COFFEE
# Click "Stake Now"
# Enter: 10 USDC
# Select: YES
# Click "Place Stake"
# Confirm in MetaMask
```

---

## 📊 What You'll Have After Deployment

```
┌─────────────────────────────────────────────────────────┐
│             🎉 WORKING PROTOTYPE 🎉                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Polygon Contracts                                   │
│     • Prediction Market (deployed)                      │
│     • AFF Token (deploying)                             │
│     • Wormhole Bridge (deploying)                       │
│                                                         │
│  ✅ Solana Programs                                     │
│     • Prediction Market (deployed)                      │
│     • Oracle (deployed)                                 │
│                                                         │
│  ✅ Frontend Features                                   │
│     • Market browsing                                   │
│     • Real-time prices                                  │
│     • Wallet connection                                 │
│     • Staking interface                                 │
│     • AI predictions                                    │
│                                                         │
│  ✅ Ready to Test                                       │
│     • Create predictions                                │
│     • Stake USDC                                        │
│     • Resolve markets                                   │
│     • Claim winnings                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Test Scenarios (After Deployment)

### Scenario 1: Basic Stake (5 minutes)
1. Go to: http://localhost:3000/market/COFFEE
2. Click "Stake Now"
3. Amount: 10 USDC
4. Position: YES (coffee price will rise)
5. Confirm transaction
6. ✅ See position in "My Stakes"

### Scenario 2: Create Market (10 minutes)
1. Go to: http://localhost:3000/markets/create
2. Commodity: COCOA
3. Question: "Will COCOA reach $3000 by Dec 31?"
4. Threshold: $3000
5. Expiry: 2025-12-31
6. Submit transaction
7. ✅ Market appears in listings

### Scenario 3: Resolve & Claim (15 minutes)
1. Wait for market expiry OR manually resolve
2. Run oracle: `curl http://localhost:3000/api/oracle/resolve?marketId=1`
3. Go to: http://localhost:3000/market/COFFEE
4. Click "Claim Winnings"
5. ✅ Receive payout in USDC

---

## 🚨 Common Issues & Solutions

### Issue: "Insufficient funds"
**Solution**: Get more MATIC from faucet (see above)

### Issue: "Transaction failed"
**Solution**: 
- Check wallet is on Polygon Amoy (Chain ID: 80002)
- Check USDC balance and approval
- Try increasing gas limit

### Issue: "Contract not found"
**Solution**: 
- Verify deployment completed
- Check addresses in .env.local
- Restart dev server

### Issue: "Network error"
**Solution**:
- Check internet connection
- Try different RPC: https://rpc-amoy.polygon.technology/
- Clear browser cache

---

## 📞 Quick Links

- **Get MATIC**: https://faucet.polygon.technology/
- **Get USDC**: https://faucet.circle.com/
- **PolygonScan**: https://amoy.polygonscan.com/address/0x95432C47b65A381B2bC43779Fd97e5017f39aB82
- **Project Status**: See `DEPLOYMENT_STATUS_OCT_2025.md`

---

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Contracts deploy without errors
- ✅ Can connect MetaMask to app
- ✅ Can see USDC balance in UI
- ✅ Can stake USDC on predictions
- ✅ Transaction shows in PolygonScan
- ✅ Balance updates after staking

---

**👉 NEXT ACTION: Get MATIC from faucet → Deploy → Test**

**Current Status**: 🟡 **Ready to Deploy** (waiting for MATIC)  
**ETA**: 2-3 hours to working prototype
