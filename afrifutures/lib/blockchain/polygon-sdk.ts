/**
 * Polygon Prediction Market SDK
 * Interact with Polygon oracle and prediction market contracts
 */

import { ethers } from 'ethers'

// Import ABIs (will be generated from contracts)
import ORACLE_ABI from './abis/CommodityOracle.json'
import MARKET_ABI from './abis/PredictionMarket.json'

export interface PolygonPriceData {
  price: bigint // in cents
  confidence: number // 0-100
  timestamp: bigint
  updater: string
  updateCount: bigint
}

export interface PolygonMarket {
  commodity: string
  thresholdPrice: bigint
  expiryTime: bigint
  creationTime: bigint
  yesPool: bigint
  noPool: bigint
  resolved: boolean
  outcome: boolean
  resolutionTime: bigint
  oraclePrice: bigint
  creator: string
}

export interface PolygonPosition {
  yesShares: bigint
  noShares: bigint
  claimed: boolean
}

// Contract addresses (update after deployment)
export const POLYGON_CONTRACTS = {
  ORACLE: '0x0000000000000000000000000000000000000000',
  MARKET: '0x0000000000000000000000000000000000000000',
  USDC: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23', // Mumbai testnet
}

/**
 * Get oracle contract instance
 */
export function getOracleContract(
  providerOrSigner: ethers.Provider | ethers.Signer
): ethers.Contract {
  return new ethers.Contract(POLYGON_CONTRACTS.ORACLE, ORACLE_ABI, providerOrSigner)
}

/**
 * Get market contract instance
 */
export function getMarketContract(
  providerOrSigner: ethers.Provider | ethers.Signer
): ethers.Contract {
  return new ethers.Contract(POLYGON_CONTRACTS.MARKET, MARKET_ABI, providerOrSigner)
}

/**
 * Convert commodity string to bytes32
 */
export function commodityToBytes32(commodity: string): string {
  return ethers.id(commodity.toUpperCase())
}

/**
 * Fetch oracle price
 */
export async function getOraclePrice(
  provider: ethers.Provider,
  commodity: string
): Promise<PolygonPriceData | null> {
  try {
    const oracle = getOracleContract(provider)
    const commodityBytes = commodityToBytes32(commodity)
    
    const [price, confidence, timestamp] = await oracle.getPrice(commodityBytes)
    
    return {
      price,
      confidence,
      timestamp,
      updater: '0x0', // Would need to query from storage
      updateCount: 0n,
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
  provider: ethers.Provider,
  marketId: number
): Promise<PolygonMarket | null> {
  try {
    const market = getMarketContract(provider)
    const data = await market.getMarket(marketId)
    
    return {
      commodity: data.commodity,
      thresholdPrice: data.thresholdPrice,
      expiryTime: data.expiryTime,
      creationTime: data.creationTime,
      yesPool: data.yesPool,
      noPool: data.noPool,
      resolved: data.resolved,
      outcome: data.outcome,
      resolutionTime: data.resolutionTime,
      oraclePrice: data.oraclePrice,
      creator: data.creator,
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
  provider: ethers.Provider,
  marketId: number,
  userAddress: string
): Promise<PolygonPosition | null> {
  try {
    const market = getMarketContract(provider)
    const data = await market.getPosition(marketId, userAddress)
    
    return {
      yesShares: data.yesShares,
      noShares: data.noShares,
      claimed: data.claimed,
    }
  } catch (error) {
    console.error('Error fetching position:', error)
    return null
  }
}

/**
 * Calculate odds for a market
 */
export async function getOdds(
  provider: ethers.Provider,
  marketId: number
): Promise<{ yesOdds: number; noOdds: number } | null> {
  try {
    const market = getMarketContract(provider)
    const [yesOdds, noOdds] = await market.getOdds(marketId)
    
    return {
      yesOdds: Number(yesOdds),
      noOdds: Number(noOdds),
    }
  } catch (error) {
    console.error('Error fetching odds:', error)
    return null
  }
}

/**
 * Buy shares in a market
 */
export async function buyShares(
  signer: ethers.Signer,
  marketId: number,
  amount: bigint,
  isYes: boolean
): Promise<ethers.ContractTransactionResponse> {
  const market = getMarketContract(signer)
  return await market.buyShares(marketId, amount, isYes)
}

/**
 * Resolve a market
 */
export async function resolveMarket(
  signer: ethers.Signer,
  marketId: number
): Promise<ethers.ContractTransactionResponse> {
  const market = getMarketContract(signer)
  return await market.resolveMarket(marketId)
}

/**
 * Claim winnings
 */
export async function claimWinnings(
  signer: ethers.Signer,
  marketId: number
): Promise<ethers.ContractTransactionResponse> {
  const market = getMarketContract(signer)
  return await market.claimWinnings(marketId)
}

/**
 * Format USDC amount (6 decimals)
 */
export function formatUSDC(amount: bigint): string {
  return ethers.formatUnits(amount, 6)
}

/**
 * Parse USDC amount (6 decimals)
 */
export function parseUSDC(amount: string): bigint {
  return ethers.parseUnits(amount, 6)
}
