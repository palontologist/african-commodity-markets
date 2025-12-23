# Staking Wallet Connection Fix - December 22, 2025

## 🔧 Issue Fixed

**Problem**: When trying to stake on Solana devnet with Solflare wallet connected, the platform was showing Ethereum/MetaMask transaction requests instead of Solana transactions, and USDC balance showed as $0 even though the wallet had SOL balance.

**Root Cause**: The market prediction cards had the blockchain chain **hardcoded to 'polygon'**, ignoring the connected wallet type and user's chain selection.

## ✅ What Was Fixed

### 1. **Dynamic Chain Selection**
- Updated [components/blockchain/market-prediction-card.tsx](components/blockchain/market-prediction-card.tsx) to use `ChainProvider` context
- Removed hardcoded `chain: 'polygon'` and now uses `activeChain` from context
- Markets now respect the user's selected chain (Polygon or Solana)

### 2. **Improved Wallet Detection**
- Enhanced [components/markets/stake-modal.tsx](components/markets/stake-modal.tsx) with better wallet connection detection
- Added **chain mismatch warning** that alerts users when they have the wrong wallet connected
- Clear messaging about which wallet type is needed (MetaMask for Polygon, Phantom/Solflare for Solana)

### 3. **Better Error Messages**
The stake modal now shows three states:
- ✅ **Correct wallet connected**: Shows balance and allows staking
- ⚠️ **No wallet connected**: Prompts to connect correct wallet type
- 🚫 **Wrong wallet connected**: Clear warning explaining the mismatch with instructions

## 📋 How to Use the Platform Correctly

### Step 1: Choose Your Chain
Look for the **Chain Selector** in the top navigation bar:

```
Chain: [Polygon] [Solana]
```

- **Polygon**: Uses MetaMask wallet, ERC-20 USDC
- **Solana**: Uses Phantom/Solflare wallet, SPL USDC

### Step 2: Connect the Right Wallet

#### For Polygon Markets:
1. Select "Polygon" in the chain selector
2. Click "Connect Wallet"
3. Connect with **MetaMask**
4. Make sure you're on **Polygon Amoy Testnet** (Chain ID: 80002)
5. You need **Polygon USDC** (address: `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`)

