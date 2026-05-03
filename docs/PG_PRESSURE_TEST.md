# Afrifutures PG Pressure Test
## Comprehensive UX & Product Analysis

**Date:** May 2026
**Reviewer:** Paul Graham Perspective
**Status:** CRITICAL FINDINGS - Immediate action required

---

## Executive Summary

The app shows promise, but there's a fundamental tension between what's built and what a startup should do. You have a platform that does too much, for too many people, with too many features. The good news: this is fixable by being more narrow, not by building more.

**Grade: C+** 
- Good: Clear three-product structure, manual API access process
- Bad: Still too many pages, unclear value prop for each user type, missing the "one cooperative" focus

---

## The Five PG Tests

### Test 1: Make Something People Want ❌

**The Problem:**
You're trying to serve four different user types (farmers, traders, cooperatives, enterprises) with three different products. But have you actually talked to any of them?

**Evidence of Failure:**
1. **The farmer view** shows "2,400 kg Grade AA from Nyeri" - This is a mock data point. Do you actually have a farmer with 2,400 kg of coffee? If not, why show this?
2. **The risk pools** show "Nyeri Coffee Cooperative - 142 members." Do you have 142 members? If not, this is a lie that destroys trust.
3. **The enterprise form** asks for "expected API volume" but you have ZERO customers. How do you know what volumes they'll need?

**What PG Would Say:**
> "You can't know what people want until you talk to them. I spent 6 months making gallery websites nobody wanted before Viaweb. The hedge is not 'build everything and see what sticks.' The hedge is 'find one person who desperately needs this and build exactly what they need.'"

**Fix:**
- Remove ALL mock data from the dashboard
- Replace with: "Connect your cooperative" or "Register your farm"
- If you don't have a farmer partner yet, say so: "We're piloting with Nyeri AA Cooperative. Interested in joining?"

---

### Test 2: Do Things That Don't Scale ❌

**The Problem:**
You've automated too much too early. The app is trying to be a finished product when it should be a manual process with software assistance.

**Evidence of Failure:**
1. **Onboarding Flow:** A multi-step role selector with localStorage persistence. For what? You should be manually onboarding your first 10 users via WhatsApp.
2. **Price Dashboard:** Auto-refreshing every 60 seconds with fallback data. But your real value isn't the dashboard - it's the phone call you make to the farmer when prices drop.
3. **Risk Pools:** Automated pooling with "0.5 ETH" stakes. But you don't have a cooperative treasurer who understands Ethereum. You need to collect cash in a box first.

**What PG Would Say:**
> "The way to start is not with a platform. It's with a spreadsheet and a phone. Airbnb's founders went door to door in New York taking photos of apartments. That's not 'inefficient' - that's how you learn what people actually want."

**Fix:**
- **Farmers:** Remove the "Protect My Crops" button. Replace with: "Call us: +254-XXX-XXXX. We'll explain how hedging works in 10 minutes."
- **Traders:** Remove the price grid. Replace with: "Daily price report via WhatsApp. Join 12 traders who get our 7am briefing."
- **Enterprise:** Keep the request form (this is good!) but add: "Average response time: 24 hours" → "We personally review every request. You'll hear from [Founder Name] directly."

---

### Test 3: Start Narrow ⚠️

**The Problem:**
You're not narrow enough. You're showing 9 commodities across 2 regions. But you said you want to focus on Kenya Coffee. So why am I seeing cotton, sunflower, and copper?

**Evidence of Ambiguity:**
1. **Homepage:** Shows "Check Prices" with a ticker that includes Ghana Cocoa, Gold, and Coffee. If your focus is Kenya Coffee, why mention cocoa and gold?
2. **Prices Page:** Shows 9 commodities with LATAM data. You said "start with Nyeri AA" - so why does this page exist?
3. **Dashboard:** Shows "Active Markets: 4" (Coffee, Cocoa, Gold, Copper). Again, the focus should be ONE crop.

**What PG Would Say:**
> "Start with something so narrow it seems trivial. Facebook started at Harvard. Not universities. Harvard. If you can't dominate a tiny market, you'll never dominate a big one. 'Kenya Coffee' is not narrow enough. 'Nyeri AA Coffee' is. 'Nyeri AA Coffee from farmers who sell through the Gatura Farmers Cooperative' is better."

**Fix:**
- **Homepage:** Remove the ticker. Replace with: "Kenya AA Coffee: $3.63/lb (Updated 2 min ago)"
- **Remove:** Cocoa, Gold, Copper, Tea, Cotton, Avocado, Macadamia, Sunflower from the MVP
- **Focus:** One commodity (Coffee), one country (Kenya), one grade (AA), one source (Nyeri region)
- **Add:** "We're tracking 847 farmers in Nyeri. Join them."

---

### Test 4: Simple Surfaces ❌

**The Problem:**
The UX is still too complex. There are tabs, stats cards, recent activity feeds, quick actions. A farmer in rural Kenya doesn't need a dashboard. They need to know one thing: "What is my coffee worth today?"

