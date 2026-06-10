# Wheat and Maize API Documentation

This document describes the Wheat and Maize API endpoints available in the African Commodity Markets Platform.

## Overview

The platform now provides comprehensive wheat and maize price data from multiple sources including:
- <co>Tridge (real-time market data)</co: 10:[0]>
- <co>Kenya Agricultural Markets Information System (KAMIS)</co: 8:[0]>
- <co>Alpha Vantage (global commodity data)</co: 8:[0]>
- <co>World Bank (historical data)</co: 8:[0]>

## API Endpoints

### <co>1. GET /api/oracle/wheat-maize</co: 10:[0]>

**Description:** <co>Fetch both wheat and maize prices with optional filtering by commodity, source, and historical data.</co: 10:[0]>

**Query Parameters:**
- `<co>commodity</co: 10:[0]>`: <co>`WHEAT`, `MAIZE`, or omit for both (default: both)</co: 10:[0]>
- `<co>source</co: 10:[0]>`: <co>`tridge`, `kamis`, or omit for automatic selection (default: automatic)</co: 10:[0]>
- `<co>historical</co: 10:[0]>`: <co>`true` to include historical data (default: false)</co: 10:[0]>

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "commodity": "WHEAT",
      "price": 285.50,
      "currency": "USD",
      "unit": "MT",
      "timestamp": "2024-01-10T10:30:00.000Z",
      "source": "Tridge",
      "country": "Kenya",
      "region": "East Africa",
      "exchange": "Tridge",
      "quality": "Standard",
      "variety": "Hard Wheat",
      "localPrice": null,
      "type": "wheat",
      "cached": false,
      "lastUpdated": "2024-01-10T10:30:00.000Z"
    }
  ],
  "cached": false,
  "lastUpdated": "2024-01-10T10:30:00.000Z"
}
```

### <co>2. GET /api/live-prices</co: 10:[0]>

**Description:** <co>Fetch live prices for one or multiple commodities.</co: 10:[0]>

**Query Parameters:**
- `<co>symbol</co: 10:[0]>`: <co>Single commodity symbol (`WHEAT`, `MAIZE`, `COFFEE`, etc.)</co: 10:[0]>
- `<co>symbols</co: 10:[0]>`: <co>Comma-separated list of commodity symbols</co: 10:[0]>
- `<co>region</co: 10:[0]>`: <co>`AFRICA` or `LATAM` (default: `AFRICA`)</co: 10:[0]>

**Response Examples:**

**Single Commodity:**
```json
{
  "success": true,
  "commodity": "WHEAT",
  "price": 285.50,
  "currency": "USD",
  "timestamp": "2024-01-10T10:30:00.000Z",
  "source": "Alpha Vantage",
  "localPrice": {
    "price": 254.95,
    "currency": "KES"
  },
  "cached": false,
  "lastUpdated": "2024-01-10T10:30:00.000Z"
}
```

**Multiple Commodities:**
```json
{
  "success": true,
  "data": [
    {
      "commodity": "WHEAT",
      "price": 285.50,
      "currency": "USD",
      "timestamp": "2024-01-10T10:30:00.000Z",
      "source": "Alpha Vantage"
    },
    {
      "commodity": "MAIZE",
      "price": 225.75,
      "currency": "USD",
      "timestamp": "2024-01-10T10:30:00.000Z",
      "source": "Alpha Vantage"
    }
  ],
  "cached": false,
  "lastUpdated": "2024-01-10T10:30:00.000Z"
}
```

## Wheat and Maize Data Sources

### <co>1. Tridge</co: 10:[0]>
- **URL**: <co>`https://dir.tridge.com/prices/wheat/KE` (wheat) / `https://dir.tridge.com/prices/maize/KE` (maize)</co: 10:[0]>
- **Format**: <co>USD per metric ton (MT)</co: 10:[0]>
- **Coverage**: <co>Kenya market data</co: 10:[0]>
- **Quality**: <co>Includes grade/quality information</co: 10:[0]>

### <co>2. Kenya Agricultural Markets Information System (KAMIS)</co: 10:[0]>
- **URL**: <co>`https://kamis.kilimo.go.ke/site/market`</co: 10:[0]>
- **Format**: <co>Kenya Shillings per kilogram (KES/kg)</co: 10:[0]>
- **Coverage**: <co>Multiple Kenyan markets and counties</co: 10:[0]>
- **Features**: <co>Wholesale and retail prices, variety information</co: 10:[0]>

### <co>3. Alpha Vantage</co: 10:[0]>
- **URL**: <co>Alpha Vantage Commodity API</co: 10:[0]>
- **Format**: <co>USD per unit</co: 10:[0]>
- **Coverage**: <co>Global commodity markets</co: 10:[0]>

### <co>4. World Bank</co: 10:[0]>
- **URL**: <co>World Bank Pink Sheet API</co: 10:[0]>
- **Format**: <co>USD per unit</co: 10:[0]>
- **Coverage**: <co>Historical commodity price data</co: 10:[0]>

## Data Fields

