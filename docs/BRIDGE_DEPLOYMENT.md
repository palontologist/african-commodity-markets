# Wormhole Bridge Deployment

## Quick Start

### 1. Deploy Polygon Bridge Contract

```bash
# Ensure you have MATIC for gas
npx hardhat run scripts/deploy-bridge.js --network polygon-amoy

# Output will show:
# ✅ AfrifuturesBridge deployed to: 0x...
```

### 2. Update Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT=0x...  # From deployment output
```

### 3. Deploy Solana Bridge Program

```bash
cd afrifutures/programs/wormhole-bridge

# Build
anchor build

# Deploy
solana program deploy target/deploy/afrifutures_bridge.so \
  --url devnet \
  --keypair ~/.config/solana/id.json

# Get program ID
solana address -k target/deploy/afrifutures_bridge-keypair.json
```

### 4. Initialize Solana Bridge

```typescript
// scripts/initialize-solana-bridge.ts
import * as anchor from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

const POLYGON_BRIDGE = 'YOUR_POLYGON_BRIDGE_ADDRESS'

async function main() {
  const provider = anchor.AnchorProvider.env()
  const program = anchor.workspace.AfrifuturesBridge
  
  // Convert Polygon address to 32 bytes
  const polygonEmitter = Buffer.from(
    POLYGON_BRIDGE.replace('0x', '').padStart(64, '0'),
    'hex'
  )
  
  await program.methods
    .initialize(Array.from(polygonEmitter))
    .accounts({
      bridgeState: /* derive PDA */,
      authority: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc()
  
  console.log('✅ Solana bridge initialized')
}

main()
```

### 5. Test Bridge Flow

```bash
# Test USDC bridge
npm run test:bridge

# Or manually
cd test
npx ts-node test-bridge.ts
```

## Configuration

### Wormhole Addresses

#### Polygon Testnet (Amoy)
- Core Bridge: `0x0CBE91CF822c73C2315FB05100C2F714765d5c20`
- Token Bridge: `0x0591bC2304c3bd1Aa142Fc87D6D1e0FC2e09a673`

#### Solana Devnet
- Core Bridge: `3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5`
- Token Bridge: `DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe`

### Network Configuration

Update `hardhat.config.js`:

```javascript
networks: {
  'polygon-amoy': {
    url: 'https://rpc-amoy.polygon.technology',
    accounts: [process.env.PRIVATE_KEY],
    chainId: 80002,
  }
}
```

## Verification

### Verify on PolygonScan

```bash
npx hardhat verify --network polygon-amoy \
  BRIDGE_ADDRESS \
  WORMHOLE_CORE \
  USDC_ADDRESS \
  AFF_TOKEN_ADDRESS
```

### Check Deployment

```bash
# Get bridge stats
cast call BRIDGE_ADDRESS \
  "getBridgeStats()(uint256,uint256,uint256,uint256)" \
  --rpc-url https://rpc-amoy.polygon.technology

# Check fees
cast call BRIDGE_ADDRESS \
  "bridgeFee()(uint256)" \
  --rpc-url https://rpc-amoy.polygon.technology
```

## Monitoring

### Watch Bridge Events

```bash
# Terminal 1: Watch Polygon events
cast logs --subscribe \
  --address BRIDGE_ADDRESS \
  --rpc-url wss://wss-amoy.polygon.technology

# Terminal 2: Watch Solana logs
solana logs PROGRAM_ID --url devnet
```

### Track VAAs

```bash
# Check if VAA is available
curl "https://wormhole-v2-testnet-api.certus.one/v1/signed_vaa/5/$EMITTER/$SEQUENCE"
```

## Troubleshooting

### Bridge Transaction Fails

**Problem**: Transaction reverts with "Insufficient bridge fee"

**Solution**:
```typescript
// Increase bridge fee in transaction
const tx = await bridge.bridgeUSDCForStaking(
  amount,
  recipient,
  marketId,
  isYes,
  { value: ethers.parseEther('0.02') } // Increase from 0.01
)
```

### VAA Not Available

**Problem**: `getVAA()` fails after 30 attempts

**Solution**:
1. Check transaction finality on source chain
2. Wait longer (Polygon takes ~2 minutes)
3. Verify emitter address is correct
4. Check Wormhole guardian network status

### Solana Transaction Fails

**Problem**: "InvalidEmitter" error

**Solution**:
```rust
// Ensure Polygon emitter is correctly set
let polygon_emitter = [/* correct 32 bytes */];

// Re-initialize if needed
anchor run initialize-bridge --polygon-emitter $CORRECT_EMITTER
```

## Security Checklist

Before mainnet deployment:

- [ ] Audit smart contracts
- [ ] Test with small amounts
- [ ] Set up monitoring
- [ ] Configure relayer infrastructure
- [ ] Test pause mechanism
- [ ] Verify role assignments
- [ ] Set appropriate fees
- [ ] Test emergency withdrawals
- [ ] Document recovery procedures
- [ ] Set up alerting system

## Production Deployment

### Mainnet Addresses

#### Polygon Mainnet
- Core Bridge: `0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7`
- Token Bridge: `0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE`

#### Solana Mainnet
- Core Bridge: `worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth`
- Token Bridge: `wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb`

### Deploy to Mainnet

```bash
# 1. Deploy Polygon contract
  npx hardhat run scripts/deploy-bridge.js --network polygon

# 2. Verify contract
npx hardhat verify --network polygon BRIDGE_ADDRESS ...

# 3. Deploy Solana program
solana program deploy ... --url mainnet-beta

# 4. Initialize with production settings
npm run initialize:mainnet

# 5. Transfer admin roles
npm run transfer-admin
```

---

**Status**: Ready for testnet deployment  
**Next**: Deploy and test on Polygon Amoy + Solana Devnet
