# Real Data API Setup Guide

This guide walks you through setting up real-time commodity price data for the Afrifutures platform.

## 🚀 Quick Start (5 minutes)

### Option 1: Alpha Vantage (Recommended)

Alpha Vantage provides real-time commodity prices with free tier access.

**Pros**:
- Real-time data
- Simple REST API
- Free tier: 25 requests/day (sufficient for development)
- Supports: Coffee, Cocoa, Cotton, Wheat, Corn, Gold

**Setup**:

1. **Sign up for free API key**:
   - Visit: https://www.alphavantage.co/support/#api-key
   - Enter your email
   - Verify email and get your API key

2. **Add to environment**:
   ```bash
   # In your .env.local file
   ALPHA_VANTAGE_KEY=YOUR_ACTUAL_KEY_HERE
   ```

3. **Test it works**:
   ```bash
   # In terminal
   curl "https://www.alphavantage.co/query?function=COMMODITY&symbol=COFFEE&interval=monthly&apikey=YOUR_KEY"
   ```

**Rate Limits**:
- Free: 25 requests/day
- For production: Upgrade to Premium ($49.99/month for 75 req/min)

---

### Option 2: World Bank API (Automatic Fallback)

If you don't add Alpha Vantage key, the system automatically uses World Bank API.

**Pros**:
- Free, no API key needed
- 20+ years of historical data
- Official commodity price data (Pink Sheet)
- Supports: Coffee, Cocoa, Tea, Gold, Cotton, Rubber, Wheat, Corn, and more

**Cons**:
- Monthly data only (less frequent than Alpha Vantage)
- Some commodities use proxy indicators (e.g., "Nuts" for Macadamia)

**No setup required** - Works out of the box!

**Test it works**:
```bash
# In terminal
curl "https://api.worldbank.org/v2/country/all/indicator/PCOFFOTM_USD?format=json&date=2024:2025&per_page=1"
```

---

## 📊 How It Works

The platform uses a **tiered fallback system**:

1. **Primary**: Alpha Vantage (if API key provided)
   - Used for: Coffee, Cocoa, Cotton, Wheat, Corn, Gold
   - Real-time monthly data

2. **Fallback**: World Bank API (always available)
   - Used when Alpha Vantage fails or for unsupported commodities
   - Monthly official data from Pink Sheet

3. **Cache**: Database (last resort)
   - Uses most recent price from `historical_prices` table
   - Prevents total failure if APIs are down

4. **Static**: Hardcoded fallback
   - Only used if all else fails
   - Logs warning to console

### Code Flow

```typescript
// lib/live-prices.ts
export async function getLivePrice(symbol) {
  // Try Alpha Vantage first
  if (process.env.ALPHA_VANTAGE_KEY && ALPHA_VANTAGE_MAP[symbol]) {
    try {
      return await fetchAlphaVantagePrice(symbol)  // ✅ Real-time
    } catch (error) {
      // Fall through to next option
    }
  }

  // Try World Bank API
  if (WORLD_BANK_MAP[symbol]) {
    try {
      return await fetchWorldBankPrice(symbol)  // ✅ Official monthly
    } catch (error) {
      // Fall through to next option
    }
  }

  // Use cached database price
  return await getCachedPrice(symbol)  // ⚠️ May be stale
}
```

---

## 🧪 Testing

After setting up your API key, test that real data is working:

### Test 1: Direct API Call

```bash
# Start dev server
pnpm dev

# In another terminal, test the live prices endpoint
curl "http://localhost:3000/api/live-prices?symbol=COFFEE"

# Should return:
{
  "region": "AFRICA",
  "data": {
    "symbol": "COFFEE",
    "price": 250.45,
    "currency": "USD",
    "source": "Alpha Vantage",  // ← Should NOT say "Mock Data"
    "timestamp": "2025-01-15T..."
  }
}
```

### Test 2: Generate AI Prediction

```bash
# Generate prediction (uses live prices internally)
curl -X POST "http://localhost:3000/api/agents/commodity/predict" \
  -H "Content-Type: application/json" \
  -d '{"commodityId": "COFFEE", "region": "AFRICA"}'

# Check the prediction context includes real price
# Look for "currentPrice" in response
```

### Test 3: Check Insights Page

1. Visit: http://localhost:3000/insights
2. Click "Generate" for any commodity
3. Wait ~40 seconds for prediction
4. Check prediction card shows realistic price
5. Inspect Network tab → `/api/agents/commodity/predict` → Check price source

---

## 📈 Historical Data Ingestion

After setting up live prices, populate historical data:

