# New Features Documentation

This document describes the newly implemented features for the African Commodity Markets platform.

## Table of Contents

1. [User Deal Listings](#user-deal-listings)
2. [Exchange Data Scraping](#exchange-data-scraping)
3. [X402 Micropayments](#x402-micropayments)
4. [Enterprise API Access](#enterprise-api-access)

---

## User Deal Listings

### Overview
Users can now list their own deals in the marketplace, including commodities, real estate, equipment, and other items. This creates a peer-to-peer marketplace within the platform.

### Features
- **List Deals**: Users can create listings with detailed information
- **Browse Deals**: Anyone can browse active deals
- **Inquiries**: Buyers can send inquiries to sellers
- **Deal Management**: Users can view and manage their own listings

### Database Schema

#### `userDeals` Table
- `id`: Unique identifier
- `userId`: Owner of the deal (references `users.id`)
- `title`: Deal title
- `dealType`: Type of deal (COMMODITY, REAL_ESTATE, EQUIPMENT, OTHER)
- `description`: Detailed description
- `askingPrice`: Price in specified currency
- `currency`: Currency (USD, KES, NGN, GHS, ZAR)
- `location`: Geographic location
- `status`: ACTIVE, PENDING, SOLD, EXPIRED, CANCELLED
- `viewCount`: Number of times viewed
- `contactEmail`, `contactPhone`: Contact information

#### `dealInquiries` Table
- Stores buyer inquiries for deals
- Links to `userDeals` via `dealId`
- Tracks inquiry status (NEW, READ, REPLIED, ACCEPTED, REJECTED)

### API Endpoints

#### List/Create Deals
```
GET /api/deals - List all active deals or user's deals
POST /api/deals - Create a new deal (requires authentication)
```

Query parameters for GET:
- `my=true` - Get only user's own deals
- `type=COMMODITY` - Filter by deal type
- `status=ACTIVE` - Filter by status

#### Manage Specific Deal
```
GET /api/deals/[id] - Get deal details
PUT /api/deals/[id] - Update deal (owner only)
DELETE /api/deals/[id] - Delete/cancel deal (owner only)
```

#### Deal Inquiries
```
GET /api/deals/[id]/inquiries - Get inquiries (owner only)
POST /api/deals/[id]/inquiries - Send inquiry to seller
```

### UI Pages

#### `/deals` - Browse all deals
- Filter by type (All, Commodities, Real Estate, Equipment)
- View deal cards with basic information
- Click to view details

#### `/deals/new` - Create new deal
- Form with all deal details
- Support for multiple currencies
- Contact information (optional)
- Settlement terms

#### `/deals/[id]` - View deal details
- Full deal information
- Contact seller button (if not owner)
- Owner actions (edit, delete)
- Inquiry form

#### `/deals/my` - Manage user's deals
- List of all user's deals
- Statistics (total deals, active, views, avg price)
- Quick actions (view, edit)

### Usage Example

```javascript
// Create a new deal
const response = await fetch('/api/deals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Premium Grade AA Coffee - 50 MT',
    dealType: 'COMMODITY',
    description: 'High-quality Arabica coffee from Kenya',
    quantity: 50,
    unit: 'MT',
    askingPrice: 150000,
    currency: 'USD',
    location: 'Nairobi, Kenya',
    paymentMethod: 'USDC',
  }),
})
```

---

## Exchange Data Scraping

### Overview
Automated scraping of commodity price data from traditional African exchanges to supplement existing data sources.

### Supported Exchanges
1. **Africa Exchange** (africaexchange.com)
2. **EATTA** - East African Tea Trade Association (eatta.co.ke)
3. **Nairobi Coffee Exchange** (nce.co.ke)

### Database Schema

#### `scrapedExchangeData` Table
- `exchangeName`: Name of the exchange
- `exchangeUrl`: Source URL
- `commodityId`: Link to commodities table (if matched)
- `commodityName`: Name as scraped
- `price`, `currency`: Price information
- `volume`, `unit`: Trading volume
- `quality`: Grade/quality information
- `scrapedAt`: Timestamp of scraping
- `rawData`: JSON with all scraped fields
- `status`: ACTIVE, ERROR, STALE

### Implementation

#### Scraper Module (`lib/scrapers/exchange-scraper.ts`)

```typescript
import { scrapeAllExchanges, getMockScrapedData } from '@/lib/scrapers/exchange-scraper'

// Scrape all exchanges
const data = await scrapeAllExchanges()

// Or use mock data for testing
const mockData = getMockScrapedData()
```

#### Cron Job Endpoint
```
GET /api/cron/scrape-exchanges
POST /api/cron/scrape-exchanges
```

**Security**: Requires `Authorization: Bearer <CRON_SECRET>` header

### Setup

1. **Set Environment Variable**
```bash
CRON_SECRET=your-secret-here
```

2. **Configure Vercel Cron Job** (vercel.json)
```json
{
  "crons": [{
    "path": "/api/cron/scrape-exchanges",
    "schedule": "0 */6 * * *"
  }]
}
```

3. **Manual Trigger**
```bash
curl -X POST https://your-domain.com/api/cron/scrape-exchanges \
  -H "Authorization: Bearer your-cron-secret"
```

### Extending the Scraper

To add a new exchange:

```typescript
export async function scrapeNewExchange(): Promise<ScrapedData[]> {
  const results: ScrapedData[] = []
  const exchangeUrl = 'https://newexchange.com/'
  
  try {
    const response = await fetch(exchangeUrl)
    const html = await response.text()
    
    // Parse HTML and extract data
    // Use cheerio or similar library
    
    results.push({
      exchangeName: 'New Exchange',
      exchangeUrl,
      commodityName: 'Coffee',
      price: 2.50,
      currency: 'USD',
      volume: 100,
      unit: 'MT',
      rawData: {},
      scrapedAt: new Date(),
    })
  } catch (error) {
    console.error('Error scraping:', error)
  }
  
  return results
}
```

---

## X402 Micropayments

### Overview
Implementation of the HTTP 402 (Payment Required) status code for collecting micropayments when users access premium endpoints like AI predictions.

### Pricing Tiers

#### FREE Tier
- Pay per request
- 100 requests/hour
- 1,000 requests/month
- No subscription fee

#### BASIC Tier ($10/month)
- 1,000 requests/hour
- 10,000 requests/month
- Email support
- No per-request fees

#### PREMIUM Tier ($50/month)
- 5,000 requests/hour
- 100,000 requests/month
- Priority support
- Advanced analytics
- Webhook notifications

#### ENTERPRISE Tier ($500/month)
- 50,000 requests/hour
- 1,000,000 requests/month
- Dedicated support
- Custom integration
- SLA guarantee
- White-label options

### Endpoint Pricing (FREE Tier)

| Endpoint | Price per Request |
|----------|------------------|
| `/api/agents/commodity/predict` | $0.01 |
| `/api/agents/commodity/predictions` | $0.005 |
| `/api/live-prices` | $0.002 |
| `/api/oracle/resolve` | $0.05 |
| `/api/markets/stake` | Free (fee from stake) |

### Implementation

#### Payment Module (`lib/x402/payment.ts`)

```typescript
import { 
  createPaymentRequiredResponse,
  hasValidPayment,
  verifyPayment 
} from '@/lib/x402/payment'

// In your API route
if (!hasValidPayment(request.headers)) {
  return createPaymentRequiredResponse({
    amount: 0.01,
    currency: 'USDC',
    recipient: process.env.MICROPAYMENT_RECIPIENT_ADDRESS,
    description: 'AI Prediction Request',
    endpoint: '/api/agents/commodity/predict',
  })
}
```

#### Client Usage

```javascript
// First request - get payment info
const response = await fetch('/api/agents/commodity/predict', {
  method: 'POST',
  body: JSON.stringify({ commodity: 'COFFEE' }),
})

if (response.status === 402) {
  const paymentInfo = await response.json()
  
  // Make payment on-chain
  const txId = await sendUSDC({
    to: paymentInfo.payment.recipient,
    amount: paymentInfo.payment.amount,
  })
  
  // Retry with payment proof
  const response2 = await fetch('/api/agents/commodity/predict', {
    method: 'POST',
    headers: {
      'X-Payment-Tx': txId,
      'X-Payment-Amount': paymentInfo.payment.amount,
      'X-Payment-Currency': 'USDC',
    },
    body: JSON.stringify({ commodity: 'COFFEE' }),
  })
}
```

### Access Logging

All API requests are logged in the `apiAccessLogs` table for:
- Analytics
- Billing
- Usage monitoring
- Fraud detection

Fields tracked:
- User ID and API key
- Endpoint and method
- Request/response data
- Payment status and transaction ID
- IP address and user agent
- Timestamp

---

## Enterprise API Access

### Overview
API key management system for enterprise users to access platform data programmatically.

### Database Schema

#### `enterpriseApiKeys` Table
- `apiKey`: Unique API key (format: `afr_...`)
- `userId`: Owner of the API key
- `name`: Friendly name for the key
- `tier`: FREE, BASIC, PREMIUM, ENTERPRISE
- `rateLimit`: Requests per hour
- `monthlyQuota`: Total monthly requests
- `currentUsage`: Current month's usage
- `allowedEndpoints`: JSON array of allowed endpoints
- `isActive`: Boolean flag
- `expiresAt`: Optional expiration date

### API Endpoints

#### Manage API Keys
```
GET /api/enterprise/api-keys - List user's API keys
POST /api/enterprise/api-keys - Create new API key
DELETE /api/enterprise/api-keys?keyId=123 - Revoke API key
```

### Usage

#### Create API Key

```javascript
const response = await fetch('/api/enterprise/api-keys', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Production API Key',
    description: 'Main API key for production app',
    tier: 'PREMIUM',
    allowedEndpoints: ['*'], // or specific endpoints
  }),
})

const { key } = await response.json()
console.log('API Key:', key.apiKey) // Save this securely!
```

#### Use API Key

```javascript
// In Authorization header
const response = await fetch('/api/agents/commodity/predict', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer afr_your_api_key_here`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ commodity: 'COFFEE' }),
})

