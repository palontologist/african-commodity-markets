#!/bin/bash
set -e

# Solana Program Deployment Script
# Run this after Anchor CLI is installed

echo "🚀 Solana Program Deployment Script"
echo "===================================="
echo ""

# Set up PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first."
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Installing..."
    echo "⏳ This will take 15-20 minutes..."
    cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked --force
fi

echo "✅ Prerequisites installed"
echo ""

# Check Solana config
echo "🔧 Checking Solana configuration..."
solana config get

echo ""
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance | grep -oP '^\d+(\.\d+)?')
echo "Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 1.5" | bc -l) )); then
    echo "⚠️  Low balance. Requesting airdrop..."
    solana airdrop 2
fi

echo ""
echo "🏗️  Building programs..."
cd /workspaces/african-commodity-markets

# Build all programs
anchor build

echo ""
echo "📦 Deploying Oracle Program..."
ORACLE_ID=$(anchor deploy --program-name oracle --provider.cluster devnet | grep "Program Id:" | awk '{print $3}')
echo "✅ Oracle Program ID: $ORACLE_ID"

echo ""
echo "📦 Deploying Prediction Market Program..."
PREDICTION_ID=$(anchor deploy --program-name prediction_market --provider.cluster devnet | grep "Program Id:" | awk '{print $3}')
echo "✅ Prediction Market Program ID: $PREDICTION_ID"

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "📝 Add these to your .env.local:"
echo ""
echo "NEXT_PUBLIC_SOLANA_ORACLE_PROGRAM_ID=$ORACLE_ID"
echo "NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID=$PREDICTION_ID"
echo ""
echo "🔐 Get your oracle keypair:"
echo "cat ~/.config/solana/id.json"
echo ""
echo "Copy the output and add to .env.local as:"
echo "ORACLE_KEYPAIR=[your,keypair,array,here]"
echo ""
echo "✨ Next steps:"
echo "1. Update .env.local with the program IDs above"
echo "2. Add your ORACLE_KEYPAIR"
echo "3. Set NEXT_PUBLIC_SOLANA_USDC_MINT (create test token or use existing)"
echo "4. Run: pnpm dev"
echo "5. Test the multi-chain flow!"
