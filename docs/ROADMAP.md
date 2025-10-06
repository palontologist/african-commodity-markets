# African Commodity Markets - Sprint Roadmap & Implementation Status

## 📊 Current Implementation Status (As of October 6, 2025)

### ✅ COMPLETED
1. **Core Infrastructure**
   - Next.js 14 application with App Router ✓
   - Clerk authentication integrated ✓
   - Turso/LibSQL database with Drizzle ORM ✓
   - Tailwind CSS + shadcn/ui components ✓
   - Basic schema (users, commodities, countries, markets, prices, grades, news, watchlists) ✓

2. **Data Layer - Base Schema**
   - Users table (Clerk sync) ✓
   - Commodities, Countries, Markets tables ✓
   - Commodity Prices & Grades ✓
   - User Watchlists ✓
   - Commodity News ✓

3. **Data Layer - Agent/Marketplace Extensions**
   - Commodity Predictions table ✓
   - Prediction Signals table ✓
   - Market Pools table ✓
   - Pool Participants table ✓
   - User Markets table ✓
   - Commodity Listings table ✓
   - Commodity Bids table ✓
   - Migration files generated ✓
   - Predictions utility functions ✓

4. **Price Data Integration**
   - Live price fetching from Yahoo Finance ✓
   - Fallback pricing for unsupported commodities ✓
   - `/api/live-prices` route ✓
   - Support for multiple regions (AFRICA, LATAM) ✓

5. **Agent Infrastructure - Foundation**
   - Groq client wrapper with retry logic ✓
   - Agent type definitions ✓
   - ElizaOS dependencies installed ✓
   - Prediction request/response schemas ✓
   - `lib/agents/` directory structure ✓

6. **UI Components**
   - Home page with commodity cards ✓
   - Market detail pages (per commodity) ✓
   - Grades information page ✓
   - Basic dashboard (placeholder) ✓
   - Auth pages (sign-in/sign-up) ✓
   - Inline trading component ✓
   - Header/navigation ✓

---

