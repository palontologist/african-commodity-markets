# 🚀 YOUR PERSONALIZED BRIDGE DEPLOYMENT GUIDE

Hi! Here's everything you need to complete your bridge deployment.

## ✅ What You've Already Done

Great job! You successfully deployed:

1. **Polygon Bridge Contract**: `0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9`
2. **AFF Token**: `0x09Cd30910955C21F9bfC5819c6C8521ed1DD70Df`
3. **Network**: Polygon Amoy Testnet
4. **Your Deployer Wallet**: `0x95432C47b65A381B2bC43779Fd97e5017f39aB82`
5. **Your Phantom Wallet**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

## 📋 What's Left To Do

You need to deploy the Solana side of the bridge. **I recommend using Solana Playground** because we hit some Rust toolchain issues in the container.

---

## 🎯 RECOMMENDED APPROACH: Solana Playground (5-10 minutes)

### Step 1: Open Solana Playground

Go to: **https://beta.solpg.io**

### Step 2: Create New Project

1. Click **"+ Create a new project"**
2. Name it: **afrifutures-bridge**
3. Select template: **"Anchor"** (default)

### Step 3: Set Up Wallet

Click the **wallet icon** (bottom left) and choose one of:

**Option A: Use Your Phantom Wallet** (Recommended)
- Click "Import from Phantom"
- Connect your Phantom wallet
- This uses your address: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

**Option B: Create New Playground Wallet**
- Click "Create new wallet"
- **SAVE THE KEYPAIR!** (Download it)
- This creates a new wallet just for development

### Step 4: Get Devnet SOL

1. Make sure you're on **devnet** (bottom left corner)
2. Click the **airdrop icon** (💧)
3. Request 2-5 SOL
4. Wait for confirmation (~10 seconds)

### Step 5: Copy Your Bridge Code

1. In the left sidebar, click on **`src/lib.rs`**
2. Delete all the existing code
3. Copy the entire contents from your local file:
   `/workspaces/african-commodity-markets/afrifutures/programs/wormhole-bridge/src/lib.rs`
4. Paste it into the Playground editor

### Step 6: Update Cargo.toml

1. Click on **`Cargo.toml`** in the sidebar
2. Replace its contents with:

```toml
[package]
name = "afrifutures-bridge"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "afrifutures_bridge"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"
wormhole-anchor-sdk = "0.30.1-alpha.3"
```

### Step 7: Build the Program

1. Click the **hammer icon** 🔨 (top toolbar) or press `Ctrl+B`
2. Wait for compilation (1-2 minutes)
3. Check the terminal for success message
4. Fix any errors if they appear (usually none)

### Step 8: Deploy

1. Click the **rocket icon** 🚀 (top toolbar) or press `Ctrl+D`
2. Approve the transaction in your wallet
3. Wait for deployment (~30 seconds)
4. **COPY THE PROGRAM ID!** It will look like:
   ```
   Deploy success. Program Id: ABC123...xyz789
   ```

### Step 9: Initialize the Bridge

1. Click the **test icon** (beaker 🧪) to open the terminal
2. Copy and paste this code, **replacing YOUR_PROGRAM_ID_HERE**:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// ⚠️ REPLACE THIS with your deployed Program ID
const programId = new PublicKey("YOUR_PROGRAM_ID_HERE");

// Your Polygon bridge address (already deployed)
const polygonBridge = "0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9";

