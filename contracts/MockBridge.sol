// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockBridge {
    event BridgeInitiated(address indexed user, uint256 amount, uint256 timestamp);
    event BridgeCompleted(address indexed user, uint256 amount, uint256 timestamp);

    // Simulate bridging funds from Solana
    function bridgeFromSolana(uint256 amount) external {
        // In a real bridge, we'd verify a Wormhole VAA here.
        // For the hackathon, we just emit the event to trigger the UI.
        emit BridgeInitiated(msg.sender, amount, block.timestamp);
        emit BridgeCompleted(msg.sender, amount, block.timestamp);
    }

    // Allow the contract to receive gas if needed
    receive() external payable {}
}