## 🚧 IN PROGRESS
1. **ElizaOS Agent Implementation** (Task #3 - 40% complete)
   - ✅ Groq client created
   - ✅ Type definitions created
   - ⏳ Commodity plugin/action implementation
   - ⏳ Agent runtime bootstrap
   - ⏳ Prediction prompt templates
   - ⏳ Background scheduler

---

## 📋 TODO - PRIORITY ORDERED

### 🔴 SPRINT 1: CORE AGENT & PREDICTION ENGINE (Next 2 Weeks)

#### **Task 1.1: Complete ElizaOS Commodity Agent** [HIGH PRIORITY]
**Estimated: 3-4 days**
- [ ] Create `lib/agents/plugins/commodity-data.ts` with ElizaOS Plugin interface
  - [ ] Define `fetchPriceAction` - Action to get live spot prices
  - [ ] Define `predictPriceAction` - Action to generate Groq predictions
  - [ ] Define `historicalDataProvider` - Provider for historical averages
  - [ ] Implement validation and handler functions
- [ ] Create `lib/agents/commodity-agent.ts` - Agent runtime bootstrap
  - [ ] Initialize AgentRuntime with commodity plugin
  - [ ] Configure memory/database adapter (if needed)
  - [ ] Export singleton agent instance
  - [ ] Add error handling and logging
- [ ] Build prediction prompt templates
  - [ ] 1d/3d/7d/14d horizon-specific prompts
  - [ ] Include historical context, regional signals, quality grades
  - [ ] Structured output format for parsing
- [ ] Create background scheduler (`lib/agents/scheduler.ts`)
  - [ ] Schedule predictions every N hours
  - [ ] Queue management for rate limiting
  - [ ] Persist predictions to database

**Files to create:**
- `lib/agents/plugins/commodity-data.ts`
- `lib/agents/commodity-agent.ts`
- `lib/agents/scheduler.ts`
- `lib/agents/prompts.ts`

---

#### **Task 1.2: Prediction API Routes** [HIGH PRIORITY]
**Estimated: 2 days**
- [ ] `/api/agents/commodity/predict` - POST endpoint
  - [ ] Accept commodity symbol, region, horizon
  - [ ] Validate with zod schemas
  - [ ] Call agent prediction logic
  - [ ] Return structured prediction + usage stats
  - [ ] Cache predictions (optional)
- [ ] `/api/agents/commodity/stream` - GET SSE endpoint
  - [ ] Server-Sent Events for live updates
  - [ ] Subscribe to agent broadcasts
  - [ ] Filter by commodity/region
- [ ] `/api/agents/commodity/ingest` - POST endpoint (webhook)
  - [ ] Accept external price feeds
  - [ ] Validate HMAC signature
  - [ ] Forward to agent memory
  - [ ] Trigger re-prediction if needed
- [ ] `/api/predictions` - GET endpoint
  - [ ] List recent predictions
  - [ ] Filter by commodity, region, horizon
  - [ ] Paginated response

**Files to create:**
- `app/api/agents/commodity/predict/route.ts`
- `app/api/agents/commodity/stream/route.ts`
- `app/api/agents/commodity/ingest/route.ts`
- `app/api/predictions/route.ts`

---

#### **Task 1.3: Database Migration & Seeding** [MEDIUM PRIORITY]
**Estimated: 1 day**
- [ ] Run database migration: `pnpm db:push`
- [ ] Verify new tables created in Turso
- [ ] Update seed script (`lib/db/seed-script.ts`)
  - [ ] Add sample predictions (2-3 per commodity)
  - [ ] Add sample market pools (2-3 active)
  - [ ] Add sample pool participants
  - [ ] Link to existing commodities/users
- [ ] Test seed: `pnpm db:seed`
- [ ] Verify data in Drizzle Studio: `pnpm db:studio`

**Files to update:**
- `lib/db/seed-script.ts`

---

### 🟡 SPRINT 2: MARKETPLACE & USER MARKETS (Weeks 3-4)

#### **Task 2.1: Marketplace Pages** [HIGH PRIORITY]
**Estimated: 4-5 days**
- [ ] Create `/app/marketplace/page.tsx` - Main marketplace listing
  - [ ] Display all active commodity listings
  - [ ] Filter by commodity, price range, status
  - [ ] Search functionality
  - [ ] Grid/list view toggle
- [ ] Create `/app/marketplace/[listingId]/page.tsx` - Listing detail
  - [ ] Full listing information
  - [ ] Bid history
  - [ ] Place bid form
  - [ ] Owner contact info
  - [ ] Related listings
- [ ] Create `/app/marketplace/create/page.tsx` - Create listing form
  - [ ] Multi-step wizard
  - [ ] Commodity selection
  - [ ] Quantity, price, expiration
  - [ ] Optional tokenization toggle
  - [ ] Preview before submit
- [ ] Create `/app/marketplace/my-listings/page.tsx` - User's listings
  - [ ] Manage active listings
  - [ ] View bids received
  - [ ] Accept/reject bids
  - [ ] Mark as sold/closed

**Components to create:**
- `components/marketplace/listing-card.tsx`
- `components/marketplace/listing-filters.tsx`
- `components/marketplace/bid-form.tsx`
- `components/marketplace/create-listing-form.tsx`

---

#### **Task 2.2: Marketplace API Endpoints** [HIGH PRIORITY]
**Estimated: 2-3 days**
- [ ] `/api/marketplace/listings` - GET, POST
  - [ ] List all active listings (GET)
  - [ ] Create new listing (POST, auth required)
  - [ ] Filter/search/pagination
- [ ] `/api/marketplace/listings/[id]` - GET, PATCH, DELETE
  - [ ] Get listing details (GET)
  - [ ] Update listing (PATCH, owner only)
  - [ ] Delete/close listing (DELETE, owner only)
- [ ] `/api/marketplace/bids` - GET, POST
  - [ ] List bids for a listing (GET)
  - [ ] Place new bid (POST, auth required)
- [ ] `/api/marketplace/bids/[id]` - PATCH
  - [ ] Accept/reject bid (PATCH, listing owner only)
  - [ ] Update bid status

**Files to create:**
- `app/api/marketplace/listings/route.ts`
- `app/api/marketplace/listings/[id]/route.ts`
- `app/api/marketplace/bids/route.ts`
- `app/api/marketplace/bids/[id]/route.ts`

---

#### **Task 2.3: User-Created Markets** [MEDIUM PRIORITY]
**Estimated: 3 days**
- [ ] Create `/app/markets/create/page.tsx` - Market creation form
  - [ ] Market name, description
  - [ ] Link to existing market or create new
  - [ ] Commodity association
  - [ ] Country/region selection
  - [ ] Settlement terms
  - [ ] Draft/publish workflow
- [ ] Create `/app/markets/my-markets/page.tsx` - User's markets
  - [ ] List user-created markets
  - [ ] Edit/delete markets
  - [ ] View linked listings
  - [ ] Market statistics
- [ ] `/api/markets/user` - GET, POST
  - [ ] List user's markets (GET)
  - [ ] Create new market (POST)
- [ ] `/api/markets/user/[id]` - GET, PATCH, DELETE
  - [ ] Get market details
  - [ ] Update market
  - [ ] Delete market

**Components to create:**
- `components/markets/create-market-form.tsx`
- `components/markets/market-card.tsx`

**Files to create:**
- `app/markets/create/page.tsx`
- `app/markets/my-markets/page.tsx`
- `app/api/markets/user/route.ts`
- `app/api/markets/user/[id]/route.ts`

---

#### **Task 2.4: Pool Management Features** [MEDIUM PRIORITY]
**Estimated: 2-3 days**
- [ ] Create `/app/pools/page.tsx` - List all market pools
  - [ ] Active pools with stats
  - [ ] Filter by commodity, status, liquidity
  - [ ] Sort by TVL, participants, deadline
- [ ] Create `/app/pools/[id]/page.tsx` - Pool detail
  - [ ] Pool information (outcome, deadline, liquidity)
  - [ ] Participant list
  - [ ] Join pool form
  - [ ] Contribution chart
  - [ ] Historical data
- [ ] Create `/app/pools/create/page.tsx` - Create pool
  - [ ] Pool setup wizard
  - [ ] Link to prediction or commodity
  - [ ] Define target outcome & date
  - [ ] Initial liquidity amount
- [ ] `/api/pools` - GET, POST
- [ ] `/api/pools/[id]` - GET, PATCH
- [ ] `/api/pools/[id]/join` - POST (become participant)

**Files to create:**
- `app/pools/page.tsx`
- `app/pools/[id]/page.tsx`
- `app/pools/create/page.tsx`
- `app/api/pools/route.ts`
- `app/api/pools/[id]/route.ts`
- `app/api/pools/[id]/join/route.ts`

---

### 🟢 SPRINT 3: DASHBOARD ENHANCEMENT & UX POLISH (Weeks 5-6)

#### **Task 3.1: Enhanced Dashboard** [HIGH PRIORITY]
**Estimated: 3-4 days**
- [ ] Replace placeholder dashboard with live data
- [ ] **Portfolio Section**
  - [ ] User's active positions
  - [ ] P&L summary
  - [ ] Recent trades
- [ ] **Predictions Widget**
  - [ ] Latest agent predictions for watched commodities
  - [ ] Confidence scores with visual indicators
  - [ ] Narrative insights
- [ ] **Pools Widget**
  - [ ] Joined pools status
  - [ ] Pending settlements
  - [ ] Contribution/shares breakdown
- [ ] **Market Activity Feed**
  - [ ] Recent listings in watched commodities
  - [ ] New bids on user's listings
  - [ ] Price alerts triggered
- [ ] **Watchlist Management**
  - [ ] Add/remove commodities
  - [ ] Set price alerts
  - [ ] Quick trade actions
- [ ] Charts & Visualizations
  - [ ] Price history charts (recharts)
  - [ ] Prediction confidence over time
  - [ ] Pool liquidity trends

**Components to create:**
- `components/dashboard/portfolio-summary.tsx`
- `components/dashboard/predictions-widget.tsx`
- `components/dashboard/pools-widget.tsx`
- `components/dashboard/activity-feed.tsx`
- `components/dashboard/watchlist-manager.tsx`
- `components/dashboard/price-chart.tsx`

**Files to update:**
- `app/dashboard/page.tsx`

---

#### **Task 3.2: UI/UX Polish** [MEDIUM PRIORITY]
**Estimated: 3-4 days**
- [ ] **Loading States**
  - [ ] Skeleton loaders for all async data
  - [ ] Shimmer effects
  - [ ] Progress indicators
- [ ] **Error Handling**
  - [ ] Toast notifications (sonner)
  - [ ] Error boundary components
  - [ ] Retry mechanisms
  - [ ] Friendly error messages
- [ ] **Responsive Design**
  - [ ] Mobile-first approach
  - [ ] Tablet breakpoints
  - [ ] Touch-friendly interactions
  - [ ] Mobile navigation drawer
- [ ] **Animations & Transitions**
  - [ ] Page transitions
  - [ ] Card hover effects
  - [ ] Smooth scrolling
  - [ ] Micro-interactions
- [ ] **Accessibility**
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Focus indicators
  - [ ] Screen reader support
- [ ] **Dark Mode Support**
  - [ ] Complete theme coverage
  - [ ] Theme toggle persistence
  - [ ] Chart theme variants

**Components to create/update:**
- `components/ui/skeleton-loader.tsx`
- `components/ui/error-boundary.tsx`
- `components/ui/mobile-nav.tsx`
- `components/ui/loading-spinner.tsx`

---

#### **Task 3.3: Home Page Enhancement** [LOW PRIORITY]
**Estimated: 1-2 days**
- [ ] Integrate live predictions into commodity cards
- [ ] Add real-time confidence indicators
- [ ] Display agent narrative summaries
- [ ] Add "trending" section
- [ ] Improve hero section with dynamic stats
- [ ] Add testimonials/social proof section
- [ ] Better CTA placement

**Files to update:**
- `app/page.tsx`
- `components/home-inline-trade.tsx`

---

### 🔵 SPRINT 4: ADVANCED FEATURES & OPTIMIZATION (Weeks 7-8)

#### **Task 4.1: Real-Time Features** [MEDIUM PRIORITY]
**Estimated: 3 days**
- [ ] WebSocket/SSE integration for live updates
- [ ] Real-time price tickers
- [ ] Live bid notifications
- [ ] Pool participant updates
- [ ] Prediction updates streaming

**Files to create:**
- `lib/websocket/client.ts`
- `lib/websocket/server.ts`
- `hooks/use-realtime-prices.ts`
- `hooks/use-realtime-predictions.ts`

---

#### **Task 4.2: Advanced Analytics** [LOW PRIORITY]
**Estimated: 2-3 days**
- [ ] Historical prediction accuracy tracking
- [ ] Agent performance metrics
- [ ] Commodity correlation analysis
- [ ] Market sentiment indicators
- [ ] Export data functionality

**Pages to create:**
- `app/analytics/page.tsx`
- `app/analytics/agent-performance/page.tsx`
- `app/analytics/market-trends/page.tsx`

---

#### **Task 4.3: Notifications System** [MEDIUM PRIORITY]
**Estimated: 2 days**
- [ ] In-app notification center
- [ ] Email notifications (optional)
- [ ] Push notifications (PWA)
- [ ] Notification preferences
- [ ] Alert templates

**Files to create:**
- `app/api/notifications/route.ts`
- `components/notifications/notification-center.tsx`
- `lib/notifications/service.ts`

---

#### **Task 4.4: Search & Discovery** [LOW PRIORITY]
**Estimated: 2 days**
- [ ] Global search functionality
- [ ] Search commodities, markets, listings, pools
- [ ] Fuzzy search
- [ ] Recent searches
- [ ] Search suggestions

**Components to create:**
- `components/search/global-search.tsx`
- `components/search/search-results.tsx`

---

### 🟣 SPRINT 5: DOCUMENTATION & DEPLOYMENT (Week 9)

#### **Task 5.1: Documentation** [HIGH PRIORITY]
**Estimated: 2 days**
- [ ] Update README.md
  - [ ] Complete setup instructions
  - [ ] Environment variables documentation
  - [ ] Database setup & migration guide
  - [ ] API documentation
  - [ ] Agent configuration
- [ ] Create API documentation (OpenAPI/Swagger)
- [ ] Create user guide
- [ ] Create developer guide
- [ ] Add inline code comments
- [ ] Create troubleshooting guide

**Files to create/update:**
- `README.md`
- `docs/API.md`
- `docs/USER_GUIDE.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/TROUBLESHOOTING.md`
- `docs/DEPLOYMENT.md`

---

#### **Task 5.2: Testing** [HIGH PRIORITY]
**Estimated: 3 days**
- [ ] Unit tests for utilities
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] Agent prediction tests
- [ ] Database query tests
- [ ] Component tests

