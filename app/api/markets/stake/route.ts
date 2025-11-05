import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const stakeSchema = z.object({
  marketId: z.string(),
  amount: z.number().positive(),
  side: z.enum(['yes', 'no']),
  chain: z.enum(['polygon', 'solana']),
  walletAddress: z.string(),
})

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

    // Return more detailed error for other errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to process stake'
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

async function handlePolygonStake(data: z.infer<typeof stakeSchema>) {
  try {
    // Import Polygon SDK
    const { ethers } = await import('ethers')
    const contractABI = (await import('@/lib/blockchain/AIPredictionMarket.abi.json')).default

    // Get contract address from env
    const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS
    if (!contractAddress) {
      console.error('Missing NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS environment variable')
      throw new Error('Contract address not configured')
    }

    // Get USDC address
    const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS
    if (!usdcAddress) {
      console.error('Missing NEXT_PUBLIC_USDC_ADDRESS environment variable')
      throw new Error('USDC address not configured')
    }

    // Only log in development to avoid exposing sensitive data in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing Polygon stake:', {
        marketId: data.marketId,
        amount: data.amount,
        side: data.side,
        walletAddress: data.walletAddress,
      })
    }

    // Create provider (this will be called from client, so user signs)
    // In production, you'd use wagmi/viem for client-side signing
    // This endpoint just validates and returns the transaction data
    
    // For now, return the transaction data that the client needs to sign
    return NextResponse.json({
      success: true,
      message: 'Stake transaction prepared',
      transaction: {
        to: contractAddress,
        method: 'stakePrediction',
        params: {
          predictionId: data.marketId,
          amount: ethers.parseUnits(data.amount.toString(), 6), // USDC has 6 decimals
          isYes: data.side === 'yes',
        },
      },
    })
  } catch (error: any) {
    console.error('Polygon stake error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to stake on Polygon' },
      { status: 500 }
    )
  }
}

async function handleSolanaStake(data: z.infer<typeof stakeSchema>) {
  try {
    // Import Solana SDK
    const { Connection, PublicKey, Transaction } = await import('@solana/web3.js')
    const { Program, AnchorProvider, BN } = await import('@coral-xyz/anchor')

    // Get program ID from env
    const programId = process.env.NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID
    if (!programId) {
      console.error('Missing NEXT_PUBLIC_SOLANA_PREDICTION_PROGRAM_ID environment variable')
      throw new Error('Solana program ID not configured')
    }

    // Get RPC URL
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    
    // Get USDC mint
    const usdcMint = process.env.NEXT_PUBLIC_SOLANA_USDC_MINT
    if (!usdcMint) {
      console.error('Missing NEXT_PUBLIC_SOLANA_USDC_MINT environment variable')
      throw new Error('Solana USDC mint not configured')
    }

    // Only log in development to avoid exposing sensitive data in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing Solana stake:', {
        marketId: data.marketId,
        amount: data.amount,
        side: data.side,
        walletAddress: data.walletAddress,
      })
    }

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
  } catch (error: any) {
    console.error('Solana stake error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to stake on Solana' },
      { status: 500 }
    )
  }
}
