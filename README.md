# African Commodity Markets Platform

**Live Site**: https://afrifutures.vercel.app

Afrifutures is a real-time commodity intelligence platform focused on solving one problem: helping Kenyan coffee farmers get fair prices through price protection services.

## What It Does

### For Farmers
- Lock in coffee prices to protect against market drops
- Schedule consultations with the founder for personalized help
- Direct access to price data and market information

### For Traders & Buyers
- Access real-time coffee prices ($3.63/lb as of last update)
- Request API access for integration into trading systems
- View comprehensive market data and trends

## How to Contribute

This is a service focused on one problem: Kenyan coffee price protection. Please follow these guidelines:

### Project Philosophy
- Start narrow, stay simple
- Focus on solving real problems, not building features
- Manual process with software assistance
- Founder reviews every contribution

### Key Principles
1. **Solve real farmer problems** - Consult with the founder before starting new features
2. **Keep it simple** - Remove complexity, focus on clarity
3. **Start narrow** - Work on one thing at a time
4. **Do things that don't scale** - Manual processes with software support

### Getting Started

1. Fork this repository
2. Make one focused change at a time
3. Create a simple, clean pull request
4. Wait for manual review

The goal is not to build a complex platform, but to solve one real problem well.

## Technical Details

- **Framework**: Next.js 14 with App Router
- **Auth**: Clerk authentication
- **Database**: Turso/LibSQL with Drizzle ORM
- **Price Data**: ECX Nairobi real-time coffee prices
- **UI**: Tailwind CSS + shadcn/ui components
- **Focus**: Kenyan AA Coffee only (1 commodity, 1 region)

## Current Implementation

The platform currently includes:

1. **Homepage**: Coffee price + farmer/trader entry points
2. **Dashboard**: Price display + consultation/API access buttons
3. **Prices**: Detailed coffee price information
4. **Consult**: Price protection consultation booking
5. **Enterprise**: Simple API access for institutional users
6. **Enterprise Keys**: Manual API key management

## What Was Removed

This project deliberately removed complexity to focus on one problem:

- 8 out of 9 commodities (now only Kenya AA Coffee)
- LATAM data and international features
- Mock data and fake statistics
- Complex dashboards and charts
- Auto-scaling infrastructure
- Platform branding

## Next Steps

For contributors looking to work on this project:

1. Review [AGENTS.md](./AGENTS.md) for development guidelines
2. Consult with the founder about which problems to solve
3. Focus on small, focused changes
4. Keep documentation simple and clear
