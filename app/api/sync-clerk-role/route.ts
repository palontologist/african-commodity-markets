import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { syncClerkRoleFromTurso } from '@/utils/sync-roles'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { walletAddress } = await request.json()
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }
    
    await syncClerkRoleFromTurso(userId, walletAddress)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to sync role:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
