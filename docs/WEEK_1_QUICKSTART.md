# 🚀 Week 1 Quick Start: Foundation Setup

**Goal**: Set up monorepo structure + deploy hello-world contracts to devnets  
**Timeline**: 7 days (January 13-19, 2026)  
**Prerequisites**: Rust, Node.js 18+, Solana CLI, Anchor CLI, Hardhat

---

## Day 1: Environment Setup

### Install Required Tools

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.2/install)"

# Anchor CLI (Solana framework)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify installations
solana --version    # Should be 1.18.2+
anchor --version    # Should be 0.30.0+

# Configure Solana for devnet
solana config set --url devnet
solana-keygen new   # Create wallet (save seed phrase!)

# Get devnet SOL
solana airdrop 2
```

### Polygon/Hardhat Setup

```bash
# Already have Node.js from existing platform
npm install -g hardhat

# Verify
hardhat --version   # Should be 2.22.0+
```

---

## Day 2: Monorepo Structure

### Create New Monorepo (Separate from Existing)

```bash
# Create new directory alongside current project
cd /workspaces
mkdir afrifutures-multichain
cd afrifutures-multichain

# Initialize pnpm workspace
pnpm init
cat > pnpm-workspace.yaml << EOF
packages:
  - 'packages/*'
  - 'apps/*'
EOF

# Create directory structure
mkdir -p packages/solana
mkdir -p packages/polygon
mkdir -p packages/shared
mkdir -p packages/bridge
mkdir -p apps/web
mkdir -p apps/mobile
mkdir -p apps/api
mkdir -p docs
mkdir -p scripts

