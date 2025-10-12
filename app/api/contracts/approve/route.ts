import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const approveSchema = z.object({
  address: z.string(),
  amount: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = approveSchema.parse(body)

    const { ethers } = await import('ethers')
    
    const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS

    if (!usdcAddress || !contractAddress) {
      throw new Error('Contract addresses not configured')
    }

    // Return transaction data for client to sign
    // We can't sign transactions server-side for security reasons
    // The client will use wagmi/viem to execute this
    
    // Approve a large amount (or unlimited) so user doesn't need to approve every time
    const approveAmount = ethers.MaxUint256 // Unlimited approval (common pattern)
    // Or use a specific amount: ethers.parseUnits(data.amount || '10000', 6)

    return NextResponse.json({
      success: true,
      message: 'Approval transaction prepared',
      transaction: {
        to: usdcAddress,
        method: 'approve',
        params: {
          spender: contractAddress,
          amount: approveAmount.toString(),
        },
        data: {
          // ERC-20 approve function signature
          // This can be used with wagmi's writeContract
          abi: [
            {
              name: 'approve',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
              outputs: [{ name: '', type: 'bool' }],
            },
          ],
          functionName: 'approve',
          args: [contractAddress, approveAmount],
        },
      },
    })
  } catch (error: any) {
    console.error('Approve API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to prepare approval' },
      { status: 500 }
    )
  }
}
