import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')
    const chain = searchParams.get('chain')

    if (!address || !chain) {
      return NextResponse.json(
        { error: 'Missing address or chain parameter' },
        { status: 400 }
      )
    }

    if (chain === 'polygon') {
      return await getPolygonUSDCBalance(address)
    } else if (chain === 'solana') {
      return await getSolanaUSDCBalance(address)
    } else {
      return NextResponse.json(
        { error: 'Invalid chain' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Balance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}

async function getPolygonUSDCBalance(address: string) {
  try {
    const { ethers } = await import('ethers')
    
    const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS
    if (!usdcAddress) {
      throw new Error('USDC address not configured')
    }

    const rpcUrl = process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology'
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    // ERC-20 balanceOf ABI
    const erc20ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ]

    const contract = new ethers.Contract(usdcAddress, erc20ABI, provider)
    const balance = await contract.balanceOf(address)
    const decimals = await contract.decimals()

    // Convert to human-readable format
    const balanceFormatted = parseFloat(ethers.formatUnits(balance, decimals))

    return NextResponse.json({
      balance: balanceFormatted,
      raw: balance.toString(),
      decimals: Number(decimals),
      chain: 'polygon',
    })
  } catch (error: any) {
    console.error('Polygon balance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Polygon USDC balance', balance: 0 },
      { status: 200 } // Return 200 with 0 balance on error
    )
  }
}

async function getSolanaUSDCBalance(address: string) {
  try {
    const { Connection, PublicKey } = await import('@solana/web3.js')
    const { getAssociatedTokenAddress, getAccount } = await import('@solana/spl-token')
    
    const usdcMint = process.env.NEXT_PUBLIC_SOLANA_USDC_MINT
    if (!usdcMint) {
      console.error('Missing NEXT_PUBLIC_SOLANA_USDC_MINT environment variable')
      throw new Error('Solana USDC mint not configured')
    }

    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    const connection = new Connection(rpcUrl, 'confirmed')

    // Log configuration for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching Solana USDC balance:', {
        address,
        usdcMint,
        rpcUrl,
      })
    }

    const ownerPublicKey = new PublicKey(address)
    const mintPublicKey = new PublicKey(usdcMint)

    // Get associated token account
    const tokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      ownerPublicKey
    )

    try {
      const accountInfo = await getAccount(connection, tokenAccount)
      
      // USDC has 6 decimals on Solana
      const balance = Number(accountInfo.amount) / 1_000_000

      if (process.env.NODE_ENV === 'development') {
        console.log('Solana USDC balance found:', balance, 'USDC')
      }

      return NextResponse.json({
        balance: balance,
        raw: accountInfo.amount.toString(),
        decimals: 6,
        chain: 'solana',
        tokenAccount: tokenAccount.toBase58(),
      })
    } catch (accountError) {
      // Account doesn't exist yet (no USDC tokens)
      console.log('Solana token account not found for address:', address)
      console.log('Token account would be:', tokenAccount.toBase58())
      console.log('User needs to receive USDC first to create the account')
      
      return NextResponse.json({
        balance: 0,
        raw: '0',
        decimals: 6,
        chain: 'solana',
        tokenAccount: tokenAccount.toBase58(),
        message: 'Token account not found. User needs to receive USDC first.',
      })
    }
  } catch (error: any) {
    console.error('Solana balance error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: 'Failed to fetch Solana USDC balance', balance: 0, details: error.message },
      { status: 200 } // Return 200 with 0 balance on error
    )
  }
}
