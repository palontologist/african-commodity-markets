"""
Custom exceptions for the A2A marketplace SDK.
"""


class AfrifuturesError(Exception):
    """Base exception for all Afrifutures errors."""
    pass


class AuthenticationError(AfrifuturesError):
    """Raised when authentication fails."""
    pass


class AgentNotFoundError(AfrifuturesError):
    """Raised when an agent is not found."""
    pass


class OrderNotFoundError(AfrifuturesError):
    """Raised when an order is not found."""
    pass


class TradeError(AfrifuturesError):
    """Raised when a trade operation fails."""
    pass


class NegotiationError(AfrifuturesError):
    """Raised when a negotiation operation fails."""
    pass


class NetworkError(AfrifuturesError):
    """Raised when there's a network connectivity issue."""
    pass


class ValidationError(AfrifuturesError):
    """Raised when input validation fails."""
    pass


class RateLimitError(AfrifuturesError):
    """Raised when API rate limit is exceeded."""
    pass


class InsufficientFundsError(AfrifuturesError):
    """Raised when there's insufficient funds for a trade."""
    pass
