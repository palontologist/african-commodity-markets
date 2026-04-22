import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============ AGENT REGISTRY ============

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(), // did:agent:xxxx
  owner: text('owner').notNull(),
  
  name: text('name').notNull(),
  description: text('description'),
  avatar: text('avatar'),
  capabilities: text('capabilities').notNull().default('[]'), // JSON: ["HEDGE", "ARBITRAGE", "MARKET_MAKE"]
  
  feeTier: text('fee_tier').notNull().default('FREE'), // FREE | BASIC | PREMIUM | ENTERPRISE
  commissionBps: integer('commission_bps').default(50), // Basis points charged to others
  
  reputation: real('reputation').default(50),
  totalTrades: integer('total_trades').default(0),
  totalVolume: real('total_volume').default(0),
  avgRating: real('avg_rating'),
  
  status: text('status').notNull().default('ACTIVE'), // ACTIVE | PAUSED | SLASHED | BANNED
  lastSeen: integer('last_seen', { mode: 'timestamp' }),
  metadataCID: text('metadata_cid'),
  
  platformFeesOwed: real('platform_fees_owed').default(0),
  platformFeesPaid: real('platform_fees_paid').default(0),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const agentApiKeys = sqliteTable('agent_api_keys', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  keyHash: text('key_hash').notNull(),
  name: text('name').notNull(),
  permissions: text('permissions').notNull().default('[]'),
  rateLimit: integer('rate_limit').default(100),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastUsed: integer('last_used', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const agentCapabilities = sqliteTable('agent_capabilities', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  commodity: text('commodity'),
  side: text('side'), // BUY | SELL | BOTH
  minQuantity: real('min_quantity'),
  maxQuantity: real('max_quantity'),
  minPrice: real('min_price'),
  maxPrice: real('max_price'),
  preferredRegions: text('preferred_regions'),
  executionSpeed: text('execution_speed').default('STANDARD'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// ============ ORDERS & MATCHING ============

export const agentOrders = sqliteTable('agent_orders', {
  id: text('id').primaryKey(), // ord:xxxxx
  agentId: text('agent_id').notNull().references(() => agents.id),
  
  side: text('side').notNull(), // BUY | SELL
  commodity: text('commodity').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull().default('MT'),
  price: real('price').notNull(),
  totalValue: real('total_value').notNull(),
  
  orderType: text('order_type').notNull().default('LIMIT'), // LIMIT | MARKET | IOC | FOK
  timeInForce: text('time_in_force').default('GTC'),
  
  status: text('status').notNull().default('OPEN'), // OPEN | PARTIAL | MATCHED | EXECUTED | CANCELLED | EXPIRED
  filledQuantity: real('filled_quantity').default(0),
  matchedWith: text('matched_with'),
  
  visibility: text('visibility').default('PUBLIC'), // PUBLIC | PRIVATE | HIDDEN
  allowedAgents: text('allowed_agents'),
  
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  
  executionPrice: real('execution_price'),
  executionFee: real('execution_fee'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const orderBookSnapshot = sqliteTable('order_book_snapshot', {
  id: text('id').primaryKey(),
  commodity: text('commodity').notNull(),
  side: text('side').notNull(),
  levels: text('levels').notNull(), // JSON
  bestBid: real('best_bid'),
  bestAsk: real('best_ask'),
  spread: real('spread'),
  depth: integer('depth'),
  totalVolume: real('total_volume'),
  snapshotAt: integer('snapshot_at', { mode: 'timestamp' }).notNull(),
});

// ============ NEGOTIATIONS ============

export const negotiations = sqliteTable('negotiations', {
  id: text('id').primaryKey(), // neg:xxxxx
  buyerAgentId: text('buyer_agent_id').notNull().references(() => agents.id),
  sellerAgentId: text('seller_agent_id').notNull().references(() => agents.id),
  
  commodity: text('commodity').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  
  status: text('status').notNull().default('PROPOSED'),
  // PROPOSED | COUNTERED | ACCEPTED | REJECTED | EXPIRED | CANCELLED | EXECUTED
  
  currentOffer: text('current_offer').notNull(), // JSON
  offerHistory: text('offer_history').notNull().default('[]'),
  
  relatedOrderId: text('related_order_id'),
  
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  executedTradeId: text('executed_trade_id'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const negotiationMessages = sqliteTable('negotiation_messages', {
  id: text('id').primaryKey(),
  negotiationId: text('negotiation_id').notNull().references(() => negotiations.id),
  senderAgentId: text('sender_agent_id').notNull().references(() => agents.id),
  
  messageType: text('message_type').notNull(),
  // PROPOSAL | COUNTER | ACCEPT | REJECT | INFO_REQUEST | INFO_RESPONSE | EXECUTE
  
  content: text('content').notNull(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// ============ TRADES & SETTLEMENT ============

export const agentTrades = sqliteTable('agent_trades', {
  id: text('id').primaryKey(), // trd:xxxxx
  buyerAgentId: text('buyer_agent_id').notNull().references(() => agents.id),
  sellerAgentId: text('seller_agent_id').notNull().references(() => agents.id),
  
  commodity: text('commodity').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  price: real('price').notNull(),
  totalValue: real('total_value').notNull(),
  
  negotiationId: text('negotiation_id'),
  buyerOrderId: text('buyer_order_id'),
  sellerOrderId: text('seller_order_id'),
  
  platformFee: real('platform_fee').notNull(),
  platformFeeBps: integer('platform_fee_bps').notNull(),
  buyerFee: real('buyer_fee').default(0),
  sellerFee: real('seller_fee').default(0),
  
  escrowId: text('escrow_id'),
  status: text('status').notNull().default('PENDING'),
  // PENDING | IN_ESCROW | RELEASED | DISPUTED | REFUNDED | CANCELLED
  
  deliveryTerms: text('delivery_terms'),
  deliveryDate: integer('delivery_date', { mode: 'timestamp' }),
  qualitySpecs: text('quality_specs'),
  
  executedAt: integer('executed_at', { mode: 'timestamp' }),
  settledAt: integer('settled_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const escrows = sqliteTable('escrows', {
  id: text('id').primaryKey(), // esc:xxxxx
  tradeId: text('trade_id').notNull().references(() => agentTrades.id),
  
  buyerAgentId: text('buyer_agent_id').notNull().references(() => agents.id),
  sellerAgentId: text('seller_agent_id').notNull().references(() => agents.id),
  
  lockedAsset: text('locked_asset').notNull(),
  lockedCollateral: text('locked_collateral'),
  
  releaseConditions: text('release_conditions').notNull(),
  releaseAgentId: text('release_agent_id'),
  releasedAt: integer('released_at', { mode: 'timestamp' }),
  
  status: text('status').notNull().default('ACTIVE'),
  // ACTIVE | CONDITION_MET | RELEASED | DISPUTED | REFUNDED | EXPIRED
  
  disputeId: text('dispute_id'),
  disputeReason: text('dispute_reason'),
  
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const disputes = sqliteTable('disputes', {
  id: text('id').primaryKey(),
  tradeId: text('trade_id').notNull().references(() => agentTrades.id),
  escrowId: text('escrow_id').notNull().references(() => escrows.id),
  
  raisedBy: text('raised_by').notNull().references(() => agents.id),
  reason: text('reason').notNull(),
  evidence: text('evidence'),
  
  status: text('status').notNull().default('OPEN'),
  // OPEN | UNDER_REVIEW | RESOLVED_BUYER | RESOLVED_SELLER | EXPIRED
  
  resolution: text('resolution'),
  resolvedBy: text('resolved_by'),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// ============ PLATFORM REVENUE ============

export const platformRevenue = sqliteTable('platform_revenue', {
  id: text('id').primaryKey(),
  tradeId: text('trade_id').references(() => agentTrades.id),
  agentId: text('agent_id').references(() => agents.id),
  
  feeType: text('fee_type').notNull(),
  // TRADE_FEE | LISTING_FEE | PREMIUM_SUBSCRIPTION | API_USAGE | SLASH_PENALTY
  
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USDC'),
  
  grossAmount: real('gross_amount'),
  netAmount: real('net_amount'),
  
  collectedAt: integer('collected_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const agentSubscriptions = sqliteTable('agent_subscriptions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  
  tier: text('tier').notNull(),
  
  billingCycle: text('billing_cycle').default('MONTHLY'),
  priceUsdc: real('price_usdc').notNull(),
  
  status: text('status').notNull().default('ACTIVE'),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
  
  paymentTxHash: text('payment_tx_hash'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// ============ TYPE EXPORTS ============

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type AgentApiKey = typeof agentApiKeys.$inferSelect;
export type NewAgentApiKey = typeof agentApiKeys.$inferInsert;

export type AgentCapability = typeof agentCapabilities.$inferSelect;
export type NewAgentCapability = typeof agentCapabilities.$inferInsert;

export type AgentOrder = typeof agentOrders.$inferSelect;
export type NewAgentOrder = typeof agentOrders.$inferInsert;

export type OrderBookSnap = typeof orderBookSnapshot.$inferSelect;

export type Negotiation = typeof negotiations.$inferSelect;
export type NewNegotiation = typeof negotiations.$inferInsert;

export type NegotiationMessage = typeof negotiationMessages.$inferSelect;

export type AgentTrade = typeof agentTrades.$inferSelect;
export type NewAgentTrade = typeof agentTrades.$inferInsert;

export type Escrow = typeof escrows.$inferSelect;
export type NewEscrow = typeof escrows.$inferInsert;

export type Dispute = typeof disputes.$inferSelect;

export type PlatformRevenue = typeof platformRevenue.$inferSelect;

export type AgentSubscription = typeof agentSubscriptions.$inferSelect;
