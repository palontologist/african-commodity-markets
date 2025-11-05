# 🎯 Staking Configuration Guide

This guide helps you configure the environment variables needed to enable staking functionality in your prediction market application.

## 📋 Required Environment Variables

### For Polygon (Amoy Testnet)

#### 1. USDC Token Address (Already Configured)
```bash
NEXT_PUBLIC_USDC_ADDRESS="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
```
✅ This is the official USDC token on Polygon Amoy testnet - already set in `.env.example`

#### 2. Prediction Market Contract Address
```bash
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS="your-contract-address-here"
```

**Options to get this:**

**Option A: Use Your Personal Address (Quick Test)**
If you just want to test the error messages, you can temporarily use any valid Ethereum address:
```bash
# Example - replace with your own wallet address
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS="0x95432C47b65A381B2bC43779Fd97e5017f39aB82"
```
⚠️ Note: This won't actually work for staking (transactions will fail), but you'll see proper error messages instead of "Contract address not configured"

**Option B: Deploy Your Own Contract (Recommended)**
Deploy the prediction market contract from the repository:

```bash
# 1. Set up your deployer wallet
export PRIVATE_KEY="your-private-key-here"

# 2. Make sure you have Amoy testnet MATIC
# Get from: https://faucet.polygon.technology/

# 3. Deploy the contract
cd /home/runner/work/african-commodity-markets/african-commodity-markets
npx hardhat run scripts/deploy-prediction-market.ts --network amoy

# 4. Copy the deployed address from output
# Example output: "Deployed to: 0xAbC123..."
```

**Option C: Use Existing Deployed Contract**
According to the docs, there may be a bridge contract already deployed:
```bash
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS="0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9"
```
Note: This is the bridge contract address from your deployment docs. You may need to verify if this includes prediction market functionality.

---

### For Solana (Devnet)

#### 1. USDC SPL Token Mint
```bash
# Devnet USDC - Use this for testing on Solana devnet
NEXT_PUBLIC_SOLANA_USDC_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
```
⚠️ **Important**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` is the mainnet USDC address. For devnet testing, use `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`.

**How to get devnet USDC:**
1. Visit https://faucet.circle.com/
2. Connect your Phantom wallet
3. Select "Solana Devnet"
4. Request USDC tokens (you'll get test USDC)

Alternative: You can also use any devnet SPL token for testing purposes.

#### 2. Prediction Market Program ID
```bash
NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID="your-program-id-here"
```

**How to get this:**

The Solana programs need to be deployed. According to your docs, you have two options:

**Option A: Deploy via Solana Playground (Recommended - 5-10 min)**
1. Go to https://beta.solpg.io
2. Create new project: "afrifutures-prediction"
3. Import/Connect your Phantom wallet
4. Get devnet SOL (airdrop)
5. Copy program code from `/programs/prediction-market/src/lib.rs`
6. Build and deploy
7. Copy the Program ID from deployment output

See detailed steps in: `YOUR_DEPLOYMENT_GUIDE.md`

**Option B: Use Temporary Address for Testing**
```bash
# Use your Phantom wallet address temporarily
NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
```
⚠️ This won't work for actual staking but will show proper error messages

#### 3. Optional: Solana RPC URL
```bash
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
```
Default is already set in code, but you can override if needed.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create .env.local file

```bash
cd /home/runner/work/african-commodity-markets/african-commodity-markets
cp .env.example .env.local
```

### Step 2: Add Staking Configuration

Edit `.env.local` and add these lines:

```bash
# ===================================
# STAKING CONFIGURATION
# ===================================

# Polygon Staking (Amoy Testnet)
NEXT_PUBLIC_USDC_ADDRESS="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS="your-polygon-contract-or-wallet-address"
NEXT_PUBLIC_CHAIN_ID="80002"

# Solana Staking (Devnet)
NEXT_PUBLIC_SOLANA_USDC_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID="your-solana-program-id-or-wallet-address"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_CLUSTER="devnet"
```

### Step 3: Replace Placeholder Values

**For Quick Testing (uses your wallet addresses):**
```bash
# Replace with your actual addresses:
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS="0x95432C47b65A381B2bC43779Fd97e5017f39aB82"  # Your MetaMask address
NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"  # Your Phantom address
```

**For Production (after deploying contracts):**
Replace with actual deployed contract addresses from Step 4 below.

### Step 4: Restart Development Server

```bash
npm run dev
```

Now when you try to stake, you'll see specific error messages instead of generic "Stake failed":
- ✅ "contract address not configured" → Now shows: "prediction market address not configured"
- ✅ "usdc address not configured" → Now shows: "usdc address not configured"
- ✅ Shows the actual configuration issue

---

## 🧪 Testing Your Configuration

### Test 1: Check Environment Variables Loaded
```bash
# Start dev server and check console
npm run dev

