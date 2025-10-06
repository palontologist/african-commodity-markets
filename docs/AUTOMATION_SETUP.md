# Daily Insights Automation Setup

This document explains how to set up automated daily insight generation for the African Commodity Markets platform.

## Overview

The system automatically generates AI predictions for all commodities every 24 hours, ensuring users always have fresh market insights without manual intervention.

## Architecture

```
┌─────────────────────┐
│   Trigger Source    │
│  (Vercel Cron or    │
│  GitHub Actions)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ /api/cron/generate- │
│     insights        │
│  (Next.js API)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  generatePrediction │
│   (Agent Logic)     │
│  - Groq AI Model    │
│  - Market Analysis  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Database Store    │
│  commodity_         │
│  predictions        │
└─────────────────────┘
```

## Setup Methods

### Method 1: Vercel Cron (Recommended for Vercel deployments)

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-insights",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Schedule:** Daily at 6:00 AM UTC

**Requirements:**
- Vercel Pro or Enterprise plan (Hobby plan has limitations)
- Deployed to Vercel

**Setup:**
1. Add `CRON_SECRET` to Vercel environment variables
2. Deploy your application
3. Cron will automatically trigger

**Monitoring:**
- View logs in Vercel Dashboard → Functions → Cron
- Check `/api/cron/generate-insights` endpoint logs

---

### Method 2: GitHub Actions (Backup/Alternative)

**File:** `.github/workflows/daily-insights.yml`

**Schedule:** Daily at 6:00 AM UTC

**Requirements:**
- GitHub repository
- GitHub Actions enabled

**Setup:**

1. **Add Repository Secrets:**
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Add secrets:
     - `APP_URL`: Your deployed app URL (e.g., `https://your-app.vercel.app`)
     - `CRON_SECRET`: Same secret used in your app (generate with: `openssl rand -base64 32`)

2. **Commit the workflow file:**
   ```bash
   git add .github/workflows/daily-insights.yml
   git commit -m "Add daily insights automation"
   git push
   ```

3. **Manual trigger (testing):**
   - Go to: Repository → Actions → Daily Insights Generation → Run workflow

**Monitoring:**
- View logs in GitHub → Actions → Daily Insights Generation
- Check individual run logs

---

### Method 3: External Cron Services

Use third-party cron services for more control:

