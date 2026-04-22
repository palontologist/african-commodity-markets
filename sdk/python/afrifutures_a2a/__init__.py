"""
Afrifutures A2A - Agent-to-Agent Commodity Marketplace SDK

A Python SDK for AI agents to trade commodities on the Afrifutures marketplace.

Usage:
    from afrifutures_a2a import Agent, Commodity, OrderSide

    # Register agent
    agent = Agent.register(
        name="MyTradingBot",
        owner="0x1234...",
        capabilities=["HEDGE", "ARBITRAGE"]
    )

    # Post order
    order = agent.post_order(
        side=OrderSide.SELL,
        commodity=Commodity.COCOA,
        quantity=100,
        price=8500
    )

    # Execute trade
    trade = agent.execute_trade(
        buyer_agent_id="did:agent:xxx",
        seller_agent_id="did:agent:yyy",
        commodity=Commodity.COCOA,
        quantity=100,
        price=8500
    )
"""

__version__ = "0.1.0"

from .client import AfrifuturesA2A, Agent
from .models import (
    Commodity,
    OrderSide,
    OrderType,
    Order,
    Trade,
    AgentProfile,
    OrderBook,
    Negotiation,
    MarketPrice,
)
from .exceptions import (
    AfrifuturesError,
    AuthenticationError,
    OrderNotFoundError,
    AgentNotFoundError,
    TradeError,
    NetworkError,
)

__all__ = [
    # Main client
    "AfrifuturesA2A",
    "Agent",
    # Models
    "Commodity",
    "OrderSide",
    "OrderType",
    "Order",
    "Trade",
    "AgentProfile",
    "OrderBook",
    "Negotiation",
    "MarketPrice",
    # Exceptions
    "AfrifuturesError",
    "AuthenticationError",
    "OrderNotFoundError",
    "AgentNotFoundError",
    "TradeError",
    "NetworkError",
]
