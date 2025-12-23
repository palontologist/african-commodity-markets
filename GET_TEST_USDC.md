# How to Get Test USDC - Quick Guide

## 🚨 You Successfully Approved, But Need Tokens!

Your approval transaction worked! But **approval ≠ having USDC**. You gave the contract permission to spend USDC, but you need to GET USDC first.

Think of it like this:
- ✅ You approved spending = Gave the contract permission 
- ❌ You don't have USDC = Nothing to spend yet!

## 📍 For Polygon Amoy Testnet

### Method 1: POL Faucet → Swap to USDC (EASIEST)

**Step 1: Get POL tokens**
```
1. Go to: https://faucet.polygon.technology/
2. Select "Polygon Amoy Testnet"
3. Paste your wallet address: 0x3F4A0...bBA75
4. Click "Submit" and wait for POL tokens
5. Check MetaMask - you should see POL balance
```

**Step 2: Swap POL to USDC**
```
1. Go to: https://quickswap.exchange/#/swap
2. Connect your MetaMask wallet
3. Make sure you're on "Polygon Amoy" network
4. In the swap interface:
   - From: POL (native token)
   - To: USDC (paste address: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582)
5. Enter amount (swap at least 0.1 POL to get some USDC)
6. Click "Swap" and confirm transaction
7. Wait for confirmation
8. Add USDC token to MetaMask to see your balance
```

**Step 3: Add USDC to MetaMask (to see balance)**
```
1. Open MetaMask
2. Click "Import tokens" at the bottom
3. Enter USDC contract address:
   0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
4. Token Symbol: USDC
5. Decimals: 6
6. Click "Add Custom Token"
7. Now you should see your USDC balance!
```

### Method 2: Circle USDC Faucet (if available)

```
1. Visit: https://faucet.circle.com/
2. Select "Polygon Amoy"
3. Enter your wallet address
4. Request test USDC
5. Wait for transaction confirmation
```

### Method 3: Ask Project Admin

```
Contact the project admin/developer and provide:
- Your wallet address: 0x3F4A0...bBA75
- Network: Polygon Amoy Testnet
- Token needed: USDC (0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582)
```

## 📍 For Solana Devnet

### Step 1: Make sure you have SOL
```bash
solana airdrop 2
```

### Step 2: Create USDC token account
```bash
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

### Step 3: Get test USDC
```bash
# Option 1: Use spl-token faucet (if available)
spl-token airdrop 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU 100

# Option 2: Request from devnet faucet websites
# Search for "Solana devnet USDC faucet"

# Option 3: Ask project admin
```

## ✅ Verify You Have USDC

### Polygon (MetaMask):
1. Open MetaMask
2. Make sure you're on "Polygon Amoy" network
3. Look for USDC token in your assets
4. Should show balance > 0

### Solana (Solflare):
1. Open Solflare wallet
2. Make sure you're on "Devnet"
3. Check "Tokens" section
4. Look for USDC (mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU)
5. Should show balance > 0

## 🎉 Now You Can Stake!

Once you have USDC in your wallet:
1. Refresh the Afrifutures platform
2. Click on a prediction market
3. Click "View & Trade"
4. Your USDC balance should now show > 0
5. Enter amount to stake
6. Click "Stake X USDC on YES/NO"
7. Confirm transaction in your wallet
8. Done! 🎊

## 🆘 Still Having Issues?

**Q: I got POL but QuickSwap doesn't work**
- Make sure you're on Polygon Amoy testnet
- Try a different DEX or ask admin for USDC directly

**Q: The faucet says I already claimed**
- Most faucets limit claims to once per 24 hours
- Try again tomorrow or ask in Discord/Telegram

**Q: I added USDC to MetaMask but balance is 0**
- Double-check the contract address: `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`
- Make sure you're on the correct network (Polygon Amoy)
- You need to actually swap/get USDC, not just add the token

**Q: Can I use mainnet USDC?**
- No! This is a testnet platform
- Polygon Amoy uses test USDC (no real value)
- Solana Devnet uses test USDC (no real value)

---

**Quick Links**:
- 🚰 [Polygon Faucet](https://faucet.polygon.technology/)
- 🔄 [QuickSwap DEX](https://quickswap.exchange/)
- 🔵 [Circle Faucet](https://faucet.circle.com/)
- 📚 [Full Guide](./STAKING_FIX_GUIDE.md)