**Files to create:**
- `__tests__/lib/agents/*.test.ts`
- `__tests__/lib/db/*.test.ts`
- `__tests__/api/*.test.ts`
- `e2e/*.spec.ts`

---

#### **Task 5.3: Performance Optimization** [MEDIUM PRIORITY]
**Estimated: 2 days**
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Cache strategies
- [ ] Database query optimization
- [ ] Bundle size analysis
- [ ] Lighthouse score improvements

---

#### **Task 5.4: Deployment & DevOps** [HIGH PRIORITY]
**Estimated: 1-2 days**
- [ ] Vercel deployment configuration
- [ ] Environment variables setup
- [ ] Database migrations in production
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring & logging (Sentry)
- [ ] Backup strategy
- [ ] Staging environment

**Files to create:**
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `vercel.json`

---

## 📊 PROGRESS METRICS

### Current Sprint Status
- **Sprint**: 1 (Core Agent & Prediction Engine)
- **Progress**: 40% (Schema & Foundation Complete)
- **Days Remaining**: ~10-12 working days
- **Blockers**: None currently

### Overall Project Status
- **Total Tasks**: 60+
- **Completed**: 15 (~25%)
- **In Progress**: 1 (~2%)
- **Not Started**: 44 (~73%)

### Feature Completion
- ✅ Authentication & User Management: 100%
- ✅ Basic Schema & DB: 100%
- 🟡 Agent Infrastructure: 40%
- 🔴 Prediction APIs: 0%
- 🔴 Marketplace: 0%
- 🔴 User Markets: 0%
- 🔴 Pools: 0%
- 🟡 Dashboard: 20%
- 🔴 UX Polish: 0%
- 🔴 Documentation: 10%

