"""
Models and data types for the A2A marketplace.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from typing import List


class Commodity(str, Enum):
    """Supported commodities for trading."""
    COCOA = "COCOA"
    COFFEE = "COFFEE"
    COTTON = "COTTON"
    CASHEW = "CASHEW"
    GOLD = "GOLD"
    TEA = "TEA"
    AVOCADO = "AVOCADO"
    MACADAMIA = "MACADAMIA"
    RUBBER = "RUBBER"
    WHEAT = "WHEAT"
    MAIZE = "MAIZE"
    SUNFLOWER = "SUNFLOWER"
    COPPER = "COPPER"


class OrderSide(str, Enum):
    """Order side - buy or sell."""
    BUY = "BUY"
    SELL = "SELL"


class OrderType(str, Enum):
    """Order type."""
    LIMIT = "LIMIT"
    MARKET = "MARKET"
    IOC = "IOC"  # Immediate or Cancel
    FOK = "FOK"  # Fill or Kill


class OrderStatus(str, Enum):
    """Order status."""
    OPEN = "OPEN"
    PARTIAL = "PARTIAL"
    MATCHED = "MATCHED"
    EXECUTED = "EXECUTED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class TradeStatus(str, Enum):
    """Trade status."""
    PENDING = "PENDING"
    IN_ESCROW = "IN_ESCROW"
    RELEASED = "RELEASED"
    DISPUTED = "DISPUTED"
    REFUNDED = "REFUNDED"
    CANCELLED = "CANCELLED"


class NegotiationStatus(str, Enum):
    """Negotiation status."""
    PROPOSED = "PROPOSED"
    COUNTERED = "COUNTERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"
    EXECUTED = "EXECUTED"


class FeeTier(str, Enum):
    """Agent fee tier."""
    FREE = "FREE"
    BASIC = "BASIC"
    PREMIUM = "PREMIUM"
    ENTERPRISE = "ENTERPRISE"


class AgentCapability(str, Enum):
    """Agent capabilities."""
    HEDGE = "HEDGE"
    ARBITRAGE = "ARBITRAGE"
    MARKET_MAKE = "MARKET_MAKE"
    SPECULATE = "SPECULATE"
    COOPERATIVE = "COOPERATIVE"


@dataclass
class AgentProfile:
    """Agent profile information."""
    id: str
    name: str
    owner: str
    capabilities: List[str]
    fee_tier: FeeTier
    reputation: float
    total_trades: int
    total_volume: float
    status: str
    created_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: dict) -> "AgentProfile":
        return cls(
            id=data["id"],
            name=data["name"],
            owner=data["owner"],
            capabilities=data.get("capabilities", []),
            fee_tier=FeeTier(data.get("fee_tier", "FREE")),
            reputation=data.get("reputation", 50.0),
            total_trades=data.get("total_trades", 0),
            total_volume=data.get("total_volume", 0.0),
            status=data.get("status", "ACTIVE"),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None,
        )


@dataclass
class Order:
    """Trading order."""
    id: str
    agent_id: str
    side: OrderSide
    commodity: Commodity
    quantity: float
    unit: str
    price: float
    total_value: float
    order_type: OrderType
    status: OrderStatus
    created_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: dict) -> "Order":
        return cls(
            id=data["id"],
            agent_id=data["agent_id"],
            side=OrderSide(data["side"]),
            commodity=Commodity(data["commodity"]),
            quantity=data["quantity"],
            unit=data.get("unit", "MT"),
            price=data["price"],
            total_value=data["total_value"],
            order_type=OrderType(data.get("order_type", "LIMIT")),
            status=OrderStatus(data.get("status", "OPEN")),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None,
        )


@dataclass
class Trade:
    """Executed trade."""
    id: str
    buyer_agent_id: str
    seller_agent_id: str
    commodity: Commodity
    quantity: float
    unit: str
    price: float
    total_value: float
    platform_fee: float
    platform_fee_bps: int
    status: TradeStatus
    executed_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: dict) -> "Trade":
        return cls(
            id=data["id"],
            buyer_agent_id=data["buyer_agent_id"],
            seller_agent_id=data["seller_agent_id"],
            commodity=Commodity(data["commodity"]),
            quantity=data["quantity"],
            unit=data.get("unit", "MT"),
            price=data["price"],
            total_value=data["total_value"],
            platform_fee=data["platform_fee"],
            platform_fee_bps=data["platform_fee_bps"],
            status=TradeStatus(data.get("status", "PENDING")),
            executed_at=datetime.fromisoformat(data["executed_at"]) if data.get("executed_at") else None,
        )


@dataclass
class MarketPrice:
    """Current market price for a commodity."""
    commodity: Commodity
    price: float
    currency: str
    source: str
    timestamp: datetime

    @classmethod
    def from_dict(cls, data: dict) -> "MarketPrice":
        return cls(
            commodity=Commodity(data["commodity"]),
            price=data["price"],
            currency=data["currency"],
            source=data["source"],
            timestamp=datetime.fromisoformat(data["timestamp"]) if isinstance(data["timestamp"], str) else datetime.now(),
        )


@dataclass
class OrderBookLevel:
    """Single level in the order book."""
    price: float
    quantity: float
    agent_id: str


@dataclass
class OrderBook:
    """Aggregated order book for a commodity."""
    commodity: Commodity
    bids: List[OrderBookLevel] = field(default_factory=list)
    asks: List[OrderBookLevel] = field(default_factory=list)
    best_bid: Optional[float] = None
    best_ask: Optional[float] = None
    spread: Optional[float] = None

    @classmethod
    def from_dict(cls, data: dict, commodity: Commodity) -> "OrderBook":
        bids = [OrderBookLevel(**b) for b in data.get("bids", [])]
        asks = [OrderBookLevel(**a) for a in data.get("asks", [])]
        
        best_bid = data.get("best_bid")
        best_ask = data.get("best_ask")
        spread = best_ask - best_bid if best_bid and best_ask else None
        
        return cls(
            commodity=commodity,
            bids=bids,
            asks=asks,
            best_bid=best_bid,
            best_ask=best_ask,
            spread=spread,
        )


@dataclass
class Negotiation:
    """A2A negotiation state."""
    id: str
    buyer_agent_id: str
    seller_agent_id: str
    commodity: Commodity
    quantity: float
    unit: str
    status: NegotiationStatus
    current_offer: dict
    created_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: dict) -> "Negotiation":
        return cls(
            id=data["id"],
            buyer_agent_id=data["buyer_agent_id"],
            seller_agent_id=data["seller_agent_id"],
            commodity=Commodity(data["commodity"]),
            quantity=data["quantity"],
            unit=data.get("unit", "MT"),
            status=NegotiationStatus(data.get("status", "PROPOSED")),
            current_offer=data.get("current_offer", {}),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None,
        )


@dataclass
class RegistrationResult:
    """Result of agent registration."""
    id: str
    name: str
    owner: str
    fee_tier: FeeTier
    capabilities: List[str]
    api_key: str
    status: str
