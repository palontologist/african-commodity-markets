# African Commodity Markets

A comprehensive platform for tracking African commodity market data with user authentication and real-time analytics.

## Features

### 🔐 Authentication
- **Clerk Authentication**: Secure user sign-up, sign-in, and session management
- **Protected Routes**: Dashboard and user-specific features require authentication
- **User Sync**: Automatic synchronization of user data with database via webhooks

### 🗄️ Database
- **Turso Database**: SQLite-compatible edge database for fast global access
- **Drizzle ORM**: Type-safe database operations and migrations
- **Comprehensive Schema**: Support for commodities, markets, pricing, grades, and user data

### 📊 Commodity Data
- **Multi-Commodity Support**: Tea, Coffee, Cocoa, Gold, Avocado, Macadamia, Cotton, Cashew, Rubber, **Wheat, Maize**
- **Real-Time Pricing**: Integration with Alpha Vantage, **Tridge.com**, and World Bank APIs for live market data
- **Quality Grades**: Detailed quality standards and grading systems
- **Market Information**: African market locations and trading data
- **Historical Data**: 5+ years of price history for trend analysis
- **AI Predictions**: Groq-powered predictions for commodity price movements
- **Wheat & Maize Oracle**: Dedicated API for wheat and maize flour prices with Kenya market focus

### 🌍 African Markets Coverage
- Ghana, Kenya, Nigeria, South Africa, Côte d'Ivoire, Ethiopia
- Major exchanges and auction houses
- Local currency support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk
- **Database**: Turso (SQLite-compatible)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Clerk account
- Turso database instance

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Clerk URLs (optional)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Turso Database
DATABASE_URL=libsql://your-database-url.turso.io
DATABASE_AUTH_TOKEN=your_database_auth_token_here

# Groq AI (Required for predictions)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Alpha Vantage (Optional but recommended for real-time prices)
# Free tier: 25 requests/day
# Get your key: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_KEY=YOUR_ALPHA_VANTAGE_KEY_HERE
```

**Important**: 
- Without `ALPHA_VANTAGE_KEY`, the system will fallback to World Bank API (free, no key required)
- World Bank provides monthly data; Alpha Vantage provides more frequent updates
- For production use, sign up for Alpha Vantage Premium for higher rate limits

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd african-commodity-markets
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Set up database**
   ```bash
   # Generate migration files
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   
   # Seed initial data
   pnpm db:seed
   
   # Optional: Ingest 5+ years of historical price data
   pnpm tsx scripts/ingest-historical-prices.ts
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

## Database Scripts

- `pnpm db:generate` - Generate Drizzle migration files
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:seed` - Seed database with initial data
- `pnpm tsx scripts/ingest-historical-prices.ts` - Import 5+ years of historical price data from World Bank

## API Endpoints

### Wheat and Maize Oracle API

Dedicated API for wheat and maize flour prices with real-time data from multiple sources including Tridge.com.

**Quick Start:**
```bash
# Get wheat and maize prices
curl "http://localhost:3000/api/oracle/wheat-maize"

# Get only wheat price
curl "http://localhost:3000/api/oracle/wheat-maize?commodity=WHEAT"

# Get Tridge-specific data
curl "http://localhost:3000/api/oracle/wheat-maize?source=tridge"