# Initialize git
git init
echo "node_modules/\ntarget/\n.anchor/\ndist/\n.env\n" > .gitignore
```

### Copy Existing Web App

```bash
# Copy your current Next.js platform
cp -r /workspaces/african-commodity-markets/* apps/web/
cd apps/web
# Remove old git history
rm -rf .git
```

---

## Day 3: Solana Programs

### Initialize Anchor Workspace

```bash
cd packages/solana

# Create Anchor workspace
anchor init programs --javascript

# Update Anchor.toml
cat > Anchor.toml << EOF
[toolchain]
anchor_version = "0.30.0"

[features]
resolution = true
skip-lint = false

[programs.devnet]
oracle = "oracxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
amm = "ammxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
EOF
```

### Create Oracle Program

```bash
cd programs
anchor new oracle

# Edit programs/oracle/src/lib.rs
cat > oracle/src/lib.rs << 'EOF'
use anchor_lang::prelude::*;

declare_id!("oracxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod oracle {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let oracle = &mut ctx.accounts.oracle_state;
        oracle.authority = ctx.accounts.authority.key();
        msg!("Oracle initialized!");
        Ok(())
    }

    pub fn update_price(
        ctx: Context<UpdatePrice>,
        commodity: [u8; 32],
        price: u64,
        confidence: u8,
    ) -> Result<()> {
        let price_account = &mut ctx.accounts.price_account;
        let clock = Clock::get()?;
        
        price_account.commodity = commodity;
        price_account.price = price;
        price_account.confidence = confidence;
        price_account.timestamp = clock.unix_timestamp;
        price_account.authority = ctx.accounts.authority.key();
        
        emit!(PriceUpdated {
            commodity,
            price,
            timestamp: clock.unix_timestamp,
        });
        
        msg!("Price updated: {} cents", price);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32)]
    pub oracle_state: Account<'info, OracleState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(commodity: [u8; 32])]
pub struct UpdatePrice<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 32 + 8 + 1 + 8 + 32,
        seeds = [b"price", commodity.as_ref()],
        bump
    )]
    pub price_account: Account<'info, PriceAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct OracleState {
    pub authority: Pubkey,
}

#[account]
pub struct PriceAccount {
    pub commodity: [u8; 32],  // "COFFEE", "COCOA", etc.
    pub price: u64,           // Price in cents
    pub confidence: u8,       // 0-100
    pub timestamp: i64,
    pub authority: Pubkey,
}

#[event]
pub struct PriceUpdated {
    pub commodity: [u8; 32],
    pub price: u64,
    pub timestamp: i64,
}
EOF
```

### Build and Test

```bash
cd packages/solana
anchor build

# Update program IDs
anchor keys list
# Copy the oracle program ID and update in Anchor.toml and lib.rs

# Run local validator
solana-test-validator &

# Deploy
anchor deploy

# Test
anchor test --skip-local-validator
```

---

## Day 4: Polygon Contracts

### Initialize Hardhat Project

```bash
cd packages/polygon
npm init -y

# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts

# Initialize Hardhat
npx hardhat init
# Choose: "Create a TypeScript project"
```

### Create Prediction Market Contract

```bash
# Create contracts/PredictionMarket.sol
mkdir -p contracts
cat > contracts/PredictionMarket.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PredictionMarket is ReentrancyGuard {
    struct Market {
        string commodity;
        uint256 targetPrice;
        uint256 targetDate;
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        bool outcome;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    
    struct Position {
        uint256 yesShares;
        uint256 noShares;
        bool claimed;
    }
    
    IERC20 public immutable usdc;
    uint256 public marketIdCounter;
    
    event MarketCreated(uint256 indexed marketId, string commodity, uint256 targetPrice);
    event SharesPurchased(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }
    
    function createMarket(
        string memory commodity,
        uint256 targetPrice,
        uint256 targetDate
    ) external returns (uint256) {
        require(targetDate > block.timestamp, "Invalid target date");
        
        uint256 marketId = marketIdCounter++;
        markets[marketId] = Market({
            commodity: commodity,
            targetPrice: targetPrice,
            targetDate: targetDate,
            yesPool: 0,
            noPool: 0,
            resolved: false,
            outcome: false
        });
        
        emit MarketCreated(marketId, commodity, targetPrice);
        return marketId;
    }
    
    function buyShares(
        uint256 marketId,
        bool isYes,
        uint256 amount
    ) external nonReentrant {
        Market storage market = markets[marketId];
        require(!market.resolved, "Market resolved");
        require(block.timestamp < market.targetDate, "Market expired");
        require(amount > 0, "Amount must be positive");
        
        // Transfer USDC from user
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        Position storage pos = positions[marketId][msg.sender];
        
        if (isYes) {
            pos.yesShares += amount;
            market.yesPool += amount;
        } else {
            pos.noShares += amount;
            market.noPool += amount;
        }
        
        emit SharesPurchased(marketId, msg.sender, isYes, amount);
    }
    
    function resolveMarket(uint256 marketId, bool outcome) external {
        // TODO: Add oracle verification
        Market storage market = markets[marketId];
        require(!market.resolved, "Already resolved");
        require(block.timestamp >= market.targetDate, "Not expired yet");
        
        market.resolved = true;
        market.outcome = outcome;
        
        emit MarketResolved(marketId, outcome);
    }
    
    function claimWinnings(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.resolved, "Not resolved");
        
        Position storage pos = positions[marketId][msg.sender];
        require(!pos.claimed, "Already claimed");
        
        uint256 payout = 0;
        uint256 totalPool = market.yesPool + market.noPool;
        
        if (market.outcome && pos.yesShares > 0) {
            payout = (pos.yesShares * totalPool) / market.yesPool;
        } else if (!market.outcome && pos.noShares > 0) {
            payout = (pos.noShares * totalPool) / market.noPool;
        }
        
        require(payout > 0, "No winnings");
        
        pos.claimed = true;
        require(usdc.transfer(msg.sender, payout), "Transfer failed");
        
        emit WinningsClaimed(marketId, msg.sender, payout);
    }
    
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }
    
    function getPosition(uint256 marketId, address user) external view returns (Position memory) {
        return positions[marketId][user];
    }
}
EOF
```

### Configure Hardhat

```javascript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
};

export default config;
```

### Deploy to Mumbai

```bash
# Create .env
cat > .env << EOF
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_api_key_here
EOF

# Create deployment script
cat > scripts/deploy.ts << 'EOF'
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Mock USDC address on Mumbai (replace with real)
  const USDC_MUMBAI = "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23";

  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const market = await PredictionMarket.deploy(USDC_MUMBAI);
  await market.deployed();

  console.log("PredictionMarket deployed to:", market.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
EOF

# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.ts --network mumbai
```

---

## Day 5: Shared SDK

### Create TypeScript SDK

```bash
cd packages/shared
npm init -y

# Install dependencies
npm install @solana/web3.js @coral-xyz/anchor ethers zod

# Create types
mkdir -p src/types
cat > src/types/commodity.ts << 'EOF'
export enum CommoditySymbol {
  COFFEE = 'COFFEE',
  COCOA = 'COCOA',
  TEA = 'TEA',
  GOLD = 'GOLD',
  AVOCADO = 'AVOCADO',
  MACADAMIA = 'MACADAMIA',
}

export interface CommodityPrice {
  symbol: CommoditySymbol;
  price: number;
  currency: string;
  timestamp: Date;
  source: 'SOLANA' | 'POLYGON' | 'API';
  confidence?: number;
}

export interface PredictionMarket {
  id: number;
  commodity: string;
  targetPrice: number;
  targetDate: Date;
  yesPool: number;
  noPool: number;
  resolved: boolean;
  outcome?: boolean;
}
EOF

# Create constants
mkdir -p src/constants
cat > src/constants/chains.ts << 'EOF'
export const CHAINS = {
  SOLANA: {
    DEVNET: 'https://api.devnet.solana.com',
    MAINNET: 'https://api.mainnet-beta.solana.com',
  },
  POLYGON: {
    MUMBAI: 'https://rpc-mumbai.maticvigil.com',
    MAINNET: 'https://polygon-rpc.com',
  },
};

export const PROGRAM_IDS = {
  ORACLE: 'oracxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  AMM: 'ammxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
};

export const CONTRACT_ADDRESSES = {
  PREDICTION_MARKET: '0x...', // Fill after deployment
};
EOF
```

---

## Day 6-7: Integration Testing

### Test Solana Oracle

```typescript
// packages/solana/tests/oracle.test.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Oracle } from "../target/types/oracle";
import { expect } from "chai";

describe("oracle", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Oracle as Program<Oracle>;

  it("Updates coffee price", async () => {
    const commodity = Buffer.alloc(32);
    commodity.write("COFFEE");

    const [priceAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("price"), commodity],
      program.programId
    );

    await program.methods
      .updatePrice(Array.from(commodity), new anchor.BN(25000), 95)
      .accounts({
        priceAccount,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.priceAccount.fetch(priceAccount);
    expect(account.price.toNumber()).to.equal(25000);
    expect(account.confidence).to.equal(95);
  });
});
```

### Test Polygon Contract

```typescript
// packages/polygon/test/PredictionMarket.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PredictionMarket", function () {
  it("Creates and resolves a market", async function () {
    const [owner, user1] = await ethers.getSigners();

    // Deploy mock USDC
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const usdc = await MockUSDC.deploy("Mock USDC", "USDC");

    // Deploy PredictionMarket
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    const market = await PredictionMarket.deploy(usdc.address);

    // Create market
    const targetDate = Math.floor(Date.now() / 1000) + 86400; // 1 day
    const tx = await market.createMarket("COFFEE", 30000, targetDate);
    const receipt = await tx.wait();

    expect(receipt.events[0].event).to.equal("MarketCreated");
  });
});
```

---

## Week 1 Checklist

- [ ] Solana CLI installed and configured for devnet
- [ ] Anchor CLI installed (v0.30.0+)
- [ ] Hardhat installed and configured
- [ ] Monorepo structure created (`packages/` + `apps/`)
- [ ] Solana oracle program deployed to devnet
- [ ] Polygon PredictionMarket contract deployed to Mumbai
- [ ] Shared TypeScript SDK with types and constants
- [ ] Tests passing for both chains
- [ ] Documentation updated with addresses and setup steps

---

## Common Issues

### Issue: Anchor build fails
**Solution**: Update Rust: `rustup update stable`

### Issue: Solana airdrop fails
**Solution**: Use public faucet: https://faucet.solana.com/

### Issue: Hardhat deploy fails
**Solution**: Get Mumbai MATIC from faucet: https://faucet.polygon.technology/

### Issue: TypeScript errors
**Solution**: Run `npm install` in each package

---

## Next Steps

After completing Week 1:
1. Move to **Week 2**: Build AMM on Solana + AI predictions on Polygon
2. Review [Week 2 Quickstart](WEEK_2_QUICKSTART.md) (coming soon)
3. Join our Discord for help

---

**Questions?** Open an issue or ask in Discord!
