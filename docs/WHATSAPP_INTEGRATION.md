# AfriFutures - WhatsApp Hedge Integration

## Overview

WhatsApp is the primary touchpoint for African farmers. AfriFutures uses WhatsApp to enable **natural language price hedging** without requiring app downloads or blockchain knowledge.

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   WhatsApp      │────▶│   WhatsApp Bot   │────▶│   AfriFutures   │
│   (Farmer)      │◀────│   (Nhost/ML)     │◀────│   Backend       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                        ┌──────────────────────────────┐   │
                        │      Chainlink Oracle        │◀──┘
                        │   (Price Triggers)           │
                        └──────────────────────────────┘
                                  │
                        ┌──────────────────────────────┐
                        │      Polygon Blockchain       │
                        │   (Instant Settlement)        │
                        └──────────────────────────────┘
```

---

## Natural Language Parsing

### Supported Commands

| Command Pattern | Example | Parsed Intent |
|---------------|---------|---------------|
| "Hedge [qty] [crop] @ [price]" | "Hedge 500kg maize @ KSh 80/kg" | CREATE_HEDGE |
| "Check my hedge" | "Check my hedge" | GET_POSITIONS |
| "Cancel hedge [id]" | "Cancel hedge #123" | CANCEL_HEDGE |
| "What's the price of [crop]?" | "What's the price of coffee?" | GET_PRICE |
| "Help" | "Help" | SHOW_HELP |

### Parsing Logic

```typescript
// lib/whatsapp/parser.ts
const PATTERNS = {
  HEDGE: /hedge\s+(\d+)\s*(kg|mt|tons?|tonnes?)\s+(\w+)\s*@\s*([\d,]+)\s*\/?\s*(kg|sh|usd)?/i,
  CHECK: /check\s+(my\s+)?(hedge|position|portfolio)/i,
  CANCEL: /cancel\s+hedge\s*#?(\d+)/i,
  PRICE: /price\s+(of\s+)?(\w+)/i,
};

function parseMessage(text: string): ParsedIntent {
  if (PATTERNS.HEDGE.test(text)) {
    const match = text.match(PATTERNS.HEDGE);
    return {
      type: 'CREATE_HEDGE',
      quantity: parseFloat(match[1]),
      unit: match[2],
      commodity: match[3].toUpperCase(),
      strikePrice: parseFloat(match[4].replace(',', '')),
      currency: match[5] || 'LOCAL',
    };
  }
  // ... other patterns
}
```

---

## Conversation Flow

### Flow 1: First-Time Hedge

```
Farmer: "Hedge 500kg maize @ KSh 80/kg"

Bot: "Hi! 👋 I see you want to hedge maize."

    "Let me check the current price..."
    
    "📊 Current maize price: KSh 75/kg"
    "📈 30-day average: KSh 72/kg"
    
    "Your hedge details:"
    "• Quantity: 500 kg"
    "• Strike price: KSh 80/kg"
    "• Protection: KSh 5/kg downside"
    "• Premium: KSh 200 (~$1.70)"
    
    "Reply YES to confirm, or NEW AMOUNT to adjust"
```

### Flow 2: Price Drop Trigger

```
[System] "⚠️ Price Alert!"
    
"Maize dropped to KSh 70/kg"
"Your hedge at KSh 80/kg triggered!"
    
"💰 Payout calculation:"
"• Quantity: 500 kg"
"• Difference: KSh 10/kg"
"• Total payout: KSh 5,000 (~$42)"
    
"✅ Payout sent to your wallet!"
"📱 USDC balance: KSh 5,000"
```

### Flow 3: Hedge Expiry

```
[System] "🏁 Hedge Expired"
    
"Hedge #123 has expired (90 days)"
    
"Summary:"
"• Strike: KSh 80/kg"
"• Final price: KSh 85/kg"
"• Result: No payout needed"
"• Note: You sold at market price!"

"Would you like to open a new hedge?"
"Reply NEW HEDGE to continue"
```

---

## Multi-Language Support

### Supported Languages
- English (default)
- Swahili (Kenya, Tanzania)
- Hausa (Nigeria)
- French (West Africa)

### Language Detection

```typescript
// Auto-detect from message
const detectLanguage = (text: string): Language => {
  const swahiliWords = ['moja', 'mbili', 'tano', 'hedhi', 'bei', 'mkulima'];
  const hausaWords = [' daya', 'biyu', 'uku', 'farar', 'kudin', 'farmer'];
  
  const swahiliScore = swahiliWords.filter(w => text.includes(w)).length;
  const hausaScore = hausaWords.filter(w => text.includes(w)).length;
  
  if (swahiliScore > hausaScore) return 'SW';
  if (hausaScore > 0) return 'HA';
  return 'EN';
};
```

### Swahili Example

```
Farmer: "Hedhi ya kg 500 ya mahindi @ KSh 80/kg"

Bot: "Habari! 🌽"
    
"Bei ya sasa ya mahindi: KSh 75/kg"
    
"Oferta yako:"
"• Kiasi: 500 kg"
"• Bei ya kudhibiti: KSh 80/kg"
"• Kulipa: KSh 200 (~$1.70)"
    
