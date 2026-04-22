/**
 * X402 Agent Payments Module
 * 
 * Implements x402 protocol for agent-to-agent marketplace payments.
 * Agents pay for:
 * - API usage (requests to marketplace)
 * - Trade execution fees
 * - Priority matching
 * - Premium features
 */

import { db } from '@/lib/db';
import { agents } from '@/lib/db/a2a-schema';
import { eq, sql } from 'drizzle-orm';

// ============ Types ============

export interface AgentPaymentAccount {
  agentId: string;
  balance: number;          // USDC balance in smallest units
  pendingPayments: number;
  totalSpent: number;
  totalEarned: number;
}

export interface PaymentIntent {
  id: string;
  agentId: string;
  amount: number;
  currency: 'USDC';
  purpose: 'API_USAGE' | 'TRADE_FEE' | 'SUBSCRIPTION' | 'ESCROW_DEPOSIT';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  txHash?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface FeeSchedule {
  endpoint: string;
  basePrice: number;      // in USDC (smallest unit, e.g., cents)
  perRequest: boolean;
  agentTier?: string;
}

// ============ Fee Configuration ============

export const AGENT_FEE_SCHEDULE: Record<string, FeeSchedule> = {
  // API Access Fees (per request)
  '/api/a2a/agents': { endpoint: '/api/a2a/agents', basePrice: 0, perRequest: false },
  '/api/a2a/agents/register': { endpoint: '/api/a2a/agents/register', basePrice: 0, perRequest: false },
  '/api/a2a/orders': { endpoint: '/api/a2a/orders', basePrice: 10, perRequest: true }, // 10 cents
  '/api/a2a/orders/post': { endpoint: '/api/a2a/orders/post', basePrice: 50, perRequest: true }, // 50 cents
  
  // Trading Fees (percentage-based, calculated separately)
  '/api/a2a/trades': { endpoint: '/api/a2a/trades', basePrice: 0, perRequest: false },
  
  // MCP Tools
  '/api/a2a/mcp': { endpoint: '/api/a2a/mcp', basePrice: 5, perRequest: true }, // 5 cents per tool call
  
  // Market Data
  '/api/live-prices': { endpoint: '/api/live-prices', basePrice: 1, perRequest: true },
  
  // Premium Features
  '/api/a2a/analytics': { endpoint: '/api/a2a/analytics', basePrice: 100, perRequest: true },
};

// Trade fee percentages by tier
export const TRADE_FEE_PERCENTAGE: Record<string, number> = {
  FREE: 0.005,      // 0.5%
  BASIC: 0.003,     // 0.3%
  PREMIUM: 0.0015,  // 0.15%
  ENTERPRISE: 0.001, // 0.1%
};

// ============ Balance Management ============

export async function getAgentBalance(agentId: string): Promise<number> {
  try {
    const [agent] = await db.select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);
    
    return agent?.platformFeesOwed || 0;
  } catch (error) {
    console.error('Error getting agent balance:', error);
    return 0;
  }
}

