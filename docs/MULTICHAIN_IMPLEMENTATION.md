# Multi-Chain Implementation Guide

## Overview
The African Commodity Markets platform now supports both **Polygon Amoy Testnet** and **Solana Devnet**, allowing users to stake USDC and participate in AI-powered prediction markets on either blockchain.

## Architecture

### Unified Client Abstraction
All blockchain interactions go through `/lib/blockchain/unified-client.ts`, which provides a chain-agnostic interface:

```typescript
// Same function works for both chains
await stakePrediction({
  id: 'polygon-1' | 'solana-abc123',
  chain: 'polygon' | 'solana',
  isYes: true,
  amount: '10.5',
  signer: ethersSignerOrSolanaWallet
})
```

### Chain-Specific SDKs

#### Polygon Client (`/lib/blockchain/polygon-client.ts`)
- Uses ethers.js v6
- Interacts with AIPredictionMarket.sol contract
- USDC token: ERC-20 at `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`
- Functions: `stakePrediction`, `claimWinnings`, `resolvePrediction`, `getOdds`

#### Solana Client (`/lib/blockchain/solana-client.ts`)
- Uses @solana/web3.js + Anchor
- Interacts with Rust programs in `/programs/`
- USDC token: SPL token (devnet mint TBD)
- Functions: `buyShares`, `claimSolanaWinnings`, `resolveSolanaMarket`

## Wallet Integration

### Polygon Wallet Provider
- **Location**: `/components/blockchain/wallet-provider.tsx`
- **Library**: RainbowKit 2.2.8 + wagmi
- **Wallets**: MetaMask, WalletConnect, Coinbase Wallet
- **Hook**: `useAccount()` from wagmi

### Solana Wallet Provider
- **Location**: `/components/blockchain/solana-wallet-provider.tsx`
- **Library**: @solana/wallet-adapter-react
- **Wallets**: Phantom, Solflare
- **Hook**: `useWallet()` from @solana/wallet-adapter-react

### Chain Selection
- **Component**: `/components/blockchain/chain-selector.tsx`
- **Context**: `/components/blockchain/chain-provider.tsx`
- **Hook**: `useChain()` - provides `activeChain`, `setActiveChain()`
- **Storage**: localStorage persists user's chain preference

## UI Components

### Updated Components

#### 1. App Header (`/components/app-header.tsx`)
- Shows ChainSelector toggle (Polygon ↔ Solana)
- Shows UnifiedWalletConnect button
- Conditionally renders appropriate wallet UI based on active chain

#### 2. Unified Wallet Connect (`/components/unified-wallet-connect.tsx`)
- Displays RainbowKit ConnectButton for Polygon
- Displays WalletMultiButton for Solana
- Automatically switches based on `activeChain`

#### 3. Prediction Staking Modal (`/components/blockchain/prediction-staking-modal.tsx`)
- ✅ **Updated** to use unified-client
- Accepts `UnifiedPrediction` type
- Shows chain badge in modal title
- Handles both ethers signer and Solana wallet
- USDC balance checking for both chains
- Single stake flow works on both networks

### Components to Update

#### 4. Market Prediction Card (`/components/blockchain/market-prediction-card.tsx`)
- ⚠️ **Needs Update**: Currently Polygon-only
- Should detect prediction.chain and render accordingly
- Update claim button to use `Unified.claimWinnings()`

#### 5. Market Pages (`/app/market/[commodity]/page.tsx`)
- ⚠️ **Needs Update**: Fetch markets from both chains
- Show combined list or separate tabs
- Pass `UnifiedPrediction` to components

## Smart Contracts

### Polygon Smart Contract
- **File**: `/contracts/AIPredictionMarket.sol`
- **Deployed**: ✅ Yes (address in `.env.local`)
- **Functions**:
  - `createPrediction()`
  - `stake()`
  - `resolvePrediction()`
  - `claimWinnings()`
- **Features**: 2% platform fee, owner-only oracle resolution

### Solana Programs

#### Oracle Program (`/programs/oracle/`)
- **Language**: Rust + Anchor
- **Status**: ⚠️ Source written, needs compilation
- **Functions**:
  - `initialize()` - Setup oracle state
  - `update_price()` - Update commodity prices
  - `get_price()` - CPI-callable price fetching
- **Deployment**: Run `anchor build && anchor deploy`

#### Prediction Market Program (`/programs/prediction-market/`)
- **Language**: Rust + Anchor
- **Status**: ⚠️ Source written, needs compilation
- **Functions**:
  - `create_market()` - Create new prediction market
  - `buy_shares()` - Stake USDC on YES/NO
  - `resolve_market()` - Oracle resolution via CPI
  - `claim_winnings()` - Claim rewards
- **Features**: AMM-style pools, SPL token support
- **Deployment**: Run `anchor build && anchor deploy`

## Oracle Settlement System

### Multi-Chain Oracle API
- **Endpoint**: `/app/api/oracle/resolve/route.ts`
- **Methods**:
  - `GET /api/oracle/resolve` - Resolve all expired markets
  - `POST /api/oracle/resolve` - Manually resolve specific market

