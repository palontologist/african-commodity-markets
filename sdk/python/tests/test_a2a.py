"""
Tests for the Afrifutures A2A SDK.
"""

import pytest
from unittest.mock import Mock, patch
from afrifutures_a2a import (
    Agent,
    AgentConfig,
    Commodity,
    OrderSide,
    OrderType,
    Order,
    Trade,
    AgentProfile,
    MarketPrice,
    OrderBook,
    Negotiation,
)
from afrifutures_a2a.exceptions import (
    AfrifuturesError,
    AuthenticationError,
    AgentNotFoundError,
    OrderNotFoundError,
    TradeError,
)


@pytest.fixture
def mock_response():
    """Create a mock response object."""
    def _mock_response(data, status_code=200):
        response = Mock()
        response.json.return_value = data
        response.status_code = status_code
        response.raise_for_status = Mock()
        return response
    return _mock_response


@pytest.fixture
def agent_config():
    """Create a test agent config."""
    return AgentConfig(
        base_url="http://localhost:3000",
        agent_id="did:agent:test123",
        api_key="ag_test123",
    )


class TestAgentRegistration:
    """Tests for agent registration."""
    
    @patch('requests.Session')
    def test_register_success(self, mock_session, mock_response):
        """Test successful agent registration."""
        mock_session.return_value.post.return_value = mock_response({
            "success": True,
            "agent": {
                "id": "did:agent:new123",
                "name": "TestBot",
                "owner": "0x1234567890123456789012345678901234567890",
                "capabilities": ["HEDGE"],
                "feeTier": "FREE",
                "status": "ACTIVE"
            },
            "apiKey": "ag_newkey123"
        })
        
        agent = Agent.register(
            name="TestBot",
            owner="0x1234567890123456789012345678901234567890",
            capabilities=["HEDGE"]
        )
        
        assert agent.config.agent_id == "did:agent:new123"
        assert agent.config.api_key == "ag_newkey123"


class TestOrderManagement:
    """Tests for order management."""
    
    @patch('requests.Session')
    def test_post_order_success(self, mock_session, mock_response, agent_config):
        """Test posting an order."""
        mock_session.return_value.post.return_value = mock_response({
            "success": True,
            "order": {
                "id": "ord:test123",
                "agent_id": "did:agent:test123",
                "side": "SELL",
                "commodity": "COCOA",
                "quantity": 100,
                "unit": "MT",
                "price": 8500,
                "total_value": 850000,
                "order_type": "LIMIT",
                "status": "OPEN"
            }
        })
        
        agent = Agent(agent_config)
        order = agent.post_order(
            side=OrderSide.SELL,
            commodity=Commodity.COCOA,
            quantity=100,
            price=8500
        )
        
        assert order.id == "ord:test123"
        assert order.side == OrderSide.SELL
        assert order.commodity == Commodity.COCOA
        assert order.quantity == 100
        assert order.price == 8500
        assert order.total_value == 850000
        assert order.status.value == "OPEN"
    
    @patch('requests.Session')
    def test_list_orders(self, mock_session, mock_response, agent_config):
        """Test listing orders."""
        mock_session.return_value.get.return_value = mock_response({
            "orders": [
                {
                    "id": "ord:test1",
                    "agent_id": "did:agent:test123",
                    "side": "BUY",
                    "commodity": "COFFEE",
                    "quantity": 50,
                    "unit": "MT",
                    "price": 4200,
                    "total_value": 210000,
                    "order_type": "LIMIT",
                    "status": "OPEN"
                },
                {
                    "id": "ord:test2",
                    "agent_id": "did:agent:test456",
                    "side": "SELL",
                    "commodity": "COFFEE",
                    "quantity": 75,
                    "unit": "MT",
                    "price": 4300,
                    "total_value": 322500,
                    "order_type": "LIMIT",
                    "status": "OPEN"
                }
            ],
            "count": 2
        })
        
        agent = Agent(agent_config)
        orders = agent.list_orders(commodity=Commodity.COFFEE)
        
        assert len(orders) == 2
        assert orders[0].commodity == Commodity.COFFEE
        assert orders[1].commodity == Commodity.COFFEE


class TestTrading:
    """Tests for trade execution."""
    
    @patch('requests.Session')
    def test_execute_trade_success(self, mock_session, mock_response, agent_config):
        """Test executing a trade."""
        mock_session.return_value.post.return_value = mock_response({
            "success": True,
            "trade": {
                "id": "trd:test123",
                "buyer_agent_id": "did:agent:buyer123",
                "seller_agent_id": "did:agent:seller456",
                "commodity": "COCOA",
                "quantity": 50,
                "unit": "MT",
                "price": 8450,
                "total_value": 422500,
                "platform_fee": 2112.50,
                "platform_fee_bps": 50,
                "status": "PENDING"
            }
        })
        
        agent = Agent(agent_config)
        trade = agent.execute_trade(
            buyer_agent_id="did:agent:buyer123",
            seller_agent_id="did:agent:seller456",
            commodity=Commodity.COCOA,
            quantity=50,
            price=8450
        )
        
        assert trade.id == "trd:test123"
        assert trade.buyer_agent_id == "did:agent:buyer123"
        assert trade.seller_agent_id == "did:agent:seller456"
        assert trade.quantity == 50
        assert trade.total_value == 422500
        assert trade.platform_fee == 2112.50
        assert trade.status.value == "PENDING"
    
    @patch('requests.Session')
    def test_execute_trade_failure(self, mock_session, mock_response, agent_config):
        """Test trade execution failure."""
        mock_session.return_value.post.return_value = mock_response({
            "success": False,
            "error": "Insufficient funds"
        })
        
        agent = Agent(agent_config)
        
        with pytest.raises(TradeError):
            agent.execute_trade(
                buyer_agent_id="did:agent:buyer123",
                seller_agent_id="did:agent:seller456",
                commodity=Commodity.COCOA,
                quantity=50,
                price=8450
            )


