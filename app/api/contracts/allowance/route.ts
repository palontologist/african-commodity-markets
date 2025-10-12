import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      )
    }

    const { ethers } = await import('ethers')
    
    const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS

    if (!usdcAddress || !contractAddress) {
      throw new Error('Contract addresses not configured')
    }

    const rpcUrl = process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology'
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    // ERC-20 allowance ABI
    const erc20ABI = [
      'function allowance(address owner, address spender) view returns (uint256)',
    ]

    const contract = new ethers.Contract(usdcAddress, erc20ABI, provider)
    const allowance = await contract.allowance(address, contractAddress)

    // Check if allowance is sufficient (we check for > 1000 USDC worth)
    const minAllowance = ethers.parseUnits('1000', 6) // 1000 USDC
    const needsApproval = allowance < minAllowance

    return NextResponse.json({
      allowance: ethers.formatUnits(allowance, 6),
      needsApproval: needsApproval,
      raw: allowance.toString(),
    })
  } catch (error: any) {
    console.error('Allowance check error:', error)
    return NextResponse.json(
      { error: 'Failed to check allowance', needsApproval: true },
      { status: 200 }
    )
  }
}