---

## 🎯 IMMEDIATE NEXT STEPS (This Week)

1. **Complete Commodity Plugin** (1-2 days)
   - Build ElizaOS plugin with actions/providers
   - Test with mock data

2. **Agent Runtime Bootstrap** (1 day)
   - Initialize AgentRuntime
   - Connect to Groq
   - Test end-to-end prediction

3. **Prediction API Route** (1 day)
   - Build `/api/agents/commodity/predict`
   - Validate with Postman/curl
   - Document request/response

4. **Run Migration & Seed** (0.5 day)
   - Push new schema to Turso
   - Populate with sample predictions

5. **Dashboard Predictions Widget** (1 day)
   - Fetch and display predictions
   - Show confidence & narrative
   - Polish UI

---

## 🔧 TECHNICAL DEBT & IMPROVEMENTS

### Code Quality
- [ ] Add TypeScript strict mode
- [ ] ESLint configuration
- [ ] Prettier configuration
- [ ] Husky pre-commit hooks

### Security
- [ ] API rate limiting
- [ ] Input sanitization
- [ ] CORS configuration
- [ ] Helmet security headers
- [ ] SQL injection prevention (Drizzle handles this)

### Performance
- [ ] Redis caching layer (optional)
- [ ] Database indexing review
- [ ] API response compression
- [ ] Static page generation where possible

