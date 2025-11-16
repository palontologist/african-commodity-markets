# Wheat and Maize Flour Oracle API Documentation

## Overview

The Wheat and Maize Flour Oracle API provides real-time and historical price data for wheat and maize flour commodities, with a focus on the Kenyan market. The API integrates multiple data sources including Tridge.com, World Bank, and Alpha Vantage to ensure reliable price information.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Currently, the API is publicly accessible for GET requests. POST requests for storing data may require authentication in production.

## Endpoints

### 1. Live Prices API

#### Get Live Price for Any Commodity

```http
GET /api/live-prices?symbol={SYMBOL}
```

**Parameters:**
- `symbol` (required): Commodity symbol (WHEAT, MAIZE, COFFEE, COCOA, etc.)
- `region` (optional): Region code (AFRICA, LATAM). Default: AFRICA

**Example Request:**
```bash
curl "https://your-domain.com/api/live-prices?symbol=WHEAT"
```

**Example Response:**
```json
{
  "region": "AFRICA",
  "data": {
    "price": 285.50,
    "currency": "USD",
    "timestamp": "2025-11-16T14:30:00.000Z",
    "source": "Tridge"
  }
}
```

#### Get Multiple Commodities

```http
GET /api/live-prices?symbols=WHEAT,MAIZE,COFFEE
```

**Example Response:**
```json
{
  "region": "AFRICA",
  "data": [
    {
      "price": 285.50,
      "currency": "USD",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "Tridge"
    },
    {
      "price": 225.75,
      "currency": "USD",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "Tridge"
    },
    {
      "price": 250.00,
      "currency": "USD",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "World Bank"
    }
  ]
}
```

### 2. Wheat and Maize Oracle API

#### Get Current Wheat and Maize Prices

```http
GET /api/oracle/wheat-maize
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "commodity": "WHEAT",
      "price": 285.50,
      "currency": "USD",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "Tridge"
    },
    {
      "commodity": "MAIZE",
      "price": 225.75,
      "currency": "USD",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "Tridge"
    }
  ],
  "timestamp": "2025-11-16T14:30:00.000Z",
  "sources": ["Alpha Vantage", "Tridge", "World Bank", "Fallback"],
  "note": "Prices automatically fallback through multiple sources"
}
```

#### Get Specific Commodity

```http
GET /api/oracle/wheat-maize?commodity=WHEAT
```

**Parameters:**
- `commodity` (optional): Specific commodity (WHEAT or MAIZE)

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "commodity": "WHEAT",
      "price": 285.50,
      "currency": "USD",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "Tridge"
    }
  ],
  "timestamp": "2025-11-16T14:30:00.000Z",
  "sources": ["Alpha Vantage", "Tridge", "World Bank", "Fallback"],
  "note": "Prices automatically fallback through multiple sources"
}
```

#### Get Tridge-Specific Data

```http
GET /api/oracle/wheat-maize?source=tridge
```

**Parameters:**
- `source=tridge`: Get data specifically from Tridge.com

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "commodity": "WHEAT",
      "price": 285.50,
      "currency": "USD",
      "unit": "MT",
      "country": "Kenya",
      "countryCode": "KE",
      "region": "East Africa",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "Tridge",
      "quality": "Standard"
    },
    {
      "commodity": "MAIZE",
      "price": 225.75,
      "currency": "USD",
      "unit": "MT",
      "country": "Kenya",
      "countryCode": "KE",
      "region": "East Africa",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "Tridge",
      "quality": "Yellow Maize"
    }
  ],
  "source": "Tridge",
  "timestamp": "2025-11-16T14:30:00.000Z",
  "mock": false
}
```

#### Get Historical Data

```http
GET /api/oracle/wheat-maize?historical=true
```

**Parameters:**
- `historical=true`: Get historical price data from database
- `commodity` (optional): Filter by specific commodity

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "commodity": "WHEAT",
      "price": 285.50,
      "currency": "USD",
      "unit": "MT",
      "priceDate": "2025-11-16T14:30:00.000Z",
      "quality": "Standard",
      "source": "Tridge",
      "market": "Nairobi Grain Exchange"
    },
    {
      "id": 122,
      "commodity": "WHEAT",
      "price": 283.25,
      "currency": "USD",
      "unit": "MT",
      "priceDate": "2025-11-15T14:30:00.000Z",
      "quality": "Standard",
      "source": "World Bank",
      "market": "Nairobi Grain Exchange"
    }
  ],
  "count": 2,
  "source": "Database",
  "timestamp": "2025-11-16T14:30:00.000Z"
}
```

#### Store Price Data

```http
POST /api/oracle/wheat-maize
```

**Request Body:**
```json
{
  "commodity": "WHEAT",
  "price": 285.50,
  "currency": "USD",
  "unit": "MT",
  "quality": "Standard",
  "source": "Tridge",
  "marketId": 1
}
```

**Required Fields:**
- `commodity`: WHEAT or MAIZE
- `price`: Numeric price value
- `currency`: Currency code (e.g., USD, KES)
- `unit`: Unit of measurement (e.g., MT, kg)

**Optional Fields:**
- `marketId`: Market identifier (defaults to Nairobi market)
- `quality`: Quality grade
- `source`: Data source

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 124,
    "commodityId": 7,
    "marketId": 1,
    "price": 285.50,
    "currency": "USD",
    "unit": "MT",
    "priceDate": "2025-11-16T14:30:00.000Z",
    "quality": "Standard",
    "source": "Tridge"
  },
  "message": "Price data stored successfully"
}
```

