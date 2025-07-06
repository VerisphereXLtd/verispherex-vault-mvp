// SPDX-License-Identifier: MIT
// VerisphereX proprietary demo logic — v0.1
// Not for commercial use or production deployment without permission
pragma solidity ^0.8.28;

contract VSXVault {
    mapping(address => uint256) public lockedBalances;
    mapping(address => uint256) public lockedUntil;

    uint256 public totalLocked;
    address public owner;
    uint256 public lockDuration = 180; // default 3 minutes

    event Locked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event LockDurationChanged(uint256 newDuration, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    function setLockDuration(uint256 durationInSeconds) external {
        require(msg.sender == owner, "Only owner can set duration");
        require(durationInSeconds > 0, "Must be greater than 0");

        lockDuration = durationInSeconds;
        emit LockDurationChanged(durationInSeconds, block.timestamp);
    }

    function lock() external payable {
        require(msg.value > 0, "Must send ETH");

        lockedBalances[msg.sender] += msg.value;
        lockedUntil[msg.sender] = block.timestamp + lockDuration;
        totalLocked += msg.value;

        emit Locked(msg.sender, msg.value, block.timestamp);
    }

    function getLockedBalance() external view returns (uint256) {
        return totalLocked;
    }

    function getUserLockedBalance(address user) external view returns (uint256) {
        return lockedBalances[user];
    }

    function getUnlockTime(address user) external view returns (uint256) {
        return lockedUntil[user];
    }

    
    function autoWithdraw() external {
    require(block.timestamp >= lockedUntil[msg.sender], "Wait until unlock time");
    uint256 amount = lockedBalances[msg.sender];
    require(amount > 0, "Nothing to withdraw");

    //These rese state before transfer to prevent reentrancy
    lockedBalances[msg.sender] = 0;
    lockedUntil[msg.sender] = 0;
    totalLocked -= amount;

    emit Withdrawn(msg.sender, amount, block.timestamp);
    payable(msg.sender).transfer(amount);
    }
}