---

## 📝 NOTES

### Dependencies Status
- ✅ All core dependencies installed
- ✅ ElizaOS 1.6.1 installed
- ✅ Groq SDK 0.5.0 installed
- ⚠️ May need `@upstash/redis` or `@vercel/kv` for caching (optional)
- ⚠️ May need `ws` for WebSocket support (optional)

### Environment Variables Needed
```bash
# Already configured
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
DATABASE_URL=
DATABASE_AUTH_TOKEN=

# Need to add
GROQ_API_KEY=                      # Required for agent
GROQ_MODEL=mixtral-8x7b-32768      # Optional, has default
ELIZA_AGENT_ID=                    # Optional
EXTERNAL_FEED_TOKEN=               # For webhook ingestion
PREDICTION_CACHE_TTL=1800          # 30 min cache
NEXT_PUBLIC_MARKETPLACE_STREAM_URL= # For frontend SSE
```

### Risks & Considerations
1. **Groq Rate Limits**: May need throttling/queueing for predictions
2. **Database Size**: Predictions table can grow large, consider retention policy
3. **Real-time Updates**: SSE/WebSocket adds complexity, can defer to later sprint
4. **On-chain Integration**: Tokenization feature may require smart contract dev (future)
5. **Regulatory Compliance**: Marketplace may need legal review depending on jurisdiction

---

## 🚀 SUCCESS CRITERIA

### Sprint 1 (Core Agent)
- [ ] Agent generates predictions via Groq ✓
- [ ] Predictions stored in database ✓
- [ ] API returns valid predictions ✓
- [ ] Dashboard shows sample predictions ✓

### Sprint 2 (Marketplace)
- [ ] Users can create listings ✓
- [ ] Users can place bids ✓
- [ ] Marketplace page displays listings ✓
- [ ] User can create custom markets ✓

### Sprint 3 (Dashboard & UX)
- [ ] Dashboard shows live data ✓
- [ ] Responsive on mobile/tablet ✓
- [ ] Loading states implemented ✓
- [ ] Dark mode works everywhere ✓

### Sprint 4 (Advanced)
- [ ] Real-time updates working ✓
- [ ] Notifications functional ✓
- [ ] Analytics page complete ✓

### Sprint 5 (Launch Ready)
- [ ] All docs complete ✓
- [ ] Tests passing ✓
- [ ] Deployed to production ✓
- [ ] Monitoring active ✓

---

**Last Updated**: October 6, 2025
**Next Review**: End of Sprint 1 (~October 18, 2025)
