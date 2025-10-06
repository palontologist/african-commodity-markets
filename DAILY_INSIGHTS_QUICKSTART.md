# Daily AI Insights Automation - Quick Guide

## ✅ What's Been Set Up

### 1. **Automated Daily Cron Job** (`/api/cron/generate-insights`)
- Automatically generates predictions for 6 commodities every day at 6 AM UTC
- Commodities: Coffee, Cocoa, Cotton, Cashew, Rubber, Gold
- All predictions stored in database for historical tracking
- Total execution time: ~4-5 minutes

### 2. **Vercel Cron Configuration** (`vercel.json`)
```json
{
  "crons": [{
    "path": "/api/cron/generate-insights",
    "schedule": "0 6 * * *"
  }]
}
```

### 3. **GitHub Actions Backup** (`.github/workflows/daily-insights.yml`)
- Runs daily at 6 AM UTC as backup
- Requires two secrets: `APP_URL` and `CRON_SECRET`

### 4. **Updated Insights Page** (`/app/insights/page.tsx`)
- Now loads recent predictions from database on page load
- Shows purple banner explaining daily auto-generation
- Still allows manual "Refresh" for new predictions

### 5. **Environment Variables**
Added to `.env.local`:
```bash
CRON_SECRET=your_cron_secret_here_change_in_production
```

## 📋 Quick Setup Checklist

### For Local Development
- [x] Cron endpoint created at `/api/cron/generate-insights`
- [x] Environment variable `CRON_SECRET` added
- [ ] Run database migration: `pnpm db:push`
- [ ] Test locally: `curl http://localhost:3000/api/cron/generate-insights`

### For Production Deployment
- [ ] Deploy to Vercel (cron will auto-activate)
- [ ] Add `CRON_SECRET` to Vercel environment variables
- [ ] Verify first cron run in Vercel logs (next day at 6 AM UTC)

### For GitHub Actions (Optional Backup)
- [ ] Add repository secrets: `APP_URL` and `CRON_SECRET`
- [ ] Enable GitHub Actions in repo settings
- [ ] Test manual trigger: Actions → Daily Insights Generation → Run workflow

## 🧪 Testing

### Test Cron Endpoint Locally
```bash
# Without auth (dev only)
curl http://localhost:3000/api/cron/generate-insights

# With authentication
curl -H "Authorization: Bearer your_cron_secret_here" \
     http://localhost:3000/api/cron/generate-insights
```

### Expected Response (Success)
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
    // ... 5 more commodities
  ]
}
```

## 📊 How It Works

1. **6:00 AM UTC** - Cron job triggers automatically
2. **For each commodity** (Coffee, Cocoa, Cotton, Cashew, Rubber, Gold):
   - Fetch current price from Yahoo Finance
   - Generate AI prediction using Groq (qwen/qwen3-32b model)
   - Store prediction + signals in database
   - Wait 2 seconds (rate limiting)
3. **~4-5 minutes total** - All 6 predictions completed
4. **Users visit /insights** - See fresh daily predictions automatically!

## 🎨 User Experience

### Before (Manual Only)
- User visits `/insights`
- Sees empty cards
- Must click "Generate" and wait 40 seconds per commodity
- No historical data

### After (Automated Daily)
- User visits `/insights`
- Sees **fresh predictions from this morning**
- Can still click "Refresh" for real-time updates
- All predictions stored in database for trends

## 🔧 Customization

### Change Schedule
Edit `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/generate-insights",
    "schedule": "0 6,18 * * *"  // 6 AM and 6 PM
  }]
}
```

### Add More Commodities
Edit `/app/api/cron/generate-insights/route.ts`:
```typescript
const COMMODITIES = [
  // Existing
  { symbol: 'COFFEE', region: 'AFRICA' },
  // Add new
  { symbol: 'TEA', region: 'AFRICA' },
  { symbol: 'VANILLA', region: 'AFRICA' },
]
```

### Change Region
```typescript
const COMMODITIES = [
  { symbol: 'COFFEE', region: 'LATAM' },  // Changed to Latin America
]
```

## 🚀 Next Steps

1. **Run Migration** to create database tables:
   ```bash
   pnpm db:push
   ```

2. **Test Locally**:
   ```bash
   curl http://localhost:3000/api/cron/generate-insights
   ```

3. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Add daily insights automation"
   git push
   ```

4. **Verify Cron** (next day):
   - Check Vercel Dashboard → Functions → Cron
   - Visit `/insights` page
   - Should see predictions with today's timestamp

## 📖 Full Documentation

See `/docs/AUTOMATION_SETUP.md` for comprehensive setup guide including:
- Detailed architecture diagrams
- Multiple deployment options
- Monitoring and alerting
- Troubleshooting guide
- Security best practices

---

**Status**: ✅ Complete and Ready for Testing

**Next Action**: Run `pnpm db:push` to create database tables, then test the cron endpoint!
