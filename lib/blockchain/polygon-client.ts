/**
 * Polygon Blockchain Client
 * Interacts with AIPredictionMarket smart contract
 */

import { ethers } from 'ethers'
import AIPredictionMarketABI from './AIPredictionMarket.abi.json'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS!
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS!
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '80002')

// ERC20 ABI for USDC approval
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
]

export interface OnChainPrediction {
  predictionId: number
  commodity: string
  currentPrice: bigint
  predictedPrice: bigint
  targetDate: bigint
  confidence: bigint
  model: string
  ipfsHash: string
  yesStakes: bigint
  noStakes: bigint
  resolved: boolean
  actualPrice: bigint
}

export interface PredictionOdds {
  yesOdds: number // percentage 0-100
  noOdds: number // percentage 0-100
}

export interface UserPosition {
  yesAmount: bigint
  noAmount: bigint
  claimed: boolean
}

/**
 * Get a read-only contract instance for querying data
 */
export function getReadContract() {
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology'
  )
  return new ethers.Contract(CONTRACT_ADDRESS, AIPredictionMarketABI.abi, provider)
}

/**
 * Get a contract instance with signer for transactions
 */
export function getWriteContract(signer: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, AIPredictionMarketABI.abi, signer)
}

/**
 * Get USDC contract instance
 */
export function getUSDCContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signerOrProvider)
}

/**
 * Create a prediction on-chain (called by backend)
 */
export async function createPrediction({
  commodity,
  currentPrice,
  predictedPrice,
  targetDate,
  confidence,
  model,
  ipfsHash,
  signer
}: {
  commodity: string
  currentPrice: number // in cents
  predictedPrice: number // in cents
  targetDate: Date
  confidence: number // 0-100
  model: string
  ipfsHash: string
  signer: ethers.Signer
}): Promise<{ predictionId: number; txHash: string }> {
  const contract = getWriteContract(signer)

  // Convert prices from cents to contract format (keep as is)
  const currentPriceWei = BigInt(Math.round(currentPrice))
  const predictedPriceWei = BigInt(Math.round(predictedPrice))
  const targetTimestamp = BigInt(Math.floor(targetDate.getTime() / 1000))
  const confidencePercent = BigInt(Math.round(confidence))

  const tx = await contract.createPrediction(
    commodity,
    currentPriceWei,
    predictedPriceWei,
    targetTimestamp,
    confidencePercent,
    model,
    ipfsHash
  )

  const receipt = await tx.wait()

  // Extract prediction ID from event
  const event = receipt.logs.find(
    (log: any) => log.topics[0] === ethers.id('PredictionCreated(uint256,string,uint256,uint256,uint256)')
  )

  let predictionId = 0
  if (event) {
    const decodedEvent = contract.interface.parseLog(event)
    predictionId = Number(decodedEvent?.args[0] || 0)
  }

  return {
    predictionId,
    txHash: receipt.hash
  }
}

/**
 * Approve USDC spending for staking
 */
export async function approveUSDC(amount: bigint, signer: ethers.Signer): Promise<string> {
  const usdc = getUSDCContract(signer)
  const tx = await usdc.approve(CONTRACT_ADDRESS, amount)
  const receipt = await tx.wait()
  return receipt.hash
}

/**
 * Check USDC allowance
 */
export async function checkAllowance(owner: string, provider: ethers.Provider): Promise<bigint> {
  const usdc = getUSDCContract(provider)
  return await usdc.allowance(owner, CONTRACT_ADDRESS)
}

/**
 * Get USDC balance
 */
export async function getUSDCBalance(address: string, provider: ethers.Provider): Promise<bigint> {
  const usdc = getUSDCContract(provider)
  return await usdc.balanceOf(address)
}

/**
 * Stake on a prediction
 */
export async function stakePrediction({
  predictionId,
  isYes,
  amount,
  signer
}: {
  predictionId: number
  isYes: boolean
  amount: bigint
  signer: ethers.Signer
}): Promise<string> {
  // Check/approve USDC first
  const address = await signer.getAddress()
  const provider = signer.provider!
  const allowance = await checkAllowance(address, provider)

  if (allowance < amount) {
    await approveUSDC(amount, signer)
  }

  const contract = getWriteContract(signer)
  const tx = await contract.stake(predictionId, isYes, amount)
  const receipt = await tx.wait()
  return receipt.hash
}

/**
 * Get prediction details from blockchain
 */
export async function getPrediction(predictionId: number): Promise<OnChainPrediction> {
  const contract = getReadContract()
  const prediction = await contract.getPrediction(predictionId)

  return {
    predictionId,
    commodity: prediction.commodity,
    currentPrice: prediction.currentPrice,
    predictedPrice: prediction.predictedPrice,
    targetDate: prediction.targetDate,
    confidence: prediction.confidence,
    model: prediction.model,
    ipfsHash: prediction.ipfsHash,
    yesStakes: prediction.yesStakes,
    noStakes: prediction.noStakes,
    resolved: prediction.resolved,
    actualPrice: prediction.actualPrice
  }
}

/**
 * Get current odds for a prediction
 */
export async function getOdds(predictionId: number): Promise<PredictionOdds> {
  const contract = getReadContract()
  const odds = await contract.getOdds(predictionId)

  return {
    yesOdds: Number(odds[0]) / 100, // Convert basis points to percentage
    noOdds: Number(odds[1]) / 100
  }
}

/**
 * Calculate potential payout
 */
export async function calculatePayout(
  predictionId: number,
  isYes: boolean,
  amount: bigint
): Promise<bigint> {
  const contract = getReadContract()
  return await contract.calculatePayout(predictionId, isYes, amount)
}

/**
 * Get user's position in a prediction
 */
export async function getUserPosition(predictionId: number, userAddress: string): Promise<UserPosition> {
  const contract = getReadContract()
  const position = await contract.getPosition(predictionId, userAddress)

  return {
    yesAmount: position.yesAmount,
    noAmount: position.noAmount,
    claimed: position.claimed
  }
}

/**
 * Claim winnings from a resolved prediction
 */
export async function claimWinnings(predictionId: number, signer: ethers.Signer): Promise<string> {
  const contract = getWriteContract(signer)
  const tx = await contract.claimWinnings(predictionId)
  const receipt = await tx.wait()
  return receipt.hash
}

/**
 * Resolve a prediction (oracle only)
 */
export async function resolvePrediction({
  predictionId,
  actualPrice,
  signer
}: {
  predictionId: number
  actualPrice: number // in cents
  signer: ethers.Signer
}): Promise<string> {
  const contract = getWriteContract(signer)
  const actualPriceWei = BigInt(Math.round(actualPrice))

  const tx = await contract.resolvePrediction(predictionId, actualPriceWei)
  const receipt = await tx.wait()
  return receipt.hash
}

/**
 * Format USDC amount for display (6 decimals)
 */
export function formatUSDC(amount: bigint): string {
  return ethers.formatUnits(amount, 6)
}

/**
 * Parse USDC amount from user input
 */
export function parseUSDC(amount: string): bigint {
  return ethers.parseUnits(amount, 6)
}

/**
 * Format price in cents to dollars
 */
export function formatPrice(priceInCents: bigint): string {
  return (Number(priceInCents) / 100).toFixed(2)
}
