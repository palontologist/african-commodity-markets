CREATE TABLE IF NOT EXISTS "commodity_predictions" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "commodity_id" integer NOT NULL,
    "region" text NOT NULL,
    "horizon" text NOT NULL,
    "predicted_price" real,
    "currency" text NOT NULL,
    "confidence" real,
    "narrative" text,
    "model" text NOT NULL,
    "as_of" integer NOT NULL,
    "created_at" integer DEFAULT CURRENT_TIMESTAMP,
    "updated_at" integer DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "prediction_signals" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "prediction_id" integer NOT NULL,
    "signal_type" text NOT NULL,
    "description" text,
    "strength" real,
    "created_at" integer DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("prediction_id") REFERENCES "commodity_predictions"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "market_pools" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "name" text NOT NULL,
    "commodity_id" integer NOT NULL,
    "creator_user_id" text,
    "target_outcome" text NOT NULL,
    "target_date" integer,
    "current_liquidity" real DEFAULT 0,
    "token_address" text,
    "status" text DEFAULT 'OPEN',
    "created_at" integer DEFAULT CURRENT_TIMESTAMP,
    "updated_at" integer DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY ("creator_user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "pool_participants" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "pool_id" integer NOT NULL,
    "user_id" text NOT NULL,
    "role" text NOT NULL,
    "contribution" real DEFAULT 0,
    "shares" real DEFAULT 0,
    "joined_at" integer DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("pool_id") REFERENCES "market_pools"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "user_markets" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "market_id" integer,
    "creator_user_id" text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "commodity_id" integer,
    "country_id" integer,
    "settlement_terms" text,
    "status" text DEFAULT 'DRAFT',
    "created_at" integer DEFAULT CURRENT_TIMESTAMP,
    "updated_at" integer DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY ("creator_user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "commodity_listings" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "user_market_id" integer,
    "commodity_id" integer NOT NULL,
    "listing_type" text NOT NULL,
    "quantity" real NOT NULL,
    "unit" text NOT NULL,
    "asking_price" real NOT NULL,
    "currency" text NOT NULL,
    "expires_at" integer,
    "onchain_token_id" text,
    "status" text DEFAULT 'ACTIVE',
    "created_at" integer DEFAULT CURRENT_TIMESTAMP,
    "updated_at" integer DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_market_id") REFERENCES "user_markets"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "commodity_bids" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "listing_id" integer NOT NULL,
    "bidder_user_id" text,
    "amount" real NOT NULL,
    "currency" text NOT NULL,
    "message" text,
    "status" text DEFAULT 'PENDING',
    "created_at" integer DEFAULT CURRENT_TIMESTAMP,
    "updated_at" integer DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("listing_id") REFERENCES "commodity_listings"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY ("bidder_user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE INDEX IF NOT EXISTS "commodity_predictions_commodity_idx" ON "commodity_predictions" ("commodity_id", "region", "horizon");
CREATE INDEX IF NOT EXISTS "market_pools_status_idx" ON "market_pools" ("status");
CREATE INDEX IF NOT EXISTS "commodity_listings_status_idx" ON "commodity_listings" ("status");
CREATE INDEX IF NOT EXISTS "commodity_bids_listing_idx" ON "commodity_bids" ("listing_id");