class TestOrderBook:
    """Tests for order book functionality."""
    
    @patch('requests.Session')
    def test_get_order_book(self, mock_session, mock_response, agent_config):
        """Test getting order book."""
        # Mock for bids
        mock_session.return_value.get.return_value = mock_response({
            "orders": [
                {
                    "id": "ord:bid1",
                    "agent_id": "did:agent:test1",
                    "side": "BUY",
                    "commodity": "COCOA",
                    "quantity": 100,
                    "price": 8400,
                    "total_value": 840000,
                    "order_type": "LIMIT",
                    "status": "OPEN"
                }
            ]
        })
        
        agent = Agent(agent_config)
        book = agent.get_order_book(Commodity.COCOA)
        
        # In real scenario, this would have bids and asks
        assert book.commodity == Commodity.COCOA


class TestMarketData:
    """Tests for market data."""
    
    @patch('requests.Session')
    def test_get_market_price(self, mock_session, mock_response, agent_config):
        """Test getting market price."""
        mock_session.return_value.post.return_value = mock_response({
            "success": True,
            "result": {
                "commodity": "COCOA",
                "price": 8500,
                "currency": "USD",
                "source": "Alpha Vantage",
                "timestamp": "2024-01-15T10:00:00Z"
            }
        })
        
        agent = Agent(agent_config)
        price = agent.get_market_price(Commodity.COCOA)
        
        assert price.commodity == Commodity.COCOA
        assert price.price == 8500
        assert price.currency == "USD"
        assert price.source == "Alpha Vantage"


class TestModels:
    """Tests for data models."""
    
    def test_order_from_dict(self):
        """Test Order model creation from dict."""
        data = {
            "id": "ord:test123",
            "agent_id": "did:agent:test",
            "side": "SELL",
            "commodity": "GOLD",
            "quantity": 10,
            "unit": "oz",
            "price": 2340,
            "total_value": 23400,
            "order_type": "LIMIT",
            "status": "OPEN",
            "created_at": "2024-01-15T10:00:00"
        }
        
        order = Order.from_dict(data)
        
        assert order.id == "ord:test123"
        assert order.side == OrderSide.SELL
        assert order.commodity == Commodity.GOLD
        assert order.quantity == 10
        assert order.unit == "oz"
    
    def test_trade_from_dict(self):
        """Test Trade model creation from dict."""
        data = {
            "id": "trd:test123",
            "buyer_agent_id": "did:agent:buyer",
            "seller_agent_id": "did:agent:seller",
            "commodity": "COCOA",
            "quantity": 100,
            "unit": "MT",
            "price": 8500,
            "total_value": 850000,
            "platform_fee": 4250,
            "platform_fee_bps": 50,
            "status": "PENDING",
            "executed_at": "2024-01-15T10:00:00"
        }
        
        trade = Trade.from_dict(data)
        
        assert trade.id == "trd:test123"
        assert trade.buyer_agent_id == "did:agent:buyer"
        assert trade.total_value == 850000
        assert trade.platform_fee == 4250
    
    def test_agent_profile_from_dict(self):
        """Test AgentProfile model creation from dict."""
        data = {
            "id": "did:agent:test",
            "name": "TestBot",
            "owner": "0x1234567890123456789012345678901234567890",
            "capabilities": ["HEDGE", "ARBITRAGE"],
            "fee_tier": "PREMIUM",
            "reputation": 92.5,
            "total_trades": 156,
            "total_volume": 1500000,
            "status": "ACTIVE"
        }
        
        profile = AgentProfile.from_dict(data)
        
        assert profile.id == "did:agent:test"
        assert profile.name == "TestBot"
        assert "HEDGE" in profile.capabilities
        assert profile.reputation == 92.5
        assert profile.total_trades == 156


class TestEnums:
    """Tests for enum values."""
    
    def test_commodity_values(self):
        """Test Commodity enum values."""
        assert Commodity.COCOA.value == "COCOA"
        assert Commodity.COFFEE.value == "COFFEE"
        assert Commodity.GOLD.value == "GOLD"
    
    def test_order_side_values(self):
        """Test OrderSide enum values."""
        assert OrderSide.BUY.value == "BUY"
        assert OrderSide.SELL.value == "SELL"
    
    def test_order_type_values(self):
        """Test OrderType enum values."""
        assert OrderType.LIMIT.value == "LIMIT"
        assert OrderType.MARKET.value == "MARKET"
        assert OrderType.IOC.value == "IOC"
        assert OrderType.FOK.value == "FOK"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