# Get historical data from database
curl "http://localhost:3000/api/oracle/wheat-maize?historical=true"
```

**📖 Full Documentation:** See [WHEAT_MAIZE_API_DOCS.md](./WHEAT_MAIZE_API_DOCS.md) for comprehensive API documentation including:
- All endpoints and parameters
- Request/response examples
- Integration examples (JavaScript, Python, cURL)
- Error handling
- Blockchain integration

### Live Prices API

```bash
# Get any commodity price
curl "http://localhost:3000/api/live-prices?symbol=WHEAT"
curl "http://localhost:3000/api/live-prices?symbols=WHEAT,MAIZE,COFFEE"
```

Supports: COFFEE, COCOA, COTTON, CASHEW, RUBBER, GOLD, TEA, AVOCADO, MACADAMIA, WHEAT, MAIZE

## Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Copy your publishable key and secret key to `.env.local`
3. Set up a webhook endpoint at `/api/webhooks/clerk` for user synchronization
4. Configure your webhook to listen for `user.created`, `user.updated`, and `user.deleted` events

## Turso Setup

1. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Sign up: `turso auth signup`
3. Create database: `turso db create african-commodity-markets`
4. Get database URL: `turso db show african-commodity-markets --url`
5. Create auth token: `turso db tokens create african-commodity-markets`

## Project Structure

```
app/
├── (auth)/                 # Authentication pages
│   ├── sign-in/
│   └── sign-up/
├── api/webhooks/clerk/     # Clerk webhook handler
├── dashboard/              # User dashboard (protected)
├── market/                 # Market pages
└── grades/                 # Commodity grades

components/
├── ui/                     # shadcn/ui components
├── app-header.tsx          # Main navigation
└── auth-provider.tsx       # Clerk authentication provider

lib/
├── db/                     # Database configuration
│   ├── schema.ts           # Database schema
│   ├── index.ts            # Database connection
│   ├── seed.ts             # Seed data functions
│   └── user-sync.ts        # User synchronization utilities
└── utils.ts                # Utility functions
```

## Database Schema

### Core Tables
- **users** - User accounts (synced with Clerk)
- **commodities** - Commodity definitions and metadata
- **countries** - African countries and currency data
- **markets** - Trading venues and exchanges
- **commodity_prices** - Historical and current pricing
- **commodity_grades** - Quality standards and grading
- **user_watchlists** - User-specific tracking
- **commodity_news** - Market news and updates

## Deployment

The application is configured for deployment on platforms like Vercel, Netlify, or any Node.js hosting service.

### Vercel Deployment
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds on push

## Roadmap

### Current Phase: Web2.5 Hybrid Platform (January 2026)
We're building towards a multi-chain architecture combining Solana (speed & mobile) with Polygon (AI & enterprise). See our detailed roadmap:

📍 **[Multi-Chain Implementation Roadmap](docs/MULTICHAIN_ROADMAP.md)** - 5-week plan to dual hackathon submission

**Key Milestones**:
- ✅ **Week 0** (Completed): Real data integration (Alpha Vantage + World Bank APIs)
- ✅ **Week 0** (Completed): AI predictions with Groq (qwen/qwen3-32b)
- 🔄 **Week 1**: Solana oracle + AMM programs (Rust/Anchor)
- 🔄 **Week 2**: Polygon prediction markets + NFTs (Solidity)
- ⏳ **Week 3**: Wormhole cross-chain bridge + mobile app
- ⏳ **Week 4**: Full Web2.5 integration (Next.js ↔ Blockchain)
- ⏳ **Week 5**: Testing, documentation, demo videos

**Target**: Submissions to Solana Cypherpunk + Polygon Buildathon (February 2026)

### Strategic Alignment
Our development follows the [Whitepaper Alignment Plan](docs/WHITEPAPER_ALIGNMENT.md):
- **Phase 1** (✅ Complete): Real data & AI predictions
- **Phase 2** (Current): Settlement system & blockchain integration
- **Phase 3** (Q1 2026): Tokenization ($AFF token + RWA NFTs)
- **Phase 4** (Q2 2026): Cross-chain expansion (Wormhole)
- **Phase 5** (Q3 2026): Multi-language & 20+ commodities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

For blockchain development, see:
- [Solana Guide](docs/SOLANA_GUIDE.md) (coming soon)
- [Polygon Guide](docs/POLYGON_GUIDE.md) (coming soon)
- [Multi-Chain Roadmap](docs/MULTICHAIN_ROADMAP.md)

## License

This project is licensed under the MIT License.
