"""
Main client for the A2A Commodity Marketplace SDK.

Example usage:
    from afrifutures_a2a import Agent, Commodity, OrderSide

    # Register
    agent = Agent.register(
        name="MyBot",
        owner="0x1234...",
        capabilities=["HEDGE"]
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

import os
import json
import hashlib
import base64
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

import requests
from tenacity import retry, stop_after_attempt, wait_exponential

from .models import (
    Commodity,
    OrderSide,
    OrderType,
    Order,
    OrderBook,
    Trade,
    AgentProfile,
    MarketPrice,
    Negotiation,
    RegistrationResult,
    OrderBookLevel,
    FeeTier,
    AgentCapability,
)
from .exceptions import (
    AfrifuturesError,
    AuthenticationError,
    AgentNotFoundError,
    OrderNotFoundError,
    TradeError,
    NetworkError,
    ValidationError,
    RateLimitError,
)


@dataclass
class AgentConfig:
    """Configuration for the Agent."""
    base_url: str = "http://localhost:3000"
    api_key: Optional[str] = None
    agent_id: Optional[str] = None
    timeout: int = 30
    max_retries: int = 3


class Agent:
    """
    AI Agent for trading on the A2A Commodity Marketplace.
    
    This is the main class that agents use to interact with the marketplace.
    """
    
    _instances: Dict[str, "Agent"] = {}
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": f"AfrifuturesA2A-SDK/0.1.0"
        })
        if config.api_key:
            self.session.headers["X-API-Key"] = config.api_key
        if config.agent_id:
            self.session.headers["X-Agent-ID"] = config.agent_id
    
    @classmethod
    def register(
        cls,
        name: str,
        owner: str,
        capabilities: Optional[List[str]] = None,
        fee_tier: str = "FREE",
        base_url: str = "http://localhost:3000",
        description: Optional[str] = None,
        metadata_cid: Optional[str] = None,
    ) -> "Agent":
        """
        Register a new agent on the marketplace.
        
        Args:
            name: Agent name
            owner: Wallet address of the owner
            capabilities: List of capabilities (HEDGE, ARBITRAGE, MARKET_MAKE, etc.)
            fee_tier: Fee tier (FREE, BASIC, PREMIUM, ENTERPRISE)
            base_url: API base URL
            description: Agent description
            metadata_cid: IPFS CID for metadata
            
        Returns:
            Agent instance
            
        Example:
            agent = Agent.register(
                name="MyTradingBot",
                owner="0x1234567890123456789012345678901234567890",
                capabilities=["HEDGE", "ARBITRAGE"]
            )
        """
        if capabilities is None:
            capabilities = ["HEDGE"]
        
        config = AgentConfig(base_url=base_url)
        client = cls(config)
        
        payload = {
            "name": name,
            "owner": owner,
            "capabilities": capabilities,
            "feeTier": fee_tier,
        }
        if description:
            payload["description"] = description
        if metadata_cid:
            payload["metadataCID"] = metadata_cid
        
        response = client._request("POST", "/api/a2a/agents", payload)
        
        if not response.get("success"):
            raise AfrifuturesError(f"Registration failed: {response}")
        
        # Create agent instance with credentials
        result = response["agent"]
        api_key = response["apiKey"]
        
        config.agent_id = result["id"]
        config.api_key = api_key
        
        agent = cls(config)
        cls._instances[result["id"]] = agent
        
        return agent
    
    @classmethod
    def from_credentials(
        cls,
        agent_id: str,
        api_key: str,
        base_url: str = "http://localhost:3000",
    ) -> "Agent":
        """
        Create an Agent instance from existing credentials.
        
        Args:
            agent_id: Agent ID (did:agent:xxxx)
            api_key: API key
            base_url: API base URL
            
        Returns:
            Agent instance
        """
        # Return cached instance if exists
        if agent_id in cls._instances:
            return cls._instances[agent_id]
        
        config = AgentConfig(
            base_url=base_url,
            agent_id=agent_id,
            api_key=api_key,
        )
        agent = cls(config)
        cls._instances[agent_id] = agent
        return agent
    
    # ============ Agent Management ============
    
    def get_profile(self) -> AgentProfile:
        """Get agent profile."""
        response = self._request("GET", f"/api/a2a/agents/{self.config.agent_id}")
        
        if "error" in response:
            raise AgentNotFoundError(response["error"])
        
        return AgentProfile.from_dict(response["agent"])
    
    def update_profile(
        self,
        name: Optional[str] = None,
        description: Optional[str] = None,
        capabilities: Optional[List[str]] = None,
        metadata_cid: Optional[str] = None,
    ) -> bool:
        """Update agent profile."""
        payload = {}
        if name:
            payload["name"] = name
        if description is not None:
            payload["description"] = description
        if capabilities:
            payload["capabilities"] = capabilities
        if metadata_cid is not None:
            payload["metadataCID"] = metadata_cid
        
        response = self._request("PUT", f"/api/a2a/agents/{self.config.agent_id}", payload)
        return response.get("success", False)
    
    def heartbeat(self) -> bool:
        """Send heartbeat to maintain agent status."""
        response = self._request("POST", f"/api/a2a/agents/{self.config.agent_id}/heartbeat")
        return response.get("success", False)
    
    # ============ Order Management ============
    
    def post_order(
        self,
        side: OrderSide,
        commodity: Commodity,
        quantity: float,
        price: float,
        order_type: OrderType = OrderType.LIMIT,
        time_in_force: str = "GTC",
        visibility: str = "PUBLIC",
        expires_at: Optional[str] = None,
    ) -> Order:
        """
        Post a buy or sell order.
        
        Args:
            side: BUY or SELL
            commodity: Commodity code (COCOA, COFFEE, etc.)
            quantity: Quantity in MT
            price: Price per MT in USDC
            order_type: LIMIT, MARKET, IOC, or FOK
            time_in_force: GTC, IOC, FOK, or GTD
            visibility: PUBLIC, PRIVATE, or HIDDEN
            expires_at: ISO timestamp for expiration
            
        Returns:
            Order object
            
        Example:
            order = agent.post_order(
                side=OrderSide.SELL,
                commodity=Commodity.COCOA,
                quantity=100,
                price=8500
            )
        """
        payload = {
            "agentId": self.config.agent_id,
            "side": side.value,
            "commodity": commodity.value,
            "quantity": quantity,
            "price": price,
            "orderType": order_type.value,
            "timeInForce": time_in_force,
            "visibility": visibility,
        }
        if expires_at:
            payload["expiresAt"] = expires_at
        
        response = self._request("POST", "/api/a2a/orders", payload)
        
        if not response.get("success"):
            raise TradeError(f"Failed to post order: {response}")
        
        return Order.from_dict(response["order"])
    
    def get_order(self, order_id: str) -> Order:
        """Get order by ID."""
        orders = self.list_orders(order_id=order_id)
        if not orders:
            raise OrderNotFoundError(f"Order not found: {order_id}")
        return orders[0]
    
    def list_orders(
        self,
        commodity: Optional[Commodity] = None,
        side: Optional[OrderSide] = None,
        status: Optional[str] = None,
        limit: int = 50,
        order_id: Optional[str] = None,
    ) -> List[Order]:
        """
        List orders.
        
        Args:
            commodity: Filter by commodity
            side: Filter by side (BUY or SELL)
            status: Filter by status
            limit: Max results
            order_id: Get specific order by ID
            
        Returns:
            List of Order objects
        """
        params = []
        if commodity:
            params.append(f"commodity={commodity.value}")
        if side:
            params.append(f"side={side.value}")
        if status:
            params.append(f"status={status}")
        if limit:
            params.append(f"limit={limit}")
        
        query = "&".join(params) if params else ""
        endpoint = f"/api/a2a/orders{('?' + query) if query else ''}"
        
        response = self._request("GET", endpoint)
        
        orders = response.get("orders", [])
        if order_id:
            orders = [o for o in orders if o.get("id") == order_id or o.get("agent_id") == order_id]
        
        return [Order.from_dict(o) for o in orders]
    
    def cancel_order(self, order_id: str) -> bool:
        """Cancel an order."""
        response = self._request("DELETE", f"/api/a2a/orders/{order_id}")
        return response.get("success", False)
    
    def get_my_orders(
        self,
        commodity: Optional[Commodity] = None,
        status: Optional[str] = None,
    ) -> List[Order]:
        """Get orders posted by this agent."""
        orders = self.list_orders(commodity=commodity, status=status)
        return [o for o in orders if o.agent_id == self.config.agent_id]
    
    # ============ Order Book ============
    
    def get_order_book(
        self,
        commodity: Commodity,
        depth: int = 10,
    ) -> OrderBook:
        """
        Get aggregated order book for a commodity.
        
        Args:
            commodity: Commodity code
            depth: Number of price levels
            
        Returns:
            OrderBook object
        """
        # Get bids
        bids_response = self._request(
            "GET",
            f"/api/a2a/orders?commodity={commodity.value}&side=BUY&limit={depth}"
        )
        # Get asks
        asks_response = self._request(
            "GET",
            f"/api/a2a/orders?commodity={commodity.value}&side=SELL&limit={depth}"
        )
        
        bids = [
            OrderBookLevel(
                price=float(o["price"]),
                quantity=float(o["quantity"]),
                agent_id=o["agent_id"]
            )
            for o in bids_response.get("orders", [])
        ]
        
        asks = [
            OrderBookLevel(
                price=float(o["price"]),
                quantity=float(o["quantity"]),
                agent_id=o["agent_id"]
            )
            for o in asks_response.get("orders", [])
        ]
        
        best_bid = bids[0].price if bids else None
        best_ask = asks[0].price if asks else None
        spread = best_ask - best_bid if best_bid and best_ask else None
        
        return OrderBook(
            commodity=commodity,
            bids=bids,
            asks=asks,
            best_bid=best_bid,
            best_ask=best_ask,
            spread=spread,
        )
    
    # ============ Negotiations ============
    
    def start_negotiation(
        self,
        counterparty_id: str,
        commodity: Commodity,
        quantity: float,
        price: float,
        unit: str = "MT",
    ) -> Negotiation:
        """
        Start negotiation with another agent.
        
        Args:
            counterparty_id: Seller or buyer agent ID
            commodity: Commodity code
            quantity: Quantity in MT
            price: Proposed price per MT
            unit: Unit (default MT)
            
        Returns:
            Negotiation object
        """
        # Determine buyer/seller based on our position
        payload = {
            "buyer_agent_id": self.config.agent_id,
            "seller_agent_id": counterparty_id,
            "commodity": commodity.value,
            "quantity": quantity,
            "price": price,
            "unit": unit,
        }
        
        response = self._request("POST", "/api/a2a/negotiations", payload)
        
        if not response.get("success"):
            raise TradeError(f"Failed to start negotiation: {response}")
        
        return Negotiation.from_dict(response["negotiation"])
    
    def counter_offer(
        self,
        negotiation_id: str,
        price: float,
        quantity: Optional[float] = None,
    ) -> Negotiation:
        """Submit counter offer."""
        payload = {
            "negotiation_id": negotiation_id,
            "counter_offer": {
                "price": price,
                "quantity": quantity,
            },
            "action": "COUNTER",
        }
        
        response = self._request("PUT", f"/api/a2a/negotiations/{negotiation_id}", payload)
        return Negotiation.from_dict(response.get("negotiation", {}))
    
    def accept_negotiation(self, negotiation_id: str) -> Negotiation:
        """Accept a negotiation."""
        payload = {"action": "ACCEPT"}
        response = self._request("PUT", f"/api/a2a/negotiations/{negotiation_id}", payload)
        return Negotiation.from_dict(response.get("negotiation", {}))
    
    def reject_negotiation(self, negotiation_id: str) -> bool:
        """Reject a negotiation."""
        payload = {"action": "REJECT"}
        response = self._request("PUT", f"/api/a2a/negotiations/{negotiation_id}", payload)
        return response.get("success", False)
    
    def execute_negotiated_trade(self, negotiation_id: str) -> Trade:
        """Execute trade from accepted negotiation."""
        response = self._request("POST", f"/api/a2a/negotiations/{negotiation_id}/execute")
        
        if not response.get("success"):
            raise TradeError(f"Failed to execute trade: {response}")
        
        return Trade.from_dict(response["trade"])
    
    def get_negotiation(self, negotiation_id: str) -> Negotiation:
        """Get negotiation by ID."""
        response = self._request("GET", f"/api/a2a/negotiations/{negotiation_id}")
        return Negotiation.from_dict(response.get("negotiation", {}))
    
    def get_my_negotiations(self) -> List[Negotiation]:
        """Get all negotiations involving this agent."""
        response = self._request("GET", f"/api/a2a/negotiations?agent_id={self.config.agent_id}")
        negotiations = response.get("negotiations", [])
        return [Negotiation.from_dict(n) for n in negotiations]
    
    # ============ Trading ============
    
    def execute_trade(
        self,
        buyer_agent_id: str,
        seller_agent_id: str,
        commodity: Commodity,
        quantity: float,
        price: float,
        negotiation_id: Optional[str] = None,
        buyer_order_id: Optional[str] = None,
        seller_order_id: Optional[str] = None,
    ) -> Trade:
        """
        Execute a trade between two agents.
        
        Args:
            buyer_agent_id: Buyer agent ID
            seller_agent_id: Seller agent ID
            commodity: Commodity code
            quantity: Quantity in MT
            price: Price per MT in USDC
            negotiation_id: Optional negotiation ID
            buyer_order_id: Optional buyer order ID
            seller_order_id: Optional seller order ID
            
        Returns:
            Trade object
        """
        payload = {
            "buyerAgentId": buyer_agent_id,
            "sellerAgentId": seller_agent_id,
            "commodity": commodity.value,
            "quantity": quantity,
            "price": price,
        }
        
        if negotiation_id:
            payload["negotiationId"] = negotiation_id
        if buyer_order_id:
            payload["buyerOrderId"] = buyer_order_id
        if seller_order_id:
            payload["sellerOrderId"] = seller_order_id
        
        response = self._request("POST", "/api/a2a/trades", payload)
        
        if not response.get("success"):
            raise TradeError(f"Failed to execute trade: {response}")
        
        return Trade.from_dict(response["trade"])
    
    def get_trade(self, trade_id: str) -> Trade:
        """Get trade by ID."""
        response = self._request("GET", f"/api/a2a/trades/{trade_id}")
        
        if "error" in response:
            raise TradeError(response["error"])
        
        return Trade.from_dict(response.get("trade", {}))
    
    def get_my_trades(
        self,
        limit: int = 50,
        status: Optional[str] = None,
    ) -> List[Trade]:
        """Get trades involving this agent."""
        params = [f"agentId={self.config.agent_id}"]
        if status:
            params.append(f"status={status}")
        params.append(f"limit={limit}")
        
        query = "&".join(params)
        response = self._request("GET", f"/api/a2a/trades?{query}")
        
        trades = response.get("trades", [])
        return [Trade.from_dict(t) for t in trades]
    
    def get_trade_history(
        self,
        agent_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[Trade]:
        """Get trade history (optionally for a specific agent)."""
        target_id = agent_id or self.config.agent_id
        response = self._request(
            "GET",
            f"/api/a2a/trades?agentId={target_id}&limit={limit}"
        )
        trades = response.get("trades", [])
        return [Trade.from_dict(t) for t in trades]
    
    # ============ Market Data ============
    
    def get_market_price(
        self,
        commodity: Commodity,
        region: str = "AFRICA",
    ) -> MarketPrice:
        """
        Get current market price for a commodity.
        
        Args:
            commodity: Commodity code
            region: AFRICA or LATAM
            
        Returns:
            MarketPrice object
        """
        response = self._request(
            "GET",
            f"/api/a2a/mcp",
            {"tool": "get_market_price", "arguments": {"commodity": commodity.value, "region": region}}
        )
        
        if not response.get("success"):
            raise AfrifuturesError(f"Failed to get market price: {response}")
        
        return MarketPrice.from_dict(response["result"])
    
    def get_live_price(
        self,
        symbol: str,
        region: str = "AFRICA",
    ) -> Dict[str, Any]:
        """Get live price from the live-prices API."""
        response = self._request("GET", f"/api/live-prices?symbol={symbol}&region={region}")
        return response
    
    # ============ Predictions ============
    
    def get_prediction(
        self,
        symbol: str,
        horizon: str = "SHORT_TERM",
        region: str = "AFRICA",
    ) -> Dict[str, Any]:
        """Get AI price prediction."""
        response = self._request(
            "GET",
            f"/api/agents/commodity/predict?symbol={symbol}&horizon={horizon}&region={region}"
        )
        return response
    
    # ============ Reputation ============
    
    def get_reputation(self, agent_id: Optional[str] = None) -> Dict[str, Any]:
        """Get agent reputation score."""
        target_id = agent_id or self.config.agent_id
        response = self._request(
            "POST",
            "/api/a2a/mcp",
            {"tool": "get_reputation", "arguments": {"agent_id": target_id}}
        )
        return response.get("result", {})
    
    # ============ Private Methods ============
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make API request with retry logic."""
        url = f"{self.config.base_url}{endpoint}"
        
        try:
            if method == "GET":
                response = self.session.get(url, timeout=self.config.timeout)
            elif method == "POST":
                response = self.session.post(url, json=data, timeout=self.config.timeout)
            elif method == "PUT":
                response = self.session.put(url, json=data, timeout=self.config.timeout)
            elif method == "DELETE":
                response = self.session.delete(url, timeout=self.config.timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            # Handle rate limiting
            if response.status_code == 429:
                raise RateLimitError("API rate limit exceeded")
            
            # Handle authentication errors
            if response.status_code == 401:
                raise AuthenticationError("Invalid API key")
            
            # Handle not found
            if response.status_code == 404:
                return {"error": "Resource not found"}
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            raise NetworkError(f"Request timeout: {url}")
        except requests.exceptions.ConnectionError:
            raise NetworkError(f"Connection failed: {url}")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                raise RateLimitError("API rate limit exceeded")
            raise NetworkError(f"HTTP error: {e}")
        except requests.exceptions.JSONDecodeError:
            raise AfrifuturesError(f"Invalid JSON response from: {url}")


# ============ Convenience Functions ============

def list_agents(
    capability: Optional[str] = None,
    status: str = "ACTIVE",
    base_url: str = "http://localhost:3000",
) -> List[AgentProfile]:
    """List all registered agents."""
    config = AgentConfig(base_url=base_url)
    client = Agent(config)
    
    params = f"status={status}"
    if capability:
        params += f"&capability={capability}"
    
    response = client._request("GET", f"/api/a2a/agents?{params}")
    
    agents = response.get("agents", [])
    return [AgentProfile.from_dict(a) for a in agents]


def get_agent(
    agent_id: str,
    base_url: str = "http://localhost:3000",
) -> AgentProfile:
    """Get agent profile by ID."""
    config = AgentConfig(base_url=base_url)
    client = Agent(config)
    
    response = client._request("GET", f"/api/a2a/agents/{agent_id}")
    
    if "error" in response:
        raise AgentNotFoundError(response["error"])
    
    return AgentProfile.from_dict(response["agent"])


# ============ AfrifuturesA2A Client (Alternative Interface) ============

class AfrifuturesA2A:
    """
    Alternative client interface for the A2A marketplace.
    
    This class provides a more explicit interface for all marketplace operations.
    """
    
    def __init__(
        self,
        base_url: str = "http://localhost:3000",
        api_key: Optional[str] = None,
        agent_id: Optional[str] = None,
    ):
        self.base_url = base_url
        self.api_key = api_key
        self.agent_id = agent_id
        
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": "AfrifuturesA2A-SDK/0.1.0"
        })
        if api_key:
            self.session.headers["X-API-Key"] = api_key
        if agent_id:
            self.session.headers["X-Agent-ID"] = agent_id
    
    def _post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.post(url, json=data)
        response.raise_for_status()
        return response.json()
    
    def _get(self, endpoint: str) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()
    
    def _put(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.put(url, json=data)
        response.raise_for_status()
        return response.json()
    
    def _delete(self, endpoint: str) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.delete(url)
        response.raise_for_status()
        return response.json()
