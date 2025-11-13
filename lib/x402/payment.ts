/**
 * X402 Protocol Integration
 * HTTP Status Code 402 (Payment Required) for micropayments
 * 
 * This module implements the X402 protocol for collecting micropayments
 * when users request AI prediction data or premium market data
 */

export interface X402PaymentRequest {
  amount: number;
  currency: string;
  recipient: string;
  description: string;
  endpoint: string;
}

export interface X402PaymentProof {
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  signature?: string;
}

/**
 * Check if request has valid payment proof
 */
export function hasValidPayment(headers: Headers): boolean {
  const paymentProof = headers.get('x-payment-proof');
  const paymentTx = headers.get('x-payment-tx');
  
  if (!paymentProof && !paymentTx) {
    return false;
  }
  
  // In a real implementation, validate the payment proof
  // This could involve:
  // 1. Checking on-chain transaction
  // 2. Validating signature
  // 3. Verifying payment amount
  // 4. Checking payment hasn't been used before
  
  return true;
}

/**
 * Create a 402 Payment Required response
 */
export function createPaymentRequiredResponse(
  paymentRequest: X402PaymentRequest
): Response {
  return new Response(
    JSON.stringify({
      error: 'Payment Required',
      code: 402,
      message: 'This endpoint requires payment to access',
      payment: {
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        recipient: paymentRequest.recipient,
        description: paymentRequest.description,
        methods: ['USDC', 'Solana', 'Polygon'],
      },
      instructions: {
        step1: 'Send payment to the recipient address',
        step2: 'Include transaction ID in X-Payment-Tx header',
        step3: 'Retry your request with payment proof',
      },
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Accept-Payment': paymentRequest.currency,
        'X-Payment-Amount': paymentRequest.amount.toString(),
        'X-Payment-Recipient': paymentRequest.recipient,
      },
    }
  );
}

/**
 * Verify payment on-chain (placeholder)
 */
export async function verifyPayment(
  transactionId: string,
  expectedAmount: number,
  expectedCurrency: string
): Promise<boolean> {
  // In a real implementation, this would:
  // 1. Query blockchain for transaction
  // 2. Verify transaction is confirmed
  // 3. Check amount matches
  // 4. Check currency/token matches
  // 5. Verify recipient address
  // 6. Ensure transaction hasn't been used before
  
  console.log('Verifying payment:', { transactionId, expectedAmount, expectedCurrency });
  
  // For now, accept any transaction ID that looks valid
  return transactionId.length > 10;
}

/**
 * Extract payment proof from request headers
 */
export function extractPaymentProof(headers: Headers): X402PaymentProof | null {
  const txId = headers.get('x-payment-tx');
  const amount = headers.get('x-payment-amount');
  const currency = headers.get('x-payment-currency');
  const timestamp = headers.get('x-payment-timestamp');
  const signature = headers.get('x-payment-signature');
  
  if (!txId) {
    return null;
  }
  
  return {
    transactionId: txId,
    amount: amount ? parseFloat(amount) : 0,
    currency: currency || 'USDC',
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    signature: signature || undefined,
  };
}

/**
 * Calculate payment amount based on endpoint and tier
 */
export function calculatePaymentAmount(
  endpoint: string,
  tier: string = 'FREE'
): number {
  // Free tier doesn't pay
  if (tier === 'PREMIUM' || tier === 'ENTERPRISE') {
    return 0;
  }
  
  // Pricing structure for free tier users
  const pricing: Record<string, number> = {
    '/api/agents/commodity/predict': 0.01,  // $0.01 per prediction
    '/api/agents/commodity/predictions': 0.005,  // $0.005 per batch
    '/api/live-prices': 0.002,  // $0.002 per request
    '/api/oracle/resolve': 0.05,  // $0.05 per resolution
    '/api/markets/stake': 0,  // Free (takes fees from stake)
  };
  
  // Check if endpoint matches any pattern
  for (const [pattern, price] of Object.entries(pricing)) {
    if (endpoint.includes(pattern)) {
      return price;
    }
  }
  
  // Default: free
  return 0;
}

/**
 * Pricing tiers configuration
 */
export const PRICING_TIERS = {
  FREE: {
    name: 'Free',
    rateLimit: 100,  // requests per hour
    monthlyQuota: 1000,
    payPerRequest: true,
    features: ['Basic API access', 'Pay per request'],
  },
  BASIC: {
    name: 'Basic',
    price: 10,  // $10/month
    rateLimit: 1000,
    monthlyQuota: 10000,
    payPerRequest: false,
    features: ['10K requests/month', 'Email support', 'No per-request fees'],
  },
  PREMIUM: {
    name: 'Premium',
    price: 50,  // $50/month
    rateLimit: 5000,
    monthlyQuota: 100000,
    payPerRequest: false,
    features: ['100K requests/month', 'Priority support', 'Advanced analytics', 'Webhook notifications'],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 500,  // $500/month
    rateLimit: 50000,
    monthlyQuota: 1000000,
    payPerRequest: false,
    features: ['1M requests/month', 'Dedicated support', 'Custom integration', 'SLA guarantee', 'White-label options'],
  },
};