# In browser console (F12):
console.log('USDC:', process.env.NEXT_PUBLIC_USDC_ADDRESS);
console.log('Market:', process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS);
```

### Test 2: Try Staking (Polygon)
1. Open http://localhost:3000
2. Connect MetaMask wallet
3. Select Polygon Amoy network
4. Click "Stake" on any market
5. Enter amount and click stake
6. Check error message - should show specific issue, not generic "Stake failed"

### Test 3: Try Staking (Solana)
1. Switch to Solana in chain selector
2. Connect Phantom wallet
3. Try staking
4. Check error message - should be specific

---

## 📝 Complete .env.local Example

Here's a complete working configuration:

```bash
# Database
DATABASE_URL="libsql://your-database.turso.io"
DATABASE_AUTH_TOKEN="your-auth-token"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Blockchain - Polygon
POLYGON_AMOY_RPC="https://rpc-amoy.polygon.technology"
PRIVATE_KEY="your-deployer-private-key"
NEXT_PUBLIC_USDC_ADDRESS="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS="0x95432C47b65A381B2bC43779Fd97e5017f39aB82"
NEXT_PUBLIC_CHAIN_ID="80002"

# Blockchain - Solana
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_CLUSTER="devnet"
NEXT_PUBLIC_SOLANA_USDC_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

# AI APIs
GROQ_API_KEY="gsk_..."
ALPHA_VANTAGE_KEY="YOUR_KEY"

# Development
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🎯 What Each Variable Does

### NEXT_PUBLIC_USDC_ADDRESS
- **Purpose**: The USDC token contract address for Polygon
- **Used for**: Checking user balance, approving spending
- **Default**: Polygon Amoy testnet USDC (already configured)

### NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS
- **Purpose**: The deployed prediction market smart contract
- **Used for**: Submitting stake transactions, querying market data
- **Need to**: Deploy contract or use existing address

### NEXT_PUBLIC_SOLANA_USDC_MINT
- **Purpose**: The USDC SPL token mint address for Solana
- **Used for**: Token transfers, balance checks
- **Default**: Solana devnet USDC

### NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID
- **Purpose**: The deployed Solana prediction market program
- **Used for**: Submitting stake transactions on Solana
- **Need to**: Deploy Solana program via Playground

---

## 🆘 Troubleshooting

### "Solana USDC balance not showing" or "Balance is 0"
This is the most common issue when connecting Phantom wallet:

**Cause**: Wrong USDC mint address or no token account exists yet.

**Solution:**
1. **Use correct devnet USDC mint**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` (NOT the mainnet address)
2. **Get devnet USDC tokens**:
   - Visit https://faucet.circle.com/
   - Connect Phantom wallet
   - Select "Solana Devnet"
   - Request test USDC (free)
3. **Ensure you have SOL for rent**:
   - Visit https://faucet.solana.com/
   - Request devnet SOL (0.1-1 SOL)
   - SOL is needed to create the token account

**Check your setup:**
```bash
# In .env.local, make sure you have:
NEXT_PUBLIC_SOLANA_USDC_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_CLUSTER="devnet"
```

**Verify on Solana Explorer:**
- Go to https://explorer.solana.com/?cluster=devnet
- Paste your Phantom wallet address
- Check for SPL tokens - you should see USDC if you have any

### "Token account not found"
This means you haven't received any USDC yet. The token account is created automatically when you first receive USDC. Use the Circle faucet above to get test tokens.

### "Environment variable not configured"
✅ **Good!** This means the improved error handling is working. Now you know exactly which variable to add.

### "Transaction failed"
If you used personal addresses for testing:
- This is expected - the addresses aren't actual contracts
- The improved error messages are still working correctly
- To actually stake, you need to deploy real contracts

### "USDC address not configured"
Check that you have this line in `.env.local`:
```bash
NEXT_PUBLIC_USDC_ADDRESS="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
```

### Build doesn't pick up new env vars
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

---

## 📚 Next Steps

### For Full Functionality

1. **Deploy Polygon Contract** (20-30 min)
   - Follow instructions in `/scripts/deploy-prediction-market.ts`
   - Update `NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS`

2. **Deploy Solana Program** (10-15 min)
   - Use Solana Playground: https://beta.solpg.io
   - Follow `YOUR_DEPLOYMENT_GUIDE.md`
   - Update `NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID`

3. **Test End-to-End** (15 min)
   - Get testnet tokens (USDC, MATIC, SOL)
   - Try staking on both chains
   - Verify transactions on block explorers

### For Development/Testing Only

If you just want to test the UI and error handling:
1. ✅ Use your personal wallet addresses
2. ✅ Error messages will now show clearly
3. ✅ UI will work (just transactions will fail at blockchain level)
4. ✅ This is useful for frontend development

---

## 💡 Pro Tips

1. **Start with Polygon** - It's easier to deploy and test
2. **Use testnet faucets** - Get free tokens for testing
3. **Check block explorers** - Verify your contracts are deployed
4. **Save your addresses** - Document what you deployed where
5. **Test incrementally** - One chain at a time

---

## 🎉 Success Criteria

You'll know it's working when:
- ✅ No "not configured" errors
- ✅ Stake modal opens and shows your balance
- ✅ Can approve USDC spending
- ✅ Can submit stake transactions
- ✅ Transactions appear on block explorer

---

**Questions?** 
- Check `/docs/` folder for more guides
- See `YOUR_DEPLOYMENT_GUIDE.md` for Solana deployment
- Review `DEPLOYMENT_STATUS.md` for current state

**Need contracts?**
- Polygon: Deploy with Hardhat (see `/scripts/`)
- Solana: Deploy with Playground (see deployment guide)
