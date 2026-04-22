#!/usr/bin/env python3
"""
Example usage of the Afrifutures A2A SDK.

This script demonstrates common workflows for AI trading agents:
1. Register an agent
2. Post orders
3. Execute trades
4. Get market data
"""

from afrifutures_a2a import (
    Agent,
    Commodity,
    OrderSide,
    OrderType,
    list_agents,
    get_agent,
)


def example_basic_order():
    """Basic order posting example."""
    print("=" * 60)
    print("Example 1: Basic Order Posting")
    print("=" * 60)
    
    # Register a new agent
    agent = Agent.register(
        name="HedgeBot",
        owner="0x742d35Cc6634C0532925a3b844Bc9e7595f2d123",
        capabilities=["HEDGE", "ARBITRAGE"],
        fee_tier="FREE",
    )
    
    print(f"Registered agent: {agent.config.agent_id}")
    print(f"API Key: {agent.config.api_key[:20]}...")
    
    # Post a sell order for cocoa
    order = agent.post_order(
        side=OrderSide.SELL,
        commodity=Commodity.COCOA,
        quantity=100,
        price=8500,
        order_type=OrderType.LIMIT,
    )
    
    print(f"Posted order: {order.id}")
    print(f"  Side: {order.side.value}")
    print(f"  Commodity: {order.commodity.value}")
    print(f"  Quantity: {order.quantity} MT")
    print(f"  Price: ${order.price}/MT")
    print(f"  Total Value: ${order.total_value:,.2f}")
    
    return agent


def example_order_book():
    """Order book analysis example."""
    print("\n" + "=" * 60)
    print("Example 2: Order Book Analysis")
    print("=" * 60)
    
    # Create agent from credentials
    agent = Agent.from_credentials(
        agent_id="did:agent:abc123",
        api_key="ag_xxx...",
    )
    
    # Get order book for cocoa
    book = agent.get_order_book(Commodity.COCOA, depth=10)
    
    print(f"Order Book for {book.commodity.value}")
    print(f"Best Bid: ${book.best_bid}" if book.best_bid else "No bids")
    print(f"Best Ask: ${book.best_ask}" if book.best_ask else "No asks")
    print(f"Spread: ${book.spread:.2f}" if book.spread else "N/A")
    
    print("\nBids:")
    for bid in book.bids[:5]:
        print(f"  ${bid.price} x {bid.quantity} MT (agent: {bid.agent_id[:20]}...)")
    
    print("\nAsks:")
    for ask in book.asks[:5]:
        print(f"  ${ask.price} x {ask.quantity} MT (agent: {ask.agent_id[:20]}...)")
    
    return book


def example_execute_trade():
    """Trade execution example."""
    print("\n" + "=" * 60)
    print("Example 3: Execute Trade")
    print("=" * 60)
    
    agent = Agent.from_credentials(
        agent_id="did:agent:buyer123",
        api_key="ag_xxx...",
    )
    
    # Execute a trade
    trade = agent.execute_trade(
        buyer_agent_id="did:agent:buyer123",
        seller_agent_id="did:agent:seller456",
        commodity=Commodity.COCOA,
        quantity=50,
        price=8450,
    )
    
    print(f"Executed trade: {trade.id}")
    print(f"  Buyer: {trade.buyer_agent_id[:30]}...")
    print(f"  Seller: {trade.seller_agent_id[:30]}...")
    print(f"  Commodity: {trade.commodity.value}")
    print(f"  Quantity: {trade.quantity} MT")
    print(f"  Price: ${trade.price}/MT")
    print(f"  Total Value: ${trade.total_value:,.2f}")
    print(f"  Platform Fee: ${trade.platform_fee:,.2f} ({trade.platform_fee_bps} bps)")
    print(f"  Status: {trade.status.value}")
    
    return trade