// Or in X-API-Key header
const response = await fetch('/api/live-prices', {
  headers: {
    'X-API-Key': 'afr_your_api_key_here',
  },
})
```

#### API Authentication Middleware

The `lib/x402/api-auth.ts` module provides:
- `validateApiKey()` - Validate API key and check quotas
- `authenticateApiRequest()` - Full authentication flow
- `logApiAccess()` - Log request for billing
- `hasEndpointAccess()` - Check endpoint permissions

### Rate Limiting

Rate limits are enforced per tier:
- FREE: 100 requests/hour
- BASIC: 1,000 requests/hour
- PREMIUM: 5,000 requests/hour
- ENTERPRISE: 50,000 requests/hour

### Best Practices

1. **Security**
   - Never commit API keys to version control
   - Rotate keys periodically
   - Use environment variables
   - Restrict endpoint access when possible

2. **Rate Limiting**
   - Implement exponential backoff
   - Cache responses when appropriate
   - Monitor usage via dashboard

3. **Error Handling**
   - Handle 401 (Unauthorized)
   - Handle 429 (Rate Limit Exceeded)
   - Handle 402 (Payment Required)

---

## Testing

### Test User Deals

```bash
# Create a test deal
curl -X POST http://localhost:3000/api/deals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Coffee Deal",
    "dealType": "COMMODITY",
    "description": "Test description",
    "askingPrice": 1000,
    "currency": "USD"
  }'
