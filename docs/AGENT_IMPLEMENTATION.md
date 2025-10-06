# Commodity Agent Implementation Guide

## Overview

The ElizaOS commodity agent implementation has been created with the following structure:

### Core Files Created

1. **`lib/agents/prompts.ts`** ✅
   - Prediction prompt templates for different horizons
   - Commodity-specific context and factors
   - Pattern analysis and comparative analysis prompts

2. **`lib/agents/groq-client.ts`** ✅
   - Groq API wrapper with retry logic
   - Type-safe request/response handling
   - Already tested and working

3. **`lib/agents/plugins/commodity-data.ts`** ⚠️
   - ElizaOS plugin for live price fetching
   - Historical data provider
   - Market context provider
   - *Note: ElizaOS API compatibility needs adjustment*

4. **`lib/agents/plugins/commodity-prediction.ts`** ⚠️
   - ElizaOS plugin for price predictions using Groq
   - Stores predictions in database
   - Handles prediction signals
   - *Note: ElizaOS API compatibility needs adjustment*

5. **`lib/agents/commodity-agent.ts`** ⚠️
   - Agent runtime bootstrap
   - Character definition (CommodityOracle)
   - Message processing
   - *Note: ElizaOS AgentRuntime API changed in v1.6.1*

6. **`lib/agents/scheduler.ts`** ✅
   - Background scheduler for periodic predictions
   - Configurable intervals (hourly/daily/weekly)
   - Status monitoring

7. **`lib/agents/index.ts`** ✅
   - Main entry point
   - Convenience functions for quick predictions
   - Exports all agent functionality

## ElizaOS API Compatibility Issues

The ElizaOS v1.6.1 API has changed significantly from earlier versions. The following adjustments are needed:

### 1. AgentRuntime Constructor
The `AgentRuntime` constructor parameters have changed. Instead of using ElizaOS's full runtime, we can use a **simplified direct API approach**.

### 2. Action/Provider Signatures
The ElizaOS Action and Provider interfaces have stricter type requirements that don't match our implementation.

## Recommended Approach: Direct API Implementation

Instead of using the full ElizaOS plugin system (which is designed for chatbot agents), we recommend a **direct implementation** approach for commodity predictions:

### Simple API Flow

```typescript
// User Request → API Route → Groq LLM → Database → Response

// 1. API Route receives prediction request
POST /api/agents/commodity/predict
{
  "symbol": "COFFEE",
  "region": "AFRICA",
  "horizon": "SHORT_TERM"
}

// 2. Build prompt using lib/agents/prompts.ts
const prompt = buildPredictionPrompt(context)

// 3. Call Groq using lib/agents/groq-client.ts  
const response = await runGroqChat({ prompt, ... })

// 4. Parse and store using lib/db/predictions.ts
const prediction = await insertCommodityPrediction(data)

// 5. Return response
{
  "predictedPrice": 2.45,
  "confidence": 0.85,
  "narrative": "..."
}
```

This approach:
- ✅ Uses all the code we've written (prompts, Groq client, database helpers)
- ✅ Avoids ElizaOS API complexity
- ✅ Simpler to maintain and debug
- ✅ Easier to extend with custom logic
- ✅ Works perfectly for our commodity prediction use case

## Next Steps

### Option A: Direct API Implementation (Recommended)
1. Create `/api/agents/commodity/predict` route
2. Use `buildPredictionPrompt()` + `runGroqChat()` + `insertCommodityPrediction()`
3. Add optional scheduler that calls this API periodically
4. Wire up dashboard to fetch predictions

**Time: 2-3 hours**
**Complexity: Low**
**Maintenance: Easy**

### Option B: Fix ElizaOS Integration
1. Study ElizaOS v1.6.1 API documentation
2. Adjust all plugin interfaces to match
3. Debug AgentRuntime initialization
4. Test plugin system

**Time: 1-2 days**
**Complexity: High**
**Maintenance: Complex**

## Recommendation

**Go with Option A (Direct API)** because:

1. **It's simpler** - No need to learn complex ElizaOS plugin architecture
2. **It's faster** - Can be implemented in hours, not days
3. **It's sufficient** - We don't need conversational AI features
4. **It's maintainable** - Straightforward code that any developer can understand
5. **It works now** - The core components (prompts, Groq client) are already functional

The ElizaOS full agent system is designed for building conversational AI chatbots with memory, actions, and complex state management. For our specific use case (commodity price predictions), a direct API approach is more appropriate.

## Files Ready to Use

These files are complete and can be used immediately:

- ✅ `lib/agents/prompts.ts` - All prompt templates ready
- ✅ `lib/agents/groq-client.ts` - Groq API integration working
- ✅ `lib/db/predictions.ts` - Database helpers ready
- ✅ `lib/agents/scheduler.ts` - Can be adapted to call API routes
- ✅ `types/agent.ts` - Type definitions ready

## Files That Need Adjustment for Direct API

- `lib/agents/plugins/*` - Can be reference/documentation, don't need to work with ElizaOS
- `lib/agents/commodity-agent.ts` - Replace with simple function: `generatePrediction()`

## Updated Implementation Plan

**Task: Create Prediction API Route** (2-3 hours)

1. Create `app/api/agents/commodity/predict/route.ts`
2. Import and use:
   - `buildPredictionPrompt` from prompts.ts
   - `runGroqChat` from groq-client.ts
   - `insertCommodityPrediction` from predictions.ts
   - `getLivePrice` from live-prices.ts
3. Add request validation with Zod
4. Add error handling and logging
5. Return structured prediction response

This gives us a production-ready commodity prediction system without fighting ElizaOS API changes.

## Conclusion

We've successfully created all the core components for commodity prediction. The next step is to connect them via a simple API route rather than trying to fit them into ElizaOS's complex plugin architecture. This is a pragmatic decision that delivers value faster while keeping the codebase maintainable.
