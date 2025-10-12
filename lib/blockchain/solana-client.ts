/**
 * Solana Blockchain Client
 * Interacts with Solana prediction market and oracle programs
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  getAccount,
} from '@solana/spl-token'
import { AnchorProvider, Program, BN, web3 } from '@coral-xyz/anchor'

// Program IDs (replace with your deployed program IDs)
// Use default placeholder addresses that are valid PublicKeys
const DEFAULT_PROGRAM_ID = '11111111111111111111111111111111'
export const ORACLE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_ORACLE_PROGRAM_ID || DEFAULT_PROGRAM_ID
)
export const MARKET_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_MARKET_PROGRAM_ID || process.env.NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID || DEFAULT_PROGRAM_ID
)
export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' // Devnet USDC
)

export interface SolanaPrediction {
  marketId: number
  commodity: string
  thresholdPrice: number // in cents
  expiryTime: number // unix timestamp
  creationTime: number
  yesPool: number
  noPool: number
  resolved: boolean
  outcome: boolean
  oraclePrice: number
}

export interface SolanaUserPosition {
  yesShares: number
  noShares: number
  claimed: boolean
}

/**
 * Get connection to Solana cluster
 */
export function getConnection(): Connection {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
  return new Connection(rpcUrl, 'confirmed')
}

/**
 * Convert commodity string to 32-byte array
 */
function commodityToBytes(commodity: string): number[] {
  const bytes = new Array(32).fill(0)
  const encoded = new TextEncoder().encode(commodity.toUpperCase())
  for (let i = 0; i < Math.min(encoded.length, 32); i++) {
    bytes[i] = encoded[i]
  }
  return bytes
}

/**
 * Get PDA for market account
 */
export function getMarketPDA(marketId: number): [PublicKey, number] {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('market'), new BN(marketId).toArrayLike(Buffer, 'le', 8)],
    MARKET_PROGRAM_ID
  )
  return [pda, bump]
}

/**
 * Get PDA for oracle price account
 */
export function getOraclePricePDA(commodity: string): [PublicKey, number] {
  const commodityBytes = commodityToBytes(commodity)
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('price'), Buffer.from(commodityBytes)],
    ORACLE_PROGRAM_ID
  )
  return [pda, bump]
}

/**
 * Get PDA for user position
 */
export function getUserPositionPDA(
  marketPubkey: PublicKey,
  userPubkey: PublicKey
): [PublicKey, number] {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('position'), marketPubkey.toBuffer(), userPubkey.toBuffer()],
    MARKET_PROGRAM_ID
  )
  return [pda, bump]
}

/**
 * Get market vault token account
 */
export async function getMarketVault(marketPDA: PublicKey): Promise<PublicKey> {
  return await getAssociatedTokenAddress(USDC_MINT, marketPDA, true)
}

/**
 * Fetch market data from blockchain
 */
export async function getSolanaMarket(marketId: number): Promise<SolanaPrediction | null> {
  try {
    const connection = getConnection()
    const [marketPDA] = getMarketPDA(marketId)
    
    const accountInfo = await connection.getAccountInfo(marketPDA)
    if (!accountInfo) return null
    
    // Parse account data (you'll need to match your Rust struct layout)
    const data = accountInfo.data
    const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength)
    
    // Skip discriminator (8 bytes)
    let offset = 8
    
    const marketIdParsed = Number(dataView.getBigUint64(offset, true))
    offset += 8
    
    const commodityBytes = Array.from(data.slice(offset, offset + 32))
    const commodity = String.fromCharCode(...commodityBytes.filter(b => b !== 0))
    offset += 32
    
    const thresholdPrice = Number(dataView.getBigUint64(offset, true))
    offset += 8
    
    const expiryTime = Number(dataView.getBigInt64(offset, true))
    offset += 8
    
    const creationTime = Number(dataView.getBigInt64(offset, true))
    offset += 8
    
    const yesPool = Number(dataView.getBigUint64(offset, true))
    offset += 8
    
    const noPool = Number(dataView.getBigUint64(offset, true))
    offset += 8
    
    const resolved = Boolean(data[offset])
    offset += 1
    
    const outcome = Boolean(data[offset])
    offset += 1
    
    const resolutionTime = Number(dataView.getBigInt64(offset, true))
    offset += 8
    
    const oraclePrice = Number(dataView.getBigUint64(offset, true))
    
    return {
      marketId: marketIdParsed,
      commodity,
      thresholdPrice,
      expiryTime,
      creationTime,
      yesPool,
      noPool,
      resolved,
      outcome,
      oraclePrice,
    }
  } catch (error) {
    console.error('Failed to fetch Solana market:', error)
    return null
  }
}

