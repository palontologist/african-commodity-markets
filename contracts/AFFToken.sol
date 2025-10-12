// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AFFToken
 * @notice Afrifutures Governance Token
 * @dev Simple ERC20 token for testing and governance
 */
contract AFFToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10 billion max
    
    /**
     * @notice Constructor
     * @param initialOwner Address that will receive initial supply and be owner
     */
    constructor(address initialOwner) ERC20("Afrifutures Token", "AFF") Ownable(initialOwner) {
        require(initialOwner != address(0), "Invalid owner address");
        _mint(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @notice Mint new tokens (only owner)
     * @param to Address to receive tokens
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens from caller's balance
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
