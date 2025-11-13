import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { enterpriseApiKeys } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Generate a secure API key
 */
function generateApiKey(): string {
  const prefix = 'afr_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomBytes}`;
}

/**
 * GET /api/enterprise/api-keys - List user's API keys
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const keys = await db.select()
      .from(enterpriseApiKeys)
      .where(eq(enterpriseApiKeys.userId, userId))
      .orderBy(desc(enterpriseApiKeys.createdAt));

    // Mask API keys for security (show only last 8 characters)
    const maskedKeys = keys.map(key => ({
      ...key,
      apiKey: `${key.apiKey.substring(0, 4)}...${key.apiKey.substring(key.apiKey.length - 8)}`,
    }));

    return NextResponse.json({
      success: true,
      keys: maskedKeys,
      count: keys.length,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enterprise/api-keys - Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      tier = 'FREE',
      rateLimit,
      monthlyQuota,
      allowedEndpoints,
      expiresAt,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = generateApiKey();

    // Set defaults based on tier
    const tierDefaults: Record<string, { rateLimit: number; monthlyQuota: number }> = {
      FREE: { rateLimit: 100, monthlyQuota: 10000 },
      BASIC: { rateLimit: 1000, monthlyQuota: 10000 },
      PREMIUM: { rateLimit: 5000, monthlyQuota: 100000 },
      ENTERPRISE: { rateLimit: 50000, monthlyQuota: 1000000 },
    };

    const defaults = tierDefaults[tier] || tierDefaults.FREE;

    // Create API key
    const newKey = await db.insert(enterpriseApiKeys).values({
      userId,
      apiKey,
      name,
      description: description || null,
      tier,
      rateLimit: rateLimit || defaults.rateLimit,
      monthlyQuota: monthlyQuota || defaults.monthlyQuota,
      currentUsage: 0,
      allowedEndpoints: allowedEndpoints ? JSON.stringify(allowedEndpoints) : null,
      isActive: 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      lastUsedAt: null,
    }).returning();

    return NextResponse.json({
      success: true,
      key: newKey[0],
      message: 'API key created successfully',
      warning: 'Save this key securely - it will not be shown again in full',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/enterprise/api-keys?keyId=123 - Revoke an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const keyId = request.nextUrl.searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'Key ID is required' },
        { status: 400 }
      );
    }

    // Deactivate the key (soft delete)
    await db.update(enterpriseApiKeys)
      .set({ isActive: 0, updatedAt: new Date() })
      .where(eq(enterpriseApiKeys.id, parseInt(keyId)));

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
