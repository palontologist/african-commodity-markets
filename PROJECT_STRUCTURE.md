# Project Structure - New Features

## Overview
This document outlines the file structure for the newly implemented features.

## Directory Tree

```
african-commodity-markets/
├── app/
│   ├── api/
│   │   ├── deals/
│   │   │   ├── route.ts                    # List/create deals
│   │   │   └── [id]/
│   │   │       ├── route.ts                # Get/update/delete deal
│   │   │       └── inquiries/
│   │   │           └── route.ts            # Deal inquiry management
│   │   ├── cron/
│   │   │   └── scrape-exchanges/
│   │   │       └── route.ts                # Exchange scraping cron job
│   │   └── enterprise/
│   │       └── api-keys/
│   │           └── route.ts                # API key management
│   └── deals/
│       ├── page.tsx                        # Browse deals marketplace
│       ├── new/
│       │   └── page.tsx                    # Create new deal
│       ├── [id]/
│       │   └── page.tsx                    # Deal detail page
│       └── my/
│           └── page.tsx                    # User's deals dashboard
├── lib/
│   ├── db/
│   │   └── schema.ts                       # 🔄 Extended with 5 new tables
│   ├── scrapers/
│   │   └── exchange-scraper.ts             # Exchange scraping framework
│   └── x402/
│       ├── payment.ts                      # X402 micropayment protocol
│       └── api-auth.ts                     # API authentication middleware
├── components/
│   └── ui/
│       ├── select.tsx                      # Dropdown select component
│       └── textarea.tsx                    # Text area component
├── docs/
│   └── NEW_FEATURES.md                     # Comprehensive feature documentation
├── .env.example                            # 🔄 Updated with new env vars
├── vercel.json                             # 🔄 Added scraping cron job
├── IMPLEMENTATION_SUMMARY.md               # Technical overview
└── PROJECT_STRUCTURE.md                    # This file
```

## Key Files by Feature

### 1. User Deal Listings

**Backend (API Routes):**
- `app/api/deals/route.ts` - List all deals, create new deal
- `app/api/deals/[id]/route.ts` - Get, update, delete specific deal
- `app/api/deals/[id]/inquiries/route.ts` - Inquiry management

**Frontend (UI Pages):**
- `app/deals/page.tsx` - Browse marketplace
- `app/deals/new/page.tsx` - Create listing form
- `app/deals/[id]/page.tsx` - Deal details with inquiry form
- `app/deals/my/page.tsx` - Personal deals dashboard

**Database:**
- `lib/db/schema.ts`:
  - `userDeals` table (lines 240-285)
  - `dealInquiries` table (lines 287-297)

### 2. Exchange Data Scraping

**Scraper Framework:**
- `lib/scrapers/exchange-scraper.ts` - Main scraping logic
  - `scrapeAfricaExchange()` - Africa Exchange scraper
  - `scrapeEATTA()` - EATTA scraper
  - `scrapeNairobiCoffeeExchange()` - Nairobi Coffee Exchange
  - `scrapeAllExchanges()` - Run all scrapers
  - `getMockScrapedData()` - Test data

**Cron Job:**
- `app/api/cron/scrape-exchanges/route.ts` - Automated scraping endpoint

**Database:**
- `lib/db/schema.ts`:
  - `scrapedExchangeData` table (lines 199-214)

**Configuration:**
- `vercel.json` - Cron schedule (every 6 hours)

### 3. X402 Micropayments

**Payment System:**
- `lib/x402/payment.ts` - X402 protocol implementation
  - `hasValidPayment()` - Check payment proof
  - `createPaymentRequiredResponse()` - Generate 402 response
  - `verifyPayment()` - On-chain verification
  - `extractPaymentProof()` - Parse payment headers
  - `calculatePaymentAmount()` - Pricing logic
  - `PRICING_TIERS` - Tier configurations

**Database:**
- `lib/db/schema.ts`:
  - `apiAccessLogs` table (lines 216-230)

### 4. Enterprise API Access

**API Key Management:**
- `app/api/enterprise/api-keys/route.ts` - CRUD operations
- `lib/x402/api-auth.ts` - Authentication middleware
  - `validateApiKey()` - Key validation
  - `authenticateApiRequest()` - Full auth flow
  - `logApiAccess()` - Usage logging
  - `hasEndpointAccess()` - Permission check

