import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const walletAddress = searchParams.get('walletAddress')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }

  try {
    const profiles = await db
      .select()
      .from(userProfiles)
      .where(
        walletAddress
          ? and(eq(userProfiles.userId, userId), eq(userProfiles.walletAddress, walletAddress))
          : eq(userProfiles.userId, userId)
      )
      .limit(1)

    if (profiles.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profile = profiles[0]
    return NextResponse.json({
      ...profile,
      roles: JSON.parse(profile.roles),
      metadata: profile.metadata ? JSON.parse(profile.metadata) : undefined,
    })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// POST - Create new profile
export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { userId, walletAddress, roles = ['PUBLIC'], activeRole = 'PUBLIC' } = body

    if (!userId || !walletAddress) {
      return NextResponse.json(
        { error: 'userId and walletAddress are required' },
        { status: 400 }
      )
    }

    // Check if profile already exists
    const existing = await db
      .select()
      .from(userProfiles)
      .where(
        and(eq(userProfiles.userId, userId), eq(userProfiles.walletAddress, walletAddress))
      )
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        {
          ...existing[0],
          roles: JSON.parse(existing[0].roles),
          metadata: existing[0].metadata ? JSON.parse(existing[0].metadata) : undefined,
        },
        { status: 200 }
      )
    }

    // Create new profile
    const newProfile = await db.insert(userProfiles).values({
      id: nanoid(),
      userId,
      walletAddress,
      roles: JSON.stringify(roles),
      activeRole,
      dvcScore: 0,
      kycVerified: false,
    }).returning()

    return NextResponse.json({
      ...newProfile[0],
      roles: JSON.parse(newProfile[0].roles),
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}

// PATCH - Update profile (switch role, add role, update metadata)
export async function PATCH(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { userId, activeRole, addRole, removeRole, metadata, kycVerified } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Fetch current profile
    const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1)

    if (profiles.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const currentProfile = profiles[0]
    let currentRoles = JSON.parse(currentProfile.roles) as string[]

    // Handle role addition
    if (addRole && !currentRoles.includes(addRole)) {
      currentRoles.push(addRole)
    }

    // Handle role removal
    if (removeRole) {
      currentRoles = currentRoles.filter(r => r !== removeRole)
      // Don't allow removing last role
      if (currentRoles.length === 0) {
        currentRoles = ['PUBLIC']
      }
    }

    // Update profile
    const updates: any = {}
    if (activeRole) {
      // Verify user has this role
      if (!currentRoles.includes(activeRole)) {
        return NextResponse.json(
          { error: `User doesn't have role: ${activeRole}` },
          { status: 400 }
        )
      }
      updates.activeRole = activeRole
    }
    if (addRole || removeRole) {
      updates.roles = JSON.stringify(currentRoles)
    }
    if (metadata) {
      updates.metadata = JSON.stringify({ ...JSON.parse(currentProfile.metadata || '{}'), ...metadata })
    }
    if (typeof kycVerified === 'boolean') {
      updates.kycVerified = kycVerified
    }
    updates.updatedAt = new Date()

    const updated = await db
      .update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.id, currentProfile.id))
      .returning()

    return NextResponse.json({
      ...updated[0],
      roles: JSON.parse(updated[0].roles),
      metadata: updated[0].metadata ? JSON.parse(updated[0].metadata) : undefined,
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
