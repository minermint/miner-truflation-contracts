// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

contract OracleMock {
    function onTokenTransfer(
        address sender,
        uint256 amount,
        bytes memory data
    ) public {
        assembly {
            // solhint-disable-next-line avoid-low-level-calls
            mstore(add(data, 36), sender) // ensure correct sender is passed
            // solhint-disable-next-line avoid-low-level-calls
            mstore(add(data, 68), amount) // ensure correct amount is passed
        }
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = address(this).delegatecall(data); // calls oracleRequest

        require(success, "Unable to create request");
    }

    /**
     * Mocks the setting of the Truflation price, short-circuiting the
     * off-chain pricing mechanism and settings a hardcoded 3 USD price.
     */
    function oracleRequest(
        address sender,
        uint256,
        bytes32,
        address,
        bytes4,
        uint256 nonce,
        uint256,
        bytes calldata
    ) external {
        bytes32 requestId = keccak256(abi.encodePacked(sender, nonce));
        (bool success, ) = sender.call(
            abi.encodeWithSignature(
                "fulfillPrice(bytes32,bytes)",
                requestId,
                abi.encodePacked(uint256(3e18))
            )
        );

        require(success, "Unable to complete request");
    }
}
