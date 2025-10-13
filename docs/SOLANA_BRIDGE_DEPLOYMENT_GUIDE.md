# 🚀 Solana Bridge Deployment Guide

## Your Information
- **Solana Wallet**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- **Polygon Bridge**: `0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9`
- **AFF Token**: `0x09Cd30910955C21F9bfC5819c6C8521ed1DD70Df`

## Prerequisites Checklist

```bash
# 1. Check Solana CLI
solana --version  # Should be 1.18+

# 2. Check Anchor CLI
anchor --version  # Should be 0.30.1

# 3. Check Rust
rustc --version   # Should be 1.75+
```

If any are missing, run:
```bash
# Install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1
```

## Step 1: Configure Solana Wallet

Since you're using Phantom wallet, we need to export your keypair for CLI usage:

### Option A: Use Phantom's Private Key (NOT RECOMMENDED for production)

⚠️ **For development only! Never share your private key!**

1. Open Phantom wallet
2. Click settings (gear icon)
3. Click "Show Secret Recovery Phrase"
4. **DO NOT RUN THIS YET - I'll guide you through importing safely**

### Option B: Create a New Deployment Wallet (RECOMMENDED)

```bash
# Generate a new keypair for deployment
solana-keygen new -o ~/.config/solana/deploy-keypair.json

# Get the new address
solana address -k ~/.config/solana/deploy-keypair.json

# Request devnet SOL airdrop
solana config set --url devnet
solana airdrop 2 -k ~/.config/solana/deploy-keypair.json

# Check balance
solana balance -k ~/.config/solana/deploy-keypair.json
```

## Step 2: Build the Bridge Program

```bash
cd /workspaces/african-commodity-markets/afrifutures

# Install Cargo dependencies
cargo build-bpf --manifest-path=programs/wormhole-bridge/Cargo.toml

# Build with Anchor
anchor build

# This creates:
# - target/deploy/afrifutures_bridge.so (the program)
# - target/deploy/afrifutures_bridge-keypair.json (program address)
# - target/idl/afrifutures_bridge.json (interface definition)
```

## Step 3: Get Program ID

```bash
# Get the program ID
solana address -k target/deploy/afrifutures_bridge-keypair.json

# Example output: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

## Step 4: Update Program ID in Code

```bash
# Replace the declare_id! in the source
PROGRAM_ID=$(solana address -k target/deploy/afrifutures_bridge-keypair.json)

# Update the lib.rs file
sed -i "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" \
  programs/wormhole-bridge/src/lib.rs

# Rebuild with correct ID
anchor build
```

## Step 5: Deploy to Devnet

```bash
# Make sure you're on devnet
solana config set --url devnet

# Check your balance (need at least 5 SOL)
solana balance

# Deploy the program
anchor deploy --provider.cluster devnet

# Output will show:
# Program Id: <your-program-id>
```

## Step 6: Initialize the Bridge

Create a TypeScript initialization script:

```bash
cd /workspaces/african-commodity-markets/afrifutures

# Create init script
cat > scripts/init-solana-bridge.ts << 'EOF'
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";