/**
 * Get user position in a market
 */
export async function getSolanaUserPosition(
  marketId: number,
  userPubkey: PublicKey
): Promise<SolanaUserPosition | null> {
  try {
    const connection = getConnection()
    const [marketPDA] = getMarketPDA(marketId)
    const [positionPDA] = getUserPositionPDA(marketPDA, userPubkey)
    
    const accountInfo = await connection.getAccountInfo(positionPDA)
    if (!accountInfo) {
      return { yesShares: 0, noShares: 0, claimed: false }
    }
    
    const data = accountInfo.data
    const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength)
    
    let offset = 8 // Skip discriminator
    offset += 32 // Skip user pubkey
    offset += 8 // Skip market_id
    
    const yesShares = Number(dataView.getBigUint64(offset, true))
    offset += 8
    
    const noShares = Number(dataView.getBigUint64(offset, true))
    offset += 8
    
    const claimed = Boolean(data[offset])
    
    return { yesShares, noShares, claimed }
  } catch (error) {
    console.error('Failed to fetch user position:', error)
    return null
  }
}

/**
 * Buy shares in a Solana market
 */
export async function buyShares({
  marketId,
  amount,
  isYes,
  wallet,
}: {
  marketId: number
  amount: number // in USDC (with 6 decimals)
  isYes: boolean
  wallet: any // Solana wallet adapter
}): Promise<string> {
  const connection = getConnection()
  const userPubkey = wallet.publicKey
  
  const [marketPDA] = getMarketPDA(marketId)
  const [positionPDA] = getUserPositionPDA(marketPDA, userPubkey)
  const marketVault = await getMarketVault(marketPDA)
  const userTokenAccount = await getAssociatedTokenAddress(USDC_MINT, userPubkey)
  
  // Build instruction (you'll need to use Anchor IDL for this)
  // For now, this is a placeholder structure
  const instruction = {
    keys: [
      { pubkey: marketPDA, isSigner: false, isWritable: true },
      { pubkey: positionPDA, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: marketVault, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: MARKET_PROGRAM_ID,
    data: Buffer.from([
      /* instruction discriminator + amount + isYes */
    ]),
  }
  
  const transaction = new Transaction().add(instruction as any)
  transaction.feePayer = userPubkey
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  
  const signed = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(signature, 'confirmed')
  
  return signature
}

/**
 * Claim winnings from a resolved market
 */
export async function claimSolanaWinnings({
  marketId,
  wallet,
}: {
  marketId: number
  wallet: any
}): Promise<string> {
  const connection = getConnection()
  const userPubkey = wallet.publicKey
  
  const [marketPDA] = getMarketPDA(marketId)
  const [positionPDA] = getUserPositionPDA(marketPDA, userPubkey)
  const marketVault = await getMarketVault(marketPDA)
  const userTokenAccount = await getAssociatedTokenAddress(USDC_MINT, userPubkey)
  
  // Build claim instruction (placeholder)
  const instruction = {
    keys: [
      { pubkey: marketPDA, isSigner: false, isWritable: false },
      { pubkey: positionPDA, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: marketVault, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: MARKET_PROGRAM_ID,
    data: Buffer.from([/* instruction discriminator */]),
  }
  
  const transaction = new Transaction().add(instruction as any)
  transaction.feePayer = userPubkey
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  
  const signed = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(signature, 'confirmed')
  
  return signature
}

/**
 * Resolve market with oracle price (authority only)
 */
export async function resolveSolanaMarket({
  marketId,
  commodity,
  wallet,
}: {
  marketId: number
  commodity: string
  wallet: any
}): Promise<string> {
  const connection = getConnection()
  const [marketPDA] = getMarketPDA(marketId)
  const [oraclePDA] = getOraclePricePDA(commodity)
  
  // Build resolve instruction (placeholder)
  const instruction = {
    keys: [
      { pubkey: marketPDA, isSigner: false, isWritable: true },
      { pubkey: oraclePDA, isSigner: false, isWritable: false },
      { pubkey: ORACLE_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
    ],
    programId: MARKET_PROGRAM_ID,
    data: Buffer.from([/* instruction discriminator */]),
  }
  
  const transaction = new Transaction().add(instruction as any)
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  
  const signed = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(signature, 'confirmed')
  
  return signature
}

/**
 * Format USDC amount (6 decimals)
 */
export function formatSolanaUSDC(amount: number): string {
  return (amount / 1_000_000).toFixed(2)
}

/**
 * Parse USDC amount to raw value
 */
export function parseSolanaUSDC(amount: string): number {
  return Math.floor(parseFloat(amount) * 1_000_000)
}
