/**
 * API Authentication and Payment Middleware
 * Validates API keys and handles X402 micropayments
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { enterpriseApiKeys, apiAccessLogs } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { 
  hasValidPayment, 
  extractPaymentProof, 
  calculatePaymentAmount,
  verifyPayment 
} from '@/lib/x402/payment';

export interface ApiAuthResult {
  authenticated: boolean;
  userId?: string;
  tier?: string;
  requiresPayment?: boolean;
  paymentAmount?: number;
  error?: string;
}

/**
 * Validate API key from request headers
 */
export async function validateApiKey(apiKey: string): Promise<ApiAuthResult> {
  try {
    // Query database for API key
    const keys = await db.select()
      .from(enterpriseApiKeys)
      .where(
        and(
          eq(enterpriseApiKeys.apiKey, apiKey),
          eq(enterpriseApiKeys.isActive, 1)
        )
      )
      .limit(1);

    if (keys.length === 0) {
      return {
        authenticated: false,
        error: 'Invalid API key',
      };
    }

    const key = keys[0];

    // Check if key is expired
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return {
        authenticated: false,
        error: 'API key expired',
      };
    }

    // Check rate limit (basic check - would need Redis for production)
    // For now, just check monthly quota
    if (key.currentUsage >= key.monthlyQuota) {
      return {
        authenticated: false,
        error: 'Monthly quota exceeded',
      };
    }

    // Update last used timestamp and increment usage
    await db.update(enterpriseApiKeys)
      .set({
        lastUsedAt: new Date(),
        currentUsage: sql`${enterpriseApiKeys.currentUsage} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(enterpriseApiKeys.id, key.id));

    return {
      authenticated: true,
      userId: key.userId,
      tier: key.tier,
      requiresPayment: false,
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      authenticated: false,
      error: 'Internal error',
    };
  }
}

/**
 * Authenticate API request
 * Checks for API key or Clerk authentication
 */
export async function authenticateApiRequest(
  request: NextRequest,
  endpoint: string
): Promise<ApiAuthResult> {
  // Check for API key in Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7);
    return await validateApiKey(apiKey);
  }

  // Check for API key in X-API-Key header
  const apiKeyHeader = request.headers.get('x-api-key');
  
  if (apiKeyHeader) {
    return await validateApiKey(apiKeyHeader);
  }

  // No API key - check if payment is required (X402)
  // For free tier users without API key, require per-request payment
  const paymentAmount = calculatePaymentAmount(endpoint, 'FREE');
  
  if (paymentAmount > 0) {
    // Check if payment proof is provided
    if (hasValidPayment(request.headers)) {
      const paymentProof = extractPaymentProof(request.headers);
      
      if (paymentProof) {
        // Verify payment
        const isValid = await verifyPayment(
          paymentProof.transactionId,
          paymentAmount,
          paymentProof.currency
        );
        
        if (isValid) {
          return {
            authenticated: true,
            tier: 'FREE',
            requiresPayment: false,
          };
        }
      }
    }
    
    // Payment required but not provided or invalid
    return {
      authenticated: false,
      requiresPayment: true,
      paymentAmount,
      error: 'Payment required',
    };
  }

  // Endpoint is free - allow access
  return {
    authenticated: true,
    tier: 'FREE',
    requiresPayment: false,
  };
}

/**
 * Log API access for analytics and billing
 */
export async function logApiAccess(
  userId: string | undefined,
  apiKey: string | undefined,
  endpoint: string,
  method: string,
  requestData: any,
  responseStatus: number,
  paymentAmount: number = 0,
  paymentTxId?: string
): Promise<void> {
  try {
    await db.insert(apiAccessLogs).values({
      userId: userId || null,
      apiKey: apiKey || null,
      endpoint,
      method,
      requestData: requestData ? JSON.stringify(requestData) : null,
      responseStatus,
      paymentStatus: paymentAmount > 0 ? (paymentTxId ? 'PAID' : 'PENDING') : 'FREE',
      paymentAmount,
      paymentCurrency: paymentAmount > 0 ? 'USDC' : null,
      x402TransactionId: paymentTxId || null,
      ipAddress: null, // Would extract from request in production
      userAgent: null, // Would extract from request in production
      accessedAt: new Date(),
    });
  } catch (error) {
    console.error('Error logging API access:', error);
    // Don't fail the request if logging fails
  }
}

/**
 * Check if user has access to specific endpoint
 */
export async function hasEndpointAccess(
  apiKey: string,
  endpoint: string
): Promise<boolean> {
  try {
    const keys = await db.select()
      .from(enterpriseApiKeys)
      .where(eq(enterpriseApiKeys.apiKey, apiKey))
      .limit(1);

    if (keys.length === 0) {
      return false;
    }

    const key = keys[0];

    // If no endpoint restrictions, allow all
    if (!key.allowedEndpoints) {
      return true;
    }

    // Check if endpoint is in allowed list
    const allowedEndpoints = JSON.parse(key.allowedEndpoints);
    return allowedEndpoints.some((allowed: string) => 
      endpoint.includes(allowed) || allowed === '*'
    );
  } catch (error) {
    console.error('Error checking endpoint access:', error);
    return false;
  }
}
