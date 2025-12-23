'use server'

import { clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function syncClerkRoleFromTurso(userId: string, walletAddress: string) {
  if (!db) {
    console.warn('Database not available, skipping role sync')
    return
  }

  const client = await clerkClient()
  
  try {
    // Get active role from Turso
    const profiles = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1)
    
    if (profiles.length > 0) {
      const profile = profiles[0]
      
      // Map Turso roles to Clerk roles
      const roleMap: Record<string, string> = {
        'PUBLIC': 'trader', // Default public users get trader role
        'FARMER': 'farmer',
        'TRADER': 'trader',
        'COOPERATIVE': 'cooperative',
        'ADMIN': 'admin',
      }
      
      const clerkRole = roleMap[profile.activeRole] || 'trader'
      
      // Sync to Clerk
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: clerkRole }
      })
      
      console.log(`Synced role for user ${userId}: ${profile.activeRole} -> ${clerkRole}`)
    }
  } catch (error) {
    console.error('Failed to sync role from Turso to Clerk:', error)
    throw error
  }
}

export async function syncClerkRoleOnSwitch(userId: string, newRole: string) {
  const client = await clerkClient()
  
  try {
    // Map Turso roles to Clerk roles
    const roleMap: Record<string, string> = {
      'PUBLIC': 'trader',
      'FARMER': 'farmer',
      'TRADER': 'trader',
      'COOPERATIVE': 'cooperative',
      'ADMIN': 'admin',
    }
    
    const clerkRole = roleMap[newRole] || 'trader'
    
    // Update Clerk metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: clerkRole }
    })
    
    console.log(`Role switched for user ${userId}: ${newRole} -> ${clerkRole}`)
    return { success: true, role: clerkRole }
  } catch (error) {
    console.error('Failed to sync role switch to Clerk:', error)
    throw error
  }
}
