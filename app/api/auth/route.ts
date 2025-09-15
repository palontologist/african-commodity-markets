import { NextRequest, NextResponse } from 'next/server'
import { sign, verify } from 'jsonwebtoken'

// Mock user database - in production this would be a real database
const users: Record<string, any> = {}

// Simple JWT secret - in production this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

// Mock wallet addresses for demo
const mockWalletAddresses = [
  '0x742d35Cc6634C0532925a3b8D01eF3F99',
  '0x5aAeb6053F3E94C9b9A09f33669435E71',
  '0x6853C8398d542C684E096D14F0F12C88a',
  '0x4B20993Bc481177ec7E8f571ceCaE8A9e',
]

function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateJWT(userId: string) {
  return sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, walletAddress, token } = body
    
    if (action === 'connect') {
      // Wallet connection logic
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        )
      }
      
      // Check if user already exists
      let user = Object.values(users).find((u: any) => u.walletAddress === walletAddress)
      
      if (!user) {
        // Create new user
        const userId = generateUserId()
        user = {
          id: userId,
          walletAddress,
          balance: 1000, // Starting demo balance in USD
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          profile: {
            username: `trader_${walletAddress.slice(-6)}`,
            totalTrades: 0,
            winRate: 0,
            isVerified: false,
          }
        }
        users[userId] = user
      } else {
        // Update last login
        user.lastLogin = new Date().toISOString()
      }
      
      const token = generateJWT(user.id)
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          balance: user.balance,
          profile: user.profile,
        },
        token,
        message: 'Wallet connected successfully',
      })
      
    } else if (action === 'verify') {
      // Token verification
      if (!token) {
        return NextResponse.json(
          { error: 'Token is required' },
          { status: 400 }
        )
      }
      
      try {
        const decoded = verify(token, JWT_SECRET) as any
        const user = users[decoded.userId]
        
        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }
        
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            balance: user.balance,
            profile: user.profile,
          },
          message: 'Token verified successfully',
        })
        
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }
      
    } else if (action === 'disconnect') {
      // For demo purposes, we just return success
      // In production, you might want to invalidate the token
      return NextResponse.json({
        success: true,
        message: 'Wallet disconnected successfully',
      })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'demo-wallet') {
      // Return a random demo wallet address for testing
      const randomWallet = mockWalletAddresses[Math.floor(Math.random() * mockWalletAddresses.length)]
      return NextResponse.json({
        walletAddress: randomWallet,
        message: 'Demo wallet generated for testing',
      })
    }
    
    if (action === 'stats') {
      // Return platform statistics
      const totalUsers = Object.keys(users).length
      const totalTrades = Object.values(users).reduce((sum, user: any) => sum + (user.profile?.totalTrades || 0), 0)
      const averageBalance = totalUsers > 0 
        ? Object.values(users).reduce((sum, user: any) => sum + user.balance, 0) / totalUsers
        : 0
      
      return NextResponse.json({
        totalUsers,
        totalTrades,
        averageBalance: parseFloat(averageBalance.toFixed(2)),
        activeUsers: Object.values(users).filter((user: any) => {
          const lastLogin = new Date(user.lastLogin)
          const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceLogin <= 7
        }).length,
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Auth GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}