# 🧪 Wormhole Bridge Testing Guide

## Quick Start - Test Now!

### 1. Start Dev Server

```bash
cd /workspaces/african-commodity-markets
pnpm dev
```

Visit: **http://localhost:3001/test-bridge**

---

## Test Page Features

The `/test-bridge` page provides:

✅ **6 Pre-configured Test Scenarios**
✅ **Wallet Status Dashboard**
✅ **Step-by-step Test Execution**
✅ **Real-time Progress Tracking**
✅ **Test Results Summary**
✅ **Quick Access to Explorers**
✅ **Documentation Links**

---

## Test Scenarios

### 1. Bridge USDC: Polygon → Solana
**What it tests:**
- USDC transfer from Polygon to Solana
- Wormhole VAA generation
- Token receipt on destination chain

**Requirements:**
- MetaMask connected to Polygon Amoy
- USDC balance > 10
- Phantom connected to Solana Devnet

**Steps:**
1. Click "Run Test" on scenario #1
2. Approve USDC spending (if first time)
3. Confirm bridge transaction
4. Wait for VAA (~15-30 seconds)
5. Verify USDC received on Solana

### 2. Bridge USDC + Auto-Stake
**What it tests:**
- USDC bridging with market parameters
- Auto-staking on Solana market
- Position creation on destination chain

**Requirements:**
- Active Solana prediction market
- USDC balance > 10
- Both wallets connected

**Steps:**
1. Enter market ID and side (YES/NO)
2. Submit bridge + stake transaction
3. Wait for VAA
4. Verify stake position on Solana

### 3. Bridge $AFF: Polygon → Solana
**What it tests:**
- $AFF token bridging
- Wrapped token minting
- Cross-chain token transfers

**Requirements:**
- $AFF token balance > 100
- Both wallets connected

### 4. Bridge USDC: Solana → Polygon
**What it tests:**
- Reverse bridge (Solana → Polygon)
- VAA completion on Polygon
- Token unlocking

**Requirements:**
- USDC on Solana > 10
- Both wallets connected

### 5. Bridge Warehouse Receipt
**What it tests:**
- NFT bridging
- Receipt tokenization
- Cross-chain asset transfer

**Requirements:**
- Valid warehouse receipt ID
- Polygon wallet connected

### 6. Bridge Governance Vote
**What it tests:**
- Cross-chain voting
- Governance integration
- Vote counting across chains

**Requirements:**
- $AFF token balance
- Active proposal on Solana

---

## Manual Testing Steps

### Prerequisites

1. **Get Test Tokens**

```bash
# Polygon MATIC (for gas)
# Visit: https://faucet.polygon.technology

# Polygon USDC
# Contract: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
# Get from faucet or swap

# Solana SOL (for gas)
solana airdrop 2 YOUR_ADDRESS --url devnet

# Solana USDC
# Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
# Get from faucet
```

2. **Connect Wallets**
   - MetaMask: Add Polygon Amoy network
   - Phantom: Switch to Devnet

### Test 1: Bridge USDC Manually

```typescript
// In browser console or test page

import { bridgeUSDCPolygonToSolana } from '@/lib/blockchain/wormhole-client'

const tx = await bridgeUSDCPolygonToSolana({
  amount: '10',
  solanaRecipient: 'YOUR_SOLANA_ADDRESS',
  marketId: 0, // Optional
  isYes: true, // Optional
  signer: await window.ethereum.request({ method: 'eth_requestAccounts' })
})

console.log('Bridge TX:', tx.txHash)
console.log('Sequence:', tx.sequence)
```

### Test 2: Fetch VAA

```typescript
import { getVAA } from '@/lib/blockchain/wormhole-client'

// Wait ~15 seconds after bridge transaction
const vaa = await getVAA(
  5, // Polygon chain ID
  'BRIDGE_CONTRACT_ADDRESS',
  'SEQUENCE_NUMBER'
)

console.log('VAA:', vaa)
```

### Test 3: Check Balance on Solana

```typescript
import { getBridgedUSDCBalance } from '@/lib/blockchain/wormhole-client'
import { Connection, PublicKey } from '@solana/web3.js'

const connection = new Connection('https://api.devnet.solana.com')
const balance = await getBridgedUSDCBalance(
  connection,
  new PublicKey('YOUR_SOLANA_ADDRESS')
)

console.log('USDC Balance on Solana:', balance)
```

---

## Smart Contract Tests

### Run Hardhat Tests

```bash
# Install dependencies
pnpm install --save-dev @nomicfoundation/hardhat-toolbox

# Run tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test
npx hardhat test test/AfrifuturesBridge.test.ts
```

### Expected Output

```
AfrifuturesBridge
  Deployment
    ✓ Should set the right owner (50ms)
    ✓ Should set correct token addresses (45ms)
    ✓ Should set initial bridge fee (40ms)
  Bridge USDC
    ✓ Should bridge USDC to Solana (150ms)
    ✓ Should fail if insufficient bridge fee (60ms)
    ✓ Should fail if amount is zero (55ms)
  Bridge $AFF
    ✓ Should bridge $AFF to Solana (140ms)
  Bridge Receipt
    ✓ Should bridge warehouse receipt (120ms)
  Bridge Vote
    ✓ Should bridge governance vote (130ms)
  Fee Management
    ✓ Should update fees (80ms)
    ✓ Should allow admin to withdraw fees (100ms)
  Access Control
    ✓ Should not allow non-admin to update fees (70ms)
    ✓ Should not allow non-admin to withdraw fees (65ms)

13 passing (2s)
```

