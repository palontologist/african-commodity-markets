# Synthesis Markets 🌍🌽🪙

**DeFi Risk Assurance for Real-World Assets (RWA)**

Synthesis Markets is an AI-powered platform that allows African cooperatives to hedge against price volatility for crops, metals, and fuel. It combines **AI Agents** (for market monitoring) with **DeFi Prediction Markets** (for trustless hedging).

## 🚀 Live Deployment (Base Mainnet)

- **Contract:** `AIPredictionMarket.sol`
- **Network:** Base Mainnet (8453)
- **Address:** [`0xc57fC9AF8DA52bC5DD96B03368582DBBe88F9E1a`](https://basescan.org/address/0xc57fC9AF8DA52bC5DD96B03368582DBBe88F9E1a)
- **Oracle:** Chainlink (ETH/USD Feed used for demo)

## 🏗 Architecture

1.  **The Sentinel Agent 🤖**
    *   Runs in the background (`scripts/sentinel-agent.js`).
    *   Monitors Chainlink Price Feeds (Simulated for specific commodities).
    *   **Autonomous Action:** Automatically triggers a "Hedge" transaction when prices drop below a threshold.

2.  **The Cooperative Dashboard 📊**
    *   **Stack:** Next.js 14, Tailwind CSS, shadcn/ui.
    *   **Features:**
        *   Real-time Asset Portfolio (Gold, Coffee, Fuel).
        *   **"Bridge Assets":** Simulates cross-chain liquidity from Solana.
        *   **"Insure Now":** Connects to MetaMask to stake USDC on the Base Mainnet contract.

3.  **The WhatsApp Bot 💬**
    *   Allows farmers to check prices via SMS/WhatsApp.
    *   Powered by Twilio + Next.js API Routes.

## 🛠 Setup & Demo

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Dashboard
```bash
npm run dev
```
Visit `http://localhost:3000/dashboard`.

### 3. Run the Sentinel Agent (Demo Mode)
Open a new terminal and run:
```bash
node scripts/sentinel-agent.js
```
*Watch it detect a "Coffee Price Crash" and execute a simulated hedge.*

### 4. Run the WhatsApp Bot (Local)
```bash
# Requires ngrok or similar to expose localhost:3000
curl -X POST http://localhost:3000/api/whatsapp -d "Body=PRICE GOLD"
```

## 📜 Contract Details

The `AIPredictionMarket` contract allows users to:
1.  **Create Predictions:** AI agents submit forecasts with confidence scores.
2.  **Stake (Hedge):** Users stake USDC on "YES" (Price holds) or "NO" (Price crashes).
3.  **Resolve:** Oracle verifies the final price and distributes payouts.

## 🏆 Hackathon Tracks
- **Base:** Deployed on Base Mainnet.
- **Chainlink:** Uses Price Feeds for RWA data.
- **AI Agent:** Autonomous monitoring and execution.
