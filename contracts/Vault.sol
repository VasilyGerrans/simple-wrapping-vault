// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IWETH } from "./interfaces/IWETH.sol";

contract Vault {
    event EthDeposited(address indexed user, uint256 amount);
    event EthWithdrawn(address indexed user, uint256 amount);
    event TokenDeposited(address indexed user, address indexed token, uint256 amount);
    event TokenWithdrawn(address indexed user, address indexed token, uint256 amount);
    event EthWrapped(address indexed user, uint256 amount);
    event EthUnwrapped(address indexed user, uint256 amount);

    address public wethToken;

    mapping(address => mapping(address => uint256)) public balances;
    mapping(address => uint256) public ethBalances;

    constructor(address _wethToken) {
        wethToken = _wethToken;
    }

    function depositEth() external payable {
        ethBalances[msg.sender] += msg.value;

        emit EthDeposited(msg.sender, msg.value);
    }

    function withdrawEth(uint256 amount) external {
        require(ethBalances[msg.sender] >= amount, "Insufficient ETH balance");

        ethBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);

        emit EthWithdrawn(msg.sender, amount);
    }

    function depositToken(address token, uint256 amount) external {
        uint256 realTokenBalance = IERC20(token).balanceOf(address(this));

        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        realTokenBalance = IERC20(token).balanceOf(address(this)) - realTokenBalance;
        balances[msg.sender][token] += realTokenBalance;

        emit TokenDeposited(msg.sender, token, realTokenBalance);
    }

    function withdrawToken(address token, uint256 amount) external {
        require(balances[msg.sender][token] >= amount, "Insufficient token balance");

        balances[msg.sender][token] -= amount;

        require(IERC20(token).transfer(msg.sender, amount), "Token transfer failed");

        emit TokenWithdrawn(msg.sender, token, amount);
    }

    function wrapEth(uint256 amount) external {
        require(ethBalances[msg.sender] >= amount, "Insufficient ETH balance");

        ethBalances[msg.sender] -= amount;
        IWETH(wethToken).deposit{value: amount}();
        balances[msg.sender][wethToken] += amount;
        
        emit EthWrapped(msg.sender, amount);
    }

    function unwrapEth(uint256 amount) external {
        require(balances[msg.sender][wethToken] >= amount, "Insufficient WETH balance");

        balances[msg.sender][wethToken] -= amount;
        IWETH(wethToken).withdraw(amount);
        ethBalances[msg.sender] += amount;

        emit EthUnwrapped(msg.sender, amount);
    }

    receive() external payable {}
}