```

### Test Scraping

```bash
# Trigger scraper
curl -X POST http://localhost:3000/api/cron/scrape-exchanges \
  -H "Authorization: Bearer your-cron-secret"
```

### Test API Keys

```bash
# Create API key (requires authentication)
curl -X POST http://localhost:3000/api/enterprise/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "tier": "FREE"
  }'
```

---

## Future Enhancements

### User Deals
- [ ] Image uploads for deals
- [ ] Document attachments
- [ ] Escrow integration
- [ ] Quality verification service
- [ ] Logistics integration
- [ ] Ratings and reviews

### Exchange Scraping
- [ ] Real HTML parsing (cheerio/puppeteer)
- [ ] More exchanges (cocoa boards, cotton exchanges)
- [ ] Data validation and anomaly detection
- [ ] Historical data backfill
- [ ] Real-time updates via WebSocket

### X402 Payments
- [ ] Multiple payment methods (Lightning Network, etc.)
- [ ] Subscription management UI
- [ ] Usage dashboard
- [ ] Billing invoices
- [ ] Payment history

### Enterprise API
- [ ] Webhook notifications
- [ ] Custom rate limits
- [ ] Team management
- [ ] API analytics dashboard
- [ ] GraphQL endpoint
- [ ] SDK libraries (Python, JavaScript, Go)

---

## Support

For questions or issues with these features, please:
1. Check the documentation
2. Review example code in the repository
3. Open an issue on GitHub
4. Contact support@afrifutures.io

## License

MIT License - See LICENSE file for details
