// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CommodityOracle.sol";

/**
 * @title PredictionMarket
 * @notice Prediction market for commodity prices with oracle-based settlement
 * @dev Integrates with CommodityOracle for automatic resolution
 */
contract PredictionMarket is ReentrancyGuard, Ownable {
    struct Market {
        bytes32 commodity;      // Commodity identifier
        uint64 thresholdPrice;  // Target price in cents
        uint256 expiryTime;     // Market expiry timestamp
        uint256 creationTime;   // Market creation timestamp
        uint256 yesPool;        // Total YES stakes in USDC
        uint256 noPool;         // Total NO stakes in USDC
        bool resolved;          // Resolution status
        bool outcome;           // true if price >= threshold
        uint256 resolutionTime; // Resolution timestamp
        uint64 oraclePrice;     // Actual price at resolution
        address creator;        // Market creator
    }
    
    struct Position {
        uint256 yesShares;      // YES shares owned
        uint256 noShares;       // NO shares owned
        bool claimed;           // Winnings claimed flag
    }
    
    // Market storage
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    
    uint256 public marketIdCounter;
    
    IERC20 public immutable usdc;
    CommodityOracle public immutable oracle;
    
    // Events
    event MarketCreated(
        uint256 indexed marketId,
        bytes32 indexed commodity,
        uint64 thresholdPrice,
        uint256 expiryTime,
        address indexed creator
    );
    
    event SharesPurchased(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        uint64 oraclePrice,
        uint64 thresholdPrice,
        uint256 timestamp
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 payout
    );
    
    constructor(address _usdc, address _oracle) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_oracle != address(0), "Invalid oracle address");
        usdc = IERC20(_usdc);
        oracle = CommodityOracle(_oracle);
    }
    
    /**
     * @notice Create a new prediction market
     * @param commodity Commodity identifier (e.g., keccak256("COFFEE"))
     * @param thresholdPrice Target price in cents
     * @param expiryTime Market expiry timestamp
     * @return marketId New market ID
     */
    function createMarket(
        bytes32 commodity,
        uint64 thresholdPrice,
        uint256 expiryTime
    ) external returns (uint256) {
        require(expiryTime > block.timestamp, "Invalid expiry time");
        require(thresholdPrice > 0, "Invalid threshold price");
        
        uint256 marketId = marketIdCounter++;
        
        Market storage market = markets[marketId];
        market.commodity = commodity;
        market.thresholdPrice = thresholdPrice;
        market.expiryTime = expiryTime;
        market.creationTime = block.timestamp;
        market.creator = msg.sender;
        
        emit MarketCreated(marketId, commodity, thresholdPrice, expiryTime, msg.sender);
        
        return marketId;
    }
    
    /**
     * @notice Buy YES or NO shares in a market
     * @param marketId Market ID
     * @param amount Amount of USDC to stake
     * @param isYes True for YES shares, false for NO shares
     */
    function buyShares(
        uint256 marketId,
        uint256 amount,
        bool isYes
    ) external nonReentrant {
        Market storage market = markets[marketId];
        
        require(!market.resolved, "Market resolved");
        require(block.timestamp < market.expiryTime, "Market expired");
        require(amount > 0, "Amount must be positive");
        require(market.creationTime > 0, "Market does not exist");
        
        // Transfer USDC from user
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Update position
        Position storage pos = positions[marketId][msg.sender];
        
        if (isYes) {
            pos.yesShares += amount;
            market.yesPool += amount;
        } else {
            pos.noShares += amount;
            market.noPool += amount;
        }
        
        emit SharesPurchased(marketId, msg.sender, isYes, amount);
    }
    
    /**
     * @notice Resolve market using oracle price
     * @param marketId Market ID to resolve
     */
    function resolveMarket(uint256 marketId) external {
        Market storage market = markets[marketId];
        
        require(market.creationTime > 0, "Market does not exist");
        require(!market.resolved, "Already resolved");
        require(block.timestamp >= market.expiryTime, "Market not expired");
        
        // Get oracle price
        (uint64 oraclePrice, , ) = oracle.getPrice(market.commodity);
        
        // Determine outcome: did price reach or exceed threshold?
        bool outcome = oraclePrice >= market.thresholdPrice;
        
        // Resolve market
        market.resolved = true;
        market.outcome = outcome;
        market.resolutionTime = block.timestamp;
        market.oraclePrice = oraclePrice;
        
        emit MarketResolved(
            marketId,
            outcome,
            oraclePrice,
            market.thresholdPrice,
            block.timestamp
        );
    }
    
    /**
     * @notice Claim winnings after market resolution
     * @param marketId Market ID
     */
    function claimWinnings(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        Position storage pos = positions[marketId][msg.sender];
        
        require(market.resolved, "Market not resolved");
        require(!pos.claimed, "Already claimed");
        
        uint256 totalPool = market.yesPool + market.noPool;
        uint256 winningPool = market.outcome ? market.yesPool : market.noPool;
        uint256 userShares = market.outcome ? pos.yesShares : pos.noShares;
        
        require(userShares > 0, "No winning shares");
        require(winningPool > 0, "Invalid pool");
        
        // Calculate payout: (userShares / winningPool) * totalPool
        uint256 payout = (userShares * totalPool) / winningPool;
        require(payout > 0, "Invalid payout");
        
        // Mark as claimed
        pos.claimed = true;
        
        // Transfer winnings
        require(usdc.transfer(msg.sender, payout), "Transfer failed");
        
        emit WinningsClaimed(marketId, msg.sender, payout);
    }
    
    /**
     * @notice Get market details
     * @param marketId Market ID
     * @return Market struct
     */
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }
    
    /**
     * @notice Get user position in a market
     * @param marketId Market ID
     * @param user User address
     * @return Position struct
     */
    function getPosition(uint256 marketId, address user) 
        external 
        view 
        returns (Position memory) 
    {
        return positions[marketId][user];
    }
    
    /**
     * @notice Calculate current odds for a market
     * @param marketId Market ID
     * @return yesOdds Probability of YES outcome (0-100)
     * @return noOdds Probability of NO outcome (0-100)
     */
    function getOdds(uint256 marketId) 
        external 
        view 
        returns (uint256 yesOdds, uint256 noOdds) 
    {
        Market storage market = markets[marketId];
        uint256 totalPool = market.yesPool + market.noPool;
        
        if (totalPool == 0) {
            return (50, 50);
        }
        
        yesOdds = (market.yesPool * 100) / totalPool;
        noOdds = 100 - yesOdds;
        
        return (yesOdds, noOdds);
    }
}
