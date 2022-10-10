// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "miner-issuance-contracts-v2/contracts/IUSDMinerPair.sol";

contract TruflationKeeper is ChainlinkClient, ConfirmedOwner, IUSDMinerPair {
    using Chainlink for Chainlink.Request;

    uint256 private price;
    address public oracleId;
    string public jobId;
    uint256 public fee;

    // Please refer to
    // https://github.com/truflation/quickstart/blob/main/network.md
    // for oracle address. job id, and fee for a given network
    constructor(
        address oracleId_,
        string memory jobId_,
        uint256 fee_
    ) ConfirmedOwner(msg.sender) {
        // setPublicChainlinkToken();

        // use this for Goerli (chain: 5)
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);

        oracleId = oracleId_;
        jobId = jobId_;
        fee = fee_;
    }

    function requestPrice() external returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            bytes32(bytes(jobId)),
            address(this),
            this.fulfillPrice.selector
        );
        req.add("service", "minertoken");
        req.add("keypath", "price");
        req.add("abi", "uint256");
        req.add("multiplier", "1000000000000000000");

        return sendChainlinkRequestTo(oracleId, req, fee);
    }

    function fulfillPrice(bytes32 requestId, bytes memory inflation)
        external
        recordChainlinkFulfillment(requestId)
    {
        price = uint256(bytes32((inflation)));
    }

    function getPrice() external view returns (uint256) {
        return price;
    }

    function changeOracle(address newOracle) external onlyOwner {
        oracleId = newOracle;
    }

    function changeJobId(string memory newJobId) external onlyOwner {
        jobId = newJobId;
    }

    function changeFee(uint256 fee_) external onlyOwner {
        fee = fee_;
    }

    function getChainlinkToken() external view returns (address) {
        return chainlinkTokenAddress();
    }

    function withdrawLink() external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
