//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

interface ITruflationKeeper {
    function getPrice() external returns (uint256);
}