## Data Sources

The API automatically falls back through multiple data sources in order of preference:

1. **Alpha Vantage** (if API key configured)
   - Real-time commodity prices
   - Rate limit: 25 requests/day (free tier)

2. **Tridge.com** (for wheat and maize)
   - Kenya-specific market prices
   - Real-time data from African markets

3. **World Bank Pink Sheet**
   - Monthly commodity price data
   - Free, no API key required
   - Reliable historical data

4. **Fallback Prices**
   - Static prices used when all sources fail
   - Ensures API always returns data

## Rate Limiting

- No rate limiting currently implemented for public endpoints
- Consider implementing rate limiting for production use
- Alpha Vantage free tier: 25 requests/day

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: commodity, price, currency, unit"
}
```

### 404 Not Found
```json
{
  "error": "Commodity WHEAT not found in database"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch wheat/maize prices",
  "message": "Network error"
}
```

## Environment Variables

Configure these in your `.env.local` file:

```bash
# Optional: Alpha Vantage API key for enhanced data
ALPHA_VANTAGE_KEY=your_api_key_here

# Database credentials (required)
DATABASE_URL=libsql://your-database-url.turso.io
DATABASE_AUTH_TOKEN=your_database_auth_token_here

# Optional: Use mock Tridge data for testing
USE_MOCK_TRIDGE=false
```

## Integration Examples

### JavaScript/TypeScript

```typescript
// Fetch wheat price
const response = await fetch('/api/oracle/wheat-maize?commodity=WHEAT')
const data = await response.json()
console.log(`Wheat price: ${data.data[0].price} ${data.data[0].currency}`)

// Store price data
const storeResponse = await fetch('/api/oracle/wheat-maize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    commodity: 'WHEAT',
    price: 285.50,
    currency: 'USD',
    unit: 'MT',
    source: 'Tridge'
  })
})
```

### Python

```python
import requests

# Fetch wheat and maize prices
response = requests.get('https://your-domain.com/api/oracle/wheat-maize')
data = response.json()

for item in data['data']:
    print(f"{item['commodity']}: {item['price']} {item['currency']}")

# Store price data
response = requests.post(
    'https://your-domain.com/api/oracle/wheat-maize',
    json={
        'commodity': 'WHEAT',
        'price': 285.50,
        'currency': 'USD',
        'unit': 'MT',
        'source': 'Tridge'
    }
)
```

### cURL

```bash
# Get wheat and maize prices
curl "https://your-domain.com/api/oracle/wheat-maize"

# Get only wheat price
curl "https://your-domain.com/api/oracle/wheat-maize?commodity=WHEAT"

# Get Tridge-specific data
curl "https://your-domain.com/api/oracle/wheat-maize?source=tridge"

# Store price data
curl -X POST "https://your-domain.com/api/oracle/wheat-maize" \
  -H "Content-Type: application/json" \
  -d '{
    "commodity": "WHEAT",
    "price": 285.50,
    "currency": "USD",
    "unit": "MT",
    "source": "Tridge"
  }'
```

## Blockchain Integration

The oracle data can be integrated with smart contracts on Polygon and Solana:

### Polygon Smart Contract Resolution

```http
POST /api/oracle/resolve
```

**Request Body:**
```json
{
  "chain": "polygon",
  "predictionId": 123,
  "commodity": "WHEAT"
}
```

This will fetch the latest wheat price and resolve the prediction on-chain.

### Solana Program Resolution

```http
POST /api/oracle/resolve
```

**Request Body:**
```json
{
  "chain": "solana",
  "marketId": "market_pubkey",
  "commodity": "WHEAT"
}
```

## Testing

### Mock Data

Set `USE_MOCK_TRIDGE=true` in your environment to use mock data for testing without making external requests.

### Test Script

```bash
# Test all endpoints
./test-api.sh
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/palontologist/african-commodity-markets/issues
- Email: support@yourdomain.com

## Version

Current Version: 1.0.0
Last Updated: November 16, 2025