"Andika NDIYO kuthibitisha"
```

---

## WhatsApp Business API Integration

### Setup (Nhost + Twilio)

```typescript
// lib/whatsapp/webhook.ts
import { nhost } from '@/lib/nhost';
import { parseMessage, generateResponse } from './parser';

export async function handleIncomingMessage(
  from: string,
  message: string
): Promise<string> {
  // 1. Get or create user
  const user = await getOrCreateUser(from);
  
  // 2. Parse intent
  const intent = parseMessage(message, user.language);
  
  // 3. Process based on intent
  switch (intent.type) {
    case 'CREATE_HEDGE':
      return await createHedge(user, intent);
    case 'GET_POSITIONS':
      return await getPositions(user);
    case 'GET_PRICE':
      return await getPrice(intent.commodity);
    case 'CANCEL_HEDGE':
      return await cancelHedge(user, intent.hedgeId);
    default:
      return generateHelpMessage(user.language);
  }
}
```

### Twilio Webhook Handler

```typescript
// app/api/whatsapp/webhook/route.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {
  const formData = await req.formData();
  const from = formData.get('From') as string;
  const message = formData.get('Body') as string;
  
  const response = await handleIncomingMessage(from, message);
  
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Message>${response}</Message>
    </Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  );
}
```

---

## Chainlink Price Triggers

### Price Feed Integration

```typescript
// contracts/PriceTrigger.sol
interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract PriceTrigger {
    AggregatorV3Interface public priceFeed;
    uint256 public hedgeId;
    uint256 public strikePrice;
    
    event PriceTriggered(
        uint256 hedgeId,
        uint256 strikePrice,
        uint256 currentPrice,
        uint256 payout
    );
    
    function checkAndExecute() external {
        (, int256 currentPrice, , ,) = priceFeed.latestRoundData();
        
        if (currentPrice < int256(strikePrice)) {
            uint256 payout = (strikePrice - uint256(currentPrice)) * quantity;
            
            // Transfer payout to farmer
            usdc.transfer(farmer, payout);
            
            emit PriceTriggered(hedgeId, strikePrice, uint256(currentPrice), payout);
        }
    }
}
```

### Chainlink Automation

```typescript
// scripts/setup-chainlink.ts
import { keepers } from '@chainlink/functions-toolkit';

const job = await keepers.createJob({
  name: 'AfriFutures Price Trigger',
  contract: priceTrigger.address,
  jobId: 'checkAndExecute',
  interval: 300, // 5 minutes
  trigger: 'time',
});

console.log(`Chainlink job created: ${job.id}`);
```

---

## User Verification Flow

### Phone Number Verification

```
1. Farmer sends "Join"
   ↓
2. Bot: "Welcome! Enter your verification code"
   ↓
3. Farmer enters: "123456"
   ↓
4. Bot: "✓ Verified! What's your name?"
   ↓
5. Farmer: "John Kamau"
   ↓
6. Bot: "✓ Welcome John! Reply HELP for commands"
```

### KYC Integration

```typescript
async function verifyFarmer(phone: string, idNumber: string) {
  // Call KYC provider (JUMIO, Smile Identity, etc.)
  const result = await kycProvider.verify({
    phone,
    idNumber,
    selfie: await getSelfie(phone),
  });
  
  if (result.isVerified) {
    await db.users.update(phone, { 
      kycStatus: 'VERIFIED',
      dvcScore: { increment: 100 }
    });
  }
  
  return result;
}
```

---

## Error Handling

| Error | User Message | Action |
|-------|--------------|--------|
| Invalid quantity | "Please specify amount in kg or MT. Example: 500kg" | Show format |
| Commodity not supported | "Sorry, we don't support [crop] yet. Try: maize, wheat, cocoa, coffee" | List options |
| Insufficient balance | "Not enough funds. Minimum premium: KSh 50. Top up with MPesa" | Show top-up |
| Network error | "Connection issue. Please try again." | Retry 3x |
| Price stale | "Price data delayed. Last update: [time]. Try again later." | Wait 5min |

---

## Testing

### Local Development

```bash
# Use ngrok for WhatsApp webhook
ngrok http 3000

# Set webhook URL in Twilio
TWILIO_WHATSAPP_WEBHOOK=https://xxx.ngrok.io/api/whatsapp/webhook
```

### Test Scenarios

| Scenario | Input | Expected Output |
|----------|-------|----------------|
| Valid hedge | "Hedge 100kg coffee @ KSh 500/kg" | Hedge confirmation |
| Invalid format | "I want to sell some crops" | Help message |
| Language switch | "Hedhi 100kg" | Swahili response |
| Cancel hedge | "Cancel hedge #123" | Cancellation confirmation |

---

## Next Steps

1. [ ] Set up Twilio WhatsApp Business account
2. [ ] Configure Nhost for user management
3. [ ] Deploy WhatsApp webhook handler
4. [ ] Add language detection
5. [ ] Connect to Chainlink price feeds
6. [ ] Test with pilot co-op farmers
