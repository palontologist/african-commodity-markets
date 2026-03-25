import { NextRequest, NextResponse } from 'next/server';
import { getChainlinkPrice } from '@/lib/chainlink';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const body = formData.get('Body')?.toString().toUpperCase() || '';
        const from = formData.get('From')?.toString() || '';

        console.log(`📩 WhatsApp Message from ${from}: ${body}`);

        let responseMessage = '';

        if (body.startsWith('PRICE')) {
            const parts = body.split(' ');
            const commodity = parts[1]; // e.g., MAIZE, GOLD

            if (commodity) {
                const price = await getChainlinkPrice(commodity);
                
                if (price !== null) {
                    responseMessage = `🌍 *${commodity} Price Update*\n` +
                                      `💰 Current: $${price.toFixed(2)} USD\n` +
                                      `🔗 Source: Chainlink Oracle (Polygon Amoy)\n` +
                                      `💡 Advice: ${price > 100 ? 'HIGH VALUE - HEDGE NOW' : 'STABLE'}`;
                } else {
                    responseMessage = `❌ Price feed for '${commodity}' not available yet.`;
                }
            } else {
                responseMessage = `Please specify a commodity. Example: PRICE GOLD`;
            }
        } else {
            responseMessage = `Welcome to Synthesis Markets! 🌍\n` +
                              `Send: PRICE [COMMODITY]\n` +
                              `Supported: GOLD, ETH, BTC, COFFEE, MAIZE, FUEL`;
        }

        // Return TwiML response
        return new NextResponse(`
            <Response>
                <Message>${responseMessage}</Message>
            </Response>
        `, {
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error) {
        console.error('Error processing WhatsApp message:', error);
        return new NextResponse('Error', { status: 500 });
    }
}
