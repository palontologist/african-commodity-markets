# Solana Program Deployment Guide

## Prerequisites

Your devnet wallet is already set up:
- **Public Key**: `FSYiMcF51TmBh3WhkkXtq5d8GBkSuokJVKrKhDKq7rbw`
- **Balance**: 2 SOL (sufficient for deployment)
- **Config**: Devnet cluster configured

## Option 1: Quick Deploy Using Anchor (Recommended)

### Install Anchor CLI

Since cargo installation takes time, use the install script:

```bash
# Install avm (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor 0.30.0
avm install 0.30.0
avm use 0.30.0
```

**Note**: This can take 15-30 minutes to compile.

### Build and Deploy Programs

```bash
cd /workspaces/african-commodity-markets

# Build both programs
anchor build

# Deploy oracle program
anchor deploy --program-name oracle --provider.cluster devnet

# Deploy prediction-market program  
anchor deploy --program-name prediction_market --provider.cluster devnet
```

### Get Program IDs

After deployment, Anchor will output program IDs like:
```
Program Id: 7xKZT...abc123
```

## Option 2: Manual Deploy (If Anchor Fails)

### 1. Build with cargo-build-sbf

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

# Build oracle
cd /workspaces/african-commodity-markets/programs/oracle
cargo build-sbf --manifest-path Cargo.toml --sbf-out-dir ../../target/deploy

# Build prediction-market
cd /workspaces/african-commodity-markets/programs/prediction-market
cargo build-sbf --manifest-path Cargo.toml --sbf-out-dir ../../target/deploy
```

### 2. Deploy Manually

```bash
cd /workspaces/african-commodity-markets

# Deploy oracle
solana program deploy target/deploy/oracle.so

# Deploy prediction-market
solana program deploy target/deploy/prediction_market.so
```

## Option 3: Use Playground (Easiest for Testing)

While full deployment is being set up, you can use Solana Playground for testing:

1. Go to https://beta.solpg.io
2. Create a new Anchor project
3. Copy the contents of `/programs/oracle/src/lib.rs` 
4. Click "Build" → "Deploy"
5. Get the program ID from Playground

## Post-Deployment: Update Environment Variables

Once deployed, add these to `.env.local`:

```bash
# Solana Program IDs (from deployment output)
NEXT_PUBLIC_SOLANA_ORACLE_PROGRAM_ID=<oracle_program_id>
NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID=<prediction_market_program_id>

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_CLUSTER=devnet

# Devnet USDC (you'll need to create or use existing)
NEXT_PUBLIC_SOLANA_USDC_MINT=<devnet_usdc_mint_address>

# Oracle Keypair for Server-Side Operations
# This is your ~/.config/solana/id.json as a JSON array
ORACLE_KEYPAIR=[...]
```

### Get Your Keypair as JSON Array

```bash
cat ~/.config/solana/id.json
```

Copy the output and paste it as the value for `ORACLE_KEYPAIR`.

## Troubleshooting

### "cargo build-sbf" fails with network errors

**Solution**: Retry with clean cache
```bash
rm -rf ~/.cargo/registry
cargo build-sbf
```

### "insufficient funds" during deployment

**Solution**: Request more SOL
```bash
solana airdrop 2
```

### Anchor build fails with "version mismatch"

**Solution**: Ensure Rust 1.75.0
```bash
rustup default 1.75.0
rustup component add rust-src
```

### Program deployment exceeds max size

**Solution**: Build in release mode
```bash
cargo build-sbf --release
```

## Quick Test Without Full Deployment

You can test the multi-chain UI right now using Polygon only:

1. Make sure `.env.local` has Polygon variables
2. Run `pnpm dev`
3. Toggle between Polygon and Solana in the UI
4. Polygon will work, Solana will show "Program not deployed" (expected)

The UI infrastructure is already built and ready!

## Next Steps After Deployment

1. Initialize the oracle with commodity prices:
```typescript
// Use the client SDK
await initializeOracle({
  authority: walletPublicKey,
  commodity: 'COFFEE'
});
```

2. Create a test market:
```typescript
await createMarket({
  commodity: 'COFFEE',
  thresholdPrice: 25000, // $250.00 in cents
  expiryTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours
});
```

3. Test the full flow:
   - Stake USDC on YES/NO
   - Wait or manually trigger oracle resolution
   - Claim winnings

## Alternative: Use Existing Deployed Programs

If you want to test immediately, you can use publicly deployed program IDs from other Solana prediction markets and adapt them. However, I recommend deploying your own for full control.

---

**Current Status**: 
- ✅ Solana CLI installed
- ✅ Devnet wallet created and funded (2 SOL)
- ✅ Programs written and ready to build
- ⏳ Anchor CLI compilation in progress
- ⏸️ Deployment pending Anchor installation

**Estimated Time**: 30-45 minutes total (mostly waiting for Anchor to compile)
