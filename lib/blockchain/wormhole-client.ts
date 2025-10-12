/**
 * Wormhole Bridge Client
 * Handles cross-chain USDC and $AFF token transfers between Polygon and Solana
 */

import { ethers } from 'ethers'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { 
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

// Wormhole addresses
export const WORMHOLE_ADDRESSES = {
  polygon: {
    core: '0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7', // Polygon Mainnet
    tokenBridge: '0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE',
  },
  solana: {
    core: new PublicKey('worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth'),
    tokenBridge: new PublicKey('wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb'),
  },
}

// Chain IDs (Wormhole format)
export const CHAIN_IDS = {
  solana: 1,
  ethereum: 2,
  polygon: 5,
}

export interface BridgeQuote {
  sourceFee: string
  destinationFee: string
  estimatedTime: string // e.g., "15 minutes"
  wormholeFee: string
}

export interface BridgeTransaction {
  txHash: string
  sequence: string
  emitterAddress: string
  vaa?: string // Verified Action Approval
}

/**
 * Get Wormhole bridge quote for USDC transfer
 */
export async function getWormholeBridgeQuote(
  amount: string,
  fromChain: 'polygon' | 'solana',
  toChain: 'polygon' | 'solana'
): Promise<BridgeQuote> {
  // In production, fetch from Wormhole API
  // For now, return estimates
  
  const bridgeFee = fromChain === 'polygon' ? '0.01' : '0.000005' // ETH or SOL
  const wormholeFee = '0.00001'
  
  return {
    sourceFee: bridgeFee,
    destinationFee: '0',
    estimatedTime: '15 minutes',
    wormholeFee,
  }
}

/**
 * Bridge USDC from Polygon to Solana
 */
export async function bridgeUSDCPolygonToSolana({
  amount,
  solanaRecipient,
  marketId,
  isYes,
  signer,
}: {
  amount: string
  solanaRecipient: string
  marketId?: number
  isYes?: boolean
  signer: ethers.Signer
}): Promise<BridgeTransaction> {
  const bridgeAddress = process.env.NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT
  if (!bridgeAddress) {
    throw new Error('Bridge contract not configured')
  }
  
  const bridgeABI = [
    'function bridgeUSDCForStaking(uint256 amount, bytes32 solanaRecipient, uint256 marketId, bool isYes) external payable returns (uint64)',
  ]
  
  const bridge = new ethers.Contract(bridgeAddress, bridgeABI, signer)
  
  // Convert Solana address to bytes32
  const recipientBytes32 = solanaAddressToBytes32(solanaRecipient)
  
  // Convert amount to base units (USDC has 6 decimals)
  const amountBN = ethers.parseUnits(amount, 6)
  
  // Get bridge fee
  const bridgeFee = ethers.parseEther('0.01')
  
  try {
    const tx = await bridge.bridgeUSDCForStaking(
      amountBN,
      recipientBytes32,
      marketId || 0,
      isYes || false,
      { value: bridgeFee }
    )
    
    const receipt = await tx.wait()
    
    // Extract sequence number from event
    const event = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id('MessageSent(uint64,uint8,address,uint256,bytes32)')
    )
    
    const sequence = event ? ethers.toNumber(event.topics[1]) : '0'
    
    return {
      txHash: receipt.hash,
      sequence: sequence.toString(),
      emitterAddress: bridgeAddress,
    }
  } catch (error) {
    console.error('Bridge error:', error)
    throw new Error(`Failed to bridge USDC: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Bridge $AFF tokens from Polygon to Solana
 */
export async function bridgeAFFPolygonToSolana({
  amount,
  solanaRecipient,
  signer,
}: {
  amount: string
  solanaRecipient: string
  signer: ethers.Signer
}): Promise<BridgeTransaction> {
  const bridgeAddress = process.env.NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT
  if (!bridgeAddress) {
    throw new Error('Bridge contract not configured')
  }
  
  const bridgeABI = [
    'function bridgeAFF(uint256 amount, bytes32 solanaRecipient) external payable returns (uint64)',
  ]
  
  const bridge = new ethers.Contract(bridgeAddress, bridgeABI, signer)
  
  const recipientBytes32 = solanaAddressToBytes32(solanaRecipient)
  const amountBN = ethers.parseUnits(amount, 18) // $AFF has 18 decimals
  const bridgeFee = ethers.parseEther('0.01')
  
  const tx = await bridge.bridgeAFF(amountBN, recipientBytes32, { value: bridgeFee })
  const receipt = await tx.wait()
  
  return {
    txHash: receipt.hash,
    sequence: '0', // Extract from events in production
    emitterAddress: bridgeAddress,
  }
}

/**
 * Bridge warehouse receipt from Polygon to Solana
 */
export async function bridgeReceipt({
  receiptId,
  solanaRecipient,
  commodity,
  quantity,
  signer,
}: {
  receiptId: number
  solanaRecipient: string
  commodity: string
  quantity: number
  signer: ethers.Signer
}): Promise<BridgeTransaction> {
  const bridgeAddress = process.env.NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT
  if (!bridgeAddress) {
    throw new Error('Bridge contract not configured')
  }
  
  const bridgeABI = [
    'function bridgeReceipt(uint256 receiptId, bytes32 solanaRecipient, string commodity, uint256 quantity) external payable returns (uint64)',
  ]
  
  const bridge = new ethers.Contract(bridgeAddress, bridgeABI, signer)
  const recipientBytes32 = solanaAddressToBytes32(solanaRecipient)
  const bridgeFee = ethers.parseEther('0.01')
  
  const tx = await bridge.bridgeReceipt(
    receiptId,
    recipientBytes32,
    commodity,
    quantity,
    { value: bridgeFee }
  )
  
  const receipt = await tx.wait()
  
  return {
    txHash: receipt.hash,
    sequence: '0',
    emitterAddress: bridgeAddress,
  }
}

/**
 * Bridge governance vote from Polygon to Solana
 */
export async function bridgeVote({
  proposalId,
  votes,
  support,
  solanaRecipient,
  signer,
}: {
  proposalId: number
  votes: string
  support: boolean
  solanaRecipient: string
  signer: ethers.Signer
}): Promise<BridgeTransaction> {
  const bridgeAddress = process.env.NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT
  if (!bridgeAddress) {
    throw new Error('Bridge contract not configured')
  }
  
  const bridgeABI = [
    'function bridgeVote(uint256 proposalId, uint256 votes, bool support, bytes32 solanaRecipient) external payable returns (uint64)',
  ]
  
  const bridge = new ethers.Contract(bridgeAddress, bridgeABI, signer)
  const recipientBytes32 = solanaAddressToBytes32(solanaRecipient)
  const votesBN = ethers.parseUnits(votes, 18)
  const bridgeFee = ethers.parseEther('0.01')
  
  const tx = await bridge.bridgeVote(
    proposalId,
    votesBN,
    support,
    recipientBytes32,
    { value: bridgeFee }
  )
  
  const receipt = await tx.wait()
  
  return {
    txHash: receipt.hash,
    sequence: '0',
    emitterAddress: bridgeAddress,
  }
}

/**
 * Get VAA (Verified Action Approval) from Wormhole Guardian network
 * This is needed to complete the bridge on the destination chain
 */
export async function getVAA(
  emitterChain: number,
  emitterAddress: string,
  sequence: string
): Promise<string> {
  // Wormhole Guardian RPC
  const guardianRPC = 'https://wormhole-v2-mainnet-api.certus.one'
  
  const url = `${guardianRPC}/v1/signed_vaa/${emitterChain}/${emitterAddress}/${sequence}`
  
  // Poll for VAA (it takes ~15 seconds for guardians to sign)
  let attempts = 0
  const maxAttempts = 30
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        return data.vaaBytes
      }
    } catch (error) {
      console.log(`Waiting for VAA... (attempt ${attempts + 1}/${maxAttempts})`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    attempts++
  }
  
  throw new Error('Failed to fetch VAA. Bridge may not be finalized yet.')
}

/**
 * Complete bridge on Solana (redeem VAA)
 */
export async function completeTransferOnSolana({
  vaa,
  wallet,
  connection,
}: {
  vaa: string
  wallet: any
  connection: Connection
}): Promise<string> {
  // In production, use Wormhole SDK to parse VAA and build redemption transaction
  // For now, this is a placeholder
  
  const bridgeProgramId = WORMHOLE_ADDRESSES.solana.tokenBridge
  
  // TODO: Implement full Wormhole VAA redemption
  // This requires:
  // 1. Parse VAA
  // 2. Verify signatures
  // 3. Check if already redeemed
  // 4. Transfer tokens to recipient
  
  throw new Error('Solana VAA redemption not yet implemented. Use Wormhole SDK.')
}

/**
 * Get bridge transaction status
 */
export async function getBridgeStatus(txHash: string): Promise<{
  status: 'pending' | 'completed' | 'failed'
  sourceChain: string
  destChain: string
  amount: string
  vaa?: string
}> {
  // In production, query Wormhole API
  // For now, return mock data
  
  return {
    status: 'pending',
    sourceChain: 'polygon',
    destChain: 'solana',
    amount: '0',
  }
}

/**
 * Helper: Convert Solana address to bytes32 for EVM
 */
function solanaAddressToBytes32(address: string): string {
  const pubkey = new PublicKey(address)
  return '0x' + Buffer.from(pubkey.toBytes()).toString('hex')
}

/**
 * Helper: Convert EVM address to Solana format
 */
export function evmAddressToSolana(address: string): PublicKey {
  // Remove 0x prefix and pad to 32 bytes
  const hex = address.replace('0x', '').padStart(64, '0')
  const bytes = Buffer.from(hex, 'hex')
  return new PublicKey(bytes)
}

/**
 * Get user's bridged token balance on Solana
 */
export async function getBridgedUSDCBalance(
  connection: Connection,
  userAddress: PublicKey
): Promise<number> {
  try {
    const usdcMint = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_USDC_MINT || '')
    const ata = await getAssociatedTokenAddress(usdcMint, userAddress)
    
    const balance = await connection.getTokenAccountBalance(ata)
    return parseFloat(balance.value.uiAmount?.toString() || '0')
  } catch (error) {
    console.error('Error fetching bridged USDC balance:', error)
    return 0
  }
}

/**
 * Estimate bridge time based on network conditions
 */
export function estimateBridgeTime(
  fromChain: 'polygon' | 'solana',
  toChain: 'polygon' | 'solana'
): string {
  // Wormhole typical times:
  // - Polygon finality: ~64 blocks (~2 minutes)
  // - Solana finality: ~32 slots (~13 seconds)
  // - Guardian signing: ~5 seconds
  // - Total: ~3-5 minutes
  
  if (fromChain === 'polygon') {
    return '3-5 minutes'
  } else {
    return '2-3 minutes'
  }
}