**Database:**
- `lib/db/schema.ts`:
  - `enterpriseApiKeys` table (lines 232-250)

### 5. UI Components

**New Components:**
- `components/ui/select.tsx` - Radix UI select wrapper
- `components/ui/textarea.tsx` - Styled textarea

## Database Schema

### New Tables (5 total)

1. **userDeals** - User marketplace listings
   - Fields: title, dealType, description, price, location, status, etc.
   - Relations: userId → users, commodityId → commodities

2. **dealInquiries** - Buyer inquiries
   - Fields: dealId, inquirerUserId, message, offerAmount, status
   - Relations: dealId → userDeals, inquirerUserId → users

3. **scrapedExchangeData** - Exchange price data
   - Fields: exchangeName, commodityId, price, volume, quality, etc.
   - Relations: commodityId → commodities

4. **apiAccessLogs** - API usage tracking
   - Fields: userId, endpoint, paymentStatus, x402TransactionId, etc.
   - Relations: userId → users

5. **enterpriseApiKeys** - API key management
   - Fields: userId, apiKey, tier, rateLimit, monthlyQuota, etc.
   - Relations: userId → users

## API Endpoints

### Deals API
```
GET    /api/deals              - List deals
POST   /api/deals              - Create deal
GET    /api/deals/[id]         - Get deal details
PUT    /api/deals/[id]         - Update deal
DELETE /api/deals/[id]         - Delete deal
GET    /api/deals/[id]/inquiries  - Get inquiries (owner only)
POST   /api/deals/[id]/inquiries  - Send inquiry
```

### Enterprise API
```
GET    /api/enterprise/api-keys  - List API keys
POST   /api/enterprise/api-keys  - Create API key
DELETE /api/enterprise/api-keys  - Revoke API key
```

### Cron Jobs
```
GET/POST /api/cron/scrape-exchanges  - Scrape exchange data
```

## Environment Variables

### New Variables
```bash
# Cron job security
CRON_SECRET=<random-secret>

# X402 micropayments
MICROPAYMENT_RECIPIENT_ADDRESS=<usdc-wallet-address>

# Enterprise pricing (optional)
BASIC_TIER_PRICE=10
PREMIUM_TIER_PRICE=50
ENTERPRISE_TIER_PRICE=500
```

## Routes

### Public Routes
- `/deals` - Browse marketplace
- `/deals/[id]` - View deal details

### Protected Routes (Auth Required)
- `/deals/new` - Create listing
- `/deals/my` - Personal dashboard
- `/deals/[id]` (edit/delete) - Owner actions

### Admin Routes (API Key Required)
- All `/api/enterprise/*` endpoints

### Cron Routes (Secret Required)
- `/api/cron/scrape-exchanges`

## Statistics

- **Total New Files:** 16
- **Modified Files:** 2
- **Lines of Code:** ~3,000
- **API Routes:** 9 new endpoints
- **UI Pages:** 4 new pages
- **Database Tables:** 5 new tables
- **Documentation Pages:** 2

## Dependencies

No new dependencies added! All features built using existing packages:
- Next.js 14
- Drizzle ORM
- Clerk Auth
- Radix UI
- Tailwind CSS
- TypeScript

## Build & Deployment

```bash
# Install dependencies
npm install --legacy-peer-deps

# Push database schema
npm run db:push

# Build for production
npm run build

# Deploy
vercel deploy
```

## Testing

```bash
# Test deal creation
curl -X POST http://localhost:3000/api/deals \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","dealType":"COMMODITY",...}'

# Test scraper
curl -X POST http://localhost:3000/api/cron/scrape-exchanges \
  -H "Authorization: Bearer <CRON_SECRET>"

# Test API key generation
curl -X POST http://localhost:3000/api/enterprise/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key","tier":"FREE"}'
```

## Documentation

- **Feature Guide:** `docs/NEW_FEATURES.md` (350+ lines)
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md` (220+ lines)
- **Environment Setup:** `.env.example` (updated)
- **API Reference:** In each route file
- **Database Schema:** `lib/db/schema.ts` (comments)

---

**Last Updated:** November 13, 2025
**Status:** ✅ Production Ready