```bash
# Run the ingestion script (fetches 5+ years from World Bank)
pnpm tsx scripts/ingest-historical-prices.ts

# Expected output:
# 🚀 Starting historical price ingestion...
#    Period: 2018 - 2024
#    Source: World Bank Commodity Price Data (Pink Sheet)
#
# 📊 Ingesting COFFEE...
#    Found 7 data points
#    ✅ Inserted 7 new records
#
# 📊 Ingesting COCOA...
#    Found 7 data points
#    ✅ Inserted 7 new records
# ...
#
# ✅ Historical price ingestion complete!
#
# 📈 Summary:
#    COFFEE: 7 records
#    COCOA: 7 records
#    TEA: 7 records
#    ...
```

This script:
- Fetches 2018-2024 data for all commodities
- Inserts into `historical_prices` table
- Skips duplicates if re-run
- Rate-limited to be respectful to API

---

## 🔧 Troubleshooting

### Issue: "Alpha Vantage API limit reached"

**Error message**: `"Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 25 requests per day..."`

**Solution**:
- Wait 24 hours for rate limit to reset
- System will automatically fallback to World Bank API
- For production: Upgrade to Alpha Vantage Premium

### Issue: "No data returned from World Bank"

**Possible causes**:
- Commodity not supported by World Bank indicator
- Network connectivity issues
- API endpoint changed

**Solution**:
```bash
# Check if World Bank API is accessible
curl "https://api.worldbank.org/v2/country/all/indicator/PCOFFOTM_USD?format=json&per_page=1"

# Should return JSON, not error
```

### Issue: "Using cached price" warning in logs

**What it means**: Both Alpha Vantage and World Bank failed, using database cache

**Solution**:
1. Check your internet connection
2. Verify API keys are correct in `.env.local`
3. Check if APIs are down (visit status pages)
4. If persistent, check firewall/proxy settings

---

## 📊 Data Quality

### Alpha Vantage Data

**Update Frequency**: Monthly (official commodity data)
**Coverage**: 2000-present
**Accuracy**: Official market data from exchanges

**Supported Commodities**:
- ✅ Coffee (COFFEE)
- ✅ Cocoa (COCOA)
- ✅ Cotton (COTTON)
- ✅ Wheat (WHEAT)
- ✅ Corn (CORN)
- ✅ Gold (XAU spot)

### World Bank Data

**Update Frequency**: Monthly
**Coverage**: 1960-present (20+ years)
**Accuracy**: Official Pink Sheet commodity prices used by governments, World Bank, IMF

**Supported Commodities**:
- ✅ Coffee (Other Mild Arabicas)
- ✅ Cocoa
- ✅ Tea (avg 3 auctions)
- ✅ Gold (UK afternoon fixing)
- ✅ Cotton (A Index)
- ✅ Rubber (RSS3)
- 🟡 Avocado (Fruit proxy)
- 🟡 Macadamia (Nuts proxy)

**Note**: Some commodities use proxy indicators (e.g., "Fruit" for Avocado) since World Bank doesn't track every niche commodity.

---

## 🚀 Production Recommendations

For production deployment:

1. **Upgrade to Alpha Vantage Premium** ($49.99/month)
   - 75 requests/minute (vs 25/day)
   - Better for real-time trading
   - Supports high user traffic

2. **Add Chainlink Oracles** (Phase 3 - Blockchain)
   - On-chain price feeds for settlements
   - Decentralized, tamper-proof
   - Required for smart contract integration

3. **Implement Caching Layer** (Redis/Vercel KV)
   - Cache prices for 1 hour
   - Reduce API calls
   - Faster response times

4. **Set up Monitoring**
   - Alert if API calls fail repeatedly
   - Track data freshness
   - Monitor rate limit usage

---

## 📚 API References

- **Alpha Vantage Docs**: https://www.alphavantage.co/documentation/#commodities
- **World Bank API Docs**: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
- **World Bank Pink Sheet**: https://www.worldbank.org/en/research/commodity-markets
- **Commodity Indicator Codes**: https://data.worldbank.org/indicator (search "commodity")

---

## ✅ Checklist

Before deploying to production, verify:

- [ ] Alpha Vantage API key added to `.env.local`
- [ ] Tested `/api/live-prices` endpoint returns real data
- [ ] Historical data ingested (run `ingest-historical-prices.ts`)
- [ ] AI predictions working (check `/insights` page)
- [ ] No "Mock Data" appearing in responses
- [ ] Rate limits appropriate for expected traffic
- [ ] Monitoring/alerting set up
- [ ] Error handling tested (disconnect internet, test fallbacks)

---

**Need Help?**
- Check `/docs/WHITEPAPER_ALIGNMENT.md` for roadmap
- Check `/docs/DATA_SOURCES_AND_ROADMAP.md` for detailed plan
- Review code in `/lib/live-prices.ts` for implementation details
