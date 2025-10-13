/**
 * Solana Prediction Market SDK
 * Interact with Solana oracle and prediction market programs
 */

import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor'

export interface SolanaPriceData {
  commodity: string
  price: number // in cents
  confidence: number // 0-100
  timestamp: number
  lastUpdater: PublicKey
  updateCount: number
}

export interface SolanaMarket {
  marketId: number
  commodity: string
  thresholdPrice: number // in cents
  expiryTime: number
  creationTime: number
  yesPool: number
  noPool: number
  resolved: boolean
  outcome: boolean
  resolutionTime: number
  oraclePrice: number
  authority: PublicKey
}

export interface SolanaPosition {
  user: PublicKey
  marketId: number
  yesShares: number
  noShares: number
  claimed: boolean
}

export const ORACLE_PROGRAM_ID = new PublicKey('ora1exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
export const MARKET_PROGRAM_ID = new PublicKey('mkt1exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')

/**
 * Get price oracle PDA
 */
export function getPriceOraclePDA(commodity: string): [PublicKey, number] {
  const commodityBuffer = Buffer.alloc(32)
  commodityBuffer.write(commodity)
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('price'), commodityBuffer],
    ORACLE_PROGRAM_ID
  )
}

/**
 * Get market PDA
 */
export function getMarketPDA(marketId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('market'), new BN(marketId).toArrayLike(Buffer, 'le', 8)],
    MARKET_PROGRAM_ID
  )
}

/**
 * Get position PDA
 */
export function getPositionPDA(marketPubkey: PublicKey, userPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('position'), marketPubkey.toBuffer(), userPubkey.toBuffer()],
    MARKET_PROGRAM_ID
  )
}

/**
 * Fetch oracle price
 */
export async function getOraclePrice(
  connection: Connection,
  commodity: string
): Promise<SolanaPriceData | null> {
  try {
    const [pricePDA] = getPriceOraclePDA(commodity)
    const accountInfo = await connection.getAccountInfo(pricePDA)
    
    if (!accountInfo) return null
    
    // Parse account data (simplified - use IDL in production)
    const data = accountInfo.data
    
    return {
      commodity,
      price: data.readBigUInt64LE(32) as unknown as number,
      confidence: data.readUInt8(40),
      timestamp: data.readBigInt64LE(41) as unknown as number,
      lastUpdater: new PublicKey(data.subarray(49, 81)),
      updateCount: data.readBigUInt64LE(81) as unknown as number,
    }
  } catch (error) {
    console.error('Error fetching oracle price:', error)
    return null
  }
}

/**
 * Fetch market data
 */
export async function getMarket(
  connection: Connection,
  marketId: number
): Promise<SolanaMarket | null> {
  try {
    const [marketPDA] = getMarketPDA(marketId)
    const accountInfo = await connection.getAccountInfo(marketPDA)
    
    if (!accountInfo) return null
    
    // Parse account data (simplified - use IDL in production)
    const data = accountInfo.data
    
    const commodityBytes = data.subarray(8, 40)
    const commodity = commodityBytes.toString('utf8').replace(/\0/g, '')
    
    return {
      marketId,
      commodity,
      thresholdPrice: data.readBigUInt64LE(40) as unknown as number,
      expiryTime: data.readBigInt64LE(48) as unknown as number,
      creationTime: data.readBigInt64LE(56) as unknown as number,
      yesPool: data.readBigUInt64LE(64) as unknown as number,
      noPool: data.readBigUInt64LE(72) as unknown as number,
      resolved: data.readUInt8(80) === 1,
      outcome: data.readUInt8(81) === 1,
      resolutionTime: data.readBigInt64LE(82) as unknown as number,
      oraclePrice: data.readBigUInt64LE(90) as unknown as number,
      authority: new PublicKey(data.subarray(98, 130)),
    }
  } catch (error) {
    console.error('Error fetching market:', error)
    return null
  }
}

/**
 * Fetch user position
 */
export async function getPosition(
  connection: Connection,
  marketId: number,
  userPubkey: PublicKey
): Promise<SolanaPosition | null> {
  try {
    const [marketPDA] = getMarketPDA(marketId)
    const [positionPDA] = getPositionPDA(marketPDA, userPubkey)
    const accountInfo = await connection.getAccountInfo(positionPDA)
    
    if (!accountInfo) return null
    
    const data = accountInfo.data
    
    return {
      user: new PublicKey(data.subarray(8, 40)),
      marketId: data.readBigUInt64LE(40) as unknown as number,
      yesShares: data.readBigUInt64LE(48) as unknown as number,
      noShares: data.readBigUInt64LE(56) as unknown as number,
      claimed: data.readUInt8(64) === 1,
    }
  } catch (error) {
    console.error('Error fetching position:', error)
    return null
  }
}

/**
 * Helper to convert commodity string to bytes32
 */
export function commodityToBytes(commodity: string): Buffer {
  const buffer = Buffer.alloc(32)
  buffer.write(commodity.toUpperCase())
  return buffer
}