**Services:**
- [cron-job.org](https://cron-job.org) (Free)
- [EasyCron](https://www.easycron.com) (Free tier available)
- [Cronitor](https://cronitor.io)

**Setup:**

1. **Generate CRON_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

2. **Add to environment variables:**
   ```env
   CRON_SECRET=your_generated_secret_here
   ```

3. **Configure cron service:**
   - URL: `https://your-app.vercel.app/api/cron/generate-insights`
   - Method: `POST` or `GET`
   - Headers:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```
   - Schedule: `0 6 * * *` (Daily at 6 AM UTC)

---

## Environment Variables

Add these to your deployment platform (Vercel, etc.):

```env
# Required
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_database_url
DATABASE_AUTH_TOKEN=your_database_auth_token

# Recommended for security
CRON_SECRET=your_generated_secret

# Optional (already set)
GROQ_MODEL=qwen/qwen3-32b
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

---

## Testing

### Test Locally

```bash
# Without authentication (if CRON_SECRET not set)
curl http://localhost:3000/api/cron/generate-insights

# With authentication
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     http://localhost:3000/api/cron/generate-insights
```

### Test Production

```bash
curl -X POST https://your-app.vercel.app/api/cron/generate-insights \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-06T06:00:00.000Z",
  "totalDuration": "245.3s",
  "summary": {
    "total": 6,
    "successful": 6,
    "failed": 0
  },
  "results": [
    {
      "symbol": "COFFEE",
      "region": "AFRICA",
      "status": "success",
      "predictedPrice": 405.2,
      "confidence": 0.65,
      "duration": 40234
    }
    // ... more results
  ]
}
```

---

## Monitoring & Alerts

### Check Logs

**Vercel:**
```bash
vercel logs --follow
```

**GitHub Actions:**
- Go to Actions tab → Click on run → View logs

### Success Indicators
- ✅ HTTP 200 response
- ✅ `summary.successful` count matches expected commodities
- ✅ Database predictions table has new entries
- ✅ Insights page shows updated timestamps

### Failure Alerts

Set up alerts for:
- HTTP 401/403 (authentication issues)
- HTTP 500 (server errors)
- Low success rate (<80%)
- High duration (>5 minutes)

**Tools:**
- [Sentry](https://sentry.io) for error tracking
- [Better Uptime](https://betteruptime.com) for endpoint monitoring
- [Checkly](https://www.checklyhq.com) for API monitoring

---

## Schedule Customization

### Cron Schedule Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)
│ │ │ │ │
* * * * *
```

**Examples:**

```bash
# Every day at 6 AM UTC
0 6 * * *

# Every day at 6 AM and 6 PM UTC
0 6,18 * * *

# Every 6 hours
0 */6 * * *

# Every weekday at 7 AM UTC
0 7 * * 1-5

# First day of month at midnight
0 0 1 * *
```

### Timezone Considerations

All cron schedules use **UTC** time. Convert to your local timezone:

| Location | UTC Offset | 6 AM UTC = |
|----------|-----------|------------|
| West Africa (WAT) | UTC+1 | 7 AM |
| South Africa (SAST) | UTC+2 | 8 AM |
| East Africa (EAT) | UTC+3 | 9 AM |
| New York (EST) | UTC-5 | 1 AM |
| London (GMT) | UTC+0 | 6 AM |

---

## Performance Considerations

### Execution Time
- **Per prediction:** ~40 seconds
- **6 commodities:** ~4-5 minutes total
- **Rate limiting:** 2-second delay between predictions

### Cost Optimization

**Groq API:**
- Free tier: 14,400 requests/day
- Daily automation: 6 requests/day
- **Usage:** ~0.04% of free tier

**Vercel:**
- Function timeout: 5 minutes (requires Pro plan)
- Cron runs: 1/day
- **Usage:** Minimal

### Scaling

To add more commodities or increase frequency:

1. **Add commodities** in `/app/api/cron/generate-insights/route.ts`:
   ```typescript
   const COMMODITIES = [
     // ... existing
     { symbol: 'TEA', region: 'AFRICA' },
     { symbol: 'VANILLA', region: 'AFRICA' },
   ]
   ```

2. **Adjust schedule** in `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/generate-insights",
         "schedule": "0 */12 * * *"  // Every 12 hours
       }
     ]
   }
   ```

3. **Monitor rate limits** - Add exponential backoff if needed

---

## Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Missing or incorrect `CRON_SECRET`

**Solution:**
```bash
# Verify environment variable is set
echo $CRON_SECRET

# Regenerate and update
openssl rand -base64 32
```

### Issue: 500 Internal Server Error

**Cause:** Groq API error, database connection issue

**Check logs:**
```bash
vercel logs --follow
```

**Common fixes:**
- Verify `GROQ_API_KEY` is valid
- Check database connection (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`)
- Ensure database tables exist (run `pnpm db:push`)

### Issue: Predictions not showing on Insights page

**Cause:** Database tables don't exist yet

**Solution:**
```bash
# Run database migration
pnpm db:push

# Verify tables created
pnpm drizzle-kit studio
```

### Issue: Timeout errors

**Cause:** Function execution exceeds time limit

**Solutions:**
- Reduce number of commodities processed per run
- Increase Vercel function timeout (Pro plan)
- Split into multiple smaller cron jobs

---

## Security Best Practices

1. **Always use CRON_SECRET** in production
2. **Rotate secrets** periodically (every 90 days)
3. **Limit endpoint access** to cron sources only
4. **Monitor for unauthorized access** attempts
5. **Use HTTPS** for all webhook/cron triggers

---

## Next Steps

- [ ] Deploy to Vercel with `vercel.json` configuration
- [ ] Set up `CRON_SECRET` environment variable
- [ ] Run database migration (`pnpm db:push`)
- [ ] Test cron endpoint manually
- [ ] Monitor first automated run
- [ ] Set up error alerts (optional)
- [ ] Configure monitoring dashboard (optional)

---

## Support

For issues or questions:
- Check logs: `vercel logs --follow`
- Review API response: `/api/cron/generate-insights`
- Open GitHub issue with logs and error details

---

**Last Updated:** October 6, 2025