export async function deductBalance(agentId: string, amount: number): Promise<boolean> {
  try {
    const currentBalance = await getAgentBalance(agentId);
    
    if (currentBalance < amount) {
      return false; // Insufficient balance
    }

    await db.update(agents)
      .set({
        platformFeesOwed: sql`${agents.platformFeesOwed} - ${amount}`,
        platformFeesPaid: sql`${agents.platformFeesPaid} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    return true;
  } catch (error) {
    console.error('Error deducting balance:', error);
    return false;
  }
}

export async function addBalance(agentId: string, amount: number): Promise<boolean> {
  try {
    await db.update(agents)
      .set({
        platformFeesOwed: sql`${agents.platformFeesOwed} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    return true;
  } catch (error) {
    console.error('Error adding balance:', error);
    return false;
  }
}

// ============ Fee Calculation ============

export function calculateApiFee(endpoint: string, tier: string = 'FREE'): number {
  const feeConfig = AGENT_FEE_SCHEDULE[endpoint];
  
  if (!feeConfig || feeConfig.basePrice === 0) {
    return 0;
  }

  // Premium/Enterprise tiers get discounts
  const discounts: Record<string, number> = {
    FREE: 1.0,
    BASIC: 0.8,
    PREMIUM: 0.5,
    ENTERPRISE: 0.25,
  };

  const discount = discounts[tier] || 1.0;
  return Math.ceil(feeConfig.basePrice * discount);
}

export function calculateTradeFee(tradeValue: number, tier: string = 'FREE'): number {
  const percentage = TRADE_FEE_PERCENTAGE[tier] || TRADE_FEE_PERCENTAGE.FREE;
  return Math.ceil(tradeValue * percentage);
}

export function calculateSubscriptionFee(tier: string): number {
  const monthlyFees: Record<string, number> = {
    FREE: 0,
    BASIC: 99_000000,      // $99 in USDC (6 decimals)
    PREMIUM: 499_000000,    // $499
    ENTERPRISE: 999_000000, // $999
  };
  return monthlyFees[tier] || 0;
}

// ============ X402 Payment Flow ============

export interface X402Headers {
  'X-Payment-Amount': string;
  'X-Payment-Currency': string;
  'X-Payment-Recipient': string;
  'X-Payment-Tx': string;
  'X-Payment-Signature'?: string;
  'X-Payment-Timestamp'?: string;
}

export function createPaymentRequiredResponse(
  amount: number,
  currency: string = 'USDC',
  description: string,
  recipientAddress: string
): Response {
  return new Response(
    JSON.stringify({
      error: 'Payment Required',
      code: 402,
      message: description,
      payment: {
        amount: amount / 1_000000, // Convert from smallest unit
        currency,
        recipient: recipientAddress,
        instructions: {
          network: 'Polygon',
          token: 'USDC',
          method: 'Transfer USDC to recipient address',
          step1: `Send ${(amount / 1_000000).toFixed(2)} USDC to ${recipientAddress}`,
          step2: 'Wait for transaction confirmation',
          step3: 'Retry request with X-Payment-Tx header containing your transaction hash',
        },
      },
      headers: {
        'X-Payment-Amount': amount.toString(),
        'X-Payment-Currency': currency,
        'X-Payment-Recipient': recipientAddress,
      },
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Accept-Payment': currency,
        'X-Payment-Amount': amount.toString(),
        'X-Payment-Recipient': recipientAddress,
      },
    }
  );
}

export function extractPaymentHeaders(request: Request): {
  txHash?: string;
  amount?: string;
  currency?: string;
} {
  return {
    txHash: request.headers.get('X-Payment-Tx') || undefined,
    amount: request.headers.get('X-Payment-Amount') || undefined,
    currency: request.headers.get('X-Payment-Currency') || undefined,
  };
}

export async function verifyOnChainPayment(
  txHash: string,
  expectedAmount: number,
  recipientAddress: string
): Promise<{ valid: boolean; reason?: string }> {
  // In production, this would:
  // 1. Query Polygon RPC for transaction
  // 2. Verify transaction is confirmed
  // 3. Check amount >= expected
  // 4. Verify recipient matches
  // 5. Check transaction is not already used (idempotency)
  
  // For now, validate format
  if (!txHash || txHash.length < 66) {
    return { valid: false, reason: 'Invalid transaction hash' };
  }

  if (!txHash.startsWith('0x')) {
    return { valid: false, reason: 'Transaction hash must start with 0x' };
  }

  // Simulate verification delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return { valid: true };
}

// ============ Payment Processing ============

export interface ProcessPaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export async function processAgentPayment(
  agentId: string,
  amount: number,
  purpose: 'API_USAGE' | 'TRADE_FEE' | 'SUBSCRIPTION' | 'ESCROW_DEPOSIT',
  txHash?: string
): Promise<ProcessPaymentResult> {
  try {
    // If txHash provided, verify on-chain payment
    if (txHash) {
      const recipientAddress = process.env.PLATFORM_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';
      const verification = await verifyOnChainPayment(txHash, amount, recipientAddress);
      
      if (!verification.valid) {
        return { success: false, error: verification.reason };
      }
    }

    // Deduct from agent balance
    const deducted = await deductBalance(agentId, amount);
    
    if (!deducted) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Generate payment ID
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return {
      success: true,
      paymentId,
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { success: false, error: 'Payment processing failed' };
  }
}

// ============ Balance Top-up ============

export async function topUpAgentBalance(
  agentId: string,
  amount: number,
  txHash: string
): Promise<ProcessPaymentResult> {
  try {
    // Verify the deposit transaction
    const recipientAddress = process.env.PLATFORM_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';
    const verification = await verifyOnChainPayment(txHash, amount, recipientAddress);
    
    if (!verification.valid) {
      return { success: false, error: verification.reason };
    }

    // Add to agent balance (this is a deposit, not a deduction)
    const paymentId = `dep_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Update balance as negative (credit)
    await db.update(agents)
      .set({
        platformFeesOwed: sql`${agents.platformFeesOwed} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    return {
      success: true,
      paymentId,
    };
  } catch (error) {
    console.error('Error topping up balance:', error);
    return { success: false, error: 'Top-up failed' };
  }
}

// ============ Middleware Helper ============

export interface PaymentCheckResult {
  requiresPayment: boolean;
  amount?: number;
  reason?: string;
  headers?: Record<string, string>;
}

export async function checkPaymentRequirement(
  agentId: string,
  endpoint: string,
  request: Request
): Promise<PaymentCheckResult> {
  // Get agent tier
  const [agent] = await db.select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  const tier = agent?.feeTier || 'FREE';

  // Calculate fee
  const fee = calculateApiFee(endpoint, tier);

  // Free tier or no fee endpoint
  if (fee === 0) {
    return { requiresPayment: false };
  }

  // Check for payment headers
  const paymentHeaders = extractPaymentHeaders(request);
  
  if (paymentHeaders.txHash) {
    // Verify payment
    const recipientAddress = process.env.PLATFORM_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';
    const verification = await verifyOnChainPayment(
      paymentHeaders.txHash,
      fee,
      recipientAddress
    );

    if (verification.valid) {
      // Process the payment
      const result = await processAgentPayment(
        agentId,
        fee,
        'API_USAGE',
        paymentHeaders.txHash
      );

      if (result.success) {
        return { requiresPayment: false };
      }
    }
  }

  // Check balance
  const balance = await getAgentBalance(agentId);
  
  if (balance >= fee) {
    // Can deduct from balance
    return { requiresPayment: false };
  }

  // Payment required
  const recipientAddress = process.env.PLATFORM_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';
  
  return {
    requiresPayment: true,
    amount: fee,
    reason: `This endpoint requires ${fee / 1_000000} USDC payment`,
    headers: {
      'X-Payment-Amount': fee.toString(),
      'X-Payment-Currency': 'USDC',
      'X-Payment-Recipient': recipientAddress,
    },
  };
}
