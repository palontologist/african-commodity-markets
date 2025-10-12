// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AfrifuturesBridge
 * @notice Bridge for cross-chain USDC settlement and $AFF token transfers via Wormhole
 * @dev Supports:
 * - USDC staking on Polygon → bridged to Solana
 * - $AFF tokens bridged between chains
 * - Warehouse receipts for cross-chain settlements
 * - Governance vote bridging
 */
contract AfrifuturesBridge is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Wormhole Core Bridge
    IWormhole public immutable wormhole;
    
    // Token addresses
    IERC20 public immutable usdc;
    IERC20 public immutable affToken;
    
    // Chain IDs (Wormhole format)
    uint16 public constant SOLANA_CHAIN_ID = 1; // Solana
    uint16 public constant POLYGON_CHAIN_ID = 5; // Polygon
    
    // Roles
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant BRIDGE_ADMIN = keccak256("BRIDGE_ADMIN");
    
    // Nonce for message ordering
    uint32 public nonce;
    
    // Fee configuration (in wei)
    uint256 public bridgeFee = 0.01 ether; // Fee for bridging
    uint256 public relayerFee = 0.005 ether; // Fee for relayers
    
    // Message types
    enum MessageType {
        BRIDGE_USDC,        // Bridge USDC for staking
        BRIDGE_AFF,         // Bridge $AFF tokens
        BRIDGE_RECEIPT,     // Bridge warehouse receipt
        BRIDGE_STAKE,       // Bridge stake position
        BRIDGE_VOTE,        // Bridge governance vote
        SETTLE_POSITION     // Settle cross-chain position
    }
    
    // Bridge statistics
    struct BridgeStats {
        uint256 totalUSDCBridged;
        uint256 totalAFFBridged;
        uint256 totalMessages;
        uint256 totalStakes;
    }
    
    BridgeStats public stats;
    
    // Mapping for processed VAAs (Wormhole messages)
    mapping(bytes32 => bool) public processedVAAs;
    
    // Mapping for pending settlements
    mapping(uint256 => PendingSettlement) public pendingSettlements;
    uint256 public settlementNonce;
    
    struct PendingSettlement {
        address user;
        uint256 amount;
        MessageType messageType;
        uint64 timestamp;
        bool processed;
        bytes32 solanaRecipient;
    }
    
    // Events
    event MessageSent(
        uint64 indexed sequence,
        MessageType indexed messageType,
        address indexed sender,
        uint256 amount,
        bytes32 solanaRecipient
    );
    
    event MessageReceived(
        bytes32 indexed vaaHash,
        MessageType indexed messageType,
        address indexed recipient,
        uint256 amount
    );
    
    event USDCBridged(
        address indexed sender,
        uint256 amount,
        bytes32 solanaRecipient,
        uint64 sequence
    );
    
    event AFFBridged(
        address indexed sender,
        uint256 amount,
        bytes32 solanaRecipient,
        uint64 sequence
    );
    
    event StakeBridged(
        address indexed staker,
        uint256 stakeId,
        uint256 amount,
        bytes32 solanaRecipient
    );
    
    event VoteBridged(
        address indexed voter,
        uint256 proposalId,
        uint256 votes,
        bytes32 solanaRecipient
    );
    
    event SettlementProcessed(
        uint256 indexed settlementId,
        address indexed user,
        uint256 amount
    );
    
    event FeesUpdated(uint256 bridgeFee, uint256 relayerFee);
    
    /**
     * @notice Constructor
     * @param _wormhole Wormhole core bridge address
     * @param _usdc USDC token address on Polygon
     * @param _affToken $AFF token address on Polygon
     */
    constructor(
        address _wormhole,
        address _usdc,
        address _affToken
    ) {
        require(_wormhole != address(0), "Invalid wormhole address");
        require(_usdc != address(0), "Invalid USDC address");
        require(_affToken != address(0), "Invalid AFF address");
        
        wormhole = IWormhole(_wormhole);
        usdc = IERC20(_usdc);
        affToken = IERC20(_affToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_ADMIN, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
    }
    
    /**
     * @notice Bridge USDC to Solana for staking
     * @param amount Amount of USDC to bridge
     * @param solanaRecipient Recipient address on Solana (32 bytes)
     * @param marketId Market ID to stake in on Solana
     * @param isYes Whether staking on YES or NO
     */
    function bridgeUSDCForStaking(
        uint256 amount,
        bytes32 solanaRecipient,
        uint256 marketId,
        bool isYes
    ) external payable nonReentrant returns (uint64 sequence) {
        require(amount > 0, "Amount must be > 0");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(solanaRecipient != bytes32(0), "Invalid recipient");
        
        // Transfer USDC from user
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        // Encode payload
        bytes memory payload = abi.encode(
            MessageType.BRIDGE_USDC,
            msg.sender,
            amount,
            marketId,
            isYes,
            block.timestamp
        );
        
        // Publish message to Wormhole
        sequence = wormhole.publishMessage{value: msg.value}(
            nonce++,
            payload,
            15 // Finality (confirmations)
        );
        
        // Update stats
        stats.totalUSDCBridged += amount;
        stats.totalMessages++;
        stats.totalStakes++;
        
        emit USDCBridged(msg.sender, amount, solanaRecipient, sequence);
        emit MessageSent(sequence, MessageType.BRIDGE_USDC, msg.sender, amount, solanaRecipient);
        
        return sequence;
    }
    
    /**
     * @notice Bridge $AFF tokens to Solana
     * @param amount Amount of $AFF to bridge
     * @param solanaRecipient Recipient address on Solana
     */
    function bridgeAFF(
        uint256 amount,
        bytes32 solanaRecipient
    ) external payable nonReentrant returns (uint64 sequence) {
        require(amount > 0, "Amount must be > 0");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(solanaRecipient != bytes32(0), "Invalid recipient");
        
        // Transfer $AFF from user
        affToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Encode payload
        bytes memory payload = abi.encode(
            MessageType.BRIDGE_AFF,
            msg.sender,
            amount,
            block.timestamp
        );
        
        // Publish message to Wormhole
        sequence = wormhole.publishMessage{value: msg.value}(
            nonce++,
            payload,
            15
        );
        
        // Update stats
        stats.totalAFFBridged += amount;
        stats.totalMessages++;
        
        emit AFFBridged(msg.sender, amount, solanaRecipient, sequence);
        emit MessageSent(sequence, MessageType.BRIDGE_AFF, msg.sender, amount, solanaRecipient);
        
        return sequence;
    }
    
    /**
     * @notice Bridge warehouse receipt to Solana
     * @param receiptId Warehouse receipt ID
     * @param solanaRecipient Recipient address on Solana
     * @param commodity Commodity type
     * @param quantity Quantity in the receipt
     */
    function bridgeReceipt(
        uint256 receiptId,
        bytes32 solanaRecipient,
        string calldata commodity,
        uint256 quantity
    ) external payable nonReentrant returns (uint64 sequence) {
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(solanaRecipient != bytes32(0), "Invalid recipient");
        
        // Encode payload with receipt data
        bytes memory payload = abi.encode(
            MessageType.BRIDGE_RECEIPT,
            msg.sender,
            receiptId,
            commodity,
            quantity,
            block.timestamp
        );
        
        // Publish message
        sequence = wormhole.publishMessage{value: msg.value}(
            nonce++,
            payload,
            15
        );
        
        stats.totalMessages++;
        
        emit MessageSent(sequence, MessageType.BRIDGE_RECEIPT, msg.sender, receiptId, solanaRecipient);
        
        return sequence;
    }
    
    /**
     * @notice Bridge governance vote to Solana
     * @param proposalId Proposal ID
     * @param votes Number of votes
     * @param support Whether voting for or against
     * @param solanaRecipient Recipient address on Solana
     */
    function bridgeVote(
        uint256 proposalId,
        uint256 votes,
        bool support,
        bytes32 solanaRecipient
    ) external payable nonReentrant returns (uint64 sequence) {
        require(votes > 0, "Votes must be > 0");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        
        // Encode payload
        bytes memory payload = abi.encode(
            MessageType.BRIDGE_VOTE,
            msg.sender,
            proposalId,
            votes,
            support,
            block.timestamp
        );
        
        // Publish message
        sequence = wormhole.publishMessage{value: msg.value}(
            nonce++,
            payload,
            15
        );
        
        stats.totalMessages++;
        
        emit VoteBridged(msg.sender, proposalId, votes, solanaRecipient);
        emit MessageSent(sequence, MessageType.BRIDGE_VOTE, msg.sender, votes, solanaRecipient);
        
        return sequence;
    }
    
    /**
     * @notice Settle cross-chain position (relayer only)
     * @param vaa Verified Action Approval from Wormhole
     */
    function settlePosition(
        bytes calldata vaa
    ) external onlyRole(RELAYER_ROLE) nonReentrant {
        // Parse and verify VAA
        (IWormhole.VM memory vm, bool valid, string memory reason) = wormhole.parseAndVerifyVM(vaa);
        require(valid, reason);
        
        // Check if already processed
        bytes32 vaaHash = keccak256(vaa);
        require(!processedVAAs[vaaHash], "VAA already processed");
        processedVAAs[vaaHash] = true;
        
        // Decode payload (messageType | recipient | amount)
        (MessageType messageType, address recipient, uint256 amount) =
            abi.decode(vm.payload, (MessageType, address, uint256));
        
        // Process based on message type
        if (messageType == MessageType.SETTLE_POSITION) {
            // Transfer USDC to recipient
            usdc.safeTransfer(recipient, amount);
            
            emit SettlementProcessed(settlementNonce++, recipient, amount);
        } else if (messageType == MessageType.BRIDGE_AFF) {
            // Transfer $AFF to recipient
            affToken.safeTransfer(recipient, amount);
        }
        
        emit MessageReceived(vaaHash, messageType, recipient, amount);
    }
    
    /**
     * @notice Update bridge fees (admin only)
     * @param _bridgeFee New bridge fee
     * @param _relayerFee New relayer fee
     */
    function updateFees(
        uint256 _bridgeFee,
        uint256 _relayerFee
    ) external onlyRole(BRIDGE_ADMIN) {
        bridgeFee = _bridgeFee;
        relayerFee = _relayerFee;
        
        emit FeesUpdated(_bridgeFee, _relayerFee);
    }
    
    /**
     * @notice Withdraw collected fees (admin only)
     * @param recipient Address to receive fees
     */
    function withdrawFees(
        address payable recipient
    ) external onlyRole(BRIDGE_ADMIN) {
        require(recipient != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        recipient.transfer(balance);
    }
    
    /**
     * @notice Emergency withdraw tokens (admin only)
     * @param token Token address
     * @param amount Amount to withdraw
     * @param recipient Recipient address
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        IERC20(token).safeTransfer(recipient, amount);
    }
    
    /**
     * @notice Get bridge statistics
     */
    function getBridgeStats() external view returns (BridgeStats memory) {
        return stats;
    }
    
    /**
     * @notice Check if VAA is processed
     */
    function isVAAProcessed(bytes32 vaaHash) external view returns (bool) {
        return processedVAAs[vaaHash];
    }
    
    receive() external payable {}
}

/**
 * @notice Wormhole Core Bridge Interface
 */
interface IWormhole {
    struct VM {
        uint8 version;
        uint32 timestamp;
        uint32 nonce;
        uint16 emitterChainId;
        bytes32 emitterAddress;
        uint64 sequence;
        uint8 consistencyLevel;
        bytes payload;
        uint32 guardianSetIndex;
        bytes signatures;
        bytes32 hash;
    }
    
    function publishMessage(
        uint32 nonce,
        bytes memory payload,
        uint8 consistencyLevel
    ) external payable returns (uint64 sequence);
    
    function parseAndVerifyVM(
        bytes calldata encodedVM
    ) external view returns (VM memory vm, bool valid, string memory reason);
    
    function messageFee() external view returns (uint256);
}