---

## Integration Testing

### Test End-to-End Flow

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Run integration tests
pnpm test:integration
```

**test-integration.ts:**
```typescript
import { test, expect } from '@playwright/test'

test('Bridge USDC flow', async ({ page }) => {
  await page.goto('http://localhost:3001/test-bridge')
  
  // Connect wallets
  await page.click('button:has-text("Connect Wallet")')
  
  // Run test
  await page.click('button:has-text("Bridge USDC: Polygon → Solana")')
  
  // Wait for test completion
  await expect(page.locator('text=Test Passed')).toBeVisible({ timeout: 60000 })
  
  // Verify result
  const result = await page.textContent('[data-testid="test-result"]')
  expect(result).toContain('passed')
})
```

---

## Monitoring During Tests

### Watch Polygon Transactions

```bash
# Terminal 3: Monitor Polygon events
cast logs --subscribe \
  --address YOUR_BRIDGE_CONTRACT \
  --rpc-url https://rpc-amoy.polygon.technology

# Or visit PolygonScan
# https://amoy.polygonscan.com/address/YOUR_BRIDGE_CONTRACT
```

### Watch Solana Logs

```bash
# Terminal 4: Monitor Solana program
solana logs YOUR_BRIDGE_PROGRAM_ID --url devnet

# Or visit Solana Explorer
# https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet
```

### Check Wormhole Status

```bash
# Check if VAA is ready
curl "https://wormhole-v2-testnet-api.certus.one/v1/signed_vaa/5/EMITTER/SEQUENCE"

# Or visit Wormhole Scan
# https://wormholescan.io/#/tx/YOUR_TX_HASH
```

---

## Troubleshooting Tests

### Test Fails: "Wallet not connected"

**Solution:**
```typescript
// Ensure wallets are connected before running tests
if (!isPolygonConnected) {
  await connectPolygonWallet()
}
if (!isSolanaConnected) {
  await connectSolanaWallet()
}
```

### Test Fails: "Insufficient balance"

**Solution:**
```bash
# Get test tokens
# Polygon USDC: Visit faucet
# Solana SOL: solana airdrop 2
```

### Test Fails: "VAA not found"

**Possible Causes:**
1. Transaction not finalized on source chain
2. Wrong sequence number
3. Wormhole guardians offline

**Solution:**
```typescript
// Wait longer for finality
await new Promise(resolve => setTimeout(resolve, 30000))

// Then retry VAA fetch
const vaa = await getVAA(chainId, emitter, sequence)
```

### Test Fails: "Bridge paused"

**Solution:**
```solidity
// Unpause bridge (admin only)
await bridge.setPause(false)
```

---

## Performance Benchmarks

### Expected Timings

| Action | Expected Time | Acceptable Range |
|--------|--------------|------------------|
| Approve USDC | 5-10s | 3-30s |
| Submit bridge TX | 10-20s | 5-60s |
| VAA generation | 15-30s | 10-120s |
| Complete on destination | 5-15s | 3-60s |
| **Total** | **35-75s** | **20-270s** |

### Gas Costs (Testnet)

| Action | Polygon Gas | Solana Compute | Bridge Fee |
|--------|-------------|----------------|------------|
| Bridge USDC | ~150k gas | ~50k CU | 0.01 MATIC |
| Bridge $AFF | ~120k gas | ~40k CU | 0.01 MATIC |
| Complete bridge | ~80k gas | ~30k CU | Free |

---

## Test Checklist

Before considering tests complete:

- [ ] All 6 test scenarios pass
- [ ] USDC bridged successfully both directions
- [ ] $AFF tokens bridged successfully
- [ ] VAA fetched correctly every time
- [ ] Auto-stake works when specified
- [ ] Governance vote counted on destination
- [ ] No funds lost or stuck
- [ ] All events emitted correctly
- [ ] Gas costs within acceptable range
- [ ] Time to completion < 2 minutes
- [ ] Error handling works properly
- [ ] UI shows correct status
- [ ] Explorers show transactions
- [ ] Documentation matches behavior

---

## Next Steps After Testing

### If All Tests Pass ✅

1. **Document Results**
   ```bash
   # Save test report
   npx hardhat test > test-results.txt
   ```

2. **Prepare for Mainnet**
   - Security audit
   - Stress testing
   - Load testing
   - Penetration testing

3. **Deploy to Mainnet**
   ```bash
   # Use mainnet deployment script
  npx hardhat run scripts/deploy-bridge.js --network polygon
   ```

### If Tests Fail ❌

1. **Review Logs**
   - Check Polygon transaction
   - Check Solana logs
   - Check Wormhole guardian status

2. **Debug**
   - Add console.log statements
   - Use Hardhat debugger
   - Check contract state

3. **Fix and Retest**
   - Make necessary changes
   - Run tests again
   - Verify fix works

---

## Support

### Get Help

- **Discord**: [Wormhole Discord](https://discord.gg/wormholecrypto)
- **GitHub**: [Wormhole Issues](https://github.com/wormhole-foundation/wormhole/issues)
- **Docs**: [Wormhole Documentation](https://docs.wormhole.com/)

### Report Issues

If you encounter bugs:

1. Save error logs
2. Note wallet addresses
3. Record transaction hashes
4. Document steps to reproduce
5. Create GitHub issue with details

---

**Ready to test? Visit http://localhost:3001/test-bridge and start testing! 🚀**