**Evidence of Complexity:**
1. **Dashboard:** Has 4 stats cards, 3 tabs (Overview/Prices/Protection), recent activity feed, quick action cards. That's 7 different things to look at.
2. **Price Detail Page:** Has current price, 30-day chart, region selector, data sources, market info. A farmer needs: the price, the trend, and who to call.
3. **Onboarding:** 4 role options with icons, descriptions, and selection states. Should be: "Are you a farmer? Yes/No"

**What PG Would Say:**
> "The most important thing is to make something people want. The second most important is to make it simple enough that they'll actually use it. If your app requires a tutorial, you've failed."

**Fix - The "One Screen" Test:**

**For Farmers:**
```
[Big Number: $3.63/lb]
[Subtitle: Kenya AA Coffee - Nyeri Region]
[Trend: ↑ +2.1% this week]
[Button: "Protect this price" - calls you]
[Link: "View history"]
```
That's it. One screen.

**For Traders:**
```
[Big Number: $3.63/lb]
[Subtitle: Kenya AA Coffee - Nyeri Region]
[Source: ECX Nairobi Exchange]
[Updated: 2 min ago]
[Button: "Request API Access"]
[Link: "See all commodities" - but hide this initially]
```

**For Cooperatives:**
```
[Your Members: 142]
[Pool Status: Active]
[Total Coverage: $50,000]
[Button: "Add member" - manual form that texts you]
```

---

### Test 5: Keep Identity Small ⚠️

**The Problem:**
You're calling it "Afrifutures" and positioning as a "platform." But you're not a platform yet. You're a service. The more you call yourself a platform, the more you'll overbuild.

**Evidence of Identity Bloat:**
1. **App Name:** "Afrifutures" sounds like a big fintech company. If you have 0 customers, you're not a company yet. You're an experiment.
2. **Product Structure:** Three distinct "products" (Prices, Protection, API). But you should have ONE product: "We help Nyeri coffee farmers get fair prices."
3. **Tech Stack:** Next.js, Polygon, Chainlink, AI Agents. This is identity through technology. PG would say: "Use whatever tech lets you serve your first customer fastest. If that's a Google Sheet and WhatsApp, use that."

**What PG Would Say:**
> "Don't let your identity get tied up in being a 'blockchain company' or an 'AI company.' You're solving a problem. The tech is just the tool. If you define yourself by the tool, you can't change tools when you need to."

**Fix:**
- **Call it:** "Nyeri Coffee Price Tracker" or even just your name: "[Your Name]'s Coffee Prices"
- **Describe it:** "I send daily coffee prices to 12 traders and help 3 cooperatives hedge against price drops."
- **Remove:** All references to "platform," "DeFi," "AI agents" from the homepage
- **Add:** "Built by [Your Name] to solve a real problem I saw in Kenya."

---

## Product-by-Product Pressure Test

### Product 1: Live Prices (Current Grade: C+)

**What Works:**
- Real-time data from actual exchanges (ECX, KAMIS)
- Shows data sources transparently
- Mobile-responsive

**What Doesn't Work:**
- Shows 9 commodities when focus should be 1
- LATAM data is a distraction
- Price chart is nice but unnecessary for MVP
- No clear "who is this for?" signal

**PG Fix:**
```
[PAGE: /coffee/kenya]

Kenya AA Coffee
$3.63 / lb
↑ +2.1% this week

Source: ECX Nairobi
Updated: 2 min ago
Grade: AA (top 10%)

[Button: Get price alerts via WhatsApp]
[Link: How is this price calculated?]
```

**Remove:**
- Region selector
- All other commodities
- 30-day chart (add back later)
- "View All Prices" link

---

### Product 2: Protect My Crops (Current Grade: D+)

**What Works:**
- The concept is right (farmers need price protection)
- Shows cooperative pooling

**What Doesn't Work:**
- Risk pools are fake/mock data
- "0.5 ETH" is meaningless to a Kenyan farmer
- No explanation of what happens when prices drop
- No actual cooperative partnership shown

**PG Fix:**
Make this a CONSULTATION, not a product:
```
[PAGE: /protect]

Worried about coffee prices dropping?

We help Nyeri coffee farmers lock in prices.

Here's how it works:
1. You tell us your expected harvest (e.g., 2,000 kg)
2. We find a buyer who'll pay $3.20/lb minimum
3. If market drops below $3.20, we cover the difference
4. If market goes above, you keep the profit

Cost: 2% of your harvest value

[Button: Schedule a call (15 min)]
[Subtitle: Talk to [Founder Name] - no commitment]
```

**Remove:**
- All "pool" language
- ETH references
- Smart contract explanations
- Automated staking

---

### Product 3: Market Data API (Current Grade: B)

**What Works:**
- Request Access form is GOOD (manual review)
- Shows pricing tiers clearly
- Explains what happens next

**What Doesn't Work:**
- Still positioned as self-serve ("Try Demo" button)
- Documentation is too technical
- No proof that anyone actually uses this