async function main() {
  // Configuration
  const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || "");
  const POLYGON_BRIDGE = "0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9";
  
  // Load wallet
  const walletPath = process.env.HOME + "/.config/solana/deploy-keypair.json";
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  // Setup connection
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // Load program IDL
  const idl = JSON.parse(
    fs.readFileSync("target/idl/afrifutures_bridge.json", "utf-8")
  );
  const program = new Program(idl, PROGRAM_ID, provider);

  console.log("🌉 Initializing Solana Bridge");
  console.log("Program ID:", PROGRAM_ID.toBase58());
  console.log("Authority:", wallet.publicKey.toBase58());

  // Convert Ethereum address to 32-byte array
  const polygonEmitter = Buffer.from(
    POLYGON_BRIDGE.replace("0x", "").padStart(64, "0"),
    "hex"
  );

  // Derive bridge state PDA
  const [bridgeState] = PublicKey.findProgramAddressSync(
    [Buffer.from("bridge")],
    PROGRAM_ID
  );

  console.log("Bridge State PDA:", bridgeState.toBase58());

  try {
    // Initialize
    const tx = await program.methods
      .initialize(Array.from(polygonEmitter))
      .accounts({
        bridgeState,
        authority: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Bridge initialized!");
    console.log("Transaction:", tx);
    console.log("View at: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

    // Save config
    const config = {
      programId: PROGRAM_ID.toBase58(),
      bridgeState: bridgeState.toBase58(),
      authority: wallet.publicKey.toBase58(),
      polygonBridge: POLYGON_BRIDGE,
      network: "devnet",
      deployedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      "../deployments/solana-bridge-deployment.json",
      JSON.stringify(config, null, 2)
    );

    console.log("\n📝 Config saved to deployments/solana-bridge-deployment.json");
    console.log("\n✅ Add to .env.local:");
    console.log(`NEXT_PUBLIC_SOLANA_BRIDGE_PROGRAM=${PROGRAM_ID.toBase58()}`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF

# Run the initialization
PROGRAM_ID=$(solana address -k target/deploy/afrifutures_bridge-keypair.json) \
  npx ts-node scripts/init-solana-bridge.ts
```

## Step 7: Verify Deployment

```bash
# Check program is deployed
solana program show <PROGRAM_ID> --url devnet

# View on Solana Explorer
echo "https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet"
```

## Step 8: Update Environment Variables

Add to `/workspaces/african-commodity-markets/.env.local`:

```bash
# Solana Bridge (add this)
NEXT_PUBLIC_SOLANA_BRIDGE_PROGRAM=<your-program-id>

# Already set from Polygon deployment:
NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT=0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9
NEXT_PUBLIC_AFF_TOKEN_POLYGON=0x09Cd30910955C21F9bfC5819c6C8521ed1DD70Df
```

## Quick Start (One Command)

If all prerequisites are installed, you can use the automated script:

```bash
chmod +x scripts/deploy-solana-bridge.sh
./scripts/deploy-solana-bridge.sh
```

## Common Issues

### Issue 1: "Insufficient funds"
```bash
# Request more SOL
solana airdrop 2 --url devnet
```

### Issue 2: "Anchor version mismatch"
```bash
# Reinstall correct version
avm install 0.30.1
avm use 0.30.1
```

### Issue 3: "Program already deployed"
```bash
# Upgrade existing program
anchor upgrade target/deploy/afrifutures_bridge.so \
  --program-id $(solana address -k target/deploy/afrifutures_bridge-keypair.json) \
  --provider.cluster devnet
```

### Issue 4: "wormhole-anchor-sdk not found"
```bash
# Add to Cargo.toml
cd programs/wormhole-bridge
cargo add wormhole-anchor-sdk@0.2.0
cargo build
```

## Testing the Bridge

Once deployed, test with the UI:

```bash
# Start the dev server
cd /workspaces/african-commodity-markets
npm run dev

# Navigate to http://localhost:3000/test-bridge
# Or use the bridge modal in the staking interface
```

## Next Steps

1. ✅ Polygon Bridge Deployed
2. ⏳ Deploy Solana Bridge (you are here)
3. ⏳ Test cross-chain transfer
4. ⏳ Set up relayer (optional but recommended)
5. ⏳ Monitor transactions

## Support

If you encounter issues:

1. Check logs: `solana logs -u devnet`
2. View program: `solana program show <PROGRAM_ID> -u devnet`
3. Check transaction: `solana confirm -v <SIGNATURE> -u devnet`

## Security Notes

- ⚠️ This is TESTNET deployment - use separate keys for mainnet
- ⚠️ Never share your private keys
- ⚠️ Always verify contract addresses
- ⚠️ Test thoroughly before mainnet deployment
