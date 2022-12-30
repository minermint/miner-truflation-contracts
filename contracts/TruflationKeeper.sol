//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "miner-issuance-contracts-v2/contracts/IUSDMinerPair.sol";

contract TruflationKeeper is ChainlinkClient, ConfirmedOwner, IUSDMinerPair {
    using Chainlink for Chainlink.Request;

    uint256 private initialPrice;
    int256 private yoyInflation;
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

        initialPrice = 3e18;
        oracleId = oracleId_;
        jobId = jobId_;
        fee = fee_;
    }

    function requestYoyInflation() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
          bytes32(bytes(jobId)),
          address(this),
          this.fulfillYoyInflation.selector
        );
        req.add("service", "truflation/current");
        req.add("keypath", "yearOverYearInflation");
        req.add("abi", "int256");
        req.add("multiplier", "1000000000000000000");
        req.add("refundTo",
          Strings.toHexString(uint160(msg.sender), 20));
        return sendChainlinkRequestTo(oracleId, req, fee);
    }

    function fulfillYoyInflation(bytes32 _requestId, bytes memory _inflation)
        public
        recordChainlinkFulfillment(_requestId)
    {
        yoyInflation = toInt256(_inflation);
    }

    function getYoYInflation() external view returns (int256) {
        return yoyInflation;
    }

    function toInt256(bytes memory _bytes) internal pure
    returns (int256 value) {
      assembly {
        value := mload(add(_bytes, 0x20))
      }
    }

    /*
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
    */

    function getPrice() external view returns (uint256) {
        return uint256(int256(initialPrice) + (int256(initialPrice) * yoyInflation) / 1e18);
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
        link.transfer(msg.sender, link.balanceOf(address(this)));
    }
}
