#!/bin/bash

# 🌉 Afrifutures Solana Bridge Deployment Script
# This script deploys the Solana bridge program and initializes it

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌉 Afrifutures Solana Bridge Deployment${NC}"
echo "=================================================="
echo ""

# Your Solana wallet address
SOLANA_WALLET="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

# Polygon bridge contract (just deployed)
POLYGON_BRIDGE="0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9"

# Convert Ethereum address to 32-byte array for Solana
# Remove 0x prefix and pad to 32 bytes
POLYGON_EMITTER=$(echo $POLYGON_BRIDGE | sed 's/0x/000000000000000000000000/')

echo -e "${GREEN}✅ Configuration:${NC}"
echo "  Solana Wallet: $SOLANA_WALLET"
echo "  Polygon Bridge: $POLYGON_BRIDGE"
echo "  Polygon Emitter (32-byte): $POLYGON_EMITTER"
echo ""

# Step 1: Check Solana CLI installation
echo -e "${YELLOW}📦 Step 1: Checking Solana CLI...${NC}"
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Installing..."
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
    export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
else
    echo "✅ Solana CLI installed"
    solana --version
fi
echo ""

# Step 2: Check Anchor CLI installation
echo -e "${YELLOW}📦 Step 2: Checking Anchor CLI...${NC}"
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Installing..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install 0.30.1
    avm use 0.30.1
else
    echo "✅ Anchor CLI installed"
    anchor --version
fi
echo ""

# Step 3: Set up Solana config
echo -e "${YELLOW}⚙️  Step 3: Configuring Solana CLI...${NC}"
echo "Setting network to devnet..."
solana config set --url devnet

# Check if wallet keypair exists
if [ ! -f ~/.config/solana/id.json ]; then
    echo "❌ No Solana wallet found. Generating new keypair..."
    solana-keygen new --no-passphrase -o ~/.config/solana/id.json
    echo ""
    echo "⚠️  IMPORTANT: Save your seed phrase securely!"
    echo "⚠️  You'll need SOL for deployment. Request airdrop with:"
    echo "   solana airdrop 2"
    echo ""
else
    echo "✅ Wallet keypair found"
fi

DEPLOYED_WALLET=$(solana address)
echo "Wallet address: $DEPLOYED_WALLET"
echo ""

# Step 4: Check SOL balance
echo -e "${YELLOW}💰 Step 4: Checking SOL balance...${NC}"
BALANCE=$(solana balance | awk '{print $1}')
echo "Current balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 1" | bc -l) )); then
    echo "⚠️  Low balance! Requesting airdrop..."
    solana airdrop 2 || echo "❌ Airdrop failed. You may need to wait or try again."
    sleep 5
    BALANCE=$(solana balance | awk '{print $1}')
    echo "New balance: $BALANCE SOL"
fi
echo ""

# Step 5: Build the program
echo -e "${YELLOW}🔨 Step 5: Building Solana bridge program...${NC}"
cd /workspaces/african-commodity-markets/afrifutures

echo "Installing dependencies..."
cargo build-bpf --manifest-path=programs/wormhole-bridge/Cargo.toml

echo "Building with Anchor..."
anchor build -- --manifest-path=programs/wormhole-bridge/Cargo.toml

echo "✅ Build complete!"
echo ""

# Step 6: Get program ID
echo -e "${YELLOW}📋 Step 6: Getting program ID...${NC}"
PROGRAM_ID=$(solana address -k target/deploy/afrifutures_bridge-keypair.json)
echo "Program ID: $PROGRAM_ID"
echo ""

# Update the program ID in the code
echo "Updating program ID in source code..."
sed -i "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/wormhole-bridge/src/lib.rs

# Rebuild with correct program ID
echo "Rebuilding with correct program ID..."
anchor build -- --manifest-path=programs/wormhole-bridge/Cargo.toml
echo ""

# Step 7: Deploy the program
echo -e "${YELLOW}🚀 Step 7: Deploying to Solana devnet...${NC}"
echo "This may take a few minutes..."

anchor deploy --provider.cluster devnet --program-name afrifutures_bridge

echo "✅ Program deployed!"
echo ""

# Step 8: Create initialization script
echo -e "${YELLOW}📝 Step 8: Creating initialization script...${NC}"

cat > /tmp/init-bridge.ts << 'EOF'
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";

const POLYGON_BRIDGE = process.env.POLYGON_BRIDGE || "";

async function initializeBridge() {
  // Load wallet
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json", "utf-8")))
  );

  // Setup provider
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // Load program
  const programId = new PublicKey(process.env.PROGRAM_ID || "");
  const idl = JSON.parse(fs.readFileSync("target/idl/afrifutures_bridge.json", "utf-8"));
  const program = new Program(idl, programId, provider);

  console.log("🌉 Initializing Solana Bridge...");
  console.log("Program ID:", programId.toBase58());
  console.log("Authority:", wallet.publicKey.toBase58());
  console.log("Polygon Bridge:", POLYGON_BRIDGE);

  // Convert Polygon address to 32-byte buffer
  const polygonEmitter = Buffer.from(
    POLYGON_BRIDGE.replace("0x", "").padStart(64, "0"),
    "hex"
  );

  // Derive bridge PDA
  const [bridgeState] = PublicKey.findProgramAddressSync(
    [Buffer.from("bridge")],
    programId
  );

  try {
    // Initialize bridge
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
    console.log("Bridge State PDA:", bridgeState.toBase58());
    
    // Save configuration
    const config = {
      programId: programId.toBase58(),
      bridgeState: bridgeState.toBase58(),
      authority: wallet.publicKey.toBase58(),
      polygonBridge: POLYGON_BRIDGE,
      network: "devnet",
      deployedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      "bridge-solana-config.json",
      JSON.stringify(config, null, 2)
    );
    
    console.log("\n📝 Configuration saved to bridge-solana-config.json");
    
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    throw error;
  }
}

initializeBridge()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF

echo "✅ Initialization script created"
echo ""

# Step 9: Initialize the bridge
echo -e "${YELLOW}🎬 Step 9: Initializing bridge...${NC}"

cd /workspaces/african-commodity-markets/afrifutures
PROGRAM_ID=$PROGRAM_ID POLYGON_BRIDGE=$POLYGON_BRIDGE npx ts-node /tmp/init-bridge.ts

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo "📋 Summary:"
echo "  Program ID: $PROGRAM_ID"
echo "  Network: devnet"
echo "  Authority: $DEPLOYED_WALLET"
echo "  Polygon Bridge: $POLYGON_BRIDGE"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Update your .env.local file with:"
echo "   NEXT_PUBLIC_SOLANA_BRIDGE_PROGRAM=$PROGRAM_ID"
echo ""
echo "2. Test the bridge with the UI component"
echo ""
echo "3. Monitor transactions at:"
echo "   https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "4. Check bridge configuration in:"
echo "   afrifutures/bridge-solana-config.json"
echo ""