#### POST Body Format
```json
{
  "chain": "polygon" | "solana",
  "predictionId": 1, // For Polygon
  "marketId": "abc123", // For Solana
  "commodity": "COFFEE" // Required for Solana
}
```

#### Authentication
- Uses `Authorization: Bearer ${CRON_SECRET}` header
- Set `CRON_SECRET` env var for security

#### Resolution Flow
1. Fetch live commodity price via `getLivePrice()`
2. Convert to cents: `actualPriceInCents = Math.round(price * 100)`
3. Call chain-specific resolution:
   - Polygon: `Polygon.resolvePrediction()`
   - Solana: `Solana.resolveSolanaMarket()`
4. Update oracle price feed on Solana
5. Markets calculate winners automatically
6. Users can claim winnings after resolution

### Automated Cron Job
Set up Vercel Cron or GitHub Actions:

```yaml
# .github/workflows/oracle-resolution.yml
name: Oracle Resolution
on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
jobs:
  resolve:
    runs-on: ubuntu-latest
    steps:
      - name: Resolve Expired Markets
        run: |
          curl -X GET "${{ secrets.API_URL }}/api/oracle/resolve" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Environment Variables

### Required for Polygon
```bash
# Polygon RPC
NEXT_PUBLIC_POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002

# Contract addresses
NEXT_PUBLIC_PREDICTION_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582

# Oracle wallet (server-side only)
ORACLE_PRIVATE_KEY=0x...
```

### Required for Solana
```bash
# Solana RPC
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_CLUSTER=devnet

# Program IDs (after deployment)
NEXT_PUBLIC_SOLANA_ORACLE_PROGRAM_ID=...
NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID=...

# USDC mint (devnet)
NEXT_PUBLIC_SOLANA_USDC_MINT=...

# Oracle keypair (server-side only, JSON array)
ORACLE_KEYPAIR=[123,45,67,...]
```

### Optional
```bash
# Oracle API authentication
CRON_SECRET=your-secret-key-here
```

## Deployment Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Build Solana Programs
```bash
cd programs/oracle
anchor build
anchor deploy --provider.cluster devnet
# Copy program ID to .env

cd ../prediction-market
anchor build
anchor deploy --provider.cluster devnet
# Copy program ID to .env
```

### 3. Update Environment Variables
Add all Solana program IDs to `.env.local`

### 4. Test Locally
```bash
pnpm dev
```

### 5. Deploy to Vercel
```bash
vercel --prod
```

## Testing Flow

### On Polygon
1. Connect MetaMask wallet
2. Select "Polygon" in chain selector
3. View market predictions
4. Click "Stake" → approve USDC → stake amount
5. Wait for target date
6. Oracle resolves market
7. Claim winnings

### On Solana
1. Connect Phantom wallet
2. Select "Solana" in chain selector
3. View market predictions
4. Click "Stake" → sign transaction
5. Wait for target date
6. Oracle resolves market
7. Claim winnings

## Data Flow

```
User Action (Stake)
    ↓
ChainProvider (activeChain)
    ↓
PredictionStakingModal
    ↓
Unified.stakePrediction({ id, chain, amount, signer })
    ↓
If polygon → Polygon.stakePrediction() → EVM Contract
If solana → Solana.buyShares() → Anchor Program
    ↓
Transaction Hash
    ↓
Update UI
```

## Security Considerations

1. **Oracle Private Keys**: Store in secure environment variables, never commit to git
2. **API Authentication**: Use `CRON_SECRET` for oracle endpoint
3. **Input Validation**: All user inputs validated before blockchain calls
4. **Rate Limiting**: Oracle API should implement rate limiting
5. **Front-Running**: Consider using commit-reveal for high-value markets

## Future Enhancements

### Short Term
- [ ] Complete Solana program deployment
- [ ] Add USDC balance fetching for Solana
- [ ] Update market-prediction-card for multi-chain
- [ ] Add transaction history page

### Medium Term
- [ ] Multi-chain market explorer
- [ ] Cross-chain arbitrage opportunities
- [ ] Solana devnet faucet integration
- [ ] Historical price charts per chain

### Long Term
- [ ] Base L2 support
- [ ] Arbitrum integration
- [ ] Cross-chain bridges
- [ ] DAO governance for oracle

## Troubleshooting

### Polygon Issues
- **"Transaction reverted"**: Check USDC approval amount
- **"Insufficient balance"**: Get USDC from Polygon faucet
- **"Wrong network"**: Switch MetaMask to Polygon Amoy testnet

### Solana Issues
- **"Transaction failed"**: Ensure enough SOL for rent + fees
- **"Account not found"**: Market may not exist yet
- **"Program not deployed"**: Run `anchor deploy` first

### General
- **"No wallet detected"**: Install MetaMask or Phantom
- **"Chain not supported"**: Check environment variables
- **"API error"**: Verify RPC endpoints are accessible

## Resources

- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Solana Devnet Faucet](https://faucet.solana.com/)
- [RainbowKit Docs](https://rainbowkit.com/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Anchor Framework](https://www.anchor-lang.com/)

---

**Status**: 🟡 Infrastructure Complete, Deployment Pending

Last Updated: 2024
