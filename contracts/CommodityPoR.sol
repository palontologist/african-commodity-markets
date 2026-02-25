// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AggregatorV3Interface
 * @notice Chainlink price feed interface (inline to avoid external dependency)
 */
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);

    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/**
 * @title CommodityPoR
 * @notice Chainlink Proof of Reserve verifier for African commodity markets
 * @dev Uses Chainlink PoR feed to verify commodity reserves against claimed quantities
 *
 * Deploy via Hardhat → Polygon (Amoy testnet or mainnet)
 * Example PoR feed addresses:
 *   - Polygon Mainnet WBTC PoR: 0xBC36FdE44A7FD8f545d459452EF9539d7A14dd63
 *   - Use a custom PoR feed for commodity reserves
 */
contract CommodityPoR {
    // ============ State Variables ============

    AggregatorV3Interface public poRFeed;

    /// @notice ipfsHash → verified quantity
    mapping(bytes32 => uint256) public reserves;

    /// @notice ipfsHash → submitter address
    mapping(bytes32 => address) public proofSubmitters;

    /// @notice ipfsHash → submission timestamp
    mapping(bytes32 => uint256) public proofTimestamps;

    address public owner;

    // ============ Events ============

    event ProofSubmitted(
        bytes32 indexed ipfsHash,
        uint256 claimedQty,
        address indexed submitter,
        uint256 timestamp
    );

    event PoRFeedUpdated(address indexed oldFeed, address indexed newFeed);

    // ============ Errors ============

    error InsufficientReserves(int256 reserves_, uint256 claimed);
    error StaleReserveData(uint256 updatedAt);
    error Unauthorized();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // ============ Constructor ============

    /**
     * @param _poRFeed Chainlink PoR Aggregator feed address
     */
    constructor(address _poRFeed) {
        poRFeed = AggregatorV3Interface(_poRFeed);
        owner = msg.sender;
    }

    // ============ External Functions ============

    /**
     * @notice Submit a Proof of Reserve for an IPFS-stored commodity document
     * @param ipfsHash keccak256 hash of the IPFS CID bytes
     * @param claimedQty Claimed quantity in base units (e.g. kg × 10^3)
     */
    function submitProof(bytes32 ipfsHash, uint256 claimedQty) external {
        (
            ,
            int256 reserveAnswer,
            ,
            uint256 updatedAt,

        ) = poRFeed.latestRoundData();

        // Ensure data is not stale (must be updated within last 25 hours)
        if (block.timestamp - updatedAt > 25 hours) {
            revert StaleReserveData(updatedAt);
        }

        if (int256(claimedQty) > reserveAnswer) {
            revert InsufficientReserves(reserveAnswer, claimedQty);
        }

        reserves[ipfsHash] = claimedQty;
        proofSubmitters[ipfsHash] = msg.sender;
        proofTimestamps[ipfsHash] = block.timestamp;

        emit ProofSubmitted(ipfsHash, claimedQty, msg.sender, block.timestamp);
    }

    /**
     * @notice Get the current on-chain reserve value from Chainlink PoR feed
     * @return reserveValue The latest reserve value from the feed
     * @return updatedAt Timestamp of the last feed update
     */
    function getLatestReserve()
        external
        view
        returns (int256 reserveValue, uint256 updatedAt)
    {
        (, int256 answer, , uint256 ts, ) = poRFeed.latestRoundData();
        return (answer, ts);
    }

    /**
     * @notice Check whether a proof is verified (reserves stored > 0)
     * @param ipfsHash keccak256 hash of the IPFS CID bytes
     */
    function isVerified(bytes32 ipfsHash) external view returns (bool) {
        return reserves[ipfsHash] > 0;
    }

    /**
     * @notice Update the Chainlink PoR feed address (owner only)
     * @param _newFeed New PoR feed address
     */
    function updatePoRFeed(address _newFeed) external onlyOwner {
        emit PoRFeedUpdated(address(poRFeed), _newFeed);
        poRFeed = AggregatorV3Interface(_newFeed);
    }
}