async function initializeBridge() {
  console.log("🌉 Initializing Solana Bridge...");
  console.log("Program ID:", programId.toString());
  console.log("Authority:", pg.wallet.publicKey.toString());
  
  // Convert Ethereum address to 32-byte array
  const polygonEmitter = Buffer.from(
    polygonBridge.replace("0x", "").padStart(64, "0"),
    "hex"
  );
  
  // Derive bridge state PDA
  const [bridgeState] = PublicKey.findProgramAddressSync(
    [Buffer.from("bridge")],
    programId
  );
  
  console.log("Bridge State PDA:", bridgeState.toString());
  
  try {
    // Initialize the bridge
    const tx = await pg.program.methods
      .initialize(Array.from(polygonEmitter))
      .accounts({
        bridgeState,
        authority: pg.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log("✅ Bridge initialized successfully!");
    console.log("Transaction:", tx);
    console.log("");
    console.log("📋 Save this configuration:");
    console.log({
      programId: programId.toString(),
      bridgeState: bridgeState.toString(),
      authority: pg.wallet.publicKey.toString(),
      polygonBridge,
      network: "devnet",
    });
    
    console.log("");
    console.log("🎉 Success! Add this to your .env.local:");
    console.log(`NEXT_PUBLIC_SOLANA_BRIDGE_PROGRAM=${programId.toString()}`);
    
  } catch (error) {
    console.error("❌ Initialization failed:", error);
  }
}

initializeBridge();
```

3. Press **Run** (or `Ctrl+Enter`)
4. **SAVE THE OUTPUT!** You'll need the Program ID

### Step 10: Verify Deployment

Check your program on Solana Explorer:
```
https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet
```

---

## 📝 Update Your Project

### Add to .env.local

Add this line (replace with your actual Program ID):
```bash
NEXT_PUBLIC_SOLANA_BRIDGE_PROGRAM=YOUR_PROGRAM_ID_FROM_PLAYGROUND
```

Your complete bridge configuration should now look like:
```bash
# Polygon Bridge
NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT=0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9
NEXT_PUBLIC_AFF_TOKEN_POLYGON=0x09Cd30910955C21F9bfC5819c6C8521ed1DD70Df

# Solana Bridge
NEXT_PUBLIC_SOLANA_BRIDGE_PROGRAM=YOUR_PROGRAM_ID_HERE
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

---

## 🧪 Test the Bridge

### Test Polygon Side (Local Machine)

```bash
cd /workspaces/african-commodity-markets
./scripts/test-polygon-bridge.sh
```

This verifies your Polygon bridge is working correctly.

### Test Full Bridge (UI)

1. Start the dev server:
```bash
npm run dev
```

2. Open in browser:
```
http://localhost:3000/test-bridge
```

3. Try a small bridge transaction:
   - Connect both wallets (Phantom + MetaMask)
   - Bridge 0.1 USDC from Polygon to Solana
   - Wait 3-5 minutes for Wormhole processing
   - Check receipt on Solana

---

## 📊 Monitor Transactions

### Polygon Side

**Explorer:**
```
https://amoy.polygonscan.com/address/0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9
```

**Check Events:**
- `MessageSent` - when you bridge from Polygon
- `SettlementProcessed` - when receiving from Solana

### Solana Side

**Explorer:**
```
https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet
```

**Check Events:**
- `MessageReceived` - when receiving from Polygon
- `MessageSent` - when bridging to Polygon

### Wormhole

**Check VAA Status:**
```bash
# Get your sequence number from Polygon transaction
# Then check Wormhole:
curl "https://wormhole-v2-testnet-api.certus.one/v1/signed_vaa/5/EMITTER_ADDRESS/SEQUENCE"
```

---

## 🆘 Troubleshooting

### "Insufficient funds for deployment"
```bash
# In Solana Playground, click the airdrop icon again
# Or use CLI:
solana airdrop 2 --url devnet
```

### "Program already deployed"
You can upgrade it:
```typescript
// In Playground terminal:
await pg.program.programId // Shows your program ID
// Then just use the same ID in your config
```

### "VAA not found"
- Wait 3-5 minutes after bridging
- Wormhole guardians need time to sign
- Check transaction succeeded on source chain first

### "Connection refused"
- Make sure you're on **devnet**
- Check your RPC endpoint
- Try switching RPC in wallet settings

---

## 📚 Reference Links

### Your Deployed Contracts

- **Polygon Bridge**: https://amoy.polygonscan.com/address/0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9
- **AFF Token**: https://amoy.polygonscan.com/address/0x09Cd30910955C21F9bfC5819c6C8521ed1DD70Df
- **Solana Bridge**: (add after deployment)

### Tools

- **Solana Playground**: https://beta.solpg.io
- **Solana Explorer**: https://explorer.solana.com
- **Polygon Explorer**: https://amoy.polygonscan.com
- **Wormhole Docs**: https://docs.wormhole.com

### Support

- **Wormhole Discord**: https://discord.gg/wormholecrypto
- **Solana Discord**: https://discord.gg/solana
- **Anchor Docs**: https://www.anchor-lang.com

---

## ✅ Checklist

Use this to track your progress:

- [x] Deploy Polygon bridge contract
- [x] Deploy AFF token
- [x] Set up roles and fees
- [ ] Deploy Solana bridge program (← **YOU ARE HERE**)
- [ ] Initialize Solana bridge
- [ ] Update .env.local
- [ ] Test bridge UI
- [ ] Perform test transaction
- [ ] Monitor cross-chain transfer
- [ ] Document final configuration

---

## 🎉 After Deployment

Once everything is deployed and tested:

1. **Document everything** in `/deployments/bridge-deployment.json`
2. **Update README** with bridge instructions
3. **Create tutorial video** (optional)
4. **Share with team/users**
5. **Monitor for issues**

---

## 💡 Quick Wins

If you just want to see things working quickly:

1. ✅ Polygon side is already done - you can send transactions now
2. ⏰ Solana deployment takes 5-10 minutes via Playground
3. 🧪 First test transaction can happen same day
4. 📊 Full integration and monitoring in 1-2 days

**You're almost there! The hard part (Polygon) is done. Solana is just a few clicks away!**

---

**Questions?** Check the docs in `/docs/` or the Wormhole/Solana community!

**Need help?** The error messages in Solana Playground are very helpful, and the community is super responsive.

**Good luck! 🚀**
