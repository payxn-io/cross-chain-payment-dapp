// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITokenOracle {
    function getEquivalentToken(address token, uint256 usdAmount) external view returns (uint256);
}

contract CCTPBridge is Ownable {
    ITokenOracle public oracle;

    event TransferInitiated(address indexed token, address indexed from, string toChain, string toAddress, uint256 amount, uint256 usdAmount);

    constructor(address _oracle) {
        oracle = ITokenOracle(_oracle);
    }

    function initiateTransfer(address token, uint256 usdAmount, string memory toChain, string memory toAddress) external {
        uint256 tokenAmount = oracle.getEquivalentToken(token, usdAmount);
        require(IERC20(token).transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");
        emit TransferInitiated(token, msg.sender, toChain, toAddress, tokenAmount, usdAmount);
        // In a real implementation, additional logic would be needed to handle the cross-chain transfer
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Withdrawal failed");
    }

    function setOracle(address _newOracle) external onlyOwner {
        oracle = ITokenOracle(_newOracle);
    }
}