# African Commodity Markets Platform - Agent Guidelines

## Project Overview
This is a decentralized platform for African commodity trading that provides real-time price data, prediction markets, and blockchain-based trading infrastructure.

## Current Focus
The platform is currently focused on displaying live African commodity prices with grades and location data as the primary user interface.

## Key Files Modified Recently
1. `/app/page.tsx` - Transformed into live price display board
2. `/components/app-header.tsx` - Simplified navbar with auth focus
3. `/lib/live-prices.ts` - Live price data fetching from multiple sources

## Development Guidelines

### Styling
- Use Tailwind CSS classes consistently
- Follow the existing color scheme (primary, accent colors)
- Maintain responsive design for mobile and desktop
- Use shadcn/ui components when available

### State Management
- Use React hooks (useState, useEffect) for client-side state
- Fetch live data using the existing `/api/live-prices` endpoint
- Handle loading and error states appropriately

### API Integration
- All price data should come from `/api/live-prices` endpoint
- Support both AFRICA and LATAM regions
- Implement proper caching to reduce API calls
- Handle API failures gracefully with fallback data

### Navigation
- Keep navbar minimal: Dashboard, Oracle, Enterprise, API Docs
- Authentication buttons (Sign In/Sign Up) should be prominent
- Avoid commodity-specific links in main nav (these belong in the price display)
- Mobile menu should contain the same links as desktop

### Data Display
- Show commodity name, icon, grade, current price, and 24h change
- Display available countries/regions for each commodity
- Include data source and last updated timestamp
- Make commodity cards clickable to view detailed price charts

### Authentication
- Use Clerk for authentication (already integrated)
- Sign In/Sign Up buttons should be visible in navbar
- Wallet connect should appear only when needed for transactions
- User type selection (farmer/trader/coop) happens after login

## Next Steps
1. Implement detailed commodity price pages (`/prices/[commodity]`)
2. Create wallet connection modal for trading actions
3. Add WebSocket support for real-time price updates
4. Implement grade-specific price displays
5. Add location-based price filtering