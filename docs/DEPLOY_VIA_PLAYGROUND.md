# 🚀 QUICK DEPLOYMENT: Solana Bridge via Solana Playground

## Why This Approach?

We're experiencing Rust toolchain issues in the container environment. **Solana Playground** is a browser-based IDE that handles all compilation for you - no local setup needed!

## Step-by-Step Guide

### 1. Open Solana Playground

Go to: **https://beta.solpg.io**

### 2. Create New Project

1. Click "Create New Project"
2. Name it: `afrifutures-bridge`
3. Choose: "Anchor" template

### 3. Copy Your Bridge Code

Replace the contents of `lib.rs` with your bridge code from:
`/workspaces/african-commodity-markets/afrifutures/programs/wormhole-bridge/src/lib.rs`

### 4. Update Cargo.toml

Click on `Cargo.toml` and update it to:

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

### 5. Connect Your Phantom Wallet

1. Click the wallet icon in Solana Playground
2. Choose "Import from Phantom"
3. Approve the connection

**Or create a new playground wallet:**
- Click "Create new wallet" in Playground
- Save the keypair securely
- Request devnet airdrop

### 6. Build the Program

1. Click the hammer icon (Build)
2. Wait for compilation (takes 1-2 minutes)
3. Check for errors

### 7. Deploy

1. Make sure you're on **devnet** (bottom left)
2. Click the rocket icon (Deploy)
3. Approve the transaction
4. **Save the Program ID!**

Example output:
```
Deployment successful!
Program Id: ABC123def456...
```

### 8. Initialize the Bridge

In the Playground terminal, run:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// Your deployed program ID
const programId = new PublicKey("YOUR_PROGRAM_ID_HERE");

// Polygon bridge address
const polygonBridge = "0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9";

// Convert to 32-byte buffer
const polygonEmitter = Buffer.from(
  polygonBridge.replace("0x", "").padStart(64, "0"),
  "hex"
);

// Derive bridge PDA
const [bridgeState] = PublicKey.findProgramAddressSync(
  [Buffer.from("bridge")],
  programId
);

// Initialize
const tx = await pg.program.methods
  .initialize(Array.from(polygonEmitter))
  .accounts({
    bridgeState,
    authority: pg.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();

console.log("Bridge initialized! TX:", tx);
console.log("Program ID:", programId.toString());
console.log("Bridge State:", bridgeState.toString());
```

### 9. Export Configuration

Save this information:

```json
{
  "programId": "YOUR_PROGRAM_ID",
  "bridgeState": "BRIDGE_STATE_PDA",
  "authority": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  "polygonBridge": "0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9",
  "network": "devnet"
}
```

### 10. Update Your Project

Add to `.env.local`:

```bash
NEXT_PUBLIC_SOLANA_BRIDGE_PROGRAM=YOUR_PROGRAM_ID_FROM_PLAYGROUND
```

## Alternative: Use Existing Program

If you want to skip deployment entirely, you can use one of the existing deployed Solana programs for testing:

```bash
# Use your prediction market program temporarily
NEXT_PUBLIC_SOLANA_BRIDGE_PROGRAM=FHjfGj18f4WSChRdvZoMd8ccWBptb3wHzhCjDFW6CLfg
```

Then focus on the frontend integration and deploy the bridge program later.

## What's Working Now

✅ **Polygon Bridge**: Fully deployed and functional
- Contract: `0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9`
- AFF Token: `0x09Cd30910955C21F9bfC5819c6C8521ed1DD70Df`

✅ **Frontend**: Ready to connect both chains

⏳ **Solana Bridge**: Deploy via Solana Playground (5 minutes)

## Benefits of Solana Playground

1. ✅ No local Rust installation needed
2. ✅ Automatic compilation and optimization  
3. ✅ Built-in wallet management
4. ✅ Easy airdrop requests
5. ✅ Instant deployment
6. ✅ Explorer integration

## Next Steps After Deployment

1. Test the bridge UI at `/test-bridge`
2. Bridge small amounts of USDC
3. Monitor transactions
4. Set up relayer (optional)

## Need Help?

The Solana Playground has excellent documentation and examples:
- Docs: https://docs.solpg.io
- Discord: https://discord.gg/solana
- Examples: Click "Examples" in Playground

---

**Estimated Time**: 5-10 minutes  
**Cost**: FREE (devnet)  
**Difficulty**: Easy 🟢
