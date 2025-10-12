#!/bin/bash

# Quick Check Script - Monitor Anchor Installation and Deployment Status

echo "🔍 Solana Deployment Status Check"
echo "================================="
echo ""

# Check Solana CLI
echo "1️⃣  Solana CLI"
if command -v solana &> /dev/null; then
    solana --version
    echo "✅ Solana CLI installed"
else
    echo "❌ Solana CLI not found"
fi
echo ""

# Check Anchor CLI
echo "2️⃣  Anchor CLI"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"
if command -v anchor &> /dev/null; then
    anchor --version
    echo "✅ Anchor CLI installed"
else
    echo "⏳ Anchor CLI not yet installed (still compiling)"
    echo "   Check compilation progress in the terminal..."
fi
echo ""

# Check wallet
echo "3️⃣  Wallet Status"
if [ -f ~/.config/solana/id.json ]; then
    PUBKEY=$(solana address 2>/dev/null || echo "Error reading pubkey")
    BALANCE=$(solana balance 2>/dev/null || echo "Error")
    echo "   Public Key: $PUBKEY"
    echo "   Balance: $BALANCE"
    echo "✅ Wallet configured"
else
    echo "❌ Wallet not found"
fi
echo ""

# Check programs
echo "4️⃣  Solana Programs"
if [ -d "/workspaces/african-commodity-markets/programs/oracle" ]; then
    echo "✅ Oracle program source ready"
else
    echo "❌ Oracle program not found"
fi

if [ -d "/workspaces/african-commodity-markets/programs/prediction-market" ]; then
    echo "✅ Prediction market program source ready"
else
    echo "❌ Prediction market program not found"
fi
echo ""

# Check if programs are built
echo "5️⃣  Build Status"
if [ -f "/workspaces/african-commodity-markets/target/deploy/oracle.so" ]; then
    echo "✅ Oracle program built"
else
    echo "⏸️  Oracle program not yet built"
fi

if [ -f "/workspaces/african-commodity-markets/target/deploy/prediction_market.so" ]; then
    echo "✅ Prediction market program built"
else
    echo "⏸️  Prediction market program not yet built"
fi
echo ""

# Check environment
echo "6️⃣  Environment Configuration"
if [ -f "/workspaces/african-commodity-markets/.env.local" ]; then
    if grep -q "NEXT_PUBLIC_SOLANA_ORACLE_PROGRAM_ID" /workspaces/african-commodity-markets/.env.local 2>/dev/null; then
        echo "✅ .env.local has Solana configuration"
    else
        echo "⚠️  .env.local exists but needs Solana program IDs"
    fi
else
    echo "⏸️  .env.local not configured yet"
fi
echo ""

# Summary
echo "📊 Summary"
echo "=========="
if command -v anchor &> /dev/null; then
    echo "✅ Ready to build and deploy!"
    echo ""
    echo "Next steps:"
    echo "  1. Run: cd /workspaces/african-commodity-markets"
    echo "  2. Run: anchor build"
    echo "  3. Run: ./scripts/deploy-solana.sh"
else
    echo "⏳ Waiting for Anchor CLI to finish compiling..."
    echo ""
    echo "What's happening:"
    echo "  • Anchor CLI is being compiled from source"
    echo "  • This typically takes 10-15 minutes"
    echo "  • Check the terminal for compilation progress"
    echo ""
    echo "Once finished, run this script again to see next steps"
fi

echo ""
echo "📚 Helpful Commands"
echo "==================="
echo "  • Check this status: ./scripts/check-status.sh"
echo "  • Watch Solana balance: watch -n 5 'solana balance'"
echo "  • View deployment guide: cat docs/SOLANA_DEPLOYMENT.md"
echo "  • View current status: cat DEPLOYMENT_STATUS.md"
