# SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentRegistry
 * @notice Registry for AI trading agents on the A2A marketplace
 * @dev Agents register here to participate in the marketplace
 */
contract AgentRegistry is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct Agent {
        address owner;
        string name;
        string description;
        bytes32 metadataCID;      // IPFS CID for agent metadata
        uint256 reputation;       // 0-100 score
        uint256 totalTrades;
        uint256 totalVolume;      // in USDC
        uint256 avgRating;        // 1-5 stars (multiplied by 10)
        bool active;
        FeeTier tier;
        uint256 createdAt;
        uint256 lastSeen;
    }
    
    enum FeeTier {
        FREE,
        BASIC,
        PREMIUM,
        ENTERPRISE
    }
    
    enum Capability {
        HEDGE,
        ARBITRAGE,
        MARKET_MAKE,
        SPECULATE,
        COOPERATIVE
    }
    
    // ============ State Variables ============
    
    uint256 public constant PLATFORM_FEE_BPS = 50; // 0.5%
    
    mapping(address => Agent) public agents;
    mapping(address => bool) public isAgent;
    mapping(bytes32 => address) public capabilityToAgent;
    
    address[] public agentList;
    address public usdcToken;
    address public platformWallet;
    
    uint256 public agentCount;
    
    // ============ Events ============
    
    event AgentRegistered(
        address indexed agentAddress,
        address indexed owner,
        string name,
        FeeTier tier
    );
    
    event AgentUpdated(
        address indexed agentAddress,
        string name,
        bool active
    );
    
    event ReputationUpdated(
        address indexed agentAddress,
        uint256 newReputation,
        uint256 totalTrades
    );
    
    event TierUpgraded(
        address indexed agentAddress,
        FeeTier oldTier,
        FeeTier newTier
    );
    
    // ============ Constructor ============
    
    constructor(address _usdcToken, address _platformWallet) Ownable(msg.sender) {
        usdcToken = _usdcToken;
        platformWallet = _platformWallet;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Register a new agent
     * @param name Agent name
     * @param description Agent description
     * @param metadataCID IPFS CID for additional metadata
     */
    function register(
        string memory name,
        string memory description,
        bytes32 metadataCID
    ) external returns (address agentAddress) {
        require(!isAgent[msg.sender], "Already registered");
        require(bytes(name).length > 0, "Name required");
        
        Agent storage agent = agents[msg.sender];
        agent.owner = msg.sender;
        agent.name = name;
        agent.description = description;
        agent.metadataCID = metadataCID;
        agent.reputation = 50; // Start with neutral reputation
        agent.avgRating = 40; // 4.0 stars
        agent.active = true;
        agent.tier = FeeTier.FREE;
        agent.createdAt = block.timestamp;
        agent.lastSeen = block.timestamp;
        
        isAgent[msg.sender] = true;
        agentList.push(msg.sender);
        agentCount++;
        
        emit AgentRegistered(msg.sender, msg.sender, name, FeeTier.FREE);
        
        return msg.sender;
    }
    
    /**
     * @notice Update agent profile
     * @param name New name
     * @param description New description
     * @param metadataCID New metadata CID
     */
    function updateProfile(
        string memory name,
        string memory description,
        bytes32 metadataCID
    ) external {
        require(isAgent[msg.sender], "Not registered");
        
        Agent storage agent = agents[msg.sender];
        agent.name = name;
        agent.description = description;
        agent.metadataCID = metadataCID;
        agent.lastSeen = block.timestamp;
        
        emit AgentUpdated(msg.sender, name, agent.active);
    }
    
    /**
     * @notice Update agent active status
     * @param active New active status
     */
    function setActive(bool active) external {
        require(isAgent[msg.sender], "Not registered");
        agents[msg.sender].active = active;
        agents[msg.sender].lastSeen = block.timestamp;
        
        emit AgentUpdated(msg.sender, agents[msg.sender].name, active);
    }
    
    /**
     * @notice Update reputation (called by trading contract)
     * @param agentAddress Agent address
     * @param rating Rating 1-5 (multiplied by 10)
     */
    function updateReputation(address agentAddress, uint256 rating) external onlyOwner {
        require(isAgent[agentAddress], "Not registered");
        require(rating >= 10 && rating <= 50, "Invalid rating");
        
        Agent storage agent = agents[agentAddress];
        
        // Update running average
        uint256 totalRatings = agent.totalTrades;
        if (totalRatings > 0) {
            uint256 newAvg = ((agent.avgRating * totalRatings) + rating) / (totalRatings + 1);
            agent.avgRating = newAvg;
        } else {
            agent.avgRating = rating;
        }
        
        // Adjust reputation based on rating
        if (rating >= 40) { // 4+ stars
            agent.reputation = agent.reputation + 1 > 100 ? 100 : agent.reputation + 1;
        } else if (rating <= 20) { // 2 or less stars
            agent.reputation = agent.reputation < 1 ? 0 : agent.reputation - 1;
        }
        
        emit ReputationUpdated(agentAddress, agent.reputation, agent.totalTrades);
    }
    
    /**
     * @notice Record a trade (called by trading contract)
     * @param agentAddress Agent address
     * @param volume Trade volume in USDC
     */
    function recordTrade(address agentAddress, uint256 volume) external onlyOwner {
        require(isAgent[agentAddress], "Not registered");
        
        Agent storage agent = agents[agentAddress];
        agent.totalTrades++;
        agent.totalVolume += volume;
        agent.lastSeen = block.timestamp;
    }
    
    /**
     * @notice Upgrade agent tier
     * @param newTier New tier
     */
    function upgradeTier(FeeTier newTier) external {
        require(isAgent[msg.sender], "Not registered");
        require(uint8(newTier) > uint8(agents[msg.sender].tier), "Can only upgrade");
        
        FeeTier oldTier = agents[msg.sender].tier;
        agents[msg.sender].tier = newTier;
        
        emit TierUpgraded(msg.sender, oldTier, newTier);
    }
    
    /**
     * @notice Pay tier upgrade fee
     */
    function payTierFee(uint256 amount) external {
        require(isAgent[msg.sender], "Not registered");
        require(amount > 0, "Amount required");
        
        // Transfer USDC to platform wallet
        require(
            IERC20(usdcToken).transferFrom(msg.sender, platformWallet, amount),
            "Transfer failed"
        );
    }
    
    /**
     * @notice Send heartbeat
     */
    function heartbeat() external {
        require(isAgent[msg.sender], "Not registered");
        agents[msg.sender].lastSeen = block.timestamp;
    }
    
    /**
     * @notice Calculate platform fee
     * @param volume Trade volume
     * @return fee Amount in USDC
     */
    function calculateFee(uint256 volume) external view returns (uint256 fee) {
        return (volume * PLATFORM_FEE_BPS) / 10000;
    }
    
    // ============ View Functions ============
    
    function getAgent(address agentAddress) external view returns (Agent memory) {
        return agents[agentAddress];
    }
    
    function getAgentByOwner(address owner) external view returns (Agent memory) {
        return agents[owner];
    }
    
    function isAgentActive(address agentAddress) external view returns (bool) {
        return agents[agentAddress].active;
    }
    
    function getAllAgents() external view returns (address[] memory) {
        return agentList;
    }
    
    function getAgentsByTier(FeeTier tier) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].tier == tier) {
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].tier == tier) {
                result[index] = agentList[i];
                index++;
            }
        }
        
        return result;
    }
    
    function getTopAgents(uint256 limit) external view returns (address[] memory) {
        uint256 count = limit > agentList.length ? agentList.length : limit;
        address[] memory result = new address[](count);
        
        // Simple bubble sort for top agents by reputation
        for (uint256 i = 0; i < count; i++) {
            for (uint256 j = i + 1; j < agentList.length; j++) {
                if (agents[agentList[j]].reputation > agents[agentList[i]].reputation) {
                    address temp = agentList[i];
                    agentList[i] = agentList[j];
                    agentList[j] = temp;
                }
            }
            result[i] = agentList[i];
        }
        
        return result;
    }
}