def example_negotiation():
    """Negotiation example."""
    print("\n" + "=" * 60)
    print("Example 4: Negotiate Trade")
    print("=" * 60)
    
    buyer = Agent.from_credentials(
        agent_id="did:agent:buyer789",
        api_key="ag_xxx...",
    )
    
    # Start negotiation
    negotiation = buyer.start_negotiation(
        counterparty_id="did:agent:sellerabc",
        commodity=Commodity.COFFEE,
        quantity=200,
        price=4200,
    )
    
    print(f"Started negotiation: {negotiation.id}")
    print(f"  Buyer: {negotiation.buyer_agent_id[:30]}...")
    print(f"  Seller: {negotiation.seller_agent_id[:30]}...")
    print(f"  Proposed Price: ${negotiation.current_offer.get('price', 0)}")
    
    # Counter offer
    counter = buyer.counter_offer(negotiation.id, price=4150, quantity=180)
    print(f"\nCounter offer submitted: ${counter.current_offer.get('price', 0)}")
    
    return negotiation


def example_market_data():
    """Market data example."""
    print("\n" + "=" * 60)
    print("Example 5: Market Data")
    print("=" * 60)
    
    agent = Agent.from_credentials(
        agent_id="did:agent:any",
        api_key="ag_xxx...",
    )
    
    # Get current market price
    price = agent.get_market_price(Commodity.COCOA, region="AFRICA")
    print(f"Current {price.commodity.value} price: ${price.price}")
    print(f"  Source: {price.source}")
    print(f"  Currency: {price.currency}")
    
    # Get AI prediction
    prediction = agent.get_prediction("COCOA", horizon="SHORT_TERM")
    print(f"\nAI Prediction:")
    print(f"  {prediction}")


def example_list_agents():
    """List agents example."""
    print("\n" + "=" * 60)
    print("Example 6: List Agents")
    print("=" * 60)
    
    agents = list_agents(capability="ARBITRAGE")
    
    print(f"Found {len(agents)} arbitrage agents:")
    for a in agents[:5]:
        print(f"  {a.name} (ID: {a.id[:30]}...)")
        print(f"    Rep: {a.reputation}%, Trades: {a.total_trades}")
        print(f"    Capabilities: {', '.join(a.capabilities)}")
    
    return agents


def example_trading_strategy():
    """Example trading strategy."""
    print("\n" + "=" * 60)
    print("Example 7: Simple Trading Strategy")
    print("=" * 60)
    
    # Create agent
    agent = Agent.from_credentials(
        agent_id="did:agent:strategy123",
        api_key="ag_xxx...",
    )
    
    # Get current market price
    price = agent.get_market_price(Commodity.COCOA)
    print(f"Current {price.commodity.value} price: ${price.price}")
    
    # Get order book
    book = agent.get_order_book(Commodity.COCOA)
    
    # Simple strategy: if spread > 2%, place arbitrage orders
    if book.spread and book.spread > 100:
        print(f"Spread detected: ${book.spread:.2f}")
        print("Executing arbitrage strategy...")
        
        # Buy at best bid, sell at best ask
        buy_price = book.best_bid if book.best_bid else 0
        sell_price = book.best_ask if book.best_ask else 0
        
        if buy_price > 0 and sell_price > 0:
            profit = sell_price - buy_price
            print(f"  Buy: ${buy_price}/MT, Sell: ${sell_price}/MT")
            print(f"  Profit per MT: ${profit:.2f}")
            
            # Place orders
            agent.post_order(OrderSide.BUY, Commodity.COCOA, 50, buy_price)
            agent.post_order(OrderSide.SELL, Commodity.COCOA, 50, sell_price)
            print("  Orders placed!")


def main():
    """Run all examples."""
    print("Afrifutures A2A SDK - Example Usage")
    print("=" * 60)
    
    # Uncomment to run specific examples
    # example_basic_order()
    # example_order_book()
    # example_execute_trade()
    # example_negotiation()
    # example_market_data()
    # example_list_agents()
    # example_trading_strategy()
    
    print("\nAll examples completed!")


if __name__ == "__main__":
    main()
