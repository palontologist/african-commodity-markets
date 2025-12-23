import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const stakeSchema = z.object({
  marketId: z.string(),
  amount: z.number().positive(),
  side: z.enum(['yes', 'no']),
  chain: z.enum(['polygon', 'solana']),
  walletAddress: z.string(),
})

// Helper function to log stake processing details (only in development)
function logStakeDetails(chain: string, data: z.infer<typeof stakeSchema>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Processing ${chain} stake:`, {
      marketId: data.marketId,
      amount: data.amount,
      side: data.side,
      walletAddress: data.walletAddress,
    })
  }
}

// Helper function to create error response
function createErrorResponse(error: unknown, fallbackMessage: string, status: number = 500) {
  const message = error instanceof Error ? error.message : fallbackMessage
  return NextResponse.json({ message }, { status })
}

// Helper function to format environment variable name for user-friendly error messages
function formatEnvVarName(name: string): string {
  return name
    .replace('NEXT_PUBLIC_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
}

// Helper function to check and throw error for missing environment variable
function requireEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`Missing ${name} environment variable`)
    throw new Error(`${formatEnvVarName(name)} not configured`)
  }
  return value
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = stakeSchema.parse(body)

    // Route to appropriate chain handler
    if (data.chain === 'polygon') {
      return await handlePolygonStake(data)
    } else {
      return await handleSolanaStake(data)
    }
  } catch (error) {
    console.error('Stake API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    // Extract error message from Error objects, or use generic fallback
    return createErrorResponse(error, 'Failed to process stake')
  }
}

async function handlePolygonStake(data: z.infer<typeof stakeSchema>) {
  try {
    // Import Polygon SDK
    const { ethers } = await import('ethers')
    const contractABI = (await import('@/lib/blockchain/AIPredictionMarket.abi.json')).default

    // Get and validate required environment variables
    const contractAddress = requireEnvVar('NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS', process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS)
    const usdcAddress = requireEnvVar('NEXT_PUBLIC_USDC_ADDRESS', process.env.NEXT_PUBLIC_USDC_ADDRESS)

    logStakeDetails('Polygon', data)

    // Create provider (this will be called from client, so user signs)
    // In production, you'd use wagmi/viem for client-side signing
    // This endpoint just validates and returns the transaction data
    
    // Convert amount to string to avoid BigInt serialization error
    const amountInBaseUnits = ethers.parseUnits(data.amount.toString(), 6) // USDC has 6 decimals
    
    // For now, return the transaction data that the client needs to sign
    return NextResponse.json({
      success: true,
      message: 'Stake transaction prepared',
      transaction: {
        to: contractAddress,
        method: 'stakePrediction',
        params: {
          predictionId: data.marketId,
          amount: amountInBaseUnits.toString(), // Convert BigInt to string for JSON
          isYes: data.side === 'yes',
        },
      },
    })
  } catch (error: unknown) {
    console.error('Polygon stake error:', error)
    return createErrorResponse(error, 'Failed to stake on Polygon')
  }
}

async function handleSolanaStake(data: z.infer<typeof stakeSchema>) {
  try {
    // Import Solana SDK
    const { Connection, PublicKey, Transaction } = await import('@solana/web3.js')
    const { Program, AnchorProvider, BN } = await import('@coral-xyz/anchor')

    // Get and validate required environment variables
    const programId = requireEnvVar('NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID', process.env.NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID)
    const usdcMint = requireEnvVar('NEXT_PUBLIC_SOLANA_USDC_MINT', process.env.NEXT_PUBLIC_SOLANA_USDC_MINT)
    
    // Get RPC URL (with default fallback)
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

    logStakeDetails('Solana', data)

    // Create connection
    const connection = new Connection(rpcUrl, 'confirmed')

    // Convert amount to lamports (USDC has 6 decimals on Solana)
    const amountLamports = Math.floor(data.amount * 1_000_000)

    // Build transaction instruction data
    // The client will actually build and sign the transaction
    // This endpoint validates and returns the necessary data
    
    return NextResponse.json({
      success: true,
      message: 'Stake transaction prepared',
      transaction: {
        programId: programId,
        instruction: 'buyShares',
        params: {
          amount: amountLamports,
          isYes: data.side === 'yes',
        },
        accounts: {
          market: data.marketId, // Market public key
          user: data.walletAddress,
          usdcMint: usdcMint,
        },
      },
    })
  } catch (error: unknown) {
    console.error('Solana stake error:', error)
    return createErrorResponse(error, 'Failed to stake on Solana')
  }
}
