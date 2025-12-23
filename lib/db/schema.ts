import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table - synced with Clerk
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Commodities table
export const commodities = sqliteTable('commodities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(), // e.g., 'COCOA', 'COFFEE', 'GOLD'
  category: text('category').notNull(), // e.g., 'Agricultural', 'Precious Metals', 'Energy'
  unit: text('unit').notNull(), // e.g., 'MT' (metric ton), 'oz' (ounce), 'barrel'
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Countries table
export const countries = sqliteTable('countries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(), // ISO 3166-1 alpha-2 code (e.g., 'GH', 'NG', 'ZA')
  region: text('region').notNull(), // e.g., 'West Africa', 'East Africa', 'Southern Africa'
  currency: text('currency').notNull(), // e.g., 'GHS', 'NGN', 'ZAR'
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Markets table
export const markets = sqliteTable('markets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  location: text('location').notNull(),
  countryId: integer('country_id').notNull().references(() => countries.id),
  type: text('type').notNull(), // e.g., 'Exchange', 'Spot Market', 'Auction'
  operatingHours: text('operating_hours'),
  contactInfo: text('contact_info'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Commodity Prices table
export const commodityPrices = sqliteTable('commodity_prices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  commodityId: integer('commodity_id').notNull().references(() => commodities.id),
  marketId: integer('market_id').notNull().references(() => markets.id),
  price: real('price').notNull(),
  currency: text('currency').notNull(),
  unit: text('unit').notNull(),
  priceDate: integer('price_date', { mode: 'timestamp' }).notNull(),
  quality: text('quality'), // e.g., 'Grade A', 'Premium', 'Standard'
  volume: real('volume'), // Trading volume
  source: text('source'), // Data source
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Commodity Grades table
export const commodityGrades = sqliteTable('commodity_grades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  commodityId: integer('commodity_id').notNull().references(() => commodities.id),
  grade: text('grade').notNull(),
  description: text('description'),
  qualityStandards: text('quality_standards'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// User Watchlists table
export const userWatchlists = sqliteTable('user_watchlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  commodityId: integer('commodity_id').notNull().references(() => commodities.id),
  marketId: integer('market_id').references(() => markets.id), // Optional: specific market
  alertThreshold: real('alert_threshold'), // Price alert threshold
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// News and Updates table
export const commodityNews = sqliteTable('commodity_news', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  author: text('author'),
  source: text('source'),
  sourceUrl: text('source_url'),
  publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
  commodityIds: text('commodity_ids'), // JSON array of commodity IDs
  countryIds: text('country_ids'), // JSON array of country IDs
  tags: text('tags'), // JSON array of tags
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const commodityPredictions = sqliteTable('commodity_predictions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  commodityId: integer('commodity_id').notNull().references(() => commodities.id),
  region: text('region').notNull(),
  horizon: text('horizon').notNull(),
  predictedPrice: real('predicted_price'),
  currency: text('currency').notNull(),
  confidence: real('confidence'),
  narrative: text('narrative'),
  model: text('model').notNull(),
  asOf: integer('as_of', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const predictionSignals = sqliteTable('prediction_signals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predictionId: integer('prediction_id').notNull().references(() => commodityPredictions.id),
  signalType: text('signal_type').notNull(),
  description: text('description'),
  strength: real('strength'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const marketPools = sqliteTable('market_pools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  commodityId: integer('commodity_id').notNull().references(() => commodities.id),
  creatorUserId: text('creator_user_id').references(() => users.id),
  targetOutcome: text('target_outcome').notNull(),
  targetDate: integer('target_date', { mode: 'timestamp' }),
  currentLiquidity: real('current_liquidity').default(0),
  tokenAddress: text('token_address'),
  status: text('status').default('OPEN'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const poolParticipants = sqliteTable('pool_participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  poolId: integer('pool_id').notNull().references(() => marketPools.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull(),
  contribution: real('contribution').default(0),
  shares: real('shares').default(0),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const userMarkets = sqliteTable('user_markets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  marketId: integer('market_id').references(() => markets.id),
  creatorUserId: text('creator_user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  commodityId: integer('commodity_id').references(() => commodities.id),
  countryId: integer('country_id').references(() => countries.id),
  settlementTerms: text('settlement_terms'),
  status: text('status').default('DRAFT'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const commodityListings = sqliteTable('commodity_listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userMarketId: integer('user_market_id').references(() => userMarkets.id),
  commodityId: integer('commodity_id').notNull().references(() => commodities.id),
  listingType: text('listing_type').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  askingPrice: real('asking_price').notNull(),
  currency: text('currency').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  onChainTokenId: text('onchain_token_id'),
  status: text('status').default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const commodityBids = sqliteTable('commodity_bids', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listingId: integer('listing_id').notNull().references(() => commodityListings.id),
  bidderUserId: text('bidder_user_id').references(() => users.id),
  amount: real('amount').notNull(),
  currency: text('currency').notNull(),
  message: text('message'),
  status: text('status').default('PENDING'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Commodity = typeof commodities.$inferSelect;
export type NewCommodity = typeof commodities.$inferInsert;

export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;

export type Market = typeof markets.$inferSelect;
export type NewMarket = typeof markets.$inferInsert;

export type CommodityPrice = typeof commodityPrices.$inferSelect;
export type NewCommodityPrice = typeof commodityPrices.$inferInsert;

export type CommodityGrade = typeof commodityGrades.$inferSelect;
export type NewCommodityGrade = typeof commodityGrades.$inferInsert;

export type UserWatchlist = typeof userWatchlists.$inferSelect;
export type NewUserWatchlist = typeof userWatchlists.$inferInsert;

export type CommodityNews = typeof commodityNews.$inferSelect;
export type NewCommodityNews = typeof commodityNews.$inferInsert;

export type CommodityPrediction = typeof commodityPredictions.$inferSelect;
export type NewCommodityPrediction = typeof commodityPredictions.$inferInsert;

export type PredictionSignal = typeof predictionSignals.$inferSelect;
export type NewPredictionSignal = typeof predictionSignals.$inferInsert;

export type MarketPool = typeof marketPools.$inferSelect;
export type NewMarketPool = typeof marketPools.$inferInsert;

export type PoolParticipant = typeof poolParticipants.$inferSelect;
export type NewPoolParticipant = typeof poolParticipants.$inferInsert;

export type UserMarket = typeof userMarkets.$inferSelect;
export type NewUserMarket = typeof userMarkets.$inferInsert;

export type CommodityListing = typeof commodityListings.$inferSelect;
export type NewCommodityListing = typeof commodityListings.$inferInsert;

export type CommodityBid = typeof commodityBids.$inferSelect;
export type NewCommodityBid = typeof commodityBids.$inferInsert;

// Scraped Exchange Data - for data from African commodity exchanges
export const scrapedExchangeData = sqliteTable('scraped_exchange_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exchangeName: text('exchange_name').notNull(), // e.g., 'africaexchange.com', 'eatta.co.ke'
  exchangeUrl: text('exchange_url').notNull(),
  commodityId: integer('commodity_id').references(() => commodities.id),
  commodityName: text('commodity_name').notNull(),
  price: real('price'),
  currency: text('currency'),
  volume: real('volume'),
  unit: text('unit'),
  quality: text('quality'),
  scrapedAt: integer('scraped_at', { mode: 'timestamp' }).notNull(),
  rawData: text('raw_data'), // JSON string with all scraped fields
  status: text('status').default('ACTIVE'), // ACTIVE, ERROR, STALE
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// API Access Logs - for tracking micropayments and enterprise usage
export const apiAccessLogs = sqliteTable('api_access_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => users.id),
  apiKey: text('api_key'),
  endpoint: text('endpoint').notNull(), // e.g., '/api/predictions', '/api/live-prices'
  method: text('method').notNull(),
  requestData: text('request_data'), // JSON string
  responseStatus: integer('response_status'),
  paymentStatus: text('payment_status').default('PENDING'), // PENDING, PAID, FAILED, FREE
  paymentAmount: real('payment_amount').default(0),
  paymentCurrency: text('payment_currency').default('USDC'),
  x402TransactionId: text('x402_transaction_id'), // X402 protocol transaction ID
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  accessedAt: integer('accessed_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Enterprise API Keys - for managing enterprise access
export const enterpriseApiKeys = sqliteTable('enterprise_api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  apiKey: text('api_key').notNull().unique(),
  name: text('name').notNull(), // e.g., "Production API Key"
  description: text('description'),
  tier: text('tier').default('FREE'), // FREE, BASIC, PREMIUM, ENTERPRISE
  rateLimit: integer('rate_limit').default(100), // requests per hour
  monthlyQuota: integer('monthly_quota').default(10000), // monthly request quota
  currentUsage: integer('current_usage').default(0),
  allowedEndpoints: text('allowed_endpoints'), // JSON array of allowed endpoints
  isActive: integer('is_active', { mode: 'boolean' }).default(1),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// User Deals - for users listing their own deals (real estate, commodities, etc.)
export const userDeals = sqliteTable('user_deals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  dealType: text('deal_type').notNull(), // COMMODITY, REAL_ESTATE, EQUIPMENT, OTHER
  description: text('description').notNull(),
  commodityId: integer('commodity_id').references(() => commodities.id),
  category: text('category'), // e.g., "Agricultural Land", "Commercial Property"
  quantity: real('quantity'),
  unit: text('unit'),
  askingPrice: real('asking_price').notNull(),
  currency: text('currency').notNull().default('USD'),
  location: text('location'),
  countryId: integer('country_id').references(() => countries.id),
  images: text('images'), // JSON array of image URLs
  documents: text('documents'), // JSON array of document URLs
  settlementTerms: text('settlement_terms'),
  paymentMethod: text('payment_method'), // USDC, M-PESA, BANK_TRANSFER, CASH
  status: text('status').default('ACTIVE'), // ACTIVE, PENDING, SOLD, EXPIRED, CANCELLED
  visibility: text('visibility').default('PUBLIC'), // PUBLIC, PRIVATE, UNLISTED
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  viewCount: integer('view_count').default(0),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Deal Inquiries - for managing interest in user deals
export const dealInquiries = sqliteTable('deal_inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dealId: integer('deal_id').notNull().references(() => userDeals.id),
  inquirerUserId: text('inquirer_user_id').references(() => users.id),
  inquirerName: text('inquirer_name'),
  inquirerEmail: text('inquirer_email').notNull(),
  inquirerPhone: text('inquirer_phone'),
  message: text('message').notNull(),
  offerAmount: real('offer_amount'),
  status: text('status').default('NEW'), // NEW, READ, REPLIED, ACCEPTED, REJECTED
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export type ScrapedExchangeData = typeof scrapedExchangeData.$inferSelect;
export type NewScrapedExchangeData = typeof scrapedExchangeData.$inferInsert;

export type ApiAccessLog = typeof apiAccessLogs.$inferSelect;
export type NewApiAccessLog = typeof apiAccessLogs.$inferInsert;

export type EnterpriseApiKey = typeof enterpriseApiKeys.$inferSelect;
export type NewEnterpriseApiKey = typeof enterpriseApiKeys.$inferInsert;

export type UserDeal = typeof userDeals.$inferSelect;
export type NewUserDeal = typeof userDeals.$inferInsert;

export type DealInquiry = typeof dealInquiries.$inferSelect;
export type NewDealInquiry = typeof dealInquiries.$inferInsert;

// User Profiles for multi-role system
export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  walletAddress: text('wallet_address').notNull(),
  roles: text('roles').notNull(), // JSON array: ["PUBLIC", "FARMER", "TRADER", "COOPERATIVE"]
  activeRole: text('active_role').notNull().default('PUBLIC'),
  dvcScore: integer('dvc_score').default(0), // Digital Verifiable Credentials score for farmers
  kycVerified: integer('kyc_verified', { mode: 'boolean' }).default(false),
  metadata: text('metadata'), // JSON object for role-specific data
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;