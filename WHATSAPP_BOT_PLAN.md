# 📱 WhatsApp Bot for African Commodity Markets

## Overview
This feature allows farmers in rural areas with limited internet access to query commodity prices via WhatsApp or SMS.

## Architecture
1.  **User**: Sends message `PRICE MAIZE NAIROBI` to Twilio number.
2.  **Twilio**: Webhook hits `/api/whatsapp` endpoint in Next.js app.
3.  **Next.js API**:
    *   Parses the message (Commodity + Market).
    *   Queries the **Turso Database** or **Oracle API**.
    *   Formats the response (Price + Trend + Advice).
4.  **Twilio**: Sends reply back to user.

## Implementation Steps

### 1. Setup Twilio
*   Sign up for Twilio (Free Trial).
*   Get a WhatsApp Sandbox Number.
*   Set Webhook URL to `https://your-app.vercel.app/api/whatsapp`.

### 2. Create API Route (`app/api/whatsapp/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const body = formData.get('Body')?.toString().toUpperCase() || '';
    const from = formData.get('From')?.toString() || '';

    let responseMessage = '';

    if (body.startsWith('PRICE')) {
        const parts = body.split(' ');
        const commodity = parts[1]; // e.g., MAIZE
        const market = parts[2] || 'NAIROBI'; // Default to Nairobi

        // TODO: Query Database/Oracle here
        const price = 3500; // Mock price
        const currency = 'KES';
        
        responseMessage = `🌽 *${commodity} Price in ${market}*\n` +
                          `💰 Current: ${price} ${currency} / 90kg bag\n` +
                          `📈 Trend: +2.5% this week\n` +
                          `💡 Advice: Hold for better prices.`;
    } else {
        responseMessage = `Welcome to African Commodity Markets! 🌍\n` +
                          `Send: PRICE [COMMODITY] [MARKET]\n` +
                          `Example: PRICE MAIZE NAIROBI`;
    }

    // Send Reply via Twilio
    // (In production, use TwiML or client.messages.create)
    
    return new NextResponse(`
        <Response>
            <Message>${responseMessage}</Message>
        </Response>
    `, {
        headers: { 'Content-Type': 'text/xml' }
    });
}
```

### 3. Deploy & Test
*   Deploy to Vercel.
*   Send WhatsApp message to Sandbox number.

## Hackathon "Fake It" Strategy
If Twilio integration is too complex:
1.  Build a simple UI component that *looks* like a chat interface.
2.  User types "PRICE MAIZE".
3.  App replies with the data.
4.  Record this for the demo video as "WhatsApp Integration Preview".
