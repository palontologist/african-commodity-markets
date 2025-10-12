/**
 * Unified Blockchain Client
 * Abstracts Polygon and Solana implementations behind a single interface
 */

import * as Polygon from './polygon-client'
import * as Solana from './solana-client'

export type SupportedChain = 'polygon' | 'solana'

export interface UnifiedPrediction {
  id: string // Chain prefix + market ID
  chain: SupportedChain
  marketId: number
  commodity: string
  currentPrice?: number
  predictedPrice?: number
  thresholdPrice: number
  targetDate: number
  yesStakes: number
  noStakes: number
  resolved: boolean
  outcome?: boolean
  oraclePrice?: number
  confidence?: number // AI confidence 0-100
}

export interface UnifiedPosition {
  yesAmount: number
  noAmount: number
  claimed: boolean
}

export interface UnifiedOdds {
  yesOdds: number // 0-100
  noOdds: number // 0-100
}

/**
 * Get prediction from either chain
 */
export async function getPrediction(
  id: string,
  chain: SupportedChain
): Promise<UnifiedPrediction | null> {
  const marketId = parseInt(id.split('-').pop() || '0')
  
  if (chain === 'polygon') {
    const pred = await Polygon.getPrediction(marketId)
    return {
      id: `polygon-${pred.predictionId}`,
      chain: 'polygon',
      marketId: pred.predictionId,
      commodity: pred.commodity,
      currentPrice: Number(pred.currentPrice),
      predictedPrice: Number(pred.predictedPrice),
      thresholdPrice: Number(pred.predictedPrice),
      targetDate: Number(pred.targetDate),
      yesStakes: Number(pred.yesStakes),
      noStakes: Number(pred.noStakes),
      resolved: pred.resolved,
      outcome: pred.resolved ? (Number(pred.actualPrice) >= Number(pred.predictedPrice)) : undefined,
      oraclePrice: pred.resolved ? Number(pred.actualPrice) : undefined,
      confidence: Number(pred.confidence || 80), // Default to 80 if not available
    }
  } else {
    const market = await Solana.getSolanaMarket(marketId)
    if (!market) return null
    
    return {
      id: `solana-${market.marketId}`,
      chain: 'solana',
      marketId: market.marketId,
      commodity: market.commodity,
      thresholdPrice: market.thresholdPrice,
      targetDate: market.expiryTime,
      yesStakes: market.yesPool,
      noStakes: market.noPool,
      resolved: market.resolved,
      outcome: market.outcome,
      oraclePrice: market.oraclePrice,
      confidence: 75, // Default confidence for Solana markets
    }
  }
}

/**
 * Get user position on either chain
 */
export async function getUserPosition(
  id: string,
  chain: SupportedChain,
  userAddress: string | any
): Promise<UnifiedPosition> {
  const marketId = parseInt(id.split('-').pop() || '0')
  
  if (chain === 'polygon') {
    const pos = await Polygon.getUserPosition(marketId, userAddress as string)
    return {
      yesAmount: Number(pos.yesAmount),
      noAmount: Number(pos.noAmount),
      claimed: pos.claimed,
    }
  } else {
    // userAddress is Solana PublicKey here
    const pos = await Solana.getSolanaUserPosition(marketId, userAddress)
    if (!pos) return { yesAmount: 0, noAmount: 0, claimed: false }
    
    return {
      yesAmount: pos.yesShares,
      noAmount: pos.noShares,
      claimed: pos.claimed,
    }
  }
}

/**
 * Calculate odds based on pool sizes
 */
export function calculateOdds(yesStakes: number, noStakes: number): UnifiedOdds {
  const total = yesStakes + noStakes
  if (total === 0) {
    return { yesOdds: 50, noOdds: 50 }
  }
  
  const yesOdds = Math.round((yesStakes / total) * 100)
  const noOdds = 100 - yesOdds
  
  return { yesOdds, noOdds }
}

/**
 * Get current odds for a market
 */