### <co>Common Fields</co: 10:[0]>
- `<co>commodity</co: 10:[0]>`: <co>Commodity symbol</co: 10:[0]>
- `<co>price</co: 10:[0]>`: <co>Current price</co: 10:[0]>
- `<co>currency</co: 10:[0]>`: <co>Currency code</co: 10:[0]>
- `<co>timestamp</co: 10:[0]>`: <co>Data timestamp</co: 10:[0]>
- `<co>source</co: 10:[0]>`: <co>Data source</co: 10:[0]>
- `<co>cached</co: 10:[0]>`: <co>Whether data is from cache</co: 10:[0]>
- `<co>lastUpdated</co: 10:[0]>`: <co>Last update timestamp</co: 10:[0]>

### <co>Wheat/Maize Specific Fields</co: 10:[0]>
- `<co>type</co: 10:[0]>`: <co>`wheat` or `maize`</co: 10:[0]>
- `<co>unit</co: 10:[0]>`: <co>`MT` (metric tons)</co: 10:[0]>
- `<co>country</co: 10:[0]>`: <co>`Kenya`</co: 10:[0]>
- `<co>region</co: 10:[0]>`: <co>`East Africa`</co: 10:[0]>
- `<co>exchange</co: 10:[0]>`: <co>Data exchange source</co: 10:[0]>
- `<co>quality</co: 10:[0]>`: <co>Grade/quality information</co: 10:[0]>
- `<co>variety</co: 10:[0]>`: <co>Variety information</co: 10:[0]>
- `<co>localPrice</co: 10:[0]>`: <co>Local currency price</co: 10:[0]>

## Testing

Run the Wheat and Maize API tests:
```bash
./test-wheat-maize-api.sh [BASE_URL]
```

Example:
```bash
./test-wheat-maize-api.sh http://localhost:3000
```

Run the Wheat and Maize example script:
```bash
npx tsx scripts/wheat-maize-example.ts
```

## Error Responses

### <co>400 Bad Request</co: 10:[0]>
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

### <co>404 Not Found</co: 10:[0]>
```json
{
  "success": false,
  "message": "Endpoint not found"
}
```

### <co>500 Internal Server Error</co: 10:[0]>
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Integration with Frontend

### React Components
```javascript
// Example: Fetch wheat and maize prices
import { useState, useEffect } from 'react'

function WheatMaizePrices() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/live-prices?symbols=WHEAT,MAIZE')
        const data = await response.json()
        setPrices(data.data || [])
      } catch (error) {
        console.error('Error fetching prices:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrices()
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {prices.map(price => (
        <div key={price.commodity}>
          <h3>{price.commodity}</h3>
          <p>{price.price} {price.currency}</p>
          <p>Source: {price.source}</p>
        </div>
      ))}
    </div>
  )
}
```

### Next.js API Route Example
```typescript
// app/api/wheat-maize/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const commodity = searchParams.get('commodity')
  const source = searchParams.get('source')
  
  // Your API logic here
  return NextResponse.json({ success: true, data: [] })
}
```

## Security

- <co>All endpoints require authentication via Clerk</co: 10:[0]>
- <co>Rate limiting is implemented</co: 10:[0]>
- <co>Input validation is performed</co: 10:[0]>
- <co>Error messages are sanitized to prevent information leakage</co: 10:[0]>

## Caching

- <co>API responses are cached for 5 minutes</co: 10:[0]>
- <co>Cache headers are included in responses</co: 10:[0]>
- <co>Stale-while-revalidate pattern for better performance</co: 10:[0]>

## Dependencies

- <co>Next.js 14</co: 10:[0]>
- <co>React 18.3.1</co: 10:[0]>
- <co>Tailwind CSS</co: 10:[0]>
- <co>shadcn/ui components</co: 10:[0]>
- <co>Clerk authentication</co: 10:[0]>

## Roadmap

### Phase 1 (Completed)
- [x] Implement wheat and maize API endpoints
- [x] Add support for Tridge data source
- [x] Add support for KAMIS data source
- [x] Create test scripts
- [x] Create example scripts

### Phase 2 (Planned)
- [ ] Add Alpha Vantage integration
- [ ] Add WebSocket support for real-time updates
- [ ] Add prediction market integration
- [ ] Add analytics and reporting features
- [ ] Add mobile app support

## Troubleshooting

### API Endpoints Not Working
1. Ensure the Next.js server is running
2. Check that the API routes are correctly imported
3. Verify that the required environment variables are set
4. Check server logs for errors

### Data Sources Unavailable
1. Ensure all required services are running
2. Check that the required API keys are configured
3. Verify network connectivity
4. Check for rate limiting issues

### Clerk Authentication
1. Ensure Clerk is properly configured
2. Check that the publishable key is set
3. Verify that the authentication middleware is in place
4. Check for any CORS issues

## Contact

For issues with the Wheat and Maize API:
- Check the test scripts for detailed error information
- Review the example scripts for usage patterns
- Consult the AGENTS.md for development guidelines
- Check the project documentation for additional details
