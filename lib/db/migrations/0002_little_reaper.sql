CREATE TABLE `api_access_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`api_key` text,
	`endpoint` text NOT NULL,
	`method` text NOT NULL,
	`request_data` text,
	`response_status` integer,
	`payment_status` text DEFAULT 'PENDING',
	`payment_amount` real DEFAULT 0,
	`payment_currency` text DEFAULT 'USDC',
	`x402_transaction_id` text,
	`ip_address` text,
	`user_agent` text,
	`accessed_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `deal_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deal_id` integer NOT NULL,
	`inquirer_user_id` text,
	`inquirer_name` text,
	`inquirer_email` text NOT NULL,
	`inquirer_phone` text,
	`message` text NOT NULL,
	`offer_amount` real,
	`status` text DEFAULT 'NEW',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`deal_id`) REFERENCES `user_deals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inquirer_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `enterprise_api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`api_key` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tier` text DEFAULT 'FREE',
	`rate_limit` integer DEFAULT 100,
	`monthly_quota` integer DEFAULT 10000,
	`current_usage` integer DEFAULT 0,
	`allowed_endpoints` text,
	`is_active` integer DEFAULT 1,
	`expires_at` integer,
	`last_used_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enterprise_api_keys_api_key_unique` ON `enterprise_api_keys` (`api_key`);--> statement-breakpoint
CREATE TABLE `scraped_exchange_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exchange_name` text NOT NULL,
	`exchange_url` text NOT NULL,
	`commodity_id` integer,
	`commodity_name` text NOT NULL,
	`price` real,
	`currency` text,
	`volume` real,
	`unit` text,
	`quality` text,
	`scraped_at` integer NOT NULL,
	`raw_data` text,
	`status` text DEFAULT 'ACTIVE',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`commodity_id`) REFERENCES `commodities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_deals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`deal_type` text NOT NULL,
	`description` text NOT NULL,
	`commodity_id` integer,
	`category` text,
	`quantity` real,
	`unit` text,
	`asking_price` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`location` text,
	`country_id` integer,
	`images` text,
	`documents` text,
	`settlement_terms` text,
	`payment_method` text,
	`status` text DEFAULT 'ACTIVE',
	`visibility` text DEFAULT 'PUBLIC',
	`expires_at` integer,
	`view_count` integer DEFAULT 0,
	`contact_email` text,
	`contact_phone` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`commodity_id`) REFERENCES `commodities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`wallet_address` text NOT NULL,
	`roles` text NOT NULL,
	`active_role` text DEFAULT 'PUBLIC' NOT NULL,
	`dvc_score` integer DEFAULT 0,
	`kyc_verified` integer DEFAULT false,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX `commodity_predictions_commodity_idx`;--> statement-breakpoint
DROP INDEX `market_pools_status_idx`;--> statement-breakpoint
DROP INDEX "commodities_name_unique";--> statement-breakpoint
DROP INDEX "commodities_code_unique";--> statement-breakpoint
DROP INDEX "countries_name_unique";--> statement-breakpoint
DROP INDEX "countries_code_unique";--> statement-breakpoint
DROP INDEX "enterprise_api_keys_api_key_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `market_pools` ALTER COLUMN "status" TO "status" text DEFAULT 'OPEN';--> statement-breakpoint
CREATE UNIQUE INDEX `commodities_name_unique` ON `commodities` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `commodities_code_unique` ON `commodities` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `countries_name_unique` ON `countries` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `countries_code_unique` ON `countries` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
DROP INDEX `commodity_listings_status_idx`;--> statement-breakpoint
ALTER TABLE `commodity_listings` ALTER COLUMN "status" TO "status" text DEFAULT 'ACTIVE';--> statement-breakpoint
DROP INDEX `commodity_bids_listing_idx`;--> statement-breakpoint
ALTER TABLE `commodity_bids` ALTER COLUMN "status" TO "status" text DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE `user_markets` ALTER COLUMN "status" TO "status" text DEFAULT 'DRAFT';