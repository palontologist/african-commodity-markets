# ElizaOS + Groq Integration Blueprint

## 🎯 Objectives
- Embed an ElizaOS autonomous agent that forecasts African commodity prices with Groq-hosted LLMs.
- Unify live price ingestion, model-driven predictions, and marketplace intelligence in one extensible service.
- Expose real-time outputs to the Next.js frontend (dashboard, pools, marketplace) with minimal latency.
- Lay the groundwork for permissionless market creation inspired by Meeleee Markets, supporting tokenisation and bidding.

## 🧱 High-Level Architecture
1. **Data Ingestion Layer**
   - Continue using `lib/live-prices.ts` for baseline Yahoo Finance + fallback prices.
   - Add agent-triggered fetchers (scheduled + on-demand) that push normalised data into Drizzle tables (`commodity_prices`, new prediction tables).
   - Support external webhooks (`/api/messaging/ingest-external`) for third-party feeds.
2. **Agent Runtime (ElizaOS)**
   - Run an ElizaOS agent as a long-lived service (Edge runtime disabled) inside `lib/agents/commodity-agent.ts`.
   - Register custom commodity plugins/actions to:
     - Fetch spot data (`getLivePrice` wrapper).
     - Query historical averages from DB.
     - Call Groq for forecasting and scenario analysis.
     - Broadcast decisions via internal pub/sub (Next.js Route Handlers + WebSockets / SSE).
3. **Prediction Service (Groq)**
   - Use Groq API (e.g., `mixtral-8x7b`, `llama3-70b-8192`, or `groq-llama3-70b-8192`) for fast inference.
   - Create `lib/agents/groq-client.ts` exporting a typed Groq client with retry + caching.
   - Maintain prompt templates for:
     - Short-term price predictions (1d/7d).
     - Market “confidence score”.
     - Narrative insights for traders and pool participants.
4. **Storage + Events**
   - Extend Drizzle schema with:
     - `commodity_predictions` table.
     - `prediction_signals` (optional) for agent recommendations.
     - `market_pools` / `pool_participants` for liquidity tracking.
   - Consider Redis/Upstash (optional) for ephemeral caching and rate limiting.
5. **API Layer**
   - `/api/agents/commodity/predict` – synchronous prediction endpoint (on-demand).
   - `/api/agents/commodity/stream` – SSE/WebSocket streaming for live agent chatter.
   - `/api/agents/commodity/ingest` – accepts external price updates, forwards to agent memory.
   - `/api/marketplace/listings` & `/api/marketplace/bids` – CRUD endpoints powering tokenised listings and bids.
6. **Frontend**
   - Dashboard widgets for live price + agent forecast, participants, pool TVL.
   - Marketplace route with creation form (tokenise produce) and live order book.
   - Use SWR/React Query to poll or subscribe to `/stream`.

## 🔌 Key Components & File Map
| Component | Proposed Path | Notes |
|-----------|---------------|-------|
| Agent bootstrap | `lib/agents/commodity-agent.ts` | Creates and exports singleton Eliza agent instance. |
| Groq client | `lib/agents/groq-client.ts` | Wraps Groq SDK with retries, typed responses. |
| Commodity plugin | `lib/agents/plugins/commodity-data.ts` | Eliza `Plugin` providing actions/providers/services per docs. |
| Prediction store | `lib/db/predictions.ts` + schema update | CRUD helpers for Drizzle. |
| Scheduler | `lib/agents/scheduler.ts` | Cron-like loops (e.g., `setInterval`, `cron-job.org`, or Vercel Cron). |
| Route handlers | `app/api/agents/commodity/**` | Next.js server routes (Node runtime). |
| Marketplace pages | `app/marketplace/page.tsx`, dynamic segments | Tokenised listings & bidding UI. |
| Shared types | `types/agent.ts` (new) | Request/response shapes, zod schemas. |

## 📦 Dependencies
Add via `pnpm add`:
- `elizaos` – core agent runtime.
- `groq-sdk` – official Groq API client.
- `openai` (optional) – only if leveraging OpenAI-compatible API fallback.
- `zod` (already present) – validate agent I/O schemas.
- `p-retry` or `async-retry` – resilient Groq calls (optional).
- `eventsource-parser` / `ws` – for streaming support if needed.
- `@upstash/redis` or `@vercel/kv` (optional) – caching + pub/sub.

Dev dependencies:
- `@types/ws` if WebSocket server used.

## 🔐 Environment Variables
Document in `.env.example`:
- `ELIZA_AGENT_ID` – unique agent identifier.
- `ELIZA_AGENT_SECRET` – optional secret if using Eliza Cloud messaging.
- `GROQ_API_KEY` – Groq API access token.
- `EXTERNAL_FEED_TOKEN` – HMAC secret for ingestion endpoint.
- `PREDICTION_CACHE_TTL` – optional numeric TTL in seconds.
- `NEXT_PUBLIC_MARKETPLACE_STREAM_URL` – frontend subscription URL.

## ⚙️ Agent Workflow (Pseudo)
1. **Bootstrap**: On first import, instantiate Eliza agent with memory store + commodity plugin.
2. **Schedule Loop**: Every N minutes, the agent pulls latest spot prices, stores them, and requests Groq forecast.
3. **Prediction Generation**:
   ```ts
   const prompt = buildPrompt({ symbol, history, macroSignals })
   const response = await groqClient.chat.completions.create(...)
   const parsed = parsePrediction(response)
   await savePrediction(parsed)
   agent.broadcast({ type: 'prediction', payload: parsed })
   ```
4. **Frontend Delivery**: API route streams/batches predictions to UI.
5. **Marketplace Hooks**: When new prediction crosses confidence threshold, agent can auto-create suggestion records for tokenised pools.

## 🛤️ Implementation Phases
1. Scaffold agent infrastructure + add dependencies.
2. Implement commodity plugin and Groq client.
3. Extend database schema with predictions + pools.
4. Build API routes (predict, ingest, stream).
5. Update frontend components (dashboard cards, marketplace pages).
6. Add tests (unit for client/plugin, e2e for API) and update docs.

## 📈 Data & Prompt Strategy
- Use historical averages from `commodity_prices` (needs backfill) and external APIs.
- Include regional context (e.g., `Region` type).
- Provide model with scenario variables: weather anomaly, logistics status, FX rates (future enhancement via plugin actions).
- Define output schema:
  ```json
  {
    "symbol": "COFFEE",
    "region": "AFRICA",
    "prediction": {
      "price": 3.15,
      "currency": "USD",
      "horizon": "7d"
    },
    "confidence": 0.78,
    "narrative": "..."
  }
  ```

## 🧪 Testing Strategy
- **Unit**: Mock Groq responses, validate plugin action outputs.
- **Integration**: Route handler tests via `@testing-library/jest-dom` + Next route testing utilities.
- **Load**: Ensure Groq rate limits respected (batch requests, caching).
- **Security**: Verify auth tokens on ingestion routes; guard streaming endpoints for authenticated users.

## 🔮 Marketplace Extension Outline
- **Tokenisation Flow**: Form to create ERC-1155-like off-chain representation; optionally integrate with on-chain bridge later.
- **Bidding UI**: Live order book, integrate with pool metrics (TVL, participants, predicted payout).
- **Reputation Layer**: Track creator performance using agent prediction accuracy.
- **Meeleee Inspiration**: Permissionless creation, open liquidity, emphasise crowd truth discovery.

## 📚 References & Next Steps
- ElizaOS Docs: https://docs.elizaos.ai/
- Groq API Docs: https://console.groq.com/docs
- Follow-up tasks: finalise schema design, implement agent service, wire UI, document runbooks.
