// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AIPredictionMarket
 * @dev On-chain prediction market for AI-generated commodity price forecasts
 * @notice Users can stake on AI predictions and earn rewards when predictions are accurate
 */
contract AIPredictionMarket is ReentrancyGuard, Ownable {
    
    // ============ Structs ============
    
    struct Prediction {
        string commodity;           // e.g., "COFFEE", "COCOA"
        uint256 currentPrice;       // Current price in cents (e.g., 25000 = $250.00)
        uint256 predictedPrice;     // AI predicted price in cents
        uint256 targetDate;         // Unix timestamp when prediction resolves
        uint256 confidence;         // AI confidence (0-100)
        string model;               // AI model used (e.g., "qwen/qwen3-32b")
        bytes32 ipfsHash;           // IPFS hash of full prediction data
        uint256 createdAt;          // Creation timestamp
        bool resolved;              // Whether prediction has been resolved
        uint256 actualPrice;        // Actual price at target date (0 if not resolved)
        uint256 yesStakes;          // Total USDC staked on YES (price will reach target)
        uint256 noStakes;           // Total USDC staked on NO (price won't reach target)
        address creator;            // Address that submitted prediction
    }
    
    struct UserPosition {
        uint256 yesAmount;          // Amount staked on YES
        uint256 noAmount;           // Amount staked on NO
        bool claimed;               // Whether winnings have been claimed
    }
    
    // ============ State Variables ============
    
    IERC20 public immutable usdc;                       // USDC token contract
    uint256 public predictionIdCounter;                 // Counter for prediction IDs
    uint256 public constant PLATFORM_FEE = 200;         // 2% platform fee (200 basis points)
    uint256 public constant BASIS_POINTS = 10000;       // 100% = 10000 basis points
    uint256 public constant MIN_STAKE = 1e6;            // Minimum stake: 1 USDC (6 decimals)
    
    mapping(uint256 => Prediction) public predictions;  // predictionId => Prediction
    mapping(uint256 => mapping(address => UserPosition)) public positions; // predictionId => user => position
    
    address public oracleAddress;                       // Address authorized to resolve predictions
    uint256 public totalFeesCollected;                  // Total platform fees collected
    
    // ============ Events ============
    
    event PredictionCreated(
        uint256 indexed predictionId,
        string commodity,
        uint256 currentPrice,
        uint256 predictedPrice,
        uint256 targetDate,
        uint256 confidence,
        address indexed creator
    );
    
    event StakePlaced(
        uint256 indexed predictionId,
        address indexed user,
        bool isYes,
        uint256 amount
    );
    
    event PredictionResolved(
        uint256 indexed predictionId,
        uint256 actualPrice,
        bool predictedCorrectly,
        uint256 timestamp
    );
    
    event WinningsClaimed(
        uint256 indexed predictionId,
        address indexed user,
        uint256 amount
    );
    
    event OracleUpdated(
        address indexed oldOracle,
        address indexed newOracle
    );
    
    // ============ Errors ============
    
    error InvalidTargetDate();
    error InvalidPrediction();
    error PredictionExpired();
    error PredictionNotResolved();
    error AlreadyResolved();
    error InsufficientStake();
    error NoWinnings();
    error AlreadyClaimed();
    error Unauthorized();
    error TransferFailed();
    
    // ============ Constructor ============
    
    constructor(address _usdc, address _initialOwner) Ownable(_initialOwner) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        oracleAddress = _initialOwner; // Initially owner is oracle
    }
    
    // ============ Prediction Functions ============
    
    /**
     * @dev Create a new AI prediction
     * @param commodity Commodity symbol (e.g., "COFFEE")
     * @param currentPrice Current price in cents
     * @param predictedPrice AI predicted price in cents
     * @param targetDate Unix timestamp when prediction should resolve
     * @param confidence AI confidence score (0-100)
     * @param model AI model name
     * @param ipfsHash IPFS hash of full prediction JSON
     */
    function createPrediction(
        string memory commodity,
        uint256 currentPrice,
        uint256 predictedPrice,
        uint256 targetDate,
        uint256 confidence,
        string memory model,
        bytes32 ipfsHash
    ) external returns (uint256) {
        if (targetDate <= block.timestamp) revert InvalidTargetDate();
        if (currentPrice == 0 || predictedPrice == 0) revert InvalidPrediction();
        if (confidence > 100) revert InvalidPrediction();
        
        uint256 predictionId = predictionIdCounter++;
        
        predictions[predictionId] = Prediction({
            commodity: commodity,
            currentPrice: currentPrice,
            predictedPrice: predictedPrice,
            targetDate: targetDate,
            confidence: confidence,
            model: model,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            resolved: false,
            actualPrice: 0,
            yesStakes: 0,
            noStakes: 0,
            creator: msg.sender
        });
        
        emit PredictionCreated(
            predictionId,
            commodity,
            currentPrice,
            predictedPrice,
            targetDate,
            confidence,
            msg.sender
        );
        
        return predictionId;
    }
    
    /**
     * @dev Stake USDC on a prediction outcome
     * @param predictionId ID of the prediction
     * @param isYes True to stake on YES (price will reach target), False for NO
     * @param amount Amount of USDC to stake (in USDC decimals, e.g., 1000000 = 1 USDC)
     */
    function stake(
        uint256 predictionId,
        bool isYes,
        uint256 amount
    ) external nonReentrant {
        Prediction storage prediction = predictions[predictionId];
        
        if (prediction.createdAt == 0) revert InvalidPrediction();
        if (block.timestamp >= prediction.targetDate) revert PredictionExpired();
        if (prediction.resolved) revert AlreadyResolved();
        if (amount < MIN_STAKE) revert InsufficientStake();
        
        // Transfer USDC from user
        if (!usdc.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
        
        // Update user position
        UserPosition storage position = positions[predictionId][msg.sender];
        
        if (isYes) {
            position.yesAmount += amount;
            prediction.yesStakes += amount;
        } else {
            position.noAmount += amount;
            prediction.noStakes += amount;
        }
        
        emit StakePlaced(predictionId, msg.sender, isYes, amount);
    }
    
    /**
     * @dev Resolve a prediction with actual price (oracle only)
     * @param predictionId ID of the prediction to resolve
     * @param actualPrice Actual commodity price at target date (in cents)
     */
    function resolvePrediction(
        uint256 predictionId,
        uint256 actualPrice
    ) external {
        if (msg.sender != oracleAddress && msg.sender != owner()) {
            revert Unauthorized();
        }
        
        Prediction storage prediction = predictions[predictionId];
        
        if (prediction.createdAt == 0) revert InvalidPrediction();
        if (prediction.resolved) revert AlreadyResolved();
        if (block.timestamp < prediction.targetDate) revert PredictionExpired();
        
        prediction.resolved = true;
        prediction.actualPrice = actualPrice;
        
        // Determine if prediction was correct
        // Consider prediction correct if actual price is within 5% of predicted price
        uint256 tolerance = (prediction.predictedPrice * 500) / BASIS_POINTS; // 5%
        bool predictedCorrectly = actualPrice >= prediction.predictedPrice - tolerance &&
                                  actualPrice <= prediction.predictedPrice + tolerance;
        
        emit PredictionResolved(
            predictionId,
            actualPrice,
            predictedCorrectly,
            block.timestamp
        );
    }
    
    /**
     * @dev Claim winnings from a resolved prediction
     * @param predictionId ID of the prediction
     */
    function claimWinnings(uint256 predictionId) external nonReentrant {
        Prediction storage prediction = predictions[predictionId];
        UserPosition storage position = positions[predictionId][msg.sender];
        
        if (!prediction.resolved) revert PredictionNotResolved();
        if (position.claimed) revert AlreadyClaimed();
        
        uint256 payout = _calculatePayout(predictionId, msg.sender);
        
        if (payout == 0) revert NoWinnings();
        
        position.claimed = true;
        
        // Deduct platform fee
        uint256 fee = (payout * PLATFORM_FEE) / BASIS_POINTS;
        uint256 netPayout = payout - fee;
        
        totalFeesCollected += fee;
        
        if (!usdc.transfer(msg.sender, netPayout)) {
            revert TransferFailed();
        }
        
        emit WinningsClaimed(predictionId, msg.sender, netPayout);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Calculate potential payout for a user
     * @param predictionId ID of the prediction
     * @param user Address of the user
     * @return Payout amount in USDC (before fees)
     */
    function _calculatePayout(
        uint256 predictionId,
        address user
    ) internal view returns (uint256) {
        Prediction storage prediction = predictions[predictionId];
        UserPosition storage position = positions[predictionId][user];
        
        if (!prediction.resolved) return 0;
        
        // Determine if prediction was correct
        uint256 tolerance = (prediction.predictedPrice * 500) / BASIS_POINTS; // 5%
        bool predictedCorrectly = prediction.actualPrice >= prediction.predictedPrice - tolerance &&
                                  prediction.actualPrice <= prediction.predictedPrice + tolerance;
        
        uint256 totalPool = prediction.yesStakes + prediction.noStakes;
        
        if (totalPool == 0) return 0;
        
        uint256 payout = 0;
        
        if (predictedCorrectly && position.yesAmount > 0) {
            // YES won - distribute proportionally
            if (prediction.yesStakes > 0) {
                payout = (position.yesAmount * totalPool) / prediction.yesStakes;
            }
        } else if (!predictedCorrectly && position.noAmount > 0) {
            // NO won - distribute proportionally
            if (prediction.noStakes > 0) {
                payout = (position.noAmount * totalPool) / prediction.noStakes;
            }
        }
        
        return payout;
    }
    
    /**
     * @dev Get potential payout for a user (public view)
     */
    function calculatePayout(
        uint256 predictionId,
        address user
    ) external view returns (uint256) {
        return _calculatePayout(predictionId, user);
    }
    
    /**
     * @dev Get current odds for a prediction
     * @return yesOdds Percentage chance based on stakes (0-10000 basis points)
     * @return noOdds Percentage chance based on stakes (0-10000 basis points)
     */
    function getOdds(uint256 predictionId) external view returns (uint256 yesOdds, uint256 noOdds) {
        Prediction storage prediction = predictions[predictionId];
        uint256 totalPool = prediction.yesStakes + prediction.noStakes;
        
        if (totalPool == 0) {
            return (5000, 5000); // 50/50 if no stakes
        }
        
        yesOdds = (prediction.yesStakes * BASIS_POINTS) / totalPool;
        noOdds = (prediction.noStakes * BASIS_POINTS) / totalPool;
    }
    
    /**
     * @dev Get prediction details
     */
    function getPrediction(uint256 predictionId) external view returns (Prediction memory) {
        return predictions[predictionId];
    }
    
    /**
     * @dev Get user position for a prediction
     */
    function getPosition(uint256 predictionId, address user) external view returns (UserPosition memory) {
        return positions[predictionId][user];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update oracle address (owner only)
     */
    function setOracleAddress(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        address oldOracle = oracleAddress;
        oracleAddress = newOracle;
        emit OracleUpdated(oldOracle, newOracle);
    }
    
    /**
     * @dev Withdraw collected platform fees (owner only)
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = totalFeesCollected;
        require(amount > 0, "No fees to withdraw");
        
        totalFeesCollected = 0;
        
        if (!usdc.transfer(owner(), amount)) {
            revert TransferFailed();
        }
    }
}
