// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VSXVault {
    address public owner;
    uint256 private locked;

    constructor() {
        owner = msg.sender;
    }

    function lock() external payable {
        require(msg.value > 0, "Send ETH to lock");
        locked += msg.value;
    }

    function getLockedBalance() external view returns (uint256) {
        return locked;
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(locked);
        locked = 0;
    }
}
