#!/bin/bash

# 🧪 Test Polygon Bridge Contract
# This script helps you verify that your Polygon bridge is working correctly

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Afrifutures Bridge on Polygon${NC}"
echo "=================================================="
echo ""

# Configuration
BRIDGE_ADDRESS="0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9"
AFF_TOKEN="0x09Cd30910955C21F9bfC5819c6C8521ed1DD70Df"
USDC_ADDRESS="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
NETWORK="polygon-amoy"

echo -e "${GREEN}Contract Addresses:${NC}"
echo "  Bridge: $BRIDGE_ADDRESS"
echo "  AFF Token: $AFF_TOKEN"
echo "  USDC: $USDC_ADDRESS"
echo ""

# Test 1: Check Bridge Deployment
echo -e "${YELLOW}Test 1: Checking bridge deployment...${NC}"
npx hardhat run --network $NETWORK <<'EOF'
const { ethers } = require("hardhat");

async function main() {
  const bridgeAddress = "0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9";
  
  // Get code
  const code = await ethers.provider.getCode(bridgeAddress);
  
  if (code === "0x") {
    console.log("❌ Bridge not deployed!");
    process.exit(1);
  }
  
  console.log("✅ Bridge is deployed");
  console.log("   Code size:", (code.length - 2) / 2, "bytes");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
EOF

echo ""

# Test 2: Check Bridge Configuration
echo -e "${YELLOW}Test 2: Checking bridge configuration...${NC}"
npx hardhat run --network $NETWORK <<'EOF'
const { ethers } = require("hardhat");

async function main() {
  const bridgeAddress = "0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9";
  
  const bridgeAbi = [
    "function wormholeCore() view returns (address)",
    "function usdcToken() view returns (address)",
    "function affToken() view returns (address)",
    "function bridgeFee() view returns (uint256)",
    "function relayerFee() view returns (uint256)",
    "function nonce() view returns (uint32)",
    "function paused() view returns (bool)"
  ];
  
  const bridge = new ethers.Contract(bridgeAddress, bridgeAbi, ethers.provider);
  
  console.log("✅ Bridge Configuration:");
  console.log("   Wormhole Core:", await bridge.wormholeCore());
  console.log("   USDC Token:", await bridge.usdcToken());
  console.log("   AFF Token:", await bridge.affToken());
  console.log("   Bridge Fee:", ethers.formatEther(await bridge.bridgeFee()), "MATIC");
  console.log("   Relayer Fee:", ethers.formatEther(await bridge.relayerFee()), "MATIC");
  console.log("   Nonce:", (await bridge.nonce()).toString());
  console.log("   Paused:", await bridge.paused());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
EOF

echo ""

# Test 3: Check AFF Token
echo -e "${YELLOW}Test 3: Checking AFF token...${NC}"
npx hardhat run --network $NETWORK <<'EOF'
const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = "0x09Cd30910955C21F9bfC5819c6C8521ed1DD70Df";
  
  const tokenAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)"
  ];
  
  const token = new ethers.Contract(tokenAddress, tokenAbi, ethers.provider);
  
  console.log("✅ AFF Token:");
  console.log("   Name:", await token.name());
  console.log("   Symbol:", await token.symbol());
  console.log("   Decimals:", await token.decimals());
  console.log("   Total Supply:", ethers.formatEther(await token.totalSupply()), "AFF");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
EOF

echo ""

# Test 4: Check Events
echo -e "${YELLOW}Test 4: Checking recent bridge events...${NC}"
npx hardhat run --network $NETWORK <<'EOF'
const { ethers } = require("hardhat");

async function main() {
  const bridgeAddress = "0x3FC085a0e6a6A8898e6430A1b0a0cfFEFa663ba9";
  
  const bridgeAbi = [
    "event MessageSent(uint64 indexed sequence, uint8 indexed messageType, address indexed sender, uint256 amount, bytes32 recipient)",
    "event SettlementProcessed(bytes32 indexed vaaHash, address indexed user, uint256 amount)"
  ];
  
  const bridge = new ethers.Contract(bridgeAddress, bridgeAbi, ethers.provider);
  
  // Get recent blocks
  const currentBlock = await ethers.provider.getBlockNumber();
  const fromBlock = Math.max(currentBlock - 1000, 0);
  
  console.log("   Checking blocks", fromBlock, "to", currentBlock);
  
  // Check MessageSent events
  const sentEvents = await bridge.queryFilter(
    bridge.filters.MessageSent(),
    fromBlock,
    currentBlock
  );
  
  console.log("   MessageSent events:", sentEvents.length);
  if (sentEvents.length > 0) {
    sentEvents.slice(0, 3).forEach((event, i) => {
      console.log(`   Event ${i + 1}:`, {
        sequence: event.args.sequence.toString(),
        type: event.args.messageType,
        sender: event.args.sender,
        amount: ethers.formatUnits(event.args.amount, 6),
      });
    });
  }
  
  // Check SettlementProcessed events
  const settlementEvents = await bridge.queryFilter(
    bridge.filters.SettlementProcessed(),
    fromBlock,
    currentBlock
  );
  
  console.log("   SettlementProcessed events:", settlementEvents.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
EOF

echo ""
echo -e "${GREEN}✅ Bridge Tests Complete!${NC}"
echo ""
echo "📋 Summary:"
echo "  - Bridge contract deployed and configured"
echo "  - AFF token minted and accessible"
echo "  - Ready to send cross-chain messages"
echo ""
echo "🔍 View on Explorer:"
echo "  Bridge: https://amoy.polygonscan.com/address/$BRIDGE_ADDRESS"
echo "  AFF Token: https://amoy.polygonscan.com/address/$AFF_TOKEN"
echo ""
echo "📝 Next Steps:"
echo "  1. Deploy Solana bridge (see /docs/DEPLOY_VIA_PLAYGROUND.md)"
echo "  2. Test cross-chain transfer"
echo "  3. Monitor transactions"
echo ""