#### For Solana Markets:
1. Select "Solana" in the chain selector
2. Click "Connect Wallet"
3. Connect with **Phantom** or **Solflare**
4. Make sure you're on **Solana Devnet**
5. You need **Solana devnet USDC** (mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`)

### Step 3: Get Test USDC

#### Polygon USDC (Amoy Testnet):

**Important**: Approving USDC spending ≠ Having USDC tokens! You need to actually get USDC first.

**Option 1: Get POL, then swap to USDC (Recommended)**
```bash
# Step 1: Get test POL from faucet
Visit: https://faucet.polygon.technology/
Enter your wallet address and request POL tokens

# Step 2: Swap POL → USDC on QuickSwap
Visit: https://quickswap.exchange/
Connect wallet → Select POL → Select USDC → Swap
USDC Address: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
```

**Option 2: Use a testnet USDC faucet**
```bash
# Some testnet faucets that may work:
- https://faucet.circle.com/ (if available for Amoy)
- Contact project admin for test USDC airdrop
```

**Option 3: Mint USDC directly (if you have minter role)**
```bash
# This requires the USDC contract to have a mint function
# Usually only available for admin/deployer
```

#### Solana USDC (Devnet):
```bash
# Step 1: Get SOL from devnet faucet
solana airdrop 2

# Step 2: Create USDC token account (if needed)
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Step 3: Request test USDC
# Use Solana devnet faucet or request from admin
```

### Step 4: Stake on a Market
1. Browse prediction markets
2. Click "View & Trade" on a market
3. Verify the chain matches your connected wallet
4. Choose YES or NO
5. Enter stake amount
6. For Polygon: Approve USDC spending (first time only)
7. Confirm the stake transaction

## 🚨 Common Errors & Solutions

### Error: "Wrong wallet connected"
**Cause**: You have Solflare connected but selected a Polygon market (or vice versa)

**Solution**:
- Check the chain selector at the top
- Disconnect current wallet
- Connect the correct wallet for that chain

### Error: "USDC Balance: 0.00"
**Causes**:
1. You don't have USDC in your wallet
2. You have the wrong type of USDC (ERC-20 vs SPL)
3. Your Solana USDC token account doesn't exist yet

**Solutions**:
- For Polygon: 
  1. Get POL from https://faucet.polygon.technology/
  2. Swap POL to USDC on QuickSwap
  3. Or contact admin for test USDC airdrop
- For Solana: 
  1. Create token account: `spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
  2. Request test USDC from devnet faucet
- Verify you're on the correct network (testnet/devnet)

**Note**: Just because you approved USDC spending doesn't mean you have USDC! Approval only gives the contract permission to spend tokens you own.

### Error: Seeing Ethereum transaction instead of Solana
**Cause**: This was the bug that's now fixed. If you still see this:

**Solution**:
1. Refresh the page
2. Check the chain selector (top of page)
3. Make sure it says "Solana" if you want to use Solana
4. Clear browser cache if issue persists

### Error: "Approve" transaction request (on Solana)
**Cause**: You shouldn't see this on Solana - this indicates the chain is still set to Polygon

**Solution**:
1. Look at the chain selector in the header
2. Click "Solana" to switch chains
3. Refresh the page
4. Try staking again

## 🧪 Testing Your Setup

### Verify Polygon Setup:
```bash
# Check your wallet
1. Open MetaMask
2. Verify network: "Polygon Amoy Testnet"
3. Check USDC balance (contract: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582)

# On the platform
1. Select "Polygon" in chain selector
2. Connect MetaMask
3. Should see your USDC balance in stake modal
```

### Verify Solana Setup:
```bash
# Check your wallet
1. Open Solflare/Phantom
2. Verify network: "Devnet"
3. Check USDC balance (mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU)

# On the platform
1. Select "Solana" in chain selector
2. Connect Solflare/Phantom
3. Should see your USDC balance in stake modal
```

## 🔍 Technical Details

### Chain Detection Flow:
```typescript
ChainProvider (stores activeChain: 'polygon' | 'solana')
  ↓
MarketPredictionCard (reads activeChain)
  ↓
StakeModal (receives market.chain, checks wallet match)
  ↓
If match: Show balance and allow staking
If mismatch: Show warning with instructions
```

### Wallet Connection Logic:
```typescript
// Polygon
isPolygonConnected = useAccount().isConnected (wagmi)
walletAddress = useAccount().address

// Solana
isSolanaConnected = useWallet().connected
walletAddress = useWallet().publicKey?.toBase58()

// Chain match check
isCorrectWallet = (
  (market.chain === 'polygon' && isPolygonConnected) ||
  (market.chain === 'solana' && isSolanaConnected)
)
```

### USDC Balance API:
```
GET /api/balance/usdc?address={wallet}&chain={polygon|solana}

Response:
{
  balance: 100.50,      // Human-readable balance
  raw: "100500000",     // Raw token amount
  decimals: 6,          // Token decimals
  chain: "solana",
  tokenAccount: "..."   // Solana only
}
```

## 📚 Related Files

- [components/blockchain/market-prediction-card.tsx](components/blockchain/market-prediction-card.tsx) - Market cards with dynamic chain
- [components/markets/stake-modal.tsx](components/markets/stake-modal.tsx) - Staking modal with wallet validation
- [components/blockchain/chain-provider.tsx](components/blockchain/chain-provider.tsx) - Chain context provider
- [components/blockchain/chain-selector.tsx](components/blockchain/chain-selector.tsx) - UI for chain selection
- [app/api/balance/usdc/route.ts](app/api/balance/usdc/route.ts) - USDC balance API endpoint

## 🎯 Next Steps

1. **Clear your browser cache** and refresh the page
2. **Select the correct chain** using the chain selector in the header
3. **Connect the matching wallet** (MetaMask for Polygon, Phantom/Solflare for Solana)
4. **Get test tokens if you don't have them**:
   - **Polygon**: Get POL from faucet → Swap to USDC on QuickSwap
   - **Solana**: Create token account → Request test USDC
5. **Verify your USDC balance** shows correctly in the stake modal (should be > 0)
6. **Approve USDC spending** (Polygon only, first time)
7. **Try staking** on a market

## 🔑 Understanding Approval vs Having Tokens

**Common Confusion**: "I approved USDC spending, why can't I stake?"

- ✅ **Approval** = Giving the contract *permission* to spend your USDC
- ❌ **Approval** ≠ Having USDC tokens in your wallet

**Analogy**: It's like giving someone permission to use your credit card. Permission doesn't mean you have money on the card!

**What you need**:
1. USDC tokens in your wallet (balance > 0)
2. Approval for the contract to spend them (Polygon only)

**Check your actual USDC balance**:
- Polygon: Add token `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582` to MetaMask
- Solana: Check SPL tokens in Solflare for mint `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

## ❓ Still Having Issues?

If you're still experiencing problems:

1. **Check browser console** (F12) for error messages
2. **Verify environment variables** in `.env.local`:
   - `NEXT_PUBLIC_SOLANA_USDC_MINT`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`
   - `NEXT_PUBLIC_USDC_ADDRESS` (Polygon)
3. **Restart development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
4. **Check network connection**: Ensure you can connect to Solana devnet/Polygon testnet

---

**Date Fixed**: December 22, 2025
**Files Modified**: 2
**Status**: ✅ Complete
