// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PredictionMarketFactory
 * @notice Factory for creating and managing commodity prediction markets
 * @dev Streamlined prediction market system for commodity price predictions
 */
contract PredictionMarketFactory is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct Market {
        uint256 id;
        string commodity;
        uint256 thresholdPrice;     // Price target in cents
        uint256 expiryTime;
        uint256 yesPool;            // Total YES stakes
        uint256 noPool;             // Total NO stakes
        bool resolved;               // Resolution status
        bool outcome;               // true = YES won, false = NO won
        uint256 resolutionPrice;     // Final commodity price
        uint256 createdAt;
        bool active;
    }
    
    struct Position {
        uint256 marketId;
        address user;
        bool isYes;                // true = YES position, false = NO position
        uint256 amount;             // Amount staked
        bool claimed;               // Whether winnings have been claimed
        uint256 createdAt;
    }
    
    // ============ State Variables ============
    
    IERC20 public usdc;
    address public oracle;
    uint256 public marketCounter;
    uint256 public platformFeePercent = 200; // 2%
    uint256 public constant PERCENTAGE_BASE = 10000;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position[])) public userPositions;
    mapping(address => uint256[]) public userMarkets;
    mapping(uint256 => mapping(address => uint256)) public totalUserStakes;
    
    // ============ Events ============
    
    event MarketCreated(
        uint256 indexed marketId,
        string commodity,
        uint256 thresholdPrice,
        uint256 expiryTime,
        address indexed creator
    );
    
    event StakePlaced(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount,
        uint256 yesPool,
        uint256 noPool
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        string commodity,
        uint256 finalPrice,
        bool outcome,
        uint256 timestamp
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier validMarket(uint256 marketId) {
        require(markets[marketId].id == marketId, "Market does not exist");
        _;
    }
    
    modifier activeMarket(uint256 marketId) {
        require(markets[marketId].active, "Market is not active");
        _;
    }
    
    modifier beforeExpiry(uint256 marketId) {
        require(block.timestamp < markets[marketId].expiryTime, "Market has expired");
        _;
    }
    
    modifier afterExpiry(uint256 marketId) {
        require(block.timestamp >= markets[marketId].expiryTime, "Market has not expired yet");
        _;
    }
    
    modifier notResolved(uint256 marketId) {
        require(!markets[marketId].resolved, "Market already resolved");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _usdc, address _oracle) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        oracle = _oracle;
        marketCounter = 0;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Create a new prediction market
     * @param commodity The commodity to predict (e.g., "COPPER")
     * @param thresholdPrice The price target in cents
     * @param durationMinutes Market duration in minutes
     */
    function createMarket(
        string memory commodity,
        uint256 thresholdPrice,
        uint256 durationMinutes
    ) external nonReentrant returns (uint256 marketId) {
        require(bytes(commodity).length > 0, "Commodity cannot be empty");
        require(thresholdPrice > 0, "Threshold price must be positive");
        require(durationMinutes >= 60, "Duration must be at least 1 hour");
        require(durationMinutes <= 43200, "Duration must not exceed 30 days");
        
        marketId = ++marketCounter;
        uint256 expiryTime = block.timestamp + (durationMinutes * 60);
        
        markets[marketId] = Market({
            id: marketId,
            commodity: commodity,
            thresholdPrice: thresholdPrice,
            expiryTime: expiryTime,
            yesPool: 0,
            noPool: 0,
            resolved: false,
            outcome: false,
            resolutionPrice: 0,
            createdAt: block.timestamp,
            active: true
        });
        
        emit MarketCreated(marketId, commodity, thresholdPrice, expiryTime, msg.sender);
        return marketId;
    }
    
    /**
     * @notice Stake USDC on a prediction market
     * @param marketId The market ID
     * @param isYes true for YES position, false for NO position
     * @param amount Amount of USDC to stake (in wei)
     */
    function stake(uint256 marketId, bool isYes, uint256 amount) 
        external 
        nonReentrant 
        validMarket(marketId)
        activeMarket(marketId)
        beforeExpiry(marketId) 
    {
        require(amount > 0, "Amount must be positive");
        
        // Transfer USDC from user
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        
        // Update pools
        Market storage market = markets[marketId];
        
        uint256 platformFee = (amount * platformFeePercent) / PERCENTAGE_BASE;
        uint256 stakingAmount = amount - platformFee;
        
        if (isYes) {
            market.yesPool += stakingAmount;
        } else {
            market.noPool += stakingAmount;
        }
        
        // Record user position
        Position memory position = Position({
            marketId: marketId,
            user: msg.sender,
            isYes: isYes,
            amount: stakingAmount,
            claimed: false,
            createdAt: block.timestamp
        });
        
        userPositions[marketId][msg.sender].push(position);
        userMarkets[msg.sender].push(marketId);
        totalUserStakes[marketId][msg.sender] += stakingAmount;
        
        emit StakePlaced(marketId, msg.sender, isYes, stakingAmount, market.yesPool, market.noPool);
    }
    
    /**
     * @notice Resolve a market with the final commodity price
     * @param marketId The market ID to resolve
     * @param finalPrice The final commodity price in cents
     */
    function resolveMarket(uint256 marketId, uint256 finalPrice) 
        external 
        nonReentrant 
        validMarket(marketId)
        notResolved(marketId)
        afterExpiry(marketId)
    {
        Market storage market = markets[marketId];
        
        // Determine outcome: YES wins if final price >= threshold
        bool outcome = finalPrice >= market.thresholdPrice;
        
        market.resolved = true;
        market.outcome = outcome;
        market.resolutionPrice = finalPrice;
        market.active = false;
        
        emit MarketResolved(marketId, market.commodity, finalPrice, outcome, block.timestamp);
    }
    
    /**
     * @notice Claim winnings from a resolved market
     * @param marketId The market ID
     * @param positionIndex The index of the position to claim
     */
    function claimWinnings(uint256 marketId, uint256 positionIndex) 
        external 
        nonReentrant 
        validMarket(marketId)
    {
        require(markets[marketId].resolved, "Market not resolved");
        
        Position storage position = userPositions[marketId][msg.sender][positionIndex];
        require(!position.claimed, "Winnings already claimed");
        require(position.user == msg.sender, "Not your position");
        require(position.marketId == marketId, "Invalid position");
        
        Market memory market = markets[marketId];
        uint256 totalPool = market.yesPool + market.noPool;
        
        uint256 payout = 0;
        if (position.isYes) {
            // YES position
            if (market.outcome) {
                // YES won
                payout = (position.amount * totalPool) / market.yesPool;
            }
        } else {
            // NO position
            if (!market.outcome) {
                // NO won
                payout = (position.amount * totalPool) / market.noPool;
            }
        }
        
        position.claimed = true;
        
        if (payout > 0) {
            require(usdc.transfer(msg.sender, payout), "Transfer failed");
            emit WinningsClaimed(marketId, msg.sender, payout, block.timestamp);
        }
    }
    
    /**
     * @notice Batch claim winnings for a user
     * @param marketIds Array of market IDs to claim from
     */
    function batchClaimWinnings(uint256[] memory marketIds) external nonReentrant {
        for (uint256 i = 0; i < marketIds.length; i++) {
            uint256 marketId = marketIds[i];
            
            if (!markets[marketId].resolved) continue;
            
            Position[] storage userPositions_ = userPositions[marketId][msg.sender];
            
            for (uint256 j = 0; j < userPositions_.length; j++) {
                if (!userPositions_[j].claimed && userPositions_[j].marketId == marketId) {
                    try this.claimWinnings(marketId, j) {
                        // Continue to next position
                    } catch {
                        // Log error and continue
                        continue;
                    }
                    break;
                }
            }
        }
    }
    
    /**
     * @notice Deactivate a market (owner only)
     * @param marketId The market ID to deactivate
     */
    function deactivateMarket(uint256 marketId) external onlyOwner {
        require(markets[marketId].id == marketId, "Market does not exist");
        markets[marketId].active = false;
    }
    
    /**
     * @notice Update platform fee (owner only)
     * @param newFeePercent New platform fee in basis points (100 = 1%)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = newFeePercent;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get market information
     * @param marketId The market ID
     */
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }
    
    /**
     * @notice Get all active markets
     */
    function getActiveMarkets() external view returns (uint256[] memory) {
        uint256[] memory activeMarkets_ = new uint256[](marketCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= marketCounter; i++) {
            if (markets[i].active && !markets[i].resolved) {
                activeMarkets_[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeMarkets_[i];
        }
        
        return result;
    }
    
    /**
     * @notice Get user positions in a market
     * @param marketId The market ID
     * @param user The user address
     */
    function getUserPositions(uint256 marketId, address user) external view returns (Position[] memory) {
        return userPositions[marketId][user];
    }
    
    /**
     * @notice Get all markets for a user
     * @param user The user address
     */
    function getUserMarkets(address user) external view returns (uint256[] memory) {
        return userMarkets[user];
    }
    
    /**
     * @notice Get user's total stake in a market
     * @param marketId The market ID
     * @param user The user address
     */
    function getUserStake(uint256 marketId, address user) external view returns (uint256) {
        return totalUserStakes[marketId][user];
    }
    
    /**
     * @notice Calculate potential payout for a position
     * @param marketId The market ID
     * @param user The user address
     * @param positionIndex The position index
     */
    function calculatePayout(uint256 marketId, address user, uint256 positionIndex) 
        external 
        view 
        returns (uint256) 
    {
        Position memory position = userPositions[marketId][user][positionIndex];
        Market memory market = markets[marketId];
        
        if (position.amount == 0 || market.resolved == false) {
            return 0;
        }
        
        uint256 totalPool = market.yesPool + market.noPool;
        
        if (position.isYes) {
            if (market.outcome) {
                return (position.amount * totalPool) / market.yesPool;
            }
        } else {
            if (!market.outcome) {
                return (position.amount * totalPool) / market.noPool;
            }
        }
        
        return 0;
    }
    
    /**
     * @notice Get total number of markets
     */
    function getMarketCount() external view returns (uint256) {
        return marketCounter;
    }
    
    /**
     * @notice Get market statistics
     */
    function getMarketStats() external view returns (
        uint256 totalMarkets_,
        uint256 activeMarkets_,
        uint256 resolvedMarkets_
    ) {
        totalMarkets_ = marketCounter;
        activeMarkets_ = 0;
        resolvedMarkets_ = 0;
        
        for (uint256 i = 1; i <= marketCounter; i++) {
            if (markets[i].active && !markets[i].resolved) {
                activeMarkets_++;
            } else if (markets[i].resolved) {
                resolvedMarkets_++;
            }
        }
    }
}