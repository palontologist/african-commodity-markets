# African Commodity Markets Platform - AI Agent Guidelines

## Project Overview
This is a decentralized platform for African commodity trading that provides real-time price data, prediction markets, and blockchain-based trading infrastructure.

## Current Focus
The platform is currently focused on displaying live African commodity prices with grades and location data as the primary user interface.

## Key Files
- `/app/page.tsx` - Live price display board (main focus)
- `/components/app-header.tsx` - Simplified navigation with auth focus
- `/lib/live-prices.ts` - Live price data fetching from multiple sources
- `/app/api/live-prices/route.ts` - API endpoint for live prices

## Development Principles

### UI/UX
- Clean, price-focused interface as primary view
- Prominent display of commodity grades and location data
- Minimal navigation: Dashboard, Oracle, Enterprise, API Docs
- Authentication buttons (Sign In/Sign Up) visible in navbar
- Wallet connect appears only when needed for transactions

### Data Display
- Commodity name, icon, grade, current price, 24h change
- Available countries/regions for each commodity
- Data source and last updated timestamp
- Clickable commodity cards for detailed views

### Authentication
- Clerk integration for user management
- Sign In/Sign Up buttons prominent in navbar
- Post-login user type selection (farmer/trader/coop)
- Wallet connection for trading actions only

### API Integration
- All price data from `/api/live-prices` endpoint
- Dual region support: AFRICA and LATAM
- Proper caching to minimize API calls
- Graceful fallback handling for API failures

## Current Implementation Status
- ✅ Live price display board implemented
- ✅ Simplified navbar with auth focus
- ✅ Commodity cards with grades and location data
- ✅ Region toggling (Africa/Latin America)
- ✅ Live price API with multiple data sources
- ⏳ Detailed commodity price pages (`/prices/[commodity]`)
- ⏳ Wallet connection modal for trading
- ⏳ WebSocket real-time updates
- ⏳ Grade-specific price displays
- ⏳ Location-based price filtering

## Immediate Next Steps
1. Create detailed commodity price pages
2. Implement wallet connection modal
3. Add WebSocket support for real-time updates
4. Enhance grade/location filtering capabilities