export async function getOdds(id: string, chain: SupportedChain): Promise<UnifiedOdds> {
  const marketId = parseInt(id.split('-').pop() || '0')
  
  if (chain === 'polygon') {
    const odds = await Polygon.getOdds(marketId)
    return odds
  } else {
    const market = await Solana.getSolanaMarket(marketId)
    if (!market) return { yesOdds: 50, noOdds: 50 }
    return calculateOdds(market.yesPool, market.noPool)
  }
}

/**
 * Calculate potential payout for a stake
 */
export async function calculatePayout(
  id: string,
  chain: SupportedChain,
  isYes: boolean,
  amount: bigint
): Promise<bigint> {
  const marketId = parseInt(id.split('-').pop() || '0')
  
  if (chain === 'polygon') {
    return await Polygon.calculatePayout(marketId, isYes, amount)
  } else {
    // For Solana, we need to simulate the AMM calculation
    const market = await Solana.getSolanaMarket(marketId)
    if (!market) return BigInt(0)
    
    const amountNum = Number(amount) / 1_000_000 // Convert to USDC units
    const yesPool = market.yesPool
    const noPool = market.noPool
    const totalPool = yesPool + noPool + amountNum
    
    // Calculate share of pool after adding stake
    const userPoolShare = amountNum / totalPool
    const potentialPayout = totalPool * userPoolShare * 0.98 // 2% fee
    
    return BigInt(Math.round(potentialPayout * 1_000_000))
  }
}

/**
 * Stake on a prediction (either chain)
 */
export async function stakePrediction({
  id,
  chain,
  isYes,
  amount,
  signer,
}: {
  id: string
  chain: SupportedChain
  isYes: boolean
  amount: string // User-friendly amount like "10.5"
  signer: any // ethers.Signer or Solana wallet
}): Promise<string> {
  const marketId = parseInt(id.split('-').pop() || '0')
  
  if (chain === 'polygon') {
    const amountBigInt = Polygon.parseUSDC(amount)
    return await Polygon.stakePrediction({
      predictionId: marketId,
      isYes,
      amount: amountBigInt,
      signer,
    })
  } else {
    const amountRaw = Solana.parseSolanaUSDC(amount)
    return await Solana.buyShares({
      marketId,
      amount: amountRaw,
      isYes,
      wallet: signer,
    })
  }
}

/**
 * Claim winnings (either chain)
 */
export async function claimWinnings({
  id,
  chain,
  signer,
}: {
  id: string
  chain: SupportedChain
  signer: any
}): Promise<string> {
  const marketId = parseInt(id.split('-').pop() || '0')
  
  if (chain === 'polygon') {
    return await Polygon.claimWinnings(marketId, signer)
  } else {
    return await Solana.claimSolanaWinnings({ marketId, wallet: signer })
  }
}

/**
 * Resolve market with oracle (authority only)
 */
export async function resolveMarket({
  id,
  chain,
  commodity,
  actualPrice,
  signer,
}: {
  id: string
  chain: SupportedChain
  commodity: string
  actualPrice: number // in cents
  signer: any
}): Promise<string> {
  const marketId = parseInt(id.split('-').pop() || '0')
  
  if (chain === 'polygon') {
    return await Polygon.resolvePrediction({
      predictionId: marketId,
      actualPrice,
      signer,
    })
  } else {
    return await Solana.resolveSolanaMarket({
      marketId,
      commodity,
      wallet: signer,
    })
  }
}

/**
 * Format USDC for display
 */
export function formatUSDC(amount: number | bigint, chain: SupportedChain): string {
  if (chain === 'polygon') {
    return Polygon.formatUSDC(BigInt(amount))
  } else {
    return Solana.formatSolanaUSDC(Number(amount))
  }
}

/**
 * Get chain explorer URL
 */
export function getExplorerUrl(txHash: string, chain: SupportedChain): string {
  if (chain === 'polygon') {
    const network = process.env.NEXT_PUBLIC_CHAIN_ID === '137' ? '' : 'amoy.'
    return `https://${network}polygonscan.com/tx/${txHash}`
  } else {
    const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'devnet'
    return `https://explorer.solana.com/tx/${txHash}?cluster=${cluster}`
  }
}
