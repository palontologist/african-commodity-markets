// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CommodityEscrow
 * @notice Escrow contract for A2A commodity trades
 * @dev Holds USDC payments until delivery conditions are met
 */
contract CommodityEscrow is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct Escrow {
        bytes32 tradeId;
        address buyer;
        address seller;
        uint256 amount;           // USDC amount
        bytes32 commodityHash;   // Hash of commodity details
        uint256 deliveryDate;
        uint256 createdAt;
        EscrowStatus status;
        bool buyerConfirmed;
        bool sellerConfirmed;
    }
    
    enum EscrowStatus {
        ACTIVE,
        CONDITION_MET,
        RELEASED,
        DISPUTED,
        REFUNDED,
        EXPIRED
    }
    
    // ============ State Variables ============
    
    IERC20 public usdc;
    uint256 public platformFeeBps = 50; // 0.5%
    address public platformWallet;
    
    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => bool) public isEscrow;
    
    event EscrowCreated(
        bytes32 indexed escrowId,
        bytes32 indexed tradeId,
        address buyer,
        address seller,
        uint256 amount
    );
    
    event EscrowConfirmed(
        bytes32 indexed escrowId,
        address confirmer,
        bool isBuyer
    );
    
    event EscrowReleased(
        bytes32 indexed escrowId,
        address recipient,
        uint256 amount
    );
    
    event EscrowDisputed(
        bytes32 indexed escrowId,
        address raisedBy,
        string reason
    );
    
    event DisputeResolved(
        bytes32 indexed escrowId,
        address buyerRecipient,
        uint256 buyerAmount,
        address sellerRecipient,
        uint256 sellerAmount
    );
    
    event PlatformFeeUpdated(uint256 newFeeBps);
    
    // ============ Constructor ============
    
    constructor(address _usdc, address _platformWallet) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        platformWallet = _platformWallet;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Create escrow for a trade
     * @param tradeId Unique trade identifier
     * @param buyer Buyer address
     * @param seller Seller address
     * @param amount USDC amount to hold
     * @param commodityHash Hash of commodity details
     * @param deliveryDate Expected delivery timestamp
     */
    function createEscrow(
        bytes32 tradeId,
        address buyer,
        address seller,
        uint256 amount,
        bytes32 commodityHash,
        uint256 deliveryDate
    ) external onlyOwner returns (bytes32 escrowId) {
        require(buyer != address(0) && seller != address(0), "Invalid addresses");
        require(amount > 0, "Amount must be positive");
        
        escrowId = keccak256(abi.encodePacked(tradeId, block.timestamp, msg.sender));
        
        escrows[escrowId] = Escrow({
            tradeId: tradeId,
            buyer: buyer,
            seller: seller,
            amount: amount,
            commodityHash: commodityHash,
            deliveryDate: deliveryDate,
            createdAt: block.timestamp,
            status: EscrowStatus.ACTIVE,
            buyerConfirmed: false,
            sellerConfirmed: false
        });
        
        isEscrow[escrowId] = true;
        
        emit EscrowCreated(escrowId, tradeId, buyer, seller, amount);
    }
    
    /**
     * @notice Confirm escrow release (called by buyer or seller)
     * @param escrowId Escrow identifier
     */
    function confirmEscrow(bytes32 escrowId) external nonReentrant {
        require(isEscrow[escrowId], "Escrow not found");
        Escrow storage escrow = escrows[escrowId];
        
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Not authorized"
        );
        require(escrow.status == EscrowStatus.ACTIVE, "Invalid status");
        
        if (msg.sender == escrow.buyer) {
            escrow.buyerConfirmed = true;
        } else {
            escrow.sellerConfirmed = true;
        }
        
        emit EscrowConfirmed(escrowId, msg.sender, msg.sender == escrow.buyer);
        
        // If both confirmed, release funds
        if (escrow.buyerConfirmed && escrow.sellerConfirmed) {
            _releaseEscrow(escrowId);
        }
    }
    
    /**
     * @notice Release escrow to seller (automatic on delivery confirmation)
     * @param escrowId Escrow identifier
     */
    function releaseEscrow(bytes32 escrowId) external onlyOwner nonReentrant {
        require(isEscrow[escrowId], "Escrow not found");
        _releaseEscrow(escrowId);
    }
    
    /**
     * @notice Raise dispute
     * @param escrowId Escrow identifier
     * @param reason Reason for dispute
     */
    function raiseDispute(bytes32 escrowId, string calldata reason) external {
        require(isEscrow[escrowId], "Escrow not found");
        Escrow storage escrow = escrows[escrowId];
        
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Not authorized"
        );
        require(escrow.status == EscrowStatus.ACTIVE, "Invalid status");
        
        escrow.status = EscrowStatus.DISPUTED;
        
        emit EscrowDisputed(escrowId, msg.sender, reason);
    }
    
    /**
     * @notice Resolve dispute and distribute funds
     * @param escrowId Escrow identifier
     * @param buyerAmount Amount to refund buyer
     * @param sellerAmount Amount to send seller
     */
    function resolveDispute(
        bytes32 escrowId,
        uint256 buyerAmount,
        uint256 sellerAmount
    ) external onlyOwner nonReentrant {
        require(isEscrow[escrowId], "Escrow not found");
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.DISPUTED, "Not disputed");
        require(buyerAmount + sellerAmount <= escrow.amount, "Amount mismatch");
        
        escrow.status = EscrowStatus.REFUNDED;
        
        if (buyerAmount > 0) {
            require(usdc.transfer(escrow.buyer, buyerAmount), "Buyer transfer failed");
        }
        if (sellerAmount > 0) {
            require(usdc.transfer(escrow.seller, sellerAmount), "Seller transfer failed");
        }
        
        emit DisputeResolved(escrowId, escrow.buyer, buyerAmount, escrow.seller, sellerAmount);
    }
    
    /**
     * @notice Refund buyer (e.g., delivery not received)
     * @param escrowId Escrow identifier
     */
    function refundBuyer(bytes32 escrowId) external onlyOwner nonReentrant {
        require(isEscrow[escrowId], "Escrow not found");
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.ACTIVE, "Invalid status");
        require(block.timestamp > escrow.deliveryDate + 7 days, "Not expired");
        
        escrow.status = EscrowStatus.REFUNDED;
        require(usdc.transfer(escrow.buyer, escrow.amount), "Refund failed");
        
        emit EscrowReleased(escrowId, escrow.buyer, escrow.amount);
    }
    
    /**
     * @notice Update platform fee
     * @param newFeeBps New fee in basis points
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 500, "Fee too high"); // Max 5%
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }
    
    /**
     * @notice Update platform wallet
     * @param newWallet New wallet address
     */
    function updatePlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        platformWallet = newWallet;
    }
    
    // ============ View Functions ============
    
    function getEscrow(bytes32 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }
    
    function getEscrowStatus(bytes32 escrowId) external view returns (EscrowStatus) {
        return escrows[escrowId].status;
    }
    
    function calculateFee(uint256 amount) external view returns (uint256) {
        return (amount * platformFeeBps) / 10000;
    }
    
    // ============ Internal Functions ============
    
    function _releaseEscrow(bytes32 escrowId) internal {
        Escrow storage escrow = escrows[escrowId];
        
        escrow.status = EscrowStatus.RELEASED;
        
        // Calculate platform fee
        uint256 fee = (escrow.amount * platformFeeBps) / 10000;
        uint256 sellerAmount = escrow.amount - fee;
        
        // Transfer to seller
        require(usdc.transfer(escrow.seller, sellerAmount), "Seller transfer failed");
        
        // Transfer fee to platform
        if (fee > 0) {
            require(usdc.transfer(platformWallet, fee), "Fee transfer failed");
        }
        
        emit EscrowReleased(escrowId, escrow.seller, sellerAmount);
    }
}
