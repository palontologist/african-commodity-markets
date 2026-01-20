// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CommodityPool
 * @notice Unified USDC liquidity pool for commodity prediction markets
 * @dev Manages USDC deposits, withdrawals, and reward distribution
 */
contract CommodityPool is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct UserPosition {
        uint256 deposited;
        uint256 withdrawn;
        uint256 rewardsEarned;
        uint256 rewardsClaimed;
        uint256 lastRewardUpdate;
        uint256 depositTimestamp;
        bool active;
    }
    
    struct PoolStats {
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 totalRewardsDistributed;
        uint256 activeDepositors;
        uint256 apy; // in basis points (100 = 1%)
        uint256 lastUpdateTime;
    }
    
    // ============ State Variables ============
    
    IERC20 public usdc;
    uint256 public totalLiquidity;
    uint256 public totalRewards;
    uint256 public rewardRate; // Rewards per second per USDC (in wei)
    uint256 public constant PERCENTAGE_BASE = 10000;
    
    mapping(address => UserPosition) public userPositions;
    mapping(address => bool) public hasDeposited;
    address[] public depositors;
    
    // ============ Events ============
    
    event Deposited(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 totalLiquidity
    );
    
    event Withdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 remainingBalance
    );
    
    event RewardsClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event RewardRateUpdated(
        uint256 newRate,
        uint256 timestamp,
        address indexed updatedBy
    );
    
    event RewardsAdded(
        uint256 amount,
        uint256 timestamp,
        address indexed addedBy
    );
    
    // ============ Constructor ============
    
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        rewardRate = 0; // Start with 0 rewards
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Deposit USDC into the pool
     * @param amount Amount of USDC to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        
        // Transfer USDC from user
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        
        // Update user position
        UserPosition storage position = userPositions[msg.sender];
        
        if (!hasDeposited[msg.sender]) {
            // New user
            depositors.push(msg.sender);
            hasDeposited[msg.sender] = true;
            position.deposited = amount;
            position.withdrawn = 0;
            position.rewardsEarned = 0;
            position.rewardsClaimed = 0;
            position.lastRewardUpdate = block.timestamp;
            position.depositTimestamp = block.timestamp;
            position.active = true;
        } else {
            // Update existing user
            _updateRewards(msg.sender);
            position.deposited += amount;
            position.active = true;
        }
        
        totalLiquidity += amount;
        
        emit Deposited(msg.sender, amount, block.timestamp, totalLiquidity);
    }
    
    /**
     * @notice Withdraw USDC from the pool
     * @param amount Amount of USDC to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        
        UserPosition storage position = userPositions[msg.sender];
        require(position.active, "No active position");
        require(hasDeposited[msg.sender], "No deposit found");
        
        uint256 currentBalance = _getUserBalance(msg.sender);
        require(amount <= currentBalance, "Insufficient balance");
        
        // Update rewards first
        _updateRewards(msg.sender);
        
        // Update position
        position.withdrawn += amount;
        
        // Deactivate if fully withdrawn
        if (position.deposited - position.withdrawn == 0) {
            position.active = false;
        }
        
        totalLiquidity -= amount;
        
        // Transfer USDC to user
        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");
        
        emit Withdrawn(msg.sender, amount, block.timestamp, currentBalance - amount);
    }
    
    /**
     * @notice Claim accumulated rewards
     */
    function claimRewards() external nonReentrant {
        require(hasDeposited[msg.sender], "No deposit found");
        
        // Update rewards first
        _updateRewards(msg.sender);
        
        UserPosition storage position = userPositions[msg.sender];
        uint256 unclaimedRewards = position.rewardsEarned - position.rewardsClaimed;
        
        require(unclaimedRewards > 0, "No rewards to claim");
        
        position.rewardsClaimed += unclaimedRewards;
        totalRewards -= unclaimedRewards;
        
        // Transfer rewards (assuming rewards are in USDC)
        require(usdc.transfer(msg.sender, unclaimedRewards), "Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, unclaimedRewards, block.timestamp);
    }
    
    /**
     * @notice Add rewards to the pool (owner only)
     * @param amount Amount of rewards to add
     */
    function addRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        
        // Transfer rewards from owner
        require(usdc.transferFrom(msg.sender, address(this), amount), "Reward transfer failed");
        
        totalRewards += amount;
        
        // Update reward rate based on new rewards
        _updateRewardRate();
        
        emit RewardsAdded(amount, block.timestamp, msg.sender);
    }
    
    /**
     * @notice Update reward rate (owner only)
     * @param newRate New reward rate in wei per second per USDC
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        require(newRate >= 0, "Rate cannot be negative");
        
        // Update all user rewards before changing rate
        _updateAllUserRewards();
        
        rewardRate = newRate;
        
        emit RewardRateUpdated(newRate, block.timestamp, msg.sender);
    }
    
    /**
     * @notice Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        
        require(usdc.transfer(msg.sender, balance), "Emergency transfer failed");
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get user's current balance
     * @param user User address
     */
    function getUserBalance(address user) external view returns (uint256) {
        return _getUserBalance(user);
    }
    
    /**
     * @notice Get user's unclaimed rewards
     * @param user User address
     */
    function getUserRewards(address user) external view returns (uint256) {
        if (!hasDeposited[user]) return 0;
        
        UserPosition storage position = userPositions[user];
        uint256 currentRewards = position.rewardsEarned;
        
        if (position.active && totalLiquidity > 0) {
            uint256 userBalance = _getUserBalance(user);
            uint256 timePassed = block.timestamp - position.lastRewardUpdate;
            uint256 newRewards = (userBalance * rewardRate * timePassed) / 1e18;
            currentRewards += newRewards;
        }
        
        return currentRewards - position.rewardsClaimed;
    }
    
    /**
     * @notice Get user's total deposited amount
     * @param user User address
     */
    function getUserDeposited(address user) external view returns (uint256) {
        if (!hasDeposited[user]) return 0;
        return userPositions[user].deposited;
    }
    
    /**
     * @notice Get user's total withdrawn amount
     * @param user User address
     */
    function getUserWithdrawn(address user) external view returns (uint256) {
        if (!hasDeposited[user]) return 0;
        return userPositions[user].withdrawn;
    }
    
    /**
     * @notice Get user position details
     * @param user User address
     */
    function getUserPosition(address user) external view returns (UserPosition memory) {
        return userPositions[user];
    }
    
    /**
     * @notice Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 totalDeposited_,
        uint256 totalWithdrawn_,
        uint256 totalRewards_,
        uint256 activeDepositors_,
        uint256 currentAPY
    ) {
        totalDeposited_ = 0;
        totalWithdrawn_ = 0;
        activeDepositors_ = 0;
        
        for (uint256 i = 0; i < depositors.length; i++) {
            address user = depositors[i];
            UserPosition storage position = userPositions[user];
            
            totalDeposited_ += position.deposited;
            totalWithdrawn_ += position.withdrawn;
            
            if (position.active) {
                activeDepositors_++;
            }
        }
        
        totalRewards_ = totalRewards;
        
        // Calculate current APY
        if (totalLiquidity > 0 && rewardRate > 0) {
            // APY = (rewardRate * seconds_in_year * 100) / totalLiquidity
            currentAPY = (rewardRate * 31536000) / totalLiquidity; // *100 and /1e18 for percentage
        } else {
            currentAPY = 0;
        }
    }
    
    /**
     * @notice Get all depositors
     */
    function getDepositors() external view returns (address[] memory) {
        return depositors;
    }
    
    /**
     * @notice Get number of depositors
     */
    function getDepositorCount() external view returns (uint256) {
        return depositors.length;
    }
    
    /**
     * @notice Get current reward rate
     */
    function getCurrentRewardRate() external view returns (uint256) {
        return rewardRate;
    }
    
    /**
     * @notice Calculate APY from reward rate
     */
    function calculateAPY(uint256 _rewardRate) external pure returns (uint256) {
        // APY = (rewardRate * seconds_in_year * 100) / 1e18
        return (_rewardRate * 31536000) / 1e16;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Update rewards for a specific user
     */
    function _updateRewards(address user) internal {
        UserPosition storage position = userPositions[user];
        
        if (!position.active || totalLiquidity == 0) return;
        
        uint256 userBalance = _getUserBalance(user);
        uint256 timePassed = block.timestamp - position.lastRewardUpdate;
        
        if (timePassed > 0 && userBalance > 0) {
            uint256 newRewards = (userBalance * rewardRate * timePassed) / 1e18;
            position.rewardsEarned += newRewards;
            position.lastRewardUpdate = block.timestamp;
        }
    }
    
    /**
     * @notice Update rewards for all users
     */
    function _updateAllUserRewards() internal {
        for (uint256 i = 0; i < depositors.length; i++) {
            _updateRewards(depositors[i]);
        }
    }
    
    /**
     * @notice Get user's current balance
     */
    function _getUserBalance(address user) internal view returns (uint256) {
        if (!hasDeposited[user]) return 0;
        
        UserPosition storage position = userPositions[user];
        return position.deposited - position.withdrawn;
    }
    
    /**
     * @notice Update reward rate based on total rewards and liquidity
     */
    function _updateRewardRate() internal {
        if (totalLiquidity > 0) {
            // Simple formula: distribute rewards over next 30 days
            uint256 rewardsPerDay = totalRewards / 30;
            rewardRate = (rewardsPerDay * 1e18) / (totalLiquidity * 86400); // Convert to per second
        } else {
            rewardRate = 0;
        }
    }
}