**PG Fix:**
```
[PAGE: /data]

Daily Coffee Price Data
For Commodity Traders & Banks

What you get:
✓ Real-time Kenya AA coffee prices
✓ Direct from ECX exchange
✓ Updated every 60 seconds
✓ Historical data back to 2020

Who uses this:
"We use Afrifutures data to price our agricultural loans."
- [Bank Name], Nairobi

Pricing:
Basic: $150/mo (50K requests)
Premium: $500/mo (unlimited + analytics)

[Button: Request Access]
[Subtitle: We personally review every request]
```

**Keep:**
- The manual request form (this is your moat)
- The 24-hour response promise
- The 15-minute call offer

**Add:**
- Testimonials (even if just one)
- Specific use cases ("Price agricultural loans")
- Founder contact info directly

---

## Specific Page-by-Page Critique

### Homepage (/)
**Current:** Three product cards with icons and descriptions
**Problem:** Too many choices. The user has to think "which am I?"
**PG Fix:** 
```
Kenya AA Coffee: $3.63/lb
↑ +2.1% this week

[Big Button: Check Today's Price]

For Farmers: [Link: Protect my harvest]
For Buyers: [Link: Request price data]
```

### Dashboard (/dashboard)
**Current:** Adaptive dashboard with tabs and stats
**Problem:** Still too complex. Stats are fake.
**PG Fix:** 
- If farmer: Show ONE price, ONE action
- If trader: Show ONE price, request form
- Remove ALL mock data

### Prices (/prices/[commodity])
**Current:** 9 commodities with charts and history
**Problem:** Not focused. Chart is overkill.
**PG Fix:** Remove entirely. Just show the price on the homepage.

### Enterprise (/enterprise)
**Current:** Features, pricing, data sources
**Problem:** Too much like a finished product
**PG Fix:** Remove features section. Just: "We sell coffee price data. Talk to us."

### Enterprise Keys (/enterprise/keys)
**Current:** Request form - this is GOOD
**Problem:** Asks too many questions
**PG Fix:** 
- Remove "expected volume" and "commodities" 
- Just: Name, Email, Company, What you need
- Add: "We'll call you within 24 hours"

### Onboarding (/onboarding)
**Current:** 4 role selections with icons
**Problem:** Overdesigned for something that should be a conversation
**PG Fix:** Remove the page entirely. Just ask on the homepage: "Are you a farmer?"

---

## The One-Pager Fix

If you could only change ONE thing, make it this:

**Remove everything except:**
1. A big number: Current Kenya AA coffee price
2. A trend indicator: Up/down %
3. Two buttons: 
   - "I'm a farmer" (leads to consultation booking)
   - "I'm a buyer" (leads to data request form)
4. One sentence: "Real-time prices from ECX Nairobi"

**That's it.** 

No dashboard. No tabs. No charts. No risk pools. No API docs. Just the price and two paths.

---

## Priority Order of Fixes

### Week 1 (Critical)
1. ✅ Remove all mock data from dashboard
2. ✅ Replace "Protect My Crops" with "Schedule a call" 
3. ✅ Simplify homepage to ONE commodity
4. ✅ Add founder name and direct contact to every page

### Week 2 (Important)
5. Remove LATAM data entirely
6. Remove 7 of 9 commodities (keep only Coffee)
7. Simplify dashboard to one screen per role
8. Add WhatsApp integration for price alerts

### Week 3 (Nice to have)
9. Add real testimonial from one trader
10. Add real photo of Nyeri cooperative
11. Create simple price history (7 days, not 30)
12. Remove "AI Agent" references from copy

---

## Final PG Verdict

> "You're trying to build a platform before you've served a single customer. That's backwards. Start with one farmer. Call them every day for a week. Learn what they actually care about. Then build exactly that."
>
> "The app you have is a 'platform.' What you need is a 'service.' The difference is that a service implies you're doing work for someone. A platform implies you're letting software do the work. Software doesn't care about farmers. You do. So act like it."
>
> "Your competitive advantage is not your tech stack. It's that you actually care about Kenyan coffee farmers and you're willing to do things that don't scale to help them. Lead with that."

---

## Action Items

**Today:**
- [ ] Remove 8 of 9 commodities from the app
- [ ] Change homepage to show only Kenya Coffee price
- [ ] Replace "Protect My Crops" with "Schedule a call with [Your Name]"
- [ ] Add your real phone number or WhatsApp link

**This Week:**
- [ ] Remove all mock data (pools, members, stakes)
- [ ] Simplify dashboard to one stat + one button
- [ ] Add "We're piloting with Nyeri AA Cooperative" text
- [ ] Remove "DeFi," "Blockchain," "AI" from homepage copy

**This Month:**
- [ ] Get ONE real farmer testimonial
- [ ] Get ONE real trader using your data
- [ ] Manually onboard 3 API customers
- [ ] Document what you learned from each

---

**Bottom Line:** You don't need more features. You need fewer features serving one customer type extremely well. Start with Nyeri coffee farmers who want to know what their crop is worth. Everything else is a distraction.
