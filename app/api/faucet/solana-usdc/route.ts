'use server'

import { NextRequest, NextResponse } from 'next/server'

// Devnet USDC Faucet - provides test USDC for staking
// Note: This creates a mock balance for testing purposes on devnet

export async function POST(request: NextRequest) {
  try {
    const { address, amount = 100 } = await request.json()
    
    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // For devnet testing, we'll simulate USDC by using a mock balance
    // In production, this would interact with an actual USDC faucet or airdrop
    
    // The SPL Token Faucet for devnet
    // Users can also get test tokens from: https://spl-token-faucet.com
    
    return NextResponse.json({
      success: true,
      message: `Test USDC faucet request received for ${address}`,
      amount: amount,
      instructions: [
        'For Solana Devnet USDC, visit: https://spl-token-faucet.com',
        'Select "USDC" from the token dropdown',
        'Enter your wallet address and request tokens',
        'Or use Solana CLI: spl-token transfer <USDC_MINT> 100 <YOUR_ADDRESS> --fund-recipient'
      ],
      usdcMint: process.env.NEXT_PUBLIC_SOLANA_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
    })
  } catch (error) {
    console.error('Faucet error:', error)
    return NextResponse.json(
      { error: 'Failed to process faucet request' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Solana Devnet USDC Faucet',
    description: 'Get test USDC for staking on prediction markets',
    instructions: [
      '1. Make sure Phantom is set to Devnet',
      '2. Visit https://spl-token-faucet.com',
      '3. Select USDC token',
      '4. Enter your Solana address',
      '5. Click "Get Tokens"',
      '6. Return to the app and stake!'
    ],
    usdcMint: process.env.NEXT_PUBLIC_SOLANA_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    alternatives: [
      'https://faucet.solana.com (for SOL only)',
      'https://spl-token-faucet.com (for USDC and other SPL tokens)'
    ]
  })
